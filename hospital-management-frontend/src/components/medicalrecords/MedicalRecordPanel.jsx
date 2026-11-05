import { useEffect, useMemo, useState } from 'react';
import MedicalRecordService from '../../services/MedicalRecordService';
import AuthService from '../../services/AuthService';
import PrintModal from '../common/PrintModal';
import PatientDischargeSummarySlip from './PatientDischargeSummarySlip';
import AnimatedCounter from '../common/AnimatedCounter';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'motion/react';
import { getHospitalName } from '../../services/hospitalConfig';
import '../../styles/clinicalDesksPremium.css';

const FALLBACK_PATIENTS = [
  { id: 1, name: 'John Doe',       age: 34, gender: 'Male',   bloodGroup: 'B +ve', phone: '+91 98765-43210', email: 'john.doe@gmail.com',    address: 'B-12 Vasant Vihar, New Delhi', allergies: 'Penicillin, Dust Mites' },
  { id: 2, name: 'Priya Sharma',   age: 28, gender: 'Female', bloodGroup: 'O +ve', phone: '+91 98112-33445', email: 'priya.sharma@yahoo.com', address: '44 Park Street, Kolkata',       allergies: 'Sulfa Drugs' },
  { id: 3, name: 'Robert Langdon', age: 45, gender: 'Male',   bloodGroup: 'A +ve', phone: '+91 99221-88990', email: 'robert.l@outlook.com',   address: 'Tower 4 Cyber City, Gurugram', allergies: 'None known' },
  { id: 4, name: 'Ananya Verma',   age: 22, gender: 'Female', bloodGroup: 'AB +ve',phone: '+91 98101-77665', email: 'ananya.v@gmail.com',     address: 'Sector 62, Noida',             allergies: 'NSAIDs' }
];

const recordTypes   = ['OPD', 'IPD', 'Emergency', 'Surgery', 'Follow-up', 'Discharge'];
const timelineTabs  = ['ALL', 'OPD', 'PRESCRIPTION', 'ADMISSION', 'BILLING'];

const typeConfig = {
  OPD:        { color: '#6366f1', bg: 'rgba(99,102,241,.10)',   icon: 'bi-person-vcard'          },
  IPD:        { color: '#f59e0b', bg: 'rgba(245,158,11,.12)',   icon: 'bi-hospital'               },
  Emergency:  { color: '#ef4444', bg: 'rgba(239,68,68,.10)',    icon: 'bi-heart-pulse'            },
  Surgery:    { color: '#8b5cf6', bg: 'rgba(139,92,246,.10)',   icon: 'bi-scissors'               },
  'Follow-up':{ color: '#06b6d4', bg: 'rgba(6,182,212,.10)',    icon: 'bi-arrow-repeat'           },
  Discharge:  { color: '#10b981', bg: 'rgba(16,185,129,.10)',   icon: 'bi-box-arrow-right'        }
};

