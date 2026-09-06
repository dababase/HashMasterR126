// Numeric per-category score entry. Mirrors the Postgres constraint
// scores_range_tenths_chk: 0 <= raw_score <= 10, tenths only (0.10 steps).
import { useState, useEffect } from 'react';

// Snap to nearest 0.10 and clamp to [0,10]. Float-safe (no 8.6999999).
export function normalizeScore(raw) {
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(10, Math.max(0, n));
  return Math.round(clamped * 10) / 10;
}

// Allow only digits and a single decimal point while typing. Precision beyond
// tenths (e.g. "2.03") is allowed here and snapped to the nearest 0.10 on commit.
function sanitizeTyping(s) {
  s = s.replace(/[^0-9.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  }
  return s;
}

export default function ScoreInput({ categoryName, value, onCommit, disabled }) {
  const [text, setText] = useState(value == null ? '' : value.toFixed(1));

  // Re-sync if value arrives from a restore / sync-on-reconnect.
  useEffect(() => {
    setText(value == null ? '' : value.toFixed(1));
  }, [value]);

  const commit = () => {
    const normalized = normalizeScore(text);
    setText(normalized == null ? '' : normalized.toFixed(1));
    onCommit(normalized);
  };

  return (
    <div className="cat-head">
      <span className="cat-name">{categoryName}</span>
      <input
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        className="score-input"
        aria-label={`${categoryName} score, 0 to 10 in tenths`}
        placeholder="—"
        disabled={disabled}
        value={text}
        onChange={(e) => setText(sanitizeTyping(e.target.value))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    </div>
  );
}
