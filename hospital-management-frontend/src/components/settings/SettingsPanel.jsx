// import React, { useState } from 'react';
// import { toast } from 'react-toastify';

// function SettingsPanel() {
//   const [config, setConfig] = useState({
//     hospitalName: 'HospitalSync Medical Center',
//     tagline: 'Enterprise Operating Platform',
//     currency: '₹ (INR)',
//     timezone: 'Asia/Kolkata (UTC+05:30)',
//     smtpHost: 'smtp.hospitalsync.org',
//     smtpPort: '587',
//     enableSms: true,
//     enableEmail: true,
//     enablePush: true,
//     jwtExpiration: '86400',
//     maxLoginAttempts: '5',
//   });

//   const handleSave = (e) => {
//     e.preventDefault();
//     toast.success("System configurations saved successfully!");
//   };

//   return (
//     <div>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h4 className="fw-bold mb-1 text-dark">
//             <i className="bi bi-gear-fill text-primary me-2"></i>
//             System & Infrastructure Settings
//           </h4>
//           <p className="text-muted small mb-0">Global hospital operating configuration, notification channels, and security policy</p>
//         </div>
//         <button className="btn btn-primary" onClick={handleSave}>
//           <i className="bi bi-check-circle me-1"></i> Save Configuration
//         </button>
//       </div>

//       <div className="row g-4">
//         {/* General Hospital Config */}
//         <div className="col-12 col-lg-6">
//           <div className="card border-0 shadow-sm p-4 h-100">
//             <h6 className="fw-bold text-dark mb-3"><i className="bi bi-building me-2 text-primary"></i>General Hospital Settings</h6>
//             <div className="vstack gap-3">
//               <div>
//                 <label className="form-label small fw-semibold">Hospital Name</label>
//                 <input type="text" className="form-control" value={config.hospitalName} onChange={e => setConfig({ ...config, hospitalName: e.target.value })} />
//               </div>
//               <div>
//                 <label className="form-label small fw-semibold">System Tagline</label>
//                 <input type="text" className="form-control" value={config.tagline} onChange={e => setConfig({ ...config, tagline: e.target.value })} />
//               </div>
//               <div className="row g-2">
//                 <div className="col-6">
//                   <label className="form-label small fw-semibold">Currency</label>
//                   <select className="form-select" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })}>
//                     <option>₹ (INR)</option>
//                     <option>$ (USD)</option>
//                     <option>€ (EUR)</option>
//                   </select>
//                 </div>
//                 <div className="col-6">
//                   <label className="form-label small fw-semibold">Timezone</label>
//                   <input type="text" className="form-control" value={config.timezone} readOnly />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Notification Channels Config */}
//         <div className="col-12 col-lg-6">
//           <div className="card border-0 shadow-sm p-4 h-100">
//             <h6 className="fw-bold text-dark mb-3"><i className="bi bi-bell me-2 text-info"></i>Notification Channels</h6>
//             <div className="vstack gap-3">
//               <div className="form-check form-switch p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
//                 <div>
//                   <label className="form-check-label fw-semibold text-dark">Email Dispatcher (SMTP)</label>
//                   <div className="text-muted small">Send appointment & invoice PDF receipts via email</div>
//                 </div>
//                 <input className="form-check-input ms-0" type="checkbox" checked={config.enableEmail} onChange={e => setConfig({ ...config, enableEmail: e.target.checked })} />
//               </div>

//               <div className="form-check form-switch p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
//                 <div>
//                   <label className="form-check-label fw-semibold text-dark">SMS Gateway (Twilio/SMS API)</label>
//                   <div className="text-muted small">Send SMS reminders for appointments and lab reports</div>
//                 </div>
//                 <input className="form-check-input ms-0" type="checkbox" checked={config.enableSms} onChange={e => setConfig({ ...config, enableSms: e.target.checked })} />
//               </div>

