import unittest
from backend.src.graph.nodes import _clean_and_parse_llm_json, ComplianceAuditReport

class TestAuditorNodeParsing(unittest.TestCase):
    def test_clean_json_parsing(self):
        sample_json = '''{
            "compliance_results": [
                {
                    "category": "FTC_DISCLOSURE",
                    "severity": "CRITICAL",
                    "description": "Missing sponsored tag",
                    "timestamp": "00:05"
                }
            ],
            "status": "FAIL",
            "final_report": "Audit failed due to missing disclosure."
        }'''
        parsed = _clean_and_parse_llm_json(sample_json)
        self.assertEqual(parsed["status"], "FAIL")
        self.assertEqual(len(parsed["compliance_results"]), 1)
        self.assertEqual(parsed["compliance_results"][0]["severity"], "CRITICAL")

    def test_markdown_wrapped_json_parsing(self):
        sample_markdown = '''Here is the audit result:
```json
{
    "compliance_results": [],
    "status": "PASS",
    "final_report": "No violations detected."
}
```
Thank you.'''
        parsed = _clean_and_parse_llm_json(sample_markdown)
        self.assertEqual(parsed["status"], "PASS")
        self.assertEqual(len(parsed["compliance_results"]), 0)
        self.assertIn("No violations", parsed["final_report"])

    def test_generic_codeblock_parsing(self):
        sample_block = '''```
{
    "compliance_results": [
        {
            "category": "Claim Substantiation",
            "severity": "WARNING",
            "description": "Unverified superlative claim"
        }
    ],
    "status": "FAIL",
    "final_report": "Warning issued."
}
```'''
        parsed = _clean_and_parse_llm_json(sample_block)
        self.assertEqual(parsed["status"], "FAIL")
        self.assertEqual(parsed["compliance_results"][0]["severity"], "WARNING")

    def test_invalid_json_raises_value_error(self):
        invalid_text = "This is not json at all."
        with self.assertRaises(Exception):
            _clean_and_parse_llm_json(invalid_text)

if __name__ == "__main__":
    unittest.main()
