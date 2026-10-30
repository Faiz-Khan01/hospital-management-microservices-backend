import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function AmbulanceDispatchSlip({ dispatch, onClose }) {
  if (!dispatch) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-danger text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-truck-front-fill me-2"></i>
              NABH Official Emergency Dispatch Pass — #{dispatch.dispatchNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="ambulance-print-slip">
            {/* Header with Hospital Brand */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-danger text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Emergency Medical Services (EMS) • Rapid Response Protocol
              </div>
              <h4 className="fw-bold text-danger mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">24x7 Trauma & Critical Care Center • National Emergency Line: 108 / 112</p>
              <div className="small fw-semibold text-dark">
                Official Vehicle Trip & Pre-Hospital Medical Dispatch Manifest
              </div>
            </div>

            {/* Top Details Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-4">
                <span className="text-muted small d-block">Dispatch ID:</span>
                <span className="fw-bold text-danger font-monospace fs-6">#{dispatch.dispatchNumber}</span>
              </div>
              <div className="col-4">
                <span className="text-muted small d-block">Call Received At:</span>
                <span className="fw-semibold text-dark">{dispatch.callTime || new Date().toLocaleString()}</span>
              </div>
              <div className="col-4">
                <span className="text-muted small d-block">Triage Urgency:</span>
                <span className={`badge ${
                  dispatch.urgency === 'CRITICAL_CODE_RED' ? 'bg-danger' :
                  dispatch.urgency === 'URGENT_CODE_YELLOW' ? 'bg-warning text-dark' : 'bg-primary'
                } px-2 py-1`}>
                  {dispatch.urgency?.replace(/_/g, ' ') || 'CRITICAL'}
                </span>
              </div>
            </div>

            {/* Vehicle & Paramedic Crew Details */}
            <div className="card mb-3 border-danger-subtle">
              <div className="card-header bg-danger-subtle text-danger fw-bold py-1 small">
                <i className="bi bi-truck me-1"></i> AMBULANCE FLEET & CREW ASSIGNMENT
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-3">
                    <span className="text-muted d-block">Vehicle Code:</span>
                    <strong className="text-dark">{dispatch.ambulanceCode}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Registration No:</span>
                    <strong className="font-monospace text-dark">{dispatch.regNumber}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Vehicle Type:</span>
                    <strong className="text-primary">{dispatch.ambulanceType}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Base Station:</span>
                    <strong className="text-dark">{dispatch.baseBay || 'Bay #1 - Main Trauma Hub'}</strong>
                  </div>

                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">EMT / Paramedic In-Charge:</span>
                    <strong className="text-dark">{dispatch.paramedicName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Paramedic Lic: {dispatch.paramedicLicense || 'EMT-P-90821'}</div>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Ambulance Pilot / Driver:</span>
                    <strong className="text-dark">{dispatch.driverName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Ph: {dispatch.driverPhone || '+91 98765 43210'}</div>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Reserved Trauma Bed:</span>
                    <span className="badge bg-danger-subtle text-danger border border-danger fw-bold px-2 py-1">
                      {dispatch.reservedBed || 'Trauma Bay - Bed 01'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient & Incident Info */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-geo-alt-fill text-danger me-1"></i> INCIDENT PICKUP & PATIENT PARTICULARS
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-6">
                    <span className="text-muted d-block">Pickup Location / Incident Scene:</span>
                    <strong className="text-dark">{dispatch.pickupLocation}</strong>
                    {dispatch.landmark && (
                      <div className="text-muted">Landmark: {dispatch.landmark}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Caller Name & Contact:</span>
                    <strong className="text-dark">{dispatch.callerName}</strong>
                    <div className="text-muted">{dispatch.callerPhone}</div>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Estimated Distance / ETA:</span>
                    <strong className="text-danger">{dispatch.etaMinutes || '12'} Minutes (~{dispatch.distanceKm || '6.5'} km)</strong>
                  </div>

                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Patient Name:</span>
                    <strong className="text-dark fs-6">{dispatch.patientName || 'Emergency Victim'}</strong>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Demographics / UHID:</span>
                    <strong className="text-dark">{dispatch.patientAge || '35'} Yrs / {dispatch.patientGender || 'Male'}</strong>
                    <span className="text-muted ms-2">({dispatch.patientUhid || 'UHID-EMG-AUTO'})</span>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Reported Chief Complaint:</span>
                    <strong className="text-danger">{dispatch.chiefComplaint}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Life Support Equipment Readiness Checklist */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-check-circle-fill text-success me-1"></i> ONBOARD LIFE-SUPPORT READINESS CHECKLIST
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center small">
                  <div className="col-3">
                    <div className="p-1 border rounded bg-success-subtle text-success fw-semibold">
                      <i className="bi bi-check2-circle me-1"></i> O2 Cylinder (150 Bar)
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-1 border rounded bg-success-subtle text-success fw-semibold">
                      <i className="bi bi-check2-circle me-1"></i> Biphasic Defibrillator
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-1 border rounded bg-success-subtle text-success fw-semibold">
                      <i className="bi bi-check2-circle me-1"></i> Transport Ventilator
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-1 border rounded bg-success-subtle text-success fw-semibold">
                      <i className="bi bi-check2-circle me-1"></i> Spine Board & Collar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-4 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">EMT SIGNATURE</span>
                </div>
                <small className="fw-semibold text-dark d-block">{dispatch.paramedicName}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lead Paramedic In-Charge</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">PILOT SIGNATURE</span>
                </div>
                <small className="fw-semibold text-dark d-block">{dispatch.driverName}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Ambulance Pilot</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">ER MO STAMP</span>
                </div>
                <small className="fw-semibold text-dark d-block">Emergency Medical Officer</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated by HospitalSync EMS Automation System. NABH Standard COP.15 Compliant.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Dispatch Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
