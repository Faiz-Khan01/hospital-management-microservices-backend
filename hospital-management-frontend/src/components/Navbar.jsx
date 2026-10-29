import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../services/RealtimeNotificationHub';
import EmergencyTriageModal from './emergency/EmergencyTriageModal';
import { toast } from 'react-toastify';

function Navbar({ toggleSidebar, activeTab, setActiveTab, onSearch, darkMode, toggleDarkMode, beds = [], doctors = [], onDataRefresh }) {
  const username = AuthService.getUsername() || 'Admin User';
  const role = String(AuthService.getRole() || 'ADMIN').replace(/^ROLE_/, '').toUpperCase();
  const userId = AuthService.getUserId?.() || 1;

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const profileRef = useRef(null);
  const backendDeniedRef = useRef(false);

  const fetchNotifications = useCallback(() => {
    // 1. Get stored local realtime notifications first
    const stored = RealtimeNotificationHub.getStoredNotifications().filter(n =>
      RealtimeNotificationHub.isForCurrentRole(n)
    );

    const isDemo = localStorage.getItem("is_demo_mode") === "true";
    const token = localStorage.getItem("token");
    const isBackendDisabled = localStorage.getItem("notifications_backend_disabled") === "true";
    if (isDemo || !token || token.startsWith("demo-") || backendDeniedRef.current || isBackendDisabled) {
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
      return;
    }

    if (!userId) {
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
      return;
    }

    NotificationService.getUserNotifications(userId)
      .then(res => {
        const payload = res.data?.data || res.data;
        const backendData = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : [];
        
        // Merge without duplicates
        const combined = [...stored];
        backendData.forEach(bn => {
          if (!combined.some(c => c.id === bn.id || c.message === bn.message)) {
            combined.push(bn);
          }
        });

        setNotifications(combined);
        setUnreadCount(combined.filter(n => !n.read).length);
      })
      .catch((err) => {
        if (err.response?.status === 403 || err.response?.status === 404) {
          backendDeniedRef.current = true;
          localStorage.setItem("notifications_backend_disabled", "true");
        }
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
      });
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Subscribe to Live Real-time Notification Hub
  useEffect(() => {
    const unsubscribe = RealtimeNotificationHub.subscribe((newNotif) => {
      // 1. Play audible hospital chime
      playHospitalAlertChime();

      // 2. Shake the bell icon
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 2000);

      // 3. Prepend notification
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 4. Show toast notification on screen
      toast.info(
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <i className="bi bi-bell-fill text-warning fs-5 mt-1"></i>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
              {newNotif.title || 'Hospital Live Alert'}
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              {newNotif.message}
            </div>
          </div>
        </div>,
        {
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true
        }
      );
    });

    return () => unsubscribe();
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearch) onSearch(q);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') { setSearchQuery(''); if (onSearch) onSearch(''); }
  };

  const notifIcon = (type) => {
    const icons = {
      APPOINTMENT_CONFIRMATION: { icon: 'bi-calendar2-check', color: '#059669', bg: '#ecfdf5' },
      PRESCRIPTION_NOTIFICATION: { icon: 'bi-capsule', color: '#7c3aed', bg: '#f5f3ff' },
      LAB_REPORT_AVAILABLE: { icon: 'bi-file-earmark-medical', color: '#0284c7', bg: '#eff6ff' },
      PAYMENT_CONFIRMATION: { icon: 'bi-cash-coin', color: '#059669', bg: '#ecfdf5' },
      APPOINTMENT_REMINDER: { icon: 'bi-alarm', color: '#d97706', bg: '#fffbeb' },
    };
    return icons[type] || { icon: 'bi-bell', color: '#64748b', bg: '#f1f5f9' };
  };

  const formatTime = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const displayName = username.includes('@') ? username.split('@')[0] : username;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const pageTitle = {
    dashboard: 'Dashboard', patients: 'Patients', doctors: 'Doctors',
    appointments: 'Appointments', prescriptions: 'Prescriptions', billing: 'Billing & Invoices',
    payments: 'Payments', 'medical-records': 'Medical Records', lab: 'Laboratory',
    pharmacy: 'Pharmacy', beds: 'Beds & Inpatient', settings: 'System Settings',
    profile: 'My Profile', help: 'Help & Support'
  };

  return (
    <>
      <style>{`
        .hs-navbar {
          height: 64px;
          background: ${darkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.92)'};
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)'};
          box-shadow: 0 2px 16px rgba(15,23,42,0.06);
          position: sticky;
          top: 0;
          z-index: 1030;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          gap: 12px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .hs-nav-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .hs-nav-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

        .hs-menu-btn {
          width: 38px; height: 38px;
          border: 1.5px solid ${darkMode ? 'rgba(255,255,255,0.12)' : '#e5eaf2'};
          background: ${darkMode ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
          color: ${darkMode ? '#94a3b8' : '#475569'};
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s; flex-shrink: 0;
        }
        .hs-menu-btn:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

        .hs-search {
          flex: 1; max-width: 340px; min-width: 0;
          height: 38px;
          border: 1.5px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          background: ${darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc'};
          border-radius: 10px;
          display: flex; align-items: center;
          padding: 0 12px; gap: 8px;
          transition: all .2s;
        }
        .hs-search:focus-within {
          border-color: #0ea5e9;
          background: ${darkMode ? 'rgba(14,165,233,0.06)' : '#fff'};
          box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
        }
        .hs-search-input {
          flex: 1; border: none; background: transparent; outline: none;
          font-size: .84rem; color: ${darkMode ? '#e2e8f0' : '#0f172a'};
          font-family: inherit;
        }
        .hs-search-input::placeholder { color: ${darkMode ? '#64748b' : '#94a3b8'}; }

        .hs-page-label {
          display: flex; flex-direction: column; padding-left: 4px;
        }
        .hs-page-label-sub {
          font-size: .6rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: ${darkMode ? '#64748b' : '#94a3b8'};
        }
        .hs-page-label-main {
          font-size: .82rem; font-weight: 700;
          color: ${darkMode ? '#e2e8f0' : '#0f172a'};
          line-height: 1.2;
        }

        .hs-icon-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid transparent; background: transparent;
          color: ${darkMode ? '#94a3b8' : '#64748b'};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s; position: relative;
        }
        .hs-icon-btn:hover {
          background: ${darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
          border-color: ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          color: #2563eb;
        }
        .hs-icon-btn.active-dark {
          background: #1e3a5f; color: #38bdf8; border-color: #1d4ed8;
        }

        .hs-notif-badge {
          position: absolute; top: 3px; right: 2px;
          min-width: 16px; height: 16px; padding: 0 3px;
          border-radius: 20px; background: #ef4444; border: 2px solid ${darkMode ? '#0f172a' : '#fff'};
          color: white; font-size: .55rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        .hs-divider {
          height: 26px; width: 1px;
          background: ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          margin: 0 4px;
        }

        .hs-profile-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: 12px;
          background: ${darkMode ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
          border: 1.5px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5eaf2'};
          cursor: pointer; transition: all .2s;
          position: relative;
        }
        .hs-profile-pill:hover { border-color: #0ea5e9; }

        .hs-avatar {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white; font-size: .8rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(37,99,235,0.2);
          flex-shrink: 0;
        }

        .hs-profile-name {
          font-size: .75rem; font-weight: 700;
          color: ${darkMode ? '#e2e8f0' : '#0f172a'}; line-height: 1.2;
        }
        .hs-profile-role {
          font-size: .6rem; font-weight: 600; letter-spacing: .05em;
          text-transform: uppercase; color: ${darkMode ? '#64748b' : '#94a3b8'};
        }

        .hs-profile-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 200px;
          background: ${darkMode ? '#1e293b' : '#fff'};
          border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          overflow: hidden; z-index: 1060;
        }
        .hs-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; font-size: .82rem; font-weight: 600;
          color: ${darkMode ? '#cbd5e1' : '#374151'};
          cursor: pointer; transition: background .15s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: inherit;
        }
        .hs-dropdown-item:hover { background: ${darkMode ? 'rgba(255,255,255,0.06)' : '#f8fafc'}; }
        .hs-dropdown-item.danger { color: #ef4444; }
        .hs-dropdown-item.danger:hover { background: #fef2f2; }
        .hs-dropdown-divider { height: 1px; background: ${darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}; margin: 4px 0; }

        .hs-notif-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 360px; max-width: calc(100vw - 24px);
          background: ${darkMode ? '#1e293b' : '#fff'};
          border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5eaf2'};
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.18);
          overflow: hidden; z-index: 1060;
        }
        .hs-notif-head {
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          padding: 14px 16px; color: white;
        }
        .hs-notif-item {
          padding: 12px 14px;
          border-bottom: 1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};
          transition: background .15s; cursor: pointer;
        }
        .hs-notif-item:hover { background: ${darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc'}; }
        .hs-notif-item.unread { background: ${darkMode ? 'rgba(14,165,233,0.05)' : '#f0f9ff'}; }
        .hs-notif-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .hs-search { max-width: 160px; }
          .hs-page-label, .hs-profile-name, .hs-profile-role, .hs-divider { display: none; }
          .hs-profile-pill { padding: 4px; border: none; background: transparent; }
        }
      `}</style>

      <header className="hs-navbar">
        {/* LEFT */}
        <div className="hs-nav-left">
          <button className="hs-menu-btn" onClick={toggleSidebar} aria-label="Menu">
            <i className="bi bi-list" style={{ fontSize: '1.2rem' }} />
          </button>

          <div className="hs-search">
            <i className="bi bi-search" style={{ fontSize: '.85rem', color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              className="hs-search-input"
              placeholder={role === 'PATIENT' ? 'Search appointments, prescriptions...' : 'Search patients, doctors, records...'}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); if (onSearch) onSearch(''); }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="hs-page-label" style={{ display: 'none' }} id="hs-page-label-desktop">
            <span className="hs-page-label-sub">{role === 'PATIENT' ? 'Patient Portal' : 'Workspace'}</span>
            <span className="hs-page-label-main">{pageTitle[activeTab] || 'Dashboard'}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hs-nav-right">
          {/* Emergency Code Red ER Quick Action */}
          {role !== 'PATIENT' && (
            <button
              type="button"
              className="btn btn-sm btn-danger fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2 px-md-3 py-1 rounded-pill me-1"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
              }}
              title="Immediate Emergency Trauma Triage (Code Red)"
              onClick={() => setShowEmergencyModal(true)}
            >
              <i className="bi bi-broadcast-pin text-white animate-pulse"></i>
              <span className="d-none d-sm-inline">Code Red ER</span>
            </button>
          )}

          {/* Dark mode */}
          <button className={`hs-icon-btn ${darkMode ? 'active-dark' : ''}`} onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-stars'}`} style={{ fontSize: '1rem' }} />
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button className="hs-icon-btn" onClick={() => { setShowNotifications(p => !p); setShowProfileMenu(false); }} title="Notifications">
              <motion.i
                animate={isRinging ? { rotate: [0, -22, 22, -18, 18, -10, 10, 0], scale: [1, 1.25, 1.25, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className={`bi ${unreadCount > 0 ? 'bi-bell-fill' : 'bi-bell'}`}
                style={{ fontSize: '1.1rem', color: unreadCount > 0 ? '#2563eb' : 'inherit', display: 'inline-block' }}
              />
              {unreadCount > 0 && <span className="hs-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {showNotifications && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 1050 }} onClick={() => setShowNotifications(false)} />
                <div className="hs-notif-panel" style={{ position: 'absolute' }}>
                  <div className="hs-notif-head">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                          <i className="bi bi-bell-fill" /> Notifications
                        </div>
                        <div style={{ fontSize: '.7rem', opacity: .6, marginTop: 2 }}>Hospital activity updates</div>
                      </div>
                      {unreadCount > 0 && (
                        <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '.72rem', fontWeight: 700 }}>
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.length > 0 ? notifications.map(n => {
                      const ni = notifIcon(n.type);
                      return (
                        <div key={n.id} className={`hs-notif-item ${!n.read ? 'unread' : ''}`}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <div className="hs-notif-icon" style={{ background: ni.bg, color: ni.color }}>
                              <i className={`bi ${ni.icon}`} style={{ fontSize: '.9rem' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '.78rem', fontWeight: n.read ? 500 : 700, color: darkMode ? '#e2e8f0' : '#0f172a', lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: '.67rem', color: '#94a3b8', marginTop: 3 }}>{formatTime(n.createdAt)}</div>
                            </div>
                            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 5 }} />}
                          </div>
                        </div>
                      );
                    }) : (
                      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                        <i className="bi bi-bell-slash" style={{ fontSize: '1.8rem', color: '#94a3b8', display: 'block', marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, fontSize: '.85rem', color: darkMode ? '#e2e8f0' : '#374151' }}>All caught up!</div>
                        <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 4 }}>No new notifications</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 12px', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}` }}>
                    <button
                      onClick={() => {
                        RealtimeNotificationHub.markAllAsRead();
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);
                        setShowNotifications(false);
                      }}
                      style={{ width: '100%', background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', padding: '6px', borderRadius: 8, fontFamily: 'inherit' }}
                    >
                      Dismiss all <i className="bi bi-check2-all ms-1" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hs-divider" />

          {/* Profile */}
          <div className="hs-profile-pill" ref={profileRef} onClick={() => { setShowProfileMenu(p => !p); setShowNotifications(false); }}>
            <div className="hs-avatar">{avatarLetter}</div>
            <div className="hs-profile-name" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="hs-profile-name">{displayName.length > 14 ? displayName.slice(0, 14) + '…' : displayName}</span>
              <span className="hs-profile-role">{role}</span>
            </div>
            <i className="bi bi-chevron-down" style={{ fontSize: '.6rem', color: '#94a3b8' }} />

            {showProfileMenu && (
              <div className="hs-profile-dropdown">
                <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}` }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 700, color: darkMode ? '#e2e8f0' : '#0f172a' }}>{displayName}</div>
                  <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 2 }}>{role}</div>
                </div>

                <button className="hs-dropdown-item" onClick={() => {
                  setShowProfileMenu(false);
                  if (setActiveTab) setActiveTab('profile');
                }}>
                  <i className="bi bi-person-circle" style={{ color: '#64748b' }} /> My Profile
                </button>

                {role === 'ADMIN' && (
                  <button className="hs-dropdown-item" onClick={() => {
                    setShowProfileMenu(false);
                    if (setActiveTab) setActiveTab('settings');
                  }}>
                    <i className="bi bi-gear" style={{ color: '#64748b' }} /> Settings
                  </button>
                )}

                <button className="hs-dropdown-item" onClick={() => {
                  setShowProfileMenu(false);
                  if (setActiveTab) setActiveTab('help');
                }}>
                  <i className="bi bi-question-circle" style={{ color: '#64748b' }} /> Help & Support
                </button>

                <div className="hs-dropdown-divider" />

                <button className="hs-dropdown-item danger" onClick={() => AuthService.logout()}>
                  <i className="bi bi-box-arrow-right" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* EMERGENCY CODE RED TRAUMA TRIAGE MODAL */}
      <EmergencyTriageModal
        show={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        beds={beds}
        doctors={doctors}
        onTriageComplete={() => {
          if (onDataRefresh) onDataRefresh();
          if (setActiveTab) setActiveTab('beds');
        }}
      />
    </>
  );
}

export default Navbar;
