import React, { useState, useMemo } from 'react';
import PrintModal from '../common/PrintModal';
import SurgeryOtPassSlip from './SurgeryOtPassSlip';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import { toast } from 'react-toastify';

const OT_SUITES = [
  { id: 'OT-1', name: 'OT-1 (Cardiac & Cardio-Thoracic Suite)', type: 'Ultra-Clean Laminar Flow', floor: '3rd Floor Surgical Wing' },
  { id: 'OT-2', name: 'OT-2 (Orthopedic & Joint Replacement)', type: 'Modular Ortho Theatre', floor: '3rd Floor Surgical Wing' },
  { id: 'OT-3', name: 'OT-3 (General & Laparoscopic Surgery)', type: 'Advanced Endoscopy Suite', floor: '3rd Floor Surgical Wing' },
  { id: 'OT-4', name: 'OT-4 (Neurosurgery & Spine Suite)', type: 'Neuro Navigation Theatre', floor: '3rd Floor Surgical Wing' },
  { id: 'OT-5', name: 'OT-5 (Emergency & Maternity C-Section)', type: '24x7 Emergency Theatre', floor: 'Ground Floor Trauma Block' }
];

const INITIAL_SURGERIES = [
  {
    id: 101,
    patientId: 1,
    patientName: 'Rahul Sharma',
    patientAge: '45',
    patientGender: 'Male',
    uhid: 'MRN-2026-0001',
    bloodGroup: 'B +ve',
    procedureName: 'Laparoscopic Cholecystectomy (Gallbladder)',
    category: 'Major Surgery',
    indication: 'Symptomatic cholelithiasis with recurrent biliary colic',
    otRoom: 'OT-3 (General & Laparoscopic Surgery)',
    scheduledDate: '2026-10-30',
    scheduledTime: '10:30 AM',
    estimatedDuration: '1.5 Hours',
    wardBed: 'GW-101',
    surgeonName: 'Dr. Sharma',
    anesthetistName: 'Dr. Amit Sharma',
    scrubNurse: 'Sr. Deepa K. (RN)',
    anesthesiaType: 'General Endotracheal Anesthesia',
    status: 'IN_SURGERY',
    preOpClearances: { pac: true, npo: true, blood: true, consent: true, site: true }
  },
  {
    id: 102,
    patientId: 2,
    patientName: 'John Doe',
    patientAge: '52',
    patientGender: 'Male',
    uhid: 'MRN-2026-0002',
    bloodGroup: 'O +ve',
    procedureName: 'Left Total Knee Arthroplasty (TKR)',
    category: 'Major Surgery',
    indication: 'Grade IV osteoarthritic degenerative knee disease',
    otRoom: 'OT-2 (Orthopedic & Joint Replacement)',
    scheduledDate: '2026-10-30',
    scheduledTime: '12:00 PM',
    estimatedDuration: '2.5 Hours',
    wardBed: 'GW-102',
    surgeonName: 'Dr. Vikram Patel',
    anesthetistName: 'Dr. Amit Sharma',
    scrubNurse: 'Sr. Ananya R.',
    anesthesiaType: 'Spinal + Epidural Regional Anesthesia',
    status: 'PRE_OP_PREP',
    preOpClearances: { pac: true, npo: true, blood: true, consent: true, site: true }
  },
  {
    id: 103,
    patientId: 3,
    patientName: 'Pooja Verma',
    patientAge: '34',
    patientGender: 'Female',
    uhid: 'MRN-2026-0003',
    bloodGroup: 'A +ve',
    procedureName: 'Emergency C-Section (LSCS)',
    category: 'Emergency Surgery',
    indication: 'Fetal distress with non-progress of active labor',
    otRoom: 'OT-5 (Emergency & Maternity C-Section)',
    scheduledDate: '2026-10-30',
    scheduledTime: '02:00 PM',
    estimatedDuration: '1.0 Hour',
    wardBed: 'EM-01',
    surgeonName: 'Dr. Yash Raj',
    anesthetistName: 'Dr. Shepherd',
    scrubNurse: 'Sr. Meena V.',
    anesthesiaType: 'Subarachnoid Block (Spinal)',
    status: 'SCHEDULED',
    preOpClearances: { pac: true, npo: true, blood: true, consent: true, site: true }
  }
];

