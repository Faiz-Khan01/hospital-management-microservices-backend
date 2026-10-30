import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PatientService from '../../services/PatientService';
import { toast } from 'react-toastify';
import { springSmooth, springSnappy } from '../../animations/motionConfig';

function PatientForm({ onPatientAdded }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialPatient = {
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    contactNumber: '',
    address: '',
    disease: '',
    status: 'Admitted',
    medicalHistory: ''
  };

  const [patient, setPatient] = useState(initialPatient);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPatient((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...patient,
      age: parseInt(patient.age, 10) || 0
    };

    try {
      setIsSubmitting(true);

      await PatientService.createPatient(payload);

      toast.success(`Patient ${patient.name} registered successfully!`);

      setPatient(initialPatient);
      setIsExpanded(false);

      if (onPatientAdded) {
        onPatientAdded();
      }
    } catch (error) {
      console.error('Failed to create patient:', error);
      toast.error('Failed to register patient record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setPatient(initialPatient);
    setIsExpanded(false);
  };

  return (
    <>
      <style>{`
        .premium-patient-wrapper {
          --ink: #0f172a;
          --ink-soft: #334155;
          --muted: #64748b;
          --muted-light: #94a3b8;

          --indigo: #4f46e5;
          --indigo-dark: #3730a3;
          --indigo-light: #eef2ff;

          --teal: #0f766e;
          --teal-light: #ecfdf5;

          --border: #e2e8f0;
          --border-soft: #edf2f7;

          --surface: #ffffff;
          --surface-soft: #f8fafc;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =========================
           MAIN CARD
        ========================= */

        .patient-premium-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, .9);
          border-radius: 28px;
          background: rgba(255, 255, 255, .96);
          box-shadow:
            0 2px 5px rgba(15, 23, 42, .025),
            0 12px 30px rgba(15, 23, 42, .045),
            0 30px 70px rgba(15, 23, 42, .045);
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .patient-premium-card::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          top: -190px;
          right: -80px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(99, 102, 241, .12),
              rgba(99, 102, 241, 0) 70%
            );
          pointer-events: none;
        }

        /* =========================
           HEADER
        ========================= */

        .patient-premium-header {
          position: relative;
          padding: 25px 28px;
          cursor: pointer;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(99, 102, 241, .09),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fafbff 55%,
              #f8fafc 100%
            );
        }

        .patient-premium-header::after {
          content: "";
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #e2e8f0 15%,
              #e2e8f0 85%,
              transparent
            );
        }

        .patient-brand {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .patient-brand-icon {
          position: relative;
          width: 56px;
          height: 56px;
          flex: 0 0 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          color: white;
          background:
            linear-gradient(
              145deg,
              #4338ca,
              #6366f1 55%,
              #818cf8
            );
          box-shadow:
            0 12px 25px rgba(79, 70, 229, .24),
            inset 0 1px 0 rgba(255,255,255,.3);
        }

        .patient-brand-icon::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.2);
        }

        .patient-brand-icon i {
          position: relative;
          z-index: 1;
          font-size: 22px;
        }

        .patient-eyebrow {
          margin-bottom: 4px;
          color: #6366f1;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .patient-title {
          margin: 0;
          color: var(--ink);
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.025em;
        }

        .patient-subtitle {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .new-patient-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 42px;
          padding: 0 16px;
          border: 1px solid #dbe1eb;
          border-radius: 13px;
          background: rgba(255,255,255,.9);
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          box-shadow:
            0 4px 10px rgba(15,23,42,.04),
            inset 0 1px 0 rgba(255,255,255,.8);
          transition: all .22s ease;
        }

        .new-patient-btn:hover {
          color: var(--indigo);
          border-color: #c7d2fe;
          background: #f8faff;
          transform: translateY(-2px);
          box-shadow:
            0 8px 18px rgba(79,70,229,.10);
        }

        .new-patient-btn.active {
          color: #475569;
          background: #f8fafc;
        }

        /* =========================
           FORM BODY
        ========================= */

        .patient-premium-body {
          padding: 28px;
          background:
            linear-gradient(
              180deg,
              #f8fafc 0%,
              #f6f8fc 100%
            );
        }

        .form-section-card {
          position: relative;
          padding: 21px;
          margin-bottom: 18px;
          border: 1px solid rgba(226,232,240,.95);
          border-radius: 20px;
          background: rgba(255,255,255,.86);
          box-shadow:
            0 4px 14px rgba(15,23,42,.025),
            inset 0 1px 0 rgba(255,255,255,.8);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 20px;
        }

        .section-icon {
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: var(--indigo);
          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #e0e7ff
            );
          border: 1px solid #dfe5ff;
          box-shadow:
            0 5px 12px rgba(79,70,229,.07);
        }

        .section-title {
          color: var(--ink-soft);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .section-description {
          margin-top: 2px;
          color: var(--muted-light);
          font-size: 10px;
        }

        .section-line {
          flex: 1;
          height: 1px;
          margin-left: 5px;
          background:
            linear-gradient(
              90deg,
              #e2e8f0,
              transparent
            );
        }

        /* =========================
           LABELS
        ========================= */

        .premium-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .035em;
        }

        .required-mark {
          color: #ef4444;
          margin-left: 2px;
        }

        /* =========================
           INPUTS
        ========================= */

        .premium-field {
          position: relative;
        }

        .premium-input,
        .premium-select {
          width: 100%;
          min-height: 46px;
          border: 1px solid #dce3ed !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          color: #172033 !important;
          font-size: 12px !important;
          font-weight: 600;
          box-shadow:
            0 2px 5px rgba(15,23,42,.025);
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .premium-input {
          padding-left: 48px !important;
        }

        .premium-input::placeholder {
          color: #a5afbf;
          font-weight: 500;
        }

        .premium-input:hover,
        .premium-select:hover {
          border-color: #cbd5e1 !important;
        }

        .premium-input:focus,
        .premium-select:focus {
          outline: none;
          border-color: #818cf8 !important;
          background: #ffffff !important;
          box-shadow:
            0 0 0 4px rgba(99,102,241,.09),
            0 7px 18px rgba(15,23,42,.035) !important;
        }

        .premium-input-icon {
          position: absolute;
          z-index: 2;
          left: 1px;
          top: 1px;
          bottom: 1px;
          width: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px 0 0 11px;
          color: #818cf8;
          background:
            linear-gradient(
              180deg,
              #fafbff,
              #f8faff
            );
          pointer-events: none;
        }

        .premium-input-icon i {
          font-size: 14px;
        }

        .premium-select {
          padding-left: 13px !important;
          font-weight: 700;
          cursor: pointer;
        }

        .status-select {
          color: #0f766e !important;
        }

        /* =========================
           STATUS COLORS
        ========================= */

        .status-select option[value="Admitted"] {
          color: #047857;
        }

        .status-select option[value="Outpatient"] {
          color: #2563eb;
        }

        .status-select option[value="Discharged"] {
          color: #64748b;
        }

        /* =========================
           FOOTER
        ========================= */

        .premium-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 19px 2px 2px;
        }

        .security-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border: 1px solid #dcefe8;
          border-radius: 10px;
          color: #64748b;
          background: #f5fbf8;
          font-size: 10px;
          font-weight: 700;
        }

        .security-pill i {
          color: #10b981;
          font-size: 13px;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .cancel-btn,
        .register-btn {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          transition: all .22s ease;
        }

        .cancel-btn {
          border: 1px solid #dce3ec;
          background: white;
          color: #64748b;
        }

        .cancel-btn:hover {
          color: #334155;
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .register-btn {
          position: relative;
          overflow: hidden;
          border: 0;
          color: white;
          background:
            linear-gradient(
              135deg,
              #4338ca,
              #4f46e5 50%,
              #6366f1
            );
          box-shadow:
            0 9px 20px rgba(79,70,229,.23),
            inset 0 1px 0 rgba(255,255,255,.22);
        }

        .register-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100%;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.16),
              transparent
            );
          transform: skewX(-20deg);
          transition: left .6s ease;
        }

        .register-btn:hover::before {
          left: 140%;
        }

        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 13px 27px rgba(79,70,229,.30),
            inset 0 1px 0 rgba(255,255,255,.22);
        }

        .register-btn:active {
          transform: translateY(0);
        }

        .register-btn:disabled {
          opacity: .7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: white;
          border-radius: 50%;
          animation: patient-spin .7s linear infinite;
        }

        @keyframes patient-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 768px) {
          .patient-premium-header {
            padding: 20px;
          }

          .patient-premium-body {
            padding: 17px;
          }

          .patient-brand-icon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            border-radius: 15px;
          }

          .patient-title {
            font-size: 15px;
          }

          .patient-subtitle {
            display: none;
          }

          .new-patient-btn {
            min-height: 38px;
            padding: 0 12px;
          }

          .form-section-card {
            padding: 16px;
            border-radius: 17px;
          }

          .section-line {
            display: none;
          }

          .premium-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .security-pill {
            justify-content: center;
          }

          .footer-actions {
            width: 100%;
          }

          .footer-actions button {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .patient-brand {
            gap: 10px;
          }

          .patient-brand-icon {
            width: 44px;
            height: 44px;
            flex-basis: 44px;
          }

          .new-patient-btn span {
            display: none;
          }

          .new-patient-btn {
            width: 40px;
            justify-content: center;
            padding: 0;
          }
        }
      `}</style>

      <div className="premium-patient-wrapper">
        <div className="patient-premium-card mb-4">

          {/* ================================
              HEADER
          ================================= */}
          <div
            className="patient-premium-header"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <div className="d-flex align-items-center justify-content-between gap-3">

              <div className="patient-brand">

                <div className="patient-brand-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>

                <div>
                  <div className="patient-eyebrow">
                    Clinical Registry
                  </div>

                  <h5 className="patient-title">
                    Patient Registration
                  </h5>

                  <div className="patient-subtitle">
                    Create and securely register a new patient record
                  </div>
                </div>

              </div>

              <button
                type="button"
                className={`new-patient-btn ${
                  isExpanded ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
              >
                <i
                  className={
                    isExpanded
                      ? 'bi bi-chevron-up'
                      : 'bi bi-plus-lg'
                  }
                />

                <span>
                  {isExpanded ? 'Close Form' : 'New Patient'}
                </span>
              </button>

            </div>
          </div>

          {/* ================================
              FORM
          ================================= */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="patient-premium-body overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springSmooth}
              >

              <form onSubmit={handleSubmit}>

                {/* ============================
                    PATIENT INFORMATION
                ============================= */}
                <div className="form-section-card">

                  <div className="section-header">

                    <div className="section-icon">
                      <i className="bi bi-person-vcard"></i>
                    </div>

                    <div>
                      <div className="section-title">
                        Patient Information
                      </div>

                      <div className="section-description">
                        Basic demographic and admission details
                      </div>
                    </div>

                    <div className="section-line" />

                  </div>

                  <div className="row g-3">

                    {/* Name */}
                    <div className="col-12 col-md-4">

                      <label className="premium-label">
                        <span>
                          Full Patient Name
                          <span className="required-mark">*</span>
                        </span>
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-person"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control premium-input"
                          name="name"
                          value={patient.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                        />

                      </div>

                    </div>

                    {/* Age */}
                    <div className="col-6 col-md-2">

                      <label className="premium-label">
                        Age
                        <span className="required-mark">*</span>
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-calendar3"></i>
                        </span>

                        <input
                          type="number"
                          min="0"
                          max="150"
                          className="form-control premium-input"
                          name="age"
                          value={patient.age}
                          onChange={handleChange}
                          placeholder="Years"
                          required
                        />

                      </div>

                    </div>

                    {/* Gender */}
                    <div className="col-6 col-md-2">

                      <label className="premium-label">
                        Gender
                      </label>

                      <select
                        className="form-select premium-select"
                        name="gender"
                        value={patient.gender}
                        onChange={handleChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>

                    </div>

                    {/* Blood */}
                    <div className="col-6 col-md-2">

                      <label className="premium-label">
                        Blood Group
                      </label>

                      <select
                        className="form-select premium-select"
                        name="bloodGroup"
                        value={patient.bloodGroup}
                        onChange={handleChange}
                      >
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
                            {bg}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Status */}
                    <div className="col-6 col-md-2">

                      <label className="premium-label">
                        Patient Status
                      </label>

                      <select
                        className="form-select premium-select status-select"
                        name="status"
                        value={patient.status}
                        onChange={handleChange}
                      >
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

                {/* ============================
                    CLINICAL INFORMATION
                ============================= */}
                <div className="form-section-card">

                  <div className="section-header">

                    <div className="section-icon">
                      <i className="bi bi-heart-pulse"></i>
                    </div>

                    <div>
                      <div className="section-title">
                        Clinical Information
                      </div>

                      <div className="section-description">
                        Contact, diagnosis and medical background
                      </div>
                    </div>

                    <div className="section-line" />

                  </div>

                  <div className="row g-3">

                    {/* Contact */}
                    <div className="col-12 col-md-4">

                      <label className="premium-label">
                        Contact Number
                        <span className="required-mark">*</span>
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-telephone"></i>
                        </span>

                        <input
                          type="tel"
                          className="form-control premium-input"
                          name="contactNumber"
                          value={patient.contactNumber}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          required
                        />

                      </div>

                    </div>

                    {/* Diagnosis */}
                    <div className="col-12 col-md-8">

                      <label className="premium-label">
                        Current Diagnosis / Symptoms
                        <span className="required-mark">*</span>
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-activity"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control premium-input"
                          name="disease"
                          value={patient.disease}
                          onChange={handleChange}
                          placeholder="e.g. Acute Appendicitis, Type 2 Diabetes"
                          required
                        />

                      </div>

                    </div>

                    {/* Address */}
                    <div className="col-12 col-md-6">

                      <label className="premium-label">
                        Residential Address
                        <span className="required-mark">*</span>
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-geo-alt"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control premium-input"
                          name="address"
                          value={patient.address}
                          onChange={handleChange}
                          placeholder="Street, City, State"
                          required
                        />

                      </div>

                    </div>

                    {/* Medical History */}
                    <div className="col-12 col-md-6">

                      <label className="premium-label">
                        Medical History / Allergies
                      </label>

                      <div className="premium-field">

                        <span className="premium-input-icon">
                          <i className="bi bi-clipboard2-pulse"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control premium-input"
                          name="medicalHistory"
                          value={patient.medicalHistory}
                          onChange={handleChange}
                          placeholder="e.g. Asthma, Penicillin Allergy"
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* ============================
                    FOOTER
                ============================= */}
                <div className="premium-footer">

                  <div className="security-pill">
                    <i className="bi bi-shield-check"></i>
                    <span>
                      Secure clinical data registration
                    </span>
                  </div>

                  <div className="footer-actions">

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="register-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading-spinner me-2" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-2"></i>
                          Register Patient
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </form>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}

export default PatientForm;
