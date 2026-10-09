import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Menu, X, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';

export default function PublicNavbar({ onOpenAuth }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('spaces');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          setScrollY(sy);
          setScrolled(sy > 8);
          ticking = false;
        });
        ticking = true;
      }

      // Track sections for active indicator
      const sections = ['spaces', 'how-it-works', 'approvals', 'help'];
      const scrollPos = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoActionsOffset = Math.min(scrollY, 70);
  const logoActionsOpacity = Math.max(0, 1 - scrollY / 45);
  const logoActionsClickable = scrollY <= 40;

  const navLinks = [
    { label: 'Spaces', href: '#spaces', id: 'spaces' },
    { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'Labs and approvals', href: '#approvals', id: 'approvals' },
    { label: 'Help & FAQ', href: '#help', id: 'help' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setDrawerOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenAuth = (mode) => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      navigate(`/${mode}`);
    }
  };

  return (
    <>
      <nav
        className={`public-navbar-sticky ${scrolled ? 'public-navbar-scrolled' : 'public-navbar-transparent'}`}
        aria-label="Main Public Navigation"
        style={{ pointerEvents: 'none' }}
      >
        <div className="public-navbar-inner">
          {/* Left: Brand Logo (Dynamic: goes up with page scroll) */}
          <div
            className="public-brand-wrapper"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              transform: `translateY(-${logoActionsOffset}px)`,
              opacity: logoActionsOpacity,
              pointerEvents: logoActionsClickable ? 'auto' : 'none',
              transition: 'transform 80ms cubic-bezier(0, 0, 0.2, 1), opacity 100ms ease-out',
              willChange: 'transform, opacity',
            }}
          >
            <Link to="/" className="public-brand">
              <div className="public-brand-icon">
                <Building size={18} strokeWidth={2.4} />
              </div>
              <span>BookMg</span>
            </Link>
          </div>

          {/* Center: Nav links inside corner radius pill ONLY (Static: stays pinned at top) */}
          <div
            className="public-nav-links"
            style={{
              flexShrink: 0,
              pointerEvents: 'auto',
              boxShadow: scrolled
                ? '0 8px 30px rgba(16, 24, 40, 0.12), 0 2px 6px rgba(16, 24, 40, 0.05)'
                : '0 2px 10px rgba(11, 36, 32, 0.04)',
              transition: 'box-shadow var(--transition-fast)',
            }}
          >
            {navLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={`public-nav-link ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: Actions (Dynamic: goes up with page scroll) */}
          <div
            className="public-nav-actions"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              transform: `translateY(-${logoActionsOffset}px)`,
              opacity: logoActionsOpacity,
              pointerEvents: logoActionsClickable ? 'auto' : 'none',
              transition: 'transform 80ms cubic-bezier(0, 0, 0.2, 1), opacity 100ms ease-out',
              willChange: 'transform, opacity',
            }}
          >
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/app/dashboard"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Open dashboard</span>
                  <ArrowRight size={14} />
                </Link>

                <div
                  title={user.fullName || user.email}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--accent-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {user.fullName
                    ? user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    : 'U'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Direct Open Dashboard Button for visitors (opens /app/dashboard in guest mode) */}
                <Link
                  to="/app/dashboard?guest=true"
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  <span>Open dashboard</span>
                  <ArrowRight size={13} />
                </Link>

                {/* Log in text link */}
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  style={{
                    color: 'var(--text-strong)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '6px 10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Log in
                </button>

                {/* Sign up outlined button */}
                <button
                  type="button"
                  onClick={() => handleOpenAuth('register')}
                  className="btn btn-outline btn-sm"
                  style={{ fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="public-drawer-toggle"
              aria-label={drawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="public-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div
            className="public-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <Link to="/" onClick={() => setDrawerOpen(false)} className="public-brand">
                  <div className="public-brand-icon">
                    <Building size={18} strokeWidth={2.4} />
                  </div>
                  <span>BookMg</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-ghost"
                  aria-label="Close menu"
                  style={{ padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: 'var(--text-strong)',
                      fontSize: '15px',
                      fontWeight: 600,
                      backgroundColor: activeSection === item.id ? 'var(--accent-lime-soft)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              {user ? (
                <Link
                  to="/app/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/app/dashboard?guest=true"
                    onClick={() => setDrawerOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleOpenAuth('login');
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Log in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleOpenAuth('register');
                    }}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
