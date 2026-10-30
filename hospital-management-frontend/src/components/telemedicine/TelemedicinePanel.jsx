import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import DoctorService from '../../services/DoctorService';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import TeleConsultationSlip from './TeleConsultationSlip';
import { toast } from 'react-toastify';

const INITIAL_SESSIONS = [
  {
    id: 1,
    sessionId: 'TELE-2026-901',
    patientName: 'Rahul Sharma',
    patientUhid: 'UHID-101',
    patientAge: 42,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    patientLocation: 'New Delhi (Home Remote)',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    date: '2026-10-30',
    time: '11:30 AM',
    callDuration: '14 Mins 20 Secs',
    chiefComplaint: 'Post-angioplasty routine checkup, mild chest soreness on climbing stairs',
    diagnosis: 'Stable Post-PCI Evaluation • Controlled Hypertension',
    status: 'IN_VIDEO_CALL'
  },
  {
    id: 2,
    sessionId: 'TELE-2026-902',
    patientName: 'Anita Verma',
    patientUhid: 'UHID-102',
    patientAge: 36,
    patientGender: 'Female',
    patientPhone: '+91 98765 43211',
    patientLocation: 'Gurgaon (Remote Home)',
    doctorName: 'Dr. Priya Nair',
    specialty: 'Neurology & Stroke Care',
    date: '2026-10-30',
    time: '01:00 PM',
    callDuration: '0 Mins (Waiting in Lobby)',
    chiefComplaint: 'Tension headache, intermittent vertigo in morning hours',
    diagnosis: 'Cervicogenic Headache • Benign Positional Vertigo',
    status: 'WAITING_IN_LOBBY'
  },
  {
    id: 3,
    sessionId: 'TELE-2026-903',
    patientName: 'Vikram Malhotra',
    patientUhid: 'UHID-103',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+91 98765 43212',
    patientLocation: 'Noida (Remote Home)',
    doctorName: 'Dr. Vikram Patel',
    specialty: 'Orthopedics & Joint Replacement',
    date: '2026-10-29',
    time: '04:15 PM',
    callDuration: '18 Mins 10 Secs',
    chiefComplaint: 'Right knee stiffness, post-surgery physical therapy progression check',
    diagnosis: 'Post-TKR Day 14 • Good Range of Motion',
    status: 'CONSULTATION_COMPLETED'
  }
];

const TELE_STORAGE_KEY = 'hospitalsync_telemedicine_sessions_v1';

