import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
  Terminal,
  Play,
  CheckCircle,
  AlertOctagon,
  Clock,
  Layers,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { extractYouTubeId, parseTimestampToSeconds } from '../services/api';
import { downloadReportFile } from '../services/reportGenerator';

export default function AuditWorkspace({
  videoUrl,
  setVideoUrl,
  onRunAudit,
  auditData,
  isLoading,
  currentStep,
  logs = [],
  onOpenReportModal,
  onBackToHome
}) {
  const [activeBottomTab, setActiveBottomTab] = useState('ocr'); // 'ocr' | 'transcript' | 'raw'
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [seekSeconds, setSeekSeconds] = useState(null);
  const iframeRef = useRef(null);
  const logTerminalRef = useRef(null);

  // Auto-scroll logs to bottom as they arrive
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle postMessage seek to YouTube iframe
  useEffect(() => {
    if (seekSeconds !== null && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seekSeconds, true]
          }),
          '*'
        );
      } catch (err) {
        console.warn('IFrame seek command failed:', err);
      }
    }
  }, [seekSeconds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (videoUrl.trim() && !isLoading) {
      onRunAudit(videoUrl.trim());
    }
  };

  const handleSeek = (seconds) => {
    setSeekSeconds(seconds);
  };

  const handleCopyRaw = () => {
    if (!auditData) return;
    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const currentYoutubeId = extractYouTubeId(videoUrl);

  const pipelineSteps = [
    { number: 1, name: 'Video Ingestion', detail: 'yt-dlp stream download' },
    { number: 2, name: 'Multimodal Extraction', detail: 'Azure Video Indexer (Audio & OCR)' },
    { number: 3, name: 'Regulatory Retrieval', detail: 'Azure AI Search RAG (FTC & Ad Specs)' },
    { number: 4, name: 'Compliance Reasoning', detail: 'Azure OpenAI (GPT-4o audit)' },
  ];

  const isComplete = !isLoading && auditData !== null;
  const isPass = auditData?.status === 'PASS';
  const violations = auditData?.compliance_results || [];

  return (
    <div className="workspace-container">
      {/* Top Navigation & Breadcrumb Bar with explicit Back Button */}
      <div className="workspace-nav-bar">
        <button
          type="button"
          className="btn-back-home"
          onClick={onBackToHome}
          title="Return to Home Overview"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="workspace-breadcrumbs">
          <button type="button" className="crumb-link" onClick={onBackToHome}>
            Home
          </button>
          <span className="crumb-divider">/</span>
          <span className="crumb-current">Audit Workspace</span>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="workspace-controls-card">
        <form onSubmit={handleSubmit} className="workspace-form">
          <div className="workspace-input-wrapper">
            <Search size={16} className="workspace-search-icon" />
            <input
              type="url"
              className="workspace-url-input"
              placeholder="Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-workspace-audit"
            disabled={isLoading || !videoUrl.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Run Audit</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Persistent Report Download Button on Page */}
        {isComplete && (
          <div className="workspace-top-actions">
            <div className={`workspace-status-badge ${isPass ? 'badge-pass' : 'badge-fail'}`}>
              {isPass ? <CheckCircle size={14} /> : <AlertOctagon size={14} />}
              <span>{isPass ? 'COMPLIANT' : 'NON-COMPLIANT'}</span>
            </div>

            <button
              type="button"
              className="btn-persistent-download"
              onClick={() => downloadReportFile(auditData)}
              title="Download Compliance Report"
            >
              <Download size={14} />
              <span>Download Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Process Pipeline Step Indicator (Solid White Cards with Palette Borders) */}
      <div className="stepper-panel">
        <div className="stepper-header">
          <span className="stepper-title">Autonomous Execution Pipeline</span>
          <span className="stepper-current-label">
            {isLoading
              ? `Step ${currentStep} of 4: ${pipelineSteps[currentStep - 1]?.name || 'Processing'}`
              : isComplete
              ? 'Pipeline Execution Complete'
              : 'Ready for Input'}
          </span>
        </div>

        <div className="stepper-steps-grid">
          {pipelineSteps.map((step) => {
            const isDone = isComplete || (isLoading && currentStep > step.number);
            const isCurrent = isLoading && currentStep === step.number;

            return (
              <div
                key={step.number}
                className={`stepper-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="step-circle">
                  {isDone ? '✓' : step.number}
                </div>
                <div className="step-meta">
                  <span className="step-label">{step.name}</span>
                  <span className="step-subtext">{step.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Left = Logs & Findings, Right = Video Preview */}
      <div className="workspace-main-split">
        {/* LEFT COLUMN: LIVE LOGS & FINDINGS */}
        <div className="split-col-left">
          {/* Live Log Console */}
          <div className="console-card">
            <div className="console-header">
              <div className="console-title-group">
                <Terminal size={14} className="text-brand-soft" />
                <span className="console-title">Live Execution Logs</span>
              </div>
              <span className="console-badge">
                {isLoading ? 'Active Stream' : isComplete ? 'Complete' : 'Idle'}
              </span>
            </div>

            <div className="console-viewport font-mono" ref={logTerminalRef}>
              {logs.length === 0 ? (
                <div className="console-empty">
                  <span>Awaiting video audit initiation...</span>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-line">
                    <span className="log-time">[{log.time}]</span>{' '}
                    <span className={`log-text ${log.type === 'error' ? 'log-err' : log.type === 'success' ? 'log-success' : 'log-info'}`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Compliance Findings List (Appears when complete) */}
          {isComplete && (
            <div className="findings-card">
              <div className="findings-header">
                <div className="findings-title-group">
                  <FileText size={15} className="text-brand-soft" />
                  <span className="findings-title">Audit Findings & Policy Citations</span>
                </div>
                <span className="findings-count-badge">
                  {violations.length} Issues Identified
                </span>
              </div>

              <div className="findings-list">
                {violations.length === 0 ? (
                  <div className="findings-empty">
                    <CheckCircle size={20} className="text-pass" />
                    <span>No regulatory violations detected. Content is compliant.</span>
                  </div>
                ) : (
                  violations.map((item, idx) => {
                    const isCritical = item.severity === 'CRITICAL';
                    const isWarning = item.severity === 'WARNING';
                    const seconds = item.seconds ?? parseTimestampToSeconds(item.timestamp);

                    return (
                      <div
                        key={idx}
                        className={`finding-item ${isCritical ? 'border-critical' : isWarning ? 'border-warning' : 'border-pass'}`}
                      >
                        <div className="finding-top-row">
                          <div className="finding-badges">
                            <span className={`severity-tag ${isCritical ? 'tag-critical' : isWarning ? 'tag-warning' : 'tag-pass'}`}>
                              {item.severity}
                            </span>
                            <span className="category-tag">{item.category}</span>
                          </div>

                          {item.timestamp && (
                            <button
                              type="button"
                              className="timestamp-btn"
                              onClick={() => handleSeek(seconds)}
                              title={`Seek video player to ${item.timestamp}`}
                            >
                              <Play size={11} fill="currentColor" />
                              <span>{item.timestamp}</span>
                            </button>
                          )}
                        </div>

                        <p className="finding-description">{item.description}</p>

                        {item.rule_reference && (
                          <div className="finding-rule-box">
                            <span className="rule-label">Citation:</span>
                            <span className="rule-content">{item.rule_reference}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: VIDEO PREVIEW */}
        <div className="split-col-right">
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-title-group">
                <Play size={14} className="text-brand-soft" />
                <span className="preview-title">Video Preview</span>
              </div>
              {videoUrl && (
                <span className="preview-url-caption font-mono text-xs text-muted" title={videoUrl}>
                  {videoUrl.substring(0, 36)}...
                </span>
              )}
            </div>

            <div className="preview-viewport-wrapper">
              {currentYoutubeId ? (
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${currentYoutubeId}?enablejsapi=1&origin=${window.location.origin}&rel=0`}
                  title="Video Preview"
                  className="preview-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="preview-placeholder">
                  <Play size={32} className="text-muted" />
                  <p>Enter a YouTube video URL to load player stream</p>
                </div>
              )}
            </div>

            {/* Quick Seek Markers */}
            {violations.length > 0 && (
              <div className="preview-markers-footer">
                <div className="markers-header">
                  <Clock size={12} className="text-muted" />
                  <span className="text-xs text-muted">Violation Jump Markers:</span>
                </div>
                <div className="markers-list">
                  {violations.map((v, i) => {
                    const sec = v.seconds ?? parseTimestampToSeconds(v.timestamp);
                    const isCrit = v.severity === 'CRITICAL';
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`marker-btn ${isCrit ? 'marker-critical' : 'marker-warning'}`}
                        onClick={() => handleSeek(sec)}
                        title={`${v.category}: ${v.description}`}
                      >
                        {v.timestamp || '00:00'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: MULTIMODAL DATA (OCR, TRANSCRIPT, RAW LOGS) */}
      <div className="multimodal-panel-card">
        <div className="multimodal-header">
          <div className="multimodal-tabs-nav">
            <button
              type="button"
              className={`multimodal-tab-btn ${activeBottomTab === 'ocr' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('ocr')}
            >
              <span>On-Screen Visual OCR</span>
              {auditData?.ocr_text && (
                <span className="tab-count-pill">{auditData.ocr_text.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`multimodal-tab-btn ${activeBottomTab === 'transcript' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('transcript')}
            >
              <span>Audio Speech Transcript</span>
            </button>

            <button
              type="button"
              className={`multimodal-tab-btn ${activeBottomTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveBottomTab('raw')}
            >
              <span>Raw System Data & Logs</span>
            </button>
          </div>

          {activeBottomTab === 'raw' && auditData && (
            <button
              type="button"
              className="btn-copy-json"
              onClick={handleCopyRaw}
              title="Copy JSON Payload"
            >
              {copiedRaw ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedRaw ? 'Copied' : 'Copy JSON'}</span>
            </button>
          )}
        </div>

        <div className="multimodal-viewport">
          {/* TAB 1: OCR */}
          {activeBottomTab === 'ocr' && (
            <div className="tab-content-ocr">
              {!auditData?.ocr_text || auditData.ocr_text.length === 0 ? (
                <div className="multimodal-empty">
                  <span>
                    {isComplete
                      ? 'No on-screen text or disclaimer titles were detected by OCR in this video.'
                      : 'No on-screen OCR text extracted yet. Initiate audit to extract frames.'}
                  </span>
                </div>
              ) : (
                <div className="ocr-grid">
                  {auditData.ocr_text.map((ocrItem, i) => (
                    <div key={i} className="ocr-card">
                      <span className="ocr-badge font-mono">Text #{i + 1}</span>
                      <p className="ocr-string font-mono">{ocrItem}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSCRIPT */}
          {activeBottomTab === 'transcript' && (
            <div className="tab-content-transcript">
              {!auditData?.transcript ? (
                <div className="multimodal-empty">
                  <span>
                    {isComplete
                      ? 'No spoken dialogue or speech was transcribed from the audio track of this video.'
                      : 'No audio transcript recorded yet. Initiate audit to transcribe speech.'}
                  </span>
                </div>
              ) : (
                <div className="transcript-box">
                  <p className="transcript-text">{auditData.transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW DATA */}
          {activeBottomTab === 'raw' && (
            <div className="tab-content-raw">
              {!auditData ? (
                <div className="multimodal-empty">
                  <span>No audit data available yet.</span>
                </div>
              ) : (
                <pre className="raw-json-block font-mono">
                  {JSON.stringify(auditData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
