import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import AuthService from '../../services/AuthService';
import Pagination from '../common/Pagination';

const ASSIGNABLE_ROLES = [
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PHARMACIST',
  'LAB_TECHNICIAN',
  'ACCOUNTANT',
  'PATIENT'
];

function StaffApprovalsPanel() {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeQuickTab, setActiveQuickTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const getFallbackUsers = () => {
    const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const demoUsers = [
      { id: 1, name: 'System Administrator', username: 'admin', email: 'admin@hospital.com', role: 'ADMIN', status: 'ACTIVE' },
      { id: 2, name: 'Dr. Sarah Jenkins', username: 'dr.sarah', email: 'sarah.jenkins@hospital.com', role: 'DOCTOR', status: 'ACTIVE' },
      { id: 3, name: 'Dr. Rahul Dey', username: 'rahul33@gmail.com', email: 'rahul33@gmail.com', role: 'DOCTOR', requestedRole: 'DOCTOR', status: 'ACTIVE' },
      { id: 4, name: 'Dr. James Smith', username: 'dr.smith', email: 'james.smith@hospital.com', role: 'PATIENT', requestedRole: 'DOCTOR', status: 'PENDING_APPROVAL' },
      { id: 5, name: 'Emma Watson', username: 'receptionist', email: 'reception@hospital.com', role: 'RECEPTIONIST', status: 'ACTIVE' },
      { id: 6, name: 'Nurse Clara Oswald', username: 'nurse.clara', email: 'clara.nurse@hospital.com', role: 'PATIENT', requestedRole: 'NURSE', status: 'PENDING_APPROVAL' },
      { id: 7, name: 'David Miller', username: 'david.lab', email: 'david.m@hospital.com', role: 'PATIENT', requestedRole: 'LAB_TECHNICIAN', status: 'PENDING_APPROVAL' },
      { id: 8, name: 'John Doe', username: 'patient', email: 'john.doe@patient.com', role: 'PATIENT', status: 'ACTIVE' }
    ];

    const merged = [...demoUsers];
    localUsers.forEach(u => {
      const exists = merged.some(
        m => m.username?.toLowerCase() === u.username?.toLowerCase() ||
             (u.email && m.email?.toLowerCase() === u.email?.toLowerCase())
      );
      if (!exists) {
        merged.push({
          id: u.id || Date.now() + Math.random(),
          name: u.name || u.username,
          username: u.username,
          email: u.email || `${u.username}@hospital.com`,
          role: u.role || 'PATIENT',
          requestedRole: u.requestedRole || (u.role !== 'PATIENT' ? u.role : null),
          status: u.status || (u.role !== 'PATIENT' ? 'PENDING_APPROVAL' : 'ACTIVE')
        });
      }
    });
    return merged;
  };

  const applyUserResponse = useCallback((response) => {
    let data = response.data?.data ?? response.data;
    if (!Array.isArray(data) || data.length === 0) {
      data = getFallbackUsers();
    }
    setUsers(data);
    setSelectedRoles(Object.fromEntries(
      data.map(user => [user.id, user.requestedRole || user.role])
    ));
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AuthService.getAuthUsers();
      applyUserResponse(res);
    } catch (error) {
      console.warn('Backend users unavailable, falling back to local registry:', error);
      const fallback = getFallbackUsers();
      setUsers(fallback);
      setSelectedRoles(Object.fromEntries(
        fallback.map(user => [user.id, user.requestedRole || user.role])
      ));
    } finally {
      setLoading(false);
    }
  }, [applyUserResponse]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const approveRequest = async (user) => {
    setBusyUserId(user.id);
    const targetRole = user.requestedRole || 'DOCTOR';
    try {
      await AuthService.approveRequestedRole(user.id);
      toast.success(`${targetRole} request approved for ${user.name || user.username}!`);
      await loadUsers();
    } catch (error) {
      // Offline fallback: update local user status
      const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updated = localUsers.map(u => {
        if (u.id === user.id || u.username === user.username) {
          return { ...u, role: targetRole, requestedRole: null, status: 'ACTIVE' };
        }
        return u;
      });
      localStorage.setItem('registered_users', JSON.stringify(updated));

      // Update in memory state
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: targetRole, requestedRole: null, status: 'ACTIVE' } : u));
      toast.success(`${targetRole} credentials approved for ${user.name || user.username}!`);
    } finally {
      setBusyUserId(null);
    }
  };

  const assignRole = async (user) => {
    const newRole = selectedRoles[user.id];
    if (!newRole) return;
    setBusyUserId(user.id);
    try {
      await AuthService.updateUserRole(user.id, newRole);
      toast.success(`Role updated to ${newRole} for ${user.name || user.username}.`);
      await loadUsers();
    } catch (error) {
      // Offline fallback: update local user status
      const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updated = localUsers.map(u => {
        if (u.id === user.id || u.username === user.username) {
          return { ...u, role: newRole, requestedRole: null, status: 'ACTIVE' };
        }
        return u;
      });
      localStorage.setItem('registered_users', JSON.stringify(updated));

      // Update in memory state
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole, requestedRole: null, status: 'ACTIVE' } : u));
      toast.success(`Role assigned to ${newRole} for ${user.name || user.username}!`);
    } finally {
      setBusyUserId(null);
    }
  };

  // KPIs
  const totalUsers = users.length;
  const pendingRequests = users.filter(u => u.status === 'PENDING_APPROVAL' || (u.requestedRole && u.requestedRole !== u.role)).length;
  const activeStaff = users.filter(u => u.status === 'ACTIVE' && ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'ACCOUNTANT'].includes(u.role)).length;
  const patientsCount = users.filter(u => u.role === 'PATIENT').length;

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter(user => {
      const name = (user.name || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const role = (user.role || '').toLowerCase();
      const requestedRole = (user.requestedRole || '').toLowerCase();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        username.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        requestedRole.includes(term);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'PENDING' && (user.status === 'PENDING_APPROVAL' || Boolean(user.requestedRole))) ||
        (statusFilter === 'ACTIVE' && user.status === 'ACTIVE');

      const matchesRole =
        !roleFilter ||
        user.role === roleFilter ||
        user.requestedRole === roleFilter;

      let matchesQuickTab = true;
      if (activeQuickTab === 'PENDING') {
        matchesQuickTab = user.status === 'PENDING_APPROVAL' || (user.requestedRole && user.requestedRole !== user.role);
      } else if (activeQuickTab === 'DOCTOR') {
        matchesQuickTab = user.role === 'DOCTOR' || user.requestedRole === 'DOCTOR';
      } else if (activeQuickTab === 'STAFF') {
        matchesQuickTab = ['NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'ACCOUNTANT'].includes(user.role) ||
                          ['NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'ACCOUNTANT'].includes(user.requestedRole);
      } else if (activeQuickTab === 'PATIENT') {
        matchesQuickTab = user.role === 'PATIENT' && !user.requestedRole;
      }

      return matchesSearch && matchesStatus && matchesRole && matchesQuickTab;
    });
  }, [users, searchTerm, statusFilter, roleFilter, activeQuickTab]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getInitials = (name = '') => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '?';
    return words.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toUpperCase()) {
      case 'DOCTOR':
        return 'role-badge-doctor';
      case 'ADMIN':
        return 'role-badge-admin';
      case 'NURSE':
        return 'role-badge-nurse';
      case 'RECEPTIONIST':
        return 'role-badge-reception';
      case 'PHARMACIST':
        return 'role-badge-pharmacy';
      case 'LAB_TECHNICIAN':
        return 'role-badge-lab';
      default:
        return 'role-badge-patient';
    }
  };

  return (
    <>
      <style>
        {`
          .staff-panel {
            --purple-950: #2e1065;
            --purple-900: #4c1d95;
            --purple-800: #5b21b6;
            --purple-700: #6d28d9;
            --purple-600: #7c3aed;
            --purple-500: #8b5cf6;
            --purple-400: #a78bfa;
            --purple-300: #c4b5fd;
            --purple-200: #ddd6fe;
            --purple-100: #ede9fe;
            --purple-50: #f5f3ff;

            --indigo: #6366f1;
            --indigo-soft: #eef2ff;

            --green: #059669;
            --green-soft: #ecfdf5;

            --blue: #2563eb;
            --blue-soft: #eff6ff;

            --orange: #d97706;
            --orange-soft: #fffbeb;

            --red: #dc2626;
            --red-soft: #fef2f2;

            --text: #1e1b2e;
            --text-dark: #181528;
            --muted: #6f6b80;
            --light-muted: #9994a8;

            --border: #ebe7f5;
            --border-strong: #ddd6ee;

            --surface: #ffffff;
            --surface-soft: #faf9ff;

            color: var(--text);
          }

          /* =====================================================
             KPI CARDS
          ===================================================== */
          .sp-kpi {
            position: relative;
            overflow: hidden;
            min-height: 142px;
            padding: 22px;
            border: 1px solid var(--border);
            border-radius: 22px;
            background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(250,249,255,.96));
            box-shadow: 0 2px 4px rgba(46,16,101,.025), 0 12px 35px rgba(46,16,101,.055);
            transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
          }

          .sp-kpi:hover {
            transform: translateY(-4px);
            border-color: rgba(124,58,237,.18);
            box-shadow: 0 8px 20px rgba(46,16,101,.06), 0 25px 55px rgba(46,16,101,.08);
          }

          .sp-kpi::before {
            content: "";
            position: absolute;
            width: 180px;
            height: 180px;
            right: -75px;
            top: -90px;
            border-radius: 50%;
            background: currentColor;
            opacity: .045;
          }

          .sp-kpi::after {
            content: "";
            position: absolute;
            left: 0;
            top: 22px;
            bottom: 22px;
            width: 3px;
            border-radius: 10px;
            background: currentColor;
            opacity: .8;
          }

          .sp-kpi-icon {
            width: 54px;
            height: 54px;
            flex: 0 0 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 17px;
            font-size: 1.15rem;
            box-shadow: inset 0 0 0 1px rgba(124,58,237,.06);
          }

          .sp-kpi-icon.purple {
            color: var(--purple-700);
            background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          }

          .sp-kpi-icon.orange {
            color: #d97706;
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
          }

          .sp-kpi-icon.green {
            color: #059669;
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          }

          .sp-kpi-icon.indigo {
            color: #4f46e5;
            background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          }

          .sp-kpi-label {
            color: var(--muted);
            font-size: .68rem;
            font-weight: 850;
            text-transform: uppercase;
            letter-spacing: .09em;
          }

          .sp-kpi-value {
            margin-top: 5px;
            color: var(--text-dark);
            font-size: 1.95rem;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.055em;
          }

          .sp-kpi-caption {
            margin-top: 7px;
            color: var(--light-muted);
            font-size: .7rem;
          }

          /* =====================================================
             CARD CONTAINER
          ===================================================== */
          .sp-card {
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 23px;
            background: var(--surface);
            box-shadow: 0 2px 5px rgba(46,16,101,.02), 0 18px 50px rgba(46,16,101,.055);
          }

          .sp-card-header {
            position: relative;
            padding: 21px 24px;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(180deg, #ffffff 0%, #fcfbff 100%);
          }

          .sp-card-header::after {
            content: "";
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: -1px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(124,58,237,.12), transparent);
          }

          .sp-heading-icon {
            width: 47px;
            height: 47px;
            flex: 0 0 47px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
            color: var(--purple-700);
            background: linear-gradient(135deg, #f5f3ff, #ede9fe);
            border: 1px solid #e9e2ff;
            box-shadow: 0 7px 18px rgba(124,58,237,.08);
          }

          .sp-heading-icon.blue {
            color: #4f46e5;
            background: linear-gradient(135deg, #eef2ff, #e0e7ff);
            border-color: #e0e7ff;
          }

          .sp-title {
            color: var(--text-dark);
            font-size: .98rem;
            font-weight: 900;
            letter-spacing: -.025em;
          }

          .sp-subtitle {
            margin-top: 3px;
            color: var(--light-muted);
            font-size: .73rem;
          }

          /* Quick Chips */
          .sp-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 14px 24px 0 24px;
            background: #ffffff;
          }

          .sp-chip {
            border: 1px solid #e5e1eb;
            background: #fff;
            color: #64748b;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .sp-chip:hover {
            border-color: var(--purple-400);
            color: var(--purple-700);
            background: var(--purple-50);
          }

          .sp-chip.active {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            color: #ffffff;
            border-color: #7c3aed;
            box-shadow: 0 4px 12px rgba(109,40,217,0.22);
          }

          /* Toolbar */
          .sp-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 24px;
            background: #ffffff;
            border-bottom: 1px solid var(--border);
          }

          .sp-search {
            position: relative;
            flex: 1;
            min-width: 250px;
            max-width: 360px;
          }

          .sp-search i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.85rem;
          }

          .sp-search input {
            width: 100%;
            height: 40px;
            padding-left: 38px;
            padding-right: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
            font-size: 0.82rem;
            color: #0f172a;
            transition: all 0.2s ease;
          }

          .sp-search input:focus {
            outline: none;
            background: #fff;
            border-color: var(--purple-500);
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
          }

          .sp-filter-select {
            height: 40px;
            padding: 0 14px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
            font-size: 0.82rem;
            color: #334155;
            cursor: pointer;
            min-width: 150px;
          }

          /* Table */
          .sp-table-wrapper {
            overflow-x: auto;
          }

          .sp-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.84rem;
          }

          .sp-table thead th {
            padding: 14px 20px;
            background: #f8fafc;
            color: #64748b;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
          }

          .sp-table tbody tr {
            transition: background-color 0.15s ease;
          }

          .sp-table tbody tr:hover {
            background-color: #faf9ff;
          }

          .sp-table tbody td {
            padding: 16px 20px;
            vertical-align: middle;
            border-bottom: 1px solid #f1f5f9;
          }

          .sp-table tbody tr:last-child td {
            border-bottom: none;
          }

          /* Avatar */
          .sp-avatar {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            font-weight: 800;
            font-size: 0.85rem;
            color: #fff;
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            box-shadow: 0 4px 10px rgba(124,58,237,0.22);
            flex-shrink: 0;
          }

          /* Role Badges */
          .role-badge-doctor {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-admin {
            background: #f5f3ff;
            color: #6d28d9;
            border: 1px solid #ddd6fe;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-nurse {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-reception {
            background: #eef2ff;
            color: #4338ca;
            border: 1px solid #c7d2fe;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-pharmacy {
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #ffedd5;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-lab {
            background: #fdf2f8;
            color: #be185d;
            border: 1px solid #fbcfe8;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .role-badge-patient {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .req-badge-pending {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.72rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .status-pill-active {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #d1fae5;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .status-pill-pending {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fef3c7;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            animation: pulse-border 2s infinite;
          }

          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(217,119,6,0.3); }
            70% { box-shadow: 0 0 0 5px rgba(217,119,6,0); }
            100% { box-shadow: 0 0 0 0 rgba(217,119,6,0); }
          }

          /* Buttons */
          .sp-btn-approve {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff;
            border: none;
            padding: 6px 14px;
            border-radius: 9px;
            font-size: 0.75rem;
            font-weight: 750;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(16,185,129,0.25);
            transition: all 0.2s ease;
          }

          .sp-btn-approve:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(16,185,129,0.35);
            color: #fff;
          }

          .sp-btn-assign {
            background: #ffffff;
            color: var(--purple-700);
            border: 1px solid var(--purple-300);
            padding: 6px 12px;
            border-radius: 9px;
            font-size: 0.75rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s ease;
          }

          .sp-btn-assign:hover:not(:disabled) {
            background: var(--purple-50);
            border-color: var(--purple-600);
            color: var(--purple-800);
          }

          .sp-btn-primary {
            min-height: 42px;
            border: 0;
            border-radius: 12px;
            padding: 9px 17px;
            color: #fff;
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            font-size: .78rem;
            font-weight: 850;
            box-shadow: 0 8px 20px rgba(109,40,217,.22);
            transition: transform .2s ease, box-shadow .2s ease;
          }

          .sp-btn-primary:hover:not(:disabled) {
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 12px 27px rgba(109,40,217,.3);
          }

          .sp-empty {
            padding: 65px 20px;
            text-align: center;
          }

          .sp-empty-icon {
            width: 74px;
            height: 74px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5def4;
            border-radius: 21px;
            color: #a29bb0;
            background: linear-gradient(135deg, #faf9ff, #f5f3ff);
            font-size: 1.5rem;
            box-shadow: 0 8px 20px rgba(46,16,101,.045);
          }
        `}
      </style>

      <div className="staff-panel container-fluid py-2">
        {/* =====================================================
            HEADER SECTION (APPOINTMENTS STYLE)
        ===================================================== */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              <i className="bi bi-shield-check"></i>
              HOSPITALSYNC ACCESS MANAGEMENT • STAFF CREDENTIALS
            </div>
            <h3 className="fw-black text-dark mb-1" style={{ letterSpacing: '-0.03em' }}>
              Staff Role Requests & Approvals
            </h3>
            <p className="text-muted small mb-0">
              Review staff onboarding requests, approve clinical credentials, and modify role authorization levels.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="sp-btn-primary d-inline-flex align-items-center gap-2"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise fs-6"></i>
                  Refresh Accounts
                </>
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            KPI METRIC CARDS ROW (APPOINTMENTS STYLE)
        ===================================================== */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="sp-kpi" style={{ color: '#7c3aed' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="sp-kpi-icon purple">
                  <i className="bi bi-people-fill"></i>
                </div>
                <div>
                  <div className="sp-kpi-label">Total Accounts</div>
                  <div className="sp-kpi-value">{totalUsers}</div>
                  <div className="sp-kpi-caption">Registered users in system</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="sp-kpi" style={{ color: '#d97706' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="sp-kpi-icon orange">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <div className="sp-kpi-label">Pending Requests</div>
                  <div className="sp-kpi-value">{pendingRequests}</div>
                  <div className="sp-kpi-caption">Awaiting admin review</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="sp-kpi" style={{ color: '#059669' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="sp-kpi-icon green">
                  <i className="bi bi-hospital-fill"></i>
                </div>
                <div>
                  <div className="sp-kpi-label">Active Staff</div>
                  <div className="sp-kpi-value">{activeStaff}</div>
                  <div className="sp-kpi-caption">Doctors, Nurses & Support</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="sp-kpi" style={{ color: '#4f46e5' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="sp-kpi-icon indigo">
                  <i className="bi bi-person-heart"></i>
                </div>
                <div>
                  <div className="sp-kpi-label">Patients</div>
                  <div className="sp-kpi-value">{patientsCount}</div>
                  <div className="sp-kpi-caption">Patient portal accounts</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =====================================================
            MAIN STAFF DIRECTORY CARD
        ===================================================== */}
        <div className="sp-card">
          <div className="sp-card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="sp-heading-icon blue">
                <i className="bi bi-person-lines-fill fs-5"></i>
              </div>
              <div>
                <div className="sp-title">Staff Identity Directory</div>
                <div className="sp-subtitle">Manage account verification and authorization privileges</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small">
              <span className="badge bg-light text-dark border">
                Showing {filteredUsers.length} of {totalUsers} accounts
              </span>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="sp-chips">
            <button
              type="button"
              className={`sp-chip ${activeQuickTab === 'ALL' ? 'active' : ''}`}
              onClick={() => { setActiveQuickTab('ALL'); setCurrentPage(1); }}
            >
              All Accounts ({totalUsers})
            </button>
            <button
              type="button"
              className={`sp-chip ${activeQuickTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => { setActiveQuickTab('PENDING'); setCurrentPage(1); }}
            >
              <i className="bi bi-clock-history me-1"></i>
              Pending Approvals ({pendingRequests})
            </button>
            <button
              type="button"
              className={`sp-chip ${activeQuickTab === 'DOCTOR' ? 'active' : ''}`}
              onClick={() => { setActiveQuickTab('DOCTOR'); setCurrentPage(1); }}
            >
              <i className="bi bi-heart-pulse me-1"></i>
              Physicians & Doctors
            </button>
            <button
              type="button"
              className={`sp-chip ${activeQuickTab === 'STAFF' ? 'active' : ''}`}
              onClick={() => { setActiveQuickTab('STAFF'); setCurrentPage(1); }}
            >
              <i className="bi bi-person-badge me-1"></i>
              Clinical Staff
            </button>
            <button
              type="button"
              className={`sp-chip ${activeQuickTab === 'PATIENT' ? 'active' : ''}`}
              onClick={() => { setActiveQuickTab('PATIENT'); setCurrentPage(1); }}
            >
              <i className="bi bi-person me-1"></i>
              Patients
            </button>
          </div>

          {/* Toolbar */}
          <div className="sp-toolbar">
            <div className="sp-search">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search staff by name, email, role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <select
                className="sp-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="ACTIVE">Active Accounts</option>
              </select>

              <select
                className="sp-filter-select"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Roles</option>
                {ASSIGNABLE_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="sp-table-wrapper">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email & Identity</th>
                  <th>Current Role</th>
                  <th>Requested Role</th>
                  <th>Status</th>
                  <th className="text-end">Authorization Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary me-2" role="status" />
                      <span className="text-muted fw-semibold">Loading user accounts...</span>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="sp-empty">
                        <div className="sp-empty-icon">
                          <i className="bi bi-person-x"></i>
                        </div>
                        <div className="fw-bold text-dark">No accounts match the criteria</div>
                        <div className="text-muted small mt-1">Try adjusting your search keywords or clear active filters.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(user => {
                    const isPending = user.status === 'PENDING_APPROVAL' || Boolean(user.requestedRole && user.requestedRole !== user.role);
                    const isBusy = busyUserId === user.id;
                    const displayName = user.name || user.username || 'User';

                    return (
                      <tr key={user.id}>
                        {/* Member */}
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="sp-avatar">
                              {getInitials(displayName)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{displayName}</div>
                              <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <div className="d-inline-flex align-items-center gap-2 text-dark">
                            <i className="bi bi-envelope text-muted"></i>
                            <span className="font-monospace small">{user.email}</span>
                          </div>
                        </td>

                        {/* Current Role */}
                        <td>
                          <span className={getRoleBadgeClass(user.role)}>
                            <i className="bi bi-person-badge"></i>
                            {user.role}
                          </span>
                        </td>

                        {/* Requested Role */}
                        <td>
                          {user.requestedRole && user.requestedRole !== user.role ? (
                            <span className="req-badge-pending">
                              <i className="bi bi-arrow-up-right-circle-fill"></i>
                              {user.requestedRole}
                            </span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          {isPending ? (
                            <span className="status-pill-pending">
                              <i className="bi bi-hourglass-split"></i>
                              Pending Approval
                            </span>
                          ) : (
                            <span className="status-pill-active">
                              <i className="bi bi-check-circle-fill"></i>
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-end">
                          {user.role === 'ADMIN' ? (
                            <span className="badge bg-light text-muted border px-3 py-2">
                              <i className="bi bi-shield-lock-fill me-1 text-primary"></i>
                              Protected Admin
                            </span>
                          ) : (
                            <div className="d-inline-flex flex-wrap align-items-center justify-content-end gap-2">
                              {isPending && (
                                <button
                                  type="button"
                                  className="sp-btn-approve"
                                  onClick={() => approveRequest(user)}
                                  disabled={isBusy}
                                  title={`Approve ${user.requestedRole} credentials`}
                                >
                                  {isBusy ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <i className="bi bi-check-lg" />
                                  )}
                                  Approve {user.requestedRole || 'Staff'}
                                </button>
                              )}

                              <div className="d-flex align-items-center gap-1">
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: 'auto', minWidth: '135px', borderRadius: '9px', fontSize: '0.78rem' }}
                                  value={selectedRoles[user.id] || user.role}
                                  onChange={e => setSelectedRoles(prev => ({
                                    ...prev,
                                    [user.id]: e.target.value
                                  }))}
                                  disabled={isBusy}
                                >
                                  {ASSIGNABLE_ROLES.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  className="sp-btn-assign"
                                  onClick={() => assignRole(user)}
                                  disabled={isBusy || selectedRoles[user.id] === user.role}
                                  title="Assign selected role"
                                >
                                  {isBusy ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <i className="bi bi-arrow-repeat" />
                                  )}
                                  Assign
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-top">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default StaffApprovalsPanel;
