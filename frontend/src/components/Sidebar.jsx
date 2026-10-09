import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  CalendarCheck2,
  ShieldCheck,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogIn,
  Building2,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  pendingApprovalsCount,
  onOpenAuthModal
}) {
  const { user, logout, quickSwitch, isAdmin, canApprove } = useAuth();
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Resources', icon: Layers },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck2 },
    ...(canApprove
      ? [{ id: 'approvals', label: 'Approvals', icon: ShieldCheck, badgeCount: pendingApprovalsCount }]
      : []),
    ...(isAdmin
      ? [{ id: 'reports', label: 'Reports', icon: BarChart3 }]
      : []),
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(14, 26, 26, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Main Sidebar */}
      <aside
        style={{
          width: collapsed ? '72px' : '240px',
          minWidth: collapsed ? '72px' : '240px',
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 95,
          transition: 'width var(--transition-fast), transform var(--transition-fast)',
          transform: mobileOpen
            ? 'translateX(0)'
            : 'translateX(0)', // On desktop it's static in flow; mobile override handled via class/media
        }}
        className={`sidebar-shell ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {/* Top: Logo & Collapse Button */}
        <div>
          <div
            style={{
              height: '64px',
              padding: collapsed ? '0 12px' : '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              onClick={() => handleNavClick('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              title="BookMg"
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={20} color="var(--accent-lime)" strokeWidth={2} />
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--text-strong)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    BookMg
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                      whiteHeight: 1,
                    }}
                  >
                    Workplace Booking
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="btn-ghost"
                title="Collapse sidebar"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <ChevronLeft size={18} color="var(--text-muted)" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="sidebar-mobile-close-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} color="var(--text-strong)" />
            </button>
          </div>

          {/* Collapsed Expand Button */}
          {collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="btn-ghost"
                title="Expand sidebar"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <ChevronRight size={18} color="var(--text-muted)" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    width: '100%',
                    height: '42px',
                    padding: collapsed ? '0' : '0 12px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isActive ? 'var(--accent-lime-soft)' : 'transparent',
                    color: isActive ? 'var(--text-strong)' : 'var(--text-body)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 'var(--text-base)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon
                    size={18}
                    color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    style={{ flexShrink: 0 }}
                  />

                  {!collapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>
                      {item.label}
                    </span>
                  )}

                  {/* Badge for approvals */}
                  {item.badgeCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--danger)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        height: '18px',
                        minWidth: '18px',
                        padding: '0 5px',
                        borderRadius: 'var(--radius-pill)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        marginLeft: 'auto',
                      }}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Card & Session */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 8px', position: 'relative' }}>
          {user ? (
            <div>
              {/* Persona Switcher Popover */}
              {personaMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '8px',
                    right: collapsed ? 'auto' : '8px',
                    width: collapsed ? '260px' : 'auto',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-popover)',
                    padding: '12px',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      paddingBottom: '6px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Demo Persona Switcher
                    </span>
                    <Sparkles size={13} color="var(--warning)" />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                    {PRESET_USERS.map((preset) => {
                      const isCurrent = user.email === preset.email;
                      return (
                        <button
                          key={preset.email}
                          type="button"
                          onClick={async () => {
                            await quickSwitch(preset);
                            setPersonaMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isCurrent ? 'var(--accent-lime-soft)' : 'transparent',
                            color: 'var(--text-strong)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, truncate: 'true' }}>{preset.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.dept}</div>
                          </div>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
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

                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenAuthModal?.();
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        color: 'var(--text-body)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        borderRadius: '6px',
                      }}
                    >
                      Login with Custom Account
                    </button>
                  </div>
                </div>
              )}

              {/* User Bar / Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '6px 0' : '6px 8px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                {/* Avatar with Initials */}
                <div
                  onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--accent-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  title="Click to switch persona"
                >
                  {user.fullName
                    ? user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    : 'U'}
                </div>

                {!collapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-strong)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.fullName || user.email}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                )}

                {/* Logout Icon */}
                {!collapsed && (
                  <button
                    type="button"
                    onClick={logout}
                    title="Log out"
                    className="btn-ghost"
                    style={{
                      padding: '6px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: collapsed ? '8px 0' : '8px 12px',
                fontSize: '13px',
                justifyContent: 'center',
              }}
              title="Sign In"
            >
              <LogIn size={16} />
              {!collapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
