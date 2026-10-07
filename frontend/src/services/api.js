/**
 * API client and history storage service for Brand Guardian AI
 */

const HISTORY_KEY = 'brand_guardian_audit_history_v1';

export function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function parseTimestampToSeconds(ts) {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export async function runVideoAudit(videoUrl) {
  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_url: videoUrl }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.warn('Backend API error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

// --- HISTORY MANAGEMENT ---
export function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load history:', err);
    return [];
  }
}

export function saveToHistory(audit) {
  if (!audit || !audit.session_id) return;
  try {
    const history = getStoredHistory();
    // Prepend new audit and deduplicate by session_id
    const updated = [audit, ...history.filter((item) => item.session_id !== audit.session_id)];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 20))); // Keep last 20
  } catch (err) {
    console.error('Failed to save to history:', err);
  }
}

export function clearStoredHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
