import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="help" className="public-footer">
      <div className="public-footer-inner">
        {/* Col 1: Brand */}
        <div>
          <Link to="/" className="public-brand" style={{ marginBottom: '14px', display: 'inline-flex' }}>
            <div className="public-brand-icon">
              <Building size={18} strokeWidth={2.4} />
            </div>
            <span>BookMg</span>
          </Link>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
            Internal workplace meeting room, engineering testbed, and equipment booking system for company teams.
          </p>

          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Microservices Architecture • Spring Boot &amp; React
          </div>
        </div>

        {/* Col 2: Product */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '14px' }}>
            Workspace Features
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <a href="#spaces" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Conference Rooms</a>
            <a href="#spaces" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Research Laboratories</a>
            <a href="#how-it-works" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Automated Check-in</a>
            <Link to="/app/calendar" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Availability Timeline</Link>
          </div>
        </div>

        {/* Col 3: Facilities */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '14px' }}>
            Facilities Governance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <a href="#approvals" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Lab Safety Approvals</a>
            <a href="#approvals" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Induction Checklists</a>
            <Link to="/app/resources" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Campus Directory</Link>
            <Link to="/app/reports" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Utilisation Metrics</Link>
          </div>
        </div>

        {/* Col 4: Support & Help */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '14px' }}>
            Internal Support
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>IT Helpdesk: Ext 4040</span>
            <span style={{ color: 'var(--text-muted)' }}>Facilities: building-ops@company.internal</span>
            <span style={{ color: 'var(--text-muted)' }}>Security Cage: Locker 3</span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginTop: '6px' }}>
              Employee Portal Sign In →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="public-footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} BookMg Workplace Management. Internal company application.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Confidential &amp; Proprietary</span>
          <span>•</span>
          <span>Enterprise Campus Portal</span>
        </div>
      </div>
    </footer>
  );
}
