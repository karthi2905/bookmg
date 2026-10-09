import React from 'react';
import { ShieldCheck, Check, Lock, Clock, CheckCircle2, FlaskConical, Cpu, ShieldAlert } from 'lucide-react';

const REQUIREMENTS = [
  'Annual laboratory safety induction certification verified.',
  'Standard PPE (acid-resistant coats, splash goggles, nitrile gloves) active.',
  'Lab manager or area supervisor informed in reservation memo.',
  'Hazardous chemicals and MSDS protocol acknowledged.',
];

const RESTRICTED_PREVIEWS = [
  { name: 'Chemistry Lab Bench', icon: FlaskConical },
  { name: 'Hardware Prototyping Lab', icon: Cpu },
  { name: 'AI GPU Mobile Rig', icon: Cpu },
  { name: 'Cleanroom Facility', icon: ShieldCheck },
];

export default function ApprovalsSection() {
  return (
    <section id="approvals" className="landing-section" aria-labelledby="approvals-title">
      <div className="approvals-two-col">
        {/* Left Column: Information & Checklist */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
            <Lock size={12} />
            <span>Safety-First Governance</span>
          </div>

          <h2 id="approvals-title" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '12px' }}>
            Specialized labs and sensitive hardware require sign-off
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
            To safeguard expensive hardware, cryogenic apparatus, and chemical cleanrooms, select facilities require supervisor or lab manager authorization prior to entry.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {REQUIREMENTS.map((req, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-body)' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mock Approval Flow Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '16px' }}>
            Automated Approval Timeline
          </div>

          {/* Stepper Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>Requested</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Booking submitted by employee</div>
                </div>
              </div>
              <span className="badge badge-confirmed" style={{ fontSize: '10px' }}>Submitted</span>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--warning-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>Pending Approval</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lab manager safety review</div>
                </div>
              </div>
              <span className="badge badge-pending" style={{ fontSize: '10px' }}>Under Review</span>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>Confirmed &amp; Badge Access</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Authorized for session entry</div>
                </div>
              </div>
              <span className="badge badge-confirmed" style={{ fontSize: '10px' }}>Authorized</span>
            </div>
          </div>

          {/* Mini Grid of Restricted Spaces */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Restricted Spaces Example:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {RESTRICTED_PREVIEWS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '11px',
                      color: 'var(--text-body)',
                    }}
                  >
                    <Lock size={11} color="var(--warning)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
