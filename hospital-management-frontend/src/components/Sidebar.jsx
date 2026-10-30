import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AuthService from '../services/AuthService';

function Sidebar({
  activeTab,
  setActiveTab,
  counts,
  isOpen,
  toggleSidebar
}) {
  const username = AuthService.getUsername() || 'Admin';
  const role = String(AuthService.getRole() || '').replace(/^ROLE_/, '').toUpperCase();
  const isDemo = AuthService.isDemoMode();

  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState('Admin Dashboard');

  const navItems = [
    { id: 'patients', label: 'Patients', icon: 'bi-people-fill', count: counts?.patients, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'doctors', label: 'Doctors', icon: 'bi-person-badge-fill', count: counts?.doctors, roles: ['ADMIN', 'RECEPTIONIST'] },
    { id: 'appointments', label: 'Appointments', icon: 'bi-calendar2-check-fill', count: counts?.appointments, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'bi-file-earmark-medical-fill', count: counts?.prescriptions, roles: ['ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT'] },
    { id: 'billing', label: 'Billing & Invoices', icon: 'bi-receipt-cutoff', count: counts?.bills, roles: ['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT', 'PATIENT'] },
    { id: 'medical-records', label: 'Medical Records', icon: 'bi-file-earmark-pulse-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'] },
    { id: 'lab', label: 'Laboratory', icon: 'bi-moisture', roles: ['ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'PATIENT'] },
    { id: 'pharmacy', label: 'Pharmacy Inventory', icon: 'bi-capsule-pill', roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'beds', label: 'Beds & Inpatient', icon: 'bi-hospital-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'icu', label: 'ICU Telemetry Station', icon: 'bi-heart-pulse-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'ot', label: 'Operation Theatre (OT)', icon: 'bi-scissors', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'blood-bank', label: 'Blood Bank', icon: 'bi-droplet-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'] },
    { id: 'ambulance', label: 'Ambulance & EMS', icon: 'bi-truck-front-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'payments', label: 'Payments & Ledger', icon: 'bi-wallet2', roles: ['ADMIN', 'ACCOUNTANT', 'PATIENT'] },
    { id: 'tpa', label: 'TPA & Health Insurance', icon: 'bi-shield-check', roles: ['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'] },
    { id: 'biomedical', label: 'Bio-Medical Assets', icon: 'bi-tools', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'pacs', label: 'PACS Radiology Imaging', icon: 'bi-film', roles: ['ADMIN', 'DOCTOR', 'LAB_TECHNICIAN'] },
    { id: 'cssd', label: 'CSSD & Infection Control', icon: 'bi-virus', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'dietary', label: 'Dietary & Nutrition', icon: 'bi-cup-hot-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'mortuary', label: 'Mortuary & Death Desk', icon: 'bi-file-earmark-medical-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'bmw', label: 'Bio-Medical Waste (BMW)', icon: 'bi-trash3-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'abdm', label: 'ABDM & ABHA Gateway', icon: 'bi-qr-code', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { id: 'telemedicine', label: 'Tele-Medicine Video OPD', icon: 'bi-camera-video-fill', roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
    { id: 'laundry', label: 'Laundry & Linen Desk', icon: 'bi-tag-fill', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'analytics', label: 'Executive Operations & Revenue', icon: 'bi-graph-up-arrow', roles: ['ADMIN'] },
  ];

  const dashboardSubMenus = [
    { name: 'Admin Dashboard', tabId: 'dashboard', roles: ['ADMIN'] },
    { name: 'Doctor Dashboard', tabId: 'doctors', roles: ['ADMIN', 'DOCTOR'] },
    { name: 'Reception Dashboard', tabId: 'appointments', roles: ['ADMIN', 'RECEPTIONIST'] },
    { name: 'Inventory Dashboard', tabId: 'pharmacy', roles: ['ADMIN', 'PHARMACIST'] },
  ];

  const settingsItems = [
    { id: 'profile', label: 'My Profile', icon: 'bi-person-circle', tabId: 'profile', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'PATIENT'] },
    { id: 'settings', label: 'System Settings', icon: 'bi-gear-fill', tabId: 'settings', roles: ['ADMIN'] },
    { id: 'staff-approvals', label: 'Staff Role Requests', icon: 'bi-person-check-fill', tabId: 'staff-approvals', roles: ['ADMIN'] },
    { id: 'help', label: 'Help & Support', icon: 'bi-question-circle-fill', tabId: 'help', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'PATIENT'] },
  ];

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768 && toggleSidebar) {
      toggleSidebar();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <style>{`
        .aura-sidebar {
          width: 265px;
          height: 100vh;
          position: sticky;
          top: 0;
          left: 0;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-right: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.03);
          z-index: 1040;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .aura-sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .aura-brand {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.7);
        }

        .aura-brand-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aura-logo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.3);
        }

        .aura-brand-name {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .aura-brand-name span {
          color: #0ea5e9;
        }

        .aura-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(203, 213, 225, 0.6) transparent;
        }

        .aura-section-title {
          padding: 12px 10px 6px;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .aura-nav-btn {
          width: 100%;
          min-height: 42px;
          margin: 3px 0;
          padding: 8px 12px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          font-size: 0.86rem;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .aura-nav-btn:hover {
          color: #0284c7;
          background: rgba(241, 245, 249, 0.8);
          transform: translateX(2px);
        }

        .aura-nav-btn.active {
          color: #0284c7;
          background: linear-gradient(135deg, rgba(224, 242, 254, 0.9), rgba(243, 232, 255, 0.7));
          border-color: rgba(255, 255, 255, 0.9);
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(14, 165, 233, 0.12);
        }

        .aura-nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aura-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          color: #64748b;
          background: rgba(241, 245, 249, 0.7);
          transition: all 0.2s ease;
        }

        .aura-nav-btn.active .aura-icon {
          color: #ffffff;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);
        }

        .aura-count {
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          background: rgba(241, 245, 249, 0.9);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .aura-nav-btn.active .aura-count {
          color: #0284c7;
          background: #ffffff;
        }

        .aura-submenu {
          margin: 2px 0 6px 20px;
          padding-left: 12px;
          border-left: 2px solid rgba(226, 232, 240, 0.8);
        }

        .aura-sub-btn {
          width: 100%;
          border: none;
          background: transparent;
          color: #64748b;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aura-sub-btn:hover {
          color: #0284c7;
          background: rgba(241, 245, 249, 0.7);
        }

        .aura-sub-btn.active {
          color: #0284c7;
          background: rgba(224, 242, 254, 0.8);
          font-weight: 700;
        }

        .aura-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          background: rgba(248, 250, 252, 0.6);
        }

        .aura-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aura-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 0.95rem;
          background: linear-gradient(135deg, #0ea5e9, #a855f7);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
        }

        .aura-logout {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: #ef4444;
          background: rgba(254, 242, 242, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .aura-logout:hover {
          color: white;
          background: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 767.98px) {
          .aura-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-105%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .aura-sidebar.open {
            transform: translateX(0);
          }
          .aura-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(4px);
            z-index: 1035;
          }
        }
      `}</style>

      {isOpen && (
        <div className="aura-overlay d-md-none" onClick={toggleSidebar}></div>
      )}

      <aside className={`aura-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="aura-sidebar-content">

          {/* BRAND HEADER */}
          <div className="aura-brand">
            <div className="aura-brand-main">
              <div className="aura-logo">
                <i className="bi bi-hospital fs-5"></i>
              </div>
              <div className="aura-brand-name">
                Hos<span>Ptal</span>
              </div>
              <button
                type="button"
                className="btn btn-sm text-muted d-md-none ms-auto border-0 p-0"
                onClick={toggleSidebar}
              >
                <i className="bi bi-x-lg fs-6"></i>
              </button>
            </div>
          </div>

          {/* NAVIGATION CONTAINER */}
          {/* NAVIGATION CONTAINER */}
          <div className="aura-nav">

            {/* Section 1: Workspace / Dashboard (Hidden for PATIENT) */}
            {role !== 'PATIENT' && (
              <>
                <div className="aura-section-title">
                  Workspace
                </div>

                <motion.button
                  type="button"
                  className={`aura-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="aura-nav-left">
                    <div className="aura-icon">
                      <i className="bi bi-grid-1x2-fill"></i>
                    </div>
                    <span className="fw-semibold">Dashboard</span>
                  </div>
                  <i className={`bi bi-chevron-${dashboardOpen ? 'down' : 'right'} small text-muted`}></i>
                </motion.button>

                <AnimatePresence>
                  {dashboardOpen && (
                    <motion.div
                      className="aura-submenu overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      {dashboardSubMenus.filter((sub) => sub.roles.includes(role)).map((sub) => (
                        <motion.button
                          type="button"
                          key={sub.tabId}
                          className={`aura-sub-btn ${activeTab === sub.tabId && activeDashboardSubTab === sub.name ? 'active' : ''}`}
                          onClick={() => {
                            setActiveDashboardSubTab(sub.name);
                            handleNavigation(sub.tabId);
                          }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <i className="bi bi-dot fs-5"></i>
                          {sub.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Section 2: Clinical Operations / Patient Portal */}
            <div className={`aura-section-title ${role !== 'PATIENT' ? 'mt-2' : ''}`}>
              {role === 'PATIENT' ? 'Patient Portal' : 'Clinical Operations'}
            </div>

            {navItems.filter((item) => item.roles.includes(role)).map((item) => {
              const patientLabels = {
                appointments: 'My Appointments',
                prescriptions: 'My Prescriptions',
                billing: 'My Bills & Invoices',
                'medical-records': 'My Medical Records',
                lab: 'My Lab Reports',
                payments: 'My Payments'
              };
              const displayLabel = role === 'PATIENT' && patientLabels[item.id] ? patientLabels[item.id] : item.label;

              return (
                <motion.button
                  type="button"
                  key={item.id}
                  className={`aura-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="aura-nav-left">
                    <div className="aura-icon">
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <span>{displayLabel}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {role !== 'PATIENT' && item.count !== undefined && item.count !== null && (
                      <span className="aura-count">{item.count}</span>
                    )}
                    <i className="bi bi-chevron-right small text-muted opacity-50"></i>
                  </div>
                </motion.button>
              );
            })}

            {/* Section 3: Settings & Support */}
            <div className="aura-section-title mt-2">
              Settings & Support
            </div>

            <motion.button
              type="button"
              className="aura-nav-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="aura-nav-left">
                <div className="aura-icon">
                  <i className="bi bi-gear-fill text-primary"></i>
                </div>
                <span>Settings & Support</span>
              </div>
              <i className={`bi bi-chevron-${settingsOpen ? 'down' : 'right'} small text-muted`}></i>
            </motion.button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  className="aura-submenu overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  {settingsItems.filter((item) => item.roles.includes(role)).map((item) => (
                    <motion.button
                      type="button"
                      key={item.id}
                      className={`aura-sub-btn ${activeTab === item.tabId ? 'active' : ''}`}
                      onClick={() => handleNavigation(item.tabId)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className={`bi ${item.icon} small`}></i>
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* USER FOOTER */}
          <div className="aura-footer">
            <div className="aura-profile">
              <motion.div
                className="aura-avatar"
                whileHover={{ scale: 1.05 }}
              >
                {getInitials(username)}
              </motion.div>
              <div className="overflow-hidden flex-grow-1">
                <div className="fw-bold text-dark text-truncate small">{username}</div>
                <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{role}</small>
              </div>
              <motion.button
                type="button"
                className="aura-logout"
                onClick={AuthService.logout}
                title="Sign Out"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="bi bi-box-arrow-right"></i>
              </motion.button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;
