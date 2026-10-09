import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaBanner() {
  const { user } = useAuth();

  return (
    <section className="landing-section" aria-labelledby="cta-banner-title">
      <div className="cta-banner-container">
        {/* Subtle decorative lime circle */}
        <div className="cta-lime-accent" />

        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(200, 245, 96, 0.15)',
              color: 'var(--accent-lime)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={13} />
            <span>Company-Wide Scheduling</span>
          </div>

          <h2
            id="cta-banner-title"
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            Streamline meeting space and lab access today
          </h2>

          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.6 }}>
            Eliminate scheduling double-bookings and speed up technical collaboration across every team in the organization.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          {user ? (
            <Link
              to="/app/dashboard"
              className="btn"
              style={{
                backgroundColor: 'var(--accent-lime)',
                color: 'var(--primary)',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <span>Open workspace dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/app/dashboard?guest=true"
                className="btn"
                style={{
                  backgroundColor: 'var(--accent-lime)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  padding: '12px 26px',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Open dashboard</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="btn btn-outline"
                style={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none',
                }}
              >
                Log in to account
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
