import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function TopBar({
  title,
  subtitle,
  pendingApprovalsCount,
  onOpenMobileSidebar,
  onOpenAuthModal,
  onOpenApprovals
}) {
  const { user, logout, isAdmin, canApprove } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="topbar-mobile-menu-btn"
          title="Open Navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            borderRadius: '6px',
            color: 'var(--text-strong)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-strong)',
              letterSpacing: '-0.015em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notification Bell & User Avatar Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notification Bell with 4px Safe Space */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="btn-ghost"
            title="Notifications"
            style={{
              width: '40px',
              height: '40px',
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
            <Bell size={18} color="var(--text-strong)" strokeWidth={1.75} />
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

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
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
                  Notifications &amp; Activity
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Real-time
                </span>
              </div>

              {pendingApprovalsCount > 0 ? (
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    onOpenApprovals?.();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--warning-soft)',
                    border: '1px solid var(--warning-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Clock size={16} color="var(--warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                      {pendingApprovalsCount} restricted requests pending
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-body)', marginTop: '2px' }}>
                      Click to review and authorize lab &amp; boardroom reservations.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <CheckCircle2 size={24} color="var(--success)" style={{ margin: '0 auto 6px' }} />
                  <div>All systems nominal. No pending alerts.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile / Login */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="btn btn-secondary"
              style={{
                height: '40px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
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
                {user.fullName ? user.fullName[0] : 'U'}
              </div>

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-strong)',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.fullName || user.email.split('@')[0]}
              </span>

              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '220px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-popover)',
                  padding: '8px',
                  zIndex: 'var(--z-dropdown)',
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    {user.fullName || 'User'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', truncate: 'true' }}>
                    {user.email}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-body)',
                      }}
                    >
                      {user.role?.replace('ROLE_', '')} • {user.department || 'OFFICE'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 600 }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
