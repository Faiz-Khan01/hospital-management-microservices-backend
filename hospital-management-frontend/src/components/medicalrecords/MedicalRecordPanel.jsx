import React, { useEffect, useMemo, useState } from 'react';
import MedicalRecordService from '../../services/MedicalRecordService';
import AuthService from '../../services/AuthService';
import PrintModal from '../common/PrintModal';
import PatientDischargeSummarySlip from './PatientDischargeSummarySlip';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'motion/react';

const FALLBACK_PATIENTS = [
  { id: 1, name: 'John Doe', age: 34, gender: 'Male', bloodGroup: 'B +ve', phone: '+91 98765-43210', email: 'john.doe@gmail.com', address: 'B-12 Vasant Vihar, New Delhi', allergies: 'Penicillin, Dust Mites' },
  { id: 2, name: 'Priya Sharma', age: 28, gender: 'Female', bloodGroup: 'O +ve', phone: '+91 98112-33445', email: 'priya.sharma@yahoo.com', address: '44 Park Street, Kolkata', allergies: 'Sulfa Drugs' },
  { id: 3, name: 'Robert Langdon', age: 45, gender: 'Male', bloodGroup: 'A +ve', phone: '+91 99221-88990', email: 'robert.l@outlook.com', address: 'Tower 4 Cyber City, Gurugram', allergies: 'None known' },
  { id: 4, name: 'Ananya Verma', age: 22, gender: 'Female', bloodGroup: 'AB +ve', phone: '+91 98101-77665', email: 'ananya.v@gmail.com', address: 'Sector 62, Noida', allergies: 'NSAIDs' }
];

