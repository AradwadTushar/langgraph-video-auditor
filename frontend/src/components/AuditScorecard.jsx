import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Award,
  ShieldAlert
} from 'lucide-react';

export default function AuditScorecard({ auditData }) {
  const [copied, setCopied] = useState(false);

  if (!auditData) return null;

  const isPass = auditData.status === 'PASS';
  const criticalCount = (auditData.compliance_results || []).filter(
    (r) => r.severity === 'CRITICAL'
  ).length;
  const warningCount = (auditData.compliance_results || []).filter(
    (r) => r.severity === 'WARNING'
  ).length;

  const score = auditData.compliance_score ?? (isPass ? 95 : Math.max(30, 90 - (criticalCount * 20 + warningCount * 10)));

  const handleCopyReport = () => {
    const text = `BRAND GUARDIAN AI - VIDEO AUDIT REPORT\nStatus: ${auditData.status}\nCompliance Score: ${score}/100\nSession ID: ${auditData.session_id}\n\nSummary:\n${auditData.final_report}\n\nViolations:\n${(auditData.compliance_results || [])
      .map((r, i) => `${i + 1}. [${r.severity}] ${r.category} at ${r.timestamp || 'N/A'}: ${r.description}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="scorecard-container">
      {/* Top Banner Row */}
      <div className={`verdict-banner ${isPass ? 'verdict-pass' : 'verdict-fail'}`}>
        <div className="verdict-left">
          <div className="verdict-icon-wrap">
            {isPass ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
          </div>
          <div>
            <div className="verdict-title-row">
              <span className="verdict-label">Compliance Verdict:</span>
              <strong className="verdict-badge">
                {isPass ? 'PASS — REGULATORY COMPLIANT' : 'FAIL — NON-COMPLIANT'}
              </strong>
            </div>
            <p className="verdict-desc">
              {isPass
                ? 'Video satisfies FTC disclosure requirements and YouTube Advertising Specifications.'
                : 'Action required: Content contains compliance violations requiring immediate revision prior to publication.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyReport}
          className="btn-outline-copy"
          title="Copy Executive Summary"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied Report</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Report</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Compliance Health</span>
          <div className="metric-score-row">
            <span className={`metric-score-number ${score >= 80 ? 'text-pass' : score >= 60 ? 'text-warning' : 'text-critical'}`}>
              {score}
            </span>
            <span className="metric-score-max">/100</span>
          </div>
          <div className="metric-progress-track">
            <div
              className={`metric-progress-fill ${score >= 80 ? 'fill-pass' : score >= 60 ? 'fill-warning' : 'fill-critical'}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Critical Violations</span>
          <div className="metric-stat-row">
            <span className="stat-number stat-critical">{criticalCount}</span>
            <ShieldAlert size={18} className="stat-icon-critical" />
          </div>
          <span className="stat-caption">Immediate legal/brand risk</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Warnings</span>
          <div className="metric-stat-row">
            <span className="stat-number stat-warning">{warningCount}</span>
            <AlertTriangle size={18} className="stat-icon-warning" />
          </div>
          <span className="stat-caption">Platform guideline notices</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Rulebooks Audited</span>
          <div className="metric-stat-row">
            <span className="stat-number stat-info">2 Active</span>
            <Award size={18} className="stat-icon-info" />
          </div>
          <span className="stat-caption">FTC § 255.5 + YouTube Ad Specs</span>
        </div>
      </div>

      {/* Executive Report Box */}
      <div className="executive-report-box">
        <div className="report-header">
          <FileText size={15} />
          <h4>Executive Audit Summary</h4>
        </div>
        <p className="report-body-text">{auditData.final_report}</p>
      </div>
    </div>
  );
}
