import React from 'react';
import { Shield, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  historyCount,
  onOpenHistory
}) {
  return (
    <nav className="app-navbar">
      <div className="navbar-container">
        <button
          type="button"
          className="navbar-brand-btn"
          onClick={() => onNavigate('home')}
          title="Return to Home Screen"
        >
          <div className="navbar-logo-wrap">
            <Shield size={18} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">Brand Guardian AI</span>
            <span className="navbar-subtitle">Video Compliance Auditor</span>
          </div>
        </button>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-btn-history"
            onClick={onOpenHistory}
            title="View Audit History"
          >
            <Clock size={15} />
            <span>Audit History</span>
            {historyCount > 0 && (
              <span className="navbar-badge-count">{historyCount}</span>
            )}
          </button>

          {currentView === 'home' ? (
            <button
              type="button"
              className="navbar-btn-audit"
              onClick={() => onNavigate('audit')}
            >
              <span>Audit Video</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="navbar-btn-back"
              onClick={() => onNavigate('home')}
              title="Return to Home Screen"
            >
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