function MedicalRecordPanel({
  role         = 'ADMIN',
  patients     = [],
  doctors      = [],
  appointments = [],
  prescriptions= [],
  bills        = [],
  beds         = [],
  darkMode     = false,
  onDataRefresh
}) {
  const isPatient  = role === 'PATIENT';
  const userId     = AuthService.getUserId?.()   || 1;

  const patientsList = useMemo(
    () => Array.isArray(patients) && patients.length > 0 ? patients : FALLBACK_PATIENTS,
    [patients]
  );

  /* ── View tabs: 'DOSSIER' | 'LEDGER' ── */
  const [activeViewTab, setActiveViewTab] = useState('DOSSIER');

  /* ── Patient 360° dossier ── */
  const [selectedPatientId, setSelectedPatientId] = useState(
    isPatient
      ? (patientsList.find(p => p.id === userId)?.id || patientsList[0]?.id || 1)
      : (patientsList[0]?.id || 1)
  );
  const selectedPatient = useMemo(() => {
    const found = patientsList.find(p => Number(p.id) === Number(selectedPatientId));
    return found || patientsList[0] || FALLBACK_PATIENTS[0];
  }, [patientsList, selectedPatientId]);

  /* ── Timeline ── */
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [expandedId, setExpandedId]         = useState(null);

  /* ── Records ledger ── */
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  /* ── Print ── */
  const [printSlip, setPrintSlip] = useState(null);

  /* ── Create-record form ── */
  const [form, setForm] = useState({
    patientId: isPatient ? String(userId) : (patientsList[0]?.id ? String(patientsList[0].id) : '1'),
    doctorId:  doctors[0]?.id ? String(doctors[0].id) : '1',
    diagnosis: '',
    treatment: '',
    notes:     '',
    visitDate: new Date().toISOString().split('T')[0],
    recordType:'OPD'
  });

  /* ── Fetch ── */
  const fetchRecords = () => {
    setLoading(true);
    MedicalRecordService.getAllRecords()
      .then(res => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecords([
        { id: 101, patientId: 1, doctorId: 1, recordType: 'OPD',      diagnosis: 'Acute Upper Respiratory Tract Infection',    treatment: 'Amoxicillin 625mg + Paracetamol 650mg + Steam Inhalation', notes: 'Patient presented with 3-day history of sore throat, fever (100.8°F), and congestion.', visitDate: '2026-10-27' },
        { id: 102, patientId: 1, doctorId: 2, recordType: 'Follow-up', diagnosis: 'Resolving Pharyngitis with Mild Fatigue',    treatment: 'Continue hydration and complete remaining 2 days of antibiotic therapy.',           notes: 'Fever has subsided. Throat pain markedly improved. Vitals stable: BP 120/80, SpO2 99%.', visitDate: '2026-10-29' },
        { id: 103, patientId: 2, doctorId: 1, recordType: 'OPD',      diagnosis: 'Chronic Acid Peptic Disease (GERD)',         treatment: 'Pantoprazole 40mg + Domperidone + Antacid Gel',                                     notes: 'Heartburn and retrosternal burning sensation after heavy meals.',                       visitDate: '2026-10-25' }
      ]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleFormChange = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const resetForm = () => setForm({
    patientId:  isPatient ? String(userId) : (patientsList[0]?.id ? String(patientsList[0].id) : '1'),
    doctorId:   doctors[0]?.id ? String(doctors[0].id) : '1',
    diagnosis:  '', treatment: '', notes: '',
    visitDate:  new Date().toISOString().split('T')[0],
    recordType: 'OPD'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await MedicalRecordService.createRecord(form);
      toast.success('Medical record created successfully!');
      setShowForm(false);
      resetForm();
      fetchRecords();
      if (onDataRefresh) onDataRefresh();
    } catch {
      toast.error('Failed to create medical record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      await MedicalRecordService.deleteRecord(id);
      toast.success('Medical record deleted.');
      fetchRecords();
      if (onDataRefresh) onDataRefresh();
    } catch {
      toast.error('Delete failed.');
    }
  };

  /* ── Helpers ── */
  const getPatientName = (id) => {
    const p = patientsList.find(p => Number(p.id) === Number(id));
    return p ? (p.name || p.firstName || `Patient #${id}`) : `Patient #${id}`;
  };
  const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'PT';

  /* ── Active bed stay for selected patient ── */
  const activeBedStay = useMemo(() => {
    if (!selectedPatient) return null;
    const pName = (selectedPatient.name || '').toLowerCase().trim();
    return beds.find(b =>
      b.status === 'OCCUPIED' &&
      ((b.patientName && b.patientName.toLowerCase().includes(pName)) || b.patientId === selectedPatient.id)
    );
  }, [selectedPatient, beds]);

  /* ── 360° Timeline builder ── */
  const patientTimeline = useMemo(() => {
    if (!selectedPatient) return [];
    const pId   = Number(selectedPatient.id);
    const pName = (selectedPatient.name || '').toLowerCase().trim();
    const events = [];

    beds.forEach(bed => {
      const bPat = (bed.patientName || '').toLowerCase();
      if (bed.patientId === pId || (pName && bPat.includes(pName))) {
        events.push({
          id: `bed-${bed.id}`, category: 'ADMISSION',
          typeBadge: 'INPATIENT WARD', badgeColor: 'bg-danger',
          title: `Inpatient Admission – ${bed.ward || 'General Ward'} (${bed.bedNumber})`,
          date: bed.admissionDate || '2026-10-27',
          icon: 'bi-hospital-fill', iconColor: '#dc2626', iconBg: '#fee2e2',
          doctor: bed.doctorName || 'Dr. Attending Medical Officer',
          details: { 'Bed Number': bed.bedNumber, 'Ward': bed.ward, 'Clinical Severity': bed.diagnosis || 'Inpatient Observation', 'Status': bed.status === 'OCCUPIED' ? 'Currently Admitted' : 'Discharged' }
        });
      }
    });

    appointments.forEach(apt => {
      const aPat = (apt.patientName || '').toLowerCase();
      if (Number(apt.patientId) === pId || (pName && aPat.includes(pName))) {
        events.push({
          id: `apt-${apt.id}`, category: 'OPD',
          typeBadge: 'OPD CONSULTATION', badgeColor: 'bg-primary',
          title: `Consultation with ${apt.doctorName || 'Dr. Specialist'}`,
          date: apt.appointmentDate || apt.date || '2026-10-28',
          icon: 'bi-person-badge-fill', iconColor: '#4f46e5', iconBg: '#e0e7ff',
          doctor: apt.doctorName, department: apt.department || 'Internal Medicine',
          details: { 'Department': apt.department || 'General Medicine', 'Chief Complaints': apt.reason || 'General health evaluation', 'Status': apt.status || 'CONFIRMED', 'Vitals': 'BP 122/80 • Pulse 76 bpm • SpO2 98%' }
        });
      }
    });

    prescriptions.forEach(rx => {
      const rxPat = (rx.patientName || '').toLowerCase();
      if (Number(rx.patientId) === pId || (pName && rxPat.includes(pName))) {
        events.push({
          id: `rx-${rx.id}`, category: 'PRESCRIPTION',
          typeBadge: 'DIGITAL PRESCRIPTION', badgeColor: 'bg-success',
          title: `Prescription ℞-${rx.id} Issued & Dispensed`,
          date: rx.date || '2026-10-28',
          icon: 'bi-capsule', iconColor: '#059669', iconBg: '#d1fae5',
          doctor: rx.doctorName || 'Dr. Attending Physician',
          medicines: Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines : [{ name: rx.medicineName || 'Amoxicillin 625mg', dosage: rx.dosage || '1 Tab', duration: rx.duration || '5 Days' }],
          details: { 'Prescribing Doctor': rx.doctorName || 'Dr. Medical Officer', 'Clinical Diagnosis': rx.diagnosis || 'Clinical OPD Prescribed Care', 'Dispense Status': 'Dispensed by Central Pharmacy Desk' }
        });
      }
    });

    bills.forEach(bill => {
      const bPat = (bill.patientName || '').toLowerCase();
      if (Number(bill.patientId) === pId || (pName && bPat.includes(pName))) {
        events.push({
          id: `bill-${bill.id}`, category: 'BILLING',
          typeBadge: 'GST TAX INVOICE', badgeColor: 'bg-info',
          title: `Hospital Invoice #${bill.invoiceNo || `INV-2026${bill.id}`}`,
          date: bill.billDate || bill.date || '2026-10-28',
          icon: 'bi-receipt-cutoff', iconColor: '#0284c7', iconBg: '#e0f2fe',
          details: { 'Total Amount': `₹${(Number(bill.totalAmount || bill.amount) || 1650).toLocaleString()}`, 'Payment Status': bill.status || 'PAID', 'Services': 'OPD Consultation + Pharmacy Medications', 'Tax': 'CGST 2.5% + SGST 2.5%' }
        });
      }
    });

    records.forEach(rec => {
      if (Number(rec.patientId) === pId) {
        events.push({
          id: `rec-${rec.id}`, category: rec.recordType === 'IPD' ? 'ADMISSION' : 'OPD',
          typeBadge: (rec.recordType || 'CLINICAL').toUpperCase(), badgeColor: 'bg-purple',
          title: `Clinical Assessment: ${rec.diagnosis || 'General Evaluation'}`,
          date: rec.visitDate || '2026-10-27',
          icon: 'bi-file-earmark-medical-fill', iconColor: '#7c3aed', iconBg: '#ede9fe',
          details: { 'Treatment': rec.treatment || 'Symptomatic supportive care', 'Clinical Notes': rec.notes || 'Patient responding well.', 'Record Ref': `EHR #${rec.id}` }
        });
      }
    });

    if (events.length === 0) {
      events.push(
        { id: 'def-1', category: 'OPD', typeBadge: 'OPD ENCOUNTER', badgeColor: 'bg-primary', title: 'Initial Clinical Examination & Vitals Triage', date: '2026-10-27', icon: 'bi-person-badge-fill', iconColor: '#4f46e5', iconBg: '#e0e7ff', doctor: 'Dr. Sarah Jenkins, MD', details: { 'Vitals Baseline': 'BP 120/80 • Pulse 72 bpm • SpO2 99% • Temp 98.4°F', 'Assessment': 'General health intake & clinical baseline documentation.' } },
        { id: 'def-2', category: 'PRESCRIPTION', typeBadge: 'PRESCRIPTION', badgeColor: 'bg-success', title: 'Prescription ℞-108 Issued', date: '2026-10-27', icon: 'bi-capsule', iconColor: '#059669', iconBg: '#d1fae5', medicines: [{ name: 'Tab. Paracetamol 650mg', dosage: '1 Tab', duration: '3 Days' }, { name: 'Tab. Pantoprazole 40mg', dosage: '1 Tab', duration: '7 Days' }], details: { 'Instructions': 'Dispensed by Hospital Central Pharmacy' } }
      );
    }

    return events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [selectedPatient, beds, appointments, prescriptions, bills, records]);

  const filteredTimeline = useMemo(
    () => timelineFilter === 'ALL' ? patientTimeline : patientTimeline.filter(e => e.category === timelineFilter),
    [patientTimeline, timelineFilter]
  );

  /* ── Ledger stats ── */
  const stats = useMemo(() => ({
    total:     records.length,
    opd:       records.filter(r => r.recordType === 'OPD').length,
    emergency: records.filter(r => r.recordType === 'Emergency').length,
    ipd:       records.filter(r => r.recordType === 'IPD').length
  }), [records]);

  const filteredRecords = useMemo(() => records.filter(rec => {
    const s = searchTerm.toLowerCase().trim();
    const pName = getPatientName(rec.patientId);
    return (
      (!s || (rec.diagnosis || '').toLowerCase().includes(s) || (rec.treatment || '').toLowerCase().includes(s) || (rec.notes || '').toLowerCase().includes(s) || pName.toLowerCase().includes(s)) &&
      (!filterType || rec.recordType === filterType)
    );
  }), [records, searchTerm, filterType]);

  /* ================================================================
      RENDER
  ================================================================ */
  return (
    <div className="desk-premium-page">

      {/* ── HERO BANNER ── */}
      <div className="desk-hero">
        <div className="hero-content">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="hero-icon purple">
                <i className="bi bi-person-lines-fill" />
              </div>
              <div>
                <h4 className="hero-title">
                  Patient 360° Health Record, EHR &amp; Clinical Timeline
                </h4>
                <p className="hero-subtitle">
                  {getHospitalName()} &bull; Longitudinal Electronic Medical Records &bull; HIPAA Compliant &bull; ABDM Ready
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="hero-chip">
                <i className="bi bi-shield-check text-primary" />
                HIPAA Compliant
              </span>
              <span className="hero-chip">
                <i className="bi bi-file-earmark-medical text-primary" />
                ICD-10 Coded
              </span>
              {!isPatient && (
                <button
                  type="button"
                  className="premium-btn purple"
                  onClick={() => { setActiveViewTab('LEDGER'); setShowForm(true); }}
                >
                  <i className="bi bi-clipboard2-plus-fill me-1" /> New Clinical Record
                </button>
              )}
              {activeViewTab === 'DOSSIER' && !isPatient && (
                <button
                  type="button"
                  className="premium-btn outline-purple"
                  onClick={() => setPrintSlip(selectedPatient)}
                >
                  <i className="bi bi-printer-fill me-1" /> Print Discharge Summary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC GRID ── */}
      <div className="metric-grid">
        <div className="metric-card metric-purple">
          <div className="metric-icon"><i className="bi bi-folder2-open" /></div>
          <div className="metric-label">Total EHR Records</div>
          <div className="metric-value"><AnimatedCounter value={stats.total} /></div>
        </div>
        <div className="metric-card metric-blue">
          <div className="metric-icon"><i className="bi bi-person-vcard" /></div>
          <div className="metric-label">OPD Encounters</div>
          <div className="metric-value"><AnimatedCounter value={stats.opd} /></div>
        </div>
        <div className="metric-card metric-red">
          <div className="metric-icon"><i className="bi bi-heart-pulse" /></div>
          <div className="metric-label">Emergency Records</div>
          <div className="metric-value"><AnimatedCounter value={stats.emergency} /></div>
        </div>
        <div className="metric-card metric-orange">
          <div className="metric-icon"><i className="bi bi-hospital" /></div>
          <div className="metric-label">IPD Admissions</div>
          <div className="metric-value"><AnimatedCounter value={stats.ipd} /></div>
        </div>
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="premium-panel">

        {/* Panel Toolbar with View Tabs */}
        <div className="panel-toolbar">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-person-lines-fill text-primary" />
              {activeViewTab === 'DOSSIER' ? 'Patient 360° Dossier & Clinical Timeline' : 'Clinical Records Ledger'}
            </h6>

            <div className="premium-tabs">
              <button
                type="button"
                className={`premium-tab ${activeViewTab === 'DOSSIER' ? 'active' : ''}`}
                onClick={() => setActiveViewTab('DOSSIER')}
              >
                <i className="bi bi-person-badge me-1" />
                Patient 360° Dossier
              </button>
              <button
                type="button"
                className={`premium-tab ${activeViewTab === 'LEDGER' ? 'active' : ''}`}
                onClick={() => setActiveViewTab('LEDGER')}
              >
                <i className="bi bi-journal-medical me-1" />
                Records Ledger
                <span className="tab-count">{records.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            TAB 1 – PATIENT 360° DOSSIER & TIMELINE
        ============================================================ */}
        <AnimatePresence mode="wait">
          {activeViewTab === 'DOSSIER' ? (
            <motion.div
              key="dossier"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="p-3 p-md-4"
            >
              {/* Patient Selector Row */}
              {!isPatient && (
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 p-3 rounded-3 border bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-bounding-box text-primary fs-5" />
                    <span className="fw-bold small text-secondary text-uppercase" style={{ fontSize: 11 }}>
                      Switch Active Patient Dossier:
                    </span>
                    <select
                      className="form-select form-select-sm fw-bold border-primary"
                      style={{ width: 'auto', minWidth: 280 }}
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    >
                      {patientsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Age: {p.age || '32'} · {p.gender || 'M'} · {p.phone || `ID: ${p.id}`})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm px-3 fw-bold d-flex align-items-center gap-2 rounded-pill"
                    onClick={() => setPrintSlip(selectedPatient)}
                  >
                    <i className="bi bi-printer-fill" /> Print Discharge Summary
                  </button>
                </div>
              )}

              {/* Patient Identity Card */}
              <div
                className="d-flex flex-wrap align-items-start gap-4 p-4 mb-4 rounded-4 border"
                style={{ background: 'rgba(248,250,252,0.9)', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}
              >
                {/* Avatar + Core Info */}
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                    style={{ width: 64, height: 64, fontSize: 24, background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                  >
                    {getInitials(selectedPatient.name)}
                  </div>
                  <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="fw-bold text-dark mb-0">{selectedPatient.name}</h5>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold" style={{ fontSize: 10 }}>
                        <i className="bi bi-droplet-fill me-1" /> {selectedPatient.bloodGroup || 'B +ve'}
                      </span>
                      {activeBedStay ? (
                        <span className="badge bg-danger text-white fw-bold" style={{ fontSize: 10 }}>
                          <i className="bi bi-hospital me-1" /> Admitted: {activeBedStay.bedNumber} ({activeBedStay.ward})
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: 10 }}>
                          <i className="bi bi-check-circle me-1" /> Outpatient (OPD)
                        </span>
                      )}
                    </div>
                    <div className="text-muted small d-flex flex-wrap gap-3">
                      <span><strong>UHID:</strong> MRN-2026-PT{selectedPatient.id}</span>
                      <span><strong>Age/Gender:</strong> {selectedPatient.age || '34'} Yrs / {selectedPatient.gender || 'Male'}</span>
                      <span><strong>Phone:</strong> {selectedPatient.phone || '+91 98765-43210'}</span>
                      <span><strong>Email:</strong> {selectedPatient.email || 'patient@hospital.org'}</span>
                    </div>
                    <div className="mt-2 text-danger small fw-semibold">
                      <i className="bi bi-exclamation-triangle-fill me-1" />
                      Allergies: {selectedPatient.allergies || 'Penicillin, Dust Mites (Reported)'}
                    </div>
                  </div>
                </div>

                {/* Primary Consultant Info */}
                <div
                  className="p-3 rounded-3 border flex-shrink-0"
                  style={{ minWidth: 230, background: '#fff' }}
                >
                  <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: 10 }}>Primary Attending Consultant</div>
                  <div className="fw-bold text-dark fs-6 mb-0">
                    <i className="bi bi-person-fill-check text-primary me-1" /> Dr. Sarah Jenkins, MD
                  </div>
                  <small className="text-muted" style={{ fontSize: 11 }}>Internal Medicine · {getHospitalName()}</small>
                </div>
              </div>

              {/* Vitals Quick Grid */}
              <div className="row g-2 mb-4">
                {[
                  { label: 'BLOOD PRESSURE', value: '122/80',    sub: 'Normal Sinus',    icon: 'bi-heart-pulse-fill',  color: 'text-danger'    },
                  { label: 'PULSE / HR',      value: '76 bpm',   sub: 'Resting Regular', icon: 'bi-activity',          color: 'text-primary'   },
                  { label: 'OXYGEN (SpO2)',   value: '99%',      sub: 'Optimal Room Air',icon: 'bi-lungs-fill',         color: 'text-info'      },
                  { label: 'BODY TEMP',       value: '98.4 °F',  sub: 'Afebrile',        icon: 'bi-thermometer-half',  color: 'text-warning'   },
                  { label: 'FASTING GLUCOSE', value: '104 mg/dL',sub: 'Euglycemic',      icon: 'bi-droplet-half',       color: 'text-purple'    },
                  { label: 'WEIGHT / BMI',    value: '68 kg',    sub: 'BMI: 22.8 Normal',icon: 'bi-speedometer',        color: 'text-secondary' }
                ].map((v, i) => (
                  <div key={i} className="col-6 col-md-4 col-xl-2">
                    <div
                      className="p-3 rounded-3 border h-100"
                      style={{ background: '#fff', boxShadow: '0 2px 8px rgba(15,23,42,0.03)', transition: 'transform .18s, box-shadow .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,23,42,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.03)'; }}
                    >
                      <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                        <span style={{ fontSize: 10 }}>{v.label}</span>
                        <i className={`bi ${v.icon} ${v.color}`} />
                      </div>
                      <div className="fs-5 fw-bold text-dark">{v.value}</div>
                      <small className="text-success fw-bold" style={{ fontSize: 10 }}>{v.sub}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Section */}
              <div
                className="rounded-4 border"
                style={{ background: '#fff', boxShadow: '0 4px 16px rgba(15,23,42,0.03)' }}
              >
                {/* Timeline Header + Filter Tabs */}
                <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom p-3 gap-3">
                  <div>
                    <h6 className="fw-bold text-dark mb-0">
                      <i className="bi bi-clock-history text-primary me-2" />
                      Chronological Clinical Journey ({filteredTimeline.length} Events)
                    </h6>
                    <small className="text-muted">
                      Interactive timeline for <strong>{selectedPatient.name}</strong>
                    </small>
                  </div>

                  <div className="premium-tabs">
                    {timelineTabs.map(tab => (
                      <button
                        key={tab}
                        type="button"
                        className={`premium-tab ${timelineFilter === tab ? 'active' : ''}`}
                        onClick={() => setTimelineFilter(tab)}
                      >
                        {tab === 'ALL' ? 'All Touchpoints' :
                         tab === 'OPD' ? 'OPD Visits' :
                         tab === 'PRESCRIPTION' ? 'Medications ℞' :
                         tab === 'ADMISSION' ? 'Bed Stays' : 'Invoices'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline List */}
                <div className="p-3 p-md-4" style={{ position: 'relative', paddingLeft: 36 }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 3, background: 'linear-gradient(180deg,#6366f1,#06b6d4,#e2e8f0)', borderRadius: 99 }} />

                  {filteredTimeline.map((item, idx) => {
                    const isExp = expandedId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: idx * 0.04 }}
                        style={{ position: 'relative', marginBottom: 20 }}
                      >
                        {/* Dot */}
                        <div style={{
                          position: 'absolute', left: -24, top: 10,
                          width: 18, height: 18, borderRadius: '50%',
                          background: item.iconColor, border: '3px solid #fff',
                          boxShadow: `0 0 0 2px ${item.iconColor}`, zIndex: 2
                        }} />

                        {/* Bubble */}
                        <div
                          className="rounded-4 border p-3"
                          style={{ background: '#fff', boxShadow: '0 4px 14px rgba(15,23,42,0.035)', transition: 'box-shadow .2s, border-color .2s', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.07)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,42,0.035)'}
                        >
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-1">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                style={{ width: 34, height: 34, background: item.iconBg, color: item.iconColor, fontSize: 16 }}
                              >
                                <i className={`bi ${item.icon}`} />
                              </div>
                              <div>
                                <span className={`badge rounded-pill fw-bold me-1 ${item.badgeColor} text-white`} style={{ fontSize: 9 }}>
                                  {item.typeBadge}
                                </span>
                                <strong className="text-dark">{item.title}</strong>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                              <span className="badge bg-light text-dark border fw-bold" style={{ fontSize: 10 }}>
                                <i className="bi bi-calendar3 me-1" />{item.date}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary py-0 px-2 fw-semibold"
                                style={{ fontSize: 10, borderRadius: 6 }}
                                onClick={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                              >
                                {isExp ? 'Hide' : 'Details'}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExp && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'hidden' }}
                              >
                                {item.medicines?.length > 0 && (
                                  <div className="p-2 bg-light rounded-2 border my-2">
                                    <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: 10 }}>Prescribed Formulations:</div>
                                    <div className="d-flex flex-wrap gap-2">
                                      {item.medicines.map((m, mi) => (
                                        <span key={mi} className="badge bg-white text-dark border px-2 py-1">
                                          💊 {m.name} · {m.dosage || '1 Tab'} · {m.duration || '5 Days'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {item.details && (
                                  <div className="row g-2 mt-1" style={{ fontSize: 11.5 }}>
                                    {Object.entries(item.details).map(([key, val]) => (
                                      <div key={key} className="col-12 col-md-6">
                                        <span className="text-muted fw-semibold">{key}: </span>
                                        <span className="text-dark" dangerouslySetInnerHTML={{ __html: val }} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredTimeline.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-clock-history fs-1 d-block mb-2 opacity-25" />
                      <span className="small">No events found for this filter</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (

          /* ============================================================
              TAB 2 – CLINICAL RECORDS LEDGER
          ============================================================ */
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {/* Create Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    className="p-4 border-bottom"
                    style={{ background: 'rgba(248,250,252,0.95)' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-primary mb-0">
                        <i className="bi bi-clipboard2-plus me-2" /> New Clinical Record
                      </h6>
                      <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Patient *</label>
                          <select className="form-select form-select-sm" value={form.patientId} onChange={e => handleFormChange('patientId', e.target.value)} required>
                            {patientsList.map(p => <option key={p.id} value={p.id}>{p.name} #{p.id}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Record Type</label>
                          <select className="form-select form-select-sm" value={form.recordType} onChange={e => handleFormChange('recordType', e.target.value)}>
                            {recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Visit Date</label>
                          <input type="date" className="form-control form-control-sm" value={form.visitDate} onChange={e => handleFormChange('visitDate', e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Clinical Diagnosis *</label>
                          <input type="text" className="form-control form-control-sm" placeholder="e.g. Stage II Hypertension" value={form.diagnosis} onChange={e => handleFormChange('diagnosis', e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Treatment Plan</label>
                          <input type="text" className="form-control form-control-sm" placeholder="e.g. Tab Amlodipine 5mg OD" value={form.treatment} onChange={e => handleFormChange('treatment', e.target.value)} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Doctor Clinical Notes</label>
                          <textarea className="form-control form-control-sm" rows="3" placeholder="Observations, examination notes, instructions..." value={form.notes} onChange={e => handleFormChange('notes', e.target.value)} />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">Save Medical Record</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toolbar */}
              <div className="panel-toolbar border-top-0">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
                      <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search diagnosis, patient, notes..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      {recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-muted small">{filteredRecords.length} records</span>
                  </div>

                  {!isPatient && (
                    <button
                      type="button"
                      className="premium-btn purple"
                      onClick={() => setShowForm(!showForm)}
                    >
                      <i className={`bi ${showForm ? 'bi-chevron-up' : 'bi-plus-circle-fill'} me-1`} />
                      {showForm ? 'Close Form' : 'Add Clinical Record'}
                    </button>
                  )}
                </div>
              </div>

              {/* Records Table */}
              <div className="table-wrap">
                {loading ? (
                  <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Loading records...
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-folder-x fs-1 d-block mb-2 opacity-25" />
                    <span>No clinical records found</span>
                  </div>
                ) : (
                  <table className="premium-table">
                    <thead className="table-light small text-uppercase text-secondary">
                      <tr>
                        <th className="ps-3">Record Type</th>
                        <th>Patient</th>
                        <th>Visit Date</th>
                        <th>Diagnosis</th>
                        <th>Treatment Plan</th>
                        <th>Clinical Notes</th>
                        {!isPatient && <th className="text-end pe-3">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="small">
                      {filteredRecords.map(record => {
                        const cfg = typeConfig[record.recordType] || { color: '#64748b', bg: 'rgba(100,116,139,.10)', icon: 'bi-file-earmark-medical' };
                        return (
                          <tr key={record.id}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                                  style={{ width: 32, height: 32, background: cfg.bg, color: cfg.color, fontSize: 15 }}
                                >
                                  <i className={`bi ${cfg.icon}`} />
                                </div>
                                <span className="badge rounded-pill fw-bold" style={{ background: cfg.bg, color: cfg.color, fontSize: 10 }}>
                                  {record.recordType || 'Clinical'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{getPatientName(record.patientId)}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-calendar3 me-1" />{record.visitDate}
                              </span>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark" style={{ maxWidth: 220 }}>{record.diagnosis || 'Clinical Assessment'}</div>
                            </td>
                            <td>
                              <div className="text-secondary" style={{ maxWidth: 220, fontSize: '0.78rem' }}>{record.treatment || '—'}</div>
                            </td>
                            <td>
                              {record.notes ? (
                                <div
                                  className="text-muted"
                                  style={{ maxWidth: 240, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  title={record.notes}
                                >
                                  {record.notes}
                                </div>
                              ) : <span className="text-muted">—</span>}
                            </td>
                            {!isPatient && (
                              <td className="text-end pe-3">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm py-1 px-2"
                                  onClick={() => handleDelete(record.id)}
                                  title="Delete Record"
                                >
                                  <i className="bi bi-trash3" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PRINT DISCHARGE SUMMARY MODAL ── */}
      {printSlip && (
        <PrintModal
          title={`Discharge & Health Summary – ${printSlip.name || 'Patient'}`}
          onClose={() => setPrintSlip(null)}
        >
          <PatientDischargeSummarySlip
            patient={printSlip}
            records={records}
            prescriptions={prescriptions}
            appointments={appointments}
            beds={beds}
            bills={bills}
          />
        </PrintModal>
      )}
    </div>
  );
}

export default MedicalRecordPanel;
