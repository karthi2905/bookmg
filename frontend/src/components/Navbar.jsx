import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { 
  Calendar, 
  Layers, 
  Clock, 
  CheckSquare, 
  BarChart3, 
  User, 
  ChevronDown, 
  LogOut,
  ShieldAlert,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingApprovalsCount, onOpenAuthModal }) {
  const { user, logout, quickSwitch, canApprove } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="glass-panel" style={{ 
      margin: '16px 24px', 
      padding: '12px 24px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      position: 'sticky',
      top: '16px',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('catalog')}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Calendar size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BookMg
          </span>
          <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Enterprise Resource Platform
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '4px 6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          className="btn"
          style={{
            background: activeTab === 'catalog' ? '#1e293b' : 'transparent',
            color: activeTab === 'catalog' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'catalog' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            fontSize: '0.85rem',
            padding: '8px 14px'
          }}
        >
          <Layers size={16} /> Catalog & Book
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className="btn"
          style={{
            background: activeTab === 'calendar' ? '#1e293b' : 'transparent',
            color: activeTab === 'calendar' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'calendar' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            fontSize: '0.85rem',
            padding: '8px 14px'
          }}
        >
          <Clock size={16} /> Availability Grid
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className="btn"
          style={{
            background: activeTab === 'bookings' ? '#1e293b' : 'transparent',
            color: activeTab === 'bookings' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'bookings' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            fontSize: '0.85rem',
            padding: '8px 14px'
          }}
        >
          <Calendar size={16} /> My Bookings
        </button>

        {canApprove && (
          <button
            onClick={() => setActiveTab('approvals')}
            className="btn"
            style={{
              background: activeTab === 'approvals' ? '#1e293b' : 'transparent',
              color: activeTab === 'approvals' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'approvals' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              fontSize: '0.85rem',
              padding: '8px 14px',
              position: 'relative'
            }}
          >
            <CheckSquare size={16} /> Approvals
            {pendingApprovalsCount > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#000000',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '999px',
                marginLeft: '4px'
              }}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('reports')}
          className="btn"
          style={{
            background: activeTab === 'reports' ? '#1e293b' : 'transparent',
            color: activeTab === 'reports' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'reports' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            fontSize: '0.85rem',
            padding: '8px 14px'
          }}
        >
          <BarChart3 size={16} /> Analytics
        </button>
      </div>

      {/* User Session & Authentication Area */}
      {user ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '12px' }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: user.role === 'ROLE_ADMIN' ? '#6366f1' : user.role === 'ROLE_MANAGER' ? '#f59e0b' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff'
            }}>
              {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName || user.email}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {user.role?.replace('ROLE_', '')} • {user.department || 'GENERAL'}
              </div>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {dropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '290px',
                padding: '12px',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 200,
                background: '#0f172a'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', padding: '0 6px' }}>
                Signed in as: <strong style={{ color: '#f8fafc' }}>{user.email}</strong>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '6px', padding: '0 6px' }}>
                Switch Demo Persona
              </div>
              {PRESET_USERS.map((preset) => (
                <button
                  key={preset.email}
                  onClick={async () => {
                    await quickSwitch(preset);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: user.email === preset.email ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: user.email === preset.email ? '#818cf8' : '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.82rem',
                    marginBottom: '4px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{preset.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{preset.email}</div>
                  </div>
                  <span className={`badge ${preset.role === 'ROLE_ADMIN' ? 'badge-confirmed' : preset.role === 'ROLE_MANAGER' ? 'badge-pending' : 'badge-checkedin'}`} style={{ fontSize: '0.65rem' }}>
                    {preset.role.replace('ROLE_', '')}
                  </span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAuthModal?.();
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                >
                  <UserPlus size={14} /> Switch Account / Register
                </button>

                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: '#f43f5e', fontSize: '0.8rem' }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenAuthModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.88rem', fontWeight: 600 }}
        >
          <LogIn size={16} /> Sign In / Register
        </button>
      )}
    </nav>
  );
}


