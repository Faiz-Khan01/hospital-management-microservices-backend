import React, { useEffect, useMemo, useState } from 'react';
import BedService from '../../services/BedService';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import PrintModal from '../common/PrintModal';
import AdmissionBedCardSlip from './AdmissionBedCardSlip';
import DischargeGatepassSlip from './DischargeGatepassSlip';
import { toast } from 'react-toastify';

const DEMO_BEDS = [
  { id: 1, bedNumber: 'ICU-01', ward: 'Intensive Care Unit (ICU)', type: 'ICU', floor: '1st Floor', status: 'OCCUPIED', patientName: 'Robert Langdon', doctorName: 'Dr. Sarah Jenkins', admissionDate: '2026-10-27', diagnosis: 'Post-op monitoring' },
  { id: 2, bedNumber: 'ICU-02', ward: 'Intensive Care Unit (ICU)', type: 'ICU', floor: '1st Floor', status: 'AVAILABLE' },
  { id: 3, bedNumber: 'GW-101', ward: 'General Medical Ward', type: 'General', floor: '2nd Floor', status: 'AVAILABLE' },
  { id: 4, bedNumber: 'GW-102', ward: 'General Medical Ward', type: 'General', floor: '2nd Floor', status: 'OCCUPIED', patientName: 'John Doe', doctorName: 'Dr. Rahul Dey', admissionDate: '2026-10-28', diagnosis: 'Severe acute bronchitis' },
  { id: 5, bedNumber: 'GW-103', ward: 'General Medical Ward', type: 'General', floor: '2nd Floor', status: 'AVAILABLE' },
  { id: 6, bedNumber: 'CCU-01', ward: 'Cardiac Care Unit (CCU)', type: 'Specialized', floor: '1st Floor', status: 'AVAILABLE' },
  { id: 7, bedNumber: 'PW-201', ward: 'Private Deluxe Suite', type: 'Private', floor: '3rd Floor', status: 'AVAILABLE' },
  { id: 8, bedNumber: 'EM-01', ward: 'Emergency Trauma Ward', type: 'Emergency', floor: 'Ground Floor', status: 'AVAILABLE' }
];

