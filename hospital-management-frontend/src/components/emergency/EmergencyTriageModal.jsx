import React, { useState, useMemo } from 'react';
import BedService from '../../services/BedService';
import RealtimeNotificationHub, { playEmergencyCodeRedSiren } from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';

const MECHANISM_PRESETS = [
  { label: '💥 Road Traffic Accident / Poly-Trauma', mechanism: 'Road traffic collision with suspected blunt thoracic/abdominal injury and extremity fractures', defaultEsi: 'ESI-1', bp: '85/55', pulse: '128', spo2: '92%' },
  { label: '💔 Acute Chest Pain / Suspected STEMI', mechanism: 'Crushing retrosternal chest pain radiating to left arm, diaphoresis, dyspnea', defaultEsi: 'ESI-1', bp: '158/98', pulse: '108', spo2: '95%' },
  { label: '🧠 Acute Stroke / Hemiparesis', mechanism: 'Sudden onset facial droop, right-sided hemiplegia, aphasia (onset < 2 hrs)', defaultEsi: 'ESI-2', bp: '172/104', pulse: '88', spo2: '97%' },
  { label: '🫁 Acute Respiratory Arrest / Stridor', mechanism: 'Severe acute bronchospasm, cyanosis, audible stridor, unable to speak full words', defaultEsi: 'ESI-1', bp: '130/85', pulse: '134', spo2: '86%' },
  { label: '🩸 Active External Hemorrhage', mechanism: 'Penetrating laceration with arterial bleeding, marked pallor, signs of hypovolemic shock', defaultEsi: 'ESI-1', bp: '80/50', pulse: '140', spo2: '93%' }
];

