import json
import os
import logging
import re
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_community.vectorstores import AzureSearch
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

# Import the State schema .
from backend.src.graph.state import VideoAuditState, ComplianceIssue

# Import the Service
from backend.src.services.video_indexer import VideoIndexerService

# Configure Logger
logger = logging.getLogger("brand-guardian")
logging.basicConfig(level=logging.INFO)

# --- NODE 1: THE INDEXER ---
def index_video_node(state: VideoAuditState) -> Dict[str, Any]:
    """
    Downloads YouTube video, uploads to Azure VI, and extracts insights.
    """
    video_url = state.get("video_url")
    video_id_input = state.get("video_id", "vid_demo")
    
    logger.info(f"--- [Node: Indexer] Processing: {video_url} ---")
    
    local_filename = "temp_audit_video.mp4"
    
    try:
        vi_service = VideoIndexerService()
        
        # 1. DOWNLOAD
        if "youtube.com" in video_url or "youtu.be" in video_url:
            local_path = vi_service.download_youtube_video(video_url, output_path=local_filename)
        else:
            raise Exception("Please provide a valid YouTube URL for this test.")

        # 2. UPLOAD
        azure_video_id = vi_service.upload_video(local_path, video_name=video_id_input)
        logger.info(f"Upload Success. Azure ID: {azure_video_id}")
        
        # 3. CLEANUP
        if os.path.exists(local_path):
            os.remove(local_path)

        # 4. WAIT
        raw_insights = vi_service.wait_for_processing(azure_video_id)
        
        # 5. EXTRACT
        clean_data = vi_service.extract_data(raw_insights)
        
        logger.info("--- [Node: Indexer] Extraction Complete ---")
        return clean_data

    except Exception as e:
        logger.error(f"Video Indexer Failed: {e}")
        return {
            "errors": [str(e)],
            "final_status": "FAIL",
            "transcript": "", 
            "ocr_text": []
        }

# --- Pydantic Schema for Structured Auditor Output ---

class ComplianceItem(BaseModel):
    category: str = Field(description="Compliance violation category, e.g. 'FTC_DISCLOSURE', 'Misleading Claim', 'Ad Transparency'")
    severity: Literal["CRITICAL", "WARNING"] = Field(description="Severity rating: CRITICAL or WARNING")
    description: str = Field(description="Detailed explanation of the specific violation found in transcript or OCR text.")
    timestamp: Optional[str] = Field(default=None, description="Timestamp or time window where the issue occurs, e.g., '00:15'")

class ComplianceAuditReport(BaseModel):
    compliance_results: List[ComplianceItem] = Field(default_factory=list, description="List of detected compliance issues.")
    status: Literal["PASS", "FAIL"] = Field(description="Overall compliance result: 'PASS' if zero violations, 'FAIL' if violations exist.")
    final_report: str = Field(description="Executive markdown summary of the audit findings, explaining reasoning and evidence.")

def _clean_and_parse_llm_json(raw_content: str) -> Dict[str, Any]:
    """
    Safely extracts and parses JSON from LLM response text,
    handling markdown fences, whitespace, and formatting variations.
    """
    cleaned = raw_content.strip()
    if "```" in cleaned:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(1).strip()
        else:
            # Fallback regex if curly braces span differently
            generic_match = re.search(r"```(?:json)?(.*?)```", cleaned, re.DOTALL)
            if generic_match:
                cleaned = generic_match.group(1).strip()
    
    # If wrapped in non-markdown but has extra surrounding text, extract outermost JSON object
    if not cleaned.startswith("{") and "{" in cleaned:
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx:end_idx + 1]

    parsed = json.loads(cleaned)
    # Validate structure using Pydantic
    validated = ComplianceAuditReport.model_validate(parsed)
    return validated.model_dump()

