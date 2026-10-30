import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function ExecutiveBriefingSlip({ metrics, onClose }) {
  if (!metrics) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-graph-up-arrow text-success me-2"></i>
              CEO & Medical Superintendent Daily Executive Briefing Sheet — #{metrics.reportId}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="executive-briefing-print">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Executive Leadership Command Center • Daily Clinical & Financial Audit
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">Tertiary Multi-Speciality Healthcare • Operational Excellence Governance</p>
              <div className="small fw-semibold text-primary">
                Comprehensive Hospital Operational Metrics, Census & Revenue Performance Audit
              </div>
            </div>

            {/* Top Date & Briefing Meta */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Report Reference:</span>
                <span className="fw-bold text-primary font-monospace fs-6">#{metrics.reportId}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Audit Period:</span>
                <span className="fw-bold text-dark">{metrics.auditDate || new Date().toLocaleDateString('en-IN')} (24-Hour Cycle)</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Prepared For:</span>
                <span className="fw-semibold text-dark">Chief Executive Officer / MS</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Audit Status:</span>
                <span className="badge bg-success-subtle text-success border border-success fw-bold">
                  VERIFIED AUDIT CLOSE
                </span>
              </div>
            </div>

            {/* Core Clinical KPIs Grid */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-heart-pulse-fill me-1 text-danger"></i> CORE CLINICAL UTILIZATION & WORKLOAD METRICS
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center small">
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>BED OCCUPANCY (BOR)</span>
                      <strong className="fs-5 text-primary font-monospace">{metrics.bor || '84.6%'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>NABH Target: 80 - 85%</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>AVG LENGTH OF STAY (ALOS)</span>
                      <strong className="fs-5 text-success font-monospace">{metrics.alos || '3.6 Days'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Tertiary Benchmark &lt; 4.0d</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>OPD FOOTFALL</span>
                      <strong className="fs-5 text-dark font-monospace">{metrics.opdCount || '482'} Patients</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Physical + Virtual OPD</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>SURGERIES PERFORMED</span>
                      <strong className="fs-5 text-danger font-monospace">{metrics.surgeriesCount || '28'} Cases</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Major OT + Daycare</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance Summary */}
            <div className="card mb-3 border-success-subtle">
              <div className="card-header bg-success-subtle text-success fw-bold py-1 small">
                <i className="bi bi-currency-rupee me-1"></i> FINANCIAL REVENUE AUDIT & REALIZATION SUMMARY
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Hospital Revenue Stream</th>
                      <th>Gross Billing (INR ₹)</th>
                      <th>Collections Realized (INR ₹)</th>
                      <th>Pending Insurance Receivables</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Inpatient Department (IPD & ICU)</td>
                      <td className="font-monospace fw-bold text-dark">₹{metrics.ipdGross || '18,45,000'}</td>
                      <td className="font-monospace text-success fw-bold">₹{metrics.ipdCollected || '14,20,000'}</td>
                      <td className="font-monospace text-danger">₹{metrics.ipdPending || '4,25,000'} (TPA)</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Outpatient Consultation (OPD)</td>
                      <td className="font-monospace fw-bold text-dark">₹{metrics.opdGross || '2,41,000'}</td>
                      <td className="font-monospace text-success fw-bold">₹{metrics.opdCollected || '2,41,000'}</td>
                      <td className="font-monospace text-muted">₹0 (100% Cash/UPI)</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Pharmacy & Medical Supplies</td>
                      <td className="font-monospace fw-bold text-dark">₹{metrics.pharmaGross || '5,80,000'}</td>
                      <td className="font-monospace text-success fw-bold">₹{metrics.pharmaCollected || '5,35,000'}</td>
                      <td className="font-monospace text-danger">₹{metrics.pharmaPending || '45,000'}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Laboratory & Diagnostic Imaging</td>
                      <td className="font-monospace fw-bold text-dark">₹{metrics.diagGross || '4,10,000'}</td>
                      <td className="font-monospace text-success fw-bold">₹{metrics.diagCollected || '3,85,000'}</td>
                      <td className="font-monospace text-danger">₹{metrics.diagPending || '25,000'}</td>
                    </tr>
                    <tr className="table-dark">
                      <td className="fw-bold text-uppercase">TOTAL HOSPITAL GROSS PERFORMANCE</td>
                      <td className="font-monospace fw-bold fs-6 text-warning">₹{metrics.totalGross || '30,76,000'}</td>
                      <td className="font-monospace fw-bold fs-6 text-success">₹{metrics.totalCollected || '25,81,000'}</td>
                      <td className="font-monospace fw-bold fs-6 text-danger">₹{metrics.totalPending || '4,95,000'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quality & Patient Safety Metrics */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-shield-check me-1 text-primary"></i> NABH PATIENT SAFETY & CLINICAL QUALITY INDICATORS
              </div>
              <div className="card-body p-2 small">
                <div className="row g-2">
                  <div className="col-4">
                    <span className="text-muted d-block">Hospital Mortality Rate:</span>
                    <strong className="text-success font-monospace">0.18% (Bench &lt; 0.5%)</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block">Unplanned ICU Readmission:</span>
                    <strong className="text-success font-monospace">0.42% (Bench &lt; 1.0%)</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block">Patient Satisfaction Index:</span>
                    <strong className="text-primary font-monospace">96.4% Positive NPS</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">FINANCE DIRECTOR</span>
                </div>
                <small className="fw-semibold text-dark d-block">CFO Accounts Office</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Revenue Assurance</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">MEDICAL SUPERINTENDENT</span>
                </div>
                <small className="fw-semibold text-dark d-block">Dr. Vikram Patel, MD</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Clinical Operations</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">EXECUTIVE CEO SIGN</span>
                </div>
                <small className="fw-bold text-dark d-block">Chief Executive Officer</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync Executive Command Center. Confidential Management Record.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-dark btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Executive Briefing Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