//               <div className="form-check form-switch p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
//                 <div>
//                   <label className="form-check-label fw-semibold text-dark">In-App Push Alerts</label>
//                   <div className="text-muted small">Real-time bell notification drawer in Navbar</div>
//                 </div>
//                 <input className="form-check-input ms-0" type="checkbox" checked={config.enablePush} onChange={e => setConfig({ ...config, enablePush: e.target.checked })} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Security Policies */}
//         <div className="col-12">
//           <div className="card border-0 shadow-sm p-4">
//             <h6 className="fw-bold text-dark mb-3"><i className="bi bi-shield-lock me-2 text-success"></i>Security & Microservices Policy</h6>
//             <div className="row g-3">
//               <div className="col-md-4">
//                 <label className="form-label small fw-semibold">JWT Token Validity (Seconds)</label>
//                 <input type="text" className="form-control" value={config.jwtExpiration} onChange={e => setConfig({ ...config, jwtExpiration: e.target.value })} />
//               </div>
//               <div className="col-md-4">
//                 <label className="form-label small fw-semibold">Max Login Attempt Threshold</label>
//                 <input type="text" className="form-control" value={config.maxLoginAttempts} onChange={e => setConfig({ ...config, maxLoginAttempts: e.target.value })} />
//               </div>
//               <div className="col-md-4">
//                 <label className="form-label small fw-semibold">API Gateway URL</label>
//                 <input type="text" className="form-control" value="http://localhost:8080" readOnly />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SettingsPanel;






import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DEFAULT_CONFIG = {
  hospitalName: 'HospitalSync Medical Center',
  tagline: 'Enterprise Operating Platform',
  currency: '₹ (INR)',
  timezone: 'Asia/Kolkata (UTC+05:30)',
  smtpHost: 'smtp.hospitalsync.org',
  smtpPort: '587',
  enableSms: true,
  enableEmail: true,
  enablePush: true,
  jwtExpiration: '86400',
  maxLoginAttempts: '5',
};

