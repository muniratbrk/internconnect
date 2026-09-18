import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MatchScoreMeter({ match }) {
  if (!match || match.overallScore === undefined) return null;

  const score = match.overallScore;

  // Determine color based on compatibility score
  let color = '#10B981'; // Green for high match
  let bg = 'rgba(16, 185, 129, 0.12)';
  let border = 'rgba(16, 185, 129, 0.3)';

  if (score < 50) {
    color = '#F59E0B';
    bg = 'rgba(245, 158, 11, 0.12)';
    border = 'rgba(245, 158, 11, 0.3)';
  } else if (score < 30) {
    color = '#64748B';
    bg = 'rgba(100, 116, 139, 0.12)';
    border = 'rgba(100, 116, 139, 0.3)';
  }

  return (
    <div
      title={`Compatibility: ${score}% (${match.matchingSkills?.length || 0} skills matched: ${match.matchingSkills?.join(', ') || 'None'})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: '0.78rem',
        fontWeight: 700,
        boxShadow: score >= 80 ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
      }}
    >
      <Sparkles size={13} />
      <span>{score}% Match</span>
    </div>
  );
}
