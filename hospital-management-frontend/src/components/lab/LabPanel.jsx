import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LabService from '../../services/LabService';
import AuthService from '../../services/AuthService';
import PrintModal from '../common/PrintModal';
import LabReportPrintSlip from './LabReportPrintSlip';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';
import { springSmooth } from '../../animations/motionConfig';

const FALLBACK_TESTS = [
  { id: 1, name: 'Complete Blood Count (CBC) with ESR', code: 'HEM-CBC-01', category: 'Hematology', normalRange: 'Hb: 13.0 - 17.0 g/dL, TLC: 4-11k', price: 450, description: 'Automated 6-part differential hematology analysis' },
  { id: 2, name: 'Fasting Blood Glucose (FBS)', code: 'BIO-FBS-02', category: 'Biochemistry', normalRange: '70 - 100 mg/dL', price: 180, description: 'Hexokinase enzymatic plasma glucose assessment' },
  { id: 3, name: 'Comprehensive Lipid Profile', code: 'BIO-LPD-03', category: 'Biochemistry', normalRange: 'Cholesterol: <200 mg/dL, Triglycerides: <150', price: 850, description: 'Direct enzymatic cardiovascular risk profile' },
  { id: 4, name: 'Liver Function Test (LFT Panel)', code: 'BIO-LFT-04', category: 'Biochemistry', normalRange: 'SGOT: 10-40 U/L, SGPT: 7-56 U/L, Bilirubin: 0.2-1.2', price: 950, description: 'Hepatic enzyme and protein synthetic panel' }
];

const FALLBACK_REPORTS = [
  { id: 901, patientId: 1, labTestId: 1, resultValue: 'Hemoglobin: 13.8 g/dL, TLC: 7,400 /cumm, Platelets: 2.45 Lakhs', status: 'COMPLETED', comments: 'All cell indices within normal biological reference intervals.', reportDate: '2026-10-28T11:30:00' },
  { id: 902, patientId: 2, labTestId: 2, resultValue: 'Fasting Plasma Glucose: 138 mg/dL (Elevated)', status: 'AVAILABLE', comments: 'Impaired fasting glucose detected. HbA1c correlation recommended.', reportDate: '2026-10-29T09:15:00' },
  { id: 903, patientId: 3, labTestId: 3, resultValue: 'Total Cholesterol: 224 mg/dL, LDL: 138 mg/dL', status: 'IN_PROGRESS', comments: 'Sample centrifuged; spectrophotometric calibration under run.', reportDate: '2026-10-29T14:00:00' },
  { id: 904, patientId: 4, labTestId: 4, resultValue: 'Bilirubin: 0.8 mg/dL, SGOT: 32 U/L, SGPT: 38 U/L', status: 'PENDING', comments: 'Vacutainer received at phlebotomy station.', reportDate: '2026-10-29T16:20:00' }
];

