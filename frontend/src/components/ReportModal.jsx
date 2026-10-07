import React from 'react';
import { X, Download, CheckCircle, AlertOctagon, FileText } from 'lucide-react';
import { downloadReportFile } from '../services/reportGenerator';

export default function ReportModal({ isOpen, onClose, audit }) {
  if (!isOpen || !audit) return null;

  const isPass = audit.status === 'PASS';
  const violations = audit.compliance_results || [];
  const score = audit.compliance_score ?? (isPass ? 95 : 60);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel modal-panel-report" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText size={18} className="text-brand-soft" />
            <h3 className="modal-title">Audit Completed</h3>
          </div>
          <button type="button" className="modal-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className={`report-modal-banner ${isPass ? 'banner-pass' : 'banner-fail'}`}>
            <div className="banner-icon-wrap">
              {isPass ? <CheckCircle size={28} /> : <AlertOctagon size={28} />}
            </div>
            <div>
              <span className="banner-label">Final Compliance Verdict</span>
              <h2 className="banner-status-text">
                {isPass ? 'PASS — REGULATORY COMPLIANT' : 'FAIL — NON-COMPLIANT'}
              </h2>
              <p className="banner-subtext">
                {isPass
                  ? 'Video satisfies FTC guidelines and YouTube platform advertising specifications.'
                  : `${violations.length} compliance issue(s) detected requiring review before distribution.`}
              </p>
            </div>
          </div>

          <div className="report-modal-stats-grid">
            <div className="modal-stat-box">
              <span className="stat-label">Compliance Score</span>
              <span className={`stat-value font-mono ${score >= 80 ? 'text-pass' : 'text-fail'}`}>
                {score}/100
              </span>
            </div>

            <div className="modal-stat-box">
              <span className="stat-label">Total Findings</span>
              <span className="stat-value font-mono">{violations.length}</span>
            </div>

            <div className="modal-stat-box">
              <span className="stat-label">Session ID</span>
              <span className="stat-value-sm font-mono text-secondary">
                {audit.session_id ? audit.session_id.substring(0, 13) + '...' : 'N/A'}
              </span>
            </div>
          </div>

          <div className="report-modal-summary-box">
            <h4 className="summary-title">Executive Summary</h4>
            <p className="summary-text">{audit.final_report}</p>
          </div>

          <div className="report-modal-actions">
            <button
              type="button"
              className="btn-download-primary"
              onClick={() => downloadReportFile(audit)}
            >
              <Download size={16} />
              <span>Download Full Audit Report (.md)</span>
            </button>

            <button
              type="button"
              className="btn-modal-dismiss"
              onClick={onClose}
            >
              <span>View in Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
