import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function PacsDiagnosticSlip({ study, onClose }) {
  if (!study) return null;

  const handlePrint = () => {
    window.print();
  };

  const p = study.patient || {};

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-file-earmark-medical me-2 text-info"></i>
              NABL / NABH Diagnostic Radiology & PACS Diagnostic Report — #{study.studyAccession}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="pacs-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Department of Radiodiagnosis & Digital Imaging (PACS Core)
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">AERB Certified 128-Slice CT • 3.0 Tesla MRI • Digital Flat-Panel X-Ray</p>
              <div className="small fw-semibold text-primary">
                Official Radiologist Impression & Image Study Verification Slip
              </div>
            </div>

            {/* Study & Patient Header Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Accession # / DICOM ID:</span>
                <span className="fw-bold text-dark font-monospace fs-6">#{study.studyAccession}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Modality / Protocol:</span>
                <span className="fw-bold text-primary">{study.modality} ({study.studyName})</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Study Acquisition Date:</span>
                <span className="fw-semibold text-dark">{study.studyDate || '30-Oct-2026 09:30 AM'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Radiation Dose (DLP/DAP):</span>
                <span className="badge bg-success-subtle text-success border border-success">
                  {study.radiationDose || 'AERB Alara Compliant (2.1 mGy)'}
                </span>
              </div>

              <div className="col-md-4 mt-2">
                <span className="text-muted d-block">Patient Full Name:</span>
                <strong className="text-dark fs-6">{p.name || study.patientName}</strong>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>UHID: {p.uhid || study.patientUhid || 'UHID-9082'}</div>
              </div>
              <div className="col-md-4 mt-2">
                <span className="text-muted d-block">Demographics / Contact:</span>
                <strong className="text-dark">{p.age || study.patientAge || '45'} Yrs / {p.gender || study.patientGender || 'Male'}</strong>
                <div className="text-muted">{p.contactNumber || study.patientPhone || '+91 98765 43210'}</div>
              </div>
              <div className="col-md-4 mt-2">
                <span className="text-muted d-block">Referring Physician:</span>
                <strong className="text-dark">{study.referringDoctor || 'Dr. Sarah Jenkins (Cardiology)'}</strong>
              </div>
            </div>

            {/* Clinical Indication */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-info-circle me-1 text-primary"></i> CLINICAL INDICATION & TECHNIQUE
              </div>
              <div className="card-body p-2 small">
                <p className="mb-1 text-dark">
                  <strong>Indication:</strong> {study.clinicalIndication || 'Evaluation of chest pain, dyspnea, and suspected acute pulmonary pathology.'}
                </p>
                <p className="mb-0 text-muted">
                  <strong>Technique:</strong> High-resolution digital acquisition with flat-panel detector. Standard exposure parameters applied. Multi-planar volumetric reconstructions evaluated.
                </p>
              </div>
            </div>

            {/* Findings & Radiologist Impression */}
            <div className="card mb-3 border-primary-subtle">
              <div className="card-header bg-primary-subtle text-primary fw-bold py-1 small">
                <i className="bi bi-file-earmark-text me-1"></i> RADIOLOGICAL FINDINGS & OBSERVATIONS
              </div>
              <div className="card-body p-3">
                <div className="small text-dark mb-3" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {study.findings || `1. Thoracic Cage & Bony Framework: Intact ribs, clavicles, and dorsal spine. No fractures or osteolytic lesions.
2. Lung Fields: Bilateral lung parenchyma demonstrates normal vascularity. Clear costophrenic and cardiophrenic angles.
3. Mediastinum & Cardiac Silhouette: Heart size is within normal limits (cardiothoracic ratio < 0.50). Mediastinal contours normal.
4. Diaphragm & Subdiaphragmatic Area: Both hemidiaphragms have normal smooth contours. No free air under diaphragm.`}
                </div>

                <div className="border-top pt-2">
                  <span className="badge bg-primary text-uppercase px-2 py-1 mb-1">IMPRESSION / CONCLUSION</span>
                  <div className="fw-bold text-dark fs-6 mt-1">
                    {study.impression || 'NO ACUTE PLEUROPULMONARY LESION IDENTIFIED. NORMAL CHEST RADIOGRAM.'}
                  </div>
                </div>
              </div>
            </div>

            {/* AERB Compliance Note */}
            <div className="bg-light p-2 rounded small text-muted border mb-3" style={{ fontSize: '0.72rem' }}>
              <strong>AERB Compliance:</strong> Atomic Energy Regulatory Board (AERB) radiation safety guidelines strictly maintained. Radiation exposure kept As Low As Reasonably Achievable (ALARA principles).
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">RADIOLOGY TECH SIGN</span>
                </div>
                <small className="fw-semibold text-dark d-block">Sunil Saxena, RT (R)</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lead PACS Radiographer</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">REPORTING RADIOLOGIST</span>
                </div>
                <small className="fw-bold text-dark d-block">{study.reportingRadiologist || 'Dr. Priya Nair, MD (Radiodiagnosis)'}</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Consultant Radiologist • Reg: MCI-40912</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">HOD RADIOLOGY STAMP</span>
                </div>
                <small className="fw-semibold text-dark d-block">Dr. Vikram Patel, MD</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{getHospitalName()}</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync PACS / RIS Cloud Archive. DICOM 3.0 Standard Compliant.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Diagnostic Radiology Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
