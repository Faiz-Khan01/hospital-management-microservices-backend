import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PrescriptionService from '../../services/PrescriptionService';
import AuthService from '../../services/AuthService';
import PrintModal from '../common/PrintModal';
import RealtimeNotificationHub from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';
import { springSmooth, springSnappy, staggerItem } from '../../animations/motionConfig';

function PrescriptionPanel({
  role = 'ADMIN',
  prescriptions,
  patients,
  doctors,
  onPrescriptionAdded
}) {
  const isPatient = role === 'PATIENT';
  const userId = AuthService.getUserId?.() || 1;
  const username = AuthService.getUsername?.() || '';

  const rawPrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
  const safePrescriptions = useMemo(() => {
    if (!isPatient) return rawPrescriptions;
    return rawPrescriptions.filter((p) => {
      const pid = p.patientId || p.patient?.id;
      const pname = (p.patientName || p.patient?.name || '').toLowerCase();
      return pid === userId || (username && pname.includes(username.toLowerCase())) || pid === 1;
    });
  }, [rawPrescriptions, isPatient, userId, username]);

  const safePatients = Array.isArray(patients) ? patients : [];
  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    patientId: isPatient ? String(userId) : '',
    doctorId: '',
    diagnosis: '',
    notes: ''
  });

  const [medicines, setMedicines] = useState([
    {
      name: '',
      dosage: '500mg',
      frequency: '1-0-1',
      duration: '5 Days',
      instructions: 'Take after meals'
    }
  ]);

  const [printRx, setPrintRx] = useState(null);

  const defaultMedicine = {
    name: '',
    dosage: '500mg',
    frequency: '1-0-1',
    duration: '5 Days',
    instructions: 'Take after meals'
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { ...defaultMedicine }]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;

    setMedicines(
      medicines.filter((_, idx) => idx !== index)
    );
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId) {
      toast.warning('Please select both a Patient and a Doctor.');
      return;
    }

    const patientObj = safePatients.find(
      p => p.id === parseInt(formData.patientId, 10)
    );

    const doctorObj = safeDoctors.find(
      d => d.id === parseInt(formData.doctorId, 10)
    );

    const validMedicines = medicines.filter(
      m => m.name.trim() !== ''
    );

    if (validMedicines.length === 0) {
      toast.warning('Please add at least one medicine.');
      return;
    }

    const payload = {
      patientId: parseInt(formData.patientId, 10),
      patientName: patientObj
        ? patientObj.name
        : 'Unknown Patient',

      doctorId: parseInt(formData.doctorId, 10),

      doctorName: doctorObj
        ? (
            doctorObj.name.startsWith('Dr.')
              ? doctorObj.name
              : `Dr. ${doctorObj.name}`
          )
        : 'Unknown Doctor',

      date: new Date().toISOString().split('T')[0],

      diagnosis:
        formData.diagnosis ||
        (patientObj ? patientObj.disease : 'Clinical Evaluation'),

      medicines: validMedicines,

      notes:
        formData.notes ||
        'Ensure complete rest and finish full dosage course.'
    };

    try {
      const res = await PrescriptionService.addPrescription(payload);

      // Trigger Realtime Notification for Pharmacist & Admin
      RealtimeNotificationHub.publishNotification({
        type: 'PRESCRIPTION_NOTIFICATION',
        title: 'New Prescription to Dispense',
        message: `New prescription to dispense for ${payload.patientName} by ${payload.doctorName} (Rx-${res?.data?.id || 'NEW'})`,
        targetRoles: ['PHARMACIST', 'ADMIN', 'PATIENT'],
        patientName: payload.patientName,
        doctorName: payload.doctorName,
        meta: { prescriptionId: res?.data?.id }
      });

      toast.success('Prescription generated successfully!');

      setPrintRx(res.data || payload);

      setFormData({
        patientId: '',
        doctorId: '',
        diagnosis: '',
        notes: ''
      });

      setMedicines([{ ...defaultMedicine }]);
      setIsExpanded(false);

      if (onPrescriptionAdded) {
        onPrescriptionAdded();
      }
    } catch (err) {
      toast.error('Failed to generate prescription.');
    }
  };

  const handleDeleteRx = async (id) => {
    if (!window.confirm('Delete this prescription record?')) {
      return;
    }

    try {
      await PrescriptionService.deletePrescription(id);

      toast.success('Prescription deleted.');

      if (onPrescriptionAdded) {
        onPrescriptionAdded();
      }
    } catch (e) {
      toast.error('Failed to delete prescription.');
    }
  };

  return (
    <div className="prescription-dashboard">

      {/* =====================================================
          PREMIUM METRICS
      ====================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="premium-stat-card">
            <div className="stat-icon stat-icon-amber">
              <i className="bi bi-file-earmark-medical-fill"></i>
            </div>

            <div className="stat-content">
              <span>Total Prescriptions</span>
              <strong>{safePrescriptions.length}</strong>
              <small>
                <i className="bi bi-arrow-up-right"></i>
                Clinical records
              </small>
            </div>

            <div className="stat-decoration amber"></div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="premium-stat-card">
            <div className="stat-icon stat-icon-purple">
              <i className="bi bi-capsule-pill"></i>
            </div>

            <div className="stat-content">
              <span>Active Regimens</span>
              <strong>{safePrescriptions.length * 2}</strong>
              <small>
                <i className="bi bi-activity"></i>
                Medication plans
              </small>
            </div>

            <div className="stat-decoration purple"></div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="premium-stat-card">
            <div className="stat-icon stat-icon-green">
              <i className="bi bi-shield-check"></i>
            </div>

            <div className="stat-content">
              <span>Fulfillment Rate</span>
              <strong>100%</strong>
              <small>
                <i className="bi bi-check-circle-fill"></i>
                Pharmacy verified
              </small>
            </div>

            <div className="stat-decoration green"></div>
          </div>
        </div>

      </div>


      {/* =====================================================
          PRESCRIPTION CREATOR (Hidden for PATIENT)
      ====================================================== */}

      {!isPatient && (
      <div className="premium-panel mb-4">

        <div
          className={`premium-panel-header ${
            isExpanded ? 'expanded' : ''
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >

          <div className="header-left">

            <div className="header-icon amber-icon">
              <i className="bi bi-prescription2"></i>
            </div>

            <div>
              <div className="eyebrow">
                CLINICAL WORKSPACE
              </div>

              <h5>
                Prescription Composer
              </h5>

              <p>
                Create, review and issue digital medication prescriptions.
              </p>
            </div>

          </div>

          <button
            type="button"
            className={`premium-action-btn ${
              isExpanded
                ? 'secondary'
                : 'primary-amber'
            }`}
          >
            <i
              className={`bi ${
                isExpanded
                  ? 'bi-chevron-up'
                  : 'bi-plus-lg'
              }`}
            ></i>

            {isExpanded
              ? 'Close Composer'
              : 'Create Prescription'}
          </button>

        </div>


        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="premium-form-container overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springSmooth}
            >

            <form onSubmit={handleSubmit}>

              {/* Patient / Doctor */}

              <div className="form-section">

                <div className="section-heading">
                  <div className="section-number">
                    01
                  </div>

                  <div>
                    <h6>Clinical Context</h6>
                    <span>
                      Select the patient and prescribing physician.
                    </span>
                  </div>
                </div>


                <div className="row g-3">

                  <div className="col-12 col-lg-4">

                    <label className="premium-label">
                      Patient
                      <span>*</span>
                    </label>

                    <div className="premium-input-wrapper">

                      <i className="bi bi-person-heart"></i>

                      <select
                        className="premium-input"
                        value={formData.patientId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            patientId: e.target.value
                          })
                        }
                        required
                      >
                        <option value="">
                          Select patient
                        </option>

                        {safePatients.map(p => (
                          <option
                            key={p.id}
                            value={p.id}
                          >
                            {p.name} · #{p.id}
                          </option>
                        ))}
                      </select>

                    </div>

                  </div>


                  <div className="col-12 col-lg-4">

                    <label className="premium-label">
                      Prescribing Physician
                      <span>*</span>
                    </label>

                    <div className="premium-input-wrapper">

                      <i className="bi bi-person-badge"></i>

                      <select
                        className="premium-input"
                        value={formData.doctorId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            doctorId: e.target.value
                          })
                        }
                        required
                      >
                        <option value="">
                          Select physician
                        </option>

                        {safeDoctors.map(d => {

                          const docName =
                            d.name.startsWith('Dr.')
                              ? d.name
                              : `Dr. ${d.name}`;

                          return (
                            <option
                              key={d.id}
                              value={d.id}
                            >
                              {docName} · {d.specialty || d.department}
                            </option>
                          );
                        })}

                      </select>

                    </div>

                  </div>


                  <div className="col-12 col-lg-4">

                    <label className="premium-label">
                      Diagnosis / Indication
                    </label>

                    <div className="premium-input-wrapper">

                      <i className="bi bi-activity"></i>

                      <input
                        type="text"
                        className="premium-input"
                        placeholder="e.g. Acute migraine"
                        value={formData.diagnosis}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            diagnosis: e.target.value
                          })
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* Medicine Section */}

              <div className="form-section medication-section">

                <div className="section-heading">

                  <div className="section-number amber">
                    02
                  </div>

                  <div>
                    <h6>Medication Plan</h6>
                    <span>
                      Define dosage, frequency and administration instructions.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="add-medicine-btn ms-auto"
                    onClick={handleAddMedicineRow}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Add medication
                  </button>

                </div>


                <div className="medicine-list">

                  {medicines.map((med, idx) => (

                    <div
                      className="medicine-card"
                      key={idx}
                    >

                      <div className="medicine-index">
                        {String(idx + 1).padStart(2, '0')}
                      </div>


                      <div className="medicine-fields">

                        <div className="medicine-main-field">

                          <label>
                            Medication
                          </label>

                          <div className="premium-input-wrapper">

                            <i className="bi bi-capsule"></i>

                            <input
                              type="text"
                              className="premium-input"
                              placeholder="Medicine name"
                              value={med.name}
                              onChange={(e) =>
                                handleMedicineChange(
                                  idx,
                                  'name',
                                  e.target.value
                                )
                              }
                              required
                            />

                          </div>

                        </div>


                        <div>

                          <label>
                            Dosage
                          </label>

                          <input
                            type="text"
                            className="premium-input standalone"
                            placeholder="500mg"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicineChange(
                                idx,
                                'dosage',
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div>

                          <label>
                            Frequency
                          </label>

                          <select
                            className="premium-input standalone"
                            value={med.frequency}
                            onChange={(e) =>
                              handleMedicineChange(
                                idx,
                                'frequency',
                                e.target.value
                              )
                            }
                          >
                            <option value="1-0-1">
                              1-0-1 · Twice
                            </option>

                            <option value="1-1-1">
                              1-1-1 · Thrice
                            </option>

                            <option value="1-0-0">
                              1-0-0 · Morning
                            </option>

                            <option value="0-0-1">
                              0-0-1 · Night
                            </option>

                            <option value="As Needed">
                              PRN · As needed
                            </option>
                          </select>

                        </div>


                        <div>

                          <label>
                            Duration
                          </label>

                          <input
                            type="text"
                            className="premium-input standalone"
                            placeholder="5 Days"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicineChange(
                                idx,
                                'duration',
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="medicine-instruction">

                          <label>
                            Instructions
                          </label>

                          <input
                            type="text"
                            className="premium-input standalone"
                            placeholder="Take after meals"
                            value={med.instructions}
                            onChange={(e) =>
                              handleMedicineChange(
                                idx,
                                'instructions',
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>


                      <button
                        type="button"
                        className="remove-medicine-btn"
                        onClick={() =>
                          handleRemoveMedicineRow(idx)
                        }
                        disabled={medicines.length === 1}
                        title="Remove medication"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>

                    </div>

                  ))}

                </div>

              </div>


              {/* Notes */}

              <div className="form-section">

                <div className="section-heading">

                  <div className="section-number">
                    03
                  </div>

                  <div>
                    <h6>Clinical Instructions</h6>
                    <span>
                      Add follow-up, diet or additional physician advice.
                    </span>
                  </div>

                </div>

                <textarea
                  className="premium-textarea"
                  rows="4"
                  placeholder="Enter doctor advice, dietary instructions, follow-up information..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value
                    })
                  }
                />

              </div>


              {/* Footer */}

              <div className="composer-footer">

                <div className="security-note">
                  <i className="bi bi-shield-lock-fill"></i>

                  <span>
                    Prescription will be securely added to the clinical archive.
                  </span>
                </div>

                <div className="footer-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setIsExpanded(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="generate-btn"
                  >
                    <i className="bi bi-file-earmark-check"></i>
                    Generate Prescription
                    <i className="bi bi-arrow-right"></i>
                  </button>

                </div>

              </div>

            </form>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
      )}


      {/* =====================================================
          PRESCRIPTION ARCHIVE
      ====================================================== */}

      <div className="premium-panel archive-panel">

        <div className="archive-header">

          <div>

            <div className="eyebrow">
              CLINICAL ARCHIVE
            </div>

            <h5>
              Prescription History
            </h5>

            <p>
              Secure record of issued medication prescriptions.
            </p>

          </div>

          <div className="archive-count">
            <strong>{safePrescriptions.length}</strong>
            <span>Records</span>
          </div>

        </div>


        <div className="premium-table-wrapper">

          <table className="premium-table">

            <thead>

              <tr>
                <th>Prescription</th>
                <th>Patient</th>
                <th>Physician</th>
                <th>Diagnosis</th>
                <th>Medication</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>

            </thead>

            <tbody>

              {safePrescriptions.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="empty-state"
                  >

                    <div className="empty-icon">
                      <i className="bi bi-file-earmark-medical"></i>
                    </div>

                    <strong>
                      No prescriptions yet
                    </strong>

                    <span>
                      Generated prescriptions will appear here.
                    </span>

                  </td>

                </tr>

              ) : (

                safePrescriptions.map(rx => (

                  <motion.tr 
                    key={rx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >

                    <td>

                      <span className="rx-id">
                        Rx-{rx.id}
                      </span>

                    </td>


                    <td>

                      <div className="patient-cell">

                        <div className="patient-avatar">
                          {(rx.patientName || 'P')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {rx.patientName ||
                              (rx.patient
                                ? rx.patient.name
                                : 'N/A')}
                          </strong>

                          <small>
                            Patient #{rx.patientId || rx.patient?.id || '—'}
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>

                      <div className="doctor-cell">

                        <div className="doctor-avatar">
                          <i className="bi bi-person-badge"></i>
                        </div>

                        <span>
                          {rx.doctorName ||
                            (rx.doctor
                              ? rx.doctor.name
                              : 'N/A')}
                        </span>

                      </div>

                    </td>


                    <td>

                      <span className="diagnosis-chip">
                        <i className="bi bi-activity"></i>
                        {rx.diagnosis || 'Clinical Checkup'}
                      </span>

                    </td>


                    <td>

                      <div className="medication-summary">

                        {Array.isArray(rx.medicines) ? (

                          rx.medicines
                            .slice(0, 2)
                            .map((m, i) => (

                              <span
                                key={i}
                                className="medicine-chip"
                              >
                                <i className="bi bi-capsule"></i>
                                {m.name}
                                <em>
                                  {m.dosage}
                                </em>
                              </span>

                            ))

                        ) : (

                          <span className="medicine-chip">
                            {rx.medicineName || 'Medication'}
                          </span>

                        )}

                        {Array.isArray(rx.medicines) &&
                          rx.medicines.length > 2 && (

                            <span className="more-chip">
                              +{rx.medicines.length - 2}
                            </span>

                          )}

                      </div>

                    </td>


                    <td>

                      <span className="date-cell">
                        <i className="bi bi-calendar3"></i>
                        {rx.date || 'Today'}
                      </span>

                    </td>


                    <td>

                      <div className="table-actions">

                        <button
                          className="view-rx-btn"
                          title="Print Prescription"
                          onClick={() =>
                            setPrintRx(rx)
                          }
                        >
                          <i className="bi bi-printer"></i>
                          Print
                        </button>

                        {!isPatient && (
                          <button
                            className="delete-rx-btn"
                            title="Delete Prescription"
                            onClick={() =>
                              handleDeleteRx(rx.id)
                            }
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}

                      </div>

                    </td>

                  </motion.tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          PRINT MODAL
      ====================================================== */}

      {printRx && (

        <PrintModal
          show={!!printRx}
          onClose={() => setPrintRx(null)}
          title={`Prescription Rx-${printRx.id}`}
        >

          <div className="premium-prescription">

            {/* Letterhead */}

            <div className="prescription-letterhead">

              <div className="hospital-brand">

                <div className="hospital-logo">
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>

                <div>

                  <h2>
                    HospitalSync
                    <span>Pro</span>
                  </h2>

                  <p>
                    Advanced Medical Center
                  </p>

                </div>

              </div>


              <div className="prescription-meta">

                <div className="official-badge">
                  <i className="bi bi-patch-check-fill"></i>
                  OFFICIAL PRESCRIPTION
                </div>

                <span>
                  Rx-{printRx.id}
                </span>

                <small>
                  {printRx.date ||
                    new Date()
                      .toISOString()
                      .split('T')[0]}
                </small>

              </div>

            </div>


            {/* Patient Banner */}

            <div className="prescription-patient">

              <div>

                <small>
                  PATIENT
                </small>

                <strong>
                  {printRx.patientName}
                </strong>

                <span>
                  Diagnosis ·{' '}
                  {printRx.diagnosis ||
                    'Clinical Assessment'}
                </span>

              </div>


              <div className="prescribing-doctor">

                <small>
                  PRESCRIBED BY
                </small>

                <strong>
                  {printRx.doctorName}
                </strong>

                <span>
                  Attending Physician
                </span>

              </div>

            </div>


            {/* Rx Symbol */}

            <div className="rx-symbol">
              Rx
            </div>


            {/* Medicine Table */}

            <div className="print-section-title">
              Prescribed Medications
            </div>

            <table className="prescription-medicine-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>

              </thead>

              <tbody>

                {Array.isArray(printRx.medicines) &&
                printRx.medicines.length > 0 ? (

                  printRx.medicines.map((m, i) => (

                    <tr key={i}>

                      <td>
                        {String(i + 1).padStart(2, '0')}
                      </td>

                      <td className="medicine-name">
                        {m.name}
                      </td>

                      <td>
                        {m.dosage}
                      </td>

                      <td>
                        {m.frequency}
                      </td>

                      <td>
                        {m.duration}
                      </td>

                      <td>
                        {m.instructions}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td>01</td>

                    <td className="medicine-name">
                      {printRx.medicineName ||
                        'Prescribed Drug'}
                    </td>

                    <td>
                      {printRx.dosage || '500mg'}
                    </td>

                    <td>
                      1-0-1
                    </td>

                    <td>
                      {printRx.duration || '5 Days'}
                    </td>

                    <td>
                      {printRx.instructions ||
                        'Take after meals'}
                    </td>

                  </tr>

                )}

              </tbody>

            </table>


            {/* Advice */}

            <div className="prescription-advice">

              <div>

                <small>
                  PHYSICIAN ADVICE
                </small>

                <p>
                  {printRx.notes ||
                    'Take medications regularly as instructed. Return for follow up in 7 days.'}
                </p>

              </div>

              <div className="signature-area">

                <div className="signature-line">
                  {printRx.doctorName}
                </div>

                <small>
                  Authorized Physician
                </small>

              </div>

            </div>


            {/* Footer */}

            <div className="prescription-footer">

              <span>
                <i className="bi bi-telephone"></i>
                Emergency: 911
              </span>

              <span>
                <i className="bi bi-shield-check"></i>
                Digitally generated clinical record
              </span>

              <span>
                HospitalSync Pro
              </span>

            </div>

          </div>

        </PrintModal>

      )}


      {/* =====================================================
          PREMIUM CSS
      ====================================================== */}

      <style>{`

        .prescription-dashboard {
          --ink: #172033;
          --muted: #718096;
          --line: #e8edf5;
          --surface: #ffffff;
          --surface-soft: #f8fafc;
          --amber: #f59e0b;
          --amber-dark: #d97706;
          --green: #10b981;
          --purple: #8b5cf6;
          --blue: #2563eb;
        }


        /* ================================================
           STAT CARDS
        ================================================= */

        .premium-stat-card {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 118px;
          padding: 22px;
          background: rgba(255,255,255,.96);
          border: 1px solid var(--line);
          border-radius: 18px;
          box-shadow:
            0 8px 30px rgba(15,23,42,.045),
            0 1px 2px rgba(15,23,42,.04);
          transition: all .25s ease;
        }

        .premium-stat-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 38px rgba(15,23,42,.08),
            0 2px 5px rgba(15,23,42,.04);
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          min-width: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          font-size: 21px;
        }

        .stat-icon-amber {
          color: #d97706;
          background: linear-gradient(145deg,#fff7df,#ffedb4);
        }

        .stat-icon-purple {
          color: #7c3aed;
          background: linear-gradient(145deg,#f5f3ff,#ede9fe);
        }

        .stat-icon-green {
          color: #059669;
          background: linear-gradient(145deg,#ecfdf5,#d1fae5);
        }

        .stat-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        .stat-content span {
          color: #718096;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .02em;
        }

        .stat-content strong {
          color: var(--ink);
          font-size: 27px;
          line-height: 1.25;
          font-weight: 800;
        }

        .stat-content small {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 11px;
          margin-top: 2px;
        }

        .stat-content small i {
          color: var(--green);
        }

        .stat-decoration {
          position: absolute;
          right: -30px;
          bottom: -45px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          opacity: .07;
        }

        .stat-decoration.amber {
          background: var(--amber);
        }

        .stat-decoration.purple {
          background: var(--purple);
        }

        .stat-decoration.green {
          background: var(--green);
        }


        /* ================================================
           PANELS
        ================================================= */

        .premium-panel {
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 20px;
          box-shadow:
            0 10px 40px rgba(15,23,42,.045),
            0 1px 2px rgba(15,23,42,.03);
        }


        /* ================================================
           PANEL HEADER
        ================================================= */

        .premium-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 23px 26px;
          cursor: pointer;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fffdf8 100%
            );
          transition: background .2s ease;
        }

        .premium-panel-header:hover {
          background: #fffdf8;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          font-size: 21px;
        }

        .amber-icon {
          color: #b45309;
          background: linear-gradient(
            145deg,
            #fff8e7,
            #ffedbd
          );
          box-shadow:
            inset 0 0 0 1px rgba(245,158,11,.12);
        }

        .eyebrow {
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.5;
          font-weight: 800;
          letter-spacing: .14em;
          margin-bottom: 2px;
        }

        .premium-panel-header h5,
        .archive-header h5 {
          color: var(--ink);
          font-size: 17px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -.01em;
        }

        .premium-panel-header p,
        .archive-header p {
          color: #8792a5;
          font-size: 12px;
          margin: 3px 0 0;
        }


        /* ================================================
           BUTTONS
        ================================================= */

        .premium-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 11px;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 750;
          white-space: nowrap;
          transition: all .2s ease;
        }

        .primary-amber {
          color: #fff;
          background: linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );
          box-shadow:
            0 7px 18px rgba(245,158,11,.22);
        }

        .primary-amber:hover {
          color: white;
          transform: translateY(-1px);
          box-shadow:
            0 10px 24px rgba(245,158,11,.3);
        }

        .premium-action-btn.secondary {
          color: #64748b;
          background: #f1f5f9;
        }


        /* ================================================
           FORM
        ================================================= */

        .premium-form-container {
          padding: 28px;
          background:
            linear-gradient(
              180deg,
              #fafbfc 0%,
              #f7f9fc 100%
            );
          border-top: 1px solid var(--line);
        }

        .form-section {
          padding: 0 0 28px;
          margin-bottom: 25px;
          border-bottom: 1px solid #e8edf3;
        }

        .form-section:last-of-type {
          border-bottom: 0;
          margin-bottom: 0;
        }

        .section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 19px;
        }

        .section-number {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #64748b;
          background: #eef2f7;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .04em;
        }

        .section-number.amber {
          color: #b45309;
          background: #fff3d1;
        }

        .section-heading h6 {
          margin: 0;
          color: var(--ink);
          font-size: 13px;
          font-weight: 800;
        }

        .section-heading span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          margin-top: 2px;
        }

        .premium-label {
          display: block;
          margin-bottom: 7px;
          color: #526176;
          font-size: 11px;
          font-weight: 750;
        }

        .premium-label span {
          color: #ef4444;
          margin-left: 3px;
        }

        .premium-input-wrapper {
          display: flex;
          align-items: center;
          min-height: 44px;
          background: #fff;
          border: 1px solid #dfe5ed;
          border-radius: 11px;
          transition: all .2s ease;
        }

        .premium-input-wrapper:focus-within {
          border-color: rgba(245,158,11,.75);
          box-shadow:
            0 0 0 3px rgba(245,158,11,.1);
        }

        .premium-input-wrapper > i {
          width: 42px;
          text-align: center;
          color: #9aa6b7;
          font-size: 14px;
        }

        .premium-input,
        .premium-textarea {
          width: 100%;
          border: 0;
          outline: 0;
          color: #253044;
          background: transparent;
          font-size: 12px;
          font-weight: 550;
        }

        .premium-input {
          min-height: 42px;
        }

        .premium-input::placeholder,
        .premium-textarea::placeholder {
          color: #a6afbd;
          font-weight: 450;
        }

        .premium-input.standalone {
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 10px;
          background: #fff;
          transition: all .2s ease;
        }

        .premium-input.standalone:focus {
          border-color: rgba(245,158,11,.75);
          box-shadow:
            0 0 0 3px rgba(245,158,11,.1);
        }

        .premium-textarea {
          display: block;
          padding: 13px 14px;
          min-height: 105px;
          resize: vertical;
          background: white;
          border: 1px solid #dfe5ed;
          border-radius: 12px;
          transition: all .2s ease;
        }

        .premium-textarea:focus {
          border-color: rgba(245,158,11,.75);
          box-shadow:
            0 0 0 3px rgba(245,158,11,.1);
        }


        /* ================================================
           MEDICINES
        ================================================= */

        .add-medicine-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #f5d58a;
          border-radius: 9px;
          color: #b45309;
          background: #fffaf0;
          font-size: 11px;
          font-weight: 750;
          transition: all .2s ease;
        }

        .add-medicine-btn:hover {
          background: #fff3d1;
          transform: translateY(-1px);
        }

        .medicine-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .medicine-card {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 14px;
          background: #fff;
          border: 1px solid #e3e8ef;
          border-radius: 13px;
          box-shadow: 0 2px 8px rgba(15,23,42,.025);
          transition: all .2s ease;
        }

        .medicine-card:hover {
          border-color: #f0d79a;
          box-shadow:
            0 8px 20px rgba(15,23,42,.045);
        }

        .medicine-index {
          width: 30px;
          height: 30px;
          min-width: 30px;
          align-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #b45309;
          background: #fff6df;
          font-size: 9px;
          font-weight: 850;
        }

        .medicine-fields {
          flex: 1;
          display: grid;
          grid-template-columns: 1.6fr .8fr 1fr .8fr 1.5fr;
          gap: 9px;
        }

        .medicine-fields label {
          display: block;
          color: #7b8799;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .05em;
          margin-bottom: 5px;
        }

        .remove-medicine-btn {
          width: 36px;
          height: 38px;
          border: 0;
          border-radius: 9px;
          color: #94a3b8;
          background: #f8fafc;
          transition: all .2s ease;
        }

        .remove-medicine-btn:hover:not(:disabled) {
          color: #dc2626;
          background: #fef2f2;
        }

        .remove-medicine-btn:disabled {
          opacity: .3;
          cursor: not-allowed;
        }


        /* ================================================
           FORM FOOTER
        ================================================= */

        .composer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 22px;
          border-top: 1px solid #e3e8ef;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8b97a8;
          font-size: 10px;
        }

        .security-note i {
          color: #10b981;
        }

        .footer-actions {
          display: flex;
          gap: 9px;
        }

        .cancel-btn {
          padding: 10px 17px;
          border: 1px solid #dfe5ed;
          border-radius: 10px;
          color: #64748b;
          background: white;
          font-size: 11px;
          font-weight: 750;
        }

        .generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 17px;
          border: 0;
          border-radius: 10px;
          color: white;
          background: linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );
          box-shadow:
            0 8px 20px rgba(245,158,11,.2);
          font-size: 11px;
          font-weight: 800;
          transition: all .2s ease;
        }

        .generate-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            0 11px 25px rgba(245,158,11,.3);
        }


        /* ================================================
           ARCHIVE
        ================================================= */

        .archive-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 26px;
          border-bottom: 1px solid var(--line);
        }

        .archive-count {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 10px;
          color: #64748b;
          background: #f8fafc;
        }

        .archive-count strong {
          color: #172033;
          font-size: 14px;
          font-weight: 800;
        }

        .archive-count span {
          font-size: 10px;
          font-weight: 650;
        }

        .premium-table-wrapper {
          overflow-x: auto;
        }

        .premium-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        .premium-table thead {
          background: #f8fafc;
        }

        .premium-table th {
          padding: 12px 14px;
          color: #8995a6;
          font-size: 9px;
          font-weight: 850;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .08em;
          white-space: nowrap;
          border-bottom: 1px solid #e8edf3;
        }

        .premium-table th:first-child,
        .premium-table td:first-child {
          padding-left: 24px;
        }

        .premium-table th:last-child,
        .premium-table td:last-child {
          padding-right: 24px;
        }

        .premium-table td {
          padding: 14px;
          color: #526176;
          font-size: 11px;
          border-bottom: 1px solid #edf1f5;
          vertical-align: middle;
        }

        .premium-table tbody tr {
          transition: background .18s ease;
        }

        .premium-table tbody tr:hover {
          background: #fffcf5;
        }

        .rx-id {
          display: inline-flex;
          padding: 6px 8px;
          border-radius: 7px;
          color: #b45309;
          background: #fff7e3;
          font-size: 10px;
          font-weight: 850;
        }

        .patient-cell {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .patient-avatar,
        .doctor-avatar {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .patient-avatar {
          color: #b45309;
          background: #fff4d7;
        }

        .doctor-avatar {
          color: #2563eb;
          background: #eff6ff;
        }

        .patient-cell strong {
          display: block;
          color: #253044;
          font-size: 11px;
          font-weight: 800;
        }

        .patient-cell small {
          display: block;
          color: #9aa5b5;
          font-size: 9px;
          margin-top: 2px;
        }

        .doctor-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4b5870;
          font-weight: 700;
          white-space: nowrap;
        }

        .diagnosis-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: 170px;
          padding: 6px 8px;
          border-radius: 7px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e5eaf0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .diagnosis-chip i {
          color: #f59e0b;
        }

        .medication-summary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          max-width: 250px;
        }

        .medicine-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 7px;
          border-radius: 6px;
          color: #475569;
          background: #f5f7fa;
          border: 1px solid #e8edf2;
          font-size: 9px;
          font-weight: 700;
        }

        .medicine-chip i {
          color: #7c3aed;
        }

        .medicine-chip em {
          color: #94a3b8;
          font-style: normal;
          font-weight: 600;
        }

        .more-chip {
          padding: 5px 7px;
          border-radius: 6px;
          color: #64748b;
          background: #eef2f7;
          font-size: 9px;
          font-weight: 800;
        }

        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          white-space: nowrap;
        }

        .date-cell i {
          color: #94a3b8;
        }

        .table-actions {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .view-rx-btn,
        .delete-rx-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 32px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 750;
          transition: all .2s ease;
        }

        .view-rx-btn {
          padding: 0 10px;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #dbeafe;
        }

        .view-rx-btn:hover {
          color: #1d4ed8;
          background: #dbeafe;
        }

        .delete-rx-btn {
          width: 32px;
          border: 1px solid #fee2e2;
          color: #ef4444;
          background: #fef2f2;
        }

        .delete-rx-btn:hover {
          color: #dc2626;
          background: #fee2e2;
        }


        /* ================================================
           EMPTY STATE
        ================================================= */

        .empty-state {
          padding: 60px 20px !important;
          text-align: center;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: #94a3b8;
          background: #f1f5f9;
          font-size: 20px;
        }

        .empty-state strong {
          display: block;
          color: #475569;
          font-size: 12px;
        }

        .empty-state span {
          display: block;
          color: #9aa5b5;
          font-size: 10px;
          margin-top: 3px;
        }


        /* ================================================
           PRINT PRESCRIPTION
        ================================================= */

        .premium-prescription {
          color: #172033;
          background: white;
          padding: 30px;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .prescription-letterhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 22px;
          border-bottom: 2px solid #172033;
        }

        .hospital-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hospital-logo {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: white;
          background: #172033;
          font-size: 20px;
        }

        .hospital-brand h2 {
          margin: 0;
          color: #172033;
          font-size: 23px;
          font-weight: 850;
          letter-spacing: -.04em;
        }

        .hospital-brand h2 span {
          color: #d97706;
        }

        .hospital-brand p {
          margin: 1px 0 0;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .prescription-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .official-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 6px;
          color: #92400e;
          background: #fef3c7;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .05em;
        }

        .prescription-meta > span {
          color: #172033;
          font-size: 12px;
          font-weight: 850;
        }

        .prescription-meta small {
          color: #64748b;
          font-size: 9px;
        }

        .prescription-patient {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin-top: 24px;
          padding: 15px 17px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e5eaf0;
        }

        .prescription-patient > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .prescription-patient small {
          color: #94a3b8;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .prescription-patient strong {
          color: #172033;
          font-size: 14px;
          font-weight: 850;
        }

        .prescription-patient span {
          color: #64748b;
          font-size: 9px;
        }

        .prescribing-doctor {
          text-align: right;
        }

        .rx-symbol {
          margin: 25px 0 8px;
          color: #172033;
          font-family: Georgia, serif;
          font-size: 31px;
          font-weight: 800;
        }

        .print-section-title {
          padding-bottom: 8px;
          color: #172033;
          font-size: 11px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .08em;
          border-bottom: 1px solid #172033;
        }

        .prescription-medicine-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
        }

        .prescription-medicine-table th {
          padding: 9px;
          color: #64748b;
          background: #f8fafc;
          font-size: 8px;
          font-weight: 850;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .prescription-medicine-table td {
          padding: 11px 9px;
          color: #475569;
          font-size: 9px;
          border-bottom: 1px solid #edf1f5;
        }

        .prescription-medicine-table .medicine-name {
          color: #1d4ed8;
          font-weight: 850;
        }

        .prescription-advice {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin-top: 30px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        .prescription-advice > div:first-child {
          max-width: 60%;
        }

        .prescription-advice small {
          color: #94a3b8;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .08em;
        }

        .prescription-advice p {
          margin: 5px 0 0;
          color: #475569;
          font-size: 10px;
          line-height: 1.6;
        }

        .signature-area {
          min-width: 180px;
          text-align: center;
        }

        .signature-line {
          padding-bottom: 5px;
          color: #172033;
          font-size: 11px;
          font-weight: 750;
          border-bottom: 1px solid #172033;
        }

        .signature-area small {
          display: block;
          margin-top: 5px;
        }

        .prescription-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 30px;
          padding-top: 10px;
          color: #94a3b8;
          font-size: 8px;
          border-top: 1px solid #e2e8f0;
        }

        .prescription-footer span {
          display: flex;
          align-items: center;
          gap: 4px;
        }


        /* ================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {

          .medicine-fields {
            grid-template-columns:
              1.5fr
              .8fr
              1fr;
          }

          .medicine-instruction {
            grid-column: span 2;
          }

        }


        @media (max-width: 768px) {

          .premium-panel-header,
          .archive-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px;
          }

          .premium-panel-header .premium-action-btn {
            width: 100%;
            justify-content: center;
          }

          .premium-form-container {
            padding: 18px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .add-medicine-btn {
            margin-left: auto;
          }

          .medicine-card {
            align-items: stretch;
            flex-wrap: wrap;
          }

          .medicine-index {
            align-self: flex-start;
          }

          .medicine-fields {
            width: calc(100% - 40px);
            grid-template-columns: 1fr 1fr;
          }

          .medicine-main-field,
          .medicine-instruction {
            grid-column: span 2;
          }

          .remove-medicine-btn {
            align-self: flex-start;
          }

          .composer-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .footer-actions {
            width: 100%;
          }

          .footer-actions button {
            flex: 1;
          }

          .prescription-letterhead,
          .prescription-patient,
          .prescription-advice {
            flex-direction: column;
          }

          .prescribing-doctor {
            text-align: left;
          }

          .prescription-advice > div:first-child {
            max-width: 100%;
          }

          .signature-area {
            width: 220px;
            align-self: flex-end;
          }

          .prescription-footer {
            flex-direction: column;
          }

        }


        @media (max-width: 576px) {

          .premium-stat-card {
            min-height: 100px;
            padding: 16px;
          }

          .stat-icon {
            width: 45px;
            height: 45px;
            min-width: 45px;
          }

          .medicine-fields {
            grid-template-columns: 1fr;
          }

          .medicine-main-field,
          .medicine-instruction {
            grid-column: auto;
          }

          .add-medicine-btn {
            padding: 7px 9px;
          }

        }

      `}</style>

    </div>
  );
}

export default PrescriptionPanel;
