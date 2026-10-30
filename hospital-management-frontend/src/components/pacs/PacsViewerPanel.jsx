import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import DoctorService from '../../services/DoctorService';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import PacsDiagnosticSlip from './PacsDiagnosticSlip';
import { toast } from 'react-toastify';

const INITIAL_PACS_STUDIES = [
  {
    id: 1,
    studyAccession: 'XR-2026-901',
    modality: 'CR / DX (Digital X-Ray)',
    studyName: 'Chest PA View High-Resolution',
    patientName: 'Rahul Sharma',
    patientUhid: 'UHID-101',
    patientAge: 42,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    studyDate: '2026-10-30 08:45 AM',
    referringDoctor: 'Dr. Sarah Jenkins (Cardiology)',
    reportingRadiologist: 'Dr. Priya Nair, MD',
    kvp: '115 kVp',
    mas: '3.2 mAs',
    sliceThickness: 'Flat Panel Digital',
    radiationDose: '0.02 mSv (Low Dose)',
    clinicalIndication: 'Chest pain evaluation, assess cardiomegaly & parenchymal infiltrate.',
    findings: '1. Both lung fields appear normal with clear vascular markings.\n2. Normal cardiothoracic ratio (< 0.50). Normal mediastinal vascular contours.\n3. Both costophrenic angles are sharp and clear. No pneumothorax.\n4. Visualized bony rib cage intact.',
    impression: 'NO ACTIVE CARDIO-PULMONARY ABNORMALITY. NORMAL CHEST RADIOGRAM.',
    status: 'VERIFIED_SIGNED',
    imageType: 'xray_chest'
  },
  {
    id: 2,
    studyAccession: 'CT-2026-902',
    modality: 'CT (128-Slice MDCT)',
    studyName: 'NCCT Head / Brain Volumetric',
    patientName: 'Anita Verma',
    patientUhid: 'UHID-102',
    patientAge: 36,
    patientGender: 'Female',
    patientPhone: '+91 98765 43211',
    studyDate: '2026-10-29 03:20 PM',
    referringDoctor: 'Dr. Ananya Sen (Emergency & Trauma)',
    reportingRadiologist: 'Dr. Priya Nair, MD',
    kvp: '120 kVp',
    mas: '240 mAs',
    sliceThickness: '0.625 mm Reconstructed',
    radiationDose: '1.8 mSv (DLP: 420 mGy*cm)',
    clinicalIndication: 'Severe headache, acute giddiness, rule out acute intracranial hemorrhage.',
    findings: '1. No evidence of acute intra-axial or extra-axial hemorrhage.\n2. Ventricular system, basal cisterns, and cortical sulci appear normal for age.\n3. No midline shift or mass effect noted.\n4. Visualized skull vault and paranasal sinuses are unremarkable.',
    impression: 'NORMAL NON-CONTRAST COMPUTED TOMOGRAPHY OF BRAIN. NO INTRACRANIAL BLEED.',
    status: 'VERIFIED_SIGNED',
    imageType: 'ct_brain'
  },
  {
    id: 3,
    studyAccession: 'MR-2026-903',
    modality: 'MR (3.0 Tesla High-Field)',
    studyName: 'MRI Lumbar Spine Sagittal T1/T2 & Axial',
    patientName: 'Vikram Malhotra',
    patientUhid: 'UHID-103',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+91 98765 43212',
    studyDate: '2026-10-28 11:15 AM',
    referringDoctor: 'Dr. Vikram Patel (Orthopedics)',
    reportingRadiologist: 'Dr. Priya Nair, MD',
    kvp: 'RF 3.0T',
    mas: 'TR/TE 3500/102 ms',
    sliceThickness: '3.0 mm Multi-Slice',
    radiationDose: '0.0 mSv (Non-Ionizing MRI)',
    clinicalIndication: 'Chronic low backache radiating to right L5 dermatome. Suspected disc prolapse.',
    findings: '1. Mild diffuse disc bulge noted at L4-L5 level with slight indentation over thecal sac.\n2. Neural exit foramina show mild bilateral narrowing; right L5 nerve root in proximity.\n3. Alignment of lumbar lordosis is maintained. No marrow signal abnormality.\n4. Conus medullaris terminates normally at L1 level.',
    impression: 'L4-L5 POSTERIOR BROAD-BASED DISC BULGE WITH MILD RIGHT L5 RADICULAR EMBARGO.',
    status: 'VERIFIED_SIGNED',
    imageType: 'mri_spine'
  }
];

