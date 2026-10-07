import React, { useState } from 'react';
import {
  ArrowRight,
  Layers,
  FileSearch,
  ShieldCheck,
  Download,
  Play,
  Cpu,
  Eye,
  Mic,
  BookOpen
} from 'lucide-react';
import { downloadReportFile } from '../services/reportGenerator';

export default function HomeScreen({
  onStartAudit,
  recentAudits = [],
  onSelectAudit
}) {
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      onStartAudit(quickUrl.trim());
    } else {
      onStartAudit();
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          <span>Enterprise Multimodal Compliance Infrastructure</span>
        </div>

        <h1 className="hero-title">
          Autonomous Compliance Auditing <br />
          <span className="hero-title-accent">for Video Advertising</span>
        </h1>

        <p className="hero-subtitle">
          Verify video sponsorships, influencer promotions, and brand campaigns against
          regulatory guidelines and platform ad specs. Synchronized speech transcription,
          on-screen visual OCR, and semantic vector retrieval powered by LangGraph.
        </p>

        {/* Audit Search Bar */}
        <form onSubmit={handleQuickSubmit} className="hero-audit-bar">
          <input
            type="url"
            className="hero-input-field"
            placeholder="Paste YouTube Video URL to begin audit (e.g. https://www.youtube.com/watch?v=...)"
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
          />
          <button type="submit" className="hero-audit-submit">
            <span>Audit Video</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Architecture Interactive Flow Banner (All 4 cards solid white, no grey) */}
        <div className="architecture-banner">
          <div className="arch-step-node">
            <div className="arch-icon-wrap">
              <Mic size={16} />
            </div>
            <div className="arch-node-meta">
              <span className="arch-node-title">1. Audio Signals</span>
              <span className="arch-node-sub">Speech-to-Text Transcription</span>
            </div>
          </div>

          <div className="arch-connector-line"></div>

          <div className="arch-step-node">
            <div className="arch-icon-wrap">
              <Eye size={16} />
            </div>
            <div className="arch-node-meta">
              <span className="arch-node-title">2. Visual Signals</span>
              <span className="arch-node-sub">Computer Vision OCR Frames</span>
            </div>
          </div>

          <div className="arch-connector-line"></div>

          <div className="arch-step-node">
            <div className="arch-icon-wrap">
              <BookOpen size={16} />
            </div>
            <div className="arch-node-meta">
              <span className="arch-node-title">3. Regulatory RAG</span>
              <span className="arch-node-sub">FTC Guides & YouTube Specs</span>
            </div>
          </div>

          <div className="arch-connector-line"></div>

          <div className="arch-step-node">
            <div className="arch-icon-wrap">
              <ShieldCheck size={16} />
            </div>
            <div className="arch-node-meta">
              <span className="arch-node-title">4. LangGraph Engine</span>
              <span className="arch-node-sub">Deterministic Verdict (PASS/FAIL)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars (All icons and step pills solid white and palette tinted, zero grey) */}
      <section className="pillars-grid">
        <div className="pillar-box">
          <div className="pillar-header-row">
            <div className="pillar-icon">
              <Layers size={24} />
            </div>
            <span className="pillar-badge font-mono">01 / EXTRACTION</span>
          </div>
          <h3 className="pillar-headline">Multimodal Signal Ingestion</h3>
          <p className="pillar-body">
            Streams video content via yt-dlp and routes it to Azure Video Indexer to extract
            frame-accurate spoken dialogue transcripts alongside visual on-screen text for disclaimer verification.
          </p>
        </div>

        <div className="pillar-box">
          <div className="pillar-header-row">
            <div className="pillar-icon">
              <FileSearch size={24} />
            </div>
            <span className="pillar-badge font-mono">02 / KNOWLEDGE</span>
          </div>
          <h3 className="pillar-headline">Regulatory Vector Store</h3>
          <p className="pillar-body">
            Pre-indexed rulebooks in Azure AI Search vectorize FTC 16 CFR § 255.5 and YouTube Ad Policies
            using text-embedding-3-small for semantic similarity matching on every candidate frame.
          </p>
        </div>

        <div className="pillar-box">
          <div className="pillar-header-row">
            <div className="pillar-icon">
              <Cpu size={24} />
            </div>
            <span className="pillar-badge font-mono">03 / REASONING</span>
          </div>
          <h3 className="pillar-headline">LangGraph DAG Evaluation</h3>
          <p className="pillar-body">
            A stateful directed graph orchestrates Azure OpenAI GPT-4o with deterministic schema enforcement,
            generating timestamped violations, severity tags, and downloadable compliance reports.
          </p>
        </div>
      </section>

      {/* Recent Audits Section (When history exists) */}
      {recentAudits.length > 0 && (
        <section className="recent-section">
          <div className="recent-header">
            <div>
              <h2 className="recent-heading">Recent Compliance Audits</h2>
              <p className="recent-caption">
                Review previous audit reports and download findings without re-running the pipeline.
              </p>
            </div>
          </div>

          <div className="recent-card-table">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Video Target</th>
                  <th>Verdict</th>
                  <th>Score</th>
                  <th>Findings</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.slice(0, 5).map((audit) => {
                  const isPass = audit.status === 'PASS';
                  const issues = (audit.compliance_results || []).length;
                  const dateStr = audit.timestamp
                    ? new Date(audit.timestamp).toLocaleDateString()
                    : 'Recent';

                  return (
                    <tr key={audit.session_id}>
                      <td className="font-mono text-bold text-slate">
                        {audit.session_id ? audit.session_id.substring(0, 12) + '...' : 'vid_session'}
                      </td>
                      <td className="font-mono text-muted text-sm cell-url">
                        {audit.video_url}
                      </td>
                      <td>
                        <span className={`table-badge ${isPass ? 'badge-pass' : 'badge-fail'}`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="font-mono font-semibold">
                        {audit.compliance_score ?? (isPass ? 95 : 60)}/100
                      </td>
                      <td className="text-secondary">{issues} recorded</td>
                      <td className="text-muted text-sm">{dateStr}</td>
                      <td>
                        <div className="table-btn-group">
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onSelectAudit(audit)}
                            title="Load in workspace"
                          >
                            <Play size={12} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => downloadReportFile(audit)}
                            title="Download Report"
                          >
                            <Download size={12} />
                            <span>Report</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
