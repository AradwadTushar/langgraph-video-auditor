import React from 'react';
import { Search, Loader2, PlayCircle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export default function AuditInput({
  videoUrl,
  setVideoUrl,
  onAudit,
  isLoading,
  progressStep,
  onLoadPreset
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onAudit(videoUrl.trim());
    }
  };

  const pipelineSteps = [
    { id: 1, label: 'Video Ingestion', detail: 'yt-dlp stream & format check' },
    { id: 2, label: 'Multimodal Extraction', detail: 'Azure Video Indexer (Audio + OCR)' },
    { id: 3, label: 'Regulatory RAG', detail: 'Azure AI Search (FTC & YouTube Specs)' },
    { id: 4, label: 'Compliance Audit', detail: 'Azure OpenAI (GPT-4o Evaluation)' },
  ];

  return (
    <div className="audit-input-card">
      <form onSubmit={handleSubmit} className="audit-input-form">
        <div className="input-group">
          <Search className="input-search-icon" size={18} />
          <input
            type="url"
            className="video-url-input"
            placeholder="Paste YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary btn-audit"
          disabled={isLoading || !videoUrl.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="spinner" size={16} />
              <span>Auditing Video...</span>
            </>
          ) : (
            <>
              <span>Run Compliance Audit</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Multimodal Pipeline Progress Tracker */}
      {isLoading && (
        <div className="pipeline-progress-container">
          <div className="pipeline-header">
            <span className="pipeline-title">
              <Cpu size={14} /> Autonomous LangGraph Execution Pipeline
            </span>
            <span className="pipeline-stage-badge">Stage {progressStep} of 4</span>
          </div>

          <div className="pipeline-steps-grid">
            {pipelineSteps.map((step) => {
              const isDone = progressStep > step.id;
              const isCurrent = progressStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`pipeline-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="step-indicator-dot">
                    {isDone ? '✓' : step.id}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{step.label}</span>
                    <span className="step-desc">{step.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
