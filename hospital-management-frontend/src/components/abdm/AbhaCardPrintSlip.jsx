import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function AbhaCardPrintSlip({ abhaRecord, onClose }) {
  if (!abhaRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-qr-code me-2"></i>
              ABDM Official ABHA Digital Health Card — {abhaRecord.abhaNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light text-center" id="abha-card-print">
            {/* National ABHA Card Container */}
            <div
              className="card border-0 shadow mx-auto text-start overflow-hidden position-relative"
              style={{
                maxWidth: '420px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #075985 100%)',
                color: '#ffffff'
              }}
            >
              {/* Card Top Branding Header */}
              <div className="p-3 pb-2 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white p-1 rounded-circle" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-heart-pulse-fill text-danger fs-5"></i>
                  </div>
                  <div>
                    <strong className="d-block small text-uppercase tracking-wider" style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                      National Health Authority (NHA)
                    </strong>
                    <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Ayushman Bharat Digital Mission</span>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-warning text-dark fw-bold font-monospace px-2 py-1" style={{ fontSize: '0.65rem' }}>
                    ABDM M1/M2/M3
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3">
                <div className="row g-2 align-items-center mb-3">
                  {/* Photo / Avatar */}
                  <div className="col-4 text-center">
                    <div
                      className="rounded-3 bg-white bg-opacity-20 border border-white border-opacity-50 p-2 d-flex flex-column align-items-center justify-content-center shadow-sm"
                      style={{ height: '110px' }}
                    >
                      <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                      <span className="small text-white" style={{ fontSize: '0.65rem' }}>VERIFIED</span>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="col-8">
                    <h5 className="fw-bold mb-1 text-white">{abhaRecord.patientName}</h5>
                    <div className="small opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>
                      DOB / YOB: <strong>{abhaRecord.yob || '1984'}</strong> • Gender: <strong>{abhaRecord.gender || 'Male'}</strong>
                    </div>
                    <div className="small opacity-75 mb-1" style={{ fontSize: '0.75rem' }}>
                      Mobile: <strong>{abhaRecord.mobile || '+91 98765 43210'}</strong>
                    </div>
                    <div className="small font-monospace text-warning fw-semibold text-truncate" style={{ fontSize: '0.8rem' }}>
                      @{abhaRecord.abhaAddress || 'user@abdm'}
                    </div>
                  </div>
                </div>

                {/* 14-Digit ABHA Number Display */}
                <div className="bg-black bg-opacity-30 rounded-3 p-2 text-center border border-white border-opacity-20 mb-3">
                  <span className="small text-uppercase opacity-75 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                    14-Digit Official ABHA Number
                  </span>
                  <span className="fs-5 fw-bold font-monospace text-warning" style={{ letterSpacing: '2px' }}>
                    {abhaRecord.abhaNumber}
                  </span>
                </div>

                {/* QR Code & Scan-and-Share Section */}
                <div className="d-flex justify-content-between align-items-center bg-white text-dark rounded-3 p-2">
                  <div className="small pe-2">
                    <strong className="d-block" style={{ fontSize: '0.75rem' }}>Scan & Share at Hospital OPD</strong>
                    <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                      Instantly registers token at {getHospitalName()}
                    </span>
                  </div>
                  {/* Simulated QR SVG */}
                  <div className="bg-white p-1 border rounded">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" fill="#ffffff"/>
                      <rect x="4" y="4" width="16" height="16" stroke="#000000" strokeWidth="3" fill="none"/>
                      <rect x="8" y="8" width="8" height="8" fill="#000000"/>
                      <rect x="28" y="4" width="16" height="16" stroke="#000000" strokeWidth="3" fill="none"/>
                      <rect x="32" y="8" width="8" height="8" fill="#000000"/>
                      <rect x="4" y="28" width="16" height="16" stroke="#000000" strokeWidth="3" fill="none"/>
                      <rect x="8" y="32" width="8" height="8" fill="#000000"/>
                      <rect x="26" y="26" width="6" height="6" fill="#000000"/>
                      <rect x="36" y="26" width="8" height="4" fill="#000000"/>
                      <rect x="26" y="36" width="8" height="8" fill="#000000"/>
                      <rect x="38" y="34" width="6" height="10" fill="#000000"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2 bg-black bg-opacity-20 text-center border-top border-white border-opacity-10" style={{ fontSize: '0.65rem' }}>
                Ministry of Health & Family Welfare, Government of India • abdm.gov.in
              </div>
            </div>

            <div className="text-center text-muted mt-3 small" style={{ fontSize: '0.72rem' }}>
              * Official Ayushman Bharat Health Account (ABHA). Enables national digital interoperability under ABDM.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-primary btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Official ABHA Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
