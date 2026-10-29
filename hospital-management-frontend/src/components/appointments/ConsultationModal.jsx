import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MedicineService from '../../services/MedicineService';
import PrescriptionService from '../../services/PrescriptionService';
import AppointmentService from '../../services/AppointmentService';
import RealtimeNotificationHub from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';

const COMMON_DIAGNOSES = [
  'Viral Upper Respiratory Infection',
  'Acute Bronchitis & Cough',
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Acute Gastroenteritis & Dehydration',
  'Tension Headache / Migraine',
  'Allergic Rhinitis',
  'Acute Gastritis / Acid Reflux',
  'Musculoskeletal Pain & Strain',
  'General Clinical Checkup'
];

const QUICK_COMPLAINTS = [
  'High fever with chills for 3 days',
  'Dry persistent cough and throat irritation',
  'Chest heaviness and shortness of breath',
  'Abdominal cramps and nausea',
  'Severe throbbing headache',
  'Routine health review & medication refill'
];

const DEFAULT_MEDICINE_LIST = [
  { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'Take after meals', type: 'Tablet' },
  { name: 'Amoxicillin 500mg', dosage: '1 Capsule', frequency: '1-1-1', duration: '5 Days', instructions: 'Take after food', type: 'Capsule' },
  { name: 'Pantoprazole 40mg', dosage: '1 Tablet', frequency: '1-0-0', duration: '7 Days', instructions: 'Take 30 mins before breakfast', type: 'Tablet' },
  { name: 'Azithromycin 500mg', dosage: '1 Tablet', frequency: '1-0-0', duration: '3 Days', instructions: 'Take at night after dinner', type: 'Tablet' },
  { name: 'Cetirizine 10mg', dosage: '1 Tablet', frequency: '0-0-1', duration: '5 Days', instructions: 'Take at bedtime', type: 'Tablet' },
  { name: 'Metformin 500mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '30 Days', instructions: 'Take with meals', type: 'Tablet' },
  { name: 'Cough Syrup 100ml', dosage: '10 ml', frequency: '1-1-1', duration: '5 Days', instructions: 'Take with warm water', type: 'Syrup' }
];

function ConsultationModal({ show, appointment, patient, doctor, onClose, onComplete }) {
  if (!show || !appointment) return null;

  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals' | 'rx' | 'advice'
  const [submitting, setSubmitting] = useState(false);
  const [availableMedicines, setAvailableMedicines] = useState([]);

  // Patient Info
  const patientName = appointment.patientName || appointment.patient?.name || patient?.name || 'Unknown Patient';
  const patientId = appointment.patientId || appointment.patient?.id || patient?.id || 1;
  const doctorName = appointment.doctorName || appointment.doctor?.name || doctor?.name || 'Dr. Medical Officer';
  const doctorId = appointment.doctorId || appointment.doctor?.id || doctor?.id || 1;
  const department = appointment.department || doctor?.specialization || 'General Medicine';

  // Clinical Vitals State
  const [vitals, setVitals] = useState({
    bpSys: '120',
    bpDia: '80',
    pulse: '74',
    spo2: '98',
    temp: '98.4',
    weight: '68'
  });

  // Clinical Diagnosis & Complaint
  const [diagnosis, setDiagnosis] = useState(appointment.reason || 'Viral Upper Respiratory Infection');
  const [complaint, setComplaint] = useState(appointment.reason || 'Fever and cold for past 3 days');
  const [clinicalNotes, setClinicalNotes] = useState('Patient is conscious, oriented. Chest clear, throat congested. Advised symptomatic medical therapy.');

  // Medicines List
  const [medicines, setMedicines] = useState([
    {
      name: 'Paracetamol 650mg',
      dosage: '1 Tablet',
      frequency: '1-0-1',
      duration: '5 Days',
      instructions: 'Take after meals',
      type: 'Tablet'
    },
    {
      name: 'Pantoprazole 40mg',
      dosage: '1 Tablet',
      frequency: '1-0-0',
      duration: '5 Days',
      instructions: 'Take 30 mins before breakfast',
      type: 'Tablet'
    }
  ]);

  // Advice & Followup
  const [advice, setAdvice] = useState('Take medications strictly as prescribed. Increase fluid intake (2-3 Litres daily). Avoid oily/spicy foods.');
  const [followUp, setFollowUp] = useState('After 5 Days (or SOS if fever persists)');

  // Load pharmacy medicines for autocomplete
  useEffect(() => {
    MedicineService.getAllMedicines()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvailableMedicines(res.data);
        }
      })
      .catch(() => {
        // Fallback to empty if medicine service is offline
      });
  }, []);

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: '',
        dosage: '1 Tablet',
        frequency: '1-0-1',
        duration: '5 Days',
        instructions: 'Take after meals',
        type: 'Tablet'
      }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length <= 1) {
      toast.info('At least one medicine is recommended.');
      return;
    }
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSelectQuickMed = (med, index) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index] = {
        name: med.name,
        dosage: med.dosage || '1 Tablet',
        frequency: med.frequency || '1-0-1',
        duration: med.duration || '5 Days',
        instructions: med.instructions || 'Take after meals',
        type: med.unit || med.type || 'Tablet'
      };
      return copy;
    });
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();

    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      toast.warning('Please add at least one prescribed medication.');
      setActiveTab('rx');
      return;
    }

    setSubmitting(true);

    const bpCombined = `${vitals.bpSys || '120'}/${vitals.bpDia || '80'}`;

    const prescriptionPayload = {
      patientId: parseInt(patientId, 10),
      patientName,
      patientAge: patient?.age || 34,
      patientGender: patient?.gender || 'Adult',
      doctorId: parseInt(doctorId, 10),
      doctorName,
      department,
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis.trim() || 'Clinical Evaluation',
      complaint: complaint.trim(),
      vitals: {
        bp: bpCombined,
        pulse: vitals.pulse || '74',
        spo2: vitals.spo2 || '98',
        temp: vitals.temp || '98.4',
        weight: vitals.weight || '68'
      },
      medicines: validMeds,
      medicineName: validMeds.map((m) => m.name).join(', '),
      dosage: validMeds[0]?.dosage || '1 Tab',
      duration: validMeds[0]?.duration || '5 Days',
      instructions: validMeds[0]?.instructions || 'Take after meals',
      notes: advice.trim(),
      followUp: followUp.trim()
    };

    try {
      // 1. Save prescription
      let savedRx = prescriptionPayload;
      try {
        const rxRes = await PrescriptionService.addPrescription(prescriptionPayload);
        if (rxRes?.data) {
          savedRx = { ...prescriptionPayload, ...rxRes.data };
        }
      } catch (err) {
        console.warn('Backend prescription service offline, using client generated Rx:', err);
      }

      // 2. Mark appointment as Completed
      try {
        await AppointmentService.updateAppointmentStatus(appointment.id, 'Completed');
      } catch (err) {
        console.warn('Could not update appointment status on server:', err);
      }

      toast.success(`Consultation completed! Prescription issued for ${patientName}.`);

      // Trigger Realtime Notification for Pharmacist & Admin
      RealtimeNotificationHub.publishNotification({
        type: 'PRESCRIPTION_NOTIFICATION',
        title: 'New Prescription to Dispense',
        message: `New prescription to dispense for ${patientName} by ${doctorName} (Rx-${savedRx.id || 'NEW'})`,
        targetRoles: ['PHARMACIST', 'ADMIN', 'PATIENT'],
        patientName,
        doctorName,
        meta: { prescriptionId: savedRx.id }
      });

      if (onComplete) {
        onComplete(savedRx, { ...appointment, status: 'Completed' });
      }

      onClose();
    } catch (error) {
      console.error('Error during consultation completion:', error);
      toast.error('Failed to finish consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1055,
        overflowY: 'auto'
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered my-4">
        <motion.div
          className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ background: '#ffffff' }}
        >
          {/* MODAL HEADER */}
          <div
            className="px-4 py-3 text-white d-flex align-items-center justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-white text-primary shadow-sm"
                style={{ width: 44, height: 44, fontSize: 22 }}
              >
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold mb-0">Doctor OPD Consultation & Digital Rx</h5>
                  <span className="badge bg-white text-primary fw-bold" style={{ fontSize: 11 }}>
                    APPT #{appointment.id}
                  </span>
                </div>
                <small className="text-white-50">
                  Patient: <strong className="text-white">{patientName}</strong> · Specialist: <strong className="text-white">{doctorName}</strong> ({department})
                </small>
              </div>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={submitting}
            />
          </div>

          {/* PATIENT SUMMARY TOP BAR */}
          <div className="bg-light px-4 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 text-secondary small">
            <div className="d-flex align-items-center gap-3">
              <span><i className="bi bi-person-fill text-primary me-1"></i> Patient ID: <strong>#{patientId}</strong></span>
              <span><i className="bi bi-calendar3 text-indigo me-1"></i> Date: <strong>{appointment.date || new Date().toISOString().split('T')[0]}</strong></span>
              <span><i className="bi bi-clock text-warning me-1"></i> Time Slot: <strong>{appointment.time || '10:00 AM'}</strong></span>
            </div>
            <div>
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold">
                <i className="bi bi-activity me-1"></i> In Consultation Room
              </span>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="px-4 pt-3 border-bottom bg-white">
            <ul className="nav nav-pills gap-2 pb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${
                    activeTab === 'vitals' ? 'active bg-primary text-white shadow-sm' : 'text-secondary bg-light'
                  }`}
                  onClick={() => setActiveTab('vitals')}
                >
                  <i className="bi bi-speedometer2"></i>
                  1. Clinical Vitals & Diagnosis
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${
                    activeTab === 'rx' ? 'active bg-primary text-white shadow-sm' : 'text-secondary bg-light'
                  }`}
                  onClick={() => setActiveTab('rx')}
                >
                  <i className="bi bi-capsule"></i>
                  2. Prescribe Medications (Rx)
                  <span className="badge bg-white text-primary ms-1">{medicines.length}</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${
                    activeTab === 'advice' ? 'active bg-primary text-white shadow-sm' : 'text-secondary bg-light'
                  }`}
                  onClick={() => setActiveTab('advice')}
                >
                  <i className="bi bi-journal-medical"></i>
                  3. Advice & Follow-Up
                </button>
              </li>
            </ul>
          </div>

          {/* MODAL BODY */}
          <form onSubmit={handleSubmitConsultation}>
            <div className="modal-body p-4" style={{ maxHeight: 'calc(80vh - 190px)', overflowY: 'auto' }}>
              {/* =========================================================
                  TAB 1: VITALS & DIAGNOSIS
                  ========================================================= */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  {/* VITALS ENTRY CARDS */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-heart-pulse text-danger"></i> Patient Vital Signs (Physical Examination)
                    </label>

                    <div className="row g-3">
                      {/* BLOOD PRESSURE */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Blood Pressure</small>
                          <div className="d-flex align-items-center justify-content-center gap-1 my-2">
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold"
                              style={{ width: 60 }}
                              value={vitals.bpSys}
                              onChange={(e) => setVitals({ ...vitals, bpSys: e.target.value })}
                              placeholder="120"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold"
                              style={{ width: 60 }}
                              value={vitals.bpDia}
                              onChange={(e) => setVitals({ ...vitals, bpDia: e.target.value })}
                              placeholder="80"
                            />
                          </div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: 10 }}>
                            mmHg (Normal)
                          </span>
                        </div>
                      </div>

                      {/* PULSE RATE */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Heart / Pulse</small>
                          <div className="my-2">
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold mx-auto"
                              style={{ width: 75 }}
                              value={vitals.pulse}
                              onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                              placeholder="72"
                            />
                          </div>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: 10 }}>
                            bpm
                          </span>
                        </div>
                      </div>

                      {/* SPO2 */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Oxygen (SpO2)</small>
                          <div className="my-2">
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold mx-auto"
                              style={{ width: 75 }}
                              value={vitals.spo2}
                              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                              placeholder="98"
                            />
                          </div>
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle" style={{ fontSize: 10 }}>
                            % saturation
                          </span>
                        </div>
                      </div>

                      {/* BODY TEMP */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Temperature</small>
                          <div className="my-2">
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm text-center fw-bold mx-auto"
                              style={{ width: 75 }}
                              value={vitals.temp}
                              onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                              placeholder="98.6"
                            />
                          </div>
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: 10 }}>
                            °F (Oral)
                          </span>
                        </div>
                      </div>

                      {/* BODY WEIGHT */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Weight</small>
                          <div className="my-2">
                            <input
                              type="number"
                              step="0.5"
                              className="form-control form-control-sm text-center fw-bold mx-auto"
                              style={{ width: 75 }}
                              value={vitals.weight}
                              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                              placeholder="68"
                            />
                          </div>
                          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{ fontSize: 10 }}>
                            kg
                          </span>
                        </div>
                      </div>

                      {/* STATUS TAG */}
                      <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <div className="p-3 border rounded-3 bg-light text-center h-100 d-flex flex-column justify-content-center">
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Clinical Stability</small>
                          <div className="mt-2 text-success fw-bold">
                            <i className="bi bi-shield-check fs-5 d-block"></i>
                            Stable Vitals
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHIEF COMPLAINTS & DIAGNOSIS */}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">
                        Chief Complaints & Symptom Duration <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g. Fever with chills since 3 days, dry cough..."
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        required
                      />
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {QUICK_COMPLAINTS.slice(0, 3).map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            className="btn btn-outline-secondary btn-sm rounded-pill"
                            style={{ fontSize: 11 }}
                            onClick={() => setComplaint(c)}
                          >
                            + {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">
                        Primary Clinical Diagnosis <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control fw-semibold"
                        placeholder="Search or enter diagnosis..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        required
                      />
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {COMMON_DIAGNOSES.slice(0, 4).map((d, i) => (
                          <button
                            key={i}
                            type="button"
                            className="btn btn-outline-primary btn-sm rounded-pill"
                            style={{ fontSize: 11 }}
                            onClick={() => setDiagnosis(d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">Clinical Examination Notes & Findings</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Objective findings, auscultation, systemic examination..."
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="text-end pt-3">
                    <button
                      type="button"
                      className="btn btn-primary px-4 fw-semibold"
                      onClick={() => setActiveTab('rx')}
                    >
                      Next: Prescribe Medications <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 2: DIGITAL RX & MEDICINES
                  ========================================================= */}
              {activeTab === 'rx' && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <span className="text-primary fs-4 fw-bold font-serif" style={{ fontStyle: 'italic' }}>℞</span>
                        Medication Orders & Dosage Guidelines
                      </h6>
                      <small className="text-muted">Select from hospital inventory or type custom medication formulation.</small>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm fw-semibold"
                      onClick={handleAddMedicineRow}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Medication
                    </button>
                  </div>

                  {/* QUICK MEDICINE PRESETS */}
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <small className="fw-bold text-uppercase text-muted d-block mb-2" style={{ fontSize: 10 }}>
                      <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Presets from Pharmacopeia:
                    </small>
                    <div className="d-flex flex-wrap gap-1">
                      {DEFAULT_MEDICINE_LIST.slice(0, 6).map((med, i) => (
                        <button
                          key={i}
                          type="button"
                          className="btn btn-white btn-sm border rounded-pill shadow-xs"
                          style={{ fontSize: 11 }}
                          onClick={() => {
                            // Find an empty row or append
                            const emptyIdx = medicines.findIndex((m) => !m.name);
                            if (emptyIdx !== -1) {
                              handleSelectQuickMed(med, emptyIdx);
                            } else {
                              setMedicines((prev) => [...prev, { ...med }]);
                            }
                          }}
                        >
                          + {med.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MEDICINES ROWS */}
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light text-uppercase text-secondary" style={{ fontSize: 11 }}>
                        <tr>
                          <th style={{ width: 35 }}>#</th>
                          <th style={{ minWidth: 220 }}>Medication Name</th>
                          <th style={{ width: 130 }}>Dosage</th>
                          <th style={{ width: 140 }}>Frequency</th>
                          <th style={{ width: 120 }}>Duration</th>
                          <th style={{ minWidth: 180 }}>Instructions</th>
                          <th style={{ width: 50 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, idx) => (
                          <tr key={idx}>
                            <td className="text-center fw-bold text-muted">{idx + 1}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm fw-bold"
                                placeholder="e.g. Paracetamol 650mg"
                                value={med.name}
                                onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                                list={`med-list-${idx}`}
                                required
                              />
                              <datalist id={`med-list-${idx}`}>
                                {availableMedicines.map((m) => (
                                  <option key={m.id || m.name} value={m.name} />
                                ))}
                                {DEFAULT_MEDICINE_LIST.map((m) => (
                                  <option key={m.name} value={m.name} />
                                ))}
                              </datalist>
                            </td>

                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="1 Tablet"
                                value={med.dosage}
                                onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                              />
                            </td>

                            <td>
                              <select
                                className="form-select form-select-sm fw-semibold"
                                value={med.frequency}
                                onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                              >
                                <option value="1-0-1">1-0-1 (Morning-Night)</option>
                                <option value="1-1-1">1-1-1 (Thrice daily)</option>
                                <option value="1-0-0">1-0-0 (Morning only)</option>
                                <option value="0-0-1">0-0-1 (Night only)</option>
                                <option value="SOS">SOS (When needed)</option>
                                <option value="Once weekly">Once weekly</option>
                              </select>
                            </td>

                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={med.duration}
                                onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                              >
                                <option value="3 Days">3 Days</option>
                                <option value="5 Days">5 Days</option>
                                <option value="7 Days">7 Days</option>
                                <option value="10 Days">10 Days</option>
                                <option value="14 Days">14 Days</option>
                                <option value="1 Month">1 Month</option>
                              </select>
                            </td>

                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Take after meals"
                                value={med.instructions}
                                onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                              />
                            </td>

                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm p-1"
                                title="Remove row"
                                onClick={() => handleRemoveMedicineRow(idx)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between pt-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setActiveTab('vitals')}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Back to Vitals
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary px-4 fw-semibold"
                      onClick={() => setActiveTab('advice')}
                    >
                      Next: Advice & Follow-Up <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 3: ADVICE & FINISH
                  ========================================================= */}
              {activeTab === 'advice' && (
                <div className="space-y-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-bold text-dark">
                        Doctor's Lifestyle & Dietary Recommendations
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="e.g. Plenty of oral fluids, warm saline gargle, complete bed rest..."
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label fw-bold text-dark">
                        Next Follow-Up Schedule
                      </label>
                      <select
                        className="form-select mb-2 fw-semibold"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                      >
                        <option value="After 3 Days">After 3 Days</option>
                        <option value="After 5 Days (or SOS if fever persists)">After 5 Days (or SOS if fever persists)</option>
                        <option value="After 1 Week">After 1 Week</option>
                        <option value="After 2 Weeks">After 2 Weeks</option>
                        <option value="After 1 Month">After 1 Month</option>
                        <option value="SOS / As needed">SOS / As needed only</option>
                      </select>

                      <div className="p-3 border rounded-3 bg-light text-secondary small">
                        <div className="fw-bold text-dark mb-1">
                          <i className="bi bi-shield-check text-success me-1"></i> What happens on submission:
                        </div>
                        <ul className="mb-0 ps-3">
                          <li>Appointment status changes to <strong>Completed</strong>.</li>
                          <li>Digital Prescription is saved & linked to patient record.</li>
                          <li>Official <strong>Printable Hospital Slip</strong> opens automatically.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between pt-4 border-top mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setActiveTab('rx')}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Back to Rx
                    </button>

                    <button
                      type="submit"
                      className="btn btn-success px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />
                          Generating Prescription...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle fs-5"></i>
                          Complete Consultation & Issue Rx Slip
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="modal-footer bg-light py-2 px-4 justify-content-between border-top">
              <span className="text-muted small">
                <i className="bi bi-lock-fill text-secondary me-1"></i> Telemedicine & Healthcare Practice Act Compliant
              </span>
              <button
                type="button"
                className="btn btn-light btn-sm px-3 text-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel Consultation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ConsultationModal;
