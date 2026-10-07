import React, { useRef, useEffect } from 'react';
import { Play, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { parseTimestampToSeconds } from '../services/api';

export default function VideoPlayer({
  youtubeId,
  videoUrl,
  violations = [],
  seekSeconds,
  onSeek
}) {
  const iframeRef = useRef(null);

  // When seekSeconds changes, instruct the YouTube iframe via postMessage API
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
        console.warn('IFrame postMessage failed:', err);
      }
    }
  }, [seekSeconds]);

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}&rel=0`
    : null;

  return (
    <div className="player-panel-card">
      <div className="player-header">
        <div className="player-title-row">
          <Play size={16} className="player-icon" />
          <h3 className="player-title">Audited Video Playback</h3>
        </div>
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link-btn"
            title="Open original video"
          >
            <ExternalLink size={13} />
            <span>Open in YouTube</span>
          </a>
        )}
      </div>

      <div className="video-viewport-wrapper">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="Audited Video"
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">
            <AlertCircle size={32} className="text-muted" />
            <p>No valid YouTube video stream loaded</p>
          </div>
        )}
      </div>

      {/* Violation Timeline Markers */}
      {violations.length > 0 && (
        <div className="timeline-pins-container">
          <div className="timeline-header">
            <span className="timeline-label">
              <Clock size={12} /> Compliance Violation Markers
            </span>
            <span className="timeline-hint">Click a timestamp marker to jump:</span>
          </div>

          <div className="timeline-badges-list">
            {violations.map((violation, idx) => {
              const seconds = violation.seconds ?? parseTimestampToSeconds(violation.timestamp);
              const isCritical = violation.severity === 'CRITICAL';
              const isWarning = violation.severity === 'WARNING';

              return (
                <button
                  key={idx}
                  type="button"
                  className={`timeline-pin-btn ${isCritical ? 'pin-critical' : isWarning ? 'pin-warning' : 'pin-pass'}`}
                  onClick={() => onSeek(seconds)}
                  title={`${violation.category}: ${violation.description}`}
                >
                  <span className="pin-dot"></span>
                  <span className="pin-time">{violation.timestamp || '00:00'}</span>
                  <span className="pin-category">{violation.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
