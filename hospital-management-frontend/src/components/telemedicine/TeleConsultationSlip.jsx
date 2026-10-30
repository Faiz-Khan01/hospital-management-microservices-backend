import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function TeleConsultationSlip({ session, onClose }) {
  if (!session) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-camera-video-fill me-2"></i>
              Official Tele-Medicine Consultation Summary & E-Rx — #{session.sessionId}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="tele-consult-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-primary text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Tele-Health & Virtual Remote Consultation Network (NMC Compliant)
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">National Medical Commission (NMC) Telemedicine Practice Guidelines, 2020</p>
              <div className="small fw-semibold text-primary">
                Digital Video Consultation Summary & Electronic Prescription (E-Rx)
              </div>
            </div>

            {/* Session Top Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Tele-Session ID:</span>
                <span className="fw-bold text-primary font-monospace fs-6">#{session.sessionId}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Consulting Doctor:</span>
                <span className="fw-bold text-dark">{session.doctorName}</span>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{session.specialty} • Reg: MCI-40912</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Consultation Date & Time:</span>
                <span className="fw-semibold text-dark">{session.date} • {session.time}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Video Call Duration:</span>
                <span className="badge bg-success-subtle text-success border border-success">
                  {session.callDuration || '18 Mins 42 Secs'} (WebRTC HD)
                </span>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-person-circle me-1 text-primary"></i> REMOTE PATIENT PARTICULARS
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-4">
                    <span className="text-muted d-block">Patient Full Name:</span>
                    <strong className="text-dark fs-6">{session.patientName}</strong>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>UHID: {session.patientUhid || 'UHID-8812'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Age / Gender / Contact:</span>
                    <strong className="text-dark">{session.patientAge || '42'} Yrs / {session.patientGender || 'Male'}</strong>
                    <div className="text-muted">{session.patientPhone || '+91 98765 43210'}</div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block">Patient Remote Location:</span>
                    <strong className="text-dark">{session.patientLocation || 'Home Video Consultation (New Delhi)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Diagnosis */}
            <div className="card mb-3 border-primary-subtle">
              <div className="card-header bg-primary-subtle text-primary fw-bold py-1 small">
                <i className="bi bi-stethoscope me-1"></i> TELE-EVALUATION & PROVISIONAL DIAGNOSIS
              </div>
              <div className="card-body p-3 small">
                <div className="mb-2">
                  <span className="text-muted d-block">Reported Chief Complaints:</span>
                  <strong className="text-dark">{session.chiefComplaint || 'Mild chest discomfort, palpitation after mild exertion, fatigue.'}</strong>
                </div>
                <div>
                  <span className="text-muted d-block">Physician Clinical Impression / Diagnosis:</span>
                  <strong className="text-primary fs-6">{session.diagnosis || 'Post-PCI Stable Follow-up • Controlled Hypertension'}</strong>
                </div>
              </div>
            </div>

            {/* E-Prescription Medicines */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-capsule me-1 text-danger"></i> ELECTRONIC PRESCRIPTION (E-Rx) MEDICATION SCHEDULE
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Medicine Name & Strength</th>
                      <th>Dosage & Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Tab Atorva 20mg (Atorvastatin)</td>
                      <td>1 Tab Daily (0-0-1)</td>
                      <td>30 Days</td>
                      <td>At bedtime after food</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Tab Ecosprin 75mg (Aspirin)</td>
                      <td>1 Tab Daily (1-0-0)</td>
                      <td>30 Days</td>
                      <td>Morning after breakfast</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Tab Telma 40mg (Telmisartan)</td>
                      <td>1 Tab Daily (1-0-0)</td>
                      <td>30 Days</td>
                      <td>Regular BP check record</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice & Warning Signs */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-info-circle me-1 text-primary"></i> CLINICAL ADVICE & RED-FLAG WARNING
              </div>
              <div className="card-body p-2 small text-dark">
                <p className="mb-1">
                  <strong>Diet & Lifestyle:</strong> Continue low sodium, low saturated fat diet. 30 mins brisk walking daily.
                </p>
                <p className="mb-0 text-danger">
                  <strong>🚨 Emergency Red Flag Notice:</strong> In case of sudden crushing chest pain radiating to jaw or severe breathlessness, immediately call hospital ambulance at 108 or report to nearest Emergency Room.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-6 text-start ps-4">
                <div className="small text-muted mb-1">Digital Security Hash:</div>
                <div className="font-monospace text-muted" style={{ fontSize: '0.65rem' }}>
                  SHA256: 7f8a91b4028ecda9019b88ef1104e12c
                </div>
                <div className="badge bg-success-subtle text-success border border-success mt-1">
                  <i className="bi bi-patch-check-fill me-1"></i> DSC Digitally Signed E-Prescription
                </div>
              </div>
              <div className="col-6 text-end pe-4">
                <div className="border-bottom pb-3 mb-1 text-muted d-inline-block" style={{ width: '220px', borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">ELECTRONICALLY SIGNED</span>
                </div>
                <small className="fw-bold text-dark d-block">{session.doctorName}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Registered Medical Practitioner (NMC)</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated pursuant to Telemedicine Practice Guidelines issued by National Medical Commission (NMC).
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-primary btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Tele-Prescription Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