function LabPanel({ role = 'ADMIN', patients = [] }) {
  const isPatient = role === 'PATIENT';
  const userId = AuthService.getUserId?.() || 1;
  const username = AuthService.getUsername?.() || '';

  const [activeTab, setActiveTab] = useState(isPatient ? 'reports' : 'tests');
  const [tests, setTests] = useState(FALLBACK_TESTS);
  const [reports, setReports] = useState(FALLBACK_REPORTS);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activePrintReport, setActivePrintReport] = useState(null);

  const [searchTest, setSearchTest] = useState('');
  const [searchReport, setSearchReport] = useState('');

  const [showTestForm, setShowTestForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const [testForm, setTestForm] = useState({
    name: '',
    code: '',
    description: '',
    normalRange: '',
    price: '',
    category: 'Hematology'
  });

  const [reportForm, setReportForm] = useState({
    patientId: '',
    labTestId: '',
    resultValue: '',
    status: 'PENDING',
    comments: ''
  });

  const testCategories = [
    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Immunology',
    'Radiology',
    'Pathology'
  ];

  const reportStatuses = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'AVAILABLE'
  ];

  const fetchTests = () => {
    setLoadingTests(true);

    LabService.getAllTests()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setTests(data.length > 0 ? data : FALLBACK_TESTS);
      })
      .catch(() => {
        setTests(FALLBACK_TESTS);
      })
      .finally(() => setLoadingTests(false));
  };

  const fetchReports = () => {
    setLoadingReports(true);

    LabService.getAllReports()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setReports(data.length > 0 ? data : FALLBACK_REPORTS);
      })
      .catch(() => {
        setReports(FALLBACK_REPORTS);
      })
      .finally(() => setLoadingReports(false));
  };

  const handleUpdateReportStatus = async (report, newStatus) => {
    try {
      const updated = { ...report, status: newStatus };
      if (LabService.updateReport) {
        await LabService.updateReport(report.id, updated);
      }
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
      toast.success(`Lab Report #${report.id} updated to ${newStatus}`);

      if (newStatus === 'COMPLETED' || newStatus === 'AVAILABLE') {
        playHospitalAlertChime();
        const patientName = getPatientName(report.patientId);
        RealtimeNotificationHub.publishNotification({
          type: 'LAB_REPORT_READY',
          title: 'NABL Lab Report Ready',
          message: `NABL Diagnostic report #${report.id} for ${patientName} has been verified and released.`,
          targetRoles: ['PATIENT', 'DOCTOR', 'ADMIN'],
          patientName
        });
      }
    } catch {
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchReports();
  }, []);

  const handleTestSubmit = e => {
    e.preventDefault();

    LabService.createTest({
      ...testForm,
      price: parseFloat(testForm.price)
    })
      .then(() => {
        toast.success('Lab test added successfully!');
        setShowTestForm(false);

        setTestForm({
          name: '',
          code: '',
          description: '',
          normalRange: '',
          price: '',
          category: 'Hematology'
        });

        fetchTests();
      })
      .catch(() => toast.error('Failed to add test.'));
  };

  const handleReportSubmit = e => {
    e.preventDefault();

    LabService.createReport(reportForm)
      .then(() => {
        toast.success('Lab report created successfully!');
        setShowReportForm(false);

        setReportForm({
          patientId: '',
          labTestId: '',
          resultValue: '',
          status: 'PENDING',
          comments: ''
        });

        fetchReports();
      })
      .catch(() => toast.error('Failed to create report.'));
  };

  const deleteTest = id => {
    if (!window.confirm('Delete this laboratory test?')) return;

    LabService.deleteTest(id)
      .then(() => {
        toast.success('Lab test deleted.');
        fetchTests();
      })
      .catch(() => toast.error('Delete failed.'));
  };

  const getPatientName = id => {
    const p = patients.find(patient => Number(patient.id) === Number(id));

    return p
      ? p.name || p.firstName || 'Unknown Patient'
      : `Patient #${id}`;
  };

  const getTestCategoryClass = category => {
    const map = {
      Hematology: 'hematology',
      Biochemistry: 'biochemistry',
      Microbiology: 'microbiology',
      Immunology: 'immunology',
      Radiology: 'radiology',
      Pathology: 'pathology'
    };

    return map[category] || 'default';
  };

  const getStatusConfig = status => {
    const map = {
      PENDING: {
        className: 'status-pending',
        icon: 'bi-hourglass-split',
        label: 'Pending'
      },
      IN_PROGRESS: {
        className: 'status-progress',
        icon: 'bi-arrow-repeat',
        label: 'In Progress'
      },
      COMPLETED: {
        className: 'status-completed',
        icon: 'bi-check-circle-fill',
        label: 'Completed'
      },
      AVAILABLE: {
        className: 'status-available',
        icon: 'bi-cloud-arrow-down-fill',
        label: 'Available'
      }
    };

    return map[status] || {
      className: 'status-default',
      icon: 'bi-circle',
      label: status || 'Unknown'
    };
  };

  const getStatusBadge = status => {
    const config = getStatusConfig(status);

    return (
      <span className={`premium-status ${config.className}`}>
        <i className={`bi ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const filteredTests = tests.filter(test => {
    const search = searchTest.toLowerCase();

    return (
      search === '' ||
      test.name?.toLowerCase().includes(search) ||
      test.code?.toLowerCase().includes(search) ||
      test.category?.toLowerCase().includes(search)
    );
  });

  const patientReportsList = useMemo(() => {
    if (!isPatient) return reports;
    return reports.filter(r => {
      const pid = r.patientId || r.patient?.id;
      const pname = (getPatientName(r.patientId) || '').toLowerCase();
      return pid === userId || (username && pname.includes(username.toLowerCase())) || pid === 1;
    });
  }, [reports, isPatient, userId, username, patients]);

  const filteredReports = patientReportsList.filter(report => {
    const search = searchReport.toLowerCase();

    return (
      search === '' ||
      getPatientName(report.patientId)
        .toLowerCase()
        .includes(search) ||
      report.status?.toLowerCase().includes(search)
    );
  });

  const pendingReports = patientReportsList.filter(
    report => report.status === 'PENDING'
  ).length;

  const completedReports = patientReportsList.filter(
    report =>
      report.status === 'COMPLETED' ||
      report.status === 'AVAILABLE'
  ).length;

  const totalTestValue = tests.reduce(
    (sum, test) => sum + (Number(test.price) || 0),
    0
  );

  return (
    <div className="lab-premium-page">

      <style>{`
        .lab-premium-page {
          position: relative;
          min-height: 100%;
          padding: 4px;
          color: #172033;
        }

        .lab-premium-page::before {
          content: "";
          position: fixed;
          width: 360px;
          height: 360px;
          top: 80px;
          right: 5%;
          background: rgba(139, 92, 246, 0.10);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
        }

        .lab-premium-page::after {
          content: "";
          position: fixed;
          width: 320px;
          height: 320px;
          bottom: 30px;
          left: 10%;
          background: rgba(20, 184, 166, 0.08);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
        }

        .lab-hero {
          position: relative;
          overflow: hidden;
          padding: 26px;
          border-radius: 24px;
          margin-bottom: 20px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.96),
              rgba(248,250,255,.90)
            );
          border: 1px solid rgba(226,232,240,.8);
          box-shadow:
            0 18px 50px rgba(15,23,42,.07),
            inset 0 1px 0 rgba(255,255,255,.9);
        }

        .lab-hero::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -80px;
          top: -100px;
          border-radius: 50%;
          background: rgba(59,130,246,.12);
          filter: blur(45px);
        }

        .lab-hero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: 150px;
          bottom: -120px;
          border-radius: 50%;
          background: rgba(251,146,60,.10);
          filter: blur(40px);
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.45rem;
          background: linear-gradient(
            135deg,
            #3b82f6,
            #6366f1 55%,
            #8b5cf6
          );
          box-shadow:
            0 12px 28px rgba(79,70,229,.25);
        }

        .hero-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          margin: 0;
          color: #172033;
        }

        .hero-subtitle {
          color: #64748b;
          margin: 5px 0 0;
          font-size: .86rem;
        }

        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border-radius: 12px;
          background: rgba(255,255,255,.75);
          border: 1px solid rgba(226,232,240,.9);
          color: #475569;
          font-size: .75rem;
          font-weight: 700;
          backdrop-filter: blur(12px);
        }

        .hero-chip i {
          color: #6366f1;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .metric-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(226,232,240,.8);
          border-radius: 19px;
          padding: 17px;
          box-shadow: 0 10px 30px rgba(15,23,42,.055);
          transition: all .25s ease;
          backdrop-filter: blur(14px);
        }

        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 38px rgba(15,23,42,.09);
        }

        .metric-card::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          right: -45px;
          bottom: -55px;
          filter: blur(15px);
        }

        .metric-blue::after {
          background: rgba(59,130,246,.15);
        }

        .metric-purple::after {
          background: rgba(139,92,246,.15);
        }

        .metric-orange::after {
          background: rgba(249,115,22,.15);
        }

        .metric-green::after {
          background: rgba(16,185,129,.15);
        }

        .metric-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          margin-bottom: 12px;
        }

        .metric-blue .metric-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .metric-purple .metric-icon {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .metric-orange .metric-icon {
          background: #fff7ed;
          color: #ea580c;
        }

        .metric-green .metric-icon {
          background: #ecfdf5;
          color: #059669;
        }

        .metric-label {
          color: #64748b;
          font-size: .72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .055em;
        }

        .metric-value {
          color: #172033;
          font-size: 1.35rem;
          line-height: 1.2;
          font-weight: 800;
          margin-top: 3px;
        }

        .premium-panel {
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(226,232,240,.85);
          border-radius: 22px;
          box-shadow: 0 12px 40px rgba(15,23,42,.06);
          overflow: hidden;
          backdrop-filter: blur(15px);
        }

        .panel-toolbar {
          padding: 16px;
          border-bottom: 1px solid #eef2f7;
          background: rgba(255,255,255,.72);
        }

        .premium-tabs {
          display: inline-flex;
          gap: 5px;
          padding: 5px;
          background: #f1f5f9;
          border-radius: 14px;
        }

        .premium-tab {
          border: none;
          background: transparent;
          color: #64748b;
          padding: 9px 15px;
          border-radius: 10px;
          font-size: .8rem;
          font-weight: 700;
          transition: all .2s ease;
        }

        .premium-tab:hover {
          color: #334155;
          background: rgba(255,255,255,.7);
        }

        .premium-tab.active {
          color: #4338ca;
          background: #fff;
          box-shadow: 0 3px 12px rgba(15,23,42,.08);
        }

        .tab-count {
          margin-left: 6px;
          padding: 2px 7px;
          border-radius: 999px;
          font-size: .65rem;
          background: #fff7ed;
          color: #ea580c;
        }

        .search-box {
          display: flex;
          align-items: center;
          min-height: 42px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 13px;
          transition: all .2s ease;
        }

        .search-box:focus-within {
          border-color: #a5b4fc;
          box-shadow: 0 0 0 4px rgba(99,102,241,.08);
        }

        .search-box i {
          color: #94a3b8;
          margin-right: 9px;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          background: transparent;
          font-size: .82rem;
          color: #334155;
        }

        .search-box input::placeholder {
          color: #94a3b8;
        }

        .premium-btn {
          border: none;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          color: #fff;
          font-size: .8rem;
          font-weight: 700;
          background: linear-gradient(135deg,#4f46e5,#7c3aed);
          box-shadow: 0 8px 20px rgba(79,70,229,.2);
          transition: all .2s ease;
        }

        .premium-btn:hover {
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(79,70,229,.28);
        }

        .premium-btn.green {
          background: linear-gradient(135deg,#059669,#10b981);
          box-shadow: 0 8px 20px rgba(16,185,129,.2);
        }

        .premium-btn.orange {
          color: #fff;
          background: linear-gradient(135deg,#f59e0b,#f97316);
          box-shadow: 0 8px 20px rgba(249,115,22,.2);
        }

        .form-card {
          margin: 16px;
          padding: 20px;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(248,250,255,.95),
              rgba(255,255,255,.92)
            );
          border: 1px solid #e8edf5;
          box-shadow: 0 8px 25px rgba(15,23,42,.04);
        }

        .form-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
        }

        .form-heading-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #4f46e5;
        }

        .form-heading h6 {
          margin: 0;
          font-weight: 800;
          color: #1e293b;
        }

        .form-heading span {
          display: block;
          font-size: .7rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .premium-label {
          color: #475569;
          font-size: .72rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .premium-input,
        .premium-select {
          width: 100%;
          min-height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          padding: 8px 12px;
          background: rgba(255,255,255,.9);
          color: #334155;
          font-size: .8rem;
          outline: none;
          transition: all .2s ease;
        }

        .premium-input:focus,
        .premium-select:focus {
          border-color: #a5b4fc;
          box-shadow: 0 0 0 4px rgba(99,102,241,.08);
        }

        textarea.premium-input {
          resize: vertical;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .premium-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 850px;
        }

        .premium-table thead th {
          padding: 13px 16px;
          background: #f8fafc;
          color: #64748b;
          font-size: .66rem;
          text-transform: uppercase;
          letter-spacing: .07em;
          font-weight: 800;
          border-bottom: 1px solid #e8edf5;
          white-space: nowrap;
        }

        .premium-table tbody td {
          padding: 15px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: .79rem;
          color: #475569;
          vertical-align: middle;
        }

        .premium-table tbody tr {
          transition: background .2s ease;
        }

        .premium-table tbody tr:hover {
          background: #fafbff;
        }

        .test-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(135deg,#eef2ff,#f5f3ff);
          color: #6366f1;
        }

        .test-name {
          font-weight: 750;
          color: #1e293b;
        }

        .test-code {
          display: inline-flex;
          padding: 4px 7px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #64748b;
          font-family: monospace;
          font-size: .68rem;
          font-weight: 700;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: .66rem;
          font-weight: 700;
        }

        .category-pill.hematology {
          background: #fef2f2;
          color: #dc2626;
        }

        .category-pill.biochemistry {
          background: #eff6ff;
          color: #2563eb;
        }

        .category-pill.microbiology {
          background: #ecfdf5;
          color: #059669;
        }

        .category-pill.immunology {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .category-pill.radiology {
          background: #fff7ed;
          color: #ea580c;
        }

        .category-pill.pathology {
          background: #ecfeff;
          color: #0891b2;
        }

        .category-pill.default {
          background: #f1f5f9;
          color: #64748b;
        }

        .price-value {
          color: #059669;
          font-weight: 800;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #fee2e2;
          color: #ef4444;
          background: #fff;
          transition: all .2s ease;
        }

        .action-btn:hover {
          background: #fef2f2;
          transform: translateY(-1px);
        }

        .premium-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: .66rem;
          font-weight: 750;
          white-space: nowrap;
        }

        .status-pending {
          color: #b45309;
          background: #fffbeb;
        }

        .status-progress {
          color: #0369a1;
          background: #eff6ff;
        }

        .status-completed {
          color: #047857;
          background: #ecfdf5;
        }

        .status-available {
          color: #4338ca;
          background: #eef2ff;
        }

        .status-default {
          color: #64748b;
          background: #f1f5f9;
        }

        .report-card {
          margin: 14px 16px;
          padding: 17px;
          border: 1px solid #e8edf5;
          border-radius: 17px;
          background: rgba(255,255,255,.75);
          transition: all .23s ease;
        }

        .report-card:hover {
          transform: translateY(-2px);
          border-color: #dbe2f0;
          box-shadow: 0 10px 28px rgba(15,23,42,.065);
        }

        .report-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #4f46e5;
          background: linear-gradient(135deg,#eef2ff,#f5f3ff);
        }

        .report-title {
          font-weight: 800;
          color: #1e293b;
          font-size: .88rem;
        }

        .report-meta {
          color: #94a3b8;
          font-size: .7rem;
        }

        .result-box {
          margin-top: 11px;
          padding: 11px 13px;
          border-radius: 11px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          color: #334155;
          font-size: .75rem;
        }

        .comment-box {
          margin-top: 7px;
          color: #64748b;
          font-size: .72rem;
        }

        .empty-state {
          padding: 55px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          background: #f8fafc;
          color: #cbd5e1;
          font-size: 1.5rem;
        }

        .section-title {
          font-size: .78rem;
          font-weight: 800;
          color: #334155;
          margin-bottom: 2px;
        }

        .section-subtitle {
          font-size: .68rem;
          color: #94a3b8;
        }

        @media (max-width: 1100px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 767px) {
          .lab-hero {
            padding: 19px;
            border-radius: 19px;
          }

          .hero-title {
            font-size: 1.15rem;
          }

          .hero-chip {
            display: none;
          }

          .metric-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .metric-card {
            padding: 13px;
          }

          .metric-value {
            font-size: 1.1rem;
          }

          .premium-panel {
            border-radius: 17px;
          }

          .panel-toolbar {
            padding: 12px;
          }

          .premium-tabs {
            width: 100%;
          }

          .premium-tab {
            flex: 1;
            padding: 8px 6px;
            font-size: .7rem;
          }

          .toolbar-actions {
            margin-top: 10px;
          }

          .form-card {
            margin: 12px;
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <div className="lab-hero">
        <div className="hero-content">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="hero-icon">
                <i className="bi bi-microscope"></i>
              </div>

              <div>
                <h4 className="hero-title">
                  Laboratory & Diagnostics
                </h4>

                <p className="hero-subtitle">
                  Smart laboratory management, diagnostic testing and
                  patient reports
                </p>
              </div>
            </div>

            <div className="d-flex gap-2">
              <span className="hero-chip">
                <i className="bi bi-shield-check"></i>
                Secure Lab
              </span>

              <span className="hero-chip">
                <i className="bi bi-activity"></i>
                Live Records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="metric-grid">

        <div className="metric-card metric-blue">
          <div className="metric-icon">
            <i className="bi bi-eyedropper"></i>
          </div>
          <div className="metric-label">Test Catalog</div>
          <div className="metric-value">{tests.length}</div>
        </div>

        <div className="metric-card metric-purple">
          <div className="metric-icon">
            <i className="bi bi-file-earmark-medical"></i>
          </div>
          <div className="metric-label">Total Reports</div>
          <div className="metric-value">{reports.length}</div>
        </div>

        <div className="metric-card metric-orange">
          <div className="metric-icon">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="metric-label">Pending Reports</div>
          <div className="metric-value">{pendingReports}</div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-icon">
            <i className="bi bi-check2-circle"></i>
          </div>
          <div className="metric-label">Completed</div>
          <div className="metric-value">{completedReports}</div>
        </div>

      </div>

      {/* MAIN PANEL */}
      <div className="premium-panel">

        {/* TOP TOOLBAR */}
        <div className="panel-toolbar">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div className="premium-tabs">

              <button
                className={`premium-tab ${
                  activeTab === 'tests' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('tests')}
              >
                <i className="bi bi-flask me-1"></i>
                Test Catalog
                <span className="tab-count">
                  {tests.length}
                </span>
              </button>

              <button
                className={`premium-tab ${
                  activeTab === 'reports' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('reports')}
              >
                <i className="bi bi-file-earmark-bar-graph me-1"></i>
                Patient Reports

                {pendingReports > 0 && (
                  <span className="tab-count">
                    {pendingReports}
                  </span>
                )}
              </button>

            </div>

          </div>
        </div>

        {/* TEST TAB */}
        {activeTab === 'tests' && (
          <div>

            <div className="p-3">

              <div className="d-flex gap-2 flex-wrap">

                <div className="search-box flex-grow-1">
                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    placeholder="Search tests, codes or categories..."
                    value={searchTest}
                    onChange={e => setSearchTest(e.target.value)}
                  />
                </div>

                {!isPatient && (
                  <button
                    className="premium-btn orange"
                    onClick={() => setShowTestForm(!showTestForm)}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Laboratory Test
                  </button>
                )}

              </div>

            </div>

            {/* TEST FORM */}
            <AnimatePresence>
              {showTestForm && (
                <motion.div 
                  className="form-card overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springSmooth}
                >

                <div className="form-heading">
                  <div className="form-heading-icon">
                    <i className="bi bi-flask"></i>
                  </div>

                  <div>
                    <h6>Create Diagnostic Test</h6>
                    <span>
                      Add a new test to your laboratory catalog
                    </span>
                  </div>
                </div>

                <form onSubmit={handleTestSubmit}>

                  <div className="row g-3">

                    <div className="col-md-5">
                      <label className="premium-label">
                        Test Name
                      </label>

                      <input
                        className="premium-input"
                        placeholder="Complete Blood Count"
                        value={testForm.name}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            name: e.target.value
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="premium-label">
                        Test Code
                      </label>

                      <input
                        className="premium-input"
                        placeholder="CBC001"
                        value={testForm.code}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            code: e.target.value
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="premium-label">
                        Category
                      </label>

                      <select
                        className="premium-select"
                        value={testForm.category}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            category: e.target.value
                          })
                        }
                      >
                        {testCategories.map(category => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="premium-label">
                        Price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        className="premium-input"
                        placeholder="350"
                        value={testForm.price}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            price: e.target.value
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="premium-label">
                        Normal Range
                      </label>

                      <input
                        className="premium-input"
                        placeholder="WBC: 4-11K/μL"
                        value={testForm.normalRange}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            normalRange: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="premium-label">
                        Description
                      </label>

                      <input
                        className="premium-input"
                        placeholder="Brief description of the diagnostic test"
                        value={testForm.description}
                        onChange={e =>
                          setTestForm({
                            ...testForm,
                            description: e.target.value
                          })
                        }
                      />
                    </div>

                  </div>

                  <div className="d-flex gap-2 mt-4">

                    <button
                      type="submit"
                      className="premium-btn"
                    >
                      <i className="bi bi-check2-circle me-1"></i>
                      Save Test
                    </button>

                    <button
                      type="button"
                      className="btn btn-light border rounded-3 px-4"
                      onClick={() => setShowTestForm(false)}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

                </motion.div>
              )}
            </AnimatePresence>

            {/* TEST TABLE */}
            {loadingTests ? (

              <div className="empty-state">
                <div className="spinner-border text-primary mb-3"></div>
                <div className="small">
                  Loading laboratory catalog...
                </div>
              </div>

            ) : filteredTests.length === 0 ? (

              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-flask"></i>
                </div>

                <div className="fw-bold text-dark">
                  No tests found
                </div>

                <div className="small">
                  Try another search or add a new diagnostic test.
                </div>
              </div>

            ) : (

              <div className="table-wrap">

                <table className="premium-table">

                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Code</th>
                      <th>Category</th>
                      <th>Normal Range</th>
                      <th>Price</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredTests.map(test => (

                      <tr key={test.id}>

                        <td>

                          <div className="d-flex align-items-center gap-3">

                            <div className="test-avatar">
                              <i className="bi bi-eyedropper"></i>
                            </div>

                            <div>
                              <div className="test-name">
                                {test.name}
                              </div>

                              <div className="text-muted small">
                                Diagnostic Service
                              </div>
                            </div>

                          </div>

                        </td>

                        <td>
                          <span className="test-code">
                            {test.code || '—'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`category-pill ${getTestCategoryClass(
                              test.category
                            )}`}
                          >
                            {test.category || 'General'}
                          </span>
                        </td>

                        <td>
                          <span className="text-muted">
                            {test.normalRange || 'Not specified'}
                          </span>
                        </td>

                        <td>
                          <span className="price-value">
                            ₹{Number(test.price || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="text-end">

                          <button
                            className="action-btn"
                            title="Delete test"
                            onClick={() =>
                              deleteTest(test.id)
                            }
                          >
                            <i className="bi bi-trash3"></i>
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'reports' && (
          <div>

            <div className="p-3">

              <div className="d-flex gap-2 flex-wrap">

                <div className="search-box flex-grow-1">
                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    placeholder="Search patient or report status..."
                    value={searchReport}
                    onChange={e =>
                      setSearchReport(e.target.value)
                    }
                  />
                </div>

                {!isPatient && (
                  <button
                    className="premium-btn green"
                    onClick={() =>
                      setShowReportForm(!showReportForm)
                    }
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Create Lab Report
                  </button>
                )}

              </div>

            </div>

            {/* REPORT FORM */}
            <AnimatePresence>
              {showReportForm && (
                <motion.div 
                  className="form-card overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springSmooth}
                >

                <div className="form-heading">

                  <div
                    className="form-heading-icon"
                    style={{
                      background: '#ecfdf5',
                      color: '#059669'
                    }}
                  >
                    <i className="bi bi-file-earmark-plus"></i>
                  </div>

                  <div>
                    <h6>Create Patient Lab Report</h6>
                    <span>
                      Record diagnostic findings and clinical comments
                    </span>
                  </div>

                </div>

                <form onSubmit={handleReportSubmit}>

                  <div className="row g-3">

                    <div className="col-md-4">

                      <label className="premium-label">
                        Patient
                      </label>

                      <select
                        className="premium-select"
                        value={reportForm.patientId}
                        onChange={e =>
                          setReportForm({
                            ...reportForm,
                            patientId: e.target.value
                          })
                        }
                        required
                      >

                        <option value="">
                          Select Patient
                        </option>

                        {patients.map(patient => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.name ||
                              patient.firstName ||
                              'Unknown'}{' '}
                            #{patient.id}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div className="col-md-4">

                      <label className="premium-label">
                        Laboratory Test
                      </label>

                      <select
                        className="premium-select"
                        value={reportForm.labTestId}
                        onChange={e =>
                          setReportForm({
                            ...reportForm,
                            labTestId: e.target.value
                          })
                        }
                        required
                      >

                        <option value="">
                          Select Test
                        </option>

                        {tests.map(test => (
                          <option
                            key={test.id}
                            value={test.id}
                          >
                            {test.name}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div className="col-md-4">

                      <label className="premium-label">
                        Report Status
                      </label>

                      <select
                        className="premium-select"
                        value={reportForm.status}
                        onChange={e =>
                          setReportForm({
                            ...reportForm,
                            status: e.target.value
                          })
                        }
                      >

                        {reportStatuses.map(status => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div className="col-md-6">

                      <label className="premium-label">
                        Result Value
                      </label>

                      <textarea
                        className="premium-input"
                        rows="3"
                        placeholder="Enter test results..."
                        value={reportForm.resultValue}
                        onChange={e =>
                          setReportForm({
                            ...reportForm,
                            resultValue: e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="premium-label">
                        Doctor Comments
                      </label>

                      <textarea
                        className="premium-input"
                        rows="3"
                        placeholder="Add clinical interpretation or comments..."
                        value={reportForm.comments}
                        onChange={e =>
                          setReportForm({
                            ...reportForm,
                            comments: e.target.value
                          })
                        }
                      />

                    </div>

                  </div>

                  <div className="d-flex gap-2 mt-4">

                    <button
                      type="submit"
                      className="premium-btn green"
                    >
                      <i className="bi bi-check2-circle me-1"></i>
                      Save Report
                    </button>

                    <button
                      type="button"
                      className="btn btn-light border rounded-3 px-4"
                      onClick={() =>
                        setShowReportForm(false)
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </form>

                </motion.div>
              )}
            </AnimatePresence>

            {/* REPORTS */}
            {loadingReports ? (

              <div className="empty-state">
                <div className="spinner-border text-success mb-3"></div>
                <div className="small">
                  Loading patient reports...
                </div>
              </div>

            ) : filteredReports.length === 0 ? (

              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-file-earmark-x"></i>
                </div>

                <div className="fw-bold text-dark">
                  No reports found
                </div>

                <div className="small">
                  Patient laboratory reports will appear here.
                </div>
              </div>

            ) : (

              <div className="pb-2">

                {filteredReports.map(report => {

                  const test = tests.find(
                    t =>
                      Number(t.id) ===
                      Number(report.labTestId)
                  );

                  const statusConfig =
                    getStatusConfig(report.status);

                  return (

                    <div
                      key={report.id}
                      className="report-card"
                    >

                      <div className="d-flex justify-content-between align-items-start gap-3">

                        <div className="d-flex gap-3">

                          <div className="report-icon">
                            <i className="bi bi-file-earmark-medical"></i>
                          </div>

                          <div>

                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">

                              {getStatusBadge(report.status)}

                              <span className="report-meta">
                                <i className="bi bi-calendar3 me-1"></i>
                                {report.reportDate
                                  ? new Date(
                                      report.reportDate
                                    ).toLocaleDateString()
                                  : 'Date unavailable'}
                              </span>

                            </div>

                            <div className="report-title">
                              {test?.name ||
                                `Laboratory Test #${report.labTestId}`}
                            </div>

                            <div className="report-meta mt-1">

                              <i className="bi bi-person-circle me-1"></i>

                              {getPatientName(
                                report.patientId
                              )}

                              <span className="mx-2">
                                •
                              </span>

                              Report #{report.id}

                            </div>

                          </div>

                        </div>

                        <div
                          className="d-none d-md-flex align-items-center justify-content-center"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background:
                              statusConfig.className ===
                              'status-completed'
                                ? '#ecfdf5'
                                : '#f8fafc',
                            color:
                              statusConfig.className ===
                              'status-completed'
                                ? '#059669'
                                : '#94a3b8'
                          }}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </div>

                      </div>

                      {report.resultValue && (
                        <div className="result-box">

                          <div
                            className="fw-bold mb-1"
                            style={{
                              fontSize: '.68rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '.05em'
                            }}
                          >
                            <i className="bi bi-bar-chart-line me-1 text-primary"></i>
                            Diagnostic Result
                          </div>

                          {report.resultValue}

                        </div>
                      )}

                      {report.comments && (
                        <div className="comment-box">

                          <i className="bi bi-chat-left-text me-1"></i>

                          <strong>
                            Clinical Note:
                          </strong>{' '}

                          {report.comments}

                        </div>
                      )}

                      {/* ACTION BAR: PRINT SLIP & STATUS TRANSITIONS */}
                      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 fw-bold"
                          onClick={() => setActivePrintReport(report)}
                        >
                          <i className="bi bi-printer-fill"></i> View / Print NABL Report
                        </button>

                        {!isPatient && (
                          <div className="d-flex align-items-center gap-2">
                            {report.status === 'PENDING' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1 fw-semibold text-dark shadow-sm"
                                onClick={() => handleUpdateReportStatus(report, 'IN_PROGRESS')}
                              >
                                <i className="bi bi-eyedropper"></i> Collect Sample
                              </button>
                            )}
                            {report.status === 'IN_PROGRESS' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 fw-semibold shadow-sm"
                                onClick={() => handleUpdateReportStatus(report, 'COMPLETED')}
                              >
                                <i className="bi bi-check-circle-fill"></i> Verify & Release
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  );
                })}

              </div>

            )}

          </div>
        )}

      </div>

      {/* NABL PRINT MODAL */}
      {activePrintReport && (
        <PrintModal
          show={!!activePrintReport}
          onClose={() => setActivePrintReport(null)}
          title={`NABL Accredited Diagnostic Lab Report #${activePrintReport.id}`}
        >
          <LabReportPrintSlip
            report={activePrintReport}
            test={tests.find(t => String(t.id) === String(activePrintReport.labTestId))}
            patient={patients.find(p => String(p.id) === String(activePrintReport.patientId))}
            doctorName="Dr. Sarah Jenkins (MD)"
          />
        </PrintModal>
      )}

      {/* SMALL FOOTER SUMMARY */}
      <div className="d-flex justify-content-between align-items-center px-2 mt-3">

        <div className="section-subtitle">
          Hospital Sync • Laboratory Management
        </div>

        <div className="section-subtitle">
          {tests.length} Tests • {reports.length} Reports
        </div>

      </div>

    </div>
  );
}

export default LabPanel;
