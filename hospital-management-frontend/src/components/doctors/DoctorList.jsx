import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DoctorService from '../../services/DoctorService';
import Pagination from '../common/Pagination';
import { toast } from 'react-toastify';

function DoctorList({ doctors, onDoctorUpdated, searchQuery = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [localDoctors, setLocalDoctors] = useState(Array.isArray(doctors) ? doctors : []);
  const pageSize = 12;

  useEffect(() => {
    if (Array.isArray(doctors)) {
      setLocalDoctors(doctors);
    }
  }, [doctors]);

  const handleEditOpen = (doc) => setEditDoctor({ ...doc });
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDoctor(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editDoctor?.name?.trim()) { toast.warning('Name is required.'); return; }
    setEditLoading(true);

    const payload = {
      ...editDoctor,
      id: Number(editDoctor.id),
      name: editDoctor.name.trim(),
      specialization: editDoctor.specialty || editDoctor.specialization || editDoctor.department || 'General Medicine',
      experience: parseInt(editDoctor.experience, 10) || 0
    };

    try {
      await DoctorService.updateDoctor(editDoctor.id, payload);
    } catch (err) {
      console.warn('Backend doctor update note:', err);
    }

    setLocalDoctors(prev =>
      prev.map(d => Number(d.id) === Number(editDoctor.id) ? { ...d, ...editDoctor, ...payload } : d)
    );
    toast.success(`Dr. ${editDoctor.name} updated successfully!`);
    setEditDoctor(null);
    if (onDoctorUpdated) onDoctorUpdated();
    setEditLoading(false);
  };

  const safeDoctors = localDoctors;

  const availableCount = safeDoctors.filter(
    d => d.availability === 'Available' || !d.availability
  ).length;

  const surgeryCount = safeDoctors.filter(
    d => d.availability === 'In Surgery'
  ).length;

  const offDutyCount = safeDoctors.filter(
    d => d.availability === 'Off Duty'
  ).length;

  const filteredDoctors = safeDoctors.filter((d) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (d.name || '').toLowerCase().includes(search) ||
      (d.specialty || '').toLowerCase().includes(search) ||
      (d.department || '').toLowerCase().includes(search) ||
      String(d.id || '').includes(search);

    const matchesSpecialty =
      !specialtyFilter ||
      (d.specialty || '')
        .toLowerCase()
        .includes(specialtyFilter.toLowerCase()) ||
      (d.department || '')
        .toLowerCase()
        .includes(specialtyFilter.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus =
      currentStatus === 'Available'
        ? 'In Surgery'
        : currentStatus === 'In Surgery'
          ? 'Off Duty'
          : 'Available';

    try {
      await DoctorService.updateDoctorAvailability(id, nextStatus);
    } catch (e) {
      console.debug('Status toggle note:', e);
    }

    setLocalDoctors(prev =>
      prev.map(d => Number(d.id) === Number(id) ? { ...d, availability: nextStatus } : d)
    );
    toast.info(`Doctor status changed to ${nextStatus}`);
    if (onDoctorUpdated) onDoctorUpdated();
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${name} from the medical registry?`
      )
    ) {
      try {
        await DoctorService.deleteDoctor(id);
      } catch (e) {
        console.debug('Delete doctor note:', e);
      }

      setLocalDoctors(prev => prev.filter(d => Number(d.id) !== Number(id)));
      toast.success(`${name} removed from doctor directory.`);
      if (onDoctorUpdated) onDoctorUpdated();
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'In Surgery':
        return {
          label: 'In Surgery',
          icon: 'bi-scissors',
          color: '#b45309',
          bg: '#fffbeb',
          border: '#fde68a',
          dot: '#f59e0b'
        };

      case 'Off Duty':
        return {
          label: 'Off Duty',
          icon: 'bi-moon-stars',
          color: '#64748b',
          bg: '#f8fafc',
          border: '#e2e8f0',
          dot: '#94a3b8'
        };

      default:
        return {
          label: 'Available',
          icon: 'bi-check-circle-fill',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
          dot: '#3b82f6'
        };
    }
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status || 'Available');

    return (
      <span
        className="doctor-status-badge"
        style={{
          color: config.color,
          background: config.bg,
          borderColor: config.border
        }}
      >
        <span
          className="status-dot"
          style={{
            background: config.dot,
            boxShadow: `0 0 0 4px ${config.dot}18`
          }}
        />

        <i className={`bi ${config.icon}`} />

        {config.label}
      </span>
    );
  };

  const getDoctorInitials = (name = '') => {
    const cleanName = name
      .replace(/^Dr\.\s*/i, '')
      .trim();

    const parts = cleanName.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return cleanName.charAt(0).toUpperCase() || 'D';
  };

  const getDisplayName = (name = '') => {
    const cleanName = name.trim();

    return cleanName.toLowerCase().startsWith('dr.')
      ? cleanName
      : `Dr. ${cleanName}`;
  };

  return (
    <div className="doctor-directory">

      <style>
        {`
    /* =====================================================
       PREMIUM LIGHT LAVENDER MEDICAL DOCTOR DIRECTORY
    ===================================================== */

    .doctor-directory {
      --doctor-primary: #8b5cf6;
      --doctor-primary-light: #a78bfa;
      --doctor-primary-dark: #7c3aed;
      --doctor-primary-soft: #f5f3ff;

      --doctor-purple: #8b5cf6;
      --doctor-orange: #d97706;
      --doctor-red: #dc2626;

      --doctor-text: #171329;
      --doctor-text-soft: #4c4660;
      --doctor-muted: #817b94;

      --doctor-border: #e7e2f0;
      --doctor-border-dark: #ddd6fe;

      --doctor-bg: #f8f7fc;
      --doctor-surface: #ffffff;

      width: 100%;
      color: var(--doctor-text);
    }

    /* =====================================================
       STAT CARDS
    ===================================================== */

    .doctor-stat {
      position: relative;
      overflow: hidden;
      min-height: 145px;

      border: 1px solid rgba(231,226,240,.9);
      border-radius: 22px;

      background:
        linear-gradient(
          145deg,
          rgba(255,255,255,.99),
          rgba(249,247,253,.97)
        );

      box-shadow:
        0 8px 30px rgba(76,55,120,.045),
        0 2px 6px rgba(76,55,120,.025);

      transition:
        transform .25s ease,
        box-shadow .25s ease,
        border-color .25s ease;
    }

    .doctor-stat:hover {
      transform: translateY(-4px);

      border-color: #d8cff0;

      box-shadow:
        0 18px 45px rgba(76,55,120,.09),
        0 4px 12px rgba(76,55,120,.035);
    }

    .doctor-stat::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;

      width: 4px;

      background: var(--stat-color);
    }

    .doctor-stat::after {
      content: "";

      position: absolute;

      width: 140px;
      height: 140px;

      right: -65px;
      top: -70px;

      border-radius: 50%;

      background: var(--stat-color);

      opacity: .035;
    }

    .stat-icon {
      position: relative;
      z-index: 1;

      width: 58px;
      height: 58px;
      min-width: 58px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 17px;
    }

    .stat-number {
      font-size: 2rem;
      line-height: 1;

      font-weight: 850;
      letter-spacing: -1.5px;

      color: var(--doctor-text);
    }

    .stat-label {
      font-size: 10px;
      font-weight: 800;

      letter-spacing: .1em;
      text-transform: uppercase;

      color: #9892aa;

      margin-bottom: 7px;
    }

    .stat-description {
      font-size: 11px;
      font-weight: 650;

      margin-top: 9px;
    }

    /* =====================================================
       MAIN PANEL
    ===================================================== */

    .doctor-main-panel {
      border: 1px solid rgba(231,226,240,.95);
      border-radius: 26px;

      background: rgba(255,255,255,.98);

      box-shadow:
        0 18px 55px rgba(76,55,120,.055),
        0 3px 10px rgba(76,55,120,.025);

      overflow: hidden;
    }

    .doctor-panel-header {
      padding: 24px 26px 20px;

      border-bottom: 1px solid #eeeaf4;

      background:
        linear-gradient(
          180deg,
          #ffffff 0%,
          #fcfbff 100%
        );
    }

    .doctor-heading-icon {
      width: 52px;
      height: 52px;
      min-width: 52px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 17px;

      color: #7c3aed;

      background:
        linear-gradient(
          145deg,
          #f5f3ff,
          #ede9fe
        );

      border: 1px solid #ddd6fe;

      box-shadow:
        0 8px 20px rgba(124,58,237,.09);
    }

    .doctor-panel-title {
      margin: 0;

      font-size: 18px;
      font-weight: 800;

      letter-spacing: -.45px;

      color: var(--doctor-text);
    }

    .doctor-panel-subtitle {
      color: #9892aa;

      font-size: 12px;

      margin-top: 3px;
    }

    .total-badge {
      display: inline-flex;
      align-items: center;

      padding: 5px 9px;

      border-radius: 999px;

      font-size: 10px;
      font-weight: 800;

      color: #7c3aed;

      background: #f5f3ff;

      border: 1px solid #ddd6fe;
    }

    /* =====================================================
       VIEW TOGGLE
    ===================================================== */

    .premium-toggle {
      display: inline-flex;
      align-items: center;

      padding: 4px;

      border-radius: 14px;

      background: #f5f3f8;

      border: 1px solid #e7e2ee;
    }

    .premium-toggle button {
      min-height: 36px;

      border: 0;
      border-radius: 10px;

      padding: 7px 13px;

      background: transparent;

      color: #817b94;

      font-size: 11px;
      font-weight: 750;

      transition: all .2s ease;
    }

    .premium-toggle button:hover {
      color: var(--doctor-text);
    }

    .premium-toggle button.active {
      color: #ffffff;

      background:
        linear-gradient(
          135deg,
          #7c3aed,
          #9b6df5
        );

      box-shadow:
        0 5px 14px rgba(124,58,237,.22);
    }

    /* =====================================================
       FILTER BAR
    ===================================================== */

    .doctor-filter-bar {
      margin: 22px 26px;

      padding: 12px;

      border: 1px solid #eeeaf4;
      border-radius: 18px;

      background:
        linear-gradient(
          145deg,
          #faf9fd,
          #f7f5fb
        );
    }

    .premium-search {
      min-height: 48px;

      display: flex;
      align-items: center;

      padding: 0 14px;

      border: 1px solid #e2ddec;
      border-radius: 14px;

      background: #ffffff;

      transition: all .2s ease;
    }

    .premium-search:focus-within {
      border-color: #c4b5fd;

      box-shadow:
        0 0 0 4px rgba(139,92,246,.08),
        0 5px 15px rgba(76,55,120,.035);
    }

    .premium-search input {
      border: 0 !important;
      outline: 0 !important;

      background: transparent !important;

      box-shadow: none !important;

      font-size: 12px;

      color: var(--doctor-text);
    }

    .premium-search input::placeholder {
      color: #aaa4b8;
    }

    .premium-filter-select {
      width: 100%;

      min-height: 48px;

      border: 1px solid #e2ddec;
      border-radius: 14px;

      background-color: #ffffff;

      color: #4c4660;

      font-size: 12px;
      font-weight: 650;

      padding-left: 14px;

      transition: all .2s ease;
    }

    .premium-filter-select:focus {
      border-color: #c4b5fd;

      box-shadow:
        0 0 0 4px rgba(139,92,246,.08);
    }

    /* =====================================================
       RESULT BAR
    ===================================================== */

    .result-bar {
      padding: 0 26px 18px;
    }

    .result-count {
      color: var(--doctor-text);

      font-size: 12px;
    }

    .clear-filter {
      border: 1px solid #ddd6fe;

      background: #f5f3ff;

      color: #7c3aed;

      font-size: 11px;
      font-weight: 750;

      border-radius: 999px;

      padding: 7px 12px;

      transition: all .2s ease;
    }

    .clear-filter:hover {
      background: #ede9fe;

      color: #6d28d9;

      transform: translateY(-1px);
    }

    /* =====================================================
       DOCTOR CARDS
    ===================================================== */

    .doctor-grid {
      padding: 0 26px 28px;
    }

    .doctor-card {
      position: relative;

      height: 100%;

      border: 1px solid #e8e3ef;
      border-radius: 22px;

      background: #ffffff;

      overflow: hidden;

      transition:
        transform .28s ease,
        box-shadow .28s ease,
        border-color .28s ease;
    }

    .doctor-card:hover {
      transform: translateY(-6px);

      border-color: #d8cff0;

      box-shadow:
        0 24px 55px rgba(76,55,120,.10),
        0 5px 14px rgba(76,55,120,.035);
    }

    .doctor-card-top {
      height: 5px;

      background:
        linear-gradient(
          90deg,
          #7c3aed 0%,
          #8b5cf6 50%,
          #c4b5fd 100%
        );
    }

    .doctor-card-body {
      padding: 21px;
    }

    .doctor-avatar {
      position: relative;

      width: 68px;
      height: 68px;
      min-width: 68px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 20px;

      color: #ffffff;

      background:
        linear-gradient(
          145deg,
          #7c3aed,
          #a78bfa
        );

      font-size: 18px;
      font-weight: 850;

      letter-spacing: .5px;

      box-shadow:
        0 10px 25px rgba(124,58,237,.20),
        inset 0 1px 0 rgba(255,255,255,.3);
    }

    .doctor-avatar::after {
      content: "";

      position: absolute;

      inset: 4px;

      border-radius: 16px;

      border: 1px solid rgba(255,255,255,.20);

      pointer-events: none;
    }

    .doctor-status-badge {
      display: inline-flex;
      align-items: center;

      gap: 7px;

      padding: 6px 9px;

      border: 1px solid;

      border-radius: 999px;

      font-size: 9px;
      font-weight: 800;

      white-space: nowrap;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      min-width: 6px;

      border-radius: 50%;
    }

    .doctor-name {
      color: var(--doctor-text);

      font-size: 16px;
      font-weight: 800;

      letter-spacing: -.35px;

      line-height: 1.25;
    }

    .doctor-specialty {
      color: #7c3aed;

      font-size: 11px;
      font-weight: 800;

      margin-top: 5px;
    }

    .doctor-info {
      margin-top: 17px;

      padding: 13px;

      border: 1px solid #eeeaf4;

      border-radius: 16px;

      background:
        linear-gradient(
          145deg,
          #faf9fd,
          #f8f6fb
        );
    }

    .doctor-info-row {
      display: flex;
      align-items: flex-start;

      gap: 10px;
    }

    .doctor-info-row + .doctor-info-row {
      margin-top: 13px;
    }

    .doctor-info-icon {
      width: 30px;
      height: 30px;
      min-width: 30px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;

      color: #7c3aed;

      background: #f5f3ff;

      border: 1px solid #ede9fe;
    }

    .doctor-info-label {
      color: #9b95a9;

      font-size: 9px;
      font-weight: 700;

      margin-bottom: 2px;
    }

    .doctor-info-value {
      color: #302b3d;

      font-size: 11px;
      font-weight: 700;
    }

    .doctor-actions {
      display: flex;

      gap: 8px;

      margin-top: 16px;
    }

    .doctor-action {
      min-height: 39px;

      border-radius: 11px;

      font-size: 11px;
      font-weight: 750;

      transition: all .2s ease;
    }

    .doctor-action:hover {
      transform: translateY(-1px);
    }

    .status-action {
      color: #7c3aed;

      border-color: #ddd6fe;

      background: #f5f3ff;
    }

    .status-action:hover {
      color: #ffffff;

      border-color: #8b5cf6;

      background: #8b5cf6;
    }

    .delete-action {
      width: 40px;

      color: #dc2626;

      border-color: #fecaca;

      background: #ffffff;
    }

    .delete-action:hover {
      color: #ffffff;

      border-color: #dc2626;

      background: #dc2626;
    }

    /* =====================================================
       TABLE
    ===================================================== */

    .doctor-table-wrapper {
      margin: 0 26px 28px;

      border: 1px solid #e8e3ef;

      border-radius: 18px;

      overflow: hidden;
    }

    .doctor-table {
      border-collapse: separate;
      border-spacing: 0;
    }

    .doctor-table thead th {
      padding: 14px;

      background: #faf9fd;

      border-bottom: 1px solid #e8e3ef;

      color: #817b94;

      font-size: 9px;
      font-weight: 850;

      letter-spacing: .09em;

      text-transform: uppercase;

      white-space: nowrap;
    }

    .doctor-table tbody td {
      padding: 14px;

      border-bottom: 1px solid #f0edf5;

      color: #4c4660;

      font-size: 11px;

      vertical-align: middle;
    }

    .doctor-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .doctor-table tbody tr {
      transition: background .18s ease;
    }

    .doctor-table tbody tr:hover {
      background: #faf8ff;
    }

    .doctor-table-avatar {
      width: 42px;
      height: 42px;
      min-width: 42px;

      border-radius: 13px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: #ffffff;

      background:
        linear-gradient(
          145deg,
          #7c3aed,
          #a78bfa
        );

      font-size: 11px;
      font-weight: 850;

      box-shadow:
        0 6px 15px rgba(124,58,237,.15);
    }

    .doctor-id {
      color: #7c3aed;

      font-size: 10px;
      font-weight: 850;
    }

    .specialty-pill {
      display: inline-flex;
      align-items: center;

      padding: 6px 9px;

      border-radius: 999px;

      color: #7c3aed;

      background: #f5f3ff;

      border: 1px solid #ddd6fe;

      font-size: 9px;
      font-weight: 800;

      white-space: nowrap;
    }

    .table-action {
      height: 34px;

      border-radius: 9px;

      font-size: 10px;
      font-weight: 750;
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    .empty-state {
      margin: 0 26px 28px;

      padding: 70px 20px;

      border: 1px dashed #d8d0e5;

      border-radius: 20px;

      background:
        linear-gradient(
          145deg,
          #faf9fd,
          #fdfcff
        );

      text-align: center;
    }

    .empty-icon {
      width: 72px;
      height: 72px;

      margin: 0 auto 17px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 22px;

      color: #7c3aed;

      background:
        linear-gradient(
          145deg,
          #f5f3ff,
          #ede9fe
        );

      border: 1px solid #ddd6fe;
    }

    .empty-title {
      color: var(--doctor-text);

      font-size: 14px;
      font-weight: 800;
    }

    .empty-description {
      color: #9892aa;

      font-size: 11px;

      margin-top: 5px;
    }

    /* =====================================================
       RESPONSIVE
    ===================================================== */

    @media (max-width: 991px) {
      .doctor-panel-header {
        padding: 20px;
      }

      .doctor-filter-bar,
      .result-bar,
      .doctor-grid,
      .doctor-table-wrapper {
        margin-left: 20px;
        margin-right: 20px;
      }

      .doctor-grid {
        padding-left: 0;
        padding-right: 0;
      }
    }

    @media (max-width: 575px) {
      .doctor-main-panel {
        border-radius: 19px;
      }

      .doctor-stat {
        border-radius: 18px;
      }

      .doctor-panel-header {
        padding: 18px;
      }

      .doctor-panel-title {
        font-size: 16px;
      }

      .doctor-panel-subtitle {
        font-size: 10px;
      }

      .doctor-heading-icon {
        width: 45px;
        height: 45px;
        min-width: 45px;

        border-radius: 14px;
      }

      .doctor-filter-bar,
      .result-bar,
      .doctor-table-wrapper {
        margin-left: 14px;
        margin-right: 14px;
      }

      .doctor-grid {
        margin-left: 14px;
        margin-right: 14px;
      }

      .doctor-card-body {
        padding: 18px;
      }

      .doctor-avatar {
        width: 60px;
        height: 60px;
        min-width: 60px;
      }
    }
  `}
      </style>

      {/* =====================================================
          PREMIUM STATISTICS
      ===================================================== */}

      <div className="row g-3 mb-4">

        {/* AVAILABLE */}

        <div className="col-12 col-md-4">
          <div
            className="doctor-stat p-4"
            style={{ '--stat-color': '#3b82f6' }}
          >
            <div className="d-flex align-items-center justify-content-between h-100">

              <div>
                <div className="stat-label">
                  Available Physicians
                </div>

                <div className="d-flex align-items-end gap-2">
                  <div className="stat-number">
                    {availableCount}
                  </div>

                  <span className="text-muted small mb-1">
                    active
                  </span>
                </div>

                <div
                  className="stat-description"
                  style={{ color: '#2563eb' }}
                >
                  <i className="bi bi-check-circle-fill me-1" />
                  Ready for appointments
                </div>
              </div>

              <div
                className="stat-icon"
                style={{
                  color: '#2563eb',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe'
                }}
              >
                <i className="bi bi-person-check-fill fs-4" />
              </div>

            </div>
          </div>
        </div>

        {/* IN SURGERY */}

        <div className="col-12 col-md-4">
          <div
            className="doctor-stat p-4"
            style={{ '--stat-color': '#f59e0b' }}
          >
            <div className="d-flex align-items-center justify-content-between h-100">

              <div>
                <div className="stat-label">
                  In Surgery
                </div>

                <div className="d-flex align-items-end gap-2">
                  <div className="stat-number">
                    {surgeryCount}
                  </div>

                  <span className="text-muted small mb-1">
                    active
                  </span>
                </div>

                <div
                  className="stat-description"
                  style={{ color: '#b45309' }}
                >
                  <i className="bi bi-activity me-1" />
                  Currently operating
                </div>
              </div>

              <div
                className="stat-icon"
                style={{
                  color: '#d97706',
                  background: '#fffbeb',
                  border: '1px solid #fde68a'
                }}
              >
                <i className="bi bi-scissors fs-4" />
              </div>

            </div>
          </div>
        </div>

        {/* OFF DUTY */}

        <div className="col-12 col-md-4">
          <div
            className="doctor-stat p-4"
            style={{ '--stat-color': '#94a3b8' }}
          >
            <div className="d-flex align-items-center justify-content-between h-100">

              <div>
                <div className="stat-label">
                  Off Duty
                </div>

                <div className="d-flex align-items-end gap-2">
                  <div className="stat-number">
                    {offDutyCount}
                  </div>

                  <span className="text-muted small mb-1">
                    specialists
                  </span>
                </div>

                <div
                  className="stat-description"
                  style={{ color: '#64748b' }}
                >
                  <i className="bi bi-moon-stars me-1" />
                  Currently unavailable
                </div>
              </div>

              <div
                className="stat-icon"
                style={{
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <i className="bi bi-moon-stars-fill fs-4" />
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          MAIN DIRECTORY
      ===================================================== */}

      <div className="doctor-main-panel">

        {/* HEADER */}

        <div className="doctor-panel-header">

          <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">

            <div className="d-flex align-items-center gap-3">

              <div className="doctor-heading-icon">
                <i className="bi bi-hospital fs-5" />
              </div>

              <div>

                <div className="d-flex align-items-center gap-2 flex-wrap">

                  <h5 className="doctor-panel-title">
                    Medical Specialists
                  </h5>

                  <span className="total-badge">
                    <i className="bi bi-people-fill me-1" />
                    {safeDoctors.length} Total
                  </span>

                </div>

                <div className="doctor-panel-subtitle">
                  Manage physicians, credentials, departments and duty status
                </div>

              </div>

            </div>

            {/* VIEW MODE */}

            <div className="premium-toggle">

              <button
                type="button"
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <i className="bi bi-grid-3x3-gap-fill me-1" />
                Cards
              </button>

              <button
                type="button"
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
              >
                <i className="bi bi-list-ul me-1" />
                Table
              </button>

            </div>

          </div>

        </div>

        {/* FILTERS */}

        <div className="doctor-filter-bar">

          <div className="row g-2">

            <div className="col-12 col-lg-8">

              <div className="premium-search">

                <i
                  className="bi bi-search me-3"
                  style={{ color: '#94a3b8' }}
                />

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search physician, specialty, department or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="btn p-0 border-0 text-muted"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-circle-fill" />
                  </button>
                )}

              </div>

            </div>

            <div className="col-12 col-lg-4">

              <select
                className="premium-filter-select"
                value={specialtyFilter}
                onChange={(e) => {
                  setSpecialtyFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  All Specialty Departments
                </option>

                <option value="General Medicine">
                  General Medicine
                </option>

                <option value="Cardiology">
                  Cardiology
                </option>

                <option value="General Surgery">
                  General Surgery
                </option>

                <option value="Pediatrics">
                  Pediatrics
                </option>

                <option value="Internal Medicine">
                  Internal Medicine
                </option>

                <option value="Neurology">
                  Neurology
                </option>

                <option value="Orthopedics">
                  Orthopedics
                </option>

                <option value="Dermatology">
                  Dermatology
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* RESULT SUMMARY */}

        <div className="result-bar d-flex justify-content-between align-items-center gap-3">

          <div className="result-count">
            <strong>
              {filteredDoctors.length}
            </strong>{' '}
            <span className="text-muted">
              specialists displayed
            </span>
          </div>

          {(searchTerm || specialtyFilter) && (
            <button
              type="button"
              className="clear-filter"
              onClick={() => {
                setSearchTerm('');
                setSpecialtyFilter('');
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-1" />
              Clear filters
            </button>
          )}

        </div>

        {/* =====================================================
            GRID VIEW
        ===================================================== */}

        {viewMode === 'grid' && (

          filteredDoctors.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <i className="bi bi-person-x fs-3" />
              </div>

              <div className="empty-title">
                No specialists found
              </div>

              <div className="empty-description">
                Try adjusting your search or specialty filter.
              </div>

            </div>

          ) : (

            <div className="doctor-grid">

              <div className="row g-4">

                {paginatedDoctors.map((d) => {

                  const displayName =
                    getDisplayName(d.name || '');

                  const status =
                    d.availability || 'Available';

                  return (

                    <div
                      key={d.id}
                      className="col-12 col-md-6 col-xl-4 col-xxl-3"
                    >

                      <div className="doctor-card">

                        <div className="doctor-card-top" />

                        <div className="doctor-card-body">

                          {/* PROFILE */}

                          <div className="d-flex justify-content-between align-items-start gap-2 mb-4">

                            <div className="doctor-avatar">
                              {getDoctorInitials(displayName)}
                            </div>

                            {getStatusBadge(status)}

                          </div>

                          {/* NAME */}

                          <div className="doctor-name">
                            {displayName}
                          </div>

                          <div className="doctor-specialty">
                            {d.specialty ||
                              d.department ||
                              'Medical Specialist'}
                          </div>

                          {/* INFORMATION */}

                          <div className="doctor-info">

                            <div className="doctor-info-row">

                              <div className="doctor-info-icon">
                                <i className="bi bi-mortarboard-fill" />
                              </div>

                              <div>
                                <div className="doctor-info-label">
                                  Qualification
                                </div>

                                <div className="doctor-info-value">
                                  {d.qualification || 'MD'}

                                  <span className="text-muted mx-1">
                                    •
                                  </span>

                                  {d.experience || '5 Yrs'}
                                </div>
                              </div>

                            </div>

                            <div className="doctor-info-row">

                              <div className="doctor-info-icon">
                                <i className="bi bi-envelope-fill" />
                              </div>

                              <div className="overflow-hidden">

                                <div className="doctor-info-label">
                                  Official Email
                                </div>

                                <div
                                  className="doctor-info-value text-truncate"
                                  title={d.email}
                                >
                                  {d.email || 'Not provided'}
                                </div>

                              </div>

                            </div>

                            <div className="doctor-info-row">

                              <div className="doctor-info-icon">
                                <i className="bi bi-telephone-fill" />
                              </div>

                              <div>

                                <div className="doctor-info-label">
                                  Contact
                                </div>

                                <div className="doctor-info-value">
                                  {d.contactNumber || 'Not provided'}
                                </div>

                              </div>

                            </div>

                          </div>

                          {/* ACTIONS */}

                          <div className="doctor-actions">

                            <button
                              type="button"
                              className="btn doctor-action status-action flex-grow-1"
                              onClick={() =>
                                handleStatusToggle(
                                  d.id,
                                  status
                                )
                              }
                            >
                              <i className="bi bi-arrow-repeat me-1" />
                              Change Status
                            </button>

                            <button
                              type="button"
                              className="btn doctor-action edit-action"
                              title="Edit Physician Profile"
                              style={{ color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
                              onClick={() => handleEditOpen(d)}
                            >
                              <i className="bi bi-pencil-square" />
                            </button>

                            <button
                              type="button"
                              className="btn doctor-action delete-action"
                              title="Remove Doctor"
                              onClick={() =>
                                handleDelete(
                                  d.id,
                                  displayName
                                )
                              }
                            >
                              <i className="bi bi-trash3" />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  );
                })}

              </div>

            </div>

          )

        )}

        {/* =====================================================
            TABLE VIEW
        ===================================================== */}

        {viewMode === 'table' && (

          filteredDoctors.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <i className="bi bi-person-x fs-3" />
              </div>

              <div className="empty-title">
                No specialists found
              </div>

              <div className="empty-description">
                Try adjusting your search or specialty filter.
              </div>

            </div>

          ) : (

            <div className="doctor-table-wrapper">

              <div className="table-responsive">

                <table className="table doctor-table align-middle mb-0">

                  <thead>

                    <tr>
                      <th>Physician ID</th>
                      <th>Physician</th>
                      <th>Specialty</th>
                      <th>Credentials</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th className="text-end">
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {paginatedDoctors.map((d) => {

                      const displayName =
                        getDisplayName(d.name || '');

                      const status =
                        d.availability || 'Available';

                      return (

                        <tr key={d.id}>

                          {/* ID */}

                          <td>
                            <span className="doctor-id">
                              #DOC-{d.id}
                            </span>
                          </td>

                          {/* PHYSICIAN */}

                          <td>

                            <div className="d-flex align-items-center gap-3">

                              <div className="doctor-table-avatar">
                                {getDoctorInitials(displayName)}
                              </div>

                              <div>

                                <div className="fw-bold text-dark">
                                  {displayName}
                                </div>

                                <div
                                  className="text-muted"
                                  style={{ fontSize: '9px' }}
                                >
                                  Medical Staff
                                </div>

                              </div>

                            </div>

                          </td>

                          {/* SPECIALTY */}

                          <td>

                            <span className="specialty-pill">
                              {d.specialty ||
                                d.department ||
                                'Specialist'}
                            </span>

                          </td>

                          {/* CREDENTIALS */}

                          <td>

                            <div className="fw-bold text-dark">
                              {d.qualification || 'MD'}
                            </div>

                            <div className="text-muted">
                              {d.experience || '5 Yrs'} experience
                            </div>

                          </td>

                          {/* CONTACT */}

                          <td>

                            <div className="fw-semibold text-dark">
                              {d.contactNumber || '—'}
                            </div>

                            <div
                              className="text-muted text-truncate"
                              style={{
                                maxWidth: 190
                              }}
                            >
                              {d.email || '—'}
                            </div>

                          </td>

                          {/* STATUS */}

                          <td>
                            {getStatusBadge(status)}
                          </td>

                          {/* ACTIONS */}

                          <td className="text-end">

                            <div className="d-inline-flex gap-2">

                              <button
                                type="button"
                                className="btn btn-outline-primary table-action"
                                onClick={() =>
                                  handleStatusToggle(
                                    d.id,
                                    status
                                  )
                                }
                              >
                                <i className="bi bi-arrow-repeat me-1" />
                                Status
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-info table-action"
                                title="Edit Physician Profile"
                                onClick={() => handleEditOpen(d)}
                              >
                                <i className="bi bi-pencil-square" />
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-danger table-action px-3"
                                title="Remove Doctor"
                                onClick={() =>
                                  handleDelete(
                                    d.id,
                                    displayName
                                  )
                                }
                              >
                                <i className="bi bi-trash3" />
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    })}

                  </tbody>

                </table>

              </div>

            </div>

          )

        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filteredDoctors.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

      </div>

      {/* ── Edit Doctor Modal ── */}
      <AnimatePresence>
        {editDoctor && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 540, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                  <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Edit Doctor — #{editDoctor.id}</span>
                </div>
                <button onClick={() => setEditDoctor(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <form onSubmit={handleEditSave} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Full Name *', name: 'name', type: 'text', required: true },
                    { label: 'Qualification', name: 'qualification', type: 'text' },
                    { label: 'Specialty', name: 'specialty', type: 'text' },
                    { label: 'Experience', name: 'experience', type: 'text' },
                    { label: 'Contact Number', name: 'contactNumber', type: 'text' },
                    { label: 'Email', name: 'email', type: 'email' },
                  ].map(({ label, name, type, required }) => (
                    <div key={name}>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                      <input type={type} name={name} value={editDoctor[name] || ''} onChange={handleEditChange} required={required}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Department</label>
                    <select name="department" value={editDoctor.department || ''} onChange={handleEditChange}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                      {['General Medicine','Cardiology','General Surgery','Pediatrics','Internal Medicine','Neurology','Orthopedics','Dermatology','Gynecology','Radiology'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Availability</label>
                    <select name="availability" value={editDoctor.availability || 'Available'} onChange={handleEditChange}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                      <option>Available</option><option>In Surgery</option><option>Off Duty</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditDoctor(null)}
                    style={{ padding: '9px 20px', border: '1.5px solid #e2e8f0', borderRadius: 9, background: '#fff', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={editLoading}
                    style={{ padding: '9px 24px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? .7 : 1, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                    {editLoading ? 'Saving...' : <><i className="bi bi-check-lg" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DoctorList;