function MedicalRecordPanel({
  role = 'ADMIN',
  patients = [],
  doctors = [],
  appointments = [],
  prescriptions = [],
  bills = [],
  beds = [],
  searchQuery = '',
  darkMode = false,
  onDataRefresh
}) {
  const isPatient = role === 'PATIENT';
  const userId = AuthService.getUserId?.() || 1;
  const username = AuthService.getUsername?.() || '';

  const patientsList = useMemo(() => {
    return Array.isArray(patients) && patients.length > 0 ? patients : FALLBACK_PATIENTS;
  }, [patients]);

  // Main View Tab: 'DOSSIER' (Patient 360 & Timeline) vs 'LEDGER' (Standard Table)
  const [activeViewTab, setActiveViewTab] = useState('DOSSIER');

  // Selected Patient for 360° Dossier
  const [selectedPatientId, setSelectedPatientId] = useState(
    isPatient ? (patientsList.find(p => p.id === userId)?.id || patientsList[0]?.id || 1) : (patientsList[0]?.id || 1)
  );

  const selectedPatient = useMemo(() => {
    const found = patientsList.find(p => Number(p.id) === Number(selectedPatientId));
    return found || patientsList[0] || FALLBACK_PATIENTS[0];
  }, [patientsList, selectedPatientId]);

  // Timeline Filter: 'ALL', 'OPD', 'PRESCRIPTION', 'ADMISSION', 'BILLING'
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  // Print Discharge Modal State
  const [printDischargeSlip, setPrintDischargeSlip] = useState(null);

  // General Records State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const [form, setForm] = useState({
    patientId: isPatient ? String(userId) : (patientsList[0]?.id ? String(patientsList[0].id) : '1'),
    doctorId: doctors[0]?.id ? String(doctors[0].id) : '1',
    diagnosis: '',
    treatment: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0],
    recordType: 'OPD'
  });

  const recordTypes = ['OPD', 'IPD', 'Emergency', 'Surgery', 'Follow-up', 'Discharge'];

  const typeConfig = {
    OPD: { color: '#6366f1', bg: 'rgba(99,102,241,.10)', icon: 'bi-person-vcard' },
    IPD: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', icon: 'bi-hospital' },
    Emergency: { color: '#ef4444', bg: 'rgba(239,68,68,.10)', icon: 'bi-heart-pulse' },
    Surgery: { color: '#8b5cf6', bg: 'rgba(139,92,246,.10)', icon: 'bi-scissors' },
    'Follow-up': { color: '#06b6d4', bg: 'rgba(6,182,212,.10)', icon: 'bi-arrow-repeat' },
    Discharge: { color: '#10b981', bg: 'rgba(16,185,129,.10)', icon: 'bi-box-arrow-right' }
  };

  const fetchRecords = () => {
    setLoading(true);
    MedicalRecordService.getAllRecords()
      .then(res => {
        setRecords(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setRecords([
          {
            id: 101,
            patientId: 1,
            doctorId: 1,
            recordType: 'OPD',
            diagnosis: 'Acute Upper Respiratory Tract Infection',
            treatment: 'Amoxicillin 625mg + Paracetamol 650mg + Steam Inhalation',
            notes: 'Patient presented with 3-day history of sore throat, fever (100.8°F), and congestion. Throat examination reveals bilateral tonsillar erythema.',
            visitDate: '2026-10-27'
          },
          {
            id: 102,
            patientId: 1,
            doctorId: 2,
            recordType: 'Follow-up',
            diagnosis: 'Resolving Pharyngitis with Mild Fatigue',
            treatment: 'Continue hydration and complete remaining 2 days of antibiotic therapy.',
            notes: 'Fever has subsided. Throat pain markedly improved. Vitals stable: BP 120/80, SpO2 99%.',
            visitDate: '2026-10-29'
          },
          {
            id: 103,
            patientId: 2,
            doctorId: 1,
            recordType: 'OPD',
            diagnosis: 'Chronic Acid Peptic Disease (GERD)',
            treatment: 'Pantoprazole 40mg + Domperidone + Antacid Gel',
            notes: 'Heartburn and retrosternal burning sensation after heavy meals.',
            visitDate: '2026-10-25'
          }
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      patientId: isPatient ? String(userId) : (patientsList[0]?.id ? String(patientsList[0].id) : '1'),
      doctorId: doctors[0]?.id ? String(doctors[0].id) : '1',
      diagnosis: '',
      treatment: '',
      notes: '',
      visitDate: new Date().toISOString().split('T')[0],
      recordType: 'OPD'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await MedicalRecordService.createRecord(form);
      toast.success('Medical record created successfully!');
      setShowForm(false);
      resetForm();
      fetchRecords();
      if (onDataRefresh) onDataRefresh();
    } catch (error) {
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
    } catch (error) {
      toast.error('Delete failed.');
    }
  };

  const getPatientName = (id) => {
    const patient = patientsList.find(p => Number(p.id) === Number(id));
    return patient ? (patient.name || patient.firstName || `Patient #${id}`) : `Patient #${id}`;
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('') || 'PT';
  };

  // Compile Comprehensive Patient 360° Timeline
  const patientTimeline = useMemo(() => {
    if (!selectedPatient) return [];
    const pId = Number(selectedPatient.id);
    const pName = (selectedPatient.name || '').toLowerCase().trim();

    const events = [];

    // 1. Inpatient Bed Allocation
    beds.forEach(bed => {
      const bPatient = (bed.patientName || '').toLowerCase().trim();
      if (bed.patientId === pId || (pName && bPatient.includes(pName))) {
        events.push({
          id: `bed-${bed.id}`,
          category: 'ADMISSION',
          typeBadge: 'INPATIENT WARD',
          badgeColor: 'bg-danger text-white',
          title: `Inpatient Admission - ${bed.ward || 'General Ward'} (${bed.bedNumber})`,
          date: bed.admissionDate || '2026-10-27',
          icon: 'bi-hospital-fill',
          iconColor: '#dc2626',
          iconBg: '#fee2e2',
          doctor: bed.doctorName || 'Dr. Attending Medical Officer',
          details: {
            'Bed Number': bed.bedNumber,
            'Ward Section': bed.ward,
            'Clinical Severity': bed.diagnosis || 'Inpatient Observation & Care',
            'Tariff Rate': bed.type === 'ICU' ? '₹6,000 / day' : '₹1,500 / day',
            'Status': bed.status === 'OCCUPIED' ? 'Currently Admitted' : 'Discharged'
          }
        });
      }
    });

    // 2. Doctor OPD Appointments
    appointments.forEach(apt => {
      const aPatient = (apt.patientName || '').toLowerCase().trim();
      if (Number(apt.patientId) === pId || (pName && aPatient.includes(pName))) {
        events.push({
          id: `apt-${apt.id}`,
          category: 'OPD',
          typeBadge: 'OPD CONSULTATION',
          badgeColor: 'bg-primary text-white',
          title: `Consultation with ${apt.doctorName || 'Dr. Specialist'}`,
          date: apt.appointmentDate || apt.date || '2026-10-28',
          icon: 'bi-person-badge-fill',
          iconColor: '#4f46e5',
          iconBg: '#e0e7ff',
          doctor: apt.doctorName,
          department: apt.department || 'Internal Medicine',
          details: {
            'Department': apt.department || 'General Medicine',
            'Chief Complaints': apt.reason || 'General health evaluation and fever checkup',
            'Consultation Status': apt.status || 'CONFIRMED',
            'Vitals Recorded': 'BP: 122/80 mmHg &bull; Pulse: 76 bpm &bull; SpO2: 98% &bull; Temp: 98.4°F'
          }
        });
      }
    });

    // 3. Digital Prescriptions & Pharmacy Dispense
    prescriptions.forEach(rx => {
      const rxPatient = (rx.patientName || '').toLowerCase().trim();
      if (Number(rx.patientId) === pId || (pName && rxPatient.includes(pName))) {
        events.push({
          id: `rx-${rx.id}`,
          category: 'PRESCRIPTION',
          typeBadge: 'DIGITAL PRESCRIPTION',
          badgeColor: 'bg-success text-white',
          title: `Prescription ℞-${rx.id} Issued & Dispensed`,
          date: rx.date || '2026-10-28',
          icon: 'bi-capsule',
          iconColor: '#059669',
          iconBg: '#d1fae5',
          doctor: rx.doctorName || 'Dr. Attending Physician',
          medicines: Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines : [
            { name: rx.medicineName || 'Amoxicillin 625mg', dosage: rx.dosage || '1 Tab', duration: rx.duration || '5 Days' }
          ],
          details: {
            'Prescribing Doctor': rx.doctorName || 'Dr. Medical Officer',
            'Clinical Diagnosis': rx.diagnosis || 'Clinical OPD Prescribed Care',
            'Dispense Status': 'Dispensed by Central Pharmacy Desk',
            'Duration': '5 to 7 Days'
          }
        });
      }
    });

    // 4. Billing & GST Invoices
    bills.forEach(bill => {
      const bPatient = (bill.patientName || '').toLowerCase().trim();
      if (Number(bill.patientId) === pId || (pName && bPatient.includes(pName))) {
        events.push({
          id: `bill-${bill.id}`,
          category: 'BILLING',
          typeBadge: 'GST TAX INVOICE',
          badgeColor: 'bg-info text-dark',
          title: `Hospital Invoice #${bill.invoiceNo || `INV-2026${bill.id}`}`,
          date: bill.billDate || bill.date || '2026-10-28',
          icon: 'bi-receipt-cutoff',
          iconColor: '#0284c7',
          iconBg: '#e0f2fe',
          details: {
            'Total Amount': `₹${(Number(bill.totalAmount || bill.amount) || 1650).toLocaleString()}`,
            'Payment Status': bill.status || 'PAID',
            'Services Billed': 'OPD Consultation (SAC 999312) + Pharmacy Medications (HSN 3004)',
            'Tax Breakdown': 'CGST 2.5% + SGST 2.5%'
          }
        });
      }
    });

    // 5. Existing Medical Record Encounters
    records.forEach(rec => {
      if (Number(rec.patientId) === pId) {
        events.push({
          id: `rec-${rec.id}`,
          category: rec.recordType === 'IPD' ? 'ADMISSION' : 'OPD',
          typeBadge: (rec.recordType || 'CLINICAL').toUpperCase(),
          badgeColor: 'bg-purple text-white',
          title: `Clinical Assessment: ${rec.diagnosis || 'General Evaluation'}`,
          date: rec.visitDate || '2026-10-27',
          icon: 'bi-file-earmark-medical-fill',
          iconColor: '#7c3aed',
          iconBg: '#ede9fe',
          details: {
            'Treatment Administered': rec.treatment || 'Symptomatic supportive care',
            'Clinical Notes': rec.notes || 'Patient oriented and responding well to medical plan.',
            'Record Reference': `EHR Record #${rec.id}`
          }
        });
      }
    });

    // Fallback baseline milestones if patient has sparse data
    if (events.length === 0) {
      events.push(
        {
          id: 'def-1',
          category: 'OPD',
          typeBadge: 'OPD ENCOUNTER',
          badgeColor: 'bg-primary text-white',
          title: 'Initial Clinical Examination & Vitals Triage',
          date: '2026-10-27',
          icon: 'bi-person-badge-fill',
          iconColor: '#4f46e5',
          iconBg: '#e0e7ff',
          doctor: 'Dr. Sarah Jenkins, MD',
          details: {
            'Vitals Baseline': 'BP: 120/80 mmHg &bull; Pulse: 72 bpm &bull; SpO2: 99% &bull; Temp: 98.4°F',
            'Clinical Assessment': 'General health intake & clinical baseline documentation.'
          }
        },
        {
          id: 'def-2',
          category: 'PRESCRIPTION',
          typeBadge: 'PRESCRIPTION',
          badgeColor: 'bg-success text-white',
          title: 'Prescription ℞-108 Issued',
          date: '2026-10-27',
          icon: 'bi-capsule',
          iconColor: '#059669',
          iconBg: '#d1fae5',
          medicines: [
            { name: 'Tab. Paracetamol 650mg', dosage: '1 Tab', duration: '3 Days' },
            { name: 'Tab. Pantoprazole 40mg', dosage: '1 Tab', duration: '7 Days' }
          ],
          details: {
            'Instructions': 'Dispensed by Hospital Central Pharmacy'
          }
        }
      );
    }

    // Sort by date descending
    return events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [selectedPatient, beds, appointments, prescriptions, bills, records]);

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    if (timelineFilter === 'ALL') return patientTimeline;
    return patientTimeline.filter(e => e.category === timelineFilter);
  }, [patientTimeline, timelineFilter]);

  // Active Bed status for selected patient
  const activeBedStay = useMemo(() => {
    if (!selectedPatient) return null;
    const pName = (selectedPatient.name || '').toLowerCase().trim();
    return beds.find(b =>
      b.status === 'OCCUPIED' &&
      ((b.patientName && b.patientName.toLowerCase().includes(pName)) || b.patientId === selectedPatient.id)
    );
  }, [selectedPatient, beds]);

  // Filtered records for general ledger tab
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const search = searchTerm.toLowerCase().trim();
      const patientName = getPatientName(record.patientId);
      const matchSearch =
        !search ||
        (record.diagnosis || '').toLowerCase().includes(search) ||
        (record.treatment || '').toLowerCase().includes(search) ||
        (record.notes || '').toLowerCase().includes(search) ||
        patientName.toLowerCase().includes(search);
      const matchType = !filterType || record.recordType === filterType;
      return matchSearch && matchType;
    });
  }, [records, searchTerm, filterType]);

  const stats = useMemo(() => {
    return {
      total: records.length,
      opd: records.filter(r => r.recordType === 'OPD').length,
      emergency: records.filter(r => r.recordType === 'Emergency').length,
      ipd: records.filter(r => r.recordType === 'IPD').length
    };
  }, [records]);

  return (
    <div className="medical-record-page">
      <style>{`
        .medical-record-page {
          min-height: 100%;
          padding-bottom: 40px;
          color: #172033;
        }

        .ehr-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 24px;
          padding: 24px 28px;
          margin-bottom: 22px;
          background:
            radial-gradient(circle at 90% 15%, rgba(129, 140, 248, 0.18), transparent 30%),
            radial-gradient(circle at 10% 80%, rgba(45, 212, 191, 0.12), transparent 30%),
            linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.05);
        }

        .ehr-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          text-decoration: none;
        }

        .ehr-nav-tab:hover {
          background: #4f46e5 !important;
          color: #ffffff !important;
          border-color: #4f46e5 !important;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.28);
          transform: translateY(-1px);
        }

        .ehr-nav-tab.active-dossier {
          background: linear-gradient(135deg, #4f46e5, #06b6d4) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }

        .ehr-nav-tab.active-dossier:hover {
          background: #4338ca !important;
          color: #ffffff !important;
        }

        .ehr-nav-tab.active-ledger {
          background: linear-gradient(135deg, #0284c7, #0d9488) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28);
        }

        .ehr-nav-tab.active-ledger:hover {
          background: #0369a1 !important;
          color: #ffffff !important;
        }

        .dossier-card {
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
        }

        .vital-badge-box {
          border-radius: 16px;
          padding: 14px 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .vital-badge-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        /* TIMELINE STYLES */
        .timeline-container {
          position: relative;
          padding-left: 28px;
        }

        .timeline-container::before {
          content: "";
          position: absolute;
          left: 8px;
          top: 15px;
          bottom: 15px;
          width: 3px;
          background: linear-gradient(180deg, #6366f1 0%, #06b6d4 50%, #e2e8f0 100%);
          border-radius: 99px;
        }

        .timeline-node {
          position: relative;
          margin-bottom: 24px;
        }

        .timeline-dot {
          position: absolute;
          left: -28px;
          top: 8px;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 0 2px #6366f1;
          background: #6366f1;
          z-index: 2;
        }

        .timeline-bubble {
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 18px 22px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
          transition: all 0.2s ease;
        }

        .timeline-bubble:hover {
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
          border-color: #cbd5e1;
        }
      `}</style>

      {/* =====================================================
          HERO & VIEW SELECTOR TABS
      ====================================================== */}
      <div className="ehr-hero">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-4 text-white shadow-sm"
              style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', fontSize: 24 }}
            >
              <i className="bi bi-person-lines-fill"></i>
            </div>
            <div>
              <div className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-primary bg-opacity-10 text-primary fw-bold text-uppercase mb-1" style={{ fontSize: 10 }}>
                <i className="bi bi-shield-check"></i>
                Universal Clinical Dossier & EMR
              </div>
              <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                Patient 360° Health Record & Timeline
              </h3>
              <p className="text-muted small mb-0">
                Continuous clinical journey, past OPD consultations, digital Rx, vitals trends, and official discharge summaries.
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className={`ehr-nav-tab ${activeViewTab === 'DOSSIER' ? 'active-dossier' : ''}`}
              onClick={() => setActiveViewTab('DOSSIER')}
            >
              <i className="bi bi-clock-history"></i>
              Patient 360° Dossier & Timeline
            </button>

            <button
              type="button"
              className={`ehr-nav-tab ${activeViewTab === 'LEDGER' ? 'active-ledger' : ''}`}
              onClick={() => setActiveViewTab('LEDGER')}
            >
              <i className="bi bi-table"></i>
              Clinical Records Ledger ({records.length})
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          TAB 1: PATIENT 360° DOSSIER & TIMELINE
      ====================================================== */}
      {activeViewTab === 'DOSSIER' ? (
        <div className="dossier-view">
          {/* PATIENT SELECTOR & PROFILE HEADER CARD */}
          <div className="dossier-card p-4 mb-4">
            <div className="row g-4 align-items-center">
              {/* Patient Selector Dropdown */}
              {!isPatient && (
                <div className="col-12 border-bottom pb-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: 11 }}>
                        <i className="bi bi-person-bounding-box me-1"></i> Switch Active Patient Dossier:
                      </span>
                      <select
                        className="form-select form-select-sm fw-bold border-primary"
                        style={{ width: 'auto', minWidth: 260 }}
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                      >
                        {patientsList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Age: {p.age || '32'} &bull; {p.gender || 'M'} &bull; {p.phone || `ID: ${p.id}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm rounded-pill"
                        onClick={() => setPrintDischargeSlip(selectedPatient)}
                      >
                        <i className="bi bi-printer-fill"></i>
                        Print Discharge & Clinical Summary
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Core Dossier Info */}
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                    style={{ width: 62, height: 62, fontSize: 24, background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                  >
                    {getInitials(selectedPatient.name)}
                  </div>
                  <div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <h4 className="fw-bold text-dark mb-0">{selectedPatient.name}</h4>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold" style={{ fontSize: 11 }}>
                        <i className="bi bi-droplet-fill me-1"></i> {selectedPatient.bloodGroup || 'B +ve'}
                      </span>
                      {activeBedStay ? (
                        <span className="badge bg-danger text-white fw-bold" style={{ fontSize: 11 }}>
                          <i className="bi bi-hospital me-1"></i> Admitted: {activeBedStay.bedNumber} ({activeBedStay.ward})
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: 11 }}>
                          <i className="bi bi-check-circle me-1"></i> Outpatient (OPD)
                        </span>
                      )}
                    </div>

                    <div className="text-muted small mt-1 d-flex flex-wrap align-items-center gap-3">
                      <span><strong>UHID:</strong> MRN-2026-PT{selectedPatient.id}</span>
                      <span><strong>Age/Gender:</strong> {selectedPatient.age || '34'} Yrs / {selectedPatient.gender || 'Male'}</span>
                      <span><strong>Phone:</strong> {selectedPatient.phone || '+91 98765-43210'}</span>
                      <span><strong>Email:</strong> {selectedPatient.email || 'patient@hospital.org'}</span>
                    </div>

                    <div className="mt-2 text-danger small fw-semibold">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      Allergies & Alerts: {selectedPatient.allergies || 'Penicillin, Dust Mites (Reported)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Quick Action & Primary Doctor */}
              <div className="col-lg-5 border-start-lg ps-lg-4">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: 10 }}>Primary Attending Consultant</span>
                    <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: 10 }}>Internal Medicine</span>
                  </div>
                  <div className="fw-bold text-dark fs-6">
                    <i className="bi bi-person-fill-check text-primary me-1"></i> Dr. Sarah Jenkins, MD, DM
                  </div>
                  <div className="text-muted small" style={{ fontSize: 11 }}>
                    Care Coordinator &bull; Metropolitan Multispecialty Hospital
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VITALS BASELINE MATRIX */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>BLOOD PRESSURE</span>
                  <i className="bi bi-heart-pulse-fill text-danger"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">122/80</div>
                <small className="text-success fw-bold" style={{ fontSize: 10 }}>Normal Sinus</small>
              </div>
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>PULSE / HR</span>
                  <i className="bi bi-activity text-primary"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">76 bpm</div>
                <small className="text-success fw-bold" style={{ fontSize: 10 }}>Resting Regular</small>
              </div>
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>OXYGEN (SpO2)</span>
                  <i className="bi bi-lungs-fill text-info"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">99%</div>
                <small className="text-success fw-bold" style={{ fontSize: 10 }}>Optimal Room Air</small>
              </div>
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>BODY TEMP</span>
                  <i className="bi bi-thermometer-half text-warning"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">98.4 °F</div>
                <small className="text-success fw-bold" style={{ fontSize: 10 }}>Afebrile</small>
              </div>
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>FASTING GLUCOSE</span>
                  <i className="bi bi-droplet-half text-purple"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">104 mg/dL</div>
                <small className="text-success fw-bold" style={{ fontSize: 10 }}>Euglycemic</small>
              </div>
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <div className="vital-badge-box">
                <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
                  <span>BODY WEIGHT / BMI</span>
                  <i className="bi bi-speedometer text-secondary"></i>
                </div>
                <div className="fs-5 fw-bold text-dark">68 kg</div>
                <small className="text-primary fw-bold" style={{ fontSize: 10 }}>BMI: 22.8 (Normal)</small>
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL CLINICAL TIMELINE */}
          <div className="dossier-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-4 gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-clock-history text-primary me-2"></i>
                  Chronological Clinical Journey ({filteredTimeline.length} Events)
                </h5>
                <small className="text-muted">
                  Interactive longitudinal healthcare timeline for <strong>{selectedPatient.name}</strong>
                </small>
              </div>

              {/* Timeline Category Filters */}
              <div className="d-flex flex-wrap gap-1">
                {[
                  { key: 'ALL', label: 'All Touchpoints' },
                  { key: 'OPD', label: 'OPD Visits' },
                  { key: 'PRESCRIPTION', label: 'Medications ℞' },
                  { key: 'ADMISSION', label: 'Bed Stays' },
                  { key: 'BILLING', label: 'Invoices' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    type="button"
                    className={`btn btn-sm px-3 rounded-pill fw-bold ${timelineFilter === filter.key ? 'btn-primary text-white' : 'btn-light text-secondary border'}`}
                    style={{ fontSize: 11 }}
                    onClick={() => setTimelineFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TIMELINE LIST */}
            <div className="timeline-container">
              {filteredTimeline.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="timeline-node"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                >
                  <div
                    className="timeline-dot"
                    style={{ background: item.iconColor, borderColor: '#ffffff', boxShadow: `0 0 0 2px ${item.iconColor}` }}
                  ></div>

                  <div className="timeline-bubble">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                          style={{ width: 36, height: 36, background: item.iconBg, color: item.iconColor, fontSize: 18 }}
                        >
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                        <div>
                          <span className={`badge rounded-pill fw-bold me-2 ${item.badgeColor}`} style={{ fontSize: 10 }}>
                            {item.typeBadge}
                          </span>
                          <strong className="text-dark fs-6">{item.title}</strong>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="badge bg-light text-dark border fw-bold" style={{ fontSize: 11 }}>
                          <i className="bi bi-calendar3 me-1"></i> {item.date}
                        </span>
                      </div>
                    </div>

                    {/* Prescriptions List if any */}
                    {item.medicines && item.medicines.length > 0 && (
                      <div className="p-2 bg-light rounded-2 border my-2">
                        <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: 10 }}>
                          Prescribed Formulations:
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {item.medicines.map((m, mIdx) => (
                            <span key={mIdx} className="badge bg-white text-dark border px-2 py-1">
                              💊 {m.name} &bull; {m.dosage || '1 Tab'} &bull; {m.duration || '5 Days'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Key-Value Grid */}
                    {item.details && (
                      <div className="row g-2 mt-1" style={{ fontSize: 11.5 }}>
                        {Object.entries(item.details).map(([key, val]) => (
                          <div key={key} className="col-12 col-md-6">
                            <span className="text-muted fw-semibold">{key}: </span>
                            <span className="text-dark" dangerouslySetInnerHTML={{ __html: val }}></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* =====================================================
            TAB 2: CLINICAL RECORDS LEDGER (Original Table/Form)
        ====================================================== */
        <div className="ledger-view">
          {/* STATS */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary" style={{ width: 44, height: 44, fontSize: 20 }}>
                  <i className="bi bi-folder2-open"></i>
                </div>
                <div>
                  <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Total Records</small>
                  <div className="fs-4 fw-bold text-dark">{stats.total}</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-info bg-opacity-10 text-info" style={{ width: 44, height: 44, fontSize: 20 }}>
                  <i className="bi bi-person-vcard"></i>
                </div>
                <div>
                  <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>OPD Encounters</small>
                  <div className="fs-4 fw-bold text-dark">{stats.opd}</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-opacity-10 text-danger" style={{ width: 44, height: 44, fontSize: 20 }}>
                  <i className="bi bi-heart-pulse"></i>
                </div>
                <div>
                  <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Emergency Records</small>
                  <div className="fs-4 fw-bold text-dark">{stats.emergency}</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10 text-warning" style={{ width: 44, height: 44, fontSize: 20 }}>
                  <i className="bi bi-hospital"></i>
                </div>
                <div>
                  <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>IPD Admissions</small>
                  <div className="fs-4 fw-bold text-dark">{stats.ipd}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CREATE FORM */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="bg-white rounded-4 border shadow-xs p-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h6 className="fw-bold text-primary mb-0">
                    <i className="bi bi-clipboard2-plus me-2"></i>Create New Clinical Record
                  </h6>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.patientId}
                        onChange={e => handleFormChange('patientId', e.target.value)}
                        required
                      >
                        {patientsList.map(p => (
                          <option key={p.id} value={p.id}>{p.name} #{p.id}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Record Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.recordType}
                        onChange={e => handleFormChange('recordType', e.target.value)}
                      >
                        {recordTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Visit Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={form.visitDate}
                        onChange={e => handleFormChange('visitDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Clinical Diagnosis *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Stage II Hypertension"
                        value={form.diagnosis}
                        onChange={e => handleFormChange('diagnosis', e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Treatment Plan</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Tab Amlodipine 5mg OD"
                        value={form.treatment}
                        onChange={e => handleFormChange('treatment', e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Doctor Clinical Notes</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Observations, examination notes, instructions..."
                        value={form.notes}
                        onChange={e => handleFormChange('notes', e.target.value)}
                      ></textarea>
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

          {/* TOOLBAR */}
          <div className="p-3 bg-white rounded-4 border shadow-xs mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search patient, diagnosis, notes..."
                style={{ maxWidth: 280 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {recordTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {!isPatient && (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-bold d-inline-flex align-items-center gap-2 rounded-pill"
                onClick={() => setShowForm(!showForm)}
              >
                <i className={`bi ${showForm ? 'bi-chevron-up' : 'bi-plus-lg'}`}></i>
                {showForm ? 'Close Form' : 'Add Clinical Record'}
              </button>
            )}
          </div>

          {/* RECORDS LIST */}
          <div className="d-flex flex-column gap-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-4 border text-muted">
                <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                <h6>No clinical records found matching criteria</h6>
              </div>
            ) : (
              filteredRecords.map(record => {
                const config = typeConfig[record.recordType] || { color: '#64748b', bg: 'rgba(100,116,139,.10)', icon: 'bi-file-earmark-medical' };
                const patientName = getPatientName(record.patientId);

                return (
                  <div key={record.id} className="p-4 bg-white rounded-4 border shadow-xs">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div className="d-flex gap-3 align-items-start">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                          style={{ width: 44, height: 44, background: config.bg, color: config.color, fontSize: 20 }}
                        >
                          <i className={`bi ${config.icon}`}></i>
                        </div>
                        <div>
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <span className="badge rounded-pill fw-bold" style={{ background: config.bg, color: config.color, fontSize: 10 }}>
                              {record.recordType || 'Clinical'}
                            </span>
                            <span className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i> {record.visitDate}
                            </span>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">{record.diagnosis || 'Clinical Assessment'}</h6>
                          <div className="text-secondary small mb-2">
                            <strong>Treatment:</strong> {record.treatment || 'Symptomatic supportive plan'}
                          </div>
                          {record.notes && (
                            <p className="text-muted small mb-0 p-2 bg-light rounded border">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <div className="text-end">
                          <small className="text-muted d-block" style={{ fontSize: 10 }}>PATIENT</small>
                          <strong className="text-dark small">{patientName}</strong>
                        </div>
                        {!isPatient && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => handleDelete(record.id)}
                            title="Delete Record"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PRINT DISCHARGE SUMMARY MODAL */}
      {printDischargeSlip && (
        <PrintModal
          title={`Discharge & Health Summary - ${printDischargeSlip.name || 'Patient'}`}
          onClose={() => setPrintDischargeSlip(null)}
        >
          <PatientDischargeSummarySlip
            patient={printDischargeSlip}
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
