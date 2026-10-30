import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function TpaClaimSettlementSlip({ claim, onClose }) {
  if (!claim) return null;

  const handlePrint = () => {
    window.print();
  };

  const p = claim.patient || {};

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-shield-check me-2"></i>
              IRDAI / NABH Cashless TPA Claim Settlement Manifest — #{claim.claimNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="tpa-settlement-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-primary text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Third Party Administrator (TPA) & Cashless Healthcare Desk
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">Empaneled Cashless Healthcare Provider • IRDAI Registry #HOSP-IND-9021</p>
              <div className="small fw-semibold text-primary">
                Official Pre-Authorization Sanction & Final Claim Settlement Certificate
              </div>
            </div>

            {/* Claim Identification Details */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Claim Ref Number:</span>
                <span className="fw-bold text-primary font-monospace fs-6">#{claim.claimNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">TPA / Insurance Company:</span>
                <span className="fw-bold text-dark">{claim.insuranceProvider}</span>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{claim.tpaDeskName || 'MediAssist / Vidal TPA'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Policy / ABHA Card ID:</span>
                <span className="fw-semibold text-dark font-monospace">{claim.policyNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Claim Status:</span>
                <span className={`badge ${
                  claim.status === 'SETTLED' ? 'bg-success' :
                  claim.status === 'PRE_AUTH_APPROVED' ? 'bg-primary' :
                  claim.status === 'UNDER_QUERY' ? 'bg-warning text-dark' : 'bg-secondary'
                } px-2 py-1`}>
                  {claim.status?.replace(/_/g, ' ') || 'PRE-AUTH SANCTIONED'}
                </span>
              </div>
            </div>

            {/* Patient & Policy Particulars */}
            <div className="card mb-3 border-primary-subtle">
              <div className="card-header bg-primary-subtle text-primary fw-bold py-1 small">
                <i className="bi bi-person-vcard me-1"></i> BENEFICIARY & HOSPITALIZATION DETAILS
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-4">
                    <span className="text-muted d-block">Patient Full Name:</span>
                    <strong className="text-dark fs-6">{p.name || claim.patientName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>UHID: {p.uhid || claim.patientUhid || 'UHID-9081'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Age / Gender / Contact:</span>
                    <strong className="text-dark">{p.age || claim.patientAge || '45'} Yrs / {p.gender || claim.patientGender || 'Male'}</strong>
                    <div className="text-muted">{p.contactNumber || claim.patientPhone || '+91 98765 43210'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Admission Date & Ward:</span>
                    <strong className="text-dark">{claim.admissionDate || '28-Oct-2026'}</strong>
                    <div className="text-muted">{claim.roomCategory || 'Twin Sharing Inpatient Room'}</div>
                  </div>

                  <div className="col-md-8 mt-2">
                    <span className="text-muted d-block">Primary Diagnosis / Treatment Given:</span>
                    <strong className="text-dark">{claim.treatmentDiagnosis}</strong>
                  </div>
                  <div className="col-md-4 mt-2">
                    <span className="text-muted d-block">Treating Specialist:</span>
                    <strong className="text-primary">{claim.treatingDoctor || 'Dr. Sarah Jenkins'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Admissibility & Cashless Breakdown */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-cash-stack me-1 text-success"></i> FINANCIAL ADMISSIBILITY & CASHLESS SETTLEMENT BREAKDOWN
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Financial Component</th>
                      <th>Computation Basis</th>
                      <th className="text-end">Amount (INR ₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Total Gross Hospital Bill</td>
                      <td className="text-muted">Room, Consultation, Labs, Surgery & Pharmacy</td>
                      <td className="text-end font-monospace fw-bold">₹{Number(claim.totalBillAmount || 75000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-primary">TPA Pre-Authorized / Sanctioned Limit</td>
                      <td className="text-muted">Approved by TPA Medical Adjudicator</td>
                      <td className="text-end font-monospace text-primary fw-bold">₹{Number(claim.approvedAmount || 65000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-danger">Co-Payment Deduction ({claim.copayPercentage || 10}%)</td>
                      <td className="text-muted">Policy clause co-pay payable by insured</td>
                      <td className="text-end font-monospace text-danger">(-) ₹{Number(claim.copayAmount || 6500).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-danger">Non-Medical / Excluded Expenses</td>
                      <td className="text-muted">Gloves, Sanitization, Admin charges per IRDAI list</td>
                      <td className="text-end font-monospace text-danger">(-) ₹{Number(claim.deductibleAmount || 2500).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="table-success">
                      <td className="fw-bold text-success">NET SETTLED CASHLESS BY TPA / GOVT</td>
                      <td className="text-success fw-semibold">Disbursed directly to Hospital Account</td>
                      <td className="text-end font-monospace fw-bold text-success fs-6">
                        ₹{Number(claim.netTpaDisbursed || 56000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="table-warning">
                      <td className="fw-bold text-dark">PATIENT DISCHARGE OUT-OF-POCKET BALANCE</td>
                      <td className="text-muted">Co-pay + Non-medical items payable at counter</td>
                      <td className="text-end font-monospace fw-bold text-danger fs-6">
                        ₹{Number(claim.patientPayable || 9000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NABH Compliance Declaration */}
            <div className="bg-light p-2 rounded small text-muted border mb-3" style={{ fontSize: '0.72rem' }}>
              <strong>IRDAI Declaration:</strong> The hospital confirms that cashless hospitalization was extended in accordance with General Insurance Council guidelines. Patient has been provided full tariff breakdown without undisclosed surcharges.
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">TPA DESK IN-CHARGE</span>
                </div>
                <small className="fw-semibold text-dark d-block">Authorized Signatory</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Hospital TPA Helpdesk</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">PATIENT / CLAIMANT</span>
                </div>
                <small className="fw-semibold text-dark d-block">{p.name || claim.patientName}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Policy Holder Signature</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">BILLING OFFICER STAMP</span>
                </div>
                <small className="fw-semibold text-dark d-block">Chief Finance Officer</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync TPA Insurance Automation Engine.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print TPA Settlement Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
