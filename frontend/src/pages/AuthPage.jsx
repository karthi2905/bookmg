import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { Building, Lock, Mail, User, Shield, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ mode = 'login' }) {
  const { user, login, register, quickSwitch, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/app/dashboard';

  const [activeTab, setActiveTab] = useState(mode); // 'login' | 'register'

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('ENGINEERING');
  const [regRole, setRegRole] = useState('ROLE_EMPLOYEE');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect to dashboard or return path
  useEffect(() => {
    if (user && !loading) {
      navigate(returnTo, { replace: true });
    }
  }, [user, loading, navigate, returnTo]);

  // Keep tab in sync if prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg('Session verified. Redirecting to workspace...');
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 350);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Corporate email is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        department: regDepartment,
        role: regRole,
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 450);
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create workplace profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPersona = async (preset) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await quickSwitch(preset);
      setSuccessMsg(`Signed in as ${preset.name}. Redirecting...`);
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 350);
    } catch (err) {
      setErrorMsg('Failed to switch persona.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Return to Landing link */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to homepage</span>
        </Link>
      </div>

      {/* Main Auth Card (Corner Radius 24px) */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(11, 36, 32, 0.12), 0 4px 12px rgba(16, 24, 40, 0.04)',
          border: '1px solid var(--border)',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(11, 36, 32, 0.25)',
              marginBottom: '12px',
            }}
          >
            <Building size={24} color="var(--accent-lime)" strokeWidth={2.4} />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em', margin: 0 }}>
            BookMg Workspace
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Meeting room, laboratory, and equipment reservation platform
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'login' ? 'var(--text-strong)' : 'var(--text-muted)',
              fontWeight: activeTab === 'login' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: activeTab === 'register' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'register' ? 'var(--text-strong)' : 'var(--text-muted)',
              fontWeight: activeTab === 'register' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--danger-soft)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--success-soft)',
              border: '1px solid var(--success-border)',
              color: 'var(--success)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="auth-email" className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="employee@bookmg.internal"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 600,
                marginTop: '6px',
                justifyContent: 'center',
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Dr. Jordan Hayes"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="jordan.hayes@company.internal"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="form-label">Create Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label htmlFor="reg-dept" className="form-label">Department</label>
                <select
                  id="reg-dept"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="select-field"
                >
                  <option value="ENGINEERING">Engineering</option>
                  <option value="RESEARCH">Research &amp; Labs</option>
                  <option value="PRODUCT">Product &amp; Design</option>
                  <option value="EXECUTIVE">Executive Staff</option>
                  <option value="OPERATIONS">Operations</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-role" className="form-label">Access Level</label>
                <select
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="select-field"
                >
                  <option value="ROLE_EMPLOYEE">Standard Employee</option>
                  <option value="ROLE_MANAGER">Team Manager</option>
                  <option value="ROLE_ADMIN">Facility Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 600,
                marginTop: '6px',
                justifyContent: 'center',
              }}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 1-Click Quick Persona Logins */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Switch Demo Personas
            </span>
            <Sparkles size={12} color="var(--warning)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {PRESET_USERS.map((preset) => (
              <button
                key={preset.email}
                type="button"
                onClick={() => handleQuickPersona(preset)}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {preset.dept} • {preset.role.replace('ROLE_', '')}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    backgroundColor: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                  }}
                >
                  Sign In →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
