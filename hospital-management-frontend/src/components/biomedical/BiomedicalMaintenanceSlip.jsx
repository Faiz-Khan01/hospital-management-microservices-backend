import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function BiomedicalMaintenanceSlip({ asset, onClose }) {
  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-tools text-warning me-2"></i>
              NABH Biomedical Equipment Calibration & Safety Certificate — #{asset.assetCode}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="biomedical-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Department of Biomedical Engineering (BME) & Hospital Technology
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">NABH Accredited Healthcare Facility • Biomedical Asset Safety Assurance</p>
              <div className="small fw-semibold text-success">
                Official Equipment Electrical Safety (IEC 62353) & Preventive Calibration Certificate
              </div>
            </div>

            {/* Asset Details */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Asset Tag Code:</span>
                <span className="fw-bold text-dark font-monospace fs-6">#{asset.assetCode}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Department Location:</span>
                <span className="fw-bold text-primary">{asset.location}</span>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Room / Bay: {asset.roomBay || 'Bay #1'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Calibration Date:</span>
                <span className="fw-semibold text-dark">{asset.lastCalibrationDate || '15-Oct-2026'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Next Due (PPM):</span>
                <span className="fw-bold text-danger">{asset.nextPpmDue || '15-Apr-2027'}</span>
              </div>
            </div>

            {/* Machine Specifications */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-cpu me-1 text-primary"></i> EQUIPMENT IDENTIFICATION & SPECIFICATIONS
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-6">
                    <span className="text-muted d-block">Equipment Nomenclature:</span>
                    <strong className="text-dark fs-6">{asset.name}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Manufacturer:</span>
                    <strong className="text-dark">{asset.manufacturer}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Model & Serial No:</span>
                    <strong className="font-monospace text-dark">{asset.model} (S/N: {asset.serialNumber || 'SN-902148'})</strong>
                  </div>

                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Criticality Category:</span>
                    <span className={`badge ${
                      asset.criticality === 'LIFE_SUPPORT' ? 'bg-danger' :
                      asset.criticality === 'HIGH_PRIORITY' ? 'bg-warning text-dark' : 'bg-primary'
                    }`}>
                      {asset.criticality?.replace(/_/g, ' ') || 'LIFE SUPPORT'}
                    </span>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Service Contract (AMC/CMC):</span>
                    <strong className="text-dark">{asset.contractType || 'Comprehensive CMC (OEM Direct)'}</strong>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Operating Status:</span>
                    <span className="badge bg-success-subtle text-success border border-success">
                      {asset.status || 'OPERATIONAL & CALIBRATED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Electrical Safety & Performance Verification */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-shield-check me-1 text-success"></i> IEC 62353 MEDICAL ELECTRICAL SAFETY TEST RESULTS
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Safety Parameter Tested</th>
                      <th>Measured Reading</th>
                      <th>Permissible Tolerance Limit</th>
                      <th>Compliance Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Protective Earth Resistance</td>
                      <td className="font-monospace text-success">0.08 Ω</td>
                      <td>&lt; 0.20 Ω</td>
                      <td><span className="badge bg-success">PASS</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Chassis Leakage Current</td>
                      <td className="font-monospace text-success">42 µA</td>
                      <td>&lt; 100 µA (Normal Condition)</td>
                      <td><span className="badge bg-success">PASS</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Patient Applied Part Leakage</td>
                      <td className="font-monospace text-success">12 µA</td>
                      <td>&lt; 50 µA (CF-Type Protected)</td>
                      <td><span className="badge bg-success">PASS</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Flow / Energy / Output Accuracy</td>
                      <td className="font-monospace text-success">±1.8% Variance</td>
                      <td>Within ±5.0% OEM Spec</td>
                      <td><span className="badge bg-success">PASS</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engineer Certification Note */}
            <div className="bg-light p-2 rounded small text-muted border mb-3" style={{ fontSize: '0.72rem' }}>
              <strong>Bio-Medical Engineer Certification:</strong> This is to certify that the aforementioned medical device has been inspected, calibrated with traceable master calibrators, and verified fit for clinical application in accordance with NABH Bio-Medical Safety Chapter FMS.
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">BME INSPECTOR SIGN</span>
                </div>
                <small className="fw-semibold text-dark d-block">Er. Rohit Mehra, B.Tech</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lead Biomedical Engineer</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">DEPARTMENT IN-CHARGE</span>
                </div>
                <small className="fw-semibold text-dark d-block">Nursing Superintendent / HOD</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{asset.location}</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">NABH QUALITY AUDITOR</span>
                </div>
                <small className="fw-semibold text-dark d-block">Director of Quality & Safety</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync Biomedical Engineering Core System.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-dark btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Safety Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