function SettingsPanel() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('hs_system_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [saving, setSaving] = useState(false);

  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();

    setSaving(true);

    try {
      // Persist settings to localStorage for real cross-session persistence
      // Replace localStorage with real API call when settings endpoint is available
      localStorage.setItem('hs_system_config', JSON.stringify(config));
      toast.success('System configuration saved successfully!');
    } catch (error) {
      toast.error('Unable to save system configuration.');
    } finally {
      setSaving(false);
    }
  };

  const enabledChannels = [
    config.enableEmail,
    config.enableSms,
    config.enablePush
  ].filter(Boolean).length;

  return (
    <div
      className="settings-page"
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '28px'
      }}
    >
      <style>{`
        .settings-page {
          color: #172033;
        }

        .settings-header {
          background:
            radial-gradient(circle at 85% 20%, rgba(59,130,246,.18), transparent 30%),
            linear-gradient(135deg, #0f172a 0%, #172554 55%, #1d4ed8 100%);
          border-radius: 24px;
          padding: 28px;
          color: white;
          box-shadow: 0 18px 45px rgba(15, 23, 42, .16);
          position: relative;
          overflow: hidden;
        }

        .settings-header::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          right: -80px;
          top: -110px;
          background: rgba(255,255,255,.08);
        }

        .settings-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(12px);
        }

        .settings-card {
          background: rgba(255,255,255,.96);
          border: 1px solid #e8edf5;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(15,23,42,.055);
          transition: all .2s ease;
        }

        .settings-card:hover {
          box-shadow: 0 14px 35px rgba(15,23,42,.08);
        }

        .section-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-icon.blue {
          color: #2563eb;
          background: #eff6ff;
        }

        .section-icon.cyan {
          color: #0891b2;
          background: #ecfeff;
        }

        .section-icon.green {
          color: #059669;
          background: #ecfdf5;
        }

        .section-icon.purple {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .premium-label {
          font-size: .68rem;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 7px;
        }

        .premium-input,
        .premium-select {
          min-height: 46px;
          border-radius: 12px;
          border: 1px solid #dbe3ef;
          background: #fbfcfe;
          color: #172033;
          font-size: .9rem;
          padding-left: 14px;
          padding-right: 14px;
          transition: all .2s ease;
        }

        .premium-input:focus,
        .premium-select:focus {
          background: white;
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10);
        }

        .premium-input[readonly] {
          background: #f1f5f9;
          color: #64748b;
        }

        .channel-card {
          border: 1px solid #e5eaf2;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 16px;
          padding: 16px;
          transition: all .2s ease;
        }

        .channel-card:hover {
          border-color: #bfdbfe;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(15,23,42,.06);
        }

        .channel-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .channel-icon.email {
          color: #2563eb;
          background: #eff6ff;
        }

        .channel-icon.sms {
          color: #059669;
          background: #ecfdf5;
        }

        .channel-icon.push {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 4px rgba(16,185,129,.10);
        }

        .security-banner {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          padding: 15px 17px;
        }

        .metric-mini {
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e8edf5;
          padding: 12px 14px;
        }

        .save-button {
          min-height: 46px;
          border: 0;
          border-radius: 12px;
          padding: 0 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 8px 18px rgba(37,99,235,.22);
          transition: all .2s ease;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(37,99,235,.28);
        }

        .save-button:disabled {
          opacity: .7;
        }

        .form-switch .form-check-input {
          width: 2.8em;
          height: 1.5em;
          cursor: pointer;
          margin-top: 0;
        }

        .form-switch .form-check-input:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        @media (max-width: 768px) {
          .settings-page {
            padding: 16px;
          }

          .settings-header {
            padding: 22px;
            border-radius: 18px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="settings-header mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 position-relative" style={{ zIndex: 2 }}>
          <div className="d-flex align-items-start gap-3">
            <div className="settings-icon">
              <i className="bi bi-sliders2-vertical fs-4"></i>
            </div>

            <div>
              <div
                className="text-uppercase fw-bold mb-1"
                style={{
                  fontSize: '.68rem',
                  letterSpacing: '.12em',
                  color: '#93c5fd'
                }}
              >
                Administration Center
              </div>

              <h3 className="fw-bold mb-1" style={{ letterSpacing: '-.025em' }}>
                System Settings
              </h3>

              <p className="mb-0 text-white-50 small">
                Configure hospital operations, communication channels and security policies.
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{
                background: 'rgba(255,255,255,.10)',
                border: '1px solid rgba(255,255,255,.14)'
              }}
            >
              <span className="status-dot"></span>
              <span className="small fw-semibold">
                System Operational
              </span>
            </div>

            <button
              type="button"
              className="btn btn-light save-button d-flex align-items-center gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="metric-mini h-100 d-flex align-items-center gap-3">
            <div className="section-icon blue">
              <i className="bi bi-hospital"></i>
            </div>
            <div>
              <div className="text-muted small">Facility</div>
              <div className="fw-bold text-dark">{config.hospitalName}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="metric-mini h-100 d-flex align-items-center gap-3">
            <div className="section-icon cyan">
              <i className="bi bi-broadcast"></i>
            </div>
            <div>
              <div className="text-muted small">Active Channels</div>
              <div className="fw-bold text-dark">
                {enabledChannels} / 3 enabled
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="metric-mini h-100 d-flex align-items-center gap-3">
            <div className="section-icon green">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <div className="text-muted small">Security Status</div>
              <div className="fw-bold text-success">Protected</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4">

          {/* General Settings */}
          <div className="col-12 col-xl-6">
            <div className="settings-card p-4 h-100">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="section-icon blue">
                  <i className="bi bi-building fs-5"></i>
                </div>

                <div>
                  <h6 className="fw-bold mb-1">General Hospital Settings</h6>
                  <p className="text-muted small mb-0">
                    Identity and regional configuration
                  </p>
                </div>
              </div>

              <div className="vstack gap-3">
                <div>
                  <label className="premium-label">
                    Hospital Name
                  </label>

                  <input
                    type="text"
                    className="form-control premium-input"
                    value={config.hospitalName}
                    onChange={e =>
                      updateConfig('hospitalName', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="premium-label">
                    System Tagline
                  </label>

                  <input
                    type="text"
                    className="form-control premium-input"
                    value={config.tagline}
                    onChange={e =>
                      updateConfig('tagline', e.target.value)
                    }
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="premium-label">
                      Currency
                    </label>

                    <select
                      className="form-select premium-select"
                      value={config.currency}
                      onChange={e =>
                        updateConfig('currency', e.target.value)
                      }
                    >
                      <option>₹ (INR)</option>
                      <option>$ (USD)</option>
                      <option>€ (EUR)</option>
                      <option>£ (GBP)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="premium-label">
                      Timezone
                    </label>

                    <input
                      type="text"
                      className="form-control premium-input"
                      value={config.timezone}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="col-12 col-xl-6">
            <div className="settings-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon cyan">
                    <i className="bi bi-bell fs-5"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Notification Channels
                    </h6>
                    <p className="text-muted small mb-0">
                      Control automated communication
                    </p>
                  </div>
                </div>

                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                  {enabledChannels} Active
                </span>
              </div>

              <div className="vstack gap-3">

                {/* Email */}
                <div className="channel-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="channel-icon email">
                      <i className="bi bi-envelope fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">
                        Email Dispatcher
                      </div>

                      <div className="text-muted" style={{ fontSize: '.75rem' }}>
                        Appointment and invoice email delivery
                      </div>
                    </div>

                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.enableEmail}
                        onChange={e =>
                          updateConfig('enableEmail', e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* SMS */}
                <div className="channel-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="channel-icon sms">
                      <i className="bi bi-chat-square-text fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">
                        SMS Gateway
                      </div>

                      <div className="text-muted" style={{ fontSize: '.75rem' }}>
                        Appointment reminders and lab alerts
                      </div>
                    </div>

                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.enableSms}
                        onChange={e =>
                          updateConfig('enableSms', e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Push */}
                <div className="channel-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="channel-icon push">
                      <i className="bi bi-app-indicator fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">
                        In-App Push Alerts
                      </div>

                      <div className="text-muted" style={{ fontSize: '.75rem' }}>
                        Real-time dashboard and navbar notifications
                      </div>
                    </div>

                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.enablePush}
                        onChange={e =>
                          updateConfig('enablePush', e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="col-12">
            <div className="settings-card p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="section-icon purple">
                  <i className="bi bi-server fs-5"></i>
                </div>

                <div>
                  <h6 className="fw-bold mb-1">
                    Communication Infrastructure
                  </h6>
                  <p className="text-muted small mb-0">
                    Configure outbound messaging infrastructure
                  </p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-8">
                  <label className="premium-label">
                    SMTP Host
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-hdd-network text-muted"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control premium-input border-start-0"
                      value={config.smtpHost}
                      onChange={e =>
                        updateConfig('smtpHost', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="premium-label">
                    SMTP Port
                  </label>

                  <input
                    type="text"
                    className="form-control premium-input"
                    value={config.smtpPort}
                    onChange={e =>
                      updateConfig('smtpPort', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="col-12">
            <div className="settings-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="section-icon green">
                    <i className="bi bi-shield-lock fs-5"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Security & Access Policy
                    </h6>
                    <p className="text-muted small mb-0">
                      Authentication and microservice security controls
                    </p>
                  </div>
                </div>

                <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                  <i className="bi bi-shield-check me-1"></i>
                  Protected
                </span>
              </div>

              <div className="security-banner mb-4">
                <div className="d-flex gap-3 align-items-start">
                  <div className="text-success fs-5">
                    <i className="bi bi-lock-fill"></i>
                  </div>

                  <div>
                    <div className="fw-bold small text-success">
                      Security controls are active
                    </div>

                    <div
                      className="text-success-emphasis small mt-1"
                      style={{ opacity: .8 }}
                    >
                      JWT authentication and login-attempt protection
                      are configured for this environment.
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="premium-label">
                    JWT Token Validity
                  </label>

                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control premium-input"
                      value={config.jwtExpiration}
                      onChange={e =>
                        updateConfig('jwtExpiration', e.target.value)
                      }
                    />

                    <span className="input-group-text bg-white border-start-0 text-muted">
                      sec
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="premium-label">
                    Max Login Attempts
                  </label>

                  <input
                    type="number"
                    min="1"
                    className="form-control premium-input"
                    value={config.maxLoginAttempts}
                    onChange={e =>
                      updateConfig('maxLoginAttempts', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="premium-label">
                    API Gateway
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-link-45deg text-muted"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control premium-input border-start-0"
                      value="http://localhost:8080"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Save Bar */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4 p-3 rounded-4 bg-white border shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
                background: '#ecfdf5',
                color: '#059669'
              }}
            >
              <i className="bi bi-check-lg"></i>
            </div>

            <div>
              <div className="fw-bold small">
                Configuration ready
              </div>
              <div className="text-muted" style={{ fontSize: '.72rem' }}>
                Review your changes before saving.
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light border rounded-3 px-4"
              onClick={() => window.location.reload()}
            >
              Reset
            </button>

            <button
              type="submit"
              className="btn btn-primary save-button d-flex align-items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up"></i>
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SettingsPanel;
