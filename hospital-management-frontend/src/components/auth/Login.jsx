import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';

function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'PATIENT' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password) {
      toast.warning('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await AuthService.login(credentials);
      toast.success('Welcome back! Redirecting to dashboard...');
      onLogin();
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid username or password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signupData.username.trim() || !signupData.email.trim() || !signupData.password) {
      toast.warning('Please fill in all required fields.');
      return;
    }
    if (signupData.password.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const createdUser = await AuthService.register(signupData);
      if (createdUser?.status === 'PENDING_APPROVAL') {
        toast.success('Staff account request submitted. You can sign in after admin approval.');
      } else {
        toast.success('Account created! Please sign in.');
      }
      setAuthMode('login');
      setCredentials({ username: signupData.username, password: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .hs-login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: #f8fafc;
        }

        /* ── Left Panel ── */
        .hs-hero {
          background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #0369a1 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .hs-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .hs-hero-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .hs-hero-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          border-radius: 12px;
          display: grid;
          place-items: center;
          box-shadow: 0 8px 24px rgba(56,189,248,0.35);
        }

        .hs-hero-logo svg {
          width: 24px;
          height: 24px;
          stroke: #fff;
          fill: none;
        }

        .hs-hero-brand-text h1 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .hs-hero-brand-text span {
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hs-hero-content {
          position: relative;
          z-index: 1;
        }

        .hs-hero-content h2 {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          color: #fff;
        }

        .hs-hero-content h2 .accent { color: #38bdf8; }

        .hs-hero-content p {
          font-size: 1rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
          max-width: 380px;
          margin-bottom: 32px;
        }

        .hs-stats-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hs-stat {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 16px 20px;
          backdrop-filter: blur(10px);
        }

        .hs-stat-num {
          font-size: 1.6rem;
          font-weight: 800;
          color: #38bdf8;
          line-height: 1;
        }

        .hs-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
          margin-top: 4px;
          font-weight: 500;
        }

        .hs-hero-features {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hs-feat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.75);
        }

        .hs-feat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          flex-shrink: 0;
        }

        /* ── Right Panel ── */
        .hs-form-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 56px;
          background: #fff;
        }

        .hs-form-wrap {
          width: 100%;
          max-width: 420px;
        }

        .hs-form-header {
          margin-bottom: 32px;
        }

        .hs-form-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .hs-form-header p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        .hs-tab-row {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .hs-tab {
          flex: 1;
          padding: 9px;
          border: none;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #64748b;
          font-family: inherit;
        }

        .hs-tab.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .hs-field {
          margin-bottom: 18px;
        }

        .hs-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }

        .hs-input-wrap {
          position: relative;
        }

        .hs-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 0.9rem;
          font-family: inherit;
          color: #0f172a;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .hs-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }

        .hs-input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #94a3b8;
          border: none;
          background: none;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .hs-input-icon:hover { color: #475569; }

        .hs-input.has-icon { padding-right: 42px; }

        .hs-select {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 0.9rem;
          font-family: inherit;
          color: #0f172a;
          background: #fff;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        .hs-select:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }

        .hs-btn-primary {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          letter-spacing: 0.01em;
        }

        .hs-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          box-shadow: 0 6px 20px rgba(14,165,233,0.35);
          transform: translateY(-1px);
        }

        .hs-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .hs-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .hs-divider::before,
        .hs-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .hs-divider span {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .hs-security-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .hs-security-row i { color: #10b981; }

        .hs-form-footer {
          text-align: center;
          margin-top: 14px;
          font-size: 0.82rem;
          color: #64748b;
        }

        .hs-form-footer button {
          background: none;
          border: none;
          color: #0ea5e9;
          font-weight: 700;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          padding: 0;
        }

        .hs-form-footer button:hover { text-decoration: underline; }

        .hs-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .hs-login-root { grid-template-columns: 1fr; }
          .hs-hero { display: none; }
          .hs-form-panel { padding: 40px 24px; }
        }
      `}</style>

      <div className="hs-login-root">
        {/* Left Hero Panel */}
        <div className="hs-hero">
          <div className="hs-hero-brand">
            <div className="hs-hero-logo">
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="hs-hero-brand-text">
              <h1>HospitalSync</h1>
              <span>Pro Healthcare Suite</span>
            </div>
          </div>

          <div className="hs-hero-content">
            <h2>
              Complete Hospital<br />
              <span className="accent">Management System</span>
            </h2>
            <p>
              Manage patients, doctors, appointments, billing, pharmacy, lab reports, and more — all from a single unified platform.
            </p>
            <div className="hs-stats-row">
              <div className="hs-stat">
                <div className="hs-stat-num">18+</div>
                <div className="hs-stat-label">Microservices</div>
              </div>
              <div className="hs-stat">
                <div className="hs-stat-num">8</div>
                <div className="hs-stat-label">Roles Supported</div>
              </div>
              <div className="hs-stat">
                <div className="hs-stat-num">100%</div>
                <div className="hs-stat-label">API Driven</div>
              </div>
            </div>
          </div>

          <div className="hs-hero-features">
            {['OPD / IPD Management', 'Electronic Medical Records', 'Pharmacy & Lab Integration', 'Real-time Billing & Payments', 'Role-based Access Control', 'HIPAA-Compliant Architecture'].map(f => (
              <div className="hs-feat" key={f}>
                <div className="hs-feat-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="hs-form-panel">
          <div className="hs-form-wrap">
            <div className="hs-form-header">
              <h2>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <p>
                {authMode === 'login'
                  ? 'Access your hospital management dashboard'
                  : 'Register to access the healthcare platform'}
              </p>
            </div>

            <div className="hs-tab-row">
              <button className={`hs-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Sign In</button>
              <button className={`hs-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>Register</button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} autoComplete="on">
                <div className="hs-field">
                  <label className="hs-label">Username / Email</label>
                  <input
                    className="hs-input"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">Password</label>
                  <div className="hs-input-wrap">
                    <input
                      className="hs-input has-icon"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                      required
                    />
                    <button type="button" className="hs-input-icon" onClick={() => setShowPassword(p => !p)}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1rem' }} />
                    </button>
                  </div>
                </div>

                <button className="hs-btn-primary" type="submit" disabled={loading}>
                  {loading ? <><div className="hs-spinner" /> Signing in...</> : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} autoComplete="on">
                <div className="hs-field">
                  <label className="hs-label">Full Name</label>
                  <input className="hs-input" type="text" placeholder="Dr. John Doe" value={signupData.name}
                    onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="hs-field">
                  <label className="hs-label">Username *</label>
                  <input className="hs-input" type="text" placeholder="johndoe" value={signupData.username}
                    onChange={e => setSignupData(p => ({ ...p, username: e.target.value }))} required />
                </div>
                <div className="hs-field">
                  <label className="hs-label">Email *</label>
                  <input className="hs-input" type="email" placeholder="john@hospital.com" value={signupData.email}
                    onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="hs-field">
                  <label className="hs-label">Role</label>
                  <select className="hs-select" value={signupData.role}
                    onChange={e => setSignupData(p => ({ ...p, role: e.target.value }))}>
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>
                <div className="hs-field">
                  <label className="hs-label">Password *</label>
                  <div className="hs-input-wrap">
                    <input className="hs-input has-icon" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={signupData.password} onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))} required />
                    <button type="button" className="hs-input-icon" onClick={() => setShowPassword(p => !p)}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1rem' }} />
                    </button>
                  </div>
                </div>
                <div className="hs-field">
                  <label className="hs-label">Confirm Password *</label>
                  <div className="hs-input-wrap">
                    <input className="hs-input has-icon" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password"
                      value={signupData.confirmPassword} onChange={e => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                    <button type="button" className="hs-input-icon" onClick={() => setShowConfirmPassword(p => !p)}>
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1rem' }} />
                    </button>
                  </div>
                </div>
                <button className="hs-btn-primary" type="submit" disabled={loading}>
                  {loading ? <><div className="hs-spinner" /> Creating account...</> : <><i className="bi bi-person-plus" /> Create Account</>}
                </button>
              </form>
            )}

            <div className="hs-divider"><span>secure access</span></div>

            <div className="hs-security-row">
              <i className="bi bi-shield-lock-fill" />
              <span>256-bit SSL encrypted · HIPAA Compliant · JWT Secured</span>
            </div>

            <div className="hs-form-footer">
              {authMode === 'login'
                ? <>Don't have an account? <button onClick={() => setAuthMode('signup')}>Register now</button></>
                : <>Already have an account? <button onClick={() => setAuthMode('login')}>Sign in</button></>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
