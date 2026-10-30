import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DoctorService from '../../services/DoctorService';
import { toast } from 'react-toastify';
import { springSmooth, springSnappy } from '../../animations/motionConfig';

function DoctorForm({ onDoctorAdded }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initialDoctor = {
    name: '',
    specialty: '',
    qualification: 'MD',
    experience: '',
    contactNumber: '',
    email: '',
    availability: 'Available',
    department: 'General Medicine'
  };

  const [doctor, setDoctor] = useState(initialDoctor);

  const departments = [
    'General Medicine',
    'Cardiology',
    'General Surgery',
    'Pediatrics',
    'Internal Medicine',
    'Neurology',
    'Orthopedics',
    'Dermatology'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDoctor((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;

    setDoctor((prev) => ({
      ...prev,
      department: value,
      specialty: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = doctor.name.trim();

    if (!cleanName) {
      toast.warning('Please enter the specialist name.');
      return;
    }

    const formattedName = cleanName.toLowerCase().startsWith('dr.')
      ? cleanName
      : `Dr. ${cleanName}`;

    const payload = {
      ...doctor,
      name: formattedName,
      specialty: doctor.specialty || doctor.department,
      experience: doctor.experience
        ? `${doctor.experience} Yrs`
        : '1 Yr'
    };

    try {
      await DoctorService.createDoctor(payload);

      toast.success(`${formattedName} registered successfully! 🩺`);

      setDoctor(initialDoctor);
      setIsExpanded(false);

      if (onDoctorAdded) {
        onDoctorAdded();
      }
    } catch (error) {
      console.error('Doctor registration error:', error);
      toast.error('Failed to register specialist.');
    }
  };

  const handleCancel = () => {
    setDoctor(initialDoctor);
    setIsExpanded(false);
  };

  return (
    <>
      <div className="doctor-form-card">

        {/* =========================================
            HEADER
        ========================================== */}
        <div
          className={`doctor-form-header ${isExpanded ? 'is-open' : ''
            }`}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <div className="doctor-header-content">

            <div className="doctor-header-icon">
              <i className="bi bi-person-badge-fill"></i>

              <span className="icon-status-dot"></span>
            </div>

            <div className="doctor-header-copy">

              <div className="doctor-eyebrow">
                <span className="eyebrow-dot"></span>
                Medical Staff Registry
              </div>

              <h5>
                Register Medical Specialist
              </h5>

              <p>
                Onboard physicians, surgeons, specialists and
                department leads.
              </p>

            </div>

          </div>

          <button
            type="button"
            className={`doctor-toggle ${isExpanded ? 'doctor-toggle-close' : ''
              }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
          >
            <i
              className={`bi ${isExpanded
                  ? 'bi-chevron-up'
                  : 'bi-plus-lg'
                }`}
            ></i>

            <span className="d-none d-sm-inline">
              {isExpanded
                ? 'Close Form'
                : 'Register Specialist'}
            </span>
          </button>

        </div>

        {/* =========================================
            FORM
        ========================================== */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="doctor-form-body overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springSmooth}
            >

            <form onSubmit={handleSubmit}>

              {/* FORM INTRO */}
              <div className="form-intro">

                <div className="form-intro-icon">
                  <i className="bi bi-clipboard2-pulse"></i>
                </div>

                <div>
                  <h6>
                    Professional Profile
                  </h6>

                  <p>
                    Enter the specialist's credentials,
                    department and contact information.
                  </p>
                </div>

                <div className="required-note ms-auto">
                  <span>*</span> Required fields
                </div>

              </div>

              {/* =====================================
                  PROFESSIONAL INFORMATION
              ====================================== */}
              <div className="form-section">

                <div className="section-heading">
                  <div className="section-number">
                    01
                  </div>

                  <div>
                    <h6>
                      Professional Information
                    </h6>

                    <p>
                      Specialist identity and clinical credentials
                    </p>
                  </div>
                </div>

                <div className="row g-3">

                  {/* NAME */}
                  <div className="col-12 col-lg-5">
                    <label className="premium-label">
                      Doctor Full Name
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-person-badge"></i>
                      </div>

                      <input
                        type="text"
                        className="premium-input"
                        name="name"
                        placeholder="e.g. Gregory House"
                        value={doctor.name}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                  {/* DEPARTMENT */}
                  <div className="col-12 col-md-6 col-lg-4">
                    <label className="premium-label">
                      Department
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-hospital"></i>
                      </div>

                      <select
                        className="premium-input premium-select"
                        name="department"
                        value={doctor.department}
                        onChange={handleDepartmentChange}
                        required
                      >
                        {departments.map((department) => (
                          <option
                            key={department}
                            value={department}
                          >
                            {department}
                          </option>
                        ))}
                      </select>

                      <i className="bi bi-chevron-down select-arrow"></i>

                    </div>
                  </div>

                  {/* QUALIFICATION */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="premium-label">
                      Qualification
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-award"></i>
                      </div>

                      <input
                        type="text"
                        className="premium-input"
                        name="qualification"
                        placeholder="MD, FACS"
                        value={doctor.qualification}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                  {/* EXPERIENCE */}
                  <div className="col-12 col-md-4">
                    <label className="premium-label">
                      Years of Experience
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-clock-history"></i>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="60"
                        className="premium-input"
                        name="experience"
                        placeholder="e.g. 10"
                        value={doctor.experience}
                        onChange={handleChange}
                        required
                      />

                      <span className="input-suffix">
                        yrs
                      </span>

                    </div>
                  </div>

                  {/* SPECIALTY */}
                  <div className="col-12 col-md-4">
                    <label className="premium-label">
                      Clinical Specialty
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-heart-pulse"></i>
                      </div>

                      <input
                        type="text"
                        className="premium-input"
                        name="specialty"
                        placeholder="e.g. Interventional Cardiology"
                        value={doctor.specialty}
                        onChange={handleChange}
                      />

                    </div>
                  </div>

                  {/* AVAILABILITY */}
                  <div className="col-12 col-md-4">
                    <label className="premium-label">
                      Initial Duty Status
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div
                        className={`premium-input-icon status-icon ${doctor.availability === 'Available'
                            ? 'available'
                            : doctor.availability === 'In Surgery'
                              ? 'surgery'
                              : 'offline'
                          }`}
                      >
                        <i className="bi bi-circle-fill"></i>
                      </div>

                      <select
                        className="premium-input premium-select"
                        name="availability"
                        value={doctor.availability}
                        onChange={handleChange}
                        required
                      >
                        <option value="Available">
                          Available
                        </option>

                        <option value="In Surgery">
                          In Surgery
                        </option>

                        <option value="Off Duty">
                          Off Duty
                        </option>
                      </select>

                      <i className="bi bi-chevron-down select-arrow"></i>

                    </div>
                  </div>

                </div>

              </div>

              {/* =====================================
                  CONTACT INFORMATION
              ====================================== */}
              <div className="form-section">

                <div className="section-heading">
                  <div className="section-number section-number-blue">
                    02
                  </div>

                  <div>
                    <h6>
                      Contact Information
                    </h6>

                    <p>
                      Official communication details for this specialist
                    </p>
                  </div>
                </div>

                <div className="row g-3">

                  {/* PHONE */}
                  <div className="col-12 col-lg-6">
                    <label className="premium-label">
                      Contact Phone
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-telephone"></i>
                      </div>

                      <input
                        type="tel"
                        className="premium-input"
                        name="contactNumber"
                        placeholder="+91 98765 43210"
                        value={doctor.contactNumber}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="col-12 col-lg-6">
                    <label className="premium-label">
                      Official Email
                      <span>*</span>
                    </label>

                    <div className="premium-input-group">

                      <div className="premium-input-icon">
                        <i className="bi bi-envelope"></i>
                      </div>

                      <input
                        type="email"
                        className="premium-input"
                        name="email"
                        placeholder="doctor@hospital.com"
                        value={doctor.email}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                </div>

              </div>

              {/* =====================================
                  FOOTER
              ====================================== */}
              <div className="form-footer">

                <div className="security-message">

                  <div className="security-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div>
                    <strong>
                      Secure staff registration
                    </strong>

                    <span>
                      Specialist information is stored securely.
                    </span>
                  </div>

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-btn"
                  >
                    <i className="bi bi-check2-circle"></i>
                    Add Specialist
                  </button>

                </div>

              </div>

            </form>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* =========================================
          COMPONENT STYLES
      ========================================== */}
      <style>
        {`
    .doctor-form-card {
      --purple: #8b5cf6;
      --purple-dark: #7c3aed;
      --purple-deep: #6d28d9;
      --purple-light: #f5f3ff;
      --purple-soft: #ede9fe;
      --purple-border: #ddd6fe;

      --text: #172033;
      --text-soft: #475569;
      --muted: #94a3b8;
      --border: #e7e2f0;
      --surface: #ffffff;

      position: relative;
      overflow: hidden;
      margin-bottom: 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 22px;

      box-shadow:
        0 2px 4px rgba(76, 29, 149, .025),
        0 10px 30px rgba(76, 29, 149, .055),
        0 30px 70px rgba(76, 29, 149, .035);
    }

    /* =========================================
       TOP ACCENT
    ========================================== */

    .doctor-form-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;

      background: linear-gradient(
        90deg,
        #a78bfa,
        #8b5cf6,
        #c4b5fd
      );
    }

    /* =========================================
       HEADER
    ========================================== */

    .doctor-form-header {
      min-height: 92px;
      padding: 19px 22px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 18px;
      cursor: pointer;

      background:
        radial-gradient(
          circle at 85% 10%,
          rgba(139, 92, 246, .08),
          transparent 28%
        ),
        linear-gradient(
          135deg,
          #ffffff 0%,
          #fcfaff 50%,
          #f8f5ff 100%
        );

      transition:
        background .25s ease,
        box-shadow .25s ease;
    }

    .doctor-form-header:hover {
      background:
        radial-gradient(
          circle at 85% 10%,
          rgba(139, 92, 246, .11),
          transparent 28%
        ),
        linear-gradient(
          135deg,
          #ffffff 0%,
          #f8f5ff 100%
        );
    }

    .doctor-form-header.is-open {
      border-bottom: 1px solid var(--border);
    }

    /* =========================================
       HEADER CONTENT
    ========================================== */

    .doctor-header-content {
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 0;
    }

    /* =========================================
       HEADER ICON
    ========================================== */

    .doctor-header-icon {
      position: relative;

      width: 52px;
      height: 52px;
      min-width: 52px;

      border-radius: 16px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: var(--purple);
      font-size: 21px;

      background:
        linear-gradient(
          135deg,
          #f5f3ff,
          #ede9fe
        );

      border: 1px solid var(--purple-border);

      box-shadow:
        0 7px 18px rgba(139, 92, 246, .13);
    }

    .icon-status-dot {
      position: absolute;

      width: 9px;
      height: 9px;

      right: -2px;
      top: -2px;

      border-radius: 50%;

      background: #8b5cf6;

      border: 2px solid #fff;

      box-shadow:
        0 2px 5px rgba(139, 92, 246, .3);
    }

    /* =========================================
       HEADER TEXT
    ========================================== */

    .doctor-header-copy {
      min-width: 0;
    }

    .doctor-eyebrow {
      display: flex;
      align-items: center;

      gap: 6px;
      margin-bottom: 3px;

      color: var(--purple);

      font-size: 9px;
      font-weight: 800;

      letter-spacing: 1.25px;
      text-transform: uppercase;
    }

    .eyebrow-dot {
      width: 5px;
      height: 5px;

      border-radius: 50%;

      background: #8b5cf6;
    }

    .doctor-header-copy h5 {
      margin: 0 0 3px;

      color: var(--text);

      font-size: 16px;
      font-weight: 800;

      letter-spacing: -.35px;
    }

    .doctor-header-copy p {
      margin: 0;

      color: #8290a3;

      font-size: 11.5px;
    }

    /* =========================================
       TOGGLE BUTTON
    ========================================== */

    .doctor-toggle {
      min-height: 39px;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      gap: 7px;

      padding: 9px 14px;

      border: 0;
      border-radius: 11px;

      color: #fff;

      background:
        linear-gradient(
          135deg,
          #a78bfa,
          #8b5cf6
        );

      font-size: 11.5px;
      font-weight: 750;

      box-shadow:
        0 7px 18px rgba(139, 92, 246, .24);

      transition: all .2s ease;
    }

    .doctor-toggle:hover {
      color: #fff;

      transform: translateY(-1px);

      background:
        linear-gradient(
          135deg,
          #8b5cf6,
          #7c3aed
        );

      box-shadow:
        0 10px 23px rgba(139, 92, 246, .30);
    }

    .doctor-toggle-close {
      color: #6d28d9;

      background: #faf8ff;

      border: 1px solid #e9dffb;

      box-shadow: none;
    }

    .doctor-toggle-close:hover {
      color: #6d28d9;

      background: #f5f3ff;

      border-color: #c4b5fd;

      box-shadow: none;
    }

    /* =========================================
       BODY
    ========================================== */

    .doctor-form-body {
      padding: 25px;

      background:
        linear-gradient(
          180deg,
          #faf9ff 0%,
          #ffffff 100%
        );
    }

    /* =========================================
       FORM INTRO
    ========================================== */

    .form-intro {
      display: flex;
      align-items: center;

      gap: 11px;

      margin-bottom: 24px;
      padding: 13px 15px;

      border: 1px solid #e9e3f2;
      border-radius: 14px;

      background: rgba(255,255,255,.88);

      box-shadow:
        0 2px 8px rgba(76,29,149,.025);
    }

    .form-intro-icon {
      width: 35px;
      height: 35px;
      min-width: 35px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;

      color: var(--purple);

      background: #f5f3ff;

      border: 1px solid #e9dffb;
    }

    .form-intro h6 {
      margin: 0 0 2px;

      color: #1e293b;

      font-size: 12px;
      font-weight: 800;
    }

    .form-intro p {
      margin: 0;

      color: #94a3b8;

      font-size: 10.5px;
    }

    .required-note {
      color: #94a3b8;

      font-size: 10px;

      white-space: nowrap;
    }

    .required-note span,
    .premium-label span {
      color: #ef4444;

      margin-left: 3px;
    }

    /* =========================================
       FORM SECTION
    ========================================== */

    .form-section {
      padding: 19px;

      margin-bottom: 17px;

      border: 1px solid #e9e3f2;
      border-radius: 16px;

      background: rgba(255,255,255,.82);

      box-shadow:
        0 2px 7px rgba(76,29,149,.02);
    }

    /* =========================================
       SECTION HEADING
    ========================================== */

    .section-heading {
      display: flex;
      align-items: center;

      gap: 10px;

      margin-bottom: 17px;
    }

    .section-number {
      width: 30px;
      height: 30px;
      min-width: 30px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;

      color: #7c3aed;

      background: #f5f3ff;

      border: 1px solid #ddd6fe;

      font-size: 9px;
      font-weight: 900;

      letter-spacing: .4px;
    }

    .section-number-blue {
      color: #7c3aed;

      background: #faf5ff;

      border-color: #e9d5ff;
    }

    .section-heading h6 {
      margin: 0 0 2px;

      color: #1e293b;

      font-size: 12px;
      font-weight: 800;
    }

    .section-heading p {
      margin: 0;

      color: #94a3b8;

      font-size: 10px;
    }

    /* =========================================
       LABELS
    ========================================== */

    .premium-label {
      display: block;

      margin-bottom: 7px;

      color: #475569;

      font-size: 10.5px;
      font-weight: 750;

      letter-spacing: .15px;
    }

    /* =========================================
       INPUT GROUP
    ========================================== */

    .premium-input-group {
      position: relative;

      display: flex;
      align-items: center;

      width: 100%;
      height: 44px;

      overflow: hidden;

      border: 1px solid #e4deed;
      border-radius: 11px;

      background: #fff;

      transition: all .2s ease;
    }

    .premium-input-group:hover {
      border-color: #c4b5fd;
    }

    .premium-input-group:focus-within {
      border-color: #a78bfa;

      box-shadow:
        0 0 0 3px rgba(139,92,246,.10),
        0 4px 12px rgba(76,29,149,.035);
    }

    /* =========================================
       INPUT ICON
    ========================================== */

    .premium-input-icon {
      width: 43px;
      min-width: 43px;

      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      color: #9b8fad;

      background: #faf9fc;

      border-right: 1px solid #eeeaf3;

      font-size: 13px;

      transition:
        color .2s ease,
        background .2s ease;
    }

    .premium-input-group:focus-within
    .premium-input-icon {
      color: var(--purple);

      background: #f7f3ff;
    }

    /* =========================================
       INPUT
    ========================================== */

    .premium-input {
      width: 100%;
      min-width: 0;

      height: 100%;

      padding: 0 12px;

      border: 0;
      outline: 0;

      color: #1e293b;

      background: transparent;

      font-size: 12px;
    }

    .premium-input::placeholder {
      color: #a6b1c0;
    }

    .premium-input:focus {
      outline: none;
      box-shadow: none;
    }

    /* =========================================
       SELECT
    ========================================== */

    .premium-select {
      appearance: none;

      padding-right: 34px;

      cursor: pointer;
    }

    .select-arrow {
      position: absolute;

      right: 12px;

      color: #9b8fad;

      font-size: 10px;

      pointer-events: none;
    }

    /* =========================================
       INPUT SUFFIX
    ========================================== */

    .input-suffix {
      padding-right: 12px;

      color: #9b8fad;

      font-size: 10px;
      font-weight: 700;
    }

    /* =========================================
       STATUS COLORS
    ========================================== */

    .status-icon.available {
      color: #8b5cf6;
    }

    .status-icon.surgery {
      color: #f59e0b;
    }

    .status-icon.offline {
      color: #94a3b8;
    }

    /* =========================================
       FOOTER
    ========================================== */

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 18px;

      padding-top: 19px;

      border-top: 1px solid #e9e3f2;
    }

    /* =========================================
       SECURITY
    ========================================== */

    .security-message {
      display: flex;
      align-items: center;

      gap: 9px;
    }

    .security-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;

      color: var(--purple);

      background: #f5f3ff;

      border: 1px solid #e9dffb;

      font-size: 14px;
    }

    .security-message strong,
    .security-message span {
      display: block;
    }

    .security-message strong {
      color: #475569;

      font-size: 10.5px;
      font-weight: 750;
    }

    .security-message span {
      margin-top: 1px;

      color: #a0aabd;

      font-size: 9.5px;
    }

    /* =========================================
       ACTIONS
    ========================================== */

    .form-actions {
      display: flex;
      align-items: center;

      gap: 8px;
    }

    .cancel-btn,
    .submit-btn {
      min-height: 40px;

      padding: 9px 17px;

      border-radius: 10px;

      font-size: 11.5px;
      font-weight: 750;

      transition: all .2s ease;
    }

    /* CANCEL */

    .cancel-btn {
      border: 1px solid #e4deed;

      color: #64748b;

      background: #fff;
    }

    .cancel-btn:hover {
      color: #7c3aed;

      background: #f5f3ff;

      border-color: #c4b5fd;
    }

    /* SUBMIT */

    .submit-btn {
      display: inline-flex;
      align-items: center;

      gap: 7px;

      border: 0;

      color: #fff;

      background:
        linear-gradient(
          135deg,
          #a78bfa,
          #8b5cf6
        );

      box-shadow:
        0 7px 18px rgba(139,92,246,.24);
    }

    .submit-btn:hover {
      color: #fff;

      transform: translateY(-1px);

      background:
        linear-gradient(
          135deg,
          #8b5cf6,
          #7c3aed
        );

      box-shadow:
        0 10px 23px rgba(139,92,246,.32);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    /* =========================================
       RESPONSIVE
    ========================================== */

    @media (max-width: 767px) {

      .doctor-form-card {
        border-radius: 17px;
      }

      .doctor-form-header {
        padding: 16px;
      }

      .doctor-header-icon {
        width: 46px;
        height: 46px;
        min-width: 46px;

        border-radius: 13px;

        font-size: 18px;
      }

      .doctor-header-copy h5 {
        font-size: 14px;
      }

      .doctor-header-copy p {
        font-size: 10px;
      }

      .doctor-form-body {
        padding: 17px;
      }

      .form-intro {
        align-items: flex-start;
      }

      .required-note {
        display: none;
      }

      .form-section {
        padding: 15px;
      }

      .form-footer {
        align-items: stretch;

        flex-direction: column;
      }

      .security-message {
        width: 100%;
      }

      .form-actions {
        width: 100%;
      }

      .cancel-btn,
      .submit-btn {
        flex: 1;
      }
    }

    /* =========================================
       SMALL MOBILE
    ========================================== */

    @media (max-width: 575px) {

      .doctor-header-content {
        gap: 10px;
      }

      .doctor-header-icon {
        width: 42px;
        height: 42px;
        min-width: 42px;
      }

      .doctor-eyebrow {
        font-size: 8px;
      }

      .doctor-header-copy h5 {
        font-size: 13px;
      }

      .doctor-header-copy p {
        display: none;
      }

      .doctor-toggle {
        width: 38px;
        height: 38px;

        min-height: 38px;

        padding: 0;
      }
    }
  `}
      </style>
    </>
  );
}

export default DoctorForm;
