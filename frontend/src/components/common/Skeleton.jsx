import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton width="48px" height="48px" borderRadius="12px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <Skeleton width="60%" height="18px" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>
      <Skeleton width="90%" height="16px" />
      <Skeleton width="75%" height="16px" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Skeleton width="70px" height="24px" borderRadius="12px" />
        <Skeleton width="70px" height="24px" borderRadius="12px" />
        <Skeleton width="70px" height="24px" borderRadius="12px" />
      </div>
    </div>
  );
}