function EmergencyTriageModal({ show, onClose, beds = [], doctors = [], onTriageComplete }) {
  if (!show) return null;

  // Filter available emergency beds or ICU beds first
  const availableBeds = useMemo(() => {
    const avail = beds.filter(b => b.status === 'AVAILABLE');
    if (avail.length > 0) return avail;
    return [
      { id: 991, bedNumber: 'EM-01', ward: 'Emergency Trauma Ward', type: 'Emergency' },
      { id: 992, bedNumber: 'EM-02', ward: 'Emergency Trauma Ward', type: 'Emergency' },
      { id: 993, bedNumber: 'ICU-01', ward: 'Intensive Care Unit (ICU)', type: 'ICU' }
    ];
  }, [beds]);

  const defaultBed = availableBeds.find(b => b.ward?.toLowerCase().includes('emergency') || b.type === 'Emergency') || availableBeds[0];
  const defaultDoctor = doctors[0] || { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Emergency & Critical Care' };

  const [patientName, setPatientName] = useState(`Trauma Case #${Math.floor(1000 + Math.random() * 9000)}`);
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Male');
  const [esiLevel, setEsiLevel] = useState('ESI-1');
  const [selectedBedId, setSelectedBedId] = useState(defaultBed?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctor?.id || '');
  const [mechanism, setMechanism] = useState(MECHANISM_PRESETS[0].mechanism);
  const [bp, setBp] = useState('85/55');
  const [pulse, setPulse] = useState('128');
  const [spo2, setSpo2] = useState('91%');
  const [gcs, setGcs] = useState('11/15');
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setMechanism(preset.mechanism);
    setEsiLevel(preset.defaultEsi);
    setBp(preset.bp);
    setPulse(preset.pulse);
    setSpo2(preset.spo2);
  };

  const handleActivateCodeRed = async (e) => {
    e.preventDefault();
    setLoading(true);

    const targetBed = availableBeds.find(b => String(b.id) === String(selectedBedId)) || defaultBed;
    const targetDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId)) || defaultDoctor;
    const timestampStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    try {
      // 1. Play urgent Code Red sound alert
      playEmergencyCodeRedSiren();

      // 2. Mark Bed as OCCUPIED in backend
      if (targetBed?.id) {
        try {
          await BedService.updateBedStatus(targetBed.id, 'OCCUPIED');
        } catch (err) {
          console.debug('Bed status update note:', err);
        }
      }

      // 3. Publish system-wide Code Red live alert
      RealtimeNotificationHub.publishNotification({
        type: 'EMERGENCY_CODE_RED',
        title: `🚨 CODE RED: Rapid Trauma Intake (${esiLevel})`,
        message: `${patientName} (${age}y/${gender}) immediately transferred to ${targetBed?.bedNumber || 'ER Bay'} (${targetBed?.ward || 'Emergency'}). Attending: ${targetDoctor?.name || 'Dr. On-Duty ER'}. Chief: ${mechanism}`,
        targetRoles: ['DOCTOR', 'NURSE', 'ADMIN'],
        patientName,
        doctorName: targetDoctor?.name,
        meta: {
          triageLevel: esiLevel,
          bedNumber: targetBed?.bedNumber,
          vitals: { bp, pulse, spo2, gcs },
          time: timestampStr
        }
      });

      // 4. Toast notification
      toast.error(
        <div>
          <div className="fw-bold">🚨 CODE RED ACTIVATED!</div>
          <div className="small">Patient transferred to Bed {targetBed?.bedNumber}. ER resuscitation team notified!</div>
        </div>,
        { autoClose: 7000 }
      );

      if (onTriageComplete) {
        onTriageComplete({
          patientName,
          age,
          gender,
          esiLevel,
          bed: targetBed,
          doctor: targetDoctor,
          mechanism,
          vitals: { bp, pulse, spo2, gcs }
        });
      }

      onClose();
    } catch (err) {
      toast.error('Failed to trigger emergency intake.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 1070 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-2xl border border-danger border-2 rounded-4 overflow-hidden">
          {/* URGENT CODE RED HEADER */}
          <div className="modal-header bg-danger text-white py-3 px-4 position-relative">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-white text-danger d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 animate-pulse"
                style={{ width: 44, height: 44, fontSize: 24 }}
              >
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-black mb-0 text-uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                    🚨 Emergency Trauma Quick Triage (Code Red)
                  </h5>
                  <span className="badge bg-white text-danger fw-bold">10-SEC RAPID INTAKE</span>
                </div>
                <p className="mb-0 text-white-50 small" style={{ fontSize: '11px' }}>
                  Bypass standard paperwork &bull; Instant trauma intake, emergency bed reservation & ER pager alert
                </p>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleActivateCodeRed}>
            <div className="modal-body p-4" style={{ maxHeight: '74vh', overflowY: 'auto' }}>
              {/* MECHANISM PRESET QUICK BUTTONS */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: 10.5 }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Trauma Presets:
                </label>
                <div className="d-flex flex-wrap gap-1">
                  {MECHANISM_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-1 px-2 fw-semibold text-start"
                      style={{ fontSize: '11px', borderRadius: 8 }}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROW 1: TRIAGE SEVERITY & PATIENT DETAILS */}
              <div className="row g-3">
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-bold text-dark">Emergency Severity Index (ESI) *</label>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { key: 'ESI-1', label: '🔴 ESI-1: Resuscitation', desc: 'Immediate life-threat (Arrest, apnea, severe shock)', bg: 'border-danger bg-danger-subtle text-danger' },
                      { key: 'ESI-2', label: '🟠 ESI-2: Emergent', desc: 'High risk, unstable vitals, severe acute pain', bg: 'border-warning bg-warning-subtle text-warning-emphasis' },
                      { key: 'ESI-3', label: '🟡 ESI-3: Urgent', desc: 'Stable vitals, multiple ER investigations needed', bg: 'border-info bg-info-subtle text-info-emphasis' }
                    ].map(lvl => (
                      <div
                        key={lvl.key}
                        className={`p-2 rounded-3 border cursor-pointer d-flex align-items-center justify-content-between ${
                          esiLevel === lvl.key ? `${lvl.bg} fw-bold shadow-xs border-2` : 'bg-light text-secondary'
                        }`}
                        onClick={() => setEsiLevel(lvl.key)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontSize: 12 }}>{lvl.label}</div>
                          <div style={{ fontSize: 10 }} className="text-muted">{lvl.desc}</div>
                        </div>
                        <input
                          type="radio"
                          name="esi"
                          checked={esiLevel === lvl.key}
                          onChange={() => setEsiLevel(lvl.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12 col-md-7">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label small fw-bold">Patient Name / Identifier *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm fw-bold border-danger"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Unknown Male Trauma #101"
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">Estimated Age</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">Gender</label>
                      <select
                        className="form-select form-select-sm"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Unknown</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-danger">Assign Emergency Bed *</label>
                      <select
                        className="form-select form-select-sm fw-bold border-danger"
                        value={selectedBedId}
                        onChange={(e) => setSelectedBedId(e.target.value)}
                        required
                      >
                        {availableBeds.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bedNumber} - {b.ward} ({b.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">On-Duty ER Specialist</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'ER Consultant'})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* MECHANISM OF INJURY */}
                <div className="col-12">
                  <label className="form-label small fw-bold">Clinical Presentation / Mechanism of Injury *</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    required
                    value={mechanism}
                    onChange={(e) => setMechanism(e.target.value)}
                    placeholder="Describe emergency presentation, loss of consciousness, bleeding, accident context..."
                  ></textarea>
                </div>

                {/* RAPID VITALS BAR */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="form-label small fw-bold text-dark d-block mb-2 text-uppercase" style={{ fontSize: 11 }}>
                      <i className="bi bi-activity text-danger me-1"></i> Rapid ER Triage Vitals:
                    </label>
                    <div className="row g-2">
                      <div className="col-3">
                        <small className="text-muted fw-bold d-block" style={{ fontSize: 10 }}>BP (mmHg)</small>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center fw-bold"
                          value={bp}
                          onChange={(e) => setBp(e.target.value)}
                        />
                      </div>
                      <div className="col-3">
                        <small className="text-muted fw-bold d-block" style={{ fontSize: 10 }}>Pulse (bpm)</small>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center fw-bold"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                        />
                      </div>
                      <div className="col-3">
                        <small className="text-muted fw-bold d-block" style={{ fontSize: 10 }}>SpO2 (%)</small>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center fw-bold"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                        />
                      </div>
                      <div className="col-3">
                        <small className="text-muted fw-bold d-block" style={{ fontSize: 10 }}>GCS Score</small>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center fw-bold"
                          value={gcs}
                          onChange={(e) => setGcs(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between align-items-center">
              <span className="text-muted small" style={{ fontSize: 11 }}>
                <i className="bi bi-volume-up-fill text-danger me-1"></i>
                Will broadcast alert sound & notify on-duty ER team
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger btn-sm px-4 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Activating ER...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-broadcast-pin"></i>
                      ACTIVATE CODE RED & ADMIT TO BED
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmergencyTriageModal;