function BedsPanel({ initialBeds = [], patients = [], doctors = [], onBedsUpdated }) {
  const [beds, setBeds] = useState(
    Array.isArray(initialBeds) && initialBeds.length > 0 ? initialBeds : DEMO_BEDS
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ bedNumber: '', ward: '', type: 'General', floor: '' });
  const [addLoading, setAddLoading] = useState(false);

  // Admission Modal State
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admittingBed, setAdmittingBed] = useState(null);
  const [admitLoading, setAddmitLoading] = useState(false);
  const [printAdmissionSlip, setPrintAdmissionSlip] = useState(null);

  // Bed Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSourceBed, setTransferSourceBed] = useState(null);
  const [transferTargetBedId, setTransferTargetBedId] = useState('');
  const [transferReason, setTransferReason] = useState('Clinical step-down to General Ward');

  // Multi-Dept Discharge Clearance State
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargingBed, setDischargingBed] = useState(null);
  const [dischargeClearances, setDischargeClearances] = useState({
    pharmacy: true,
    lab: true,
    nursing: true,
    billing: true
  });
  const [printGatepassSlip, setPrintGatepassSlip] = useState(null);

  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    patientName: '',
    patientAge: '32',
    patientGender: 'Male',
    doctorId: '',
    doctorName: '',
    department: 'General Medicine',
    ward: 'General Medical Ward',
    bedNumber: 'GW-101',
    floor: '2nd Floor',
    type: 'General',
    dailyRate: '1500',
    deposit: '5000',
    attendantName: '',
    attendantPhone: '',
    diagnosis: 'Acute Inpatient Clinical Care',
    instructions: 'Monitor vitals every 4 hours. Keep on light diet.'
  });

  const fetchBeds = () => {
    setLoading(true);
    setError('');

    BedService.getAllBeds()
      .then((response) => {
        const data = response.data?.data || response.data;
        setBeds(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError('Unable to load bed availability right now.');
        setBeds([]);
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    let mounted = true;

    BedService.getAllBeds()
      .then((response) => {
        if (!mounted) return;
        const data = response.data?.data || response.data;
        setBeds(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (mounted) setError('Unable to load bed availability right now.'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  const handleStatusChange = async (bedId, newStatus) => {
    try {
      await BedService.updateBedStatus(bedId, newStatus);
      setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status: newStatus } : b)));
      toast.success(`Bed status updated to ${newStatus}`);
      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error('Failed to update bed status. Please try again.');
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!addForm.bedNumber.trim() || !addForm.ward.trim()) {
      toast.warning('Bed Number and Ward are required.');
      return;
    }
    setAddLoading(true);
    try {
      await BedService.createBed({ ...addForm, status: 'AVAILABLE' });
      toast.success(`Bed ${addForm.bedNumber} added successfully!`);
      setShowAddForm(false);
      setAddForm({ bedNumber: '', ward: '', type: 'General', floor: '' });
      fetchBeds();
      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bed. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteBed = async (id, bedNumber) => {
    if (!window.confirm(`Remove Bed ${bedNumber} from the system?`)) return;
    try {
      await BedService.deleteBed(id);
      setBeds(prev => prev.filter(b => b.id !== id));
      toast.success(`Bed ${bedNumber} removed successfully.`);
      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error('Failed to delete bed. Please try again.');
    }
  };

  const handleOpenAdmitModal = (bed) => {
    setAdmittingBed(bed);
    const p0 = patients[0];
    const d0 = doctors[0];
    setAdmitForm((prev) => ({
      ...prev,
      bedNumber: bed?.bedNumber || 'GW-101',
      ward: bed?.ward || 'General Medical Ward',
      floor: bed?.floor || '2nd Floor',
      type: bed?.type || 'General',
      dailyRate: bed?.type === 'ICU' ? '6000' : bed?.type === 'Specialized' ? '4000' : bed?.type === 'Private' ? '3500' : '1500',
      patientId: p0?.id || '',
      patientName: p0?.name || '',
      doctorId: d0?.id || '',
      doctorName: d0?.name || ''
    }));
    setShowAdmitModal(true);
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    if (!admitForm.patientName.trim()) {
      toast.warning('Please enter patient name.');
      return;
    }

    setAddmitLoading(true);
    const targetBed = admittingBed || beds.find(b => b.bedNumber === admitForm.bedNumber) || beds[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const admissionRecord = {
      ...admitForm,
      bedId: targetBed?.id,
      admissionDate: todayStr,
      ipdNumber: `IPD-2026-${targetBed?.id || Math.floor(1000 + Math.random() * 9000)}`
    };

    try {
      if (targetBed?.id) {
        try {
          await BedService.updateBedStatus(targetBed.id, 'OCCUPIED');
        } catch (err) {
          console.debug('Backend bed update note:', err);
        }
      }

      setBeds((prev) =>
        prev.map((b) =>
          b.id === targetBed?.id || b.bedNumber === targetBed?.bedNumber
            ? { ...b, status: 'OCCUPIED', patientName: admitForm.patientName, doctorName: admitForm.doctorName, admissionDate: todayStr, diagnosis: admitForm.diagnosis }
            : b
        )
      );

      playHospitalAlertChime();
      RealtimeNotificationHub.publishNotification({
        type: 'APPOINTMENT_CONFIRMATION',
        title: 'Inpatient Admitted to Bed',
        message: `Patient ${admitForm.patientName} admitted to ${admitForm.ward} (Bed ${admitForm.bedNumber}) by ${admitForm.doctorName || 'Dr. Medical Officer'}.`,
        targetRoles: ['DOCTOR', 'NURSE', 'ADMIN']
      });

      toast.success(`Patient ${admitForm.patientName} admitted to Bed ${targetBed?.bedNumber}!`);
      setShowAdmitModal(false);
      setPrintAdmissionSlip(admissionRecord);

      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error('Failed to admit patient.');
    } finally {
      setAddmitLoading(false);
    }
  };

  const handleOpenTransfer = (bed) => {
    setTransferSourceBed(bed);
    const available = beds.filter(b => b.id !== bed.id && normalizeStatus(b.status) === 'AVAILABLE');
    if (available.length > 0) {
      setTransferTargetBedId(String(available[0].id));
    }
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!transferSourceBed || !transferTargetBedId) return;

    const targetBed = beds.find(b => String(b.id) === String(transferTargetBedId));
    if (!targetBed) {
      toast.warning('Please select a valid destination bed.');
      return;
    }

    try {
      if (transferSourceBed.id) {
        try { await BedService.updateBedStatus(transferSourceBed.id, 'AVAILABLE'); } catch (e) {}
      }
      if (targetBed.id) {
        try { await BedService.updateBedStatus(targetBed.id, 'OCCUPIED'); } catch (e) {}
      }

      setBeds(prev => prev.map(b => {
        if (b.id === transferSourceBed.id) {
          return { ...b, status: 'AVAILABLE', patientName: null, doctorName: null, admissionDate: null, diagnosis: null };
        }
        if (b.id === targetBed.id) {
          return {
            ...b,
            status: 'OCCUPIED',
            patientName: transferSourceBed.patientName,
            patientId: transferSourceBed.patientId,
            doctorName: transferSourceBed.doctorName,
            admissionDate: transferSourceBed.admissionDate || new Date().toISOString().split('T')[0],
            diagnosis: transferSourceBed.diagnosis
          };
        }
        return b;
      }));

      setShowTransferModal(false);
      playHospitalAlertChime();
      RealtimeNotificationHub.publishNotification({
        type: 'BED_TRANSFER',
        title: 'Inpatient Bed Transfer Completed',
        message: `Patient ${transferSourceBed.patientName || 'Inpatient'} transferred from ${transferSourceBed.bedNumber} to ${targetBed.bedNumber} (${transferReason}).`,
        targetRoles: ['ADMIN', 'DOCTOR', 'NURSE'],
        patientName: transferSourceBed.patientName
      });

      toast.success(`Patient successfully transferred to ${targetBed.bedNumber} (${targetBed.ward})!`);
      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error('Failed to execute bed transfer.');
    }
  };

  const handleOpenDischarge = (bed) => {
    setDischargingBed(bed);
    setDischargeClearances({
      pharmacy: true,
      lab: true,
      nursing: true,
      billing: true
    });
    setShowDischargeModal(true);
  };

  const handleExecuteDischarge = async () => {
    if (!dischargingBed) return;
    const allCleared = Object.values(dischargeClearances).every(Boolean);
    if (!allCleared) {
      toast.warning('All department clearances must be verified before completing discharge.');
      return;
    }

    try {
      if (dischargingBed.id) {
        try { await BedService.updateBedStatus(dischargingBed.id, 'AVAILABLE'); } catch (e) {}
      }

      setBeds(prev => prev.map(b => 
        b.id === dischargingBed.id
          ? { ...b, status: 'AVAILABLE', patientName: null, doctorName: null, admissionDate: null, diagnosis: null }
          : b
      ));

      setShowDischargeModal(false);
      setPrintGatepassSlip({
        bed: dischargingBed,
        patient: patients.find(p => Number(p.id) === Number(dischargingBed.patientId)),
        clearances: dischargeClearances,
        dischargeDate: new Date().toISOString()
      });

      playHospitalAlertChime();
      RealtimeNotificationHub.publishNotification({
        type: 'PATIENT_DISCHARGED',
        title: 'Patient Discharged & Gatepass Issued',
        message: `Patient ${dischargingBed.patientName || 'Inpatient'} cleared from ${dischargingBed.ward} (${dischargingBed.bedNumber}). Security Gatepass authorized.`,
        targetRoles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'],
        patientName: dischargingBed.patientName
      });

      toast.success(`Bed ${dischargingBed.bedNumber} is now Available. Security Gatepass generated!`);
      if (onBedsUpdated) onBedsUpdated();
    } catch (err) {
      toast.error('Failed to discharge patient.');
    }
  };

  const handleDischarge = async (bed) => {
    handleOpenDischarge(bed);
  };

  const normalizeStatus = (status) =>
    String(status || '').trim().toUpperCase();

  const stats = useMemo(() => {
    const safeBeds = Array.isArray(beds) ? beds : [];
    return {
      total: safeBeds.length,

      available: safeBeds.filter(
        (bed) => bed && normalizeStatus(bed.status) === 'AVAILABLE'
      ).length,

      occupied: safeBeds.filter(
        (bed) => bed && normalizeStatus(bed.status) === 'OCCUPIED'
      ).length,

      maintenance: safeBeds.filter(
        (bed) =>
          bed &&
          (normalizeStatus(bed.status) === 'MAINTENANCE' ||
            normalizeStatus(bed.status) === 'UNDER_MAINTENANCE')
      ).length
    };
  }, [beds]);

  const statusConfig = {
    AVAILABLE: {
      color: '#10b981',
      bg: 'rgba(16,185,129,.10)',
      icon: 'bi-check-circle-fill',
      label: 'Available'
    },

    OCCUPIED: {
      color: '#ef4444',
      bg: 'rgba(239,68,68,.10)',
      icon: 'bi-person-fill',
      label: 'Occupied'
    },

    MAINTENANCE: {
      color: '#f59e0b',
      bg: 'rgba(245,158,11,.12)',
      icon: 'bi-tools',
      label: 'Maintenance'
    },

    UNDER_MAINTENANCE: {
      color: '#f59e0b',
      bg: 'rgba(245,158,11,.12)',
      icon: 'bi-tools',
      label: 'Maintenance'
    }
  };

  const filteredBeds = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    const safeBeds = Array.isArray(beds) ? beds : [];

    return safeBeds.filter((bed) => {
      if (!bed) return false;
      const bedNumber = String(bed.bedNumber || '').toLowerCase();
      const ward = String(bed.wardId || bed.wardName || '').toLowerCase();
      const type = String(bed.bedType || '').toLowerCase();
      const status = normalizeStatus(bed.status);

      const matchesSearch =
        !search ||
        bedNumber.includes(search) ||
        ward.includes(search) ||
        type.includes(search) ||
        status.toLowerCase().includes(search);

      const matchesStatus =
        !filterStatus || status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [beds, searchTerm, filterStatus]);

  return (
    <div className="beds-page">

      <style>{`

        .beds-page {
          position: relative;
          min-height: 100%;
          padding-bottom: 30px;
          color: #172033;
        }

        .beds-page::before {
          content: "";
          position: fixed;
          width: 420px;
          height: 420px;
          top: 70px;
          right: 5%;
          background: rgba(129, 140, 248, .10);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
        }

        .beds-page::after {
          content: "";
          position: fixed;
          width: 360px;
          height: 360px;
          bottom: 5%;
          left: 10%;
          background: rgba(45, 212, 191, .08);
          filter: blur(100px);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
        }

        /* HERO */

        .bed-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 20px;

          background:
            radial-gradient(
              circle at 90% 15%,
              rgba(167,139,250,.28),
              transparent 28%
            ),
            radial-gradient(
              circle at 70% 100%,
              rgba(56,189,248,.18),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 20%,
              rgba(45,212,191,.16),
              transparent 25%
            ),
            rgba(255,255,255,.78);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            0 18px 55px rgba(30,41,59,.07),
            inset 0 1px 0 rgba(255,255,255,.8);
        }

        .bed-hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          font-size: 22px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #06b6d4
            );

          box-shadow:
            0 12px 25px rgba(99,102,241,.25);
        }

        .hero-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -.035em;
          margin: 0;
        }

        .hero-subtitle {
          color: #64748b;
          font-size: .86rem;
          margin: 4px 0 0;
        }

        .refresh-btn {
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          padding: 10px 16px;

          font-size: .82rem;
          font-weight: 700;

          color: #475569;
          background: rgba(255,255,255,.75);

          transition: all .2s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          background: white;
          border-color: #cbd5e1;
          color: #4f46e5;
        }

        /* STATS */

        .stat-card {
          position: relative;
          overflow: hidden;
          height: 100%;
          padding: 18px;

          border-radius: 18px;
          background: rgba(255,255,255,.72);

          border: 1px solid rgba(226,232,240,.85);

          backdrop-filter: blur(16px);

          box-shadow:
            0 10px 30px rgba(15,23,42,.045);

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 16px 35px rgba(15,23,42,.08);
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 18px;
        }

        .stat-label {
          color: #64748b;

          font-size: .72rem;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .stat-value {
          font-size: 1.45rem;
          font-weight: 800;

          letter-spacing: -.04em;
          margin-top: 2px;
        }

        /* FILTER */

        .glass-card {
          border: 1px solid rgba(226,232,240,.85);
          border-radius: 20px;

          background: rgba(255,255,255,.78);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            0 12px 35px rgba(15,23,42,.055);
        }

        .filter-card {
          padding: 14px;
          margin-bottom: 18px;
        }

        .search-wrapper {
          position: relative;
        }

        .search-wrapper i {
          position: absolute;

          left: 14px;
          top: 50%;

          transform: translateY(-50%);

          color: #94a3b8;
          z-index: 2;
        }

        .search-input {
          padding-left: 40px;
          height: 43px;
        }

        .premium-input,
        .premium-select {
          border: 1px solid #e2e8f0;

          background: rgba(255,255,255,.9);

          border-radius: 11px;

          min-height: 42px;

          font-size: .84rem;

          color: #1e293b;

          transition: all .2s ease;
        }

        .premium-input:focus,
        .premium-select:focus {
          border-color: #818cf8;

          box-shadow:
            0 0 0 4px rgba(99,102,241,.09);

          background: white;
        }

        .result-count {
          color: #64748b;
          font-size: .76rem;
          font-weight: 600;
        }

        /* SECTION */

        .section-heading {
          font-size: .95rem;
          font-weight: 800;
          letter-spacing: -.01em;
        }

        /* BED CARD */

        .bed-card {
          position: relative;
          overflow: hidden;

          border: 1px solid rgba(226,232,240,.9);
          border-radius: 20px;

          background: rgba(255,255,255,.80);

          backdrop-filter: blur(14px);

          box-shadow:
            0 10px 30px rgba(15,23,42,.045);

          transition: all .22s ease;
        }

        .bed-card:hover {
          transform: translateY(-3px);

          border-color: rgba(148,163,184,.55);

          box-shadow:
            0 18px 42px rgba(15,23,42,.08);
        }

        .bed-card::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 4px;

          background:
            linear-gradient(
              180deg,
              #6366f1,
              #06b6d4
            );

          opacity: .75;
        }

        .bed-body {
          padding: 20px;
        }

        .bed-icon {
          width: 50px;
          height: 50px;

          border-radius: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          font-size: 21px;

          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #ecfeff
            );

          color: #6366f1;
        }

        .bed-number {
          font-size: 1.05rem;
          font-weight: 800;

          color: #172033;

          letter-spacing: -.02em;
        }

        .bed-meta {
          color: #64748b;
          font-size: .75rem;
        }

        .bed-detail-label {
          color: #94a3b8;

          font-size: .62rem;

          text-transform: uppercase;

          letter-spacing: .06em;

          font-weight: 800;

          margin-bottom: 2px;
        }

        .bed-detail-value {
          color: #334155;

          font-size: .78rem;

          font-weight: 700;
        }

        .status-badge {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          border-radius: 999px;

          padding: 6px 10px;

          font-size: .66rem;

          font-weight: 800;

          letter-spacing: .03em;
        }

        .bed-footer {
          border-top: 1px solid #edf2f7;

          margin-top: 16px;

          padding-top: 13px;
        }

        /* EMPTY */

        .empty-state {
          padding: 60px 20px;

          text-align: center;

          border: 1px dashed #cbd5e1;

          border-radius: 20px;

          background: rgba(255,255,255,.55);
        }

        .empty-icon {
          width: 64px;
          height: 64px;

          margin: 0 auto 14px;

          border-radius: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #ecfeff
            );

          color: #6366f1;

          font-size: 27px;
        }

        /* RESPONSIVE */

        @media (max-width: 767.98px) {

          .bed-hero {
            padding: 20px;
          }

          .hero-title {
            font-size: 1.15rem;
          }

          .refresh-btn {
            width: 100%;
          }

          .bed-body {
            padding: 16px;
          }

        }

      `}</style>

      {/* HERO */}

      <div className="bed-hero">

        <div className="bed-hero-content">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">

            <div className="d-flex align-items-center gap-3">

              <div className="hero-icon">
                <i className="bi bi-hospital"></i>
              </div>

              <div>

                <h3 className="hero-title">
                  Bed Availability
                </h3>

                <p className="hero-subtitle">
                  Monitor inpatient beds, wards and current occupancy
                </p>

              </div>

            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
                onClick={() => {
                  const firstAvail = beds.find(b => (b.status || '').toUpperCase() === 'AVAILABLE') || beds[0];
                  handleOpenAdmitModal(firstAvail);
                }}
              >
                <i className="bi bi-person-plus-fill"></i> Admit Inpatient
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
                onClick={() => setShowAddForm(true)}
              >
                <i className="bi bi-plus-lg" /> Add Bed
              </button>

              <button
                type="button"
                className="refresh-btn"
                onClick={fetchBeds}
                disabled={loading}
              >
                <i
                  className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-2`}
                ></i>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ── Add Bed Form Modal ── */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-plus-circle" /> Add New Bed
              </span>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 30, height: 30, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={handleAddBed} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Bed Number *', name: 'bedNumber', placeholder: 'e.g. B-101' },
                  { label: 'Ward *', name: 'ward', placeholder: 'e.g. General Ward' },
                  { label: 'Floor', name: 'floor', placeholder: 'e.g. Ground' },
                ].map(({ label, name, placeholder }) => (
                  <div key={name}>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                    <input name={name} value={addForm[name]} onChange={e => setAddForm(p => ({ ...p, [name]: e.target.value }))} placeholder={placeholder}
                      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Bed Type</label>
                  <select name="type" value={addForm.type} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit' }}>
                    {['General', 'ICU', 'Private', 'Semi-Private', 'Emergency', 'Pediatric'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddForm(false)}
                  style={{ padding: '8px 18px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: addLoading ? 'not-allowed' : 'pointer', opacity: addLoading ? .7 : 1, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  {addLoading ? 'Adding...' : <><i className="bi bi-check-lg" /> Add Bed</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* STATS */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-6 col-xl-3">

          <div className="stat-card">

            <div className="d-flex align-items-center gap-3">

              <div
                className="stat-icon"
                style={{
                  background: 'rgba(99,102,241,.10)',
                  color: '#6366f1'
                }}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </div>

              <div>

                <div className="stat-label">
                  Total Beds
                </div>

                <div className="stat-value">
                  {stats.total}
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* AVAILABLE */}

        <div className="col-6 col-xl-3">

          <div className="stat-card">

            <div className="d-flex align-items-center gap-3">

              <div
                className="stat-icon"
                style={{
                  background: 'rgba(16,185,129,.10)',
                  color: '#10b981'
                }}
              >
                <i className="bi bi-check-circle"></i>
              </div>

              <div>

                <div className="stat-label">
                  Available
                </div>

                <div className="stat-value">
                  {stats.available}
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* OCCUPIED */}

        <div className="col-6 col-xl-3">

          <div className="stat-card">

            <div className="d-flex align-items-center gap-3">

              <div
                className="stat-icon"
                style={{
                  background: 'rgba(239,68,68,.10)',
                  color: '#ef4444'
                }}
              >
                <i className="bi bi-person-fill"></i>
              </div>

              <div>

                <div className="stat-label">
                  Occupied
                </div>

                <div className="stat-value">
                  {stats.occupied}
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* MAINTENANCE */}

        <div className="col-6 col-xl-3">

          <div className="stat-card">

            <div className="d-flex align-items-center gap-3">

              <div
                className="stat-icon"
                style={{
                  background: 'rgba(245,158,11,.11)',
                  color: '#d97706'
                }}
              >
                <i className="bi bi-tools"></i>
              </div>

              <div>

                <div className="stat-label">
                  Maintenance
                </div>

                <div className="stat-value">
                  {stats.maintenance}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* FILTER */}

      <div className="glass-card filter-card">

        <div className="row g-2 align-items-center">

          <div className="col-12 col-lg-6">

            <div className="search-wrapper">

              <i className="bi bi-search"></i>

              <input
                type="text"
                className="form-control premium-input search-input"
                placeholder="Search bed number, ward or bed type..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>

          </div>


          <div className="col-12 col-sm-6 col-lg-3">

            <select
              className="form-select premium-select"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >

              <option value="">
                All statuses
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="OCCUPIED">
                Occupied
              </option>

              <option value="MAINTENANCE">
                Maintenance
              </option>

            </select>

          </div>


          <div className="col-12 col-sm-6 col-lg-3 text-sm-end">

            <span className="result-count">

              <i className="bi bi-layers me-1"></i>

              {filteredBeds.length}{' '}

              bed{filteredBeds.length !== 1 ? 's' : ''} found

            </span>

          </div>

        </div>

      </div>


      {/* SECTION TITLE */}

      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>

          <div className="section-heading">
            Inpatient Bed Inventory
          </div>

          <div className="text-muted small mt-1">
            Current bed allocation and availability status
          </div>

        </div>

        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            background: 'rgba(16,185,129,.09)',
            color: '#059669'
          }}
        >
          <i className="bi bi-hospital me-1"></i>
          INPATIENT
        </span>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="glass-card text-center py-5">

          <div
            className="spinner-border"
            style={{ color: '#6366f1' }}
          ></div>

          <div className="text-muted small mt-3">
            Loading bed availability...
          </div>

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="glass-card p-4">

          <div className="alert alert-warning mb-0">

            <i className="bi bi-exclamation-triangle me-2"></i>

            {error}

            <button
              type="button"
              className="btn btn-sm btn-outline-warning ms-3"
              onClick={fetchBeds}
            >
              Retry
            </button>

          </div>

        </div>

      )}


      {/* EMPTY */}

      {!loading && !error && filteredBeds.length === 0 && (

        <div className="empty-state">

          <div className="empty-icon">

            <i className="bi bi-hospital"></i>

          </div>

          <h6 className="fw-bold mb-1">
            No beds found
          </h6>

          <p className="text-muted small mb-0">
            Try changing your search or status filter.
          </p>

        </div>

      )}


      {/* BED LIST */}

      {!loading && !error && filteredBeds.length > 0 && (

        <div className="row g-3">

          {filteredBeds.map((bed, index) => {
            if (!bed) return null;

            const status =
              normalizeStatus(bed.status);

            const config =
              statusConfig[status] || {
                color: '#64748b',
                bg: 'rgba(100,116,139,.10)',
                icon: 'bi-question-circle',
                label: bed.status || 'Unknown'
              };

            return (

              <div
                className="col-12 col-md-6 col-xl-4"
                key={bed.id || index}
              >

                <div className="bed-card h-100">

                  <div className="bed-body">

                    {/* HEADER */}

                    <div className="d-flex justify-content-between align-items-start gap-3">

                      <div className="d-flex gap-3 align-items-center">

                        <div className="bed-icon">

                          <i className="bi bi-hospital"></i>

                        </div>

                        <div>

                          <div className="bed-meta">
                            Bed Number
                          </div>

                          <div className="bed-number">
                            {bed.bedNumber || '—'}
                          </div>

                        </div>

                      </div>


                      <span
                        className="status-badge"
                        style={{
                          background: config.bg,
                          color: config.color
                        }}
                      >

                        <i
                          className={`bi ${config.icon}`}
                        ></i>

                        {config.label}

                      </span>

                    </div>


                    {/* DETAILS */}

                    <div className="row g-3 mt-3">

                      <div className="col-6">

                        <div className="bed-detail-label">
                          Ward
                        </div>

                        <div className="bed-detail-value">
                          {bed.wardId || '—'}
                        </div>

                      </div>


                      <div className="col-6">

                        <div className="bed-detail-label">
                          Bed Type
                        </div>

                        <div className="bed-detail-value">
                          {bed.bedType || 'STANDARD'}
                        </div>

                      </div>

                    </div>


                    {/* FOOTER & ACTIONS */}

                    <div className="bed-footer pt-3 mt-3 border-top">

                      <div className="d-flex justify-content-between align-items-center mb-2">

                        <div className="text-muted small">
                          <i className="bi bi-hash me-1"></i>
                          Bed ID {bed.id}
                        </div>

                        <div
                          className="small fw-bold"
                          style={{
                            color: config.color
                          }}
                        >
                          {config.label}
                        </div>

                      </div>

                      {/* INPATIENT ADMISSION / OCCUPANCY ACTIONS */}
                      {status === 'OCCUPIED' ? (
                        <div>
                          {bed.patientName && (
                            <div className="mb-2 p-2 bg-light rounded-2 text-start small border">
                              <div className="fw-bold text-dark">
                                <i className="bi bi-person-fill text-danger me-1"></i> {bed.patientName}
                              </div>
                              <div className="text-muted" style={{ fontSize: '10px' }}>
                                Admitted: {bed.admissionDate || 'Today'} · {bed.doctorName || 'Dr. Attending'}
                              </div>
                            </div>
                          )}
                          <div className="d-flex gap-1 justify-content-end flex-wrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning text-dark py-1 px-2 fw-bold"
                              style={{ fontSize: '0.72rem', borderRadius: 7 }}
                              title="Transfer Patient to Another Ward / Bed"
                              onClick={() => handleOpenTransfer(bed)}
                            >
                              <i className="bi bi-arrow-left-right me-1"></i> Transfer
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger py-1 px-2 fw-bold"
                              style={{ fontSize: '0.72rem', borderRadius: 7 }}
                              title="Clearance Checklist & Discharge Gatepass"
                              onClick={() => handleOpenDischarge(bed)}
                            >
                              <i className="bi bi-shield-check me-1"></i> Clearance & Gatepass
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary py-1 px-2 fw-bold"
                              style={{ fontSize: '0.72rem', borderRadius: 7 }}
                              title="Print Inpatient Bed Card"
                              onClick={() => setPrintAdmissionSlip({
                                ...bed,
                                admissionDate: bed.admissionDate || new Date().toISOString().split('T')[0],
                                ipdNumber: `IPD-${bed.id * 101}`,
                                dailyRate: bed.type === 'ICU' ? 6000 : 1500
                              })}
                            >
                              <i className="bi bi-printer-fill me-1"></i> Bed Card
                            </button>
                          </div>
                        </div>
                      ) : status === 'AVAILABLE' ? (
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-success py-1 px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                            style={{ fontSize: '0.75rem', borderRadius: 8 }}
                            title="Admit Patient to this Bed"
                            onClick={() => handleOpenAdmitModal(bed)}
                          >
                            <i className="bi bi-person-plus-fill me-1"></i> Admit Patient
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning py-1 px-2"
                            style={{ fontSize: '0.72rem', borderRadius: 7 }}
                            title="Send to Maintenance"
                            onClick={() => handleStatusChange(bed.id, 'MAINTENANCE')}
                          >
                            <i className="bi bi-tools"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success py-1 px-2 fw-bold"
                            style={{ fontSize: '0.72rem', borderRadius: 7 }}
                            title="Mark Bed Available"
                            onClick={() => handleStatusChange(bed.id, 'AVAILABLE')}
                          >
                            <i className="bi bi-check-circle me-1"></i> Mark Available
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

      {/* INPATIENT ADMISSION MODAL */}
      {showAdmitModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                    <i className="bi bi-hospital fs-5"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Inpatient Bed Admission</h5>
                    <p className="mb-0 text-white-50 small" style={{ fontSize: '11px' }}>
                      Assign Ward & Bed, Attending Doctor & Generate Inpatient Card
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAdmitModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAdmitSubmit}>
                <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    {/* Patient Information */}
                    <div className="col-12">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                        <i className="bi bi-person-badge me-2"></i>1. Patient Details
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Select Existing Patient</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.patientId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const found = patients.find(p => String(p.id) === String(pid));
                          setAdmitForm(prev => ({
                            ...prev,
                            patientId: pid,
                            patientName: found ? found.name : prev.patientName,
                            patientAge: found ? (found.age || prev.patientAge) : prev.patientAge,
                            patientGender: found ? (found.gender || prev.patientGender) : prev.patientGender,
                            attendantPhone: found ? (found.phone || prev.attendantPhone) : prev.attendantPhone
                          }));
                        }}
                      >
                        <option value="">-- Choose from Registered Patients --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email || `ID: ${p.id}`})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Patient Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={admitForm.patientName}
                        onChange={(e) => setAdmitForm({ ...admitForm, patientName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Age</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.patientAge}
                        onChange={(e) => setAdmitForm({ ...admitForm, patientAge: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Gender</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.patientGender}
                        onChange={(e) => setAdmitForm({ ...admitForm, patientGender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Emergency / Attendant Contact</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.attendantPhone}
                        onChange={(e) => setAdmitForm({ ...admitForm, attendantPhone: e.target.value })}
                        placeholder="+91 98765-43210"
                      />
                    </div>

                    {/* Ward & Bed Allocation */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                        <i className="bi bi-hospital me-2"></i>2. Ward & Bed Allocation
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Target Bed No.</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light fw-bold"
                        readOnly
                        value={admitForm.bedNumber}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Ward</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        readOnly
                        value={admitForm.ward}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Bed Daily Tariff (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={admitForm.dailyRate}
                        onChange={(e) => setAdmitForm({ ...admitForm, dailyRate: e.target.value })}
                      />
                    </div>

                    {/* Clinical Details */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                        <i className="bi bi-clipboard2-pulse me-2"></i>3. Attending Consultant & Clinical Diagnosis
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Admitting / Attending Doctor</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.doctorId}
                        onChange={(e) => {
                          const did = e.target.value;
                          const found = doctors.find(d => String(d.id) === String(did));
                          setAdmitForm(prev => ({
                            ...prev,
                            doctorId: did,
                            doctorName: found ? found.name : prev.doctorName,
                            department: found ? (found.specialty || found.department || prev.department) : prev.department
                          }));
                        }}
                      >
                        <option value="">-- Select Attending Doctor --</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialty || d.department || 'Consultant'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Doctor Name (if not in list)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.doctorName}
                        onChange={(e) => setAdmitForm({ ...admitForm, doctorName: e.target.value })}
                        placeholder="Dr. Specialist"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Provisional Admission Diagnosis</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.diagnosis}
                        onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                        placeholder="e.g. Acute appendicitis, observation required"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Care / Nursing Instructions</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={admitForm.instructions}
                        onChange={(e) => setAdmitForm({ ...admitForm, instructions: e.target.value })}
                        placeholder="Special nursing instructions, vitals frequency..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAdmitModal(false)}
                    disabled={admitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-bold d-inline-flex align-items-center gap-2"
                    disabled={admitLoading}
                  >
                    {admitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Admitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-printer-fill"></i>
                        Confirm Admission & Print Bed Card
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PRINT BED CARD / ADMISSION SLIP MODAL */}
      {printAdmissionSlip && (
        <PrintModal
          title={`Inpatient Admission Slip - ${printAdmissionSlip.patientName || 'Inpatient'}`}
          onClose={() => setPrintAdmissionSlip(null)}
        >
          <AdmissionBedCardSlip admission={printAdmissionSlip} />
        </PrintModal>
      )}

      {/* BED TRANSFER MODAL */}
      {showTransferModal && transferSourceBed && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-warning text-dark border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-left-right fs-5"></i>
                  <h5 className="modal-title fw-bold mb-0">Inpatient Bed Transfer</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowTransferModal(false)}></button>
              </div>
              <form onSubmit={handleExecuteTransfer}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="text-secondary small fw-bold">CURRENT BED & PATIENT</div>
                    <div className="fw-bold text-dark fs-5 mt-1">
                      {transferSourceBed.patientName || 'Inpatient'}
                    </div>
                    <div className="text-muted small">
                      {transferSourceBed.ward} &bull; <strong className="text-primary">{transferSourceBed.bedNumber}</strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Select Destination Available Bed *
                    </label>
                    <select
                      className="form-select"
                      value={transferTargetBedId}
                      onChange={(e) => setTransferTargetBedId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Target Bed --</option>
                      {beds.filter(b => b.id !== transferSourceBed.id && normalizeStatus(b.status) === 'AVAILABLE').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bedNumber} &bull; {b.ward} ({b.type} - {b.floor})
                        </option>
                      ))}
                    </select>
                    {beds.filter(b => b.id !== transferSourceBed.id && normalizeStatus(b.status) === 'AVAILABLE').length === 0 && (
                      <div className="text-danger small mt-1">No other beds currently available. Add beds or discharge patients first.</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Reason for Bed Transfer</label>
                    <select
                      className="form-select"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                    >
                      <option value="Clinical step-down to General Ward">Clinical step-down to General Ward (Patient Recovered)</option>
                      <option value="Escalation to Intensive Care (ICU)">Escalation to Intensive Care (ICU / Critical Care)</option>
                      <option value="Transfer to Private Deluxe Suite">Upgrade to Private Deluxe Suite (Patient Request)</option>
                      <option value="Infection isolation requirement">Infection Isolation / Quarantine Requirement</option>
                      <option value="Post-operative surgical ward shifting">Post-operative Surgical Ward Shifting</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning btn-sm px-4 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="bi bi-arrow-left-right"></i> Confirm Bed Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-DEPT DISCHARGE CLEARANCE MODAL */}
      {showDischargeModal && dischargingBed && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-success text-white border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check fs-5"></i>
                  <h5 className="modal-title fw-bold mb-0">Multi-Department Discharge Clearance</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDischargeModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="text-secondary small fw-bold">DISCHARGING INPATIENT</div>
                  <div className="fw-bold text-dark fs-5 mt-1">{dischargingBed.patientName || 'Inpatient'}</div>
                  <div className="text-muted small">
                    {dischargingBed.ward} &bull; Bed <strong>{dischargingBed.bedNumber}</strong> &bull; Attending: {dischargingBed.doctorName || 'Dr. Sarah Jenkins'}
                  </div>
                </div>

                <div className="small fw-bold text-dark mb-2 text-uppercase">
                  Institutional Discharge Checklist (All Required):
                </div>

                <div className="d-flex flex-column gap-2 mb-3">
                  <label className="d-flex align-items-center gap-2 p-2 border rounded bg-white" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={dischargeClearances.pharmacy}
                      onChange={(e) => setDischargeClearances({ ...dischargeClearances, pharmacy: e.target.checked })}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">1. Pharmacy & Dispensary Clearance</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>All medications reconciled; zero pharmacy balance</div>
                    </div>
                    {dischargeClearances.pharmacy ? <span className="badge bg-success-subtle text-success">CLEARED</span> : <span className="badge bg-danger-subtle text-danger">PENDING</span>}
                  </label>

                  <label className="d-flex align-items-center gap-2 p-2 border rounded bg-white" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={dischargeClearances.lab}
                      onChange={(e) => setDischargeClearances({ ...dischargeClearances, lab: e.target.checked })}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">2. Laboratory & Diagnostics Clearance</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>All blood/radiology investigation reports released</div>
                    </div>
                    {dischargeClearances.lab ? <span className="badge bg-success-subtle text-success">CLEARED</span> : <span className="badge bg-danger-subtle text-danger">PENDING</span>}
                  </label>

                  <label className="d-flex align-items-center gap-2 p-2 border rounded bg-white" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={dischargeClearances.nursing}
                      onChange={(e) => setDischargeClearances({ ...dischargeClearances, nursing: e.target.checked })}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">3. Inpatient Nursing Station Clearance</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>Cannula & IV line removed; discharge vitals normal</div>
                    </div>
                    {dischargeClearances.nursing ? <span className="badge bg-success-subtle text-success">CLEARED</span> : <span className="badge bg-danger-subtle text-danger">PENDING</span>}
                  </label>

                  <label className="d-flex align-items-center gap-2 p-2 border rounded bg-white" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={dischargeClearances.billing}
                      onChange={(e) => setDischargeClearances({ ...dischargeClearances, billing: e.target.checked })}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">4. Hospital Accounts & Billing Settlement</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>Final hospital tax invoice generated & cleared</div>
                    </div>
                    {dischargeClearances.billing ? <span className="badge bg-success-subtle text-success">CLEARED</span> : <span className="badge bg-danger-subtle text-danger">PENDING</span>}
                  </label>
                </div>
              </div>
              <div className="modal-footer bg-light border-0 py-2 d-flex justify-content-between align-items-center">
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Authorizes Security Exit Gatepass
                </span>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDischargeModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm px-4 fw-bold d-flex align-items-center gap-2"
                    onClick={handleExecuteDischarge}
                  >
                    <i className="bi bi-shield-check"></i> Authorize Discharge & Gatepass
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL DISCHARGE GATEPASS PRINT SLIP MODAL */}
      {printGatepassSlip && (
        <PrintModal
          title={`Discharge Clearance Gatepass - ${printGatepassSlip.bed?.patientName || 'Inpatient'}`}
          onClose={() => setPrintGatepassSlip(null)}
        >
          <DischargeGatepassSlip
            bed={printGatepassSlip.bed}
            patient={printGatepassSlip.patient}
            clearances={printGatepassSlip.clearances}
            dischargeDate={printGatepassSlip.dischargeDate}
          />
        </PrintModal>
      )}

    </div>
  );
}

export default BedsPanel;
