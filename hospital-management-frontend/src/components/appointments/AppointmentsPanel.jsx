import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppointmentService from '../../services/AppointmentService';
import AuthService from '../../services/AuthService';
import Pagination from '../common/Pagination';
import PrintModal from '../common/PrintModal';
import ConsultationModal from './ConsultationModal';
import PrescriptionPrintSlip from './PrescriptionPrintSlip';
import OpdLobbyTvDisplay from './OpdLobbyTvDisplay';
import RealtimeNotificationHub, { playOpdTokenCallChime } from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';

function AppointmentsPanel({
  role = 'ADMIN',
  appointments,
  patients,
  doctors,
  onAppointmentBooked
}) {
  const isPatient = role === 'PATIENT';
  const userId = AuthService.getUserId?.() || 1;
  const username = AuthService.getUsername?.() || '';

  const rawAppointments = Array.isArray(appointments) ? appointments : [];
  const safePatients = Array.isArray(patients) ? patients : [];
  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  // Filter appointments for patient role so patients only see their own appointments
  const safeAppointments = useMemo(() => {
    if (!isPatient) return rawAppointments;
    return rawAppointments.filter((a) => {
      const pid = a.patientId || a.patient?.id;
      const pname = (a.patientName || a.patient?.name || '').toLowerCase();
      return pid === userId || (username && pname.includes(username.toLowerCase())) || pid === 1;
    });
  }, [rawAppointments, isPatient, userId, username]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [activeConsultationAppt, setActiveConsultationAppt] = useState(null);
  const [activePrintRx, setActivePrintRx] = useState(null);
  const [showLobbyTv, setShowLobbyTv] = useState(false);
  const [currentCallingToken, setCurrentCallingToken] = useState(null);

  const handleCallPatient = (appointment) => {
    const patientName = appointment.patientName || appointment.patient?.name || `Patient #${appointment.patientId}`;
    const doctor = safeDoctors.find(d => Number(d.id) === Number(appointment.doctorId)) || { name: appointment.doctorName || 'Consultant' };
    const tokenNum = appointment.tokenNumber || appointment.id || 1;

    const callingPayload = {
      id: appointment.id,
      tokenNumber: tokenNum,
      patientName,
      doctorId: appointment.doctorId || doctor.id,
      doctorName: doctor.name || appointment.doctorName,
      roomNumber: `Room 10${(Number(appointment.doctorId) % 9 || 1)}`,
      department: appointment.department || doctor.department || 'General Medicine'
    };

    setCurrentCallingToken(callingPayload);
    playOpdTokenCallChime();

    RealtimeNotificationHub.publishNotification({
      type: 'OPD_TOKEN_CALLED',
      title: `Token #${tokenNum} Called to ${callingPayload.roomNumber}`,
      message: `Token #${tokenNum} (${patientName}) please proceed to ${callingPayload.roomNumber} for consultation with ${doctor.name}.`,
      targetRoles: ['PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST'],
      patientName
    });

    toast.info(`🔔 Token #${tokenNum} called to ${callingPayload.roomNumber}! Announcement chime played.`);
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    patientId: isPatient ? String(userId) : '',
    doctorId: '',
    date: getToday(),
    time: '10:00 AM',
    reason: '',
    department: 'General Medicine'
  });

  const getNormalizedStatus = (status) => {
    if (!status) return 'Scheduled';

    const s = String(status).trim().toLowerCase();

    if (s.includes('progress')) return 'In Progress';
    if (s.includes('complet')) return 'Completed';
    if (s.includes('cancel')) return 'Cancelled';

    return 'Scheduled';
  };

  const scheduledCount = safeAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'Scheduled'
  ).length;

  const inProgressCount = safeAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'In Progress'
  ).length;

  const completedCount = safeAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'Completed'
  ).length;

  const cancelledCount = safeAppointments.filter(
    (a) => getNormalizedStatus(a.status) === 'Cancelled'
  ).length;

  const filteredAppointments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return safeAppointments.filter((appt) => {
      const patientName =
        appt.patientName ||
        appt.patient?.name ||
        '';

      const doctorName =
        appt.doctorName ||
        appt.doctor?.name ||
        '';

      const reason = appt.reason || '';

      const currentStatus = getNormalizedStatus(appt.status);

      const matchesStatus =
        !statusFilter ||
        currentStatus === statusFilter;

      const matchesSearch =
        !search ||
        patientName.toLowerCase().includes(search) ||
        doctorName.toLowerCase().includes(search) ||
        reason.toLowerCase().includes(search) ||
        String(appt.id).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [safeAppointments, statusFilter, searchTerm]);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: getToday(),
      time: '10:00 AM',
      reason: '',
      department: 'General Medicine'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId) {
      toast.warning(
        'Please select both a Patient and a Specialist.'
      );
      return;
    }

    const patientObj = safePatients.find(
      (p) => p.id === parseInt(formData.patientId, 10)
    );

    const doctorObj = safeDoctors.find(
      (d) => d.id === parseInt(formData.doctorId, 10)
    );

    const doctorDisplayName = doctorObj
      ? doctorObj.name?.startsWith('Dr.')
        ? doctorObj.name
        : `Dr. ${doctorObj.name}`
      : 'Unknown Doctor';

    const requestData = {
      ...formData,

      patientId: parseInt(formData.patientId, 10),

      patientName: patientObj
        ? patientObj.name
        : 'Unknown Patient',

      doctorId: parseInt(formData.doctorId, 10),

      doctorName: doctorDisplayName,

      reason:
        formData.reason.trim() ||
        'General Consultation',

      department: doctorObj
        ? doctorObj.department ||
          doctorObj.specialty ||
          formData.department
        : formData.department,

      status: 'Scheduled'
    };

    try {
      setSubmitting(true);

      await AppointmentService.bookAppointment(requestData);

      // Trigger Realtime Hospital Alert for Doctor & Admin
      RealtimeNotificationHub.publishNotification({
        type: 'APPOINTMENT_CONFIRMATION',
        title: 'New Appointment Scheduled',
        message: `New appointment from Patient ${requestData.patientName} with ${requestData.doctorName} (${requestData.time || '10:00 AM'})`,
        targetRoles: ['DOCTOR', 'ADMIN'],
        patientName: requestData.patientName,
        doctorName: requestData.doctorName
      });

      toast.success(
        `Appointment booked for ${requestData.patientName} with ${requestData.doctorName}!`
      );

      resetForm();
      setIsExpanded(false);

      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
    } catch (error) {
      console.error('Appointment booking error:', error);

      toast.error(
        'Failed to book appointment.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    id,
    newStatus
  ) => {
    try {
      setProcessingId(id);

      await AppointmentService.updateAppointmentStatus(
        id,
        newStatus
      );

      toast.info(
        `Appointment status updated to ${newStatus}`
      );

      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
    } catch (error) {
      console.error(
        'Status update error:',
        error
      );

      toast.error(
        'Failed to update status.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      setProcessingId(id);

      await AppointmentService.updateAppointmentStatus(
        id,
        'Cancelled'
      );

      toast.success(
        'Appointment cancelled.'
      );

      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
    } catch (error) {
      console.error(
        'Cancel appointment error:',
        error
      );

      toast.error(
        'Failed to cancel appointment.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      setProcessingId(id);
      await AppointmentService.deleteAppointment(id);
      toast.success('Appointment deleted successfully.');
      if (onAppointmentBooked) {
        onAppointmentBooked();
      }
    } catch (error) {
      console.error('Delete appointment error:', error);
      toast.error('Failed to delete appointment.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status) => {
    const normalized =
      getNormalizedStatus(status);

    switch (normalized) {
      case 'Completed':
        return {
          className: 'status-completed',
          icon: 'bi-check-circle-fill',
          label: 'Completed'
        };

      case 'In Progress':
        return {
          className: 'status-progress',
          icon: 'bi-activity',
          label: 'In Progress'
        };

      case 'Cancelled':
        return {
          className: 'status-cancelled',
          icon: 'bi-x-circle-fill',
          label: 'Cancelled'
        };

      default:
        return {
          className: 'status-scheduled',
          icon: 'bi-clock-fill',
          label: 'Scheduled'
        };
    }
  };

  const getInitials = (name = '') => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return '?';

    return words
      .slice(0, 2)
      .map((word) =>
        word.charAt(0)
      )
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <style>
        {`
          /* =====================================================
             PREMIUM LIGHT PURPLE APPOINTMENTS UI
          ===================================================== */

          .appointments-panel {
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

          .ap-kpi {
            position: relative;
            overflow: hidden;
            min-height: 142px;
            padding: 22px;
            border: 1px solid var(--border);
            border-radius: 22px;
            background:
              linear-gradient(
                145deg,
                rgba(255,255,255,.98),
                rgba(250,249,255,.96)
              );
            box-shadow:
              0 2px 4px rgba(46,16,101,.025),
              0 12px 35px rgba(46,16,101,.055);
            transition:
              transform .25s ease,
              box-shadow .25s ease,
              border-color .25s ease;
          }

          .ap-kpi:hover {
            transform: translateY(-4px);
            border-color: rgba(124,58,237,.18);
            box-shadow:
              0 8px 20px rgba(46,16,101,.06),
              0 25px 55px rgba(46,16,101,.08);
          }

          .ap-kpi::before {
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

          .ap-kpi::after {
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

          .ap-kpi-icon {
            width: 54px;
            height: 54px;
            flex: 0 0 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 17px;
            font-size: 1.15rem;
            box-shadow:
              inset 0 0 0 1px rgba(124,58,237,.06);
          }

          .ap-kpi-icon.purple {
            color: var(--purple-700);
            background:
              linear-gradient(
                135deg,
                #f5f3ff,
                #ede9fe
              );
          }

          .ap-kpi-icon.indigo {
            color: #4f46e5;
            background:
              linear-gradient(
                135deg,
                #eef2ff,
                #e0e7ff
              );
          }

          .ap-kpi-icon.green {
            color: #059669;
            background:
              linear-gradient(
                135deg,
                #ecfdf5,
                #d1fae5
              );
          }

          .ap-kpi-icon.orange {
            color: #d97706;
            background:
              linear-gradient(
                135deg,
                #fffbeb,
                #fef3c7
              );
          }

          .ap-kpi-label {
            color: var(--muted);
            font-size: .68rem;
            font-weight: 850;
            text-transform: uppercase;
            letter-spacing: .09em;
          }

          .ap-kpi-value {
            margin-top: 5px;
            color: var(--text-dark);
            font-size: 1.95rem;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.055em;
          }

          .ap-kpi-caption {
            margin-top: 7px;
            color: var(--light-muted);
            font-size: .7rem;
          }

          /* =====================================================
             COMMON CARD
          ===================================================== */

          .ap-card {
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 23px;
            background: var(--surface);
            box-shadow:
              0 2px 5px rgba(46,16,101,.02),
              0 18px 50px rgba(46,16,101,.055);
          }

          .ap-card-header {
            position: relative;
            padding: 21px 24px;
            border-bottom: 1px solid var(--border);
            background:
              linear-gradient(
                180deg,
                #ffffff 0%,
                #fcfbff 100%
              );
          }

          .ap-card-header::after {
            content: "";
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: -1px;
            height: 1px;
            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(124,58,237,.12),
                transparent
              );
          }

          .ap-heading-icon {
            width: 47px;
            height: 47px;
            flex: 0 0 47px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
            color: var(--purple-700);
            background:
              linear-gradient(
                135deg,
                #f5f3ff,
                #ede9fe
              );
            border: 1px solid #e9e2ff;
            box-shadow:
              0 7px 18px rgba(124,58,237,.08);
          }

          .ap-heading-icon.blue {
            color: #4f46e5;
            background:
              linear-gradient(
                135deg,
                #eef2ff,
                #e0e7ff
              );
            border-color: #e0e7ff;
          }

          .ap-title {
            color: var(--text-dark);
            font-size: .98rem;
            font-weight: 900;
            letter-spacing: -.025em;
          }

          .ap-subtitle {
            margin-top: 3px;
            color: var(--light-muted);
            font-size: .73rem;
          }

          /* =====================================================
             BUTTONS
          ===================================================== */

          .ap-primary-btn {
            min-height: 42px;
            border: 0;
            border-radius: 12px;
            padding: 9px 17px;
            color: #fff;
            background:
              linear-gradient(
                135deg,
                #7c3aed,
                #6d28d9
              );
            font-size: .76rem;
            font-weight: 850;
            box-shadow:
              0 8px 20px rgba(109,40,217,.22);
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .ap-primary-btn:hover:not(:disabled) {
            color: #fff;
            transform: translateY(-2px);
            box-shadow:
              0 12px 27px rgba(109,40,217,.3);
          }

          .ap-primary-btn:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .ap-secondary-btn {
            min-height: 42px;
            border: 1px solid var(--border-strong);
            border-radius: 12px;
            padding: 9px 17px;
            color: #625d73;
            background: #fff;
            font-size: .76rem;
            font-weight: 800;
            transition: all .2s ease;
          }

          .ap-secondary-btn:hover {
            color: var(--purple-700);
            background: var(--purple-50);
            border-color: var(--purple-200);
          }

          /* =====================================================
             FORM
          ===================================================== */

          .ap-form {
            padding: 27px;
            background:
              radial-gradient(
                circle at 0% 0%,
                rgba(139,92,246,.055),
                transparent 34%
              ),
              radial-gradient(
                circle at 100% 100%,
                rgba(99,102,241,.035),
                transparent 35%
              ),
              linear-gradient(
                180deg,
                #fcfbff,
                #f8f7fc
              );
            border-bottom: 1px solid var(--border);
          }

          .ap-field-label {
            display: block;
            margin-bottom: 7px;
            color: #514c63;
            font-size: .68rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .075em;
          }

          .ap-control {
            min-height: 46px;
            border: 1px solid #e1ddec;
            border-radius: 12px;
            color: #29243b;
            background: rgba(255,255,255,.96);
            font-size: .82rem;
            box-shadow:
              0 1px 2px rgba(46,16,101,.025);
            transition:
              border-color .2s ease,
              box-shadow .2s ease,
              background .2s ease;
          }

          .ap-control:hover {
            border-color: #cfc5e5;
          }

          .ap-control:focus {
            border-color: var(--purple-400);
            background: #fff;
            box-shadow:
              0 0 0 4px rgba(124,58,237,.09),
              0 5px 15px rgba(46,16,101,.035);
          }

          .ap-input-group .input-group-text {
            min-width: 45px;
            justify-content: center;
            border: 1px solid #e1ddec;
            border-right: 0;
            border-radius: 12px 0 0 12px;
            background: #fff;
            color: #a19bad;
          }

          .ap-input-group:focus-within
          .input-group-text {
            color: var(--purple-600);
            border-color: var(--purple-400);
          }

          .ap-input-group .ap-control {
            border-left: 0;
            border-radius: 0 12px 12px 0;
          }

          .ap-form-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e8e3f0;
          }

          .ap-form-hint {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #9a95a8;
            font-size: .7rem;
          }

          .ap-form-hint i {
            color: var(--purple-500);
            font-size: .9rem;
          }

          /* =====================================================
             TOOLBAR
          ===================================================== */

          .ap-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 17px 24px;
            border-bottom: 1px solid var(--border);
            background: #fff;
          }

          .ap-search {
            position: relative;
            width: 100%;
            max-width: 340px;
          }

          .ap-search i {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #aaa4b7;
            font-size: .82rem;
            pointer-events: none;
          }

          .ap-search input {
            width: 100%;
            height: 41px;
            padding: 0 13px 0 37px;
            border: 1px solid #e4dfed;
            border-radius: 11px;
            outline: none;
            color: #29243b;
            background: #faf9fd;
            font-size: .76rem;
            transition: all .2s ease;
          }

          .ap-search input::placeholder {
            color: #aaa5b5;
          }

          .ap-search input:focus {
            border-color: var(--purple-300);
            background: #fff;
            box-shadow:
              0 0 0 4px rgba(124,58,237,.07);
          }

          .ap-filter {
            min-width: 170px;
            height: 41px;
            border: 1px solid #e4dfed;
            border-radius: 11px;
            color: #59536a;
            background: #faf9fd;
            font-size: .75rem;
            font-weight: 700;
          }

          .ap-filter:focus {
            border-color: var(--purple-300);
            box-shadow:
              0 0 0 4px rgba(124,58,237,.07);
          }

          /* =====================================================
             TABLE
          ===================================================== */

          .ap-table-wrapper {
            overflow-x: auto;
          }

          .ap-table {
            width: 100%;
            min-width: 1050px;
            margin: 0;
            border-collapse: separate;
            border-spacing: 0;
          }

          .ap-table thead th {
            padding: 14px 17px;
            border-bottom: 1px solid #ebe7f1;
            color: #9993a8;
            background: #faf9fc;
            font-size: .63rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .075em;
            white-space: nowrap;
          }

          .ap-table tbody td {
            padding: 16px 17px;
            border-bottom: 1px solid #f0edf4;
            color: #625d70;
            font-size: .78rem;
            vertical-align: middle;
          }

          .ap-table tbody tr:last-child td {
            border-bottom: 0;
          }

          .ap-table tbody tr {
            transition:
              background .18s ease,
              box-shadow .18s ease;
          }

          .ap-table tbody tr:hover {
            background:
              linear-gradient(
                90deg,
                rgba(124,58,237,.018),
                rgba(139,92,246,.035),
                rgba(124,58,237,.018)
              );
          }

          /* =====================================================
             APPOINTMENT ID
          ===================================================== */

          .ap-id {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 9px;
            border: 1px solid #e5dcff;
            border-radius: 8px;
            color: var(--purple-700);
            background: #faf8ff;
            font-size: .66rem;
            font-weight: 900;
            white-space: nowrap;
          }

          /* =====================================================
             AVATAR
          ===================================================== */

          .ap-avatar {
            width: 41px;
            height: 41px;
            flex: 0 0 41px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            color: var(--purple-700);
            background:
              linear-gradient(
                135deg,
                #f5f3ff,
                #e9e1ff
              );
            border: 1px solid #e7ddff;
            font-size: .7rem;
            font-weight: 900;
            box-shadow:
              0 4px 10px rgba(124,58,237,.07);
          }

          .ap-patient-name {
            color: #272238;
            font-size: .79rem;
            font-weight: 850;
          }

          .ap-meta {
            margin-top: 3px;
            color: #aaa4b5;
            font-size: .65rem;
          }

          /* =====================================================
             DOCTOR
          ===================================================== */

          .ap-doctor {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 10px;
            border: 1px solid #e7e2ee;
            border-radius: 9px;
            color: #554f63;
            background: #faf9fc;
            font-size: .71rem;
            font-weight: 750;
          }

          .ap-doctor i {
            color: var(--purple-500);
          }

          /* =====================================================
             DATE / REASON
          ===================================================== */

          .ap-date {
            color: #302b40;
            font-size: .77rem;
            font-weight: 850;
          }

          .ap-time {
            margin-top: 3px;
            color: #a19bab;
            font-size: .67rem;
          }

          .ap-reason {
            max-width: 190px;
            overflow: hidden;
            color: #706a7c;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* =====================================================
             STATUS
          ===================================================== */

          .ap-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: .64rem;
            font-weight: 900;
            white-space: nowrap;
          }

          .ap-status.status-scheduled {
            color: #9a6700;
            background: #fffbeb;
            border: 1px solid #fde68a;
          }

          .ap-status.status-progress {
            color: #4338ca;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
          }

          .ap-status.status-completed {
            color: #047857;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
          }

          .ap-status.status-cancelled {
            color: #b91c1c;
            background: #fef2f2;
            border: 1px solid #fecaca;
          }

          /* =====================================================
             ACTIONS
          ===================================================== */

          .ap-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 6px;
          }

          .ap-action {
            width: 35px;
            height: 35px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e1eb;
            border-radius: 9px;
            background: #fff;
            transition: all .18s ease;
          }

          .ap-action:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          .ap-action:disabled {
            opacity: .5;
            cursor: not-allowed;
          }

          .ap-action.complete {
            color: #059669;
          }

          .ap-action.complete:hover {
            border-color: #a7f3d0;
            background: #ecfdf5;
            box-shadow: 0 5px 13px rgba(5,150,105,.1);
          }

          .ap-action.start {
            color: #4f46e5;
          }

          .ap-action.start:hover {
            border-color: #c7d2fe;
            background: #eef2ff;
            box-shadow: 0 5px 13px rgba(79,70,229,.1);
          }

          .ap-action.delete {
            color: #dc2626;
          }

          .ap-action.delete:hover {
            border-color: #fecaca;
            background: #fef2f2;
            box-shadow: 0 5px 13px rgba(220,38,38,.08);
          }

          /* =====================================================
             EMPTY STATE
          ===================================================== */

          .ap-empty {
            padding: 78px 20px;
            text-align: center;
          }

          .ap-empty-icon {
            width: 74px;
            height: 74px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5def4;
            border-radius: 21px;
            color: #a29bb0;
            background:
              linear-gradient(
                135deg,
                #faf9ff,
                #f5f3ff
              );
            font-size: 1.45rem;
            box-shadow:
              0 8px 20px rgba(46,16,101,.045);
          }

          .ap-empty-title {
            color: #302b40;
            font-size: .9rem;
            font-weight: 900;
          }

          .ap-empty-text {
            margin-top: 5px;
            color: #a29cad;
            font-size: .73rem;
          }

          /* =====================================================
             RESPONSIVE
          ===================================================== */

          @media (max-width: 991px) {
            .ap-form {
              padding: 21px;
            }

            .ap-toolbar {
              align-items: stretch;
              flex-direction: column;
            }

            .ap-search {
              max-width: none;
            }

            .ap-filter {
              width: 100%;
            }
          }

          @media (max-width: 767px) {

            .ap-kpi {
              min-height: 125px;
              padding: 18px;
              border-radius: 18px;
            }

            .ap-kpi-icon {
              width: 47px;
              height: 47px;
              flex-basis: 47px;
              border-radius: 14px;
            }

            .ap-kpi-value {
              font-size: 1.65rem;
            }

            .ap-card {
              border-radius: 18px;
            }

            .ap-card-header {
              padding: 17px;
            }

            .ap-heading-icon {
              width: 43px;
              height: 43px;
              flex-basis: 43px;
              border-radius: 13px;
            }

            .ap-form {
              padding: 17px;
            }

            .ap-form-footer {
              align-items: stretch;
              flex-direction: column;
            }

            .ap-form-hint {
              width: 100%;
            }

            .ap-form-footer > div:last-child {
              width: 100%;
            }

            .ap-form-footer button {
              flex: 1;
            }

            .ap-toolbar {
              padding: 14px 17px;
            }

            .ap-title {
              font-size: .9rem;
            }

            .ap-subtitle {
              font-size: .68rem;
            }
          }

          @media (max-width: 575px) {

            .ap-kpi {
              min-height: 112px;
            }

            .ap-kpi-caption {
              display: none;
            }

            .ap-kpi-label {
              font-size: .62rem;
            }

            .ap-kpi-value {
              font-size: 1.5rem;
            }

            .ap-card-header {
              gap: 10px;
            }

            .ap-card-header .ap-primary-btn,
            .ap-card-header .ap-secondary-btn {
              width: 40px;
              min-height: 40px;
              height: 40px;
              padding: 0;
              font-size: 0;
            }

            .ap-card-header .ap-primary-btn i,
            .ap-card-header .ap-secondary-btn i {
              margin: 0 !important;
              font-size: .9rem;
            }

            .ap-empty {
              padding: 60px 15px;
            }
          }
        `}
      </style>

      <div className="appointments-panel">

        {/* =====================================================
            KPI DASHBOARD
        ===================================================== */}

        <div className="row g-3 mb-4">

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="ap-kpi"
              style={{ color: '#7c3aed' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="ap-kpi-icon purple">
                  <i className="bi bi-calendar2-check-fill"></i>
                </div>

                <div>
                  <div className="ap-kpi-label">
                    Scheduled
                  </div>

                  <div className="ap-kpi-value">
                    {scheduledCount}
                  </div>

                  <div className="ap-kpi-caption">
                    Upcoming consultations
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="ap-kpi"
              style={{ color: '#6366f1' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="ap-kpi-icon indigo">
                  <i className="bi bi-activity"></i>
                </div>

                <div>
                  <div className="ap-kpi-label">
                    In Progress
                  </div>

                  <div className="ap-kpi-value">
                    {inProgressCount}
                  </div>

                  <div className="ap-kpi-caption">
                    Active consultations
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="ap-kpi"
              style={{ color: '#059669' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="ap-kpi-icon green">
                  <i className="bi bi-check2-circle"></i>
                </div>

                <div>
                  <div className="ap-kpi-label">
                    Completed
                  </div>

                  <div className="ap-kpi-value">
                    {completedCount}
                  </div>

                  <div className="ap-kpi-caption">
                    Successfully completed
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="ap-kpi"
              style={{ color: '#d97706' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="ap-kpi-icon orange">
                  <i className="bi bi-calendar-x"></i>
                </div>

                <div>
                  <div className="ap-kpi-label">
                    Cancelled
                  </div>

                  <div className="ap-kpi-value">
                    {cancelledCount}
                  </div>

                  <div className="ap-kpi-caption">
                    Removed from schedule
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* =====================================================
            SCHEDULE APPOINTMENT
        ===================================================== */}

        <div className="ap-card mb-4">

          <div
            className="ap-card-header d-flex align-items-center justify-content-between gap-3"
            style={{ cursor: 'pointer' }}
            onClick={() =>
              setIsExpanded((prev) => !prev)
            }
          >

            <div className="d-flex align-items-center gap-3">

              <div className="ap-heading-icon">
                <i className="bi bi-calendar-plus fs-5"></i>
              </div>

              <div>
                <div className="ap-title">
                  Schedule Consultation
                </div>

                <div className="ap-subtitle">
                  Create and assign a new patient appointment
                </div>
              </div>

            </div>

            <button
              type="button"
              className={
                isExpanded
                  ? 'ap-secondary-btn'
                  : 'ap-primary-btn'
              }
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
            >
              <i
                className={`bi ${
                  isExpanded
                    ? 'bi-chevron-up'
                    : 'bi-plus-lg'
                } me-2`}
              ></i>

              {isExpanded
                ? 'Close'
                : 'New Appointment'}
            </button>

          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="ap-form">

                  <form onSubmit={handleSubmit}>

                <div className="row g-3">

                  {/* PATIENT */}

                  <div className="col-12 col-lg-6">

                    <label className="ap-field-label">
                      Patient
                    </label>

                    <div className="input-group ap-input-group">

                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>

                      <select
                        className="form-select ap-control"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select patient
                        </option>

                        {safePatients.map((patient) => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.name} • #{patient.id}
                            {patient.disease
                              ? ` • ${patient.disease}`
                              : ''}
                          </option>
                        ))}
                      </select>

                    </div>

                  </div>

                  {/* SPECIALIST */}

                  <div className="col-12 col-lg-6">

                    <label className="ap-field-label">
                      Specialist
                    </label>

                    <div className="input-group ap-input-group">

                      <span className="input-group-text">
                        <i className="bi bi-heart-pulse"></i>
                      </span>

                      <select
                        className="form-select ap-control"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select medical specialist
                        </option>

                        {safeDoctors.map((doctor) => {

                          const doctorName =
                            doctor.name?.startsWith('Dr.')
                              ? doctor.name
                              : `Dr. ${doctor.name}`;

                          return (
                            <option
                              key={doctor.id}
                              value={doctor.id}
                            >
                              {doctorName} •{' '}
                              {doctor.specialty ||
                                doctor.department ||
                                'Specialist'}
                            </option>
                          );
                        })}

                      </select>

                    </div>

                  </div>

                  {/* DATE */}

                  <div className="col-12 col-md-4">

                    <label className="ap-field-label">
                      Consultation Date
                    </label>

                    <input
                      type="date"
                      className="form-control ap-control"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={getToday()}
                      required
                    />

                  </div>

                  {/* TIME */}

                  <div className="col-12 col-md-4">

                    <label className="ap-field-label">
                      Time Slot
                    </label>

                    <select
                      className="form-select ap-control"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                    >
                      <option value="09:00 AM">
                        09:00 AM
                      </option>

                      <option value="10:00 AM">
                        10:00 AM
                      </option>

                      <option value="11:30 AM">
                        11:30 AM
                      </option>

                      <option value="02:00 PM">
                        02:00 PM
                      </option>

                      <option value="04:00 PM">
                        04:00 PM
                      </option>
                    </select>

                  </div>

                  {/* PURPOSE */}

                  <div className="col-12 col-md-4">

                    <label className="ap-field-label">
                      Visit Purpose
                    </label>

                    <input
                      type="text"
                      className="form-control ap-control"
                      name="reason"
                      placeholder="Follow-up, ECG review..."
                      value={formData.reason}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                <div className="ap-form-footer">

                  <div className="ap-form-hint">
                    <i className="bi bi-shield-check"></i>

                    Appointment details will be securely recorded.
                  </div>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      className="ap-secondary-btn"
                      onClick={() => {
                        resetForm();
                        setIsExpanded(false);
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="ap-primary-btn"
                      disabled={submitting}
                    >

                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />

                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-check me-2"></i>
                          Confirm Appointment
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </form>

            </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* =====================================================
            APPOINTMENT DIRECTORY
        ===================================================== */}

        <div className="ap-card">

          <div className="ap-card-header d-flex flex-wrap align-items-center justify-content-between gap-3">

            <div className="d-flex align-items-center gap-3">

              <div className="ap-heading-icon blue">
                <i className="bi bi-calendar2-week fs-5"></i>
              </div>

              <div>
                <div className="ap-title">
                  Appointment Schedule & OPD Queue
                </div>

                <div className="ap-subtitle">
                  Monitor patient consultations, clinical vitals and digital prescriptions
                </div>
              </div>

            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-dark btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm border border-secondary"
                onClick={() => setShowLobbyTv(true)}
                style={{ background: '#0a1128', color: '#38bdf8' }}
              >
                <i className="bi bi-tv text-info fs-6"></i>
                Live OPD Lobby TV Screen
              </button>

              {!isPatient && safeAppointments.some(a => getNormalizedStatus(a.status) === 'Scheduled' || getNormalizedStatus(a.status) === 'In Progress') && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
                  onClick={() => {
                    const nextAppt = safeAppointments.find(a => getNormalizedStatus(a.status) === 'In Progress') || safeAppointments.find(a => getNormalizedStatus(a.status) === 'Scheduled');
                    if (nextAppt) setActiveConsultationAppt(nextAppt);
                  }}
                >
                  <i className="bi bi-heart-pulse-fill text-white"></i>
                  Start Next OPD Consultation
                </button>
              )}
            </div>

          </div>

          {/* TOOLBAR */}

          <div className="ap-toolbar">

            <div className="ap-search">

              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search patient, specialist, reason..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />

            </div>

            <select
              className="form-select ap-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">
                All appointments
              </option>

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

          </div>

          {/* TABLE */}

          <div className="ap-table-wrapper">

            <table className="ap-table">

              <thead>

                <tr>
                  <th>Appointment</th>
                  <th>Patient</th>
                  <th>Specialist</th>
                  <th>Schedule</th>
                  <th>Visit Purpose</th>
                  <th>Status</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredAppointments.length === 0 ? (

                  <tr>

                    <td colSpan="7">

                      <div className="ap-empty">

                        <div className="ap-empty-icon">
                          <i className="bi bi-calendar-x"></i>
                        </div>

                        <div className="ap-empty-title">
                          No appointments found
                        </div>

                        <div className="ap-empty-text">
                          Try changing your search or workflow filter.
                        </div>

                      </div>

                    </td>

                  </tr>

                ) : (

                  paginatedAppointments.map((appt) => {

                    const patientName =
                      appt.patientName ||
                      appt.patient?.name ||
                      'N/A';

                    const doctorName =
                      appt.doctorName ||
                      appt.doctor?.name ||
                      'N/A';

                    const formattedDoctor =
                      doctorName.startsWith('Dr.')
                        ? doctorName
                        : `Dr. ${doctorName}`;

                    const statusConfig =
                      getStatusConfig(appt.status);

                    const normalizedStatus =
                      getNormalizedStatus(appt.status);

                    const isProcessing =
                      processingId === appt.id;

                    return (

                      <motion.tr 
                        key={appt.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >

                        {/* APPOINTMENT */}

                        <td>

                          <span className="ap-id">
                            <i className="bi bi-hash"></i>
                            APT-{appt.id}
                          </span>

                        </td>

                        {/* PATIENT */}

                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <div className="ap-avatar">
                              {getInitials(patientName)}
                            </div>

                            <div>

                              <div className="ap-patient-name">
                                {patientName}
                              </div>

                              <div className="ap-meta">

                                {appt.patient?.id
                                  ? `Patient #${appt.patient.id}`
                                  : 'Registered patient'}

                              </div>

                            </div>

                          </div>

                        </td>

                        {/* DOCTOR */}

                        <td>

                          <div className="ap-doctor">

                            <i className="bi bi-person-badge"></i>

                            {formattedDoctor}

                          </div>

                        </td>

                        {/* DATE */}

                        <td>

                          <div className="ap-date">
                            {appt.date}
                          </div>

                          <div className="ap-time">

                            <i className="bi bi-clock me-1"></i>

                            {appt.time || '—'}

                          </div>

                        </td>

                        {/* PURPOSE */}

                        <td>

                          <div
                            className="ap-reason"
                            title={
                              appt.reason ||
                              'Not provided'
                            }
                          >
                            {appt.reason || '—'}
                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`ap-status ${statusConfig.className}`}
                          >

                            <i
                              className={`bi ${statusConfig.icon}`}
                            ></i>

                            {statusConfig.label}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="ap-actions">

                            {/* DOCTOR / ADMIN CONSULTATION ACTION */}
                            {!isPatient && normalizedStatus !== 'Completed' && normalizedStatus !== 'Cancelled' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info py-1 px-2 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                                  style={{ fontSize: '11px', borderRadius: '7px' }}
                                  title="Call patient to consultation room with audible lobby chime"
                                  onClick={() => handleCallPatient(appt)}
                                >
                                  <i className="bi bi-megaphone-fill text-info"></i>
                                  Call #{appt.tokenNumber || appt.id || '1'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary py-1 px-2 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                                  style={{ fontSize: '11px', borderRadius: '7px' }}
                                  title="Start Doctor Consultation & Generate Digital Rx"
                                  onClick={() => setActiveConsultationAppt(appt)}
                                >
                                  <i className="bi bi-heart-pulse-fill text-white"></i>
                                  Consult & Rx
                                </button>
                              </>
                            )}

                            {/* COMPLETED: VIEW RX & PRINT SLIP */}
                            {normalizedStatus === 'Completed' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success py-1 px-2 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                                style={{ fontSize: '11px', borderRadius: '7px' }}
                                title="View & Print Official Medical Prescription Slip"
                                onClick={() => {
                                  setActivePrintRx({
                                    id: appt.id,
                                    patientName: appt.patientName || appt.patient?.name || 'Patient',
                                    patientId: appt.patientId || appt.patient?.id || 1,
                                    doctorName: appt.doctorName || appt.doctor?.name || 'Dr. Specialist',
                                    department: appt.department || 'General Medicine',
                                    date: appt.date || new Date().toISOString().split('T')[0],
                                    diagnosis: appt.reason || 'OPD Clinical Consultation',
                                    complaint: appt.reason,
                                    vitals: {
                                      bp: '120/80',
                                      pulse: '74',
                                      spo2: '98',
                                      temp: '98.4',
                                      weight: '68'
                                    },
                                    medicines: [
                                      { name: 'Paracetamol 650mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'Take after meals' },
                                      { name: 'Pantoprazole 40mg', dosage: '1 Tab', frequency: '1-0-0', duration: '5 Days', instructions: 'Take 30 mins before breakfast' }
                                    ],
                                    notes: 'Advised rest, adequate oral fluids, and to complete full course of prescribed medicines.',
                                    followUp: 'After 5 Days (or SOS)'
                                  });
                                }}
                              >
                                <i className="bi bi-printer-fill text-white"></i>
                                Rx Slip
                              </button>
                            )}

                            {normalizedStatus !== 'Completed' &&
                              normalizedStatus !== 'Cancelled' && (
                                <>

                                  <button
                                    type="button"
                                    className="ap-action complete"
                                    title="Quick mark completed"
                                    disabled={isProcessing}
                                    onClick={() =>
                                      handleStatusChange(
                                        appt.id,
                                        'Completed'
                                      )
                                    }
                                  >
                                    {isProcessing ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      <i className="bi bi-check-lg"></i>
                                    )}
                                  </button>

                                  {normalizedStatus !== 'In Progress' && (
                                    <button
                                      type="button"
                                      className="ap-action start"
                                      title="Mark in progress"
                                      disabled={isProcessing}
                                      onClick={() =>
                                        handleStatusChange(
                                          appt.id,
                                          'In Progress'
                                        )
                                      }
                                    >
                                      <i className="bi bi-play-fill"></i>
                                    </button>
                                  )}

                                </>
                              )}

                            {normalizedStatus !== 'Cancelled' && (
                              <button
                                type="button"
                                className="ap-action cancel"
                                title="Cancel appointment"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleCancel(appt.id)
                                }
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}

                            {!isPatient && (
                              <button
                                type="button"
                                className="ap-action delete"
                                title="Delete appointment record"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleDelete(appt.id)
                                }
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            )}

                          </div>

                        </td>

                      </motion.tr>

                    );
                  })

                )}

              </tbody>

            </table>

          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredAppointments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />

        </div>

        {/* =====================================================
            DOCTOR OPD CONSULTATION & RX GENERATOR MODAL
        ===================================================== */}
        {activeConsultationAppt && (
          <ConsultationModal
            show={!!activeConsultationAppt}
            appointment={activeConsultationAppt}
            patient={safePatients.find((p) => p.id === activeConsultationAppt?.patientId)}
            doctor={safeDoctors.find((d) => d.id === activeConsultationAppt?.doctorId)}
            onClose={() => setActiveConsultationAppt(null)}
            onComplete={(prescriptionData) => {
              setActivePrintRx(prescriptionData);
              if (onAppointmentBooked) {
                onAppointmentBooked();
              }
            }}
          />
        )}

        {/* =====================================================
            OFFICIAL PRINTABLE HOSPITAL PRESCRIPTION SLIP MODAL
        ===================================================== */}
        {activePrintRx && (
          <PrintModal
            show={!!activePrintRx}
            onClose={() => setActivePrintRx(null)}
            title={`Official Medical Prescription · Rx-${activePrintRx.id || 'NEW'}`}
          >
            <PrescriptionPrintSlip rx={activePrintRx} />
          </PrintModal>
        )}

        {/* =====================================================
            LIVE OPD WAITING LOBBY BIG-SCREEN TV DISPLAY MODAL
        ===================================================== */}
        <OpdLobbyTvDisplay
          show={showLobbyTv}
          onClose={() => setShowLobbyTv(false)}
          appointments={safeAppointments}
          doctors={safeDoctors}
          patients={safePatients}
          currentCalling={currentCallingToken}
        />

      </div>
    </>
  );
}

export default AppointmentsPanel;
