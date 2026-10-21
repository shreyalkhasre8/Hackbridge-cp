import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CompatibilityBadge({ score, isRecommended, onClick, size = 'md' }) {
  const numericScore = parseFloat(score) || 0;
  const isHigh = numericScore >= 70;
  const isMid = numericScore >= 50 && numericScore < 70;

  let bg = 'rgba(113, 143, 113, 0.15)';
  let color = 'var(--color-olive-800)';
  let border = '1px solid var(--color-olive-300)';

  if (isHigh) {
    bg = 'rgba(42, 110, 63, 0.12)';
    color = '#1D5A30';
    border = '1px solid rgba(42, 110, 63, 0.35)';
  } else if (isMid) {
    bg = 'rgba(217, 149, 17, 0.15)';
    color = '#8C5D08';
    border = '1px solid rgba(217, 149, 17, 0.35)';
  }

  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.2rem 0.55rem' : '0.35rem 0.8rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: 700,
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color: color,
        border: border,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
      title="Click to view explainable compatibility score breakdown"
    >
      <Sparkles size={size === 'sm' ? 12 : 14} />
      <span>{numericScore.toFixed(1)}% Match</span>
      {isRecommended && (
        <span style={{
          background: 'var(--color-accent-400)',
          color: 'var(--color-olive-900)',
          fontSize: '0.65rem',
          padding: '0.1rem 0.4rem',
          borderRadius: 'var(--radius-pill)',
          fontWeight: 800,
          marginLeft: '0.2rem',
        }}>
          REC
        </span>
      )}
    </span>
  );
}
