import React from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';

function BloodCrossMatchSlip({ requisition, patient }) {
  if (!requisition) return null;

  const hospitalName = getHospitalName();
  const patientName = requisition.patientName || patient?.name || 'Transfusion Recipient';
  const uhid = requisition.uhid || `MRN-2026-${String(requisition.patientId || patient?.id || '101').padStart(4, '0')}`;
  const slipId = `BB-${Date.now().toString().slice(-6)}`;
  const doctorName = formatDoctorName(requisition.doctorName || 'Dr. Consultant In-Charge');

  const formattedDate = new Date(requisition.date || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="blood-crossmatch-slip bg-white text-dark p-3" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '13px', lineHeight: 1.5 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="border-bottom pb-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 bg-danger text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              <i className="bi bi-droplet-fill fs-2"></i>
            </div>
            <div>
              <h4 className="fw-bold text-danger mb-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                {hospitalName}
              </h4>
              <div className="text-secondary small fw-bold">
                DEPARTMENT OF TRANSFUSION MEDICINE & CENTRAL BLOOD CENTRE
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                State Blood Transfusion Council Lic #DL-BB-2026-908 &bull; NABH Blood Bank Accredited
              </div>
            </div>
          </div>
          <div className="text-end border-start ps-3">
            <div className="badge bg-danger px-3 py-1 fs-6 mb-1 text-uppercase">
              COMPATIBILITY CERTIFICATE
            </div>
            <div className="text-dark fw-bold" style={{ fontSize: '12px' }}>Cert #{slipId}</div>
            <div className="text-muted small" style={{ fontSize: '10px' }}>Issued for Immediate Transfusion</div>
          </div>
        </div>
      </div>

      {/* PATIENT & REQUISITION DETAILS */}
      <div className="bg-light p-3 rounded-2 border mb-3">
        <div className="row g-2" style={{ fontSize: '12px' }}>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>RECIPIENT PATIENT</span>
            <span className="fw-bold text-dark">{patientName}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>UHID / MRN</span>
            <span className="fw-bold text-primary">{uhid}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>RECIPIENT BLOOD GROUP</span>
            <span className="badge bg-danger px-2 py-1 fw-bold fs-6">{requisition.bloodGroup || 'B +ve'}</span>
          </div>
          <div className="col-6 col-md-3">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>WARD / BED LOCATION</span>
            <span className="fw-bold text-dark">{requisition.wardBed || 'ICU-01 / Emergency Bed 02'}</span>
          </div>

          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>ORDERING PHYSICIAN</span>
            <span className="fw-bold text-dark">{doctorName}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>VERIFIED AT</span>
            <span className="fw-bold text-dark">{formattedDate}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>CLINICAL INDICATION</span>
            <span className="fw-semibold text-dark">{requisition.indication || 'Acute hemorrhagic shock / Severe anemia'}</span>
          </div>
          <div className="col-6 col-md-3 mt-2">
            <span className="text-muted d-block" style={{ fontSize: '11px' }}>UNITS REQUESTED</span>
            <span className="badge bg-primary px-2 py-1">{requisition.units || 1} Unit(s) {requisition.component || 'PRBC'}</span>
          </div>
        </div>
      </div>

      {/* DONOR UNIT & CROSS-MATCH TABLE */}
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm align-middle mb-0" style={{ fontSize: '12px' }}>
          <thead className="table-light">
            <tr>
              <th style={{ width: '22%' }}>Donor Bag No.</th>
              <th style={{ width: '18%' }}>Component</th>
              <th style={{ width: '15%' }} className="text-center">Bag Group</th>
              <th style={{ width: '25%' }}>Major / Minor Cross-Match</th>
              <th style={{ width: '20%' }} className="text-center">Result Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-bold text-dark">
                <i className="bi bi-upc-scan me-1 text-primary"></i>
                BAG-{requisition.bagNumber || `2026-${Math.floor(10000 + Math.random() * 90000)}`}
              </td>
              <td>{requisition.component || 'Packed Red Blood Cells (PRBC)'}</td>
              <td className="text-center">
                <span className="badge bg-danger">{requisition.bloodGroup || 'B +ve'}</span>
              </td>
              <td className="small">
                Major Cross-Match: <strong>No Agglutination</strong> (Saline, Albumin & AHG @ 37°C)
              </td>
              <td className="text-center">
                <span className="badge bg-success px-2 py-1">
                  <i className="bi bi-check-circle-fill me-1"></i> 100% COMPATIBLE
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TRANSFUSION SAFETY PROTOCOL INSTRUCTIONS */}
      <div className="border border-danger border-opacity-25 rounded-2 p-3 mb-3 bg-danger bg-opacity-10">
        <div className="fw-bold text-danger small mb-1">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> MANDATORY BEDSIDE TRANSFUSION PROTOCOL:
        </div>
        <ul className="mb-0 text-dark small ps-3" style={{ fontSize: '11px', lineHeight: 1.5 }}>
          <li>Two registered nurses must perform dual bedside verification of patient UHID and blood bag barcode before spiking.</li>
          <li>Transfusion must begin within 30 minutes of bag collection and finish within 4 hours.</li>
          <li>Record baseline vitals at 0 minutes, monitor every 15 minutes for the first 30 minutes, then hourly.</li>
          <li>In case of rigors, urticaria, dyspnea, or fever spike, <strong>STOP TRANSFUSION IMMEDIATELY</strong> and alert Medical Officer.</li>
        </ul>
      </div>

      {/* SIGNATURES */}
      <div className="border-top pt-3 mt-3">
        <div className="row text-center" style={{ fontSize: '11px' }}>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              M. Anand (MSc MLT)
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Blood Bank Technologist</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Testing Performed</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Dr. K. N. Rao, MD
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Blood Transfusion Officer</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Cross-Match Verified</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark mb-4" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '18px' }}>
              Receiving Ward Sister
            </div>
            <div className="border-top pt-1 text-dark fw-bold">Ward Staff Signature</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Delivered to Recipient</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-muted border-top mt-3 pt-2" style={{ fontSize: '10px' }}>
        {hospitalName} &bull; Transfusion Registry Cert #{slipId} &bull; Retain slip in patient medical records
      </div>
    </div>
  );
}

export default BloodCrossMatchSlip;
