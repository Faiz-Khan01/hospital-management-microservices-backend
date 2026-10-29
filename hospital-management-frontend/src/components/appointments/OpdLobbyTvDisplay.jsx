import React, { useState, useEffect } from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';

function OpdLobbyTvDisplay({
  show,
  onClose,
  appointments = [],
  doctors = [],
  patients = [],
  currentCalling = null
}) {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  if (!show) return null;

  const hospitalName = getHospitalName();

  // Real statistics directly from appointments prop
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  const totalWaiting = safeAppointments.filter(a => {
    const s = String(a.status || '').toLowerCase();
    return s.includes('scheduled') || s.includes('pending') || s.includes('waiting');
  }).length;

  const totalCompleted = safeAppointments.filter(a => {
    const s = String(a.status || '').toLowerCase();
    return s.includes('completed');
  }).length;

  const totalInConsultation = safeAppointments.filter(a => {
    const s = String(a.status || '').toLowerCase();
    return s.includes('progress') || s.includes('active') || s.includes('consult');
  }).length;

  // Active calling token: ONLY from currentCalling state or real in-progress appointment
  const inProgressAppt = safeAppointments.find(a => {
    const s = String(a.status || '').toLowerCase();
    return s.includes('progress') || s.includes('consult');
  });

  const activeCallingToken = currentCalling || (inProgressAppt ? {
    id: inProgressAppt.id,
    tokenNumber: inProgressAppt.tokenNumber || inProgressAppt.id,
    patientName: inProgressAppt.patientName || inProgressAppt.patient?.name || `Patient #${inProgressAppt.patientId}`,
    doctorName: inProgressAppt.doctorName || `Dr. #${inProgressAppt.doctorId}`,
    roomNumber: `Room 10${(Number(inProgressAppt.doctorId) % 9 || 1)}`,
    department: inProgressAppt.department || 'General Medicine'
  } : null);

  // Map only REAL doctors passed from database
  const doctorRooms = safeDoctors.map((doc, idx) => {
    const docAppts = safeAppointments.filter(a => {
      const matchId = a.doctorId && doc.id && Number(a.doctorId) === Number(doc.id);
      const matchName = a.doctorName && doc.name && a.doctorName.toLowerCase().includes(doc.name.toLowerCase());
      return matchId || matchName;
    });

    // Check if this doctor is actively consulting
    const isDoctorBeingCalled = currentCalling && (
      (currentCalling.doctorId && Number(currentCalling.doctorId) === Number(doc.id)) ||
      (currentCalling.doctorName && currentCalling.doctorName.toLowerCase().includes(doc.name.toLowerCase()))
    );

    const inConsultation = isDoctorBeingCalled ? currentCalling : docAppts.find(a => {
      const s = String(a.status || '').toLowerCase();
      return s.includes('progress') || s.includes('consult');
    });

    const waitingQueue = docAppts.filter(a => {
      const s = String(a.status || '').toLowerCase();
      return s.includes('scheduled') || s.includes('pending') || s.includes('waiting');
    });

    return {
      doctor: doc,
      roomNumber: `Room 10${idx + 1}`,
      wing: idx % 2 === 0 ? 'OPD North Wing' : 'OPD South Wing',
      currentServing: inConsultation,
      waiting: waitingQueue
    };
  });

  return (
    <div
      className="opd-tv-overlay position-fixed top-0 start-0 w-100 h-100 d-flex flex-column text-white"
      style={{
        zIndex: 1070,
        backgroundColor: '#070d1e',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #11254a 0%, #070d1e 75%)',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        overflowY: 'auto'
      }}
    >
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 25px rgba(14, 165, 233, 0.5); }
          50% { box-shadow: 0 0 50px rgba(14, 165, 233, 0.9); }
        }
        @keyframes calling-flash {
          0%, 100% { border-color: #0284c7; }
          50% { border-color: #38bdf8; }
        }
        .calling-hero-card {
          animation: pulse-glow 2.5s infinite ease-in-out, calling-flash 1.5s infinite linear;
        }
      `}</style>

      {/* TOP TV HEADER */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(5, 11, 26, 0.85)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-primary p-2 text-white shadow d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
            <i className="bi bi-hospital fs-3"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-white tracking-wide text-uppercase" style={{ letterSpacing: '1px' }}>
              {hospitalName}
            </h4>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="badge bg-danger rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1">
                <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: 8, height: 8 }}></span>
                LIVE OPD TOKEN QUEUE
              </span>
              <span className="text-secondary small">NABH Accredited Tertiary Healthcare &bull; Central Waiting Lobby TV</span>
            </div>
          </div>
        </div>

        {/* CLOCK & CONTROLS */}
        <div className="d-flex align-items-center gap-4">
          <div className="text-end">
            <div className="fw-bold fs-4" style={{ color: '#38bdf8', letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>
              {time.toLocaleTimeString('en-IN', { hour12: true })}
            </div>
            <div className="text-secondary small" style={{ fontSize: '11px' }}>
              {time.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-light btn-sm px-3 d-flex align-items-center gap-2"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen for Lobby TV"
            >
              <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
              {isFullscreen ? 'Exit Fullscreen' : 'Lobby TV Fullscreen'}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm px-3 d-flex align-items-center gap-1"
              onClick={onClose}
            >
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BODY AREA */}
      <div className="flex-grow-1 p-4 d-flex flex-column gap-4">
        
        {/* CURRENTLY CALLING HERO BANNER - REAL DATA ONLY */}
        {activeCallingToken ? (
          <div
            className="calling-hero-card rounded-4 p-4 border border-2 border-primary"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="row align-items-center g-3">
              <div className="col-12 col-md-3 text-center border-end border-secondary border-opacity-25 pe-md-4">
                <span className="badge bg-primary bg-opacity-25 border border-info px-3 py-1 mb-2 text-uppercase fw-bold" style={{ color: '#38bdf8' }}>
                  <i className="bi bi-megaphone-fill me-1"></i> NOW CALLING
                </span>
                <div className="display-4 fw-bold text-white mb-0" style={{ letterSpacing: '2px', textShadow: '0 0 20px rgba(56, 189, 248, 0.8)' }}>
                  TOKEN #{activeCallingToken.tokenNumber || activeCallingToken.id}
                </div>
                <div className="text-secondary small mt-1">Please proceed to chamber immediately</div>
              </div>

              <div className="col-12 col-md-5 ps-md-4">
                <div className="text-secondary small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>PATIENT NAME</div>
                <h2 className="fw-bold text-white mb-2" style={{ fontSize: '28px' }}>
                  {activeCallingToken.patientName}
                </h2>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-success bg-opacity-20 text-success border border-success px-3 py-2 fs-6">
                    <i className="bi bi-door-open-fill me-1"></i> {activeCallingToken.roomNumber}
                  </span>
                  <span className="text-secondary small">&bull; Priority OPD Consultation</span>
                </div>
              </div>

              <div className="col-12 col-md-4 text-md-end">
                <div className="text-secondary small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>CONSULTING PHYSICIAN</div>
                <h4 className="fw-bold mb-1" style={{ color: '#38bdf8' }}>
                  {formatDoctorName(activeCallingToken.doctorName)}
                </h4>
                <div className="text-white-50 small mb-2">{activeCallingToken.department}</div>
                <div className="badge bg-light bg-opacity-10 text-white px-3 py-2 rounded-3 border border-secondary border-opacity-50">
                  <i className="bi bi-volume-up-fill text-warning me-2 fs-6"></i>
                  Audible Chime Dispatched to Lobby
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-4 p-4 border border-secondary border-opacity-25 text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <div className="rounded-circle bg-secondary bg-opacity-25 p-3 mb-2" style={{ width: 60, height: 60 }}>
                <i className="bi bi-megaphone text-white-50 fs-3"></i>
              </div>
              <h5 className="fw-bold text-white mb-1">OPD Chambers Ready &bull; Waiting for Next Call</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: '500px' }}>
                When doctors click &quot;Call Token&quot; in the Appointments desk, the called patient token and room announcement will appear here live with audio broadcast.
              </p>
            </div>
          </div>
        )}

        {/* MULTI-ROOM DOCTOR CONSULTATION MATRIX (REAL DOCTORS ONLY) */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-grid-3x3-gap-fill text-primary"></i> Live OPD Chambers & Waiting Line
            </h5>
            <span className="text-secondary small">{safeDoctors.length} On-Duty Specialists &bull; Real-time</span>
          </div>

          {safeDoctors.length === 0 ? (
            <div className="text-center p-5 text-secondary border border-secondary border-opacity-25 rounded-3">
              <i className="bi bi-person-x fs-1 d-block mb-2 text-white-50"></i>
              No doctors currently registered in the database.
            </div>
          ) : (
            <div className="row g-3">
              {doctorRooms.map((room, rIdx) => {
                const doc = room.doctor;
                const serving = room.currentServing;
                return (
                  <div key={doc.id || rIdx} className="col-12 col-md-6 col-xl-4">
                    <div
                      className="h-100 rounded-3 p-3 border border-secondary border-opacity-25 d-flex flex-column justify-content-between"
                      style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <div>
                        {/* Room Header */}
                        <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                          <div>
                            <span className="badge bg-primary px-2 py-1 fw-bold mb-1">{room.roomNumber}</span>
                            <h6 className="fw-bold text-white mb-0">{formatDoctorName(doc.name)}</h6>
                            <div className="text-secondary small" style={{ fontSize: '11px' }}>{doc.specialty || doc.department || 'General Medicine'}</div>
                          </div>
                          <span className="text-muted small" style={{ fontSize: '10px' }}>{room.wing}</span>
                        </div>

                        {/* Current In Consultation */}
                        <div
                          className="p-3 rounded-3 mb-3"
                          style={{
                            background: serving ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: serving ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <div className="text-secondary small fw-bold mb-1" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                            {serving ? '🟢 In Consultation' : '⚪ Ready for Next Patient'}
                          </div>
                          <div className="fs-5 fw-bold text-white">
                            {serving ? `Token #${serving.tokenNumber || serving.id}` : 'Chamber Available'}
                          </div>
                          <div className="text-white-50 small text-truncate">
                            {serving ? (serving.patientName || `Patient #${serving.patientId}`) : 'Doctor ready to call next patient'}
                          </div>
                        </div>

                        {/* Upcoming In Queue - Real Waiting Appointments */}
                        <div>
                          <div className="text-secondary small fw-bold mb-2" style={{ fontSize: '11px' }}>
                            <i className="bi bi-clock-history me-1"></i> WAITING IN LINE ({room.waiting.length})
                          </div>
                          <div className="d-flex flex-column gap-1">
                            {room.waiting.length > 0 ? (
                              room.waiting.map((w, wIdx) => (
                                <div
                                  key={w.id || wIdx}
                                  className="d-flex justify-content-between align-items-center p-2 rounded bg-black bg-opacity-25 border border-secondary border-opacity-10"
                                  style={{ fontSize: '12px' }}
                                >
                                  <span className="fw-bold" style={{ color: '#38bdf8' }}>
                                    Token #{w.tokenNumber || w.id}
                                  </span>
                                  <span className="text-white-50 text-truncate" style={{ maxWidth: '140px' }}>
                                    {w.patientName || `Patient #${w.patientId || wIdx + 1}`}
                                  </span>
                                  <span className="badge bg-secondary bg-opacity-50 text-light" style={{ fontSize: '10px' }}>
                                    In Queue
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-muted small p-2 text-center" style={{ fontSize: '11px' }}>
                                No patients waiting in queue
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                        <span className="text-muted small" style={{ fontSize: '10px' }}>
                          Experience: {doc.experience ? `${doc.experience} Yrs` : 'Consultant'}
                        </span>
                        <span className="text-success small fw-semibold" style={{ fontSize: '11px' }}>
                          <i className="bi bi-check-circle me-1"></i> {doc.status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM TICKER STATS - 100% REAL APPOINTMENT DATA */}
      <div className="px-4 py-2 border-top border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center" style={{ background: '#050b1a' }}>
        <div className="d-flex align-items-center gap-4 text-white-50 small" style={{ fontSize: '12px' }}>
          <div>
            <strong className="text-white fs-6 me-1">{safeAppointments.length}</strong> Total Bookings
          </div>
          <div>
            <strong className="text-info fs-6 me-1">{totalInConsultation}</strong> Inside Consultation
          </div>
          <div>
            <strong className="text-warning fs-6 me-1">{totalWaiting}</strong> Waiting in Lobby
          </div>
          <div>
            <strong className="text-success fs-6 me-1">{totalCompleted}</strong> Completed Today
          </div>
        </div>

        <div className="text-white-50 small d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
          <i className="bi bi-info-circle text-info"></i>
          <span>Live Token System powered by HospitalSync Pro &bull; For assistance contact OPD Reception Desk</span>
        </div>
      </div>
    </div>
  );
}

export default OpdLobbyTvDisplay;
