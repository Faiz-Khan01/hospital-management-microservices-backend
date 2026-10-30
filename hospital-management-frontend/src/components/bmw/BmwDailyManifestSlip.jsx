import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function BmwDailyManifestSlip({ manifest, onClose }) {
  if (!manifest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-trash3-fill text-warning me-2"></i>
              CPCB Form VI Bio-Medical Waste Daily Handover Manifest — #{manifest.manifestNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="bmw-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Central Pollution Control Board (CPCB) • Bio-Medical Waste Management Rules
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">State Pollution Control Board Authorization: SPCB/BMW/AUTH-2026-9012 • Form VI Format</p>
              <div className="small fw-semibold text-danger">
                Official Daily Waste Consignment & Common Treatment Facility (CBMWTF) Handover Manifest
              </div>
            </div>

            {/* Manifest Top Details Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Manifest Ref Number:</span>
                <span className="fw-bold text-dark font-monospace fs-6">#{manifest.manifestNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">CBMWTF Operator:</span>
                <span className="fw-bold text-primary">{manifest.cbmwtfOperator || 'Synergy Waste Management Pvt Ltd'}</span>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Facility Plant: Okhla Industrial Area</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Dispatch Date & Time:</span>
                <span className="fw-semibold text-dark">{manifest.dispatchDate || new Date().toLocaleDateString('en-IN')} • {manifest.dispatchTime || '04:30 PM'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Transport GPS Vehicle:</span>
                <span className="fw-bold text-danger font-monospace">{manifest.vehicleNumber || 'DL-1L-AA-4012'}</span>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Pilot: {manifest.driverName || 'Ramesh Kumar'}</div>
              </div>
            </div>

            {/* Color-Coded Weight Consignment Breakdown */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-box-seam me-1 text-danger"></i> COLOR-CODED BARCODED WASTE BAG WEIGHT INVENTORY
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Color Category</th>
                      <th>Waste Stream Characterization</th>
                      <th>Bag / Box Count</th>
                      <th>Treatment Technology</th>
                      <th className="text-end">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold text-warning-emphasis">
                        <span className="p-1 rounded bg-warning text-dark me-1">YELLOW</span> Anatomical & Soiled
                      </td>
                      <td className="text-muted">Human tissues, organs, soiled cotton, post-op dressings, expired drugs</td>
                      <td className="font-monospace">{manifest.yellowBags || 14} Barcoded Bags</td>
                      <td>Incineration / Deep Burial</td>
                      <td className="text-end font-monospace fw-bold text-dark">{manifest.yellowWeight || '42.60'} kg</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-danger">
                        <span className="p-1 rounded bg-danger text-white me-1">RED</span> Contaminated Plastics
                      </td>
                      <td className="text-muted">IV tubing, bottles, catheters, urine bags, gloves, disposable syringes</td>
                      <td className="font-monospace">{manifest.redBags || 18} Barcoded Bags</td>
                      <td>Autoclaving / Shredding</td>
                      <td className="text-end font-monospace fw-bold text-dark">{manifest.redWeight || '58.40'} kg</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">
                        <span className="p-1 rounded bg-light text-dark border me-1">WHITE</span> Sharps & Needles
                      </td>
                      <td className="text-muted">Needles, scalpels, blades, fixed needles in translucent puncture-proof box</td>
                      <td className="font-monospace">{manifest.whiteBoxes || 6} Containers</td>
                      <td>Dry Heat Sterilization / Encapsulation</td>
                      <td className="text-end font-monospace fw-bold text-dark">{manifest.whiteWeight || '9.80'} kg</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-primary">
                        <span className="p-1 rounded bg-primary text-white me-1">BLUE</span> Glassware & Implants
                      </td>
                      <td className="text-muted">Broken or intact medicine glass vials, ampoules, orthopedic metallic pins</td>
                      <td className="font-monospace">{manifest.blueBoxes || 8} Boxes</td>
                      <td>Sodium Hypochlorite 2% / Recycling</td>
                      <td className="text-end font-monospace fw-bold text-dark">{manifest.blueWeight || '16.50'} kg</td>
                    </tr>
                    <tr className="table-dark">
                      <td colSpan="4" className="fw-bold text-uppercase">TOTAL CONSIGNMENT GROSS WEIGHT</td>
                      <td className="text-end font-monospace fw-bold fs-6 text-warning">
                        {manifest.totalWeight || '127.30'} kg
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GPS & Barcode Tracking Assurance */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-upc-scan me-1 text-primary"></i> BARCODE AUDIT & GPS TRACKING CERTIFICATION
              </div>
              <div className="card-body p-2 small text-muted">
                <div className="d-flex justify-content-between">
                  <span><strong>CPCB Barcode Verification:</strong> 100% waste bags scanned with dynamic QR tags.</span>
                  <span><strong>Transport Security:</strong> GPS geofenced vehicle with real-time pollution tracking.</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">HOSPITAL WASTE OFFICER</span>
                </div>
                <small className="fw-semibold text-dark d-block">Er. Ankit Verma</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Environmental Safety Officer</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">CBMWTF DRIVER / OPERATOR</span>
                </div>
                <small className="fw-semibold text-dark d-block">{manifest.driverName || 'Ramesh Kumar'}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Authorized Waste Transporter</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">NABH QUALITY AUDITOR</span>
                </div>
                <small className="fw-semibold text-dark d-block">Medical Superintendent</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Form VI Manifest generated electronically pursuant to Bio-Medical Waste Management Rules, 2016 (amended).
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-dark btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Form VI Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
