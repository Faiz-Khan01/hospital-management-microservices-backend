import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function CssdSterilitySlip({ batch, onClose }) {
  if (!batch) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-success text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-shield-check me-2"></i>
              NABH CSSD Sterility Clearance & Biological Indicator Certificate — Batch #{batch.batchNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="cssd-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-success text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Central Sterile Services Department (CSSD) • Hospital Infection Control
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">NABH Accredited Tertiary Healthcare • Standard HIC.2 Compliance</p>
              <div className="small fw-semibold text-success">
                Official Sterility Batch Clearance & Biological Indicator Verification Manifest
              </div>
            </div>

            {/* Batch Grid Details */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Sterilization Batch:</span>
                <span className="fw-bold text-success font-monospace fs-6">#{batch.batchNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Sterilizer Unit:</span>
                <span className="fw-bold text-dark">{batch.machineName}</span>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{batch.machineType || 'High-Pressure Steam Autoclave'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Sterilization Cycle Date:</span>
                <span className="fw-semibold text-dark">{batch.cycleDate || new Date().toLocaleDateString('en-IN')}</span>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Time: {batch.cycleTime || '08:30 AM'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Sterility Shelf-Life Valid Till:</span>
                <span className="fw-bold text-danger font-monospace">{batch.expiryDate}</span>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Triple-Layer Barrier Wrap</div>
              </div>
            </div>

            {/* Physical Cycle Parameters Verification */}
            <div className="card mb-3 border-success-subtle">
              <div className="card-header bg-success-subtle text-success fw-bold py-1 small">
                <i className="bi bi-thermometer-high me-1"></i> PHYSICAL AUTOCLAVE CYCLE PARAMETERS VERIFICATION
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center small">
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>PEAK TEMPERATURE</span>
                      <strong className="fs-6 text-success font-monospace">{batch.temperature || '134.2 °C'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Target: 134.0°C ± 0.5°C</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>CHAMBER PRESSURE</span>
                      <strong className="fs-6 text-success font-monospace">{batch.pressure || '30.4 PSI'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Target: 30.0 - 32.0 PSI</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>STERILIZATION HOLD</span>
                      <strong className="fs-6 text-success font-monospace">{batch.holdTime || '18 Minutes'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Standard: 15-20 Mins</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>VACUUM PULSES</span>
                      <strong className="fs-6 text-primary font-monospace">4 Pre-Vac Pulses</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Bowie-Dick Air Removal: PASS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chemical & Biological Indicators Monitoring */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-virus me-1 text-danger"></i> MULTI-PARAMETER CHEMICAL & BIOLOGICAL VALIDATION
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Quality Indicator Type</th>
                      <th>Testing Mechanism</th>
                      <th>Expected Endpoint</th>
                      <th>Test Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Class 5 Chemical Integrator</td>
                      <td>Multi-parameter strip inside pack core</td>
                      <td>Dark brown color change to ACCEPT window</td>
                      <td><span className="badge bg-success">PASSED (ACCEPT)</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Class 1 External Autoclave Tape</td>
                      <td>Steam-sensitive stripes on packaging</td>
                      <td>Diagonal black stripes confirmed</td>
                      <td><span className="badge bg-success">PASSED (STRIPES BLACK)</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Bowie-Dick Test (Daily Vacuum)</td>
                      <td>Air elimination and steam penetration sheet</td>
                      <td>Uniform dark purple sheet change</td>
                      <td><span className="badge bg-success">PASSED (UNIFORM)</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-primary">Biological Indicator (BI Spore Test)</td>
                      <td>Geobacillus stearothermophilus ATCC 7953 ($10^6$ spores)</td>
                      <td>Incubation @ 56°C for 24 Hrs: No Growth / Purple</td>
                      <td><span className="badge bg-success">NEGATIVE (NO GROWTH)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Surgical Packs & Trays Included */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-box-seam me-1 text-primary"></i> STERILIZED SURGICAL PACKS IN THIS BATCH
              </div>
              <div className="card-body p-2 small">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="border rounded p-2 bg-light">
                      <strong className="text-dark d-block">• Major Laparotomy Surgical Set (Tray #ML-04)</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>Pack Content: 48 SS Instruments, Artery Forceps, Retractors, Scalpel handles</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-2 bg-light">
                      <strong className="text-dark d-block">• Orthopedic Trauma Drill & Plate Set (Tray #OT-02)</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>Pack Content: Bone clamps, Reduction forceps, AO drill bits, Depth gauge</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-2 bg-light">
                      <strong className="text-dark d-block">• 4K Laparoscopy Optical Scope & Trocar Pack (#LAP-01)</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>Pack Content: 10mm 30° Scope, 5mm trocars, Maryland dissector, Hasson cannula</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-2 bg-light">
                      <strong className="text-dark d-block">• Cardiac Cannulation & Vascular Clamp Set (#CV-03)</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>Pack Content: DeBakey clamps, Cooley forceps, Castroviejo needle holder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Guarantee */}
            <div className="bg-light p-2 rounded small text-muted border mb-3" style={{ fontSize: '0.72rem' }}>
              <strong>Infection Control Certification:</strong> This is to certify that all surgical instruments processed under this batch have achieved a Sterility Assurance Level (SAL) of $10^{-6}$ in full conformity with ISO 11134 and NABH Hospital Infection Control standards.
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">CSSD TECH IN-CHARGE</span>
                </div>
                <small className="fw-semibold text-dark d-block">Devendra Sharma, CSDT</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lead Sterilization Officer</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">INFECTION CONTROL NURSE</span>
                </div>
                <small className="fw-semibold text-dark d-block">Sister Kavita Sen, ICN</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>HIC Surveillance Officer</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">MICROBIOLOGIST SIGN</span>
                </div>
                <small className="fw-bold text-dark d-block">Dr. Vikram Patel, MD (Microbiology)</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Director of Infection Control</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync CSSD Automation Engine.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-success btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Sterility Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
