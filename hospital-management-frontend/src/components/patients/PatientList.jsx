import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PatientService from '../../services/PatientService';
import Pagination from '../common/Pagination';
import { toast } from 'react-toastify';

function PatientList({ patients, onPatientDeleted, onPatientUpdated, searchQuery = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleEditOpen = (patient) => {
    setEditPatient({ ...patient });
    setSelectedPatient(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editPatient?.name?.trim() || !editPatient?.contactNumber?.trim()) {
      toast.warning('Name and Contact Number are required.');
      return;
    }
    setEditLoading(true);
    try {
      await PatientService.updatePatient(editPatient.id, editPatient);
      toast.success(`Patient ${editPatient.name} updated successfully!`);
      setEditPatient(null);
      if (onPatientUpdated) onPatientUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient.');
    } finally {
      setEditLoading(false);
    }
  };

  const safePatients = Array.isArray(patients) ? patients : [];

  const admittedCount = safePatients.filter(
    (p) => p.status === 'Admitted' || !p.status
  ).length;

  const opdCount = safePatients.filter(
    (p) => p.status === 'Outpatient'
  ).length;

  const dischargedCount = safePatients.filter(
    (p) => p.status === 'Discharged'
  ).length;

  const filteredPatients = safePatients.filter((p) => {
    const name = p.name || '';
    const id = p.id?.toString() || '';
    const disease = p.disease || '';

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(search) ||
      id.includes(search) ||
      disease.toLowerCase().includes(search);

    const matchesBlood =
      !bloodGroupFilter || p.bloodGroup === bloodGroupFilter;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'Admitted'
        ? p.status === 'Admitted' || !p.status
        : p.status === statusFilter);

    return matchesSearch && matchesBlood && matchesStatus;
  });
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to remove the patient record for ${name}?`
      )
    ) {
      try {
        await PatientService.deletePatient(id);

        toast.success(`Patient ${name} record deleted.`);

        if (onPatientDeleted) {
          onPatientDeleted();
        }
      } catch (error) {
        console.error('Delete patient error:', error);
        toast.error('Failed to delete patient record.');
      }
    }
  };

  const exportCSV = () => {
    if (filteredPatients.length === 0) {
      toast.info('No records to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Age',
      'Gender',
      'Blood Group',
      'Contact',
      'Status',
      'Diagnosis',
      'Address'
    ];

    const rows = filteredPatients.map((p) => [
      p.id,
      `"${p.name || ''}"`,
      p.age,
      p.gender,
      p.bloodGroup || 'N/A',
      `"${p.contactNumber || ''}"`,
      p.status || 'Admitted',
      `"${p.disease || ''}"`,
      `"${p.address || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patients_export_${new Date().toISOString().split('T')[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Patient records exported successfully!');
  };

  const getInitials = (name = '') => {
    const words = name.trim().split(' ').filter(Boolean);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getAvatarClass = (id) => {
    const colors = [
      'avatar-indigo',
      'avatar-blue',
      'avatar-purple',
      'avatar-teal',
      'avatar-cyan'
    ];

    return colors[(Number(id) || 0) % colors.length];
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = status || 'Admitted';

    if (normalizedStatus === 'Discharged') {
      return {
        className: 'status-discharged',
        icon: 'bi-check-circle-fill',
        label: 'Discharged'
      };
    }

    if (normalizedStatus === 'Outpatient') {
      return {
        className: 'status-outpatient',
        icon: 'bi-hospital',
        label: 'Outpatient'
      };
    }

    return {
      className: 'status-admitted',
      icon: 'bi-activity',
      label: 'Admitted'
    };
  };

  return (
    <>
      <style>{`
        .patient-dashboard {
          color: #172033;
        }

        /* =========================
           PREMIUM METRIC CARDS
        ========================= */

        .premium-metric {
          position: relative;
          overflow: hidden;
          min-height: 112px;
          padding: 20px;
          border: 1px solid #e7ebf2;
          border-radius: 20px;
          background: linear-gradient(
            145deg,
            #ffffff 0%,
            #fafbff 100%
          );
          box-shadow:
            0 3px 6px rgba(15, 23, 42, 0.025),
            0 12px 30px rgba(15, 23, 42, 0.045);
          transition: all 0.25s ease;
        }

        .premium-metric::after {
          content: '';
          position: absolute;
          width: 110px;
          height: 110px;
          right: -45px;
          top: -45px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.045);
        }

        .premium-metric:hover {
          transform: translateY(-2px);
          border-color: #dfe4f2;
          box-shadow:
            0 8px 15px rgba(15, 23, 42, 0.035),
            0 18px 40px rgba(15, 23, 42, 0.07);
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .metric-icon.indigo {
          color: #4f46e5;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          border: 1px solid #dfe4ff;
        }

        .metric-icon.cyan {
          color: #0891b2;
          background: linear-gradient(135deg, #ecfeff, #cffafe);
          border: 1px solid #cffafe;
        }

        .metric-icon.green {
          color: #059669;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid #d1fae5;
        }

        .metric-label {
          color: #7b8496;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 3px;
        }

        .metric-value {
          color: #172033;
          font-size: 25px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        /* =========================
           MAIN DIRECTORY
        ========================= */

        .directory-card {
          border: 1px solid #e6eaf1;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 4px 8px rgba(15, 23, 42, 0.025),
            0 15px 40px rgba(15, 23, 42, 0.055);
          overflow: hidden;
        }

        .directory-header {
          padding: 24px 26px 20px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(79, 70, 229, 0.075),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fafbff 100%
            );
          border-bottom: 1px solid #edf0f5;
        }

        .directory-title-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          background: #eef2ff;
          border: 1px solid #dfe5ff;
        }

        .directory-title {
          font-size: 15px;
          font-weight: 800;
          color: #172033;
          letter-spacing: -0.015em;
        }

        .directory-subtitle {
          margin-top: 3px;
          color: #8a93a5;
          font-size: 11px;
        }

        .export-btn {
          height: 40px;
          padding: 0 15px;
          border-radius: 11px;
          border: 1px solid #dfe4ec;
          background: #ffffff;
          color: #475467;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 3px 8px rgba(15, 23, 42, 0.035);
          transition: all 0.2s ease;
        }

        .export-btn:hover {
          color: #4f46e5;
          border-color: #c7d2fe;
          background: #f8faff;
          transform: translateY(-1px);
        }

        /* =========================
           FILTERS
        ========================= */

        .filter-panel {
          padding: 18px;
          margin: 20px 26px;
          border: 1px solid #e8ebf1;
          border-radius: 16px;
          background: #f8fafc;
        }

        .premium-search-group {
          height: 44px;
          border: 1px solid #e0e5ed;
          border-radius: 11px;
          background: #ffffff;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .premium-search-group:focus-within {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
        }

        .premium-search-icon {
          width: 43px;
          border: 0;
          background: transparent;
          color: #98a1b2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .premium-search {
          height: 42px;
          border: 0 !important;
          box-shadow: none !important;
          font-size: 12px;
          color: #344054;
        }

        .premium-search::placeholder {
          color: #a1a9b7;
        }

        .premium-select {
          height: 44px;
          border: 1px solid #e0e5ed !important;
          border-radius: 11px !important;
          background-color: #ffffff !important;
          color: #475467 !important;
          font-size: 11px;
          font-weight: 600;
          box-shadow: none !important;
        }

        .premium-select:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08) !important;
        }

        /* =========================
           TABLE
        ========================= */

        .table-container {
          margin: 0 26px 26px;
          border: 1px solid #e7ebf1;
          border-radius: 15px;
          overflow: hidden;
        }

        .premium-table {
          min-width: 1050px;
          margin: 0;
        }

        .premium-table thead th {
          padding: 13px 14px;
          border-bottom: 1px solid #e7ebf1;
          background: #f8fafc;
          color: #8a93a4;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .premium-table tbody tr {
          background: #ffffff;
          transition: all 0.18s ease;
        }

        .premium-table tbody tr:hover {
          background: #fafbff;
        }

        .premium-table tbody td {
          padding: 15px 14px;
          border-bottom: 1px solid #f0f2f6;
          color: #475467;
          font-size: 11px;
          vertical-align: middle;
        }

        .premium-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .patient-id {
          color: #6366f1;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .patient-avatar {
          width: 39px;
          height: 39px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .avatar-indigo {
          color: #4f46e5;
          background: #eef2ff;
        }

        .avatar-blue {
          color: #2563eb;
          background: #eff6ff;
        }

        .avatar-purple {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .avatar-teal {
          color: #0f766e;
          background: #f0fdfa;
        }

        .avatar-cyan {
          color: #0891b2;
          background: #ecfeff;
        }

        .patient-name {
          color: #172033;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.2;
        }

        .patient-meta {
          color: #9aa2b1;
          font-size: 10px;
          margin-top: 4px;
        }

        .info-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 800;
        }

        .gender-male {
          color: #2563eb;
          background: #eff6ff;
        }

        .gender-female {
          color: #db2777;
          background: #fdf2f8;
        }

        .gender-other {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .blood-pill {
          color: #b91c1c;
          background: #fef2f2;
        }

        .diagnosis-pill {
          display: inline-flex;
          align-items: center;
          max-width: 190px;
          padding: 6px 9px;
          border-radius: 8px;
          color: #be123c;
          background: #fff1f2;
          border: 1px solid #ffe4e6;
          font-size: 9px;
          font-weight: 700;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .status-admitted {
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #d1fae5;
        }

        .status-outpatient {
          color: #0369a1;
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
        }

        .status-discharged {
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px !important;
          border: 1px solid #e1e6ee !important;
          background: #ffffff !important;
          color: #667085 !important;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          color: #4f46e5 !important;
          border-color: #c7d2fe !important;
          background: #f8faff !important;
          transform: translateY(-1px);
        }

        .action-btn.delete:hover {
          color: #dc2626 !important;
          border-color: #fecaca !important;
          background: #fff7f7 !important;
        }

        /* =========================
           EMPTY STATE
        ========================= */

        .empty-state {
          padding: 65px 20px !important;
          text-align: center;
        }

        .empty-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 13px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #98a2b3;
          background: #f2f4f7;
          font-size: 24px;
        }

        .empty-title {
          color: #344054;
          font-size: 13px;
          font-weight: 800;
        }

        .empty-text {
          margin-top: 4px;
          color: #98a2b3;
          font-size: 11px;
        }

        /* =========================
           MODAL
        ========================= */

        .premium-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
        }

        .premium-modal {
          width: 100%;
          max-width: 650px;
          max-height: 92vh;
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          background: #ffffff;
          box-shadow:
            0 25px 60px rgba(15, 23, 42, 0.22),
            0 5px 20px rgba(15, 23, 42, 0.10);
          animation: modalIn 0.22s ease-out;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-top {
          padding: 22px 24px;
          color: #ffffff;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255,255,255,0.16),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #3730a3,
              #4f46e5 55%,
              #6366f1
            );
        }

        .modal-record-label {
          color: rgba(255, 255, 255, 0.68);
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .modal-record-id {
          margin-top: 3px;
          font-size: 17px;
          font-weight: 800;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-profile {
          padding: 25px;
        }

        .modal-avatar {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: #4f46e5;
          background: #eef2ff;
          border: 1px solid #dfe5ff;
          font-size: 23px;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.10);
        }

        .modal-patient-name {
          color: #172033;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .modal-status {
          margin-top: 7px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 24px;
        }

        .detail-card {
          padding: 14px;
          border: 1px solid #e8ebf1;
          border-radius: 13px;
          background: #fafbfc;
        }

        .detail-label {
          color: #98a2b3;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          margin-top: 5px;
          color: #344054;
          font-size: 11px;
          font-weight: 800;
        }

        .clinical-section {
          margin-top: 18px;
        }

        .clinical-label {
          margin-bottom: 7px;
          color: #667085;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .clinical-value {
          padding: 12px 13px;
          border: 1px solid #e8ebf1;
          border-radius: 11px;
          color: #344054;
          background: #fafbfc;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.5;
        }

        .diagnosis-box {
          color: #be123c;
          background: #fff5f6;
          border-color: #ffe4e6;
        }

        .modal-footer-premium {
          display: flex;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #edf0f4;
          background: #fafbfc;
        }

        .close-file-btn {
          height: 39px;
          padding: 0 17px;
          border: 1px solid #dfe4ec;
          border-radius: 10px;
          background: #ffffff;
          color: #475467;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .directory-header {
            padding: 20px;
          }

          .filter-panel {
            margin: 16px 20px;
          }

          .table-container {
            margin: 0 20px 20px;
          }

          .directory-title {
            font-size: 14px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="patient-dashboard">

        {/* =========================
            METRICS
        ========================= */}

        <div className="row g-3 mb-4">

          <div className="col-12 col-sm-4">
            <div className="premium-metric">
              <div className="d-flex align-items-center gap-3">

                <div className="metric-icon indigo">
                  <i className="bi bi-person-heart"></i>
                </div>

                <div>
                  <div className="metric-label">
                    Admitted In-Patients
                  </div>

                  <div className="metric-value">
                    {admittedCount}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="premium-metric">
              <div className="d-flex align-items-center gap-3">

                <div className="metric-icon cyan">
                  <i className="bi bi-hospital"></i>
                </div>

                <div>
                  <div className="metric-label">
                    Outpatient OPD
                  </div>

                  <div className="metric-value">
                    {opdCount}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="premium-metric">
              <div className="d-flex align-items-center gap-3">

                <div className="metric-icon green">
                  <i className="bi bi-check-circle-fill"></i>
                </div>

                <div>
                  <div className="metric-label">
                    Discharged
                  </div>

                  <div className="metric-value">
                    {dischargedCount}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* =========================
            DIRECTORY CARD
        ========================= */}

        <div className="directory-card">

          {/* Header */}

          <div className="directory-header">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

              <div className="d-flex align-items-center gap-3">

                <div className="directory-title-icon">
                  <i className="bi bi-people-fill"></i>
                </div>

                <div>
                  <div className="directory-title">
                    Patient Clinical Directory
                  </div>

                  <div className="directory-subtitle">
                    {filteredPatients.length} of {safePatients.length} patient records currently displayed
                  </div>
                </div>

              </div>

              <button
                type="button"
                className="export-btn align-self-start align-self-md-center"
                onClick={exportCSV}
              >
                <i className="bi bi-download me-2"></i>
                Export Registry
              </button>

            </div>

          </div>

          {/* Filters */}

          <div className="filter-panel">

            <div className="row g-2">

              <div className="col-12 col-lg-6">

                <div className="premium-search-group d-flex align-items-center">

                  <div className="premium-search-icon">
                    <i className="bi bi-search"></i>
                  </div>

                  <input
                    type="text"
                    className="form-control premium-search"
                    placeholder="Search name, patient ID, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />

                </div>

              </div>

              <div className="col-6 col-lg-3">

                <select
                  className="form-select premium-select"
                  value={bloodGroupFilter}
                  onChange={(e) => {
                    setBloodGroupFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Blood Groups
                  </option>

                  {[
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-'
                  ].map((bg) => (
                    <option key={bg} value={bg}>
                      Blood Group: {bg}
                    </option>
                  ))}
                </select>

              </div>

              <div className="col-6 col-lg-3">

                <select
                  className="form-select premium-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    All Patient Status
                  </option>

                  <option value="Admitted">
                    Admitted
                  </option>

                  <option value="Outpatient">
                    Outpatient
                  </option>

                  <option value="Discharged">
                    Discharged
                  </option>
                </select>

              </div>

            </div>

          </div>

          {/* Table */}

          <div className="table-container">

            <div className="table-responsive">

              <table className="table premium-table align-middle">

                <thead>
                  <tr>
                    <th className="ps-3">
                      Patient ID
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Gender / Blood
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Diagnosis
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end pe-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredPatients.length === 0 ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="empty-state"
                      >

                        <div className="empty-icon">
                          <i className="bi bi-person-x"></i>
                        </div>

                        <div className="empty-title">
                          No patient records found
                        </div>

                        <div className="empty-text">
                          Try changing your search or filter criteria.
                        </div>

                      </td>
                    </tr>

                  ) : (

                    paginatedPatients.map((p) => {

                      const statusConfig =
                        getStatusConfig(p.status);

                      return (
                        <tr key={p.id}>

                          {/* ID */}

                          <td className="ps-3">
                            <span className="patient-id">
                              #PAT-{p.id}
                            </span>
                          </td>

                          {/* Patient */}

                          <td>

                            <div className="d-flex align-items-center gap-3">

                              <div
                                className={`patient-avatar ${getAvatarClass(
                                  p.id
                                )}`}
                              >
                                {getInitials(p.name)}
                              </div>

                              <div>

                                <div className="patient-name">
                                  {p.name}
                                </div>

                                <div className="patient-meta">
                                  {p.age} years
                                  {' • '}
                                  {p.address || 'Address not available'}
                                </div>

                              </div>

                            </div>

                          </td>

                          {/* Gender / Blood */}

                          <td>

                            <div className="d-flex flex-wrap gap-1">

                              <span
                                className={`info-pill ${
                                  p.gender === 'Male'
                                    ? 'gender-male'
                                    : p.gender === 'Female'
                                    ? 'gender-female'
                                    : 'gender-other'
                                }`}
                              >
                                <i
                                  className={`bi ${
                                    p.gender === 'Male'
                                      ? 'bi-gender-male'
                                      : p.gender === 'Female'
                                      ? 'bi-gender-female'
                                      : 'bi-gender-ambiguous'
                                  }`}
                                ></i>

                                {p.gender || 'N/A'}
                              </span>

                              {p.bloodGroup && (
                                <span className="info-pill blood-pill">
                                  <i className="bi bi-droplet-fill"></i>
                                  {p.bloodGroup}
                                </span>
                              )}

                            </div>

                          </td>

                          {/* Contact */}

                          <td className="text-nowrap">

                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-telephone text-muted"></i>
                              <span>
                                {p.contactNumber || 'N/A'}
                              </span>
                            </div>

                          </td>

                          {/* Diagnosis */}

                          <td>

                            <span
                              className="diagnosis-pill"
                              title={p.disease || 'Not specified'}
                            >
                              <i className="bi bi-activity me-1"></i>
                              {p.disease || 'Not specified'}
                            </span>

                          </td>

                          {/* Status */}

                          <td>

                            <span
                              className={`status-pill ${statusConfig.className}`}
                            >
                              <i
                                className={`bi ${statusConfig.icon}`}
                              ></i>

                              {statusConfig.label}
                            </span>

                          </td>

                          {/* Actions */}

                          <td className="text-end pe-3">

                            <div className="d-flex justify-content-end gap-1">

                              <button
                                type="button"
                                className="btn action-btn"
                                title="View Patient File"
                                onClick={() =>
                                  setSelectedPatient(p)
                                }
                              >
                                <i className="bi bi-eye"></i>
                              </button>

                              <button
                                type="button"
                                className="btn action-btn"
                                title="Edit Patient"
                                style={{ color: '#0ea5e9', borderColor: '#e0f2fe', background: '#f0f9ff' }}
                                onClick={() => handleEditOpen(p)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>

                              <button
                                type="button"
                                className="btn action-btn delete"
                                title="Delete Patient"
                                onClick={() =>
                                  handleDelete(
                                    p.id,
                                    p.name
                                  )
                                }
                              >
                                <i className="bi bi-trash3"></i>
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPatients.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />

        </div>

        {/* =========================
            PREMIUM PATIENT MODAL
        ========================= */}

        <AnimatePresence>
          {selectedPatient && (
            <motion.div
              className="premium-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedPatient(null);
                }
              }}
            >
              <motion.div
                className="premium-modal"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >

              {/* Modal Header */}

              <div className="modal-top">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <div className="modal-record-label">
                      Clinical Patient Record
                    </div>

                    <div className="modal-record-id">
                      #PAT-{selectedPatient.id}
                    </div>

                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={() =>
                      setSelectedPatient(null)
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                </div>

              </div>

              <div className="modal-profile">

                {/* Profile */}

                <div className="text-center">

                  <div className="modal-avatar">
                    {getInitials(selectedPatient.name)}
                  </div>

                  <div className="modal-patient-name">
                    {selectedPatient.name}
                  </div>

                  <div className="modal-status">

                    {(() => {
                      const config =
                        getStatusConfig(
                          selectedPatient.status
                        );

                      return (
                        <span
                          className={`status-pill ${config.className}`}
                        >
                          <i
                            className={`bi ${config.icon}`}
                          ></i>

                          {config.label}
                        </span>
                      );
                    })()}

                  </div>

                </div>

                {/* Basic Details */}

                <div className="detail-grid">

                  <div className="detail-card">
                    <div className="detail-label">
                      Age & Gender
                    </div>

                    <div className="detail-value">
                      {selectedPatient.age} Years
                      {' • '}
                      {selectedPatient.gender || 'N/A'}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label">
                      Blood Group
                    </div>

                    <div className="detail-value text-danger">
                      <i className="bi bi-droplet-fill me-1"></i>
                      {selectedPatient.bloodGroup || 'N/A'}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label">
                      Contact Number
                    </div>

                    <div className="detail-value">
                      {selectedPatient.contactNumber || 'N/A'}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label">
                      Admission Date
                    </div>

                    <div className="detail-value">
                      {selectedPatient.admittedDate || 'Not available'}
                    </div>
                  </div>

                </div>

                {/* Diagnosis */}

                <div className="clinical-section">

                  <div className="clinical-label">
                    Current Diagnosis
                  </div>

                  <div className="clinical-value diagnosis-box">
                    <i className="bi bi-activity me-2"></i>

                    {selectedPatient.disease ||
                      'No diagnosis recorded.'}
                  </div>

                </div>

                {/* Address */}

                <div className="clinical-section">

                  <div className="clinical-label">
                    Residential Address
                  </div>

                  <div className="clinical-value">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>

                    {selectedPatient.address ||
                      'No address recorded.'}
                  </div>

                </div>

                {/* Medical History */}

                <div className="clinical-section">

                  <div className="clinical-label">
                    Medical History & Allergies
                  </div>

                  <div className="clinical-value">

                    <i className="bi bi-clipboard2-pulse me-2 text-primary"></i>

                    {selectedPatient.medicalHistory ||
                      'No major prior medical conditions logged.'}

                  </div>

                </div>

              </div>

              {/* Footer */}

              <div className="modal-footer-premium">

                <button
                  type="button"
                  className="close-file-btn"
                  onClick={() =>
                    setSelectedPatient(null)
                  }
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Close Medical File
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}
        </AnimatePresence>

        {/* ── Edit Patient Modal ── */}
        <AnimatePresence>
          {editPatient && (
            <motion.div
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                    <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }} />
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Edit Patient — #{editPatient.id}</span>
                  </div>
                  <button onClick={() => setEditPatient(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                {/* Form */}
                <form onSubmit={handleEditSave} style={{ padding: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Full Name *', name: 'name', type: 'text', required: true },
                      { label: 'Age', name: 'age', type: 'number' },
                      { label: 'Contact Number *', name: 'contactNumber', type: 'text', required: true },
                      { label: 'Address', name: 'address', type: 'text' },
                      { label: 'Diagnosis / Disease', name: 'disease', type: 'text' },
                      { label: 'Medical History', name: 'medicalHistory', type: 'text' },
                    ].map(({ label, name, type, required }) => (
                      <div key={name}>
                        <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                        <input type={type} name={name} value={editPatient[name] || ''} onChange={handleEditChange} required={required}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', outline: 'none', fontFamily: 'inherit' }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Gender</label>
                      <select name="gender" value={editPatient.gender || ''} onChange={handleEditChange}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Blood Group</label>
                      <select name="bloodGroup" value={editPatient.bloodGroup || ''} onChange={handleEditChange}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                        <option value="">Select</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Status</label>
                      <select name="status" value={editPatient.status || 'Admitted'} onChange={handleEditChange}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                        <option>Admitted</option><option>Outpatient</option><option>Discharged</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setEditPatient(null)}
                      style={{ padding: '9px 20px', border: '1.5px solid #e2e8f0', borderRadius: 9, background: '#fff', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={editLoading}
                      style={{ padding: '9px 24px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? .7 : 1, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                      {editLoading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Saving...</> : <><i className="bi bi-check-lg" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

export default PatientList;
