import React from 'react';
import { X, Download, Play, Trash2, Clock, ShieldAlert } from 'lucide-react';
import { downloadReportFile } from '../services/reportGenerator';

export default function HistoryModal({
  isOpen,
  onClose,
  history = [],
  onSelectAudit,
  onClearHistory
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Clock size={18} className="text-brand-soft" />
            <h3 className="modal-title">Audit History</h3>
            <span className="modal-count-badge">{history.length} Saved</span>
          </div>

          <div className="modal-header-actions">
            {history.length > 0 && (
              <button
                type="button"
                className="modal-btn-clear"
                onClick={onClearHistory}
                title="Clear all stored audits"
              >
                <Trash2 size={13} />
                <span>Clear History</span>
              </button>
            )}
            <button
              type="button"
              className="modal-btn-close"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {history.length === 0 ? (
            <div className="modal-empty-state">
              <Clock size={32} className="text-muted" />
              <p>No audit history recorded yet.</p>
              <span className="modal-empty-caption">
                Audited videos will automatically be saved here so you can revisit findings and download reports anytime.
              </span>
            </div>
          ) : (
            <div className="history-items-list">
              {history.map((audit) => {
                const isPass = audit.status === 'PASS';
                const violationCount = (audit.compliance_results || []).length;
                const dateStr = audit.timestamp
                  ? new Date(audit.timestamp).toLocaleString()
                  : 'Recent';

                return (
                  <div key={audit.session_id} className="history-card-item">
                    <div className="history-item-top">
                      <div className="history-meta-left">
                        <span className={`history-verdict-pill ${isPass ? 'pill-pass' : 'pill-fail'}`}>
                          {audit.status}
                        </span>
                        <span className="history-video-id font-mono">
                          {audit.video_id || 'vid_session'}
                        </span>
                        <span className="history-date text-muted text-xs">
                          {dateStr}
                        </span>
                      </div>

                      <div className="history-actions-right">
                        <button
                          type="button"
                          className="history-btn-download"
                          onClick={() => downloadReportFile(audit)}
                          title="Download Markdown Report"
                        >
                          <Download size={13} />
                          <span>Download Report</span>
                        </button>

                        <button
                          type="button"
                          className="history-btn-load"
                          onClick={() => {
                            onSelectAudit(audit);
                            onClose();
                          }}
                          title="Load into workspace"
                        >
                          <Play size={13} />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>

                    <div className="history-item-details">
                      <p className="history-url-text font-mono" title={audit.video_url}>
                        {audit.video_url}
                      </p>
                      <div className="history-stats-row">
                        <span>Score: <strong>{audit.compliance_score ?? (isPass ? 95 : 60)}/100</strong></span>
                        <span>•</span>
                        <span>{violationCount} Violations Recorded</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
