import React from 'react';
import { Clock, Eye, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const configs = {
    applied: {
      label: 'Applied',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
      icon: Clock,
    },
    under_review: {
      label: 'Under Review',
      color: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.3)',
      icon: Eye,
    },
    interview: {
      label: 'Interviewing',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: Calendar,
    },
    accepted: {
      label: 'Offer Accepted',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Not Selected',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.applied;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}
