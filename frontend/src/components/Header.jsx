import React from 'react';
import { Shield, Sparkles, CheckCircle, Database } from 'lucide-react';

export default function Header({ onSelectSample, activeSampleId }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-logo-container">
            <Shield className="brand-logo-icon" size={20} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">Brand Guardian AI</h1>
              <span className="badge-version">v1.0 Enterprise</span>
            </div>
            <p className="brand-subtitle">
              Automated Multimodal Compliance Engine for Video Ads
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Azure AI Search & OpenAI Ready</span>
          </div>

          <div className="sample-presets-group">
            <span className="presets-label">Quick Demo:</span>
            <button
              type="button"
              className={`preset-btn ${activeSampleId === 'sample-ftc-violation' ? 'active' : ''}`}
              onClick={() => onSelectSample('sample-ftc-violation')}
            >
              FTC Non-Compliant
            </button>
            <button
              type="button"
              className={`preset-btn ${activeSampleId === 'sample-compliant-ad' ? 'active' : ''}`}
              onClick={() => onSelectSample('sample-compliant-ad')}
            >
              Compliant Ad
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
