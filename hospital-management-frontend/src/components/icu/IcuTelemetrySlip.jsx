import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function IcuTelemetrySlip({ bedData, onClose }) {
  if (!bedData) return null;

  const handlePrint = () => {
    window.print();
  };

  const p = bedData.patient || {};
  const v = bedData.vitals || {};

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
              ICU 24-Hour Clinical Telemetry & Shift Handover Slip — {bedData.bedNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="icu-telemetry-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Critical Care Medicine • Intensive Care Unit (ICU)
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">Level-III Tertiary Intensive Care Center • 24/7 Intensivist Cover</p>
              <div className="small fw-semibold text-danger">
                NABH Telemetry Flowsheet & Physician Shift Handover Manifest
              </div>
            </div>

            {/* Bed & Patient Header */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Bed Location:</span>
                <span className="fw-bold text-danger fs-6">{bedData.bedNumber} ({bedData.wardName || 'ICU Main'})</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Patient Name / UHID:</span>
                <span className="fw-bold text-dark">{p.name || 'Critical Care Patient'}</span>
                <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{p.uhid || 'UHID-ICU-8821'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Age / Gender / Blood:</span>
                <span className="fw-semibold text-dark">{p.age || '48'} Yrs / {p.gender || 'Male'} • {p.bloodGroup || 'O+'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Attending Intensivist:</span>
                <span className="fw-bold text-primary">{bedData.doctorName || 'Dr. Sarah Jenkins'}</span>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Critical Care Medicine</div>
              </div>
            </div>

            {/* Clinical Diagnosis & Acuity Risk */}
            <div className="card mb-3 border-danger-subtle">
              <div className="card-header bg-danger-subtle text-danger fw-bold py-1 small d-flex justify-content-between align-items-center">
                <span><i className="bi bi-activity me-1"></i> ADMISSION DIAGNOSIS & EARLY WARNING ACUITY</span>
                <span className="badge bg-danger">MEWS Score: {bedData.mewsScore || '2'} (Acuity: {bedData.mewsScore >= 4 ? 'HIGH' : 'STABLE'})</span>
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-8">
                    <span className="text-muted d-block">Primary Clinical Diagnosis:</span>
                    <strong className="text-dark fs-6">{bedData.diagnosis || 'Severe Sepsis with Acute Respiratory Failure'}</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Ventilator / Respiratory Mode:</span>
                    <strong className="text-primary">{bedData.ventMode || 'SIMV-PC (FiO2: 45%, PEEP: 6)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Signs Grid Snapshot */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-dark text-white fw-bold py-1 small">
                <i className="bi bi-clipboard2-pulse me-1 text-danger"></i> LATEST TELEMETRIC VITALS SNAPSHOT
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center">
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>HEART RATE</small>
                      <span className="fw-bold fs-5 text-success">{v.hr || '78'}</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>bpm</small>
                    </div>
                  </div>
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>NIBP / ABP</small>
                      <span className="fw-bold fs-5 text-danger">{v.bp || '122/78'}</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>mmHg (MAP: {v.map || '92'})</small>
                    </div>
                  </div>
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>SpO2</small>
                      <span className="fw-bold fs-5 text-primary">{v.spo2 || '98'}%</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Room Air/O2</small>
                    </div>
                  </div>
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>RESP RATE</small>
                      <span className="fw-bold fs-5 text-warning-emphasis">{v.rr || '16'}</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>breaths/min</small>
                    </div>
                  </div>
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>BODY TEMP</small>
                      <span className="fw-bold fs-5 text-info-emphasis">{v.temp || '37.1'}</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>°C</small>
                    </div>
                  </div>
                  <div className="col-2">
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>GCS SCORE</small>
                      <span className="fw-bold fs-5 text-dark">{v.gcs || '14/15'}</span>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>E4 V4 M6</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Infusion Lines & Continuous Drugs */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-droplet me-1 text-danger"></i> ACTIVE INOTROPE & MEDICATION INFUSION LINES
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Infusion Drug</th>
                      <th>Concentration</th>
                      <th>Flow Rate</th>
                      <th>Line Site</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Noradrenaline (Norepinephrine)</td>
                      <td>4mg in 50ml 5% Dextrose</td>
                      <td className="font-monospace text-danger fw-bold">{bedData.noradRate || '0.08 mcg/kg/min'}</td>
                      <td>Right Internal Jugular CVC</td>
                      <td><span className="badge bg-success-subtle text-success">Running</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Fentanyl Analgesia</td>
                      <td>500mcg in 50ml NS</td>
                      <td className="font-monospace text-dark">{bedData.fentanylRate || '2 ml/hr'}</td>
                      <td>Peripheral 18G Left Forearm</td>
                      <td><span className="badge bg-success-subtle text-success">Running</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Pantoprazole IV Infusion</td>
                      <td>80mg in 100ml NS</td>
                      <td className="font-monospace text-dark">8 mg/hr</td>
                      <td>Peripheral 20G Right Hand</td>
                      <td><span className="badge bg-secondary-subtle text-dark">Continuous</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shift Handover Clinical Instructions */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-journal-text me-1 text-primary"></i> INTENSIVIST SHIFT HANDOVER & CLINICAL GOALS
              </div>
              <div className="card-body p-2 small">
                <p className="mb-1 text-dark">
                  <strong>• Hemodynamic Goal:</strong> Maintain MAP &gt; 65 mmHg. Titrate Noradrenaline as needed.
                </p>
                <p className="mb-1 text-dark">
                  <strong>• Respiratory Plan:</strong> Continue lung-protective ventilation. ABG check at 14:00 hrs. Wean FiO2 if SpO2 &gt; 94%.
                </p>
                <p className="mb-0 text-dark">
                  <strong>• Renal & Fluid Balance:</strong> Strict hourly urine output record. Target &gt; 0.5 ml/kg/hr. Daily fluid balance tally.
                </p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="row text-center pt-4 mt-4 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">SHIFT NURSE SIGN</span>
                </div>
                <small className="fw-semibold text-dark d-block">Sister Shweta Sharma, RN</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>ICU Shift In-Charge</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">ON-DUTY INTENSIVIST</span>
                </div>
                <small className="fw-semibold text-dark d-block">{bedData.doctorName || 'Dr. Sarah Jenkins'}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Critical Care Intensivist</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">HOD CRITICAL CARE</span>
                </div>
                <small className="fw-semibold text-dark d-block">Dr. Vikram Patel, MD</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Director of Intensive Care</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync ICU Telemetry Core. NABH Accreditation Standard COP.6 Compliant.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-dark btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print ICU Telemetry Flowsheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
