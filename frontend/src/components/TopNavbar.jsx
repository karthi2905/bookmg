import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  BarChart3,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Shield,
  Menu,
  X,
  Building,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function TopNavbar({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onOpenAuthModal,
  onOpenApprovals
}) {
  const { user, logout, quickSwitch, isAdmin, isManager, canApprove } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (scrollY > 20) {
      setProfileDropdownOpen(false);
      setNotificationsOpen(false);
    }
  }, [scrollY]);

  const isScrolled = scrollY > 8;
  const logoProfileOffset = Math.min(scrollY, 70);
  const logoProfileOpacity = Math.max(0, 1 - scrollY / 45);
  const logoProfileClickable = scrollY <= 40;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Spaces & Rooms', icon: Building2 },
    { id: 'calendar', label: 'Availability Grid', icon: Calendar },
    { id: 'bookings', label: 'My Reservations', icon: Clock },
    ...(canApprove
      ? [
          {
            id: 'approvals',
            label: 'Approvals Queue',
            icon: ShieldCheck,
            badgeCount: pendingApprovalsCount,
          },
        ]
      : []),
    { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="top-navbar-wrapper"
      style={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px 0 24px',
        pointerEvents: 'none',
      }}
    >
      <div
        className="top-navbar-container"
        style={{
          maxWidth: '1340px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Left: Brand Logo (Dynamic: goes up with page scroll) */}
        <div
          className="topbar-dynamic-logo"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '20px',
            transform: `translateY(-${logoProfileOffset}px)`,
            opacity: logoProfileOpacity,
            pointerEvents: logoProfileClickable ? 'auto' : 'none',
            transition: 'transform 80ms cubic-bezier(0, 0, 0.2, 1), opacity 100ms ease-out',
            willChange: 'transform, opacity',
          }}
        >
          <Link
            to="/"
            title="BookMg - Return to Homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              textDecoration: 'none',
            }}
          >
            {/* Brand Mark Icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(11, 36, 32, 0.25)',
              }}
            >
              <Building size={18} color="var(--accent-lime)" strokeWidth={2.2} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  BookMg
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent-lime)',
                    color: 'var(--primary)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Enterprise
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '-0.01em', display: 'block', marginTop: '2px' }}>
                Campus Scheduling
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Tabs (Static: stays pinned at top with corner radius) */}
        <nav
          className="topbar-desktop-nav"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : '#FFFFFF',
            backdropFilter: isScrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
            padding: '5px 8px',
            borderRadius: 'var(--radius-navbar, 20px)',
            border: isScrolled ? '1px solid rgba(226, 232, 240, 0.95)' : '1px solid var(--border)',
            boxShadow: isScrolled
              ? '0 8px 30px rgba(16, 24, 40, 0.12), 0 2px 6px rgba(16, 24, 40, 0.05)'
              : '0 4px 20px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.04)',
            pointerEvents: 'auto',
            transition: 'box-shadow var(--transition-fast), background-color var(--transition-fast), border var(--transition-fast)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-lime-soft)' : 'transparent',
                  color: isActive ? 'var(--text-strong)' : 'var(--text-body)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
              >
                <Icon
                  size={15}
                  color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                <span>{item.label}</span>

                {item.badgeCount > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: 'var(--danger)',
                      color: '#FFFFFF',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      marginLeft: '2px',
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Notifications & User Persona (Dynamic: goes up with page scroll) */}
        <div
          className="topbar-dynamic-profile"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            transform: `translateY(-${logoProfileOffset}px)`,
            opacity: logoProfileOpacity,
            pointerEvents: logoProfileClickable ? 'auto' : 'none',
            transition: 'transform 80ms cubic-bezier(0, 0, 0.2, 1), opacity 100ms ease-out',
            willChange: 'transform, opacity',
          }}
        >
          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="btn-ghost"
              title="Notifications"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-card)',
                position: 'relative',
              }}
            >
              <Bell size={16} color="var(--text-strong)" strokeWidth={1.8} />
              {pendingApprovalsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--danger)',
                    border: '2px solid var(--bg-card)',
                  }}
                />
              )}
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '330px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-popover)',
                  padding: '16px',
                  zIndex: 'var(--z-dropdown)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    System Notifications
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Live Campus Feed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingApprovalsCount > 0 ? (
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        onOpenApprovals?.();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--warning-soft)',
                        border: '1px solid var(--warning-border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                        <Shield size={14} /> {pendingApprovalsCount} Approvals Pending
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-body)', marginTop: '4px', lineHeight: 1.4 }}>
                        Restricted space requests require managerial review. Click to inspect queue.
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
                        <CheckCircle2 size={14} /> Approvals Queue Clear
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        No pending restricted room sign-offs requiring action.
                      </p>
                    </div>
                  )}

                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Automatic 15-Min No-Show Release</div>
                    Sessions without check-in 15m after start are automatically returned to the room pool.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Persona & Profile Pill */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  cursor: 'pointer',
                  height: '38px',
                }}
              >
                {/* Initials Avatar */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
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

                <div style={{ textAlign: 'left', lineHeight: 1.1 }} className="topbar-user-meta">
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    {user.fullName || user.email}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {user.role ? user.role.replace('ROLE_', '') : 'USER'}
                  </div>
                </div>

                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* Persona Switcher & Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '290px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-popover)',
                    padding: '12px',
                    zIndex: 'var(--z-dropdown)',
                  }}
                >
                  {/* Persona Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Switch Persona (1-Click)
                    </span>
                    <Sparkles size={13} color="var(--warning)" />
                  </div>

                  {/* Persona List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                    {PRESET_USERS.map((preset) => {
                      const isCurrent = user.email === preset.email;
                      return (
                        <button
                          key={preset.email}
                          type="button"
                          onClick={async () => {
                            await quickSwitch(preset);
                            setProfileDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isCurrent ? 'var(--accent-lime-soft)' : 'transparent',
                            color: 'var(--text-strong)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{preset.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{preset.dept} • {preset.email}</div>
                          </div>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: preset.role === 'ROLE_ADMIN' ? 'var(--primary)' : 'var(--bg-subtle)',
                              color: preset.role === 'ROLE_ADMIN' ? '#FFFFFF' : 'var(--text-body)',
                            }}
                          >
                            {preset.role.replace('ROLE_', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Footer Actions */}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAuthModal?.();
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        color: 'var(--text-body)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <User size={13} /> Custom Sign In / Register
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        color: 'var(--danger)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <LogOut size={13} /> Log out session
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600, padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
            >
              Sign In
            </button>
          )}

          {/* Mobile Hamburger Toggle (Shown on <1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="topbar-mobile-toggle"
            title="Toggle Menu"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              pointerEvents: 'auto',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown with Corner Radius */}
      {mobileMenuOpen && (
        <div
          className="topbar-mobile-drawer"
          style={{
            maxWidth: '1340px',
            margin: '8px auto 0 auto',
            borderRadius: '18px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-popover)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fadeIn 150ms ease-out',
            pointerEvents: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-lime-soft)' : 'transparent',
                  color: isActive ? 'var(--text-strong)' : 'var(--text-body)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--danger)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
