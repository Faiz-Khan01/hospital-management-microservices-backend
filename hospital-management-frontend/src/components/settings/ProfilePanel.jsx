import React, { useMemo, useState } from 'react';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';
import { toast } from 'react-toastify';

function ProfilePanel() {
  const username = AuthService.getUsername() || 'Admin User';
  const role = AuthService.getRole() || 'ADMIN';
  const userId = AuthService.getUserId?.() || 1;

  const [profile, setProfile] = useState({
    name: username,
    email: localStorage.getItem('email') || '',
    phone: '',
    department: '',
    role,
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await UserService.updateProfile(userId, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        bio: profile.bio,
        role: profile.role
      });
      localStorage.setItem('username', profile.name);
      if (profile.role) {
        localStorage.setItem('role', profile.role);
      }
      toast.success('Profile updated successfully!');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      localStorage.setItem('username', profile.name);
      if (profile.role) {
        localStorage.setItem('role', profile.role);
      }
      toast.info('Profile saved! Refreshing...');
      setTimeout(() => window.location.reload(), 800);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (profile.newPassword !== profile.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (profile.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setChangingPwd(true);
    try {
      await UserService.changePassword(userId, {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });
      toast.success('Password changed successfully!');
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setChangingPwd(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const password = profile.newPassword;

    if (!password) {
      return {
        label: 'Enter a password',
        color: '#94a3b8',
        width: '0%'
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: 'Weak password',
        color: '#ef4444',
        width: '25%'
      };
    }

    if (score === 2) {
      return {
        label: 'Fair password',
        color: '#f59e0b',
        width: '50%'
      };
    }

    if (score === 3) {
      return {
        label: 'Good password',
        color: '#0ea5e9',
        width: '75%'
      };
    }

    return {
      label: 'Strong password',
      color: '#10b981',
      width: '100%'
    };
  }, [profile.newPassword]);

  const initials = profile.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'AD';

  return (
    <div
      className="profile-page"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(59,130,246,.08), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '24px'
      }}
    >
      <style>
        {`
          .profile-page {
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .premium-card {
            background: rgba(255,255,255,.88);
            border: 1px solid rgba(226,232,240,.85);
            box-shadow:
              0 20px 45px rgba(15,23,42,.06),
              0 2px 8px rgba(15,23,42,.03);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-radius: 22px;
          }

          .profile-hero {
            position: relative;
            overflow: hidden;
            border-radius: 24px;
            background:
              radial-gradient(circle at 85% 15%, rgba(255,255,255,.28), transparent 25%),
              radial-gradient(circle at 10% 90%, rgba(255,255,255,.15), transparent 30%),
              linear-gradient(135deg, #0f766e 0%, #0284c7 48%, #4f46e5 100%);
            box-shadow: 0 20px 45px rgba(15,23,42,.12);
          }

          .profile-hero::after {
            content: "";
            position: absolute;
            width: 220px;
            height: 220px;
            right: -80px;
            top: -90px;
            border-radius: 50%;
            background: rgba(255,255,255,.08);
          }

          .avatar-premium {
            width: 92px;
            height: 92px;
            border-radius: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(145deg, rgba(255,255,255,.30), rgba(255,255,255,.10));
            border: 1px solid rgba(255,255,255,.35);
            box-shadow:
              0 15px 30px rgba(15,23,42,.18),
              inset 0 1px 1px rgba(255,255,255,.3);
            backdrop-filter: blur(12px);
          }

          .section-title {
            font-size: .95rem;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -.01em;
          }

          .section-subtitle {
            font-size: .78rem;
            color: #64748b;
          }

          .premium-label {
            font-size: .72rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 7px;
            letter-spacing: .02em;
          }

          .premium-input,
          .premium-select,
          .premium-textarea {
            border: 1px solid #e2e8f0;
            background: rgba(248,250,252,.72);
            border-radius: 12px;
            min-height: 44px;
            font-size: .88rem;
            color: #0f172a;
            transition: all .2s ease;
          }

          .premium-input:focus,
          .premium-select:focus,
          .premium-textarea:focus {
            background: #fff;
            border-color: #38bdf8;
            box-shadow: 0 0 0 4px rgba(14,165,233,.10);
          }

          .premium-textarea {
            min-height: 100px;
          }

          .input-icon {
            color: #64748b;
            background: #f8fafc;
            border-color: #e2e8f0;
            border-radius: 12px 0 0 12px;
          }

          .input-with-icon {
            border-left: 0;
            border-radius: 0 12px 12px 0;
          }

          .info-row {
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
          }

          .info-row:last-child {
            border-bottom: 0;
          }

          .security-item {
            padding: 12px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #eef2f7;
          }

          .security-icon {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .premium-btn {
            border-radius: 12px;
            padding: 10px 17px;
            font-size: .84rem;
            font-weight: 700;
            border: 0;
            transition: all .2s ease;
          }

          .premium-btn:hover {
            transform: translateY(-1px);
          }

          .btn-gradient {
            color: white;
            background: linear-gradient(135deg, #0284c7, #4f46e5);
            box-shadow: 0 8px 18px rgba(37,99,235,.18);
          }

          .btn-gradient:hover {
            color: white;
            box-shadow: 0 12px 24px rgba(37,99,235,.25);
          }

          .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 11px;
            border-radius: 999px;
            font-size: .72rem;
            font-weight: 700;
          }

          .online-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 0 4px rgba(34,197,94,.12);
          }

          .password-meter {
            height: 5px;
            background: #e2e8f0;
            border-radius: 999px;
            overflow: hidden;
          }

          .password-meter-fill {
            height: 100%;
            border-radius: inherit;
            transition: all .25s ease;
          }

          @media (max-width: 767px) {
            .profile-page {
              padding: 14px;
            }

            .profile-hero {
              border-radius: 18px;
            }

            .premium-card {
              border-radius: 18px;
            }

            .avatar-premium {
              width: 72px;
              height: 72px;
              border-radius: 22px;
              font-size: 23px;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 text-muted mb-2" style={{ fontSize: '.75rem' }}>
            <i className="bi bi-house-door"></i>
            <span>Settings</span>
            <i className="bi bi-chevron-right" style={{ fontSize: '.65rem' }}></i>
            <span className="text-primary fw-semibold">Profile</span>
          </div>

          <h3
            className="fw-bold mb-1"
            style={{
              color: '#0f172a',
              letterSpacing: '-.035em'
            }}
          >
            Profile & Security
          </h3>

          <p className="text-muted small mb-0">
            Manage your professional identity and account security.
          </p>
        </div>

        <div
          className="status-pill"
          style={{
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #d1fae5'
          }}
        >
          <span className="online-dot"></span>
          {AuthService.isDemoMode() ? 'Demo Session' : 'Verified Staff Account'}
        </div>
      </div>

      {/* Premium Profile Hero */}
      <div className="profile-hero p-4 p-md-5 mb-4 text-white">
        <div className="position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-4">
            <div className="col-auto">
              <div className="avatar-premium">
                {initials}
              </div>
            </div>

            <div className="col">
              <div
                className="text-uppercase fw-bold mb-1"
                style={{
                  fontSize: '.68rem',
                  letterSpacing: '.13em',
                  opacity: .7
                }}
              >
                HospitalSync Identity
              </div>

              <h4 className="fw-bold mb-1">
                {profile.name}
              </h4>

              <div
                className="d-flex flex-wrap align-items-center gap-2"
                style={{ opacity: .86 }}
              >
                <span>{profile.department}</span>
                <span>•</span>
                <span>{role}</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    border: '1px solid rgba(255,255,255,.18)'
                  }}
                >
                  <i className="bi bi-shield-check me-1"></i>
                  Tier 1 Access
                </span>

                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    border: '1px solid rgba(255,255,255,.18)'
                  }}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Account Active
                </span>
              </div>
            </div>

            <div className="col-12 col-md-auto">
              <div
                className="p-3 rounded-4"
                style={{
                  background: 'rgba(255,255,255,.10)',
                  border: '1px solid rgba(255,255,255,.14)',
                  minWidth: 190
                }}
              >
                <div
                  className="small mb-1"
                  style={{ opacity: .65 }}
                >
                  ACCOUNT ROLE
                </div>

                <div className="fw-bold">
                  {role}
                </div>

                <div
                  className="small mt-2"
                  style={{ opacity: .7 }}
                >
                  <i className="bi bi-lock-fill me-1"></i>
                  Protected account
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT */}
        <div className="col-12 col-xl-4">
          <div className="premium-card p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="security-icon"
                style={{
                  background: '#eff6ff',
                  color: '#2563eb'
                }}
              >
                <i className="bi bi-person-vcard"></i>
              </div>

              <div>
                <div className="section-title">
                  Account Overview
                </div>
                <div className="section-subtitle">
                  Your current account information
                </div>
              </div>
            </div>

            <div className="info-row">
              <div className="text-muted small mb-1">
                Full Name
              </div>
              <div className="fw-semibold text-dark">
                {profile.name}
              </div>
            </div>

            <div className="info-row">
              <div className="text-muted small mb-1">
                Email Address
              </div>
              <div className="fw-semibold text-dark text-break">
                {profile.email}
              </div>
            </div>

            <div className="info-row">
              <div className="text-muted small mb-1">
                Phone Number
              </div>
              <div className="fw-semibold text-dark">
                {profile.phone}
              </div>
            </div>

            <div className="info-row">
              <div className="text-muted small mb-1">
                Department
              </div>
              <div className="fw-semibold text-dark">
                {profile.department}
              </div>
            </div>

            <div className="info-row">
              <div className="text-muted small mb-1">
                Access Level
              </div>

              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge rounded-pill"
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #d1fae5'
                  }}
                >
                  <i className="bi bi-shield-fill-check me-1"></i>
                  Tier 1
                </span>

                <span className="text-muted small">
                  Full Access
                </span>
              </div>
            </div>

            <div
              className="mt-4 p-3 rounded-4"
              style={{
                background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)',
                border: '1px solid #dbeafe'
              }}
            >
              <div className="d-flex gap-3">
                <div
                  className="security-icon flex-shrink-0"
                  style={{
                    background: 'white',
                    color: '#0f766e'
                  }}
                >
                  <i className="bi bi-shield-check"></i>
                </div>

                <div>
                  <div className="fw-bold small text-dark">
                    Security status
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '.72rem' }}>
                    Your account is currently active and protected by HospitalSync authentication controls.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-12 col-xl-8">
          {/* Personal Information */}
          <div className="premium-card p-4 p-md-5 mb-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="security-icon"
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb'
                  }}
                >
                  <i className="bi bi-pencil-square"></i>
                </div>

                <div>
                  <div className="section-title">
                    Personal Information
                  </div>
                  <div className="section-subtitle">
                    Keep your professional profile up to date.
                  </div>
                </div>
              </div>

              <span
                className="badge rounded-pill d-none d-sm-inline-flex"
                style={{
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0'
                }}
              >
                Editable
              </span>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="premium-label">
                    FULL NAME
                  </label>

                  <div className="input-group">
                    <span className="input-group-text input-icon">
                      <i className="bi bi-person"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control premium-input input-with-icon"
                      value={profile.name}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          name: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="premium-label">
                    EMAIL ADDRESS
                  </label>

                  <div className="input-group">
                    <span className="input-group-text input-icon">
                      <i className="bi bi-envelope"></i>
                    </span>

                    <input
                      type="email"
                      className="form-control premium-input input-with-icon"
                      value={profile.email}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          email: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="premium-label">
                    PHONE NUMBER
                  </label>

                  <div className="input-group">
                    <span className="input-group-text input-icon">
                      <i className="bi bi-telephone"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control premium-input input-with-icon"
                      value={profile.phone}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          phone: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="premium-label">
                    CLINICAL DEPARTMENT
                  </label>

                  <div className="input-group">
                    <span className="input-group-text input-icon">
                      <i className="bi bi-building"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control premium-input input-with-icon"
                      value={profile.department}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          department: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="premium-label">
                    ACCOUNT DESIGNATION / ROLE
                  </label>

                  <div className="input-group">
                    <span className="input-group-text input-icon">
                      <i className="bi bi-person-badge"></i>
                    </span>

                    <select
                      className="form-select premium-input input-with-icon"
                      value={profile.role || role}
                      onChange={e =>
                        setProfile({
                          ...profile,
                          role: e.target.value
                        })
                      }
                    >
                      <option value="DOCTOR">Doctor / Physician</option>
                      <option value="PATIENT">Patient</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="NURSE">Nurse</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="LAB_TECHNICIAN">Lab Technician</option>
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <label className="premium-label">
                    PROFESSIONAL BIO
                  </label>

                  <textarea
                    className="form-control premium-textarea"
                    rows={3}
                    value={profile.bio}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        bio: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="premium-btn btn-gradient"
                >
                  <i className="bi bi-check2-circle me-2"></i>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password */}
          <div className="premium-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="security-icon"
                style={{
                  background: '#fff7ed',
                  color: '#ea580c'
                }}
              >
                <i className="bi bi-shield-lock"></i>
              </div>

              <div>
                <div className="section-title">
                  Security & Password
                </div>
                <div className="section-subtitle">
                  Protect your account with a strong password.
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-4 mb-4"
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a'
              }}
            >
              <div className="d-flex gap-3">
                <i
                  className="bi bi-info-circle-fill"
                  style={{
                    color: '#d97706',
                    fontSize: '1rem'
                  }}
                ></i>

                <div className="small text-dark">
                  Use at least 8 characters with a mix of uppercase letters,
                  numbers, and special characters.
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="premium-label">
                    CURRENT PASSWORD
                  </label>

                  <input
                    type="password"
                    className="form-control premium-input"
                    placeholder="Current password"
                    value={profile.currentPassword}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        currentPassword: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="premium-label">
                    NEW PASSWORD
                  </label>

                  <input
                    type="password"
                    className="form-control premium-input"
                    placeholder="Create new password"
                    value={profile.newPassword}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        newPassword: e.target.value
                      })
                    }
                    required
                  />

                  <div className="mt-2">
                    <div className="password-meter">
                      <div
                        className="password-meter-fill"
                        style={{
                          width: passwordStrength.width,
                          background: passwordStrength.color
                        }}
                      />
                    </div>

                    <div
                      className="d-flex justify-content-between mt-1"
                      style={{
                        fontSize: '.68rem',
                        color: passwordStrength.color
                      }}
                    >
                      <span>{passwordStrength.label}</span>
                      <span>8+ characters</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="premium-label">
                    CONFIRM PASSWORD
                  </label>

                  <input
                    type="password"
                    className="form-control premium-input"
                    placeholder="Repeat new password"
                    value={profile.confirmPassword}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        confirmPassword: e.target.value
                      })
                    }
                    required
                  />

                  {profile.confirmPassword && (
                    <div
                      className="mt-2"
                      style={{
                        fontSize: '.68rem',
                        color:
                          profile.newPassword === profile.confirmPassword
                            ? '#059669'
                            : '#dc2626'
                      }}
                    >
                      <i
                        className={`bi ${
                          profile.newPassword === profile.confirmPassword
                            ? 'bi-check-circle-fill'
                            : 'bi-exclamation-circle-fill'
                        } me-1`}
                      ></i>

                      {profile.newPassword === profile.confirmPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="premium-btn"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    color: '#fff',
                    boxShadow: '0 8px 18px rgba(234,88,12,.18)'
                  }}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Security Note */}
      <div className="text-center mt-4">
        <small className="text-muted">
          <i className="bi bi-lock-fill me-1"></i>
          Your account security is protected by HospitalSync authentication controls.
        </small>
      </div>
    </div>
  );
}

export default ProfilePanel;
