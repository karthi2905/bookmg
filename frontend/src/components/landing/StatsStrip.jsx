import React from 'react';
import { Shield, Clock, Repeat, BarChart3 } from 'lucide-react';

const STATS = [
  {
    icon: Shield,
    title: 'Atomic Lock Guarantee',
    description: 'Zero double-booking collisions across campus facilities with transaction-level locking.',
  },
  {
    icon: Clock,
    title: '15-Min No-Show Release',
    description: 'Rooms automatically released back to the general pool when unconfirmed by start time.',
  },
  {
    icon: Repeat,
    title: 'Recurring Series Support',
    description: 'Reserve bi-weekly or monthly sprint cadences up to 3 months ahead with 1-click cancellations.',
  },
  {
    icon: BarChart3,
    title: 'Live Utilisation Reports',
    description: 'Real-time hourly demand heatmaps and capacity telemetry for facility planners.',
  },
];

export default function StatsStrip() {
  return (
    <section className="landing-section" aria-label="Key platform features">
      <div className="stats-strip-grid">
        {STATS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-tile">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-lime-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-strong)' }}>
                {s.title}
              </h3>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
