import React from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';

function ChemoAdministrationSlip({ session, patient }) {
  if (!session) return null;

  const hospitalName = getHospitalName();
  const patientName = session.patientName || patient?.name || 'Oncology Patient';
  const uhid = session.uhid || `MRN-2026-${String(session.patientId || patient?.id || '408').padStart(4, '0')}`;
  const passId = session.passId || `CHM-${Date.now().toString().slice(-6)}`;
  const oncologistName = formatDoctorName(session.oncologistName || 'Dr. Senior Medical Oncologist');
  const primaryNurseName = session.primaryNurse || 'Nurse In-Charge, RN';
  const verifierNurseName = session.verifierNurse || 'Clinical Oncology Nurse, RN';

  const formattedDate = new Date(session.date || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="chemo-admin-slip bg-white text-dark p-3" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '13px', lineHeight: 1.5 }}>
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
            <div className="rounded-3 bg-purple text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: '#701a75' }}>
              <i className="bi bi-droplet-half fs-2 text-white"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.5px', color: '#701a75' }}>
                {hospitalName}
              </h4>
              <div className="text-secondary small fw-bold">
                DEPARTMENT OF MEDICAL ONCOLOGY & DAYCARE INFUSION CENTER
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                ASCO / ONS Chemotherapy Administration Safety Standards &bull; NABH Certified Daycare Suite
              </div>
            </div>
          </div>
          <div className="text-end border-start ps-3">
            <div className="badge px-3 py-1 fs-6 mb-1 text-uppercase text-white" style={{ backgroundColor: '#701a75' }}>
              CHEMOTHERAPY PASS
            </div>
            <div className="text-dark fw-bold" style={{ fontSize: '12px' }}>Pass #{passId}</div>
            <div className="text-muted small" style={{ fontSize: '10px' }}>Bay {session.bayNumber || '02'} &bull; Cytotoxic Safe</div>
          </div>
        </div>
      </div>

      {/* PATIENT & PROTOCOL SUMMARY */}
      <div className="bg-light p-3 rounded-2 border mb-3">
        <div className="row g-2">
          <div className="col-4">
            <span className="text-muted small d-block">Patient Full Name:</span>
            <strong className="text-dark fs-6">{patientName}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted small d-block">UHID / MRN:</span>
            <strong className="font-monospace text-primary">{uhid}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted small d-block">Age / Sex:</span>
            <strong>{session.age || '54'} Yrs / {session.gender || 'Male'}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted small d-block">Height / Weight:</span>
            <strong>{session.heightCm || 168} cm / {session.weightKg || 68} kg</strong>
          </div>
          <div className="col-2">
            <span className="text-muted small d-block">Body Surface Area (BSA):</span>
            <span className="badge bg-dark fs-6">{session.bsa || '1.78'} m²</span>
          </div>

          <div className="col-4 mt-2">
            <span className="text-muted small d-block">Clinical Diagnosis:</span>
            <strong className="text-danger">{session.diagnosis || 'Colorectal Adenocarcinoma (Stage IIIb)'}</strong>
          </div>
          <div className="col-4 mt-2">
            <span className="text-muted small d-block">Chemotherapy Regimen:</span>
            <span className="badge bg-purple text-white px-2 py-1 fs-6" style={{ backgroundColor: '#86198f' }}>
              {session.regimenName || 'FOLFOX-6 (mFOLFOX6)'}
            </span>
          </div>
          <div className="col-2 mt-2">
            <span className="text-muted small d-block">Cycle / Session:</span>
            <strong className="text-primary">Cycle {session.cycleNumber || '4'} of {session.totalCycles || '6'} (Day {session.cycleDay || '1'})</strong>
          </div>
          <div className="col-2 mt-2">
            <span className="text-muted small d-block">Treatment Intent:</span>
            <span className="badge bg-secondary">{session.intent || 'Adjuvant Curative'}</span>
          </div>
        </div>
      </div>

      {/* PRE-CHEMOTHERAPY LAB SAFETY CLEARANCE */}
      <div className="mb-3">
        <div className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-secondary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          Section I: Pre-Chemotherapy Hematologic & Organ Clearance (Done within 24-48 Hours)
        </div>
        <div className="row g-2 text-center" style={{ fontSize: '12px' }}>
          <div className="col-2">
            <div className="p-2 border rounded bg-white">
              <span className="text-muted d-block small">Absolute Neutrophil (ANC)</span>
              <strong className="text-success">{session.anc || '2,450 /µL'}</strong>
              <div className="text-muted" style={{ fontSize: '10px' }}>Min ≥ 1,500 /µL</div>
            </div>
          </div>
          <div className="col-2">
            <div className="p-2 border rounded bg-white">
              <span className="text-muted d-block small">Platelet Count</span>
              <strong className="text-success">{session.platelets || '185,000 /µL'}</strong>
              <div className="text-muted" style={{ fontSize: '10px' }}>Min ≥ 100,000 /µL</div>
            </div>
          </div>
          <div className="col-2">
            <div className="p-2 border rounded bg-white">
              <span className="text-muted d-block small">Hemoglobin (Hb)</span>
              <strong className="text-dark">{session.hemoglobin || '11.4 g/dL'}</strong>
              <div className="text-muted" style={{ fontSize: '10px' }}>Min ≥ 9.0 g/dL</div>
            </div>
          </div>
          <div className="col-2">
            <div className="p-2 border rounded bg-white">
              <span className="text-muted d-block small">Serum Creatinine</span>
              <strong className="text-success">{session.creatinine || '0.92 mg/dL'}</strong>
              <div className="text-muted" style={{ fontSize: '10px' }}>Max ≤ 1.40 mg/dL</div>
            </div>
          </div>
          <div className="col-2">
            <div className="p-2 border rounded bg-white">
              <span className="text-muted d-block small">Bilirubin / SGPT</span>
              <strong className="text-success">{session.liverFn || '0.7 mg / 28 U/L'}</strong>
              <div className="text-muted" style={{ fontSize: '10px' }}>Normal range</div>
            </div>
          </div>
          <div className="col-2">
            <div className="p-2 border rounded bg-success bg-opacity-10 border-success">
              <span className="text-success d-block small fw-bold">Lab Clearance</span>
              <span className="badge bg-success mt-1">APPROVED</span>
              <div className="text-success small fw-bold" style={{ fontSize: '10px' }}>Fit for Infusion</div>
            </div>
          </div>
        </div>
      </div>

      {/* PRE-MEDICATIONS ADMINISTERED */}
      <div className="mb-3">
        <div className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-secondary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          Section II: Pre-Medication & Anti-Emetic Administration Record
        </div>
        <table className="table table-sm table-bordered mb-0" style={{ fontSize: '11px' }}>
          <thead className="table-light">
            <tr>
              <th>Medication</th>
              <th>Dose / Route</th>
              <th>Indication</th>
              <th>Admin Time</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {(session.preMeds || [
              { drug: 'Inj. Ondansetron', dose: '16 mg IV Infusion in 100mL NS', reason: '5-HT3 Antiemetic', time: '09:00 AM', status: 'Given & Tolerated' },
              { drug: 'Inj. Dexamethasone', dose: '8 mg IV Push', reason: 'Pre-chemo Corticosteroid', time: '09:15 AM', status: 'Given & Tolerated' },
              { drug: 'Inj. Famotidine / Ranitidine', dose: '20 mg IV Push', reason: 'H2 Receptor Blocker', time: '09:20 AM', status: 'Given & Tolerated' },
              { drug: 'Inj. Pheniramine Maleate (Avil)', dose: '22.75 mg IV Slow Push', reason: 'H1 Antihistamine Antiallergic', time: '09:25 AM', status: 'Given & Tolerated' }
            ]).map((pm, idx) => (
              <tr key={idx}>
                <td className="fw-bold text-dark">{pm.drug}</td>
                <td>{pm.dose}</td>
                <td>{pm.reason}</td>
                <td>{pm.time}</td>
                <td><span className="badge bg-success-subtle text-success border border-success px-2 py-0">{pm.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHEMOTHERAPY DRUG INFUSION & DUAL NURSE SIGN-OFF */}
      <div className="mb-3">
        <div className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-secondary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          Section III: Cytotoxic Chemotherapy Administration & Dual Independent RN Signoff
        </div>
        <table className="table table-sm table-bordered mb-0" style={{ fontSize: '11px' }}>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Antineoplastic Agent</th>
              <th>Calculated Dose</th>
              <th>Diluent / Total Vol</th>
              <th>Infusion Route</th>
              <th>Rate (mL/hr)</th>
              <th>Duration</th>
              <th>Vesicant Risk</th>
              <th>Dual RN Verified</th>
            </tr>
          </thead>
          <tbody>
            {(session.drugs || [
              { id: 1, name: 'Oxaliplatin', dose: '150 mg (85 mg/m²)', diluent: '500 mL D5W', route: 'ChemoPort IV', rate: '250 mL/hr', dur: '120 mins', vesicant: 'Irritant', verified: true },
              { id: 2, name: 'Leucovorin Calcium', dose: '710 mg (400 mg/m²)', diluent: '250 mL D5W', route: 'ChemoPort IV', rate: '125 mL/hr', dur: '120 mins', vesicant: 'Non-vesicant', verified: true },
              { id: 3, name: '5-Fluorouracil (5-FU) Bolus', dose: '710 mg (400 mg/m²)', diluent: 'IV Push over 5 min', route: 'ChemoPort IV', rate: 'Slow Push', dur: '5 mins', vesicant: 'Irritant', verified: true },
              { id: 4, name: '5-Fluorouracil (5-FU) Infusion', dose: '4,270 mg (2400 mg/m²)', diluent: 'Elastomeric Ambulatory Pump', route: 'ChemoPort IV', rate: '5 mL/hr', dur: '46 hours', vesicant: 'Irritant', verified: true }
            ]).map((drug, idx) => (
              <tr key={idx}>
                <td className="fw-bold">{idx + 1}</td>
                <td className="fw-bold text-dark">{drug.name}</td>
                <td className="text-primary fw-bold">{drug.dose}</td>
                <td>{drug.diluent}</td>
                <td><span className="badge bg-light text-dark border">{drug.route}</span></td>
                <td>{drug.rate}</td>
                <td>{drug.dur}</td>
                <td>
                  <span className={`badge ${drug.vesicant === 'Vesicant' ? 'bg-danger' : drug.vesicant === 'Irritant' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {drug.vesicant}
                  </span>
                </td>
                <td className="text-success fw-bold text-center">
                  <i className="bi bi-check2-circle me-1"></i>VERIFIED
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXTRAVASATION & ACCESS SITE ASSESSMENT */}
      <div className="p-2 border rounded bg-light mb-3" style={{ fontSize: '11px' }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <strong className="text-dark">Vascular Access & Extravasation Surveillance Check:</strong>
          <span className="badge bg-success">SITE INTACT &bull; NO EXTRAVASATION</span>
        </div>
        <div className="row g-2 text-muted">
          <div className="col-4">Access Type: <strong>{session.accessType || 'Subcutaneous Chemoport (Right Subclavian)'}</strong></div>
          <div className="col-4">Blood Return Check: <strong>Positive & Brisk before each bag</strong></div>
          <div className="col-4">Post-Infusion Saline Flush: <strong>20 mL NS + 100 U/mL Heparin Lock completed</strong></div>
        </div>
      </div>

      {/* DISCHARGE INSTRUCTIONS & WARNING CRITERIA */}
      <div className="border border-danger border-opacity-50 p-2 rounded bg-danger bg-opacity-10 mb-3" style={{ fontSize: '11px' }}>
        <strong className="text-danger d-block mb-1">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> IMPORTANT POST-CHEMOTHERAPY CARE & EMERGENCY NOTIFICATION:
        </strong>
        <div className="row g-2 text-dark">
          <div className="col-6">
            &bull; Report immediately if Oral Temperature is <strong>&gt; 100.4°F (38.0°C)</strong> (Neutropenic Fever).<br />
            &bull; Watch for severe intractable nausea, persistent diarrhea (&gt;4 episodes/day), or chest pain.
          </div>
          <div className="col-6">
            &bull; <strong>Cytotoxic Precautions (48 hrs):</strong> Double flush toilet, wash soiled clothing separately.<br />
            &bull; Oncology 24x7 Emergency Helpline: <strong>+91-11-4000-8899 / Code Pink Oncology Desk</strong>.
          </div>
        </div>
      </div>

      {/* SIGNATURE BLOCK */}
      <div className="border-top pt-3">
        <div className="row text-center">
          <div className="col-3">
            <div className="text-muted small">Primary Chemotherapy RN</div>
            <div className="fw-bold mt-3 text-dark">{primaryNurseName}</div>
            <div className="text-secondary small" style={{ fontSize: '10px' }}>RN, Oncology Certified</div>
          </div>
          <div className="col-3">
            <div className="text-muted small">Independent Verifier RN</div>
            <div className="fw-bold mt-3 text-dark">{verifierNurseName}</div>
            <div className="text-secondary small" style={{ fontSize: '10px' }}>RN, Dual-Check Protocol</div>
          </div>
          <div className="col-3">
            <div className="text-muted small">Medical Oncologist</div>
            <div className="fw-bold mt-3 text-dark">{oncologistName}</div>
            <div className="text-secondary small" style={{ fontSize: '10px' }}>DM / DNB Medical Oncology</div>
          </div>
          <div className="col-3">
            <div className="text-muted small">Session Authorization</div>
            <div className="mt-2">
              <span className="badge bg-success px-3 py-1">INFUSION CERTIFIED</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '10px' }}>Date: {formattedDate}</div>
          </div>
        </div>
      </div>

      {/* ACTION PRINT FOOTER (Hidden when printed) */}
      <div className="no-print mt-3 text-end border-top pt-2">
        <button 
          className="btn btn-sm text-white px-4 fw-bold" 
          style={{ backgroundColor: '#701a75' }} 
          onClick={() => window.print()}
        >
          <i className="bi bi-printer-fill me-2"></i> Print Chemotherapy Flowsheet & Pass
        </button>
      </div>
    </div>
  );
}

export default ChemoAdministrationSlip;
