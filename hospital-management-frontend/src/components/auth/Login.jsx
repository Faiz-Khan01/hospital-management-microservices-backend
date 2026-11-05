import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  springSmooth,
  springSnappy,
  staggerContainer,
  staggerItem,
  tabIndicator
} from '../../animations/motionConfig';

function Login({ onLogin, onExploreShowcase }) {
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const triggerErrorShake = () => {
    setHasError(true);
    setTimeout(() => setHasError(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password) {
      triggerErrorShake();
      toast.warning('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await AuthService.login(credentials);
      toast.success('Welcome back! Redirecting to dashboard...');
      onLogin();
    } catch (err) {
      triggerErrorShake();
      const message = err.response?.data?.message || 'Invalid username or password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signupData.username.trim() || !signupData.email.trim() || !signupData.password) {
      triggerErrorShake();
      toast.warning('Please fill in all required fields.');
      return;
    }
    if (signupData.password.length < 6) {
      triggerErrorShake();
      toast.warning('Password must be at least 6 characters.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      triggerErrorShake();
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
      triggerErrorShake();
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const heroFeatures = [
    { label: 'OPD / IPD Management', icon: 'bi-hospital' },
    { label: 'Electronic Medical Records (EMR)', icon: 'bi-file-earmark-medical' },
    { label: 'Pharmacy & Smart Diagnostics', icon: 'bi-capsule' },
    { label: 'Real-time Billing & Telemetry', icon: 'bi-receipt-cutoff' },
    { label: 'Role-based Access Control (RBAC)', icon: 'bi-shield-check' },
    { label: 'HIPAA & ABDM Compliant Architecture', icon: 'bi-patch-check-fill' }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .hs-login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: #f8fafc;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Left Hero Panel ── */
        .hs-hero {
          background: radial-gradient(circle at 10% 20%, #0d1b2a 0%, #09131f 45%, #050a11 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 64px;
          color: #fff;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        /* Ambient floating glow orbs */
        .hs-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .hs-glow-orb.orb-1 {
          width: 480px;
          height: 480px;
          top: -120px;
          left: -100px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(3, 105, 161, 0.15) 70%, transparent 100%);
        }

        .hs-glow-orb.orb-2 {
          width: 520px;
          height: 520px;
          bottom: -150px;
          right: -80px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.12) 70%, transparent 100%);
        }

        .hs-glow-orb.orb-3 {
          width: 320px;
          height: 320px;
          top: 45%;
          left: 40%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%);
        }

        /* Subtle cyber grid backdrop */
        .hs-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at 50% 50%, #000 60%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Brand Header */
        .hs-hero-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .hs-hero-logo {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 60%, #7c3aed 100%);
          border-radius: 14px;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 28px rgba(14, 165, 233, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          position: relative;
        }

        .hs-hero-logo svg {
          width: 28px;
          height: 28px;
          stroke: #fff;
          fill: none;
        }

        .hs-hero-brand-text h1 {
          font-size: 1.45rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.03em;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hs-hero-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hs-hero-brand-text span {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.75);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-top: 2px;
        }

        /* Hero Content */
        .hs-hero-content {
          position: relative;
          z-index: 2;
          margin: 36px 0;
        }

        .hs-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #7dd3fc;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        .hs-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
        }

        .hs-hero-content h2 {
          font-size: 2.85rem;
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -0.04em;
          margin-bottom: 18px;
          color: #fff;
        }

        .hs-hero-content h2 .accent-gradient {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .hs-hero-content p {
          font-size: 1.05rem;
          color: rgba(226, 232, 240, 0.82);
          line-height: 1.65;
          max-width: 480px;
          margin-bottom: 32px;
        }

        /* Stats Row */
        .hs-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 500px;
        }

        .hs-stat-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 18px 16px;
          backdrop-filter: blur(16px);
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .hs-stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.7), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .hs-stat-card:hover::after {
          opacity: 1;
        }

        .hs-stat-num {
          font-size: 1.85rem;
          font-weight: 900;
          color: #38bdf8;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .hs-stat-num.purple { color: #c084fc; }
        .hs-stat-num.emerald { color: #34d399; }

        .hs-stat-label {
          font-size: 0.76rem;
          color: rgba(226, 232, 240, 0.7);
          margin-top: 6px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Features List */
        .hs-hero-features {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 520px;
        }

        .hs-feat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(241, 245, 249, 0.9);
          backdrop-filter: blur(8px);
        }

        .hs-feat-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          display: grid;
          place-items: center;
          font-size: 0.78rem;
          flex-shrink: 0;
        }

        .hs-showcase-btn {
          margin-top: 24px;
          padding: 12px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(168, 85, 247, 0.18));
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }

        .hs-showcase-btn:hover {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.32), rgba(168, 85, 247, 0.32));
          border-color: rgba(56, 189, 248, 0.6);
          box-shadow: 0 12px 30px rgba(14, 165, 233, 0.3);
        }

        /* ── Right Form Panel ── */
        .hs-form-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 64px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          position: relative;
          z-index: 2;
        }

        .hs-form-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.07), 0 4px 16px rgba(15, 23, 42, 0.03);
          border-radius: 24px;
          padding: 40px;
          position: relative;
        }

        .hs-form-header {
          margin-bottom: 28px;
          text-align: center;
        }

        .hs-form-header h2 {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
        }

        .hs-form-header p {
          font-size: 0.92rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        /* Animated Tab Slider */
        .hs-tab-row {
          display: flex;
          background: #f1f5f9;
          border-radius: 14px;
          padding: 5px;
          margin-bottom: 28px;
          position: relative;
        }

        .hs-tab-btn {
          flex: 1;
          padding: 11px 16px;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          color: #64748b;
          font-family: inherit;
          position: relative;
          z-index: 2;
          transition: color 0.2s ease;
        }

        .hs-tab-btn.active {
          color: #0f172a;
        }

        .hs-tab-active-pill {
          position: absolute;
          inset: 5px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
          z-index: 1;
        }

        /* Form Inputs */
        .hs-field {
          margin-bottom: 18px;
        }

        .hs-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 7px;
          letter-spacing: 0.01em;
        }

        .hs-input-wrap {
          position: relative;
        }

        .hs-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.92rem;
          font-family: inherit;
          color: #0f172a;
          background: #f8fafc;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }

        .hs-input:focus {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
        }

        .hs-input.has-icon {
          padding-right: 46px;
        }

        .hs-input-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #94a3b8;
          border: none;
          background: none;
          padding: 6px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .hs-input-icon:hover {
          color: #0284c7;
        }

        .hs-select {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.92rem;
          font-family: inherit;
          color: #0f172a;
          background: #f8fafc;
          appearance: none;
          outline: none;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hs-select:focus {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
        }

        /* Primary Action Button */
        .hs-btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e40af 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.98rem;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          letter-spacing: 0.01em;
          box-shadow: 0 10px 24px rgba(2, 132, 199, 0.35);
          position: relative;
          overflow: hidden;
        }

        .hs-btn-primary:hover:not(:disabled) {
          box-shadow: 0 14px 32px rgba(2, 132, 199, 0.45);
        }

        .hs-btn-primary:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .hs-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0 16px;
        }

        .hs-divider::before,
        .hs-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .hs-divider span {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .hs-security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-align: center;
        }

        .hs-security-badge i {
          color: #10b981;
          font-size: 0.9rem;
        }

        .hs-form-footer {
          text-align: center;
          margin-top: 18px;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .hs-form-footer button {
          background: none;
          border: none;
          color: #0284c7;
          font-weight: 800;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          padding: 0 4px;
          transition: color 0.2s;
        }

        .hs-form-footer button:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        .hs-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .hs-login-root {
            grid-template-columns: 1fr;
          }
          .hs-hero {
            padding: 40px 28px;
          }
          .hs-form-panel {
            padding: 40px 24px;
          }
        }
      `}</style>

      <div className="hs-login-root">
        {/* Left Hero Panel with Ambient Motion */}
        <div className="hs-hero">
          {/* Animated Glow Orbs (with reduced motion support) */}
          <motion.div
            className="hs-glow-orb orb-1"
            animate={shouldReduceMotion ? { opacity: 0.4 } : {
              x: [0, 40, -30, 0],
              y: [0, -35, 25, 0],
              scale: [1, 1.12, 0.92, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="hs-glow-orb orb-2"
            animate={shouldReduceMotion ? { opacity: 0.3 } : {
              x: [0, -40, 30, 0],
              y: [0, 40, -30, 0],
              scale: [1, 0.88, 1.15, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="hs-glow-orb orb-3"
            animate={shouldReduceMotion ? { opacity: 0.2 } : {
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="hs-grid-overlay" />

          {/* Brand Header */}
          <motion.div
            className="hs-hero-brand"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSmooth}
          >
            <motion.div
              className="hs-hero-logo"
              whileHover={{ rotate: 10, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </motion.div>
            <div className="hs-hero-brand-text">
              <h1>
                HospitalSync
                <span className="hs-hero-badge">v3.0 Live</span>
              </h1>
              <span>Pro Healthcare Suite &bull; Enterprise Operating Platform</span>
            </div>
          </motion.div>

          {/* Main Hero Content */}
          <motion.div
            className="hs-hero-content"
            variants={staggerContainer(0.09, 0.15)}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem}>
              <div className="hs-hero-pill">
                <span className="hs-pill-dot" />
                <span>Next-Gen Microservices Architecture &bull; Sub-12ms Latency</span>
              </div>
            </motion.div>

            <motion.h2 variants={staggerItem}>
              Complete Hospital<br />
              <span className="accent-gradient">Management System</span>
            </motion.h2>

            <motion.p variants={staggerItem}>
              Manage patients, doctors, appointments, billing, pharmacy, lab reports, and more — all from a single unified platform.
            </motion.p>

            {/* Metric KPI Cards */}
            <motion.div className="hs-stats-row" variants={staggerItem}>
              <motion.div
                className="hs-stat-card"
                whileHover={{ y: -6, scale: 1.04, boxShadow: '0 16px 36px rgba(14, 165, 233, 0.28)' }}
                transition={springSnappy}
              >
                <div className="hs-stat-num">18+</div>
                <div className="hs-stat-label">Microservices</div>
              </motion.div>

              <motion.div
                className="hs-stat-card"
                whileHover={{ y: -6, scale: 1.04, boxShadow: '0 16px 36px rgba(192, 132, 252, 0.28)' }}
                transition={springSnappy}
              >
                <div className="hs-stat-num purple">8</div>
                <div className="hs-stat-label">Roles Supported</div>
              </motion.div>

              <motion.div
                className="hs-stat-card"
                whileHover={{ y: -6, scale: 1.04, boxShadow: '0 16px 36px rgba(52, 211, 153, 0.28)' }}
                transition={springSnappy}
              >
                <div className="hs-stat-num emerald">100%</div>
                <div className="hs-stat-label">API Driven</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom Features Matrix */}
          <motion.div
            className="hs-hero-features"
            variants={staggerContainer(0.06, 0.35)}
            initial="initial"
            animate="animate"
          >
            {heroFeatures.map(f => (
              <motion.div
                className="hs-feat-item"
                key={f.label}
                variants={staggerItem}
                whileHover={{ x: 4, background: 'rgba(255, 255, 255, 0.08)' }}
                transition={springSmooth}
              >
                <div className="hs-feat-icon">
                  <i className={`bi ${f.icon}`} />
                </div>
                <span>{f.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {onExploreShowcase && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ...springSmooth }}
            >
              <motion.button
                type="button"
                className="hs-showcase-btn"
                onClick={onExploreShowcase}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="bi bi-diagram-3-fill text-info" />
                <span>Explore 3D Microservices & Topology</span>
                <i className="bi bi-arrow-right" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Right Form Panel */}
        <div className="hs-form-panel">
          <motion.div
            className="hs-form-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springSmooth}
          >
            <div className="hs-form-header">
              <h2>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <p>
                {authMode === 'login'
                  ? 'Access your hospital management dashboard'
                  : 'Register to access the healthcare platform'}
              </p>
            </div>

            {onExploreShowcase && (
              <motion.div
                style={{ marginBottom: '20px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={onExploreShowcase}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(14, 165, 233, 0.3)',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(168, 85, 247, 0.08))',
                    color: '#0284c7',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="bi bi-badge-3d-fill fs-6" />
                  <span>View Interactive 3D Platform Architecture</span>
                  <i className="bi bi-arrow-right" />
                </button>
              </motion.div>
            )}

            {/* Sliding Pill Tabs */}
            <div className="hs-tab-row">
              {['login', 'signup'].map((mode) => {
                const isActive = authMode === mode;
                const label = mode === 'login' ? 'Sign In' : 'Register';
                return (
                  <button
                    key={mode}
                    type="button"
                    className={`hs-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setAuthMode(mode)}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="hsAuthTabActive"
                        className="hs-tab-active-pill"
                        transition={tabIndicator}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 3 }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form with Smooth Crossfade Transition */}
            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.form
                  key="hs-login-form"
                  onSubmit={handleLogin}
                  autoComplete="on"
                  initial={{ opacity: 0, x: -16 }}
                  animate={hasError && !shouldReduceMotion ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={hasError ? { duration: 0.45 } : springSmooth}
                >
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
                      <motion.button
                        type="button"
                        className="hs-input-icon"
                        onClick={() => setShowPassword(p => !p)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        transition={springSnappy}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <motion.i
                          key={showPassword ? 'eye-off' : 'eye-on'}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={springSnappy}
                          className={`bi ${showPassword ? 'bi-eye-slash-fill text-primary' : 'bi-eye-fill'}`}
                          style={{ fontSize: '1.05rem' }}
                        />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    className="hs-btn-primary"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.015, translateY: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={springSnappy}
                  >
                    {loading ? (
                      <>
                        <div className="hs-spinner" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right fs-6" />
                        <span>Sign In</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="hs-signup-form"
                  onSubmit={handleSignUp}
                  autoComplete="on"
                  initial={{ opacity: 0, x: 16 }}
                  animate={hasError && !shouldReduceMotion ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={hasError ? { duration: 0.45 } : springSmooth}
                >
                  <div className="hs-field">
                    <label className="hs-label">Full Name</label>
                    <input
                      className="hs-input"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={signupData.name}
                      onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="hs-field">
                    <label className="hs-label">Username *</label>
                    <input
                      className="hs-input"
                      type="text"
                      placeholder="johndoe"
                      value={signupData.username}
                      onChange={e => setSignupData(p => ({ ...p, username: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="hs-field">
                    <label className="hs-label">Email Address *</label>
                    <input
                      className="hs-input"
                      type="email"
                      placeholder="john@hospital.com"
                      value={signupData.email}
                      onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="hs-field">
                    <label className="hs-label">Account Role</label>
                    <select
                      className="hs-select"
                      value={signupData.role}
                      onChange={e => setSignupData(p => ({ ...p, role: e.target.value }))}
                    >
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
                      <input
                        className="hs-input has-icon"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={signupData.password}
                        onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                        required
                      />
                      <motion.button
                        type="button"
                        className="hs-input-icon"
                        onClick={() => setShowPassword(p => !p)}
                        whileTap={{ scale: 0.8 }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} style={{ fontSize: '1.05rem' }} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="hs-field">
                    <label className="hs-label">Confirm Password *</label>
                    <div className="hs-input-wrap">
                      <input
                        className="hs-input has-icon"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={signupData.confirmPassword}
                        onChange={e => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))}
                        required
                      />
                      <motion.button
                        type="button"
                        className="hs-input-icon"
                        onClick={() => setShowConfirmPassword(p => !p)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        transition={springSnappy}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        <motion.i
                          key={showConfirmPassword ? 'conf-off' : 'conf-on'}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={springSnappy}
                          className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill text-primary' : 'bi-eye-fill'}`}
                          style={{ fontSize: '1.05rem' }}
                        />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    className="hs-btn-primary"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.015, translateY: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={springSnappy}
                  >
                    {loading ? (
                      <>
                        <div className="hs-spinner" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill fs-6" />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="hs-divider">
              <span>Secure Healthcare Access</span>
            </div>

            <div className="hs-security-badge">
              <i className="bi bi-shield-check" />
              <span>256-bit SSL encrypted &bull; HIPAA Compliant &bull; JWT Secured</span>
            </div>

            <div className="hs-form-footer">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setAuthMode('signup')}>
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setAuthMode('login')}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Login;
