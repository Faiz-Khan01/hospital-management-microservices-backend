import React from 'react';

function AdmissionBedCardSlip({ admission }) {
  if (!admission) return null;

  const todayStr = admission.admissionDate || new Date().toISOString().split('T')[0];
  const ipdNo = admission.ipdNumber || `IPD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="bed-slip-container" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1e293b', background: '#fff' }}>
      <style>{`
        .bed-slip-container {
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          padding: 28px;
          border-radius: 12px;
        }

        .bs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 18px;
          border-bottom: 2px solid #2563eb;
        }

        .bs-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bs-logo {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .bs-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .bs-sub {
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bs-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px 20px;
          margin-top: 18px;
        }

        .bs-info-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bs-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bs-val {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .bs-bed-banner {
          margin-top: 18px;
          padding: 16px 20px;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bs-bed-number {
          font-size: 28px;
          font-weight: 900;
          color: #1d4ed8;
          line-height: 1;
        }

        .bs-diag-box {
          margin-top: 18px;
          padding: 14px 18px;
          background: #f1f5f9;
          border-left: 4px solid #2563eb;
          border-radius: 0 8px 8px 0;
        }

        .bs-footer {
          margin-top: 36px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
      `}</style>

      {/* HEADER */}
      <div className="bs-header">
        <div className="bs-brand">
          <div className="bs-logo">
            <i className="bi bi-hospital"></i>
          </div>
          <div>
            <h2 className="bs-title">HospitalSync Healthcare</h2>
            <div className="bs-sub">Inpatient Department & Bed Allocation Desk</div>
          </div>
        </div>

        <div className="text-end">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 fw-bold">
            OFFICIAL ADMISSION CARD
          </span>
          <div className="fs-6 fw-bold text-dark mt-1 font-monospace">{ipdNo}</div>
          <small className="text-muted">Admission Date: {todayStr}</small>
        </div>
      </div>

      {/* BED ALLOCATION BANNER */}
      <div className="bs-bed-banner">
        <div>
          <span className="bs-label">Allocated Inpatient Ward</span>
          <div className="fw-bold text-dark fs-5">{admission.ward || 'General Medical Ward'}</div>
          <small className="text-muted">Floor: {admission.floor || '2nd Floor, Wing B'}</small>
        </div>
        <div className="text-end">
          <span className="bs-label">Assigned Bed</span>
          <div className="bs-bed-number">{admission.bedNumber || 'BED-101'}</div>
          <small className="text-primary fw-bold">Bed Type: {admission.type || 'General'}</small>
        </div>
      </div>

      {/* PATIENT & DOCTOR DETAILS */}
      <div className="bs-info-grid">
        <div className="bs-info-item">
          <span className="bs-label">Patient Name & ID</span>
          <span className="bs-val">{admission.patientName || 'Patient'}</span>
          <small className="text-muted">Patient ID: #{admission.patientId || '101'} · Age/Gender: {admission.patientAge || '34 Yrs'} / {admission.patientGender || 'Adult'}</small>
        </div>

        <div className="bs-info-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="bs-label">Admitting Consultant</span>
          <span className="bs-val">{admission.doctorName || 'Dr. Attending Physician'}</span>
          <small className="text-muted">Department: {admission.department || 'Internal Medicine'}</small>
        </div>

        <div className="bs-info-item">
          <span className="bs-label">Emergency Attendant / Contact</span>
          <span className="bs-val">{admission.attendantName || 'Guardian / Family Contact'}</span>
          <small className="text-muted">Phone: {admission.attendantPhone || '+91 98765-43210'}</small>
        </div>

        <div className="bs-info-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="bs-label">Ward Tariff & Initial Deposit</span>
          <span className="bs-val text-success">₹{Number(admission.dailyRate || 1500).toLocaleString('en-IN')}/Day</span>
          <small className="text-muted">Initial Advance: ₹{Number(admission.deposit || 5000).toLocaleString('en-IN')}</small>
        </div>
      </div>

      {/* DIAGNOSIS */}
      <div className="bs-diag-box">
        <span className="bs-label d-block mb-1">Reason for Hospital Admission / Clinical Severity:</span>
        <div className="fw-bold text-dark">{admission.diagnosis || 'Clinical Inpatient Monitoring & Therapy'}</div>
        {admission.instructions && (
          <p className="small text-secondary mb-0 mt-1">Special Nursing Instructions: {admission.instructions}</p>
        )}
      </div>

      {/* FOOTER */}
      <div className="bs-footer">
        <div className="small text-muted" style={{ maxWidth: 440, fontSize: 10, lineHeight: 1.5 }}>
          <div>* Bed Card must be displayed at the patient headboard throughout hospitalization.</div>
          <div>* Visiting hours: 04:00 PM - 07:00 PM. Maximum 2 visitors permitted with visitor pass.</div>
          <div>* For emergency nursing calls, use the bedside buzzer or dial extn: #100.</div>
        </div>

        <div className="text-center" style={{ minWidth: 170 }}>
          <div className="fw-bold text-primary" style={{ fontSize: 12, marginBottom: 4 }}>
            ADMISSIONS DESK VERIFIED
          </div>
          <div style={{ borderTop: '1.5px dashed #94a3b8', paddingTop: 4, fontSize: 11, fontWeight: 700, color: '#334155' }}>
            Admissions Officer / Matron
            <br />
            <small className="text-muted" style={{ fontSize: 9 }}>HOSPITALSYNC INPATIENT</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdmissionBedCardSlip;
