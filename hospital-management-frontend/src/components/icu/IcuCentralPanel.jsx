import React, { useState, useEffect, useRef, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import BedService from '../../services/BedService';
import DoctorService from '../../services/DoctorService';
import RealtimeNotificationHub, { playEmergencyCodeRedSiren } from '../../services/RealtimeNotificationHub';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import IcuTelemetrySlip from './IcuTelemetrySlip';
import { toast } from 'react-toastify';

const INITIAL_ICU_BEDS = [
  {
    id: 1,
    bedNumber: 'ICU-01',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'OCCUPIED',
    patient: {
      id: 101,
      name: 'Rahul Sharma',
      uhid: 'UHID-ICU-8821',
      age: 42,
      gender: 'Male',
      bloodGroup: 'O+'
    },
    doctorName: 'Dr. Sarah Jenkins',
    diagnosis: 'Acute Anteroseptal STEMI • Post-Primary PCI',
    ventMode: 'High-Flow Nasal Cannula (HFNC 40L, FiO2 35%)',
    mewsScore: 2,
    vitals: { hr: 76, bp: '118/76', map: 90, spo2: 98, rr: 16, temp: 37.0, gcs: '15/15' },
    noradRate: 'None',
    fentanylRate: '1 ml/hr'
  },
  {
    id: 2,
    bedNumber: 'ICU-02',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'OCCUPIED',
    patient: {
      id: 102,
      name: 'Anita Verma',
      uhid: 'UHID-ICU-8822',
      age: 36,
      gender: 'Female',
      bloodGroup: 'B+'
    },
    doctorName: 'Dr. Priya Nair',
    diagnosis: 'Severe DKA with Septic Shock • ARDS Grade 1',
    ventMode: 'SIMV-VC (Vt: 420ml, PEEP: 8, FiO2: 50%)',
    mewsScore: 4,
    vitals: { hr: 112, bp: '92/58', map: 69, spo2: 93, rr: 24, temp: 38.4, gcs: '12/15' },
    noradRate: '0.12 mcg/kg/min',
    fentanylRate: '2 ml/hr'
  },
  {
    id: 3,
    bedNumber: 'ICU-03',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'AVAILABLE',
    patient: null,
    doctorName: 'Dr. Sarah Jenkins',
    diagnosis: 'Clean & Disinfected • Ready for Admission',
    ventMode: 'Standby / Clean Tubing',
    mewsScore: 0,
    vitals: { hr: 0, bp: '-/-', map: 0, spo2: 0, rr: 0, temp: 0, gcs: '-/-' },
    noradRate: 'None',
    fentanylRate: 'None'
  },
  {
    id: 4,
    bedNumber: 'ICU-04',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'OCCUPIED',
    patient: {
      id: 103,
      name: 'Vikram Malhotra',
      uhid: 'UHID-ICU-8824',
      age: 58,
      gender: 'Male',
      bloodGroup: 'A+'
    },
    doctorName: 'Dr. Vikram Patel',
    diagnosis: 'Post-CABG Day 1 • Left Pleural Effusion',
    ventMode: 'CPAP/PS (PEEP: 5, PS: 8, FiO2: 30%)',
    mewsScore: 3,
    vitals: { hr: 84, bp: '128/82', map: 97, spo2: 96, rr: 18, temp: 37.2, gcs: '14/15' },
    noradRate: '0.04 mcg/kg/min',
    fentanylRate: '1.5 ml/hr'
  },
  {
    id: 5,
    bedNumber: 'ICU-05',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'AVAILABLE',
    patient: null,
    doctorName: 'Dr. Ananya Sen',
    diagnosis: 'Clean & Disinfected • Ready for Admission',
    ventMode: 'Standby / Hamilton C6 Ventilator',
    mewsScore: 0,
    vitals: { hr: 0, bp: '-/-', map: 0, spo2: 0, rr: 0, temp: 0, gcs: '-/-' },
    noradRate: 'None',
    fentanylRate: 'None'
  },
  {
    id: 6,
    bedNumber: 'ICU-06',
    wardName: 'Intensive Care Unit (ICU)',
    status: 'OCCUPIED',
    patient: {
      id: 104,
      name: 'Mohammad Farooq',
      uhid: 'UHID-ICU-8826',
      age: 64,
      gender: 'Male',
      bloodGroup: 'AB+'
    },
    doctorName: 'Dr. Sarah Jenkins',
    diagnosis: 'Acute Exacerbation of COPD • Type-2 Respiratory Failure',
    ventMode: 'Non-Invasive BiPAP (IPAP: 14, EPAP: 6)',
    mewsScore: 3,
    vitals: { hr: 88, bp: '134/86', map: 102, spo2: 92, rr: 20, temp: 36.8, gcs: '15/15' },
    noradRate: 'None',
    fentanylRate: 'None'
  }
];

const ICU_STORAGE_KEY = 'hospitalsync_icu_telemetry_state_v1';

export default function IcuCentralPanel() {
  const [icuBeds, setIcuBeds] = useState(() => {
    try {
      const saved = localStorage.getItem(ICU_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ICU_BEDS;
    } catch {
      return INITIAL_ICU_BEDS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [alarmSilenced, setAlarmSilenced] = useState(false);
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [activeSlipBed, setActiveSlipBed] = useState(null);
  const [editBedModal, setEditBedModal] = useState(null);
  const [assignPatientModal, setAssignPatientModal] = useState(null);

  // Form states for Vitals update modal
  const [formHr, setFormHr] = useState('');
  const [formBp, setFormBp] = useState('');
  const [formSpo2, setFormSpo2] = useState('');
  const [formRr, setFormRr] = useState('');
  const [formTemp, setFormTemp] = useState('');
  const [formGcs, setFormGcs] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formVent, setFormVent] = useState('');

  // Form state for Patient Assignment
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newVent, setNewVent] = useState('');

  // Canvas Refs for ECG waveforms
  const canvasRefs = useRef({});

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ICU_STORAGE_KEY, JSON.stringify(icuBeds));
    } catch (e) {
      console.error(e);
    }
  }, [icuBeds]);

  // Load registered patients & doctors
  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    DoctorService.getAllDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  // Alarm Silence Timer Countdown
  useEffect(() => {
    if (!alarmSilenced || silenceSeconds <= 0) return;
    const interval = setInterval(() => {
      setSilenceSeconds(prev => {
        if (prev <= 1) {
          setAlarmSilenced(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [alarmSilenced, silenceSeconds]);

  // Handle Silence Button
  const handleToggleSilence = () => {
    if (alarmSilenced) {
      setAlarmSilenced(false);
      setSilenceSeconds(0);
      toast.info('Audio alarms unmuted.');
    } else {
      setAlarmSilenced(true);
      setSilenceSeconds(120);
      toast.warning('ICU audio alarms paused for 120 seconds.');
    }
  };

  // Code Blue Emergency Broadcast
  const handleCodeBlue = (bed) => {
    playEmergencyCodeRedSiren();
    RealtimeNotificationHub.publishNotification({
      type: 'ICU_CODE_BLUE',
      title: `🚨 CODE BLUE: Cardiac/Resp Arrest at ${bed.bedNumber}`,
      message: `Immediate CPR & Crash Cart needed at ${bed.bedNumber} (${bed.wardName}). Patient: ${bed.patient?.name || 'Critical'}. Intensivist: ${bed.doctorName}`,
      targetRoles: ['DOCTOR', 'NURSE', 'ADMIN'],
      bedNumber: bed.bedNumber
    });
    toast.error(`🚨 CODE BLUE DISPATCHED TO ${bed.bedNumber}! CRASH CART TEAM ALERTED!`);
  };

  // Open Edit Vitals Modal
  const handleOpenEditVitals = (bed) => {
    setEditBedModal(bed);
    setFormHr(bed.vitals?.hr || 75);
    setFormBp(bed.vitals?.bp || '120/80');
    setFormSpo2(bed.vitals?.spo2 || 98);
    setFormRr(bed.vitals?.rr || 16);
    setFormTemp(bed.vitals?.temp || 37.0);
    setFormGcs(bed.vitals?.gcs || '15/15');
    setFormDiagnosis(bed.diagnosis || '');
    setFormVent(bed.ventMode || '');
  };

  // Save Vitals
  const handleSaveVitals = (e) => {
    e.preventDefault();
    if (!editBedModal) return;

    const hrNum = parseInt(formHr, 10) || 75;
    const spo2Num = parseInt(formSpo2, 10) || 98;
    const rrNum = parseInt(formRr, 10) || 16;
    const tempNum = parseFloat(formTemp) || 37.0;

    // Calculate MEWS Score
    let mews = 0;
    if (hrNum >= 130 || hrNum <= 40) mews += 3;
    else if (hrNum >= 111 || hrNum <= 50) mews += 2;
    else if (hrNum >= 101) mews += 1;

    if (spo2Num < 90) mews += 3;
    else if (spo2Num <= 93) mews += 2;
    else if (spo2Num <= 95) mews += 1;

    if (rrNum >= 30 || rrNum <= 8) mews += 3;
    else if (rrNum >= 25) mews += 2;
    else if (rrNum >= 21) mews += 1;

    if (tempNum >= 39.0 || tempNum < 35.0) mews += 2;

    const parts = String(formBp).split('/');
    const sbp = parseInt(parts[0], 10) || 120;
    const dbp = parseInt(parts[1], 10) || 80;
    const calcMap = Math.round(dbp + (sbp - dbp) / 3);

    setIcuBeds(prev => prev.map(b => {
      if (b.id === editBedModal.id) {
        return {
          ...b,
          diagnosis: formDiagnosis,
          ventMode: formVent,
          mewsScore: mews,
          vitals: {
            hr: hrNum,
            bp: formBp,
            map: calcMap,
            spo2: spo2Num,
            rr: rrNum,
            temp: tempNum,
            gcs: formGcs
          }
        };
      }
      return b;
    }));

    toast.success(`Vitals recorded for ${editBedModal.bedNumber}`);
    setEditBedModal(null);
  };

  // Open Assign Patient Modal
  const handleOpenAssignModal = (bed) => {
    setAssignPatientModal(bed);
    setSelectedPatientId('');
    setSelectedDoctorId(doctors[0]?.id || '');
    setNewDiagnosis('Severe Pneumonia with Sepsis');
    setNewVent('High-Flow Oxygen Mask (10L/min)');
  };

  // Save Patient Admission
  const handleAssignPatient = (e) => {
    e.preventDefault();
    if (!assignPatientModal || !selectedPatientId) {
      toast.error('Please select a patient.');
      return;
    }

    const targetPatient = patients.find(p => String(p.id) === String(selectedPatientId));
    const targetDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId));

    const pName = targetPatient ? `${targetPatient.firstName || ''} ${targetPatient.lastName || ''}`.trim() || targetPatient.name : 'Patient';

    setIcuBeds(prev => prev.map(b => {
      if (b.id === assignPatientModal.id) {
        return {
          ...b,
          status: 'OCCUPIED',
          patient: {
            id: targetPatient?.id,
            name: pName,
            uhid: targetPatient?.uhid || `UHID-ICU-${targetPatient?.id}`,
            age: targetPatient?.age || 45,
            gender: targetPatient?.gender || 'Male',
            bloodGroup: targetPatient?.bloodGroup || 'O+'
          },
          doctorName: targetDoctor?.name ? formatDoctorName(targetDoctor.name) : 'Dr. Sarah Jenkins',
          diagnosis: newDiagnosis,
          ventMode: newVent,
          mewsScore: 2,
          vitals: { hr: 82, bp: '124/80', map: 94, spo2: 97, rr: 18, temp: 37.1, gcs: '15/15' }
        };
      }
      return b;
    }));

    toast.success(`${pName} successfully admitted to ${assignPatientModal.bedNumber}`);
    setAssignPatientModal(null);
  };

  // Discharge Patient from Bed
  const handleDischargeBed = (bed) => {
    if (!window.confirm(`Discharge ${bed.patient?.name || 'patient'} from ${bed.bedNumber}? Bed will be sanitized and marked available.`)) return;

    setIcuBeds(prev => prev.map(b => {
      if (b.id === bed.id) {
        return {
          ...b,
          status: 'AVAILABLE',
          patient: null,
          diagnosis: 'Clean & Disinfected • Ready for Admission',
          ventMode: 'Standby / Clean Tubing',
          mewsScore: 0,
          vitals: { hr: 0, bp: '-/-', map: 0, spo2: 0, rr: 0, temp: 0, gcs: '-/-' }
        };
      }
      return b;
    }));

    toast.info(`${bed.bedNumber} is now sanitized and marked AVAILABLE.`);
  };

  // Real-time Canvas ECG Animator Loop
  useEffect(() => {
    let animationFrameId;
    let step = 0;

    const render = () => {
      step += 2;

      icuBeds.forEach(bed => {
        const canvas = canvasRefs.current[bed.id];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        if (bed.status !== 'OCCUPIED') {
          // Flatline or subtle baseline
          ctx.fillStyle = '#050c14';
          ctx.fillRect(0, 0, width, height);

          // Grid lines
          ctx.strokeStyle = 'rgba(0, 255, 128, 0.08)';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
          }
          for (let y = 0; y < height; y += 15) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
          }

          // Flat green line
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          return;
        }

        // Active Patient ECG Rendering
        ctx.fillStyle = '#03080f';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = 'rgba(0, 255, 128, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 15) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // ECG Waveform Lead II
        const hr = bed.vitals?.hr || 75;
        const cycleLength = Math.max(60, Math.floor(6000 / hr));
        const midY = height / 2;

        ctx.strokeStyle = bed.mewsScore >= 4 ? '#ef4444' : '#10b981';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = bed.mewsScore >= 4 ? '#ef4444' : '#10b981';
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const t = (x + step) % cycleLength;
          let y = midY;

          if (t > 10 && t <= 20) {
            // P wave
            y -= Math.sin(((t - 10) / 10) * Math.PI) * 7;
          } else if (t > 24 && t <= 27) {
            // Q wave
            y += 5;
          } else if (t > 27 && t <= 33) {
            // R spike
            y -= 38;
          } else if (t > 33 && t <= 37) {
            // S wave
            y += 12;
          } else if (t > 45 && t <= 62) {
            // T wave
            y -= Math.sin(((t - 45) / 17) * Math.PI) * 11;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [icuBeds]);

  const occupiedCount = icuBeds.filter(b => b.status === 'OCCUPIED').length;
  const criticalCount = icuBeds.filter(b => b.status === 'OCCUPIED' && b.mewsScore >= 4).length;
  const availableCount = icuBeds.filter(b => b.status === 'AVAILABLE').length;

  return (
    <div className="container-fluid py-3" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Central Station Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center text-white">
            <span className="badge bg-danger me-2 font-monospace px-2 py-1 fs-6">ICU-LIVE</span>
            Central Telemetry & Patient Vitals Monitoring Station
          </h3>
          <p className="text-secondary small mb-0">
            {getHospitalName()} • 24x7 Multi-Bed Realtime Telemetry Grid • Lead-II ECG Waveform Analysis
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className={`btn btn-sm fw-bold px-3 shadow-sm ${
              alarmSilenced ? 'btn-warning text-dark' : 'btn-outline-warning'
            }`}
            onClick={handleToggleSilence}
          >
            <i className={`bi ${alarmSilenced ? 'bi-bell-slash-fill' : 'bi-bell-fill'} me-1`}></i>
            {alarmSilenced ? `Alarms Muted (${silenceSeconds}s)` : 'Silence Audio Alarms'}
          </button>

          <span className="badge bg-dark border border-secondary px-3 py-2 font-monospace text-success fs-6">
            <i className="bi bi-circle-fill text-success me-1 animate-pulse" style={{ fontSize: '0.65rem' }}></i>
            TELEMETRY ACTIVE
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="row g-2 mb-3">
        <div className="col-md-3 col-6">
          <div className="p-2 rounded border border-secondary bg-dark text-center">
            <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Total ICU Beds</small>
            <div className="fw-bold fs-4 text-white font-monospace">{icuBeds.length}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-2 rounded border border-secondary bg-dark text-center">
            <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Occupied Beds</small>
            <div className="fw-bold fs-4 text-info font-monospace">{occupiedCount}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-2 rounded border border-secondary bg-dark text-center">
            <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Critical Risk (MEWS ≥ 4)</small>
            <div className={`fw-bold fs-4 font-monospace ${criticalCount > 0 ? 'text-danger' : 'text-success'}`}>
              {criticalCount}
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-2 rounded border border-secondary bg-dark text-center">
            <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Available & Sanitized</small>
            <div className="fw-bold fs-4 text-success font-monospace">{availableCount}</div>
          </div>
        </div>
      </div>

      {/* 6-Bed Multi-Monitor Grid */}
      <div className="row g-3">
        {icuBeds.map(bed => {
          const isOccupied = bed.status === 'OCCUPIED';
          const isCritical = isOccupied && bed.mewsScore >= 4;
          const v = bed.vitals || {};

          return (
            <div key={bed.id} className="col-lg-6 col-12">
              <div
                className={`card border ${
                  isCritical
                    ? 'border-danger'
                    : isOccupied
                    ? 'border-secondary'
                    : 'border-secondary-subtle'
                } shadow-sm`}
                style={{ backgroundColor: '#0c121e' }}
              >
                {/* Bed Card Header */}
                <div
                  className={`card-header py-2 d-flex justify-content-between align-items-center ${
                    isCritical
                      ? 'bg-danger text-white'
                      : isOccupied
                      ? 'bg-dark text-white border-bottom border-secondary'
                      : 'bg-black text-secondary'
                  }`}
                >
                  <div className="d-flex align-items-center gap-2">
                    <strong className="fs-6 font-monospace">{bed.bedNumber}</strong>
                    {isOccupied && (
                      <span className="badge bg-light text-dark fw-bold">
                        {bed.patient?.name} ({bed.patient?.age}y/{bed.patient?.gender?.charAt(0)})
                      </span>
                    )}
                    <span className="small text-muted font-monospace">{bed.patient?.uhid}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {isOccupied && (
                      <span
                        className={`badge ${
                          isCritical ? 'bg-white text-danger fw-bold' : 'bg-secondary'
                        }`}
                      >
                        MEWS: {bed.mewsScore} {isCritical ? 'CRITICAL' : 'STABLE'}
                      </span>
                    )}
                    <span
                      className={`badge ${
                        isOccupied ? 'bg-success' : 'bg-secondary text-light'
                      } px-2 py-1 font-monospace`}
                    >
                      {bed.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body p-2">
                  {isOccupied ? (
                    <>
                      {/* Clinical Summary Bar */}
                      <div className="d-flex justify-content-between align-items-center mb-2 px-1 small">
                        <span className="text-truncate text-secondary" style={{ maxWidth: '60%' }}>
                          <i className="bi bi-stethoscope text-primary me-1"></i>
                          {bed.diagnosis}
                        </span>
                        <span className="text-secondary text-truncate" style={{ maxWidth: '38%' }}>
                          <i className="bi bi-lungs text-info me-1"></i>
                          {bed.ventMode}
                        </span>
                      </div>

                      {/* Waveform & Vitals split */}
                      <div className="row g-2 align-items-center">
                        {/* Canvas ECG Waveform */}
                        <div className="col-7">
                          <div className="position-relative border border-secondary rounded overflow-hidden">
                            <canvas
                              ref={el => (canvasRefs.current[bed.id] = el)}
                              width={310}
                              height={110}
                              style={{ display: 'block', width: '100%', height: '110px' }}
                            />
                            <div
                              className="position-absolute top-0 start-0 p-1 text-success font-monospace"
                              style={{ fontSize: '0.65rem' }}
                            >
                              LEAD II • 25mm/s
                            </div>
                            <div
                              className="position-absolute bottom-0 end-0 p-1 font-monospace"
                              style={{ fontSize: '0.65rem', color: isCritical ? '#ef4444' : '#10b981' }}
                            >
                              HR: {v.hr} BPM
                            </div>
                          </div>
                        </div>

                        {/* Numeric Vitals Matrix */}
                        <div className="col-5">
                          <div className="row g-1 text-center font-monospace">
                            <div className="col-6">
                              <div className="p-1 rounded bg-black border border-secondary">
                                <span className="text-secondary d-block" style={{ fontSize: '0.6rem' }}>HR (BPM)</span>
                                <span
                                  className={`fs-5 fw-bold ${
                                    v.hr > 110 || v.hr < 50 ? 'text-danger' : 'text-success'
                                  }`}
                                >
                                  {v.hr}
                                </span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-1 rounded bg-black border border-secondary">
                                <span className="text-secondary d-block" style={{ fontSize: '0.6rem' }}>SpO2 (%)</span>
                                <span
                                  className={`fs-5 fw-bold ${
                                    v.spo2 < 93 ? 'text-danger' : 'text-info'
                                  }`}
                                >
                                  {v.spo2}%
                                </span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-1 rounded bg-black border border-secondary">
                                <span className="text-secondary d-block" style={{ fontSize: '0.6rem' }}>NIBP</span>
                                <span className="fs-6 fw-bold text-danger d-block text-truncate">
                                  {v.bp}
                                </span>
                                <span className="text-secondary" style={{ fontSize: '0.58rem' }}>M:{v.map}</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-1 rounded bg-black border border-secondary">
                                <span className="text-secondary d-block" style={{ fontSize: '0.6rem' }}>RR (/min)</span>
                                <span className="fs-5 fw-bold text-warning">
                                  {v.rr}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Doctor & Infusion line */}
                      <div className="d-flex justify-content-between align-items-center mt-2 px-1 small border-top border-secondary pt-2">
                        <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-person-check text-success me-1"></i>
                          {bed.doctorName}
                        </span>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            title="Activate Code Blue CPR Protocol"
                            onClick={() => handleCodeBlue(bed)}
                          >
                            <i className="bi bi-broadcast me-1"></i> Code Blue
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleOpenEditVitals(bed)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Vitals
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setActiveSlipBed(bed)}
                          >
                            <i className="bi bi-printer-fill me-1"></i> Pass
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            title="Discharge / Vacate Bed"
                            onClick={() => handleDischargeBed(bed)}
                          >
                            <i className="bi bi-box-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Available Bed Placeholder */
                    <div className="text-center py-4 text-secondary">
                      <canvas
                        ref={el => (canvasRefs.current[bed.id] = el)}
                        width={310}
                        height={60}
                        style={{ display: 'block', width: '100%', height: '60px', opacity: 0.3 }}
                      />
                      <i className="bi bi-hospital fs-3 text-secondary d-block mt-2"></i>
                      <div className="small fw-semibold text-light mt-1">Bed Sanitized & Available</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Hamilton C6 Ventilator on Standby</div>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm mt-2 px-3 fw-bold"
                        onClick={() => handleOpenAssignModal(bed)}
                      >
                        <i className="bi bi-person-plus-fill me-1"></i> Admit Patient to Bed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Vitals Modal */}
      {editBedModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ backgroundColor: '#131b2e', color: '#e2e8f0' }}>
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fs-6 fw-bold text-white">
                  <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
                  Record Telemetry & Vitals — {editBedModal.bedNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditBedModal(null)}></button>
              </div>

              <form onSubmit={handleSaveVitals}>
                <div className="modal-body p-3">
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Heart Rate (HR bpm)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        value={formHr}
                        onChange={(e) => setFormHr(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">NIBP (Systolic/Diastolic)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        placeholder="120/80"
                        value={formBp}
                        onChange={(e) => setFormBp(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Oxygen Saturation (SpO2 %)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        value={formSpo2}
                        onChange={(e) => setFormSpo2(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Respiratory Rate (RR /min)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        value={formRr}
                        onChange={(e) => setFormRr(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Body Temp (°C)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        value={formTemp}
                        onChange={(e) => setFormTemp(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">GCS Neurological Score</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary font-monospace"
                        value={formGcs}
                        onChange={(e) => setFormGcs(e.target.value)}
                      />
                    </div>
                    <div className="col-12 mt-2">
                      <label className="form-label small text-secondary">Clinical Diagnosis Note</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={formDiagnosis}
                        onChange={(e) => setFormDiagnosis(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-secondary">Ventilator / Oxygen Mode</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={formVent}
                        onChange={(e) => setFormVent(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditBedModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">Save Telemetry</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {assignPatientModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ backgroundColor: '#131b2e', color: '#e2e8f0' }}>
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fs-6 fw-bold text-white">
                  <i className="bi bi-person-plus-fill text-success me-2"></i>
                  Admit Patient to {assignPatientModal.bedNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAssignPatientModal(null)}></button>
              </div>

              <form onSubmit={handleAssignPatient}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small text-secondary">Select Registered Patient *</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName || ''} {p.lastName || ''} {p.name || ''} (Age: {p.age || 'N/A'}, Blood: {p.bloodGroup || 'O+'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary">Attending Intensivist / Doctor</label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {formatDoctorName(d.name)} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary">Primary Admission Diagnosis *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label small text-secondary">Initial Ventilator / Oxygen Support</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={newVent}
                      onChange={(e) => setNewVent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAssignPatientModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success btn-sm fw-bold px-3">Admit to ICU</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable ICU Telemetry Flowsheet */}
      {activeSlipBed && (
        <IcuTelemetrySlip
          bedData={activeSlipBed}
          onClose={() => setActiveSlipBed(null)}
        />
      )}
    </div>
  );
}
