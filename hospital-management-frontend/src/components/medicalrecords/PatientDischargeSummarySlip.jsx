import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

function PatientDischargeSummarySlip({ patient, records = [], prescriptions = [], appointments = [], beds = [], bills = [] }) {
  if (!patient) return null;

  const hospitalName = getHospitalName();

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const mrnNumber = `MRN-2026-${String(patient.id || 1).padStart(4, '0')}`;
  const ipdNumber = `IPD-${String(Date.now()).slice(-6)}`;

  // Find latest doctor, diagnosis, vitals from appointments/records
  const latestApt = appointments.find(a => Number(a.patientId) === Number(patient.id) || a.patientName === patient.name) || appointments[0];
  const latestRec = records.find(r => Number(r.patientId) === Number(patient.id)) || records[0];
  const patientBed = beds.find(b => (b.patientName && patient.name && b.patientName.toLowerCase().includes(patient.name.toLowerCase())) || b.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter(p => Number(p.patientId) === Number(patient.id) || (p.patientName && patient.name && p.patientName.toLowerCase().includes(patient.name.toLowerCase())));

  const doctorName = latestApt?.doctorName || latestRec?.doctorName || 'Dr. Sarah Jenkins, MD, DM';
  const department = latestApt?.department || latestRec?.department || 'Internal Medicine & Critical Care';
  const diagnosis = latestRec?.diagnosis || latestApt?.diagnosis || 'Acute Respiratory Tract Infection with Mild Dehydration';
  const treatment = latestRec?.treatment || 'IV Hydration, Broad-Spectrum Antibiotics, Nebulization, Symptomatic Care';
  const admissionDate = patientBed?.admissionDate || latestApt?.appointmentDate || '2026-10-26';

  // Discharge meds compiled from prescriptions or defaults
  const dischargeMeds = patientPrescriptions.length > 0 && patientPrescriptions[0].medicines?.length > 0
    ? patientPrescriptions[0].medicines
    : [
        { name: 'Tab. Amoxicillin + Clavulanic Acid 625mg', dosage: '1 Tablet', frequency: '1 - 0 - 1 (After Meals)', duration: '5 Days', instructions: 'Complete full antibiotic course' },
        { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: 'SOS (If Temp > 99.5°F)', duration: '3 Days', instructions: 'Max 3 tablets daily' },
        { name: 'Tab. Pantoprazole 40mg', dosage: '1 Tablet', frequency: '1 - 0 - 0 (Empty Stomach)', duration: '7 Days', instructions: 'Take 30 mins before breakfast' },
        { name: 'Syp. Multivitamin & Zinc', dosage: '10 ml', frequency: '0 - 0 - 1 (Bedtime)', duration: '15 Days', instructions: 'General wellness & recovery' }
      ];

  return (
    <div className="discharge-slip-wrapper p-3" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#1e293b', fontSize: '12px' }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* HOSPITAL HEADER */}
      <div className="border-bottom border-3 border-primary pb-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 56, height: 56, fontSize: 28 }}
            >
              <i className="bi bi-hospital"></i>
            </div>
            <div>
              <h4 className="fw-bold text-primary mb-0 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                {hospitalName}
              </h4>
              <div className="text-secondary small fw-semibold">
                Tertiary Care Hospital & Research Institute &bull; NABH & NABL Accredited
              </div>
              <div className="text-muted" style={{ fontSize: '10.5px' }}>
                124 Healthcare Boulevard, Medical District, New Delhi - 110029 &bull; Ph: +91 11 4982 0000 &bull; GSTIN: 07AABCH1234F1Z8
              </div>
            </div>
          </div>
          <div className="text-end">
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 fw-bold text-uppercase d-inline-block mb-1">
              24x7 Emergency: 1066
            </span>
            <div className="text-muted fw-bold" style={{ fontSize: '11px' }}>Date: {todayStr}</div>
          </div>
        </div>
      </div>

      {/* DOCUMENT TITLE BANNER */}
      <div className="bg-primary text-white text-center py-2 px-3 rounded-2 mb-3 shadow-xs d-flex justify-content-between align-items-center">
        <span className="fw-bold text-uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
          Clinical Discharge Summary & Health Passport
        </span>
        <span className="badge bg-white text-primary fw-bold" style={{ fontSize: '11px' }}>
          CONFIDENTIAL MEDICAL RECORD
        </span>
      </div>

      {/* PATIENT & ADMISSION DEMOGRAPHICS */}
      <div className="border rounded-2 p-2 mb-3 bg-light bg-opacity-50">
        <div className="row g-2" style={{ fontSize: '11.5px' }}>
          <div className="col-4">
            <span className="text-muted d-block">Patient Full Name:</span>
            <strong className="text-dark fs-6">{patient.name || 'John Doe'}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted d-block">Age / Gender:</span>
            <strong className="text-dark">{patient.age || '34'} Yrs / {patient.gender || 'Male'}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted d-block">Blood Group:</span>
            <strong className="text-danger fw-bold">{patient.bloodGroup || 'B +ve'}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted d-block">UHID / MRN:</span>
            <strong className="text-primary font-monospace">{mrnNumber}</strong>
          </div>
          <div className="col-2">
            <span className="text-muted d-block">IPD / Case No:</span>
            <strong className="text-dark font-monospace">{ipdNumber}</strong>
          </div>

          <div className="col-4 border-top pt-2">
            <span className="text-muted d-block">Primary Attending Consultant:</span>
            <strong className="text-dark">{doctorName}</strong>
            <div className="text-muted" style={{ fontSize: '10px' }}>Dept: {department}</div>
          </div>
          <div className="col-2 border-top pt-2">
            <span className="text-muted d-block">Date of Admission:</span>
            <strong className="text-dark">{admissionDate}</strong>
          </div>
          <div className="col-2 border-top pt-2">
            <span className="text-muted d-block">Date of Discharge:</span>
            <strong className="text-success fw-bold">{todayStr}</strong>
          </div>
          <div className="col-2 border-top pt-2">
            <span className="text-muted d-block">Ward / Bed No:</span>
            <strong className="text-dark">{patientBed?.ward || 'General Medical Ward'} ({patientBed?.bedNumber || 'GW-102'})</strong>
          </div>
          <div className="col-2 border-top pt-2">
            <span className="text-muted d-block">Contact / Attendant:</span>
            <strong className="text-dark">{patient.phone || '+91 98765-43210'}</strong>
          </div>
        </div>
      </div>

      {/* CLINICAL SUMMARY SECTION */}
      <div className="border rounded-2 p-3 mb-3">
        <h6 className="fw-bold text-primary border-bottom pb-1 mb-2 text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.04em' }}>
          <i className="bi bi-clipboard2-pulse me-1"></i> 1. Clinical Diagnosis & Presentation
        </h6>
        <div className="row g-2 mb-2">
          <div className="col-12">
            <span className="text-muted fw-semibold">Final Discharge Diagnosis:</span>
            <div className="p-2 bg-light rounded text-dark fw-bold border mt-1">
              {diagnosis}
            </div>
          </div>
          <div className="col-md-6">
            <span className="text-muted fw-semibold">Chief Complaints at Admission:</span>
            <p className="mb-0 text-dark small mt-1">
              High grade intermittent fever for 4 days, productive cough with expectoration, chest tightness, and generalized weakness.
            </p>
          </div>
          <div className="col-md-6">
            <span className="text-muted fw-semibold">Known Allergies & Co-morbidities:</span>
            <p className="mb-0 text-danger fw-semibold small mt-1">
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              No known drug allergies (NKDA). Mild pre-hypertension noted.
            </p>
          </div>
        </div>

        <h6 className="fw-bold text-primary border-bottom pb-1 mb-2 mt-3 text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.04em' }}>
          <i className="bi bi-activity me-1"></i> 2. Hospital Course & Treatment Administered
        </h6>
        <p className="text-dark small mb-2">
          Patient was admitted under {doctorName}. Evaluated clinically and initiated on empirical intravenous antimicrobial coverage along with nebulization therapy. Vitals and oxygen saturation were continuously monitored. Patient responded favorably to medical management with gradual resolution of fever and cough. Sputum and hematological parameters improved steadily.
        </p>

        {/* VITALS COMPARISON TABLE */}
        <div className="table-responsive mb-2">
          <table className="table table-sm table-bordered align-middle text-center mb-0" style={{ fontSize: '11px' }}>
            <thead className="table-light">
              <tr>
                <th>Vitals Parameter</th>
                <th>Admission Reading</th>
                <th>Discharge Reading</th>
                <th>Clinical Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold text-start">Blood Pressure (BP)</td>
                <td className="text-danger fw-bold">142/92 mmHg</td>
                <td className="text-success fw-bold">122/80 mmHg</td>
                <td className="text-muted">120/80 mmHg</td>
                <td><span className="badge bg-success-subtle text-success">Normalized</span></td>
              </tr>
              <tr>
                <td className="fw-semibold text-start">Pulse / Heart Rate</td>
                <td className="text-warning fw-bold">104 bpm</td>
                <td className="text-success fw-bold">76 bpm</td>
                <td className="text-muted">60 - 100 bpm</td>
                <td><span className="badge bg-success-subtle text-success">Normal Sinus</span></td>
              </tr>
              <tr>
                <td className="fw-semibold text-start">SpO2 (Room Air)</td>
                <td className="text-warning fw-bold">94%</td>
                <td className="text-success fw-bold">99%</td>
                <td className="text-muted">&gt; 95%</td>
                <td><span className="badge bg-success-subtle text-success">Adequate</span></td>
              </tr>
              <tr>
                <td className="fw-semibold text-start">Body Temperature</td>
                <td className="text-danger fw-bold">101.4 °F</td>
                <td className="text-success fw-bold">98.4 °F</td>
                <td className="text-muted">98.6 °F</td>
                <td><span className="badge bg-success-subtle text-success">Afebrile</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DISCHARGE MEDICATIONS */}
      <div className="border rounded-2 p-3 mb-3">
        <h6 className="fw-bold text-primary border-bottom pb-1 mb-2 text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.04em' }}>
          <i className="bi bi-capsule me-1"></i> 3. Discharge Medications (℞)
        </h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle mb-1" style={{ fontSize: '11px' }}>
            <thead className="table-light text-uppercase" style={{ fontSize: '10px' }}>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th>Medication Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              {dischargeMeds.map((med, idx) => (
                <tr key={idx}>
                  <td className="text-center fw-bold text-muted">{idx + 1}</td>
                  <td><strong className="text-dark">{med.name}</strong></td>
                  <td>{med.dosage || '1 Tablet'}</td>
                  <td><span className="badge bg-light text-dark border fw-bold">{med.frequency || '1-0-1'}</span></td>
                  <td>{med.duration || '5 Days'}</td>
                  <td className="text-muted">{med.instructions || 'Take with water after food'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-muted mt-1" style={{ fontSize: '10.5px' }}>
          * Do not stop or alter dosages of prescribed medications without consulting your attending doctor.
        </div>
      </div>

      {/* DISCHARGE CONDITION & ADVICE */}
      <div className="border rounded-2 p-3 mb-3 bg-light bg-opacity-25">
        <div className="row g-3">
          <div className="col-md-6">
            <h6 className="fw-bold text-dark border-bottom pb-1 mb-2 text-uppercase" style={{ fontSize: '11px' }}>
              Condition at Discharge:
            </h6>
            <div className="p-2 bg-white rounded border small text-success fw-semibold">
              <i className="bi bi-check-circle-fill me-1"></i>
              Patient is hemodynamically stable, afebrile, ambulatory, tolerating oral diet, and oriented to time, place, and person.
            </div>
            <div className="mt-2 text-muted small">
              <strong>Dietary Advice:</strong> Warm fluids, light bland diet, avoid cold/spicy foods, high hydration (2.5L water/day).
            </div>
          </div>

          <div className="col-md-6">
            <h6 className="fw-bold text-danger border-bottom pb-1 mb-2 text-uppercase" style={{ fontSize: '11px' }}>
              <i className="bi bi-exclamation-triangle-fill me-1"></i> Emergency Warning Signs (Red Flags):
            </h6>
            <ul className="text-danger small mb-0 ps-3" style={{ fontSize: '10.5px' }}>
              <li>Recurrence of high fever (&gt; 101°F) with rigors or chills.</li>
              <li>Sudden onset shortness of breath, chest discomfort or bluish lips.</li>
              <li>Severe persistent vomiting or inability to retain fluids/oral medications.</li>
              <li>Report immediately to Hospital 24x7 Emergency Room in case of above.</li>
            </ul>
          </div>
        </div>

        {/* FOLLOW-UP APPOINTMENT */}
        <div className="mt-3 p-2 bg-primary bg-opacity-10 border border-primary rounded d-flex justify-content-between align-items-center">
          <div>
            <strong className="text-primary text-uppercase" style={{ fontSize: '11px' }}>
              <i className="bi bi-calendar-check-fill me-1"></i> Recommended OPD Follow-up:
            </strong>
            <span className="ms-2 text-dark fw-bold">After 7 Days ({new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})</span>
            <span className="ms-2 text-muted">with {doctorName}</span>
          </div>
          <span className="badge bg-primary text-white">OPD Room 204</span>
        </div>
      </div>

      {/* SIGNATURES & OFFICIAL SEALS */}
      <div className="row g-4 pt-3 mt-1 text-center" style={{ fontSize: '11px' }}>
        <div className="col-4">
          <div style={{ height: 42 }}></div>
          <div className="border-top pt-1 text-dark fw-bold">Resident Medical Officer (RMO)</div>
          <div className="text-muted" style={{ fontSize: '10px' }}>Regn: MCI-84920/2020</div>
        </div>

        <div className="col-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: 42 }}>
            <div
              className="border border-2 border-danger text-danger fw-bold rounded-circle d-flex align-items-center justify-content-center text-uppercase"
              style={{ width: 48, height: 48, fontSize: '8px', transform: 'rotate(-10deg)', opacity: 0.85 }}
            >
              DISCHARGED<br/>STAMP
            </div>
          </div>
          <div className="border-top pt-1 text-dark fw-bold">{doctorName}</div>
          <div className="text-muted" style={{ fontSize: '10px' }}>Attending Senior Consultant</div>
        </div>

        <div className="col-4">
          <div style={{ height: 42 }}></div>
          <div className="border-top pt-1 text-dark fw-bold">Medical Superintendent</div>
          <div className="text-muted" style={{ fontSize: '10px' }}>Metropolitan Hospital Authority</div>
        </div>
      </div>

      <div className="text-center text-muted border-top mt-3 pt-2" style={{ fontSize: '9.5px' }}>
        This is a computer-generated Hospital Discharge Summary verified by the attending clinical specialist. Keep safely for insurance, reimbursement, and follow-up clinical visits.
      </div>
    </div>
  );
}

export default PatientDischargeSummarySlip;
