import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function MortuaryHandoverSlip({ record, onClose }) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-file-earmark-medical-fill me-2 text-danger"></i>
              Form 4/4A Institutional Death Summary & Mortuary Release Gatepass — #{record.deathRegNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="mortuary-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Department of Forensic Medicine & Mortuary Services
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">Registration of Births & Deaths Act, 1969 • Form No. 4/4A Standard</p>
              <div className="small fw-semibold text-danger">
                Official Institutional Medical Certificate of Cause of Death & Morgue Handover Gatepass
              </div>
            </div>

            {/* Registry Info */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Death Reg No:</span>
                <span className="fw-bold text-danger font-monospace fs-6">#{record.deathRegNumber}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Morgue Cold Bay:</span>
                <span className="fw-bold text-dark">{record.freezerBay}</span>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Chamber Temp: {record.bayTemp || '2.8 °C'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Date & Time of Death:</span>
                <span className="fw-semibold text-dark">{record.dateOfDeath} • {record.timeOfDeath}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">MLC / Forensic Status:</span>
                <span className={`badge ${record.isMlc ? 'bg-danger' : 'bg-secondary'} px-2 py-1`}>
                  {record.isMlc ? `MLC: ${record.mlcNumber || 'POLICE-FIR-901'}` : 'NON-MEDICO-LEGAL'}
                </span>
              </div>
            </div>

            {/* Deceased Particulars */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-person-bounding-box me-1 text-primary"></i> DECEASED PATIENT PARTICULARS
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-4">
                    <span className="text-muted d-block">Deceased Full Name:</span>
                    <strong className="text-dark fs-6">{record.patientName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>UHID: {record.patientUhid || 'UHID-8819'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Age / Gender / Blood:</span>
                    <strong className="text-dark">{record.patientAge || '62'} Yrs / {record.patientGender || 'Male'} • {record.bloodGroup || 'B+'}</strong>
                    <div className="text-muted">Aadhaar / ID: {record.patientAadhaar || 'XXXX-XXXX-9012'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Last Admitted Ward:</span>
                    <strong className="text-dark">{record.wardName || 'Intensive Care Unit (ICU)'}</strong>
                    <div className="text-muted">Attending: {record.attendingDoctor || 'Dr. Sarah Jenkins'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Cause of Death (WHO Form 4 Format) */}
            <div className="card mb-3 border-danger-subtle">
              <div className="card-header bg-danger-subtle text-danger fw-bold py-1 small">
                <i className="bi bi-heartbreak me-1"></i> CAUSE OF DEATH DECLARATION (FORM 4 FORMAT)
              </div>
              <div className="card-body p-3 small">
                <div className="mb-2">
                  <span className="text-muted d-block">I. (a) Immediate Cause of Death:</span>
                  <strong className="text-dark fs-6">{record.immediateCause || 'Refractory Cardiogenic Shock & Asystole'}</strong>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">(b) Antecedent / Underlying Cause:</span>
                  <strong className="text-dark">{record.underlyingCause || 'Extensive Anterior Wall Myocardial Infarction'}</strong>
                </div>
                <div>
                  <span className="text-muted d-block">II. Other Significant Conditions:</span>
                  <strong className="text-dark">{record.otherConditions || 'Type-2 Diabetes Mellitus with Triple Vessel Coronary Disease'}</strong>
                </div>
              </div>
            </div>

            {/* Handover Next-of-Kin Details */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-people-fill me-1 text-success"></i> NEXT-OF-KIN / CLAIMANT IDENTIFICATION
              </div>
              <div className="card-body p-3 small">
                <div className="row g-2">
                  <div className="col-md-4">
                    <span className="text-muted d-block">Claimant Relative Name:</span>
                    <strong className="text-dark fs-6">{record.claimantName || 'Suresh Sharma'}</strong>
                    <div className="text-muted">Relation: {record.claimantRelation || 'Son'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Government Photo ID Verified:</span>
                    <strong className="text-dark">{record.claimantIdType || 'Aadhaar Card'}</strong>
                    <div className="text-muted font-monospace">{record.claimantIdNumber || 'XXXX-XXXX-4512'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Contact Phone & Address:</span>
                    <strong className="text-dark">{record.claimantPhone || '+91 98765 43210'}</strong>
                    <div className="text-muted text-truncate">{record.claimantAddress || 'New Delhi, India'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Release Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">TREATING DOCTOR</span>
                </div>
                <small className="fw-bold text-dark d-block">{record.attendingDoctor || 'Dr. Sarah Jenkins'}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Physician Declaring Death</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">RECEIVER SIGN / THUMB</span>
                </div>
                <small className="fw-semibold text-dark d-block">{record.claimantName || 'Next of Kin'}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Body Received in Order</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">MORTUARY OFFICER STAMP</span>
                </div>
                <small className="fw-semibold text-dark d-block">Medical Superintendent</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Official Institutional Death Document. Duplicate copy retained in Hospital Medico-Legal Records Vault.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-dark btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Death Summary & Gatepass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
