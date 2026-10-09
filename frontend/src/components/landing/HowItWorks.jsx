import React from 'react';
import { Search, CalendarCheck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: 'Pick a space',
    description: 'Browse 50+ meeting suites, cleanrooms, and engineering testbeds across campus buildings.',
    icon: Search,
  },
  {
    step: '2',
    title: 'Choose a time',
    description: 'Reserve single meetings or set recurring syncs up to 3 months out with atomic conflict prevention.',
    icon: CalendarCheck,
  },
  {
    step: '3',
    title: 'Check in on the day',
    description: 'Confirm presence within 15 minutes of start time to prevent ghost bookings and auto-release rooms.',
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section" aria-labelledby="how-it-works-title">
      <div className="section-header-row" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div>
          <h2 id="how-it-works-title" className="section-title">
            How BookMg works
          </h2>
          <p className="section-subtitle">
            A frictionless, transparent reservation flow designed for engineering velocity and team collaboration.
          </p>
        </div>
      </div>

      <div className="how-it-works-grid">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="how-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="how-number-circle">{s.step}</div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '8px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
