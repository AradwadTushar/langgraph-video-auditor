import React, { useState } from 'react';
import { Mic, Eye, BookOpen, Code, Copy, Check } from 'lucide-react';

export default function MultimodalInspector({ auditData }) {
  const [activeTab, setActiveTab] = useState('transcript'); // transcript | ocr | citations | json
  const [copiedJson, setCopiedJson] = useState(false);

  if (!auditData) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="inspector-panel-card">
      <div className="inspector-header">
        <div className="inspector-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            <Mic size={14} />
            <span>Audio Transcript</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
          >
            <Eye size={14} />
            <span>Visual OCR Signals</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
            onClick={() => setActiveTab('citations')}
          >
            <BookOpen size={14} />
            <span>Regulatory RAG Citations</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code size={14} />
            <span>Raw API Payload</span>
          </button>
        </div>

        {activeTab === 'json' && (
          <button
            type="button"
            onClick={handleCopyJson}
            className="btn-copy-raw"
            title="Copy JSON Payload"
          >
            {copiedJson ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
          </button>
        )}
      </div>

      <div className="inspector-content-viewport">
        {/* TAB 1: TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div className="tab-pane-transcript">
            <div className="meta-info-badge">
              <span>Extracted via Azure Video Indexer Speech-to-Text</span>
            </div>
            <p className="transcript-body-text">
              {auditData.transcript || 'No spoken audio transcript available.'}
            </p>
          </div>
        )}

        {/* TAB 2: OCR */}
        {activeTab === 'ocr' && (
          <div className="tab-pane-ocr">
            <div className="meta-info-badge">
              <span>On-Screen Visual Text Detected by Azure Computer Vision OCR</span>
            </div>
            {auditData.ocr_text && auditData.ocr_text.length > 0 ? (
              <div className="ocr-tags-grid">
                {auditData.ocr_text.map((ocrItem, i) => (
                  <div key={i} className="ocr-tag-card">
                    <span className="ocr-index">Frame #{i + 1}</span>
                    <span className="ocr-text">{ocrItem}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No on-screen OCR text extracted.</p>
            )}
          </div>
        )}

        {/* TAB 3: CITATIONS */}
        {activeTab === 'citations' && (
          <div className="tab-pane-citations">
            <div className="meta-info-badge">
              <span>Indexed Regulations (Azure AI Search: text-embedding-3-small)</span>
            </div>
            {auditData.rag_citations && auditData.rag_citations.length > 0 ? (
              <div className="citations-list">
                {auditData.rag_citations.map((cite, i) => (
                  <div key={i} className="citation-card">
                    <div className="citation-header-row">
                      <span className="citation-source">{cite.source}</span>
                      <span className="citation-chunk">{cite.chunk_id}</span>
                    </div>
                    <p className="citation-text">"{cite.text}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">
                Rules matched: FTC 16 CFR § 255.5 (Guides Concerning Use of Endorsements and Testimonials in Advertising) & YouTube Advertising Format Policies.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: RAW JSON */}
        {activeTab === 'json' && (
          <div className="tab-pane-json">
            <pre className="json-code-block">
              {JSON.stringify(auditData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