const PACS_STORAGE_KEY = 'hospitalsync_pacs_studies_v1';

export default function PacsViewerPanel() {
  const [studies, setStudies] = useState(() => {
    try {
      const saved = localStorage.getItem(PACS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PACS_STUDIES;
    } catch {
      return INITIAL_PACS_STUDIES;
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedStudyId, setSelectedStudyId] = useState(studies[0]?.id || 1);
  const [activeSlipStudy, setActiveSlipStudy] = useState(null);
  const [showNewStudyModal, setShowNewStudyModal] = useState(false);

  // PACS Interactive Viewer Controls
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [invertColor, setInvertColor] = useState(false);
  const [contrastWindow, setContrastWindow] = useState('standard'); // standard, bone, lung, high_contrast
  const [showCaliper, setShowCaliper] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);

  // Form states for report editing
  const [editFindings, setEditFindings] = useState('');
  const [editImpression, setEditImpression] = useState('');

  // Form states for New Study
  const [newPatientId, setNewPatientId] = useState('');
  const [newModality, setNewModality] = useState('CR / DX (Digital X-Ray)');
  const [newStudyName, setNewStudyName] = useState('Chest PA Digital View');
  const [newIndication, setNewIndication] = useState('Acute dyspnea and cough evaluation');
  const [newDoctorId, setNewDoctorId] = useState('');

  const currentStudy = useMemo(() => {
    return studies.find(s => s.id === selectedStudyId) || studies[0];
  }, [studies, selectedStudyId]);

  useEffect(() => {
    try {
      localStorage.setItem(PACS_STORAGE_KEY, JSON.stringify(studies));
    } catch (e) {
      console.error(e);
    }
  }, [studies]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    DoctorService.getAllDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (currentStudy) {
      setEditFindings(currentStudy.findings || '');
      setEditImpression(currentStudy.impression || '');
    }
  }, [currentStudy]);

  const handleSaveReport = () => {
    setStudies(prev => prev.map(s => {
      if (s.id === currentStudy.id) {
        return {
          ...s,
          findings: editFindings,
          impression: editImpression,
          status: 'VERIFIED_SIGNED'
        };
      }
      return s;
    }));
    setIsEditingReport(false);
    toast.success('Radiology findings & impression updated and verified.');
  };

  const handleCreateStudy = (e) => {
    e.preventDefault();
    const p = patients.find(pat => String(pat.id) === String(newPatientId));
    const d = doctors.find(doc => String(doc.id) === String(newDoctorId));

    const pName = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name : 'Emergency Patient';
    const docName = d ? formatDoctorName(d.name) : 'Dr. Sarah Jenkins';

    const newStudy = {
      id: Date.now(),
      studyAccession: `${newModality.includes('CT') ? 'CT' : newModality.includes('MR') ? 'MR' : 'XR'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      modality: newModality,
      studyName: newStudyName,
      patientName: pName,
      patientUhid: p?.uhid || `UHID-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAge: p?.age || 40,
      patientGender: p?.gender || 'Male',
      patientPhone: p?.contactNumber || '+91 98765 43210',
      studyDate: new Date().toLocaleString(),
      referringDoctor: docName,
      reportingRadiologist: 'Dr. Priya Nair, MD',
      kvp: '120 kVp',
      mas: '100 mAs',
      sliceThickness: 'Digital Acquisition',
      radiationDose: 'ALARA Optimized',
      clinicalIndication: newIndication,
      findings: 'Study acquired in standard clinical projection. Image contrast and resolution verified.',
      impression: 'PENDING CONSULTANT RADIOLOGIST FORMAL REVIEW.',
      status: 'ACQUIRED_PENDING_REVIEW',
      imageType: newModality.includes('CT') ? 'ct_brain' : newModality.includes('MR') ? 'mri_spine' : 'xray_chest'
    };

    setStudies(prev => [newStudy, ...prev]);
    setSelectedStudyId(newStudy.id);
    setShowNewStudyModal(false);
    toast.success(`PACS Study #${newStudy.studyAccession} ingested into Digital RIS Archive.`);
  };

  // Contrast filter style based on windowing preset
  const getFilterStyle = () => {
    let filter = '';
    if (invertColor) filter += 'invert(1) ';
    if (contrastWindow === 'bone') {
      filter += 'contrast(1.6) brightness(0.85) grayscale(1)';
    } else if (contrastWindow === 'lung') {
      filter += 'contrast(1.3) brightness(1.2) grayscale(1)';
    } else if (contrastWindow === 'high_contrast') {
      filter += 'contrast(2.0) brightness(0.9) grayscale(1)';
    } else {
      filter += 'contrast(1.1) brightness(1.0) grayscale(1)';
    }
    return filter.trim();
  };

  return (
    <div className="container-fluid py-3" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center text-white">
            <span className="badge bg-primary me-2 font-monospace px-2 py-1 fs-6">PACS-RIS</span>
            Medical Imaging & Digital Radiology PACS Viewer Desk
          </h3>
          <p className="text-secondary small mb-0">
            {getHospitalName()} • AERB Certified Digital RIS / PACS Archive • DICOM 3.0 Diagnostic Console
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowNewStudyModal(true)}
          >
            <i className="bi bi-camera-fill me-1"></i> Ingest New Study
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column: Studies List */}
        <div className="col-lg-3 col-md-4">
          <div className="card border-secondary shadow-sm" style={{ backgroundColor: '#101726' }}>
            <div className="card-header bg-dark border-bottom border-secondary py-2 d-flex justify-content-between align-items-center">
              <strong className="text-white small">
                <i className="bi bi-collection-play me-1 text-primary"></i> DICOM Studies ({studies.length})
              </strong>
              <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.65rem' }}>AERB PACS</span>
            </div>

            <div className="card-body p-2" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {studies.map(study => {
                const isSelected = study.id === currentStudy.id;
                return (
                  <div
                    key={study.id}
                    className={`p-2 rounded mb-2 border cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary bg-opacity-10 text-white'
                        : 'border-secondary bg-black bg-opacity-30 text-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedStudyId(study.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className={`font-monospace small ${isSelected ? 'text-primary' : 'text-light'}`}>
                        {study.studyAccession}
                      </strong>
                      <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                        {study.modality.split('(')[0].trim()}
                      </span>
                    </div>

                    <div className="fw-semibold text-white small text-truncate">{study.patientName}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{study.studyName}</div>
                    <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>{study.studyDate}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive DICOM PACS Viewer */}
        <div className="col-lg-6 col-md-8">
          <div className="card border-secondary shadow-sm" style={{ backgroundColor: '#050a12' }}>
            {/* PACS Toolbar */}
            <div className="card-header bg-black border-bottom border-secondary py-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary text-light py-1 px-2"
                  title="Zoom In"
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                >
                  <i className="bi bi-zoom-in"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary text-light py-1 px-2"
                  title="Zoom Out"
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                >
                  <i className="bi bi-zoom-out"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary text-light py-1 px-2"
                  title="Reset Scale"
                  onClick={() => { setZoomLevel(1.0); setContrastWindow('standard'); setInvertColor(false); setShowCaliper(false); }}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>

              {/* Windowing Preset Dropdown */}
              <div className="d-flex align-items-center gap-1">
                <select
                  className="form-select form-select-sm bg-dark text-white border-secondary font-monospace"
                  style={{ fontSize: '0.75rem', width: '130px' }}
                  value={contrastWindow}
                  onChange={(e) => setContrastWindow(e.target.value)}
                >
                  <option value="standard">Standard Window</option>
                  <option value="bone">Bone Window</option>
                  <option value="lung">Lung Window</option>
                  <option value="high_contrast">High Contrast</option>
                </select>

                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2 ${invertColor ? 'btn-light text-dark' : 'btn-outline-secondary text-light'}`}
                  title="Invert Contrast (Photographic Negative)"
                  onClick={() => setInvertColor(prev => !prev)}
                >
                  <i className="bi bi-circle-half"></i> Invert
                </button>

                <button
                  type="button"
                  className={`btn btn-sm py-1 px-2 ${showCaliper ? 'btn-info text-dark' : 'btn-outline-secondary text-light'}`}
                  title="Toggle Measurement Caliper"
                  onClick={() => setShowCaliper(prev => !prev)}
                >
                  <i className="bi bi-rulers"></i> Caliper
                </button>
              </div>
            </div>

            {/* Viewer Screen Canvas/SVG */}
            <div
              className="position-relative overflow-hidden d-flex justify-content-center align-items-center"
              style={{ height: '520px', backgroundColor: '#020408', userSelect: 'none' }}
            >
              {/* DICOM Top-Left Metadata HUD */}
              <div className="position-absolute top-0 start-0 p-3 font-monospace text-secondary" style={{ fontSize: '0.72rem', zIndex: 10 }}>
                <div className="text-white fw-bold">{currentStudy.patientName}</div>
                <div>{currentStudy.patientUhid} • {currentStudy.patientAge}Y/{currentStudy.patientGender}</div>
                <div className="text-info">{currentStudy.modality}</div>
                <div>{currentStudy.studyName}</div>
              </div>

              {/* DICOM Top-Right Metadata HUD */}
              <div className="position-absolute top-0 end-0 p-3 font-monospace text-secondary text-end" style={{ fontSize: '0.72rem', zIndex: 10 }}>
                <div className="text-white fw-bold">{getHospitalName()}</div>
                <div>Acc: {currentStudy.studyAccession}</div>
                <div>{currentStudy.kvp} • {currentStudy.mas}</div>
                <div className="text-warning">{currentStudy.sliceThickness}</div>
              </div>

              {/* Simulated Diagnostic Radiological Image (Vector Anatomical Simulation) */}
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.15s ease-out',
                  filter: getFilterStyle()
                }}
              >
                {currentStudy.imageType === 'xray_chest' && (
                  <svg width="340" height="420" viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Thoracic Cavity */}
                    <rect width="340" height="420" fill="#05080f"/>
                    {/* Spine / Vertebral Column */}
                    <rect x="162" y="40" width="16" height="340" rx="3" fill="#64748b" opacity="0.6"/>
                    {/* Trachea */}
                    <rect x="167" y="30" width="6" height="70" rx="2" fill="#000000" opacity="0.9"/>
                    {/* Clavicles */}
                    <path d="M 60 70 Q 160 85 160 80" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none"/>
                    <path d="M 280 70 Q 180 85 180 80" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none"/>
                    {/* Lung Fields (Dark Air Density) */}
                    <path d="M 80 90 Q 70 200 90 310 Q 155 330 155 250 Q 150 110 80 90 Z" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
                    <path d="M 260 90 Q 270 200 250 310 Q 185 330 185 250 Q 190 110 260 90 Z" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
                    {/* Ribs (Left & Right arches) */}
                    {[110, 140, 170, 200, 230, 260, 290].map((y, idx) => (
                      <g key={idx}>
                        <path d={`M 160 ${y - 20} Q 90 ${y} 80 ${y + 10}`} stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" opacity="0.75" fill="none"/>
                        <path d={`M 180 ${y - 20} Q 250 ${y} 260 ${y + 10}`} stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" opacity="0.75" fill="none"/>
                      </g>
                    ))}
                    {/* Cardiac Silhouette & Apex */}
                    <path d="M 150 170 Q 130 200 125 240 Q 120 280 180 300 Q 200 280 190 210 Q 180 170 150 170 Z" fill="#94a3b8" opacity="0.85"/>
                    {/* Aortic Knob */}
                    <circle cx="150" cy="155" r="14" fill="#94a3b8" opacity="0.9"/>
                    {/* Diaphragmatic Domes */}
                    <path d="M 70 320 Q 120 295 165 320" stroke="#cbd5e1" strokeWidth="6" fill="none"/>
                    <path d="M 175 320 Q 220 305 270 320" stroke="#cbd5e1" strokeWidth="6" fill="none"/>
                    {/* Anatomical Marker */}
                    <text x="290" y="50" fill="#38bdf8" fontSize="20" fontWeight="bold" fontFamily="monospace">R</text>
                  </svg>
                )}

                {currentStudy.imageType === 'ct_brain' && (
                  <svg width="340" height="420" viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="340" height="420" fill="#05080f"/>
                    {/* Calvarium / Skull Bone (Bright) */}
                    <ellipse cx="170" cy="210" rx="125" ry="155" fill="none" stroke="#f8fafc" strokeWidth="10"/>
                    {/* Brain Parenchyma */}
                    <ellipse cx="170" cy="210" rx="118" ry="148" fill="#334155"/>
                    {/* Lateral Ventricles (Frontal & Occipital Horns) */}
                    <path d="M 155 170 Q 140 200 145 230 Q 155 240 162 215 Q 160 180 155 170 Z" fill="#090d16"/>
                    <path d="M 185 170 Q 200 200 195 230 Q 185 240 178 215 Q 180 180 185 170 Z" fill="#090d16"/>
                    {/* Midline Falx Cerebri */}
                    <line x1="170" y1="70" x2="170" y2="350" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3"/>
                    <text x="280" y="60" fill="#38bdf8" fontSize="18" fontWeight="bold" fontFamily="monospace">L</text>
                  </svg>
                )}

                {currentStudy.imageType === 'mri_spine' && (
                  <svg width="340" height="420" viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="340" height="420" fill="#05080f"/>
                    {/* Spinal Canal (Bright CSF on T2) */}
                    <path d="M 195 40 Q 190 200 185 380" stroke="#f1f5f9" strokeWidth="14" fill="none" opacity="0.9"/>
                    {/* Spinal Cord / Cauda Equina */}
                    <path d="M 195 40 Q 190 200 185 380" stroke="#475569" strokeWidth="5" fill="none"/>
                    {/* Lumbar Vertebral Bodies (L1 - L5) */}
                    {[70, 130, 190, 250, 310].map((y, idx) => (
                      <g key={idx}>
                        <rect x="130" y={y} width="48" height="42" rx="4" fill="#64748b" stroke="#cbd5e1" strokeWidth="2"/>
                        {/* Intervertebral Disc */}
                        {idx < 4 && (
                          <rect x="133" y={y + 44} width="45" height="12" rx="2" fill="#94a3b8" opacity="0.8"/>
                        )}
                      </g>
                    ))}
                    {/* L4-L5 disc protrusion pointer */}
                    <circle cx="180" cy="240" r="4" fill="#ef4444"/>
                    <text x="50" y="60" fill="#38bdf8" fontSize="18" fontWeight="bold" fontFamily="monospace">SAG T2</text>
                  </svg>
                )}
              </div>

              {/* Caliper Measurement Overlay (if active) */}
              {showCaliper && (
                <div className="position-absolute" style={{ top: '45%', left: '38%', zIndex: 15 }}>
                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div>
                    <div style={{ width: '90px', height: '2px', backgroundColor: '#38bdf8' }}></div>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div>
                  </div>
                  <span className="badge bg-dark border border-info text-info font-monospace ms-2" style={{ fontSize: '0.72rem' }}>
                    Dist: 34.2 mm
                  </span>
                </div>
              )}

              {/* Bottom HUD Bar */}
              <div className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center font-monospace text-secondary" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <span>Zoom: {(zoomLevel * 100).toFixed(0)}% • W:{contrastWindow.toUpperCase()}</span>
                <span>Dose: {currentStudy.radiationDose}</span>
                <span className="text-success"><i className="bi bi-shield-fill-check me-1"></i>DICOM VALID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Radiologist Findings & Report Editor */}
        <div className="col-lg-3 col-md-12">
          <div className="card border-secondary shadow-sm" style={{ backgroundColor: '#101726' }}>
            <div className="card-header bg-dark border-bottom border-secondary py-2 d-flex justify-content-between align-items-center">
              <strong className="text-white small">
                <i className="bi bi-file-earmark-text me-1 text-info"></i> Diagnostic Report
              </strong>
              <button
                type="button"
                className="btn btn-outline-info btn-sm py-0 px-2"
                style={{ fontSize: '0.7rem' }}
                onClick={() => setActiveSlipStudy(currentStudy)}
              >
                <i className="bi bi-printer-fill me-1"></i> Print Slip
              </button>
            </div>

            <div className="card-body p-3 small">
              <div className="mb-2">
                <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>REPORTING CONSULTANT:</span>
                <strong className="text-white">{currentStudy.reportingRadiologist}</strong>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Ref: {currentStudy.referringDoctor}</div>
              </div>

              <div className="mb-2">
                <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>CLINICAL INDICATION:</span>
                <div className="text-light">{currentStudy.clinicalIndication}</div>
              </div>

              {isEditingReport ? (
                <div>
                  <div className="mb-2">
                    <label className="form-label text-secondary" style={{ fontSize: '0.72rem' }}>FINDINGS / OBSERVATIONS:</label>
                    <textarea
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      rows="6"
                      value={editFindings}
                      onChange={(e) => setEditFindings(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label text-secondary" style={{ fontSize: '0.72rem' }}>CONCLUSION / IMPRESSION:</label>
                    <textarea
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      rows="3"
                      value={editImpression}
                      onChange={(e) => setEditImpression(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm py-1 flex-grow-1"
                      onClick={() => setIsEditingReport(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm py-1 flex-grow-1 fw-bold"
                      onClick={handleSaveReport}
                    >
                      Save & Verify
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>FINDINGS:</span>
                    <div className="bg-black p-2 rounded border border-secondary text-light font-monospace" style={{ fontSize: '0.72rem', whiteSpace: 'pre-line' }}>
                      {currentStudy.findings}
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>IMPRESSION:</span>
                    <div className="p-2 rounded bg-primary bg-opacity-20 border border-primary text-white fw-semibold" style={{ fontSize: '0.75rem' }}>
                      {currentStudy.impression}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 text-light"
                    onClick={() => setIsEditingReport(true)}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit Impression
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ingest New Study Modal */}
      {showNewStudyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ backgroundColor: '#131b2e', color: '#e2e8f0' }}>
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fs-6 fw-bold text-white">
                  <i className="bi bi-camera-fill text-primary me-2"></i>
                  Ingest Study into Digital PACS Archive
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewStudyModal(false)}></button>
              </div>

              <form onSubmit={handleCreateStudy}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small text-secondary">Select Patient *</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={newPatientId}
                      onChange={(e) => setNewPatientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName || ''} {p.lastName || ''} {p.name || ''} (UHID: {p.uhid || p.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary">Imaging Modality *</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={newModality}
                      onChange={(e) => setNewModality(e.target.value)}
                    >
                      <option value="CR / DX (Digital X-Ray)">CR / DX (Digital X-Ray)</option>
                      <option value="CT (128-Slice MDCT)">CT (128-Slice MDCT)</option>
                      <option value="MR (3.0 Tesla High-Field)">MR (3.0 Tesla High-Field)</option>
                      <option value="US (Ultrasound / Doppler)">US (Ultrasound / Doppler)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary">Procedure / Study Protocol *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={newStudyName}
                      onChange={(e) => setNewStudyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary">Referring Doctor</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={newDoctorId}
                      onChange={(e) => setNewDoctorId(e.target.value)}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {formatDoctorName(d.name)} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label small text-secondary">Clinical Indication</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={newIndication}
                      onChange={(e) => setNewIndication(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewStudyModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">Ingest & Open Viewer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Radiology Diagnostic Slip */}
      {activeSlipStudy && (
        <PacsDiagnosticSlip
          study={activeSlipStudy}
          onClose={() => setActiveSlipStudy(null)}
        />
      )}
    </div>
  );
}
