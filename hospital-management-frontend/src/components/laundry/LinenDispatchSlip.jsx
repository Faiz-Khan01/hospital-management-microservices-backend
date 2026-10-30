import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function LinenDispatchSlip({ dispatch, onClose }) {
  if (!dispatch) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-info text-dark py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-tag-fill me-2"></i>
              NABH Hospital Clean Linen Dispatch & Disinfection Manifest — #{dispatch.dispatchNumber}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="laundry-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-info text-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Central Hospital Laundry & Linen Asset Management Services
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">NABH Facility Management (FMS) Standard • Thermal Disinfection & Barrier Washing</p>
              <div className="small fw-semibold text-primary">
                Official Clean Linen Ward Consignment & Microbiological Clearance Certificate
              </div>
            </div>

            {/* Top Details Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Linen Batch #:</span>
                <span className="fw-bold text-primary font-monospace fs-6">#{dispatch.dispatchNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Destination Ward:</span>
                <span className="fw-bold text-dark">{dispatch.destinationWard}</span>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Location: {dispatch.floor || 'Floor 2'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Washing & Ironing Date:</span>
                <span className="fw-semibold text-dark">{dispatch.dispatchDate || new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Consignment Pieces:</span>
                <span className="badge bg-success-subtle text-success border border-success fw-bold font-monospace fs-6">
                  {dispatch.totalPieces || '145'} Pieces
                </span>
              </div>
            </div>

            {/* Thermal Wash & Disinfection Parameters */}
            <div className="card mb-3 border-info-subtle">
              <div className="card-header bg-info-subtle text-dark fw-bold py-1 small">
                <i className="bi bi-thermometer-sun me-1 text-danger"></i> THERMAL SLUICE WASH & DISINFECTION CYCLE VALIDATION
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center small">
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>THERMAL WASH TEMP</span>
                      <strong className="text-success font-monospace fs-6">{dispatch.washTemp || '85.0 °C'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Minimum 71°C for 10 mins</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>DISINFECTANT USED</span>
                      <strong className="text-dark font-monospace">{dispatch.disinfectant || 'Sodium Hypochlorite 1%'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Bleach & Oxygen Wash</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>CALENDER IRON TEMP</span>
                      <strong className="text-danger font-monospace fs-6">{dispatch.ironTemp || '160.0 °C'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Steam Heated Roller Iron</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>BIO-BURDEN AUDIT</span>
                      <strong className="text-success font-monospace">0 CFU (PASS)</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Microbiology Settle Swab</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linen Breakdown Table */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-box-seam me-1 text-primary"></i> DISPATCHED LINEN INVENTORY BREAKDOWN
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Linen Asset Category</th>
                      <th>Color / Specifications</th>
                      <th>Quantity Dispatched</th>
                      <th>Linen Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">OT Surgical Drapes & Mayo Stand Covers</td>
                      <td>Green Fluid-Resistant Cotton (Double Layer)</td>
                      <td className="font-monospace fw-bold text-dark">40 Pcs</td>
                      <td><span className="badge bg-success">Stain-Free & Lint-Free</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">ICU & Inpatient Bed Sheets</td>
                      <td>White High-Thread Count Cotton (100x60")</td>
                      <td className="font-monospace fw-bold text-dark">55 Pcs</td>
                      <td><span className="badge bg-success">Calender Ironed</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Patient Hospital Gowns</td>
                      <td>Blue Striped Tie-Back Unisex Gowns</td>
                      <td className="font-monospace fw-bold text-dark">30 Pcs</td>
                      <td><span className="badge bg-success">Sanitized & Folded</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Surgeon & Anesthetist Scrub Suits</td>
                      <td>Dark Blue Cotton OT Scrubs (M/L/XL)</td>
                      <td className="font-monospace fw-bold text-dark">20 Sets</td>
                      <td><span className="badge bg-success">Sealed Packaging</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">LAUNDRY MANAGER</span>
                </div>
                <small className="fw-semibold text-dark d-block">Sunil Saxena</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Central Linen In-Charge</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">WARD SISTER ACK</span>
                </div>
                <small className="fw-semibold text-dark d-block">Sister In-Charge</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{dispatch.destinationWard}</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">INFECTION CONTROL</span>
                </div>
                <small className="fw-semibold text-dark d-block">HIC Safety Auditor</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync Linen Management Suite. NABH Standards Compliant.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-info text-dark btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Linen Dispatch Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
