import React, { useState } from 'react';
import { Play, AlertCircle, AlertTriangle, CheckCircle, ShieldCheck, Bookmark } from 'lucide-react';
import { parseTimestampToSeconds } from '../services/api';

export default function ViolationsList({ violations = [], onSeek }) {
  const [filter, setFilter] = useState('ALL'); // ALL | CRITICAL | WARNING

  const filteredList = violations.filter((v) => {
    if (filter === 'CRITICAL') return v.severity === 'CRITICAL';
    if (filter === 'WARNING') return v.severity === 'WARNING';
    return true;
  });

  return (
    <div className="violations-panel-card">
      <div className="violations-header">
        <div className="violations-title-row">
          <AlertCircle size={16} className="violations-header-icon" />
          <h3 className="violations-title">Compliance Findings & Citations</h3>
          <span className="violations-count-badge">{violations.length} Detected</span>
        </div>

        <div className="filter-buttons-group">
          <button
            type="button"
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({violations.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilter('CRITICAL')}
          >
            Critical ({violations.filter((v) => v.severity === 'CRITICAL').length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'WARNING' ? 'active' : ''}`}
            onClick={() => setFilter('WARNING')}
          >
            Warnings ({violations.filter((v) => v.severity === 'WARNING').length})
          </button>
        </div>
      </div>

      <div className="violations-items-container">
        {filteredList.length === 0 ? (
          <div className="empty-violations-state">
            <ShieldCheck size={36} className="text-pass" />
            <p>No violations found for selected filter.</p>
          </div>
        ) : (
          filteredList.map((item, idx) => {
            const isCritical = item.severity === 'CRITICAL';
            const isWarning = item.severity === 'WARNING';
            const seconds = item.seconds ?? parseTimestampToSeconds(item.timestamp);

            return (
              <div
                key={idx}
                className={`violation-card-item ${isCritical ? 'item-critical' : isWarning ? 'item-warning' : 'item-pass'}`}
              >
                <div className="item-top-row">
                  <div className="item-badges-left">
                    <span
                      className={`severity-badge ${isCritical ? 'badge-critical' : isWarning ? 'badge-warning' : 'badge-pass'}`}
                    >
                      {isCritical ? (
                        <AlertCircle size={12} />
                      ) : isWarning ? (
                        <AlertTriangle size={12} />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      <span>{item.severity}</span>
                    </span>

                    <span className="category-badge">{item.category}</span>
                  </div>

                  {item.timestamp && (
                    <button
                      type="button"
                      className="timestamp-seek-btn"
                      onClick={() => onSeek(seconds)}
                      title={`Jump video player to ${item.timestamp}`}
                    >
                      <Play size={11} fill="currentColor" />
                      <span>{item.timestamp}</span>
                    </button>
                  )}
                </div>

                <p className="item-description">{item.description}</p>

                {item.rule_reference && (
                  <div className="item-rule-box">
                    <Bookmark size={12} className="rule-icon" />
                    <span className="rule-text">{item.rule_reference}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
