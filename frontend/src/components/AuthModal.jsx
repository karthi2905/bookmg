import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { 
  Calendar, 
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
  Sparkles
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
      }, 600);
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

      setSuccessMsg(`Account created for ${user.fullName}! Stored in database.`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 800);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create account. Email may already be registered.';
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
      setSuccessMsg(`Logged in as ${preset.name} (${preset.dept})`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed for demo persona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '520px', 
          width: '100%',
          padding: '0',
          overflow: 'hidden',
          background: '#0d1322',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)'
        }}
      >
        {/* Modal Top Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <Calendar size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                BookMg Platform
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.04em' }}>
                ENTERPRISE RESOURCE &amp; SCHEDULING
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.5 }}>
            {activeTab === 'login' 
              ? 'Sign in to access your reservations, schedule rooms, and approve team requests.' 
              : 'Register your enterprise account. Details will be stored and processed in database.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          padding: '6px 28px',
          background: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'login' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'login' ? '#818cf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'register' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'register' ? '#818cf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Status Banners */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f87171',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#818cf8" /> Work Email
                </label>
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
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="#818cf8" /> Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <LogIn size={18} /> Sign In to BookMg
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#818cf8" /> Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Karthikeyan S or Jane Smith"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#818cf8" /> Enterprise Work Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. karthik@enterprise.com"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="#818cf8" /> Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="select-field"
                  >
                    <option value="ENGINEERING">Engineering</option>
                    <option value="PRODUCT">Product</option>
                    <option value="IT">Information Tech</option>
                    <option value="HR">Human Resources</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="#818cf8" /> Account Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="select-field"
                  >
                    <option value="ROLE_EMPLOYEE">Employee (Bookings)</option>
                    <option value="ROLE_MANAGER">Manager (Approvals)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="#818cf8" /> Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Creating in Database...' : (
                  <>
                    <UserPlus size={18} /> Register &amp; Start Booking
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '10px' 
            }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Or sign in as demo persona:
              </span>
              <span style={{ fontSize: '0.72rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> 1-Click Fast Access
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_USERS.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickSelect(preset)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                >
                  <span style={{ fontWeight: 600 }}>{preset.name}</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({preset.role.replace('ROLE_', '')})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