# --- NODE 2: THE COMPLIANCE AUDITOR ---
def audit_content_node(state: VideoAuditState) -> Dict[str, Any]:
    """
    Performs Retrieval-Augmented Generation (RAG) to audit the content
    with strict structured output, few-shot calibrated examples, and robust parsing.
    """
    logger.info("--- [Node: Auditor] querying Knowledge Base & LLM ---")
    
    transcript = state.get("transcript", "")
    
    if not transcript:
        logger.warning("No transcript available. Skipping Audit.")
        return {
            "final_status": "FAIL",
            "final_report": "Audit skipped because video processing failed (No Transcript)."
        }

    response = None

    try:
        # Initialize Clients
        llm = AzureChatOpenAI(
            azure_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
            temperature=1,
        )

        embeddings = AzureOpenAIEmbeddings(
            azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        )

        vector_store = AzureSearch(
            azure_search_endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
            azure_search_key=os.getenv("AZURE_SEARCH_API_KEY"),
            index_name=os.getenv("AZURE_SEARCH_INDEX_NAME"),
            embedding_function=embeddings.embed_query
        )
        
        # RAG Retrieval - Granular query formulation to avoid vector dilution
        ocr_text = state.get("ocr_text", [])
        ocr_joined = " ".join(ocr_text) if ocr_text else ""
        
        # Build targeted query from salient points
        if len(transcript) > 600:
            query_seed = f"{transcript[:400]} {transcript[-200:]} {ocr_joined[:200]}"
        else:
            query_seed = f"{transcript} {ocr_joined}"
            
        docs = vector_store.similarity_search(query_seed.strip(), k=3)
        retrieved_rules = "\n\n".join([doc.page_content for doc in docs]) if docs else "No specific regulatory rules retrieved."
        
        # --- PROMPT WITH STRICT SCHEMA & FEW-SHOT EXAMPLES ---
        system_prompt = f"""
You are an expert Enterprise Brand Compliance Auditor. Your task is to evaluate promotional video content against official regulatory compliance rules and brand advertising standards.

OFFICIAL REGULATORY RULES & GUIDELINES:
{retrieved_rules}

EVALUATION CRITERIA:
1. FTC Endorsement Guidelines (16 CFR Part 255): Material connections (paid sponsorships, free gifts) must be clearly, conspicuously disclosed both audibly and visually before or during the endorsement.
2. Deceptive / Unsubstantiated Claims: Absolute claims (e.g. "guaranteed 100% cure", "instant miracle results") without scientific evidence or disclaimer.
3. Ad Transparency & Disclosures: On-screen disclaimers must be legible, contrasting, and held long enough to be read.

FEW-SHOT REFERENCE EXAMPLES:

Example 1 (CRITICAL Violation - Missing Disclosure):
- Transcript: "Hey guys! Today I'm trying this brand new energy drink sent to me by XYZ Labs, and it completely eliminated my fatigue!"
- OCR: ["XYZ Energy", "Buy Now at link in bio"]
- Audit Output:
{{
    "compliance_results": [
        {{
            "category": "FTC_DISCLOSURE",
            "severity": "CRITICAL",
            "description": "Creator promotes gifted product from XYZ Labs without clear audible or visual sponsorship disclosure (#ad / #sponsored).",
            "timestamp": "00:02"
        }}
    ],
    "status": "FAIL",
    "final_report": "### Audit Summary: Non-Compliant (CRITICAL)\\n- **Violation**: Missing mandatory FTC endorsement disclosure for gifted promotional products.\\n- **Recommendation**: Add clear '#AD' overlay on screen and verbal disclosure within the first 5 seconds."
}}

Example 2 (WARNING - Ambiguous Superlative Claim):
- Transcript: "This serum might give you the best skin of your entire life if you use it daily. #sponsored"
- OCR: ["Sponsored by GlowCo", "*Individual results may vary"]
- Audit Output:
{{
    "compliance_results": [
        {{
            "category": "Claim Substantiation",
            "severity": "WARNING",
            "description": "Exaggerated claim 'best skin of your entire life' used; legible disclaimer is present but claim borders on unsubstantiated puffery.",
            "timestamp": "00:04"
        }}
    ],
    "status": "FAIL",
    "final_report": "### Audit Summary: Cautionary Flags (WARNING)\\n- **Violation**: Borderline unsubstantiated superlative claim.\\n- **Recommendation**: Tone down superlative claims or make disclaimer more prominent."
}}

Example 3 (PASS - Fully Compliant):
- Transcript: "Thanks to ABC Fitness for sponsoring today's workout. As always, consult a doctor before starting any regimen."
- OCR: ["#PaidAd - ABC Fitness", "Consult physician before starting new exercises"]
- Audit Output:
{{
    "compliance_results": [],
    "status": "PASS",
    "final_report": "### Audit Summary: Approved (PASS)\\n- Content contains clear audible and on-screen sponsorship disclosures.\\n- Required safety disclaimers are present and compliant with advertising standards."
}}

INSTRUCTIONS:
- Analyze the provided transcript, on-screen OCR text, and metadata.
- Return ONLY valid JSON adhering strictly to the schema shown in the examples.
- If any violations are found, set 'status' to 'FAIL'. If no violations are found, set 'status' to 'PASS' and 'compliance_results' to [].
"""

        user_message = f"""
VIDEO METADATA: {state.get('video_metadata', {})}
TRANSCRIPT: {transcript}
ON-SCREEN TEXT (OCR): {ocr_text}
"""

        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ])
        
        raw_text = response.content if hasattr(response, "content") else str(response)
        audit_data = _clean_and_parse_llm_json(raw_text)
        
        return {
            "compliance_results": audit_data.get("compliance_results", []),
            "final_status": audit_data.get("status", "FAIL"),
            "final_report": audit_data.get("final_report", "No report generated.")
        }

    except Exception as e:
        logger.error(f"System Error in Auditor Node: {str(e)}")
        raw_content = getattr(response, "content", "None") if response is not None else "None"
        logger.error(f"Raw LLM Response: {raw_content}")
        return {
            "errors": [str(e)],
            "final_status": "FAIL",
            "final_report": f"Audit execution failed due to an error: {str(e)}"
        }