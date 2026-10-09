import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  Building,
  Calendar,
  Layers
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, register, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('ENGINEERING');
  const [regRole, setRegRole] = useState('ROLE_EMPLOYEE');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      setSuccessMsg(`Welcome back, ${user.fullName || user.email}!`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Work email is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        department: regDepartment,
        role: regRole,
      });

      setSuccessMsg(`Account created for ${user.fullName}!`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 600);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (preset) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickSwitch(preset);
      setSuccessMsg(`Signed in as ${preset.name} (${preset.dept})`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed for demo persona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content auth-split-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '90vw',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(11, 36, 32, 0.22), 0 8px 24px rgba(16, 24, 40, 0.08)',
        }}
      >
        {/* LEFT BRAND PANEL in --primary with lime accent shapes and tagline */}
        <div
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="auth-left-brand-panel"
        >
          {/* Decorative subtle lime accents */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 245, 96, 0.08)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 245, 96, 0.06)',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={20} color="var(--accent-lime)" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  BookMg
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Workplace Scheduling
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.3, color: '#FFFFFF', marginBottom: '14px' }}>
              Internal meeting room, lab and equipment booking.
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
              Reserve conference spaces, research equipment, and hardware workbenches with atomic conflict prevention and automated 15-minute check-in release.
            </p>
          </div>

          {/* Quick Demo Personas in left panel */}
          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '8px' }}>
              1-Click Demo Personas:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_USERS.slice(0, 3).map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickSelect(p)}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(200, 245, 96, 0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
                >
                  <span>{p.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>({p.role.replace('ROLE_', '')})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT WHITE FORM CARD */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>

          <div>
            {/* Tab switch: Sign In / Create Account */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  backgroundColor: activeTab === 'login' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'login' ? 'var(--text-strong)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  backgroundColor: activeTab === 'register' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'register' ? 'var(--text-strong)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Alert / Errors */}
            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--danger-soft)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--success-soft)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px',
                }}
              >
                <CheckCircle size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Enterprise Work Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. user@bookmg.com or manager@bookmg.com"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '44px', fontWeight: 600, marginTop: '8px' }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Karthik S"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. karthik@bookmg.com"
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Department</label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="select-field"
                    >
                      <option value="ENGINEERING">Engineering</option>
                      <option value="PRODUCT">Product</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="SALES">Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="select-field"
                    >
                      <option value="ROLE_EMPLOYEE">Employee</option>
                      <option value="ROLE_MANAGER">Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Password (Min 6 chars)</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '44px', fontWeight: 600, marginTop: '6px' }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