function OtPanel({ role = 'ADMIN', patients = [], doctors = [], searchQuery = '', darkMode = false }) {
  const hospitalName = getHospitalName();
  const isPatient = role === 'PATIENT';

  const [surgeries, setSurgeries] = useState(() => {
    const saved = localStorage.getItem('hospitalsync_ot_surgeries');
    return saved ? JSON.parse(saved) : INITIAL_SURGERIES;
  });

  const [filterStage, setFilterStage] = useState('ALL');
  const [filterTheatre, setFilterTheatre] = useState('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activePrintPass, setActivePrintPass] = useState(null);

  // New Surgery Form State
  const [formData, setFormData] = useState({
    patientId: patients[0]?.id ? String(patients[0].id) : '1',
    patientName: patients[0]?.name || 'Rahul Sharma',
    patientAge: '40',
    patientGender: 'Male',
    bloodGroup: 'B +ve',
    procedureName: '',
    category: 'Major Surgery',
    indication: 'Operative surgical management required',
    otRoom: 'OT-1 (Cardiac & Cardio-Thoracic Suite)',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM',
    estimatedDuration: '2.0 Hours',
    wardBed: 'Pre-Op Holding 01',
    surgeonName: doctors[0]?.name || 'Dr. Sharma',
    anesthetistName: doctors[1]?.name || 'Dr. Amit Sharma',
    scrubNurse: 'Sr. Deepa K. (RN)',
    anesthesiaType: 'General Anesthesia (GA)'
  });

  const saveSurgeries = (updated) => {
    setSurgeries(updated);
    localStorage.setItem('hospitalsync_ot_surgeries', JSON.stringify(updated));
  };

  const handleStageAdvance = (surgeryId, newStage) => {
    const target = surgeries.find(s => s.id === surgeryId);
    if (!target) return;

    const updated = surgeries.map(s => s.id === surgeryId ? { ...s, status: newStage } : s);
    saveSurgeries(updated);

    playHospitalAlertChime();
    RealtimeNotificationHub.publishNotification({
      type: 'SURGERY_STATUS_UPDATE',
      title: `OT Update: ${target.procedureName}`,
      message: `${target.patientName} in ${target.otRoom} moved to stage: ${newStage.replace(/_/g, ' ')}.`,
      targetRoles: ['ADMIN', 'DOCTOR', 'NURSE'],
      patientName: target.patientName
    });

    toast.info(`OT Status updated to ${newStage.replace(/_/g, ' ')} for ${target.patientName}`);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!formData.procedureName.trim()) {
      toast.warning('Please enter surgical procedure name.');
      return;
    }

    const patientObj = patients.find(p => String(p.id) === String(formData.patientId));
    const newSurgery = {
      id: Date.now(),
      ...formData,
      patientName: patientObj ? patientObj.name : formData.patientName,
      uhid: `MRN-2026-${String(formData.patientId).padStart(4, '0')}`,
      status: 'SCHEDULED',
      preOpClearances: { pac: true, npo: true, blood: true, consent: true, site: true }
    };

    const updated = [newSurgery, ...surgeries];
    saveSurgeries(updated);
    setShowScheduleModal(false);

    playHospitalAlertChime();
    RealtimeNotificationHub.publishNotification({
      type: 'SURGERY_SCHEDULED',
      title: 'New Surgery Scheduled in OT',
      message: `${newSurgery.procedureName} scheduled for ${newSurgery.patientName} in ${newSurgery.otRoom} (${newSurgery.scheduledDate} ${newSurgery.scheduledTime}).`,
      targetRoles: ['ADMIN', 'DOCTOR', 'NURSE'],
      patientName: newSurgery.patientName
    });

    toast.success(`Surgery successfully scheduled in ${newSurgery.otRoom}!`);
  };

  // Filtered list
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      const matchStage = filterStage === 'ALL' || s.status === filterStage;
      const matchTheatre = filterTheatre === 'ALL' || s.otRoom.includes(filterTheatre);
      const query = (searchQuery || '').toLowerCase();
      const matchQuery = !query ||
        s.patientName?.toLowerCase().includes(query) ||
        s.procedureName?.toLowerCase().includes(query) ||
        s.surgeonName?.toLowerCase().includes(query) ||
        s.otRoom?.toLowerCase().includes(query);
      return matchStage && matchTheatre && matchQuery;
    });
  }, [surgeries, filterStage, filterTheatre, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: surgeries.length,
      inSurgery: surgeries.filter(s => s.status === 'IN_SURGERY').length,
      preOp: surgeries.filter(s => s.status === 'PRE_OP_PREP').length,
      pacu: surgeries.filter(s => s.status === 'PACU_RECOVERY').length,
      scheduled: surgeries.filter(s => s.status === 'SCHEDULED').length
    };
  }, [surgeries]);

  const getStageBadge = (status) => {
    switch (status) {
      case 'IN_SURGERY':
        return <span className="badge bg-danger text-white px-2 py-1"><i className="bi bi-heart-pulse-fill me-1"></i>In-Surgery</span>;
      case 'PRE_OP_PREP':
        return <span className="badge bg-warning text-dark px-2 py-1"><i className="bi bi-clock-history me-1"></i>Pre-Op Holding</span>;
      case 'PACU_RECOVERY':
        return <span className="badge bg-info text-dark px-2 py-1"><i className="bi bi-lungs-fill me-1"></i>PACU Recovery</span>;
      case 'COMPLETED':
        return <span className="badge bg-success text-white px-2 py-1"><i className="bi bi-check-circle-fill me-1"></i>Completed</span>;
      default:
        return <span className="badge bg-primary text-white px-2 py-1"><i className="bi bi-calendar-event me-1"></i>Scheduled</span>;
    }
  };

  return (
    <div className="ot-panel-container p-3 p-md-4" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* HEADER BAR */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-3 bg-danger bg-opacity-10 text-danger p-2 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
              <i className="bi bi-scissors fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                Operation Theatre (OT) & Surgical Scheduling Desk
              </h4>
              <p className="text-muted small mb-0">
                {hospitalName} &bull; Modular Theatres &bull; WHO Surgical Safety Protocol
              </p>
            </div>
          </div>
        </div>

        {!isPatient && (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-danger btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
              onClick={() => setShowScheduleModal(true)}
            >
              <i className="bi bi-plus-circle-fill"></i>
              Schedule New Surgery
            </button>
          </div>
        )}
      </div>

      {/* METRICS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>IN ACTIVE SURGERY</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-danger">{stats.inSurgery}</span>
              <span className="text-muted small">Theatres Operating</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>PRE-OP PREPARATION</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-warning text-dark">{stats.preOp}</span>
              <span className="text-muted small">Holding Bay</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>PACU RECOVERY</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-info">{stats.pacu}</span>
              <span className="text-muted small">Post-Anesthesia</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>TOTAL SCHEDULED</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-primary">{stats.total}</span>
              <span className="text-muted small">Operations Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE THEATRE SUITE MATRIX CARDS */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-door-open-fill text-danger"></i> Modular OT Suites Live Occupancy
          </h6>
          <span className="text-muted small">Laminar Airflow Class 100</span>
        </div>

        <div className="row g-3">
          {OT_SUITES.map((suite) => {
            const activeOp = surgeries.find(s => s.otRoom.includes(suite.id) && (s.status === 'IN_SURGERY' || s.status === 'PRE_OP_PREP'));
            const isOperating = activeOp && activeOp.status === 'IN_SURGERY';

            return (
              <div key={suite.id} className="col-12 col-md-6 col-xl">
                <div
                  className="p-3 rounded-3 h-100 border transition-all"
                  style={{
                    background: isOperating ? '#fff1f2' : activeOp ? '#fffbeb' : '#ffffff',
                    borderColor: isOperating ? '#f43f5e' : activeOp ? '#f59e0b' : '#e2e8f0',
                    borderWidth: activeOp ? '2px' : '1px'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-dark fw-bold">{suite.id}</span>
                    {isOperating ? (
                      <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1">
                        <span className="spinner-grow spinner-grow-sm" style={{ width: 8, height: 8 }}></span>
                        SURGERY IN-PROGRESS
                      </span>
                    ) : activeOp ? (
                      <span className="badge bg-warning text-dark">PRE-OP HOLDING</span>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success">THEATRE READY</span>
                    )}
                  </div>

                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>
                    {suite.name.split('(')[1]?.replace(')', '') || suite.name}
                  </div>
                  <div className="text-muted small mb-2" style={{ fontSize: '11px' }}>{suite.type}</div>

                  {activeOp ? (
                    <div className="p-2 rounded bg-white border border-opacity-50 mt-2">
                      <div className="fw-bold text-primary small text-truncate">{activeOp.procedureName}</div>
                      <div className="text-dark small mt-1">
                        <i className="bi bi-person-fill text-muted me-1"></i>{activeOp.patientName}
                      </div>
                      <div className="text-muted small mt-1" style={{ fontSize: '10px' }}>
                        Surgeon: {formatDoctorName(activeOp.surgeonName)}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-light text-muted small text-center mt-2" style={{ fontSize: '11px' }}>
                      Sterilized & Ready for Next Case
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SURGICAL ROSTER & QUEUE MANAGEMENT */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-journal-medical text-primary"></i> Surgical Operating Roster & Tracking
            </h6>

            {/* Filter controls */}
            <div className="d-flex flex-wrap gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="ALL">All Stages</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PRE_OP_PREP">Pre-Op Preparation</option>
                <option value="IN_SURGERY">In-Surgery</option>
                <option value="PACU_RECOVERY">PACU Recovery</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filterTheatre}
                onChange={(e) => setFilterTheatre(e.target.value)}
              >
                <option value="ALL">All Theatres</option>
                <option value="OT-1">OT-1 (Cardiac)</option>
                <option value="OT-2">OT-2 (Ortho)</option>
                <option value="OT-3">OT-3 (General)</option>
                <option value="OT-4">OT-4 (Neuro)</option>
                <option value="OT-5">OT-5 (Emergency)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '18%' }}>Patient Details</th>
                <th style={{ width: '22%' }}>Procedure & Indication</th>
                <th style={{ width: '18%' }}>Theatre & Slot</th>
                <th style={{ width: '16%' }}>Surgical Team</th>
                <th style={{ width: '12%' }} className="text-center">Current Stage</th>
                <th style={{ width: '14%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurgeries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-clipboard2-x fs-2 d-block mb-2 text-secondary"></i>
                    No surgeries found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredSurgeries.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold text-dark">{s.patientName}</div>
                      <div className="text-muted small" style={{ fontSize: '11px' }}>
                        {s.uhid} &bull; {s.patientAge}Y/{s.patientGender} &bull; <strong className="text-danger">{s.bloodGroup}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{s.procedureName}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '240px', fontSize: '11px' }}>
                        {s.indication}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border mb-1">{s.otRoom.split('(')[0]}</span>
                      <div className="text-dark small">
                        <i className="bi bi-clock me-1 text-muted"></i>{s.scheduledDate} &bull; {s.scheduledTime}
                      </div>
                    </td>
                    <td>
                      <div className="text-dark fw-semibold" style={{ fontSize: '12px' }}>
                        {formatDoctorName(s.surgeonName)}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '11px' }}>
                        Anesth: {formatDoctorName(s.anesthetistName)}
                      </div>
                    </td>
                    <td className="text-center">
                      {getStageBadge(s.status)}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1 flex-wrap">
                        {/* Print Pass */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary py-1 px-2 fw-semibold"
                          style={{ fontSize: '11px', borderRadius: '6px' }}
                          title="Print WHO Surgical Safety Pass"
                          onClick={() => setActivePrintPass(s)}
                        >
                          <i className="bi bi-printer me-1"></i> Safety Pass
                        </button>

                        {/* Stage Progression Buttons */}
                        {!isPatient && (
                          <>
                            {s.status === 'SCHEDULED' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-warning text-dark py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleStageAdvance(s.id, 'PRE_OP_PREP')}
                              >
                                Wheel to Pre-Op
                              </button>
                            )}
                            {s.status === 'PRE_OP_PREP' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleStageAdvance(s.id, 'IN_SURGERY')}
                              >
                                Start Surgery
                              </button>
                            )}
                            {s.status === 'IN_SURGERY' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-info text-dark py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleStageAdvance(s.id, 'PACU_RECOVERY')}
                              >
                                Shift to PACU
                              </button>
                            )}
                            {s.status === 'PACU_RECOVERY' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleStageAdvance(s.id, 'COMPLETED')}
                              >
                                Mark Complete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE SURGERY MODAL */}
      {showScheduleModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-danger text-white border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-scissors fs-5"></i>
                  <h5 className="modal-title fw-bold mb-0">Schedule Operation & Surgical Suite</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowScheduleModal(false)}></button>
              </div>
              <form onSubmit={handleScheduleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Patient */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.patientId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const found = patients.find(p => String(p.id) === String(pId));
                          setFormData({
                            ...formData,
                            patientId: pId,
                            patientName: found ? found.name : formData.patientName,
                            patientAge: found?.age || formData.patientAge,
                            patientGender: found?.gender || formData.patientGender
                          });
                        }}
                        required
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.phone || `ID: ${p.id}`})</option>
                        ))}
                      </select>
                    </div>

                    {/* Blood Group */}
                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-bold text-dark">Blood Group</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      >
                        {['A +ve', 'A -ve', 'B +ve', 'B -ve', 'O +ve', 'O -ve', 'AB +ve', 'AB -ve'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    {/* Surgery Category */}
                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-bold text-dark">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Major Surgery">Major Surgery</option>
                        <option value="Minor Surgery">Minor Surgery</option>
                        <option value="Emergency Surgery">Emergency Surgery</option>
                        <option value="Day Care Procedure">Day Care Procedure</option>
                      </select>
                    </div>

                    {/* Procedure Name */}
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-bold text-dark">Surgical Procedure Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Laparoscopic Appendectomy / Coronary Bypass"
                        value={formData.procedureName}
                        onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                        required
                      />
                    </div>

                    {/* Theatre Suite */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Allocated OT Suite</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.otRoom}
                        onChange={(e) => setFormData({ ...formData, otRoom: e.target.value })}
                      >
                        {OT_SUITES.map(s => (
                          <option key={s.id} value={s.name}>{s.id} - {s.name.split('(')[1]?.replace(')', '') || s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Lead Surgeon */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Lead Operating Surgeon</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.surgeonName}
                        onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.name}>{formatDoctorName(d.name)} ({d.specialty || d.department || 'Surgery'})</option>
                        ))}
                      </select>
                    </div>

                    {/* Anesthesiologist */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Consultant Anesthesiologist</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.anesthetistName}
                        onChange={(e) => setFormData({ ...formData, anesthetistName: e.target.value })}
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.name}>{formatDoctorName(d.name)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date & Time */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Scheduled Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Scheduled Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Expected Duration</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      >
                        <option value="1.0 Hour">1.0 Hour</option>
                        <option value="1.5 Hours">1.5 Hours</option>
                        <option value="2.0 Hours">2.0 Hours</option>
                        <option value="3.0 Hours">3.0 Hours</option>
                        <option value="4+ Hours">4+ Hours (Complex)</option>
                      </select>
                    </div>

                    {/* Clinical Indication */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark">Clinical Indication / Diagnosis</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.indication}
                        onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm px-4 fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-check-fill"></i> Confirm & Book OT Suite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SURGICAL PASS MODAL */}
      {activePrintPass && (
        <PrintModal
          title={`WHO Surgical Safety Pass - ${activePrintPass.procedureName}`}
          onClose={() => setActivePrintPass(null)}
        >
          <SurgeryOtPassSlip
            surgery={activePrintPass}
            patient={patients.find(p => String(p.id) === String(activePrintPass.patientId))}
          />
        </PrintModal>
      )}

    </div>
  );
}

export default OtPanel;
