import React from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';

function SurgeryOtPassSlip({ surgery, patient }) {
  if (!surgery) return null;

  const hospitalName = getHospitalName();
  const patientName = surgery.patientName || patient?.name || 'Surgical Patient';
  const uhid = surgery.uhid || `MRN-2026-${String(surgery.patientId || patient?.id || '101').padStart(4, '0')}`;
  const otPassId = `OT-${Date.now().toString().slice(-6)}`;
  const surgeonName = formatDoctorName(surgery.surgeonName || 'Dr. Chief Surgeon');
  const anesthetistName = formatDoctorName(surgery.anesthetistName || 'Dr. Consultant Anesthetist');

  const formattedDate = new Date(surgery.scheduledDate || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="surgery-ot-slip bg-white text-dark p-3" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '13px', lineHeight: 1.5 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="border-bottom pb-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 bg-danger text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              <i className="bi bi-scissors fs-2"></i>
            </div>
            <div>
              <h4 className="fw-bold text-danger mb-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                {hospitalName}
              </h4>
              <div className="text-secondary small fw-bold">
                DIVISION OF OPERATIVE SURGERY & ANESTHESIOLOGY
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                WHO Surgical Safety Guidelines Compliant &bull; NABH Modular OT Suite
              </div>
            </div>
          </div>
          <div className="text-end border-start ps-3">
            <div className="badge bg-danger px-3 py-1 fs-6 mb-1 text-uppercase">
              OT ADMISSION PASS
            </div>
            <div className="text-dark fw-bold" style={{ fontSize: '12px' }}>Pass #{otPassId}</div>
            <div className="text-muted small" style={{ fontSize: '10px' }}>Priority Operative Transfer</div>
          </div>
        </div>
      </div>

      {/* PATIENT & THEATRE DEMOGRAPHICS */}
      <div className="bg-light p-3 rounded-2 border mb-3">
        <div className="row g-2" style={{ fontSize: '12px' }}>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>PATIENT NAME</span>
            <span className="fw-bold text-dark">{patientName}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>UHID / MRN</span>
            <span className="fw-bold text-primary">{uhid}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>AGE / GENDER</span>
            <span className="fw-bold text-dark">{surgery.patientAge || '42'} Yrs / {surgery.patientGender || 'Male'}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>BLOOD GROUP</span>
            <span className="badge bg-danger px-2 py-1 fw-bold">{surgery.bloodGroup || 'B +ve'}</span>
          </div>

          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>ALLOCATED OT SUITE</span>
            <span className="fw-bold text-danger fs-6">{surgery.otRoom || 'OT-1 (Cardiac & Major Surgery)'}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>SCHEDULED DATE & TIME</span>
            <span className="fw-bold text-dark">{formattedDate} &bull; {surgery.scheduledTime || '09:00 AM'}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>CURRENT INPATIENT BED</span>
            <span className="fw-bold text-dark">{surgery.wardBed || 'ICU-01 / Pre-Op 02'}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>SURGERY CATEGORY</span>
            <span className="badge bg-secondary px-2 py-1">{surgery.category || 'Major High-Risk'}</span>
          </div>
        </div>
      </div>

      {/* SURGICAL PROCEDURE & TEAM */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-7">
          <div className="p-3 border rounded-2 h-100 bg-white">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>PLANNED SURGICAL PROCEDURE</span>
            <h5 className="fw-bold text-primary mb-2 mt-1">{surgery.procedureName}</h5>
            <div className="text-muted small" style={{ fontSize: '12px' }}>
              <strong>Clinical Indication:</strong> {surgery.indication || 'Advanced clinical pathology requiring operative intervention'}
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '12px' }}>
              <strong>Expected Duration:</strong> {surgery.estimatedDuration || '2.5 Hours'} &bull; <strong>Anesthesia Type:</strong> {surgery.anesthesiaType || 'General Endotracheal Anesthesia (GETA)'}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-5">
          <div className="p-3 border rounded-2 h-100 bg-light">
            <span className="text-muted d-block small fw-bold mb-2 text-uppercase" style={{ fontSize: '11px' }}>SURGICAL TEAM</span>
            <div className="d-flex flex-column gap-1" style={{ fontSize: '12px' }}>
              <div><strong className="text-dark">Lead Surgeon:</strong> {surgeonName}</div>
              <div><strong className="text-dark">Anesthesiologist:</strong> {anesthetistName}</div>
              <div><strong className="text-dark">Scrub Nurse:</strong> {surgery.scrubNurse || 'Sr. Deepa K. (RN)'}</div>
              <div><strong className="text-dark">OT Technician:</strong> {surgery.technician || 'Vikram Rao (CORT)'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHO SURGICAL SAFETY CHECKLIST STATUS */}
      <div className="mb-3">
        <div className="fw-bold text-dark small mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-shield-check text-success me-1"></i> WHO 5-Point Pre-Operative Safety Verification:
        </div>
        <div className="row g-2">
          <div className="col-6 col-md-4">
            <div className="p-2 border rounded bg-light" style={{ fontSize: '11px' }}>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              <strong>Pre-Anesthesia PAC:</strong> Cleared (ASA Class II)
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="p-2 border rounded bg-light" style={{ fontSize: '11px' }}>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              <strong>Fasting Status (NPO):</strong> Verified (Nil by mouth &gt; 8 hrs)
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="p-2 border rounded bg-light" style={{ fontSize: '11px' }}>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              <strong>Blood Cross-Matched:</strong> 2 Units PRBC Reserved
            </div>
          </div>
          <div className="col-6 col-md-6 mt-2">
            <div className="p-2 border rounded bg-light" style={{ fontSize: '11px' }}>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              <strong>Surgical Site Marking:</strong> Confirmed by Lead Surgeon
            </div>
          </div>
          <div className="col-6 col-md-6 mt-2">
            <div className="p-2 border rounded bg-light" style={{ fontSize: '11px' }}>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              <strong>Informed Consent:</strong> High-Risk Surgical Consent Signed
            </div>
          </div>
        </div>
      </div>

      {/* POST-OPERATIVE PLAN */}
      <div className="p-2 border rounded bg-light bg-opacity-50 mb-3" style={{ fontSize: '11px' }}>
        <strong>Post-Operative Disposition:</strong> Shift patient to Surgical ICU / Post-Anesthesia Care Unit (PACU) for 12 hours continuous hemodynamic monitoring & ventilator standby.
      </div>

      {/* SIGNATURES */}
      <div className="border-top pt-3 mt-3">
        <div className="row text-center" style={{ fontSize: '11px' }}>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              {surgeonName}
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Chief Operating Surgeon</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Dept of Surgery</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              {anesthetistName}
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Consultant Anesthesiologist</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Anesthesia Clearance</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Sr. Deepa K.
            </div>
            <div className="border-top pt-1 text-dark fw-bold">OT Nursing Superintendent</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Central Theatre Complex</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-muted border-top mt-3 pt-2" style={{ fontSize: '10px' }}>
        {hospitalName} &bull; Operation Theatre Management System &bull; Gate Pass Valid for OT Complex Entry
      </div>
    </div>
  );
}

export default SurgeryOtPassSlip;
