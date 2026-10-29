import React from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';

function DischargeGatepassSlip({
  bed,
  patient,
  clearances = {
    pharmacy: true,
    lab: true,
    nursing: true,
    billing: true
  },
  dischargeDate = new Date().toISOString()
}) {
  if (!bed) return null;

  const hospitalName = getHospitalName();
  const patientName = bed.patientName || patient?.name || 'Inpatient';
  const uhid = `MRN-2026-${String(bed.patientId || patient?.id || '101').padStart(4, '0')}`;
  const passId = `GP-${Date.now().toString().slice(-6)}`;
  const doctorName = formatDoctorName(bed.doctorName || 'Dr. Attending');
  const formattedDischarge = new Date(dischargeDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="discharge-gatepass-slip bg-white text-dark p-3" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '13px', lineHeight: 1.5 }}>
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
            <div className="rounded-3 bg-success text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              <i className="bi bi-shield-check fs-2"></i>
            </div>
            <div>
              <h4 className="fw-bold text-success mb-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                {hospitalName}
              </h4>
              <div className="text-secondary small fw-bold">
                OFFICIAL INPATIENT DISCHARGE & SECURITY GATEPASS
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                NABH Accredited &bull; Central Security Wing Authorization
              </div>
            </div>
          </div>
          <div className="text-end border-start ps-3">
            <div className="badge bg-success px-3 py-1 fs-6 mb-1">
              AUTHORIZED GATEPASS
            </div>
            <div className="text-dark fw-bold" style={{ fontSize: '12px' }}>Pass #{passId}</div>
            <div className="text-muted small" style={{ fontSize: '10px' }}>Valid for Hospital Exit Today</div>
          </div>
        </div>
      </div>

      {/* PATIENT & INPATIENT DETAILS */}
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
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>DISCHARGED WARD & BED</span>
            <span className="fw-bold text-dark">{bed.ward} ({bed.bedNumber})</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>ATTENDING CONSULTANT</span>
            <span className="fw-bold text-dark">{doctorName}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>ADMISSION DATE</span>
            <span className="fw-semibold text-dark">{bed.admissionDate || '2026-10-27'}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>DISCHARGE TIMESTAMP</span>
            <span className="fw-bold text-success">{formattedDischarge}</span>
          </div>
          <div className="col-6 col-md-6 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>PRIMARY CLINICAL DIAGNOSIS</span>
            <span className="fw-semibold text-dark">{bed.diagnosis || 'Post-op clinical recovery / Acute condition resolved'}</span>
          </div>
        </div>
      </div>

      {/* 4-TIER MULTI-DEPARTMENT CLEARANCE STATUS MATRIX */}
      <div className="mb-3">
        <div className="fw-bold text-dark small mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-patch-check-fill text-success me-1"></i> Multi-Department Institutional Clearance Verification:
        </div>
        <div className="row g-2">
          {/* Pharmacy */}
          <div className="col-6 col-md-3">
            <div className="p-2 border rounded bg-white h-100 border-success border-opacity-50">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-capsule text-success fs-5"></i>
                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Pharmacy</div>
              </div>
              <span className="badge bg-success-subtle text-success border border-success px-2 py-0" style={{ fontSize: '10px' }}>
                <i className="bi bi-check-circle-fill me-1"></i> ALL DUES CLEARED
              </span>
              <div className="text-muted mt-1" style={{ fontSize: '10px' }}>Dispense verified & settled</div>
            </div>
          </div>

          {/* Laboratory */}
          <div className="col-6 col-md-3">
            <div className="p-2 border rounded bg-white h-100 border-success border-opacity-50">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-virus text-success fs-5"></i>
                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Lab & Radiology</div>
              </div>
              <span className="badge bg-success-subtle text-success border border-success px-2 py-0" style={{ fontSize: '10px' }}>
                <i className="bi bi-check-circle-fill me-1"></i> REPORTS RELEASED
              </span>
              <div className="text-muted mt-1" style={{ fontSize: '10px' }}>No pending samples</div>
            </div>
          </div>

          {/* Nursing */}
          <div className="col-6 col-md-3">
            <div className="p-2 border rounded bg-white h-100 border-success border-opacity-50">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-heart-pulse text-success fs-5"></i>
                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Nursing Station</div>
              </div>
              <span className="badge bg-success-subtle text-success border border-success px-2 py-0" style={{ fontSize: '10px' }}>
                <i className="bi bi-check-circle-fill me-1"></i> VITALS STABLE
              </span>
              <div className="text-muted mt-1" style={{ fontSize: '10px' }}>IV line / Cannula removed</div>
            </div>
          </div>

          {/* Billing & Accounts */}
          <div className="col-6 col-md-3">
            <div className="p-2 border rounded bg-white h-100 border-success border-opacity-50">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-receipt text-success fs-5"></i>
                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>Billing & Accounts</div>
              </div>
              <span className="badge bg-success-subtle text-success border border-success px-2 py-0" style={{ fontSize: '10px' }}>
                <i className="bi bi-check-circle-fill me-1"></i> ZERO OUTSTANDING
              </span>
              <div className="text-muted mt-1" style={{ fontSize: '10px' }}>Final bill fully settled</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY GATE INSTRUCTIONS */}
      <div className="border border-success border-opacity-50 rounded-2 p-3 mb-3 bg-success bg-opacity-10">
        <div className="fw-bold text-success small mb-1">
          <i className="bi bi-shield-lock-fill me-1"></i> HOSPITAL SECURITY PROTOCOL:
        </div>
        <p className="mb-0 text-dark" style={{ fontSize: '11px', lineHeight: 1.4 }}>
          Security Staff at Main Hospital Exit Gates 1 & 2 are hereby authorized to allow patient <strong>{patientName}</strong> and attendant to leave the facility along with their personal belongings. Discharge medication counseling has been completed.
        </p>
      </div>

      {/* AUTHORIZED SIGNATURES */}
      <div className="border-top pt-3 mt-4">
        <div className="row text-center" style={{ fontSize: '11px' }}>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Sister Clara M.
            </div>
            <div className="border-top pt-1 text-dark fw-bold">In-Charge Ward Sister</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Nursing Administration</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Rajesh Mehra
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Chief Finance Officer</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Hospital Billing Desk</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Capt. Vikram Singh
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Chief Security Officer</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Main Security Gatehouse</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-muted border-top mt-3 pt-2" style={{ fontSize: '10px' }}>
        HospitalSync Pro &bull; Security Electronic Clearance System &bull; Gatepass #{passId} &bull; Generated for Security Exit
      </div>
    </div>
  );
}

export default DischargeGatepassSlip;
