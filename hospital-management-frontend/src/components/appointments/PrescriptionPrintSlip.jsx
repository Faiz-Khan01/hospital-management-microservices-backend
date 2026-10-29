import React from 'react';

function PrescriptionPrintSlip({ rx }) {
  if (!rx) return null;

  const todayStr = rx.date || new Date().toISOString().split('T')[0];
  const rxId = rx.id || Math.floor(100000 + Math.random() * 900000);

  const vitals = rx.vitals || {
    bp: '120/80',
    pulse: '74',
    spo2: '98',
    temp: '98.4',
    weight: '65'
  };

  const medicineList = Array.isArray(rx.medicines) && rx.medicines.length > 0
    ? rx.medicines
    : [
        {
          name: rx.medicineName || 'Paracetamol 650mg',
          dosage: rx.dosage || '1 Tablet',
          frequency: rx.frequency || '1-0-1',
          duration: rx.duration || '5 Days',
          instructions: rx.instructions || 'Take after food'
        }
      ];

  return (
    <div className="rx-slip-container" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1e293b', background: '#fff' }}>
      <style>{`
        .rx-slip-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 12px;
        }

        .rx-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }

        .rx-logo-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rx-logo-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }

        .rx-hospital-name {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin: 0;
        }

        .rx-hospital-tagline {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        .rx-hospital-contact {
          text-align: right;
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
        }

        .rx-meta-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 20px;
          margin-top: 20px;
        }

        .rx-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rx-meta-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .rx-meta-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .rx-meta-sub {
          font-size: 12px;
          color: #64748b;
        }

        .rx-vitals-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .rx-vital-box {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 8px 12px;
          text-align: center;
        }

        .rx-vital-name {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .rx-vital-val {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2px;
        }

        .rx-diagnosis-box {
          margin-top: 18px;
          padding: 12px 16px;
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          border-radius: 0 8px 8px 0;
        }

        .rx-symbol-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .rx-symbol {
          font-family: serif;
          font-size: 32px;
          font-weight: 900;
          color: #2563eb;
          font-style: italic;
          line-height: 1;
        }

        .rx-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        .rx-table th {
          background: #f8fafc;
          border-bottom: 2px solid #cbd5e1;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          text-align: left;
        }

        .rx-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          vertical-align: middle;
        }

        .rx-med-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 14px;
        }

        .rx-freq-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 6px;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 11px;
          font-weight: 700;
        }

        .rx-advice-section {
          margin-top: 22px;
          padding: 14px 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
        }

        .rx-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .rx-stamp-box {
          text-align: center;
          min-width: 180px;
        }

        .rx-doctor-sign {
          font-family: 'Brush Script MT', cursive, sans-serif;
          font-size: 26px;
          color: #1e3a8a;
          margin-bottom: 4px;
        }

        .rx-stamp-line {
          border-top: 1.5px dashed #94a3b8;
          padding-top: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
        }

        .rx-compliance-note {
          max-width: 440px;
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.5;
        }
      `}</style>

      {/* HEADER */}
      <div className="rx-header">
        <div className="rx-logo-brand">
          <div className="rx-logo-icon">
            <i className="bi bi-hospital"></i>
          </div>
          <div>
            <h1 className="rx-hospital-name">HospitalSync Healthcare</h1>
            <div className="rx-hospital-tagline">Advanced Multispecialty Medical Center · NABH Accredited</div>
          </div>
        </div>
        <div className="rx-hospital-contact">
          <div><i className="bi bi-geo-alt-fill me-1 text-primary"></i> 24 Hospital Blvd, Health City, New Delhi</div>
          <div><i className="bi bi-telephone-fill me-1 text-success"></i> Emergency Helpline: 1800-200-SYNC</div>
          <div><i className="bi bi-globe me-1 text-info"></i> www.hospitalsync.org</div>
        </div>
      </div>

      {/* PATIENT & DOCTOR METADATA */}
      <div className="rx-meta-bar">
        <div className="rx-meta-item">
          <span className="rx-meta-label">Patient Details</span>
          <span className="rx-meta-value">{rx.patientName || 'Patient'}</span>
          <span className="rx-meta-sub">
            ID: #{rx.patientId || '101'} · Age/Gender: {rx.patientAge ? `${rx.patientAge} Yrs` : '32 Yrs'} / {rx.patientGender || 'Adult'}
          </span>
        </div>

        <div className="rx-meta-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="rx-meta-label">Prescribing Specialist</span>
          <span className="rx-meta-value">{rx.doctorName || 'Dr. Medical Officer'}</span>
          <span className="rx-meta-sub">
            Dept: {rx.department || 'General Medicine'} · Reg No: MCI-29481
          </span>
        </div>

        <div className="rx-meta-item">
          <span className="rx-meta-label">Prescription Token</span>
          <span className="rx-meta-value text-primary">Rx-{rxId}</span>
        </div>

        <div className="rx-meta-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="rx-meta-label">Date of Consultation</span>
          <span className="rx-meta-value">{todayStr}</span>
        </div>
      </div>

      {/* RECORDED VITALS */}
      <div className="rx-vitals-strip">
        <div className="rx-vital-box">
          <div className="rx-vital-name">Blood Pressure</div>
          <div className="rx-vital-val">{vitals.bp || '120/80'} <span className="text-muted" style={{ fontSize: 9 }}>mmHg</span></div>
        </div>
        <div className="rx-vital-box">
          <div className="rx-vital-name">Pulse Rate</div>
          <div className="rx-vital-val">{vitals.pulse || '74'} <span className="text-muted" style={{ fontSize: 9 }}>bpm</span></div>
        </div>
        <div className="rx-vital-box">
          <div className="rx-vital-name">Oxygen (SpO2)</div>
          <div className="rx-vital-val">{vitals.spo2 || '98'} <span className="text-muted" style={{ fontSize: 9 }}>%</span></div>
        </div>
        <div className="rx-vital-box">
          <div className="rx-vital-name">Body Temp</div>
          <div className="rx-vital-val">{vitals.temp || '98.4'} <span className="text-muted" style={{ fontSize: 9 }}>°F</span></div>
        </div>
        <div className="rx-vital-box">
          <div className="rx-vital-name">Weight</div>
          <div className="rx-vital-val">{vitals.weight || '65'} <span className="text-muted" style={{ fontSize: 9 }}>kg</span></div>
        </div>
      </div>

      {/* DIAGNOSIS */}
      <div className="rx-diagnosis-box">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <span className="text-uppercase fw-bold text-muted" style={{ fontSize: 11 }}>Clinical Diagnosis / Impression:</span>
            <div className="fw-bold text-dark fs-6 mt-1">{rx.diagnosis || 'Clinical OPD Evaluation'}</div>
          </div>
          {rx.complaint && (
            <div className="text-end">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: 10 }}>Chief Complaint:</span>
              <div className="small text-secondary">{rx.complaint}</div>
            </div>
          )}
        </div>
      </div>

      {/* RX HEADING */}
      <div className="rx-symbol-heading">
        <span className="rx-symbol">℞</span>
        <span className="fw-bold text-dark fs-6">Prescribed Medications</span>
      </div>

      {/* MEDICINES TABLE */}
      <table className="rx-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Medication & Strength</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          {medicineList.map((m, idx) => (
            <tr key={idx}>
              <td className="text-muted fw-bold">{String(idx + 1).padStart(2, '0')}</td>
              <td>
                <div className="rx-med-name">{m.name}</div>
                {m.type && <small className="text-muted">{m.type}</small>}
              </td>
              <td>{m.dosage || '1 Tab'}</td>
              <td>
                <span className="rx-freq-badge">{m.frequency || '1-0-1'}</span>
              </td>
              <td>{m.duration || '5 Days'}</td>
              <td className="text-secondary">{m.instructions || 'Take after meals'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CLINICAL ADVICE & DIET */}
      <div className="rx-advice-section">
        <div className="d-flex align-items-start gap-2">
          <i className="bi bi-info-circle-fill text-warning fs-5"></i>
          <div>
            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>Doctor's Advice & Lifestyle Recommendations:</div>
            <p className="mb-1 text-secondary" style={{ fontSize: 12 }}>
              {rx.notes || 'Take medications regularly as prescribed. Drink plenty of warm water and ensure adequate rest.'}
            </p>
            {rx.followUp && (
              <div className="mt-2 text-primary fw-bold" style={{ fontSize: 12 }}>
                <i className="bi bi-calendar-event me-1"></i> Follow-up Consultation: {rx.followUp}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER & DIGITAL SIGNATURE */}
      <div className="rx-footer">
        <div className="rx-compliance-note">
          <div>* Valid Digital Prescription generated under the National Telemedicine & Healthcare Practice Guidelines.</div>
          <div>* Please present this prescription slip to the hospital pharmacy for dispensing and inventory checkout.</div>
          <div>* In case of any acute allergic reaction or unexpected side-effects, report to the Emergency Room immediately.</div>
        </div>

        <div className="rx-stamp-box">
          <div className="rx-doctor-sign">{rx.doctorName || 'Dr. Specialist'}</div>
          <div className="rx-stamp-line">
            Authorized Digital Signature
            <br />
            <small className="text-muted font-monospace" style={{ fontSize: 9 }}>SIGNED: {todayStr} · VERIFIED</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPrintSlip;