export default function TelemedicinePanel() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(TELE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeSession, setActiveSession] = useState(sessions[0]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeSlipSession, setActiveSlipSession] = useState(null);

  // Live Video Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // In-Call Live Prescription Editor
  const [liveDiagnosis, setLiveDiagnosis] = useState('');
  const [liveAdvice, setLiveAdvice] = useState('');

  // Form State for Booking
  const [newPatientId, setNewPatientId] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('02:30 PM');
  const [newComplaint, setNewComplaint] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(TELE_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    DoctorService.getAllDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (activeSession) {
      setLiveDiagnosis(activeSession.diagnosis || '');
      setLiveAdvice('Continue daily medication. Maintain regular blood pressure chart.');
    }
  }, [activeSession]);

  const handleStartCall = (session) => {
    setActiveSession(session);
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'IN_VIDEO_CALL' } : s));
    toast.success(`Connected to encrypted WebRTC video call with ${session.patientName}!`);
  };

  const handleCompleteCall = () => {
    if (!activeSession) return;

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          diagnosis: liveDiagnosis,
          status: 'CONSULTATION_COMPLETED'
        };
      }
      return s;
    }));

    const completed = {
      ...activeSession,
      diagnosis: liveDiagnosis,
      status: 'CONSULTATION_COMPLETED'
    };

    setActiveSession(completed);
    toast.success('Tele-consultation completed! E-Prescription digitally signed & issued.');
    setActiveSlipSession(completed);
  };

  const handleBookSession = (e) => {
    e.preventDefault();

    const p = patients.find(pat => String(pat.id) === String(newPatientId));
    const d = doctors.find(doc => String(doc.id) === String(newDoctorId));

    const pName = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name : 'Tele-OPD Patient';
    const docName = d ? formatDoctorName(d.name) : 'Dr. Sarah Jenkins';

    const newSess = {
      id: Date.now(),
      sessionId: `TELE-2026-${Math.floor(904 + Math.random() * 50)}`,
      patientName: pName,
      patientUhid: p?.uhid || `UHID-${newPatientId || 'AUTO'}`,
      patientAge: p?.age || 38,
      patientGender: p?.gender || 'Male',
      patientPhone: p?.contactNumber || '+91 98765 43210',
      patientLocation: 'Remote Home Location',
      doctorName: docName,
      specialty: d?.specialization || 'General Medicine',
      date: newDate,
      time: newTime,
      callDuration: '0 Mins (Waiting in Lobby)',
      chiefComplaint: newComplaint || 'Remote general follow-up consultation',
      diagnosis: 'Evaluation Pending Video Consultation',
      status: 'WAITING_IN_LOBBY'
    };

    setSessions(prev => [newSess, ...prev]);
    toast.success(`Virtual appointment booked! Video room link dispatched via SMS.`);
    setShowBookModal(false);
  };

  return (
    <div className="container-fluid py-3" style={{ backgroundColor: '#0b1120', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center text-white">
            <span className="badge bg-primary me-2 font-monospace px-2 py-1 fs-6">TELE-OPD</span>
            Tele-Medicine & Remote Video Consultation Desk (WebRTC)
          </h3>
          <p className="text-secondary small mb-0">
            {getHospitalName()} • National Medical Commission (NMC) Practice Guidelines • High-Definition Video Room
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowBookModal(true)}
          >
            <i className="bi bi-calendar-plus-fill me-1"></i> Book Virtual Consultation
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column: Scheduled Video Queue */}
        <div className="col-lg-4 col-md-5">
          <div className="card border-secondary shadow-sm" style={{ backgroundColor: '#111827' }}>
            <div className="card-header bg-dark border-bottom border-secondary py-2 d-flex justify-content-between align-items-center">
              <strong className="text-white small">
                <i className="bi bi-people-fill me-1 text-primary"></i> Virtual OPD Waiting Room ({sessions.length})
              </strong>
              <span className="badge bg-success font-monospace" style={{ fontSize: '0.65rem' }}>WEBRTC LIVE</span>
            </div>

            <div className="card-body p-2" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {sessions.map(s => {
                const isSelected = activeSession?.id === s.id;
                const isInCall = s.status === 'IN_VIDEO_CALL';

                return (
                  <div
                    key={s.id}
                    className={`p-2 rounded mb-2 border ${
                      isSelected
                        ? 'border-primary bg-primary bg-opacity-20 text-white'
                        : 'border-secondary bg-black bg-opacity-40 text-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveSession(s)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className={`font-monospace small ${isSelected ? 'text-primary' : 'text-light'}`}>
                        {s.sessionId}
                      </strong>
                      <span className={`badge ${
                        isInCall ? 'bg-danger animate-pulse' :
                        s.status === 'WAITING_IN_LOBBY' ? 'bg-warning text-dark' : 'bg-success'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="fw-semibold text-white small">{s.patientName}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{s.doctorName} ({s.specialty})</div>
                    <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                      {s.date} • {s.time}
                    </div>

                    <div className="mt-2 pt-1 border-top border-secondary d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: '0.7rem' }}>{s.callDuration}</span>
                      {s.status !== 'IN_VIDEO_CALL' && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          style={{ fontSize: '0.68rem' }}
                          onClick={(e) => { e.stopPropagation(); handleStartCall(s); }}
                        >
                          <i className="bi bi-camera-video me-1"></i> Join Call
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: WebRTC Virtual Consultation Room & Live E-Rx */}
        <div className="col-lg-8 col-md-7">
          {activeSession ? (
            <div className="card border-secondary shadow-sm" style={{ backgroundColor: '#111827' }}>
              {/* Call Room Banner */}
              <div className="card-header bg-black border-bottom border-secondary py-2 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-danger font-monospace px-2 py-1">ENCRYPTED CALL</span>
                  <strong className="text-white small">
                    {activeSession.patientName} &bull; {activeSession.doctorName}
                  </strong>
                </div>

                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                    onClick={() => setActiveSlipSession(activeSession)}
                  >
                    <i className="bi bi-printer-fill me-1"></i> Print E-Rx
                  </button>
                </div>
              </div>

              <div className="card-body p-3">
                {/* Simulated WebRTC Video Feeds */}
                <div className="row g-2 mb-3">
                  {/* Remote Patient Video Feed */}
                  <div className="col-8">
                    <div
                      className="rounded-3 position-relative overflow-hidden d-flex justify-content-center align-items-center border border-secondary shadow"
                      style={{ height: '300px', backgroundColor: '#030712' }}
                    >
                      <div className="text-center text-secondary">
                        <div className="rounded-circle bg-secondary bg-opacity-20 p-4 d-inline-block mb-2">
                          <i className="bi bi-person-fill text-primary" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h6 className="text-white fw-bold mb-0">{activeSession.patientName}</h6>
                        <small className="text-muted font-monospace">{activeSession.patientLocation}</small>
                      </div>

                      {/* Video Overlays */}
                      <div className="position-absolute top-0 start-0 p-2 font-monospace text-secondary" style={{ fontSize: '0.7rem' }}>
                        <span className="badge bg-dark bg-opacity-75 text-light border border-secondary">
                          <i className="bi bi-wifi text-success me-1"></i> HD 1080p WebRTC
                        </span>
                      </div>
                      <div className="position-absolute bottom-0 start-0 p-2 font-monospace text-white" style={{ fontSize: '0.7rem' }}>
                        {activeSession.callDuration}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Video Feed (Self View PIP) */}
                  <div className="col-4">
                    <div
                      className="rounded-3 position-relative overflow-hidden d-flex justify-content-center align-items-center border border-secondary shadow"
                      style={{ height: '300px', backgroundColor: '#020617' }}
                    >
                      <div className="text-center text-secondary">
                        <div className="rounded-circle bg-primary bg-opacity-20 p-3 d-inline-block mb-2">
                          <i className="bi bi-person-badge-fill text-info" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h6 className="text-white fw-bold mb-0 small">{activeSession.doctorName}</h6>
                        <small className="text-muted" style={{ fontSize: '0.68rem' }}>Doctor Console (Self)</small>
                      </div>

                      <div className="position-absolute bottom-0 start-0 p-2 font-monospace text-success" style={{ fontSize: '0.68rem' }}>
                        Camera Active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Controls Toolbar */}
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3 bg-black bg-opacity-50 p-2 rounded-3 border border-secondary">
                  <button
                    type="button"
                    className={`btn btn-sm ${isMuted ? 'btn-danger' : 'btn-outline-light'} px-3`}
                    onClick={() => { setIsMuted(prev => !prev); toast.info(isMuted ? 'Mic Unmuted' : 'Mic Muted'); }}
                  >
                    <i className={`bi ${isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'} me-1`}></i>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${isCameraOff ? 'btn-danger' : 'btn-outline-light'} px-3`}
                    onClick={() => { setIsCameraOff(prev => !prev); toast.info(isCameraOff ? 'Camera Started' : 'Camera Stopped'); }}
                  >
                    <i className={`bi ${isCameraOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'} me-1`}></i>
                    {isCameraOff ? 'Start Video' : 'Stop Video'}
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${isScreenSharing ? 'btn-info text-dark' : 'btn-outline-light'} px-3`}
                    onClick={() => { setIsScreenSharing(prev => !prev); toast.info(isScreenSharing ? 'Screen Share Stopped' : 'Screen Share Active'); }}
                  >
                    <i className="bi bi-display me-1"></i> Screen Share
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-sm fw-bold px-4 ms-2"
                    onClick={handleCompleteCall}
                  >
                    <i className="bi bi-check-circle-fill me-1"></i> Complete & Sign E-Rx
                  </button>
                </div>

                {/* In-Call Live Prescription Writer */}
                <div className="card border-secondary bg-black bg-opacity-30">
                  <div className="card-header bg-dark border-secondary py-1 text-white small fw-bold">
                    <i className="bi bi-pencil-square text-primary me-1"></i> In-Call Live Clinical Notes & Prescription Writer
                  </div>
                  <div className="card-body p-2 small">
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label text-secondary" style={{ fontSize: '0.72rem' }}>PROVISIONAL DIAGNOSIS:</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-dark text-white border-secondary"
                          value={liveDiagnosis}
                          onChange={(e) => setLiveDiagnosis(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-secondary" style={{ fontSize: '0.72rem' }}>CLINICAL ADVICE & INSTRUCTIONS:</label>
                        <textarea
                          className="form-control form-control-sm bg-dark text-white border-secondary"
                          rows="2"
                          value={liveAdvice}
                          onChange={(e) => setLiveAdvice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-secondary p-5 text-center text-secondary" style={{ backgroundColor: '#111827' }}>
              <i className="bi bi-camera-video fs-1 mb-2 opacity-50"></i>
              <h5>No Consultation Selected</h5>
              <p className="small">Select a patient from the virtual queue to start the remote video call.</p>
            </div>
          )}
        </div>
      </div>

      {/* Book Virtual Consultation Modal */}
      {showBookModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ backgroundColor: '#131b2e', color: '#e2e8f0' }}>
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fs-6 fw-bold text-white">
                  <i className="bi bi-calendar-plus text-primary me-2"></i>
                  Schedule Remote Tele-Medicine Consultation
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBookModal(false)}></button>
              </div>

              <form onSubmit={handleBookSession}>
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
                    <label className="form-label small text-secondary">Consulting Specialist *</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={newDoctorId}
                      onChange={(e) => setNewDoctorId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {formatDoctorName(d.name)} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Time Slot</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small text-secondary">Chief Health Complaint</label>
                    <textarea
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      rows="2"
                      placeholder="Symptoms or follow-up query..."
                      value={newComplaint}
                      onChange={(e) => setNewComplaint(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowBookModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">
                    Schedule & Send Video Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Consultation Slip */}
      {activeSlipSession && (
        <TeleConsultationSlip
          session={activeSlipSession}
          onClose={() => setActiveSlipSession(null)}
        />
      )}
    </div>
  );
}
