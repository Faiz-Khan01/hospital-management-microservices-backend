import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import DoctorService from '../../services/DoctorService';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import MortuaryHandoverSlip from './MortuaryHandoverSlip';
import { toast } from 'react-toastify';

const INITIAL_MORGUE_BAYS = [
  { id: 'BAY-01', name: 'Cold Chamber Bay 01', temp: '2.4 °C', status: 'OCCUPIED', deceasedName: 'Shyam Lal (UHID-8810)' },
  { id: 'BAY-02', name: 'Cold Chamber Bay 02', temp: '2.6 °C', status: 'AVAILABLE', deceasedName: null },
  { id: 'BAY-03', name: 'Cold Chamber Bay 03', temp: '2.2 °C', status: 'OCCUPIED', deceasedName: 'Devi Prasad (UHID-8812)' },
  { id: 'BAY-04', name: 'Cold Chamber Bay 04', temp: '2.5 °C', status: 'AVAILABLE', deceasedName: null },
  { id: 'BAY-05', name: 'Cold Chamber Bay 05 (MLC Vault)', temp: '1.8 °C', status: 'OCCUPIED', deceasedName: 'Unknown Male RTA (MLC-901)' },
  { id: 'BAY-06', name: 'Cold Chamber Bay 06 (Forensic)', temp: '2.1 °C', status: 'AVAILABLE', deceasedName: null }
];

const INITIAL_DEATH_RECORDS = [
  {
    id: 1,
    deathRegNumber: 'DTH-2026-081',
    patientName: 'Shyam Lal',
    patientUhid: 'UHID-8810',
    patientAge: 71,
    patientGender: 'Male',
    patientAadhaar: 'XXXX-XXXX-9912',
    wardName: 'Intensive Care Unit (Bed ICU-04)',
    attendingDoctor: 'Dr. Sarah Jenkins',
    dateOfDeath: '2026-10-29',
    timeOfDeath: '11:45 PM',
    freezerBay: 'Cold Chamber Bay 01',
    bayTemp: '2.4 °C',
    isMlc: false,
    mlcNumber: '',
    immediateCause: 'Acute Cardiogenic Shock & Ventricular Fibrillation',
    underlyingCause: 'Severe Ischemic Cardiomyopathy',
    otherConditions: 'Hypertension & Chronic Kidney Disease',
    claimantName: 'Ramesh Lal',
    claimantRelation: 'Son',
    claimantIdType: 'Aadhaar Card',
    claimantIdNumber: 'XXXX-XXXX-4512',
    claimantPhone: '+91 98112 34567',
    claimantAddress: 'Civil Lines, New Delhi',
    status: 'RELEASE_CLEARED'
  },
  {
    id: 2,
    deathRegNumber: 'DTH-2026-082',
    patientName: 'Unknown Male (Trauma Poly-injury)',
    patientUhid: 'UHID-EMG-9021',
    patientAge: 32,
    patientGender: 'Male',
    patientAadhaar: 'Unidentified at Admission',
    wardName: 'Emergency Trauma Care Center',
    attendingDoctor: 'Dr. Ananya Sen',
    dateOfDeath: '2026-10-30',
    timeOfDeath: '02:15 AM',
    freezerBay: 'Cold Chamber Bay 05 (MLC Vault)',
    bayTemp: '1.8 °C',
    isMlc: true,
    mlcNumber: 'FIR #402/2026 PS-Kashmere Gate',
    immediateCause: 'Severe Traumatic Brain Injury & Transtentorial Herniation',
    underlyingCause: 'Road Traffic Collision with Multi-organ Crush Injury',
    otherConditions: 'Bilateral Hemothorax & Pelvic Fracture',
    claimantName: 'ASI Vikram Singh (Investigating Officer)',
    claimantRelation: 'Delhi Police IO',
    claimantIdType: 'Police Service Badge ID',
    claimantIdNumber: 'DP-PSI-88219',
    claimantPhone: '+91 98711 00223',
    claimantAddress: 'Police Station Kashmere Gate, Delhi',
    status: 'AUTOPSY_PENDING'
  }
];

const MORTUARY_BAYS_KEY = 'hospitalsync_morgue_bays_v1';
const MORTUARY_RECORDS_KEY = 'hospitalsync_morgue_records_v1';

export default function MortuaryPanel() {
  const [bays, setBays] = useState(() => {
    try {
      const saved = localStorage.getItem(MORTUARY_BAYS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MORGUE_BAYS;
    } catch {
      return INITIAL_MORGUE_BAYS;
    }
  });

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(MORTUARY_RECORDS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DEATH_RECORDS;
    } catch {
      return INITIAL_DEATH_RECORDS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [releaseModalRecord, setReleaseModalRecord] = useState(null);
  const [activeSlipRecord, setActiveSlipRecord] = useState(null);

  // Form State for Death Registration
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [deceasedNameCustom, setDeceasedNameCustom] = useState('');
  const [patientMode, setPatientMode] = useState('registered');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().split('T')[0]);
  const [timeOfDeath, setTimeOfDeath] = useState('06:30 AM');
  const [wardName, setWardName] = useState('Intensive Care Unit (ICU)');
  const [selectedBayId, setSelectedBayId] = useState('BAY-02');
  const [isMlc, setIsMlc] = useState(false);
  const [mlcNumber, setMlcNumber] = useState('');
  const [immediateCause, setImmediateCause] = useState('Acute Cardio-Respiratory Arrest');
  const [underlyingCause, setUnderlyingCause] = useState('Multi-Organ Failure Secondary to Severe Sepsis');

  // Form State for Handover Release
  const [relClaimantName, setRelClaimantName] = useState('');
  const [relRelation, setRelRelation] = useState('Son');
  const [relIdType, setRelIdType] = useState('Aadhaar Card');
  const [relIdNumber, setRelIdNumber] = useState('');
  const [relPhone, setRelPhone] = useState('');
  const [relAddress, setRelAddress] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(MORTUARY_BAYS_KEY, JSON.stringify(bays));
    } catch (e) {
      console.error(e);
    }
  }, [bays]);

  useEffect(() => {
    try {
      localStorage.setItem(MORTUARY_RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    DoctorService.getAllDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  const handleRegisterDeath = (e) => {
    e.preventDefault();

    let pName = deceasedNameCustom;
    let pUhid = `UHID-MORG-${Math.floor(1000 + Math.random() * 9000)}`;
    let pAge = 55;
    let pGender = 'Male';

    if (patientMode === 'registered' && selectedPatientId) {
      const p = patients.find(pat => String(pat.id) === String(selectedPatientId));
      if (p) {
        pName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name;
        pUhid = p.uhid || `UHID-${p.id}`;
        pAge = p.age || 55;
        pGender = p.gender || 'Male';
      }
    }

    if (!pName) {
      toast.error('Please enter deceased patient name.');
      return;
    }

    const docObj = doctors.find(d => String(d.id) === String(selectedDoctorId));
    const targetBay = bays.find(b => b.id === selectedBayId) || bays[1];

    const newRecord = {
      id: Date.now(),
      deathRegNumber: `DTH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      patientName: pName,
      patientUhid: pUhid,
      patientAge: pAge,
      patientGender: pGender,
      wardName,
      attendingDoctor: docObj?.name ? formatDoctorName(docObj.name) : 'Dr. Sarah Jenkins',
      dateOfDeath,
      timeOfDeath,
      freezerBay: targetBay.name,
      bayTemp: targetBay.temp,
      isMlc,
      mlcNumber: isMlc ? (mlcNumber || 'POLICE-FIR-AUTO') : '',
      immediateCause,
      underlyingCause,
      otherConditions: 'Verified clinically by on-duty physician',
      claimantName: 'Pending Identification / Next-of-Kin Claim',
      claimantRelation: 'Relative',
      claimantIdType: 'Aadhaar',
      claimantIdNumber: '',
      claimantPhone: '',
      claimantAddress: '',
      status: isMlc ? 'AUTOPSY_PENDING' : 'IN_COLD_CHAMBER'
    };

    // Update Bay status
    setBays(prev => prev.map(b => b.id === targetBay.id ? { ...b, status: 'OCCUPIED', deceasedName: `${pName} (${pUhid})` } : b));
    setRecords(prev => [newRecord, ...prev]);

    toast.warning(`Institutional Death Registered: #${newRecord.deathRegNumber} moved to ${targetBay.name}`);
    setShowRegisterModal(false);
    setActiveSlipRecord(newRecord);
  };

  const handleOpenReleaseModal = (record) => {
    setReleaseModalRecord(record);
    setRelClaimantName('');
    setRelRelation('Son');
    setRelIdType('Aadhaar Card');
    setRelIdNumber('');
    setRelPhone('');
    setRelAddress('');
  };

  const handleConfirmRelease = (e) => {
    e.preventDefault();
    if (!releaseModalRecord || !relClaimantName || !relIdNumber) {
      toast.error('Please fill verified next-of-kin details and government photo ID.');
      return;
    }

    setRecords(prev => prev.map(r => {
      if (r.id === releaseModalRecord.id) {
        return {
          ...r,
          claimantName: relClaimantName,
          claimantRelation: relRelation,
          claimantIdType: relIdType,
          claimantIdNumber: relIdNumber,
          claimantPhone: relPhone,
          claimantAddress: relAddress,
          status: 'HANDED_OVER_TO_FAMILY'
        };
      }
      return r;
    }));

    // Free up cold bay
    setBays(prev => prev.map(b => b.name === releaseModalRecord.freezerBay ? { ...b, status: 'AVAILABLE', deceasedName: null } : b));

    toast.success(`Body handed over to ${relClaimantName} (${relRelation}). Release gatepass generated.`);
    const updated = {
      ...releaseModalRecord,
      claimantName: relClaimantName,
      claimantRelation: relRelation,
      claimantIdType: relIdType,
      claimantIdNumber: relIdNumber,
      claimantPhone: relPhone,
      claimantAddress: relAddress,
      status: 'HANDED_OVER_TO_FAMILY'
    };
    setReleaseModalRecord(null);
    setActiveSlipRecord(updated);
  };

  const occupiedBaysCount = bays.filter(b => b.status === 'OCCUPIED').length;
  const availableBaysCount = bays.filter(b => b.status === 'AVAILABLE').length;

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-file-earmark-medical-fill text-danger me-2 fs-2"></i>
            Hospital Mortuary & Institutional Death Registry Desk
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • Forensic Cold Chambers • Form 4/4A Medico-Legal Death Certification
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-dark btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowRegisterModal(true)}
          >
            <i className="bi bi-person-x-fill me-1"></i> Register Institutional Death
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-dark border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Morgue Freezer Bays</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{bays.length}</h3>
                <i className="bi bi-snow fs-1 text-dark opacity-25"></i>
              </div>
              <small className="text-muted">Temperature monitored: 2.0°C ± 0.5°C</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-danger border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Chambers Occupied</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-danger">{occupiedBaysCount}</h3>
                <i className="bi bi-box2-fill fs-1 text-danger opacity-25"></i>
              </div>
              <small className="text-muted">Awaiting autopsy / family claim</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Chambers Available</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-success">{availableBaysCount}</h3>
                <i className="bi bi-check-circle-fill fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">Sanitized & temperature ready</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Death Records</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-primary">{records.length}</h3>
                <i className="bi bi-card-checklist fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">Form 4/4A issued & archived</small>
            </div>
          </div>
        </div>
      </div>

      {/* Cold Chamber Matrix */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-snow2 text-primary me-2"></i>
            Live Mortuary Cold Chamber Matrix & Temperature Monitoring
          </h5>
          <span className="badge bg-light text-dark border">
            {occupiedBaysCount} of {bays.length} Occupied
          </span>
        </div>

        <div className="card-body p-3">
          <div className="row g-3">
            {bays.map(bay => {
              const isOccupied = bay.status === 'OCCUPIED';

              return (
                <div key={bay.id} className="col-md-4 col-sm-6">
                  <div className={`card h-100 border ${isOccupied ? 'border-danger' : 'border-success-subtle'}`}>
                    <div className={`card-header py-2 d-flex justify-content-between align-items-center ${
                      isOccupied ? 'bg-danger text-white' : 'bg-success-subtle text-dark'
                    }`}>
                      <strong className="small">{bay.name}</strong>
                      <span className={`badge ${isOccupied ? 'bg-white text-danger fw-bold' : 'bg-success text-white'}`}>
                        {bay.status}
                      </span>
                    </div>

                    <div className="card-body p-2 small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Chamber Temperature:</span>
                        <strong className="font-monospace text-primary">{bay.temp}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Deceased Identity:</span>
                        <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '160px' }}>
                          {bay.deceasedName || 'Empty Chamber'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Death Registry Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-journal-text text-danger me-2"></i>
            Institutional Death Certificates & Body Handover Gatepass Registry
          </h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Death Reg # / Time</th>
                  <th>Deceased Patient</th>
                  <th>Location / Attending Doctor</th>
                  <th>Cause of Death</th>
                  <th>Freezer Bay</th>
                  <th>MLC Status</th>
                  <th>Handover Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {records.map(item => {
                  const isHandedOver = item.status === 'HANDED_OVER_TO_FAMILY';

                  return (
                    <tr key={item.id} className={!isHandedOver ? 'table-warning-subtle' : ''}>
                      <td className="ps-3">
                        <strong className="text-danger font-monospace">{item.deathRegNumber}</strong>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {item.dateOfDeath} • {item.timeOfDeath}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.patientName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.patientAge}y / {item.patientGender} • {item.patientUhid}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.wardName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.attendingDoctor}</div>
                      </td>
                      <td>
                        <div className="text-truncate text-dark fw-semibold" style={{ maxWidth: '220px' }}>
                          {item.immediateCause}
                        </div>
                        <div className="text-muted text-truncate" style={{ maxWidth: '220px', fontSize: '0.72rem' }}>
                          {item.underlyingCause}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.freezerBay}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.isMlc ? 'bg-danger' : 'bg-secondary'}`}>
                          {item.isMlc ? 'MLC CASE' : 'NON-MLC'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          isHandedOver ? 'bg-success' :
                          item.status === 'AUTOPSY_PENDING' ? 'bg-danger' : 'bg-warning text-dark'
                        } px-2 py-1`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>

                        {!isHandedOver && (
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm py-0 px-2 d-block mt-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleOpenReleaseModal(item)}
                          >
                            <i className="bi bi-box-arrow-right me-1"></i> Handover Body
                          </button>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm py-1 px-2"
                          title="Print Form 4/4A Institutional Death Summary & Gatepass"
                          onClick={() => setActiveSlipRecord(item)}
                        >
                          <i className="bi bi-printer-fill me-1"></i> Pass
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Register Institutional Death Modal */}
      {showRegisterModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-dark text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-file-earmark-medical me-2 text-danger"></i>
                  Register Institutional Death (Form 4/4A Certification)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRegisterModal(false)}></button>
              </div>

              <form onSubmit={handleRegisterDeath}>
                <div className="modal-body p-3">
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="d-flex gap-3 mb-1">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="regPatientDeath"
                            checked={patientMode === 'registered'}
                            onChange={() => setPatientMode('registered')}
                          />
                          <label className="form-check-label small" htmlFor="regPatientDeath">Admitted Inpatient</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="customPatientDeath"
                            checked={patientMode === 'custom'}
                            onChange={() => setPatientMode('custom')}
                          />
                          <label className="form-check-label small" htmlFor="customPatientDeath">Unregistered / Trauma Emergency Fatality</label>
                        </div>
                      </div>

                      {patientMode === 'registered' ? (
                        <select
                          className="form-select form-select-sm"
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.firstName || ''} {p.lastName || ''} {p.name || ''} (UHID: {p.uhid || p.id}, Age: {p.age || 'N/A'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Deceased Full Name / Unidentified Male/Female"
                          value={deceasedNameCustom}
                          onChange={(e) => setDeceasedNameCustom(e.target.value)}
                          required
                        />
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Attending Physician Declaring Death *</label>
                      <select
                        className="form-select form-select-sm"
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

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Date of Death *</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dateOfDeath}
                        onChange={(e) => setDateOfDeath(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Time of Death *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 11:45 PM"
                        value={timeOfDeath}
                        onChange={(e) => setTimeOfDeath(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Admitted Ward</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={wardName}
                        onChange={(e) => setWardName(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assign Cold Chamber Bay *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedBayId}
                        onChange={(e) => setSelectedBayId(e.target.value)}
                      >
                        {bays.map(b => (
                          <option key={b.id} value={b.id} disabled={b.status === 'OCCUPIED'}>
                            {b.name} ({b.temp}) - {b.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 mt-2">
                      <label className="form-label small fw-semibold">Immediate Cause of Death (Part I-a) *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={immediateCause}
                        onChange={(e) => setImmediateCause(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Underlying Antecedent Cause (Part I-b)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={underlyingCause}
                        onChange={(e) => setUnderlyingCause(e.target.value)}
                      />
                    </div>

                    <div className="col-12 mt-2 pt-2 border-top">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="mlcCheck"
                          checked={isMlc}
                          onChange={(e) => setIsMlc(e.target.checked)}
                        />
                        <label className="form-check-label small fw-bold text-danger" htmlFor="mlcCheck">
                          Mark as Medico-Legal Case (MLC) / Forensic Post-Mortem Required
                        </label>
                      </div>

                      {isMlc && (
                        <div className="mt-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Police Station FIR / Case Diary Number"
                            value={mlcNumber}
                            onChange={(e) => setMlcNumber(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark btn-sm fw-bold px-3">
                    <i className="bi bi-file-earmark-check-fill me-1"></i> Register Death & Issue Certificate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Release Body to Family Modal */}
      {releaseModalRecord && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-success text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Handover Deceased Body to Verified Next-of-Kin
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setReleaseModalRecord(null)}></button>
              </div>

              <form onSubmit={handleConfirmRelease}>
                <div className="modal-body p-3">
                  <div className="p-2 bg-light rounded border mb-3 small">
                    <strong>Deceased:</strong> {releaseModalRecord.patientName} (#{releaseModalRecord.deathRegNumber})
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Next-of-Kin / Claimant Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Full Name of Relative / Claimant"
                      value={relClaimantName}
                      onChange={(e) => setRelClaimantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Relationship with Deceased</label>
                      <select
                        className="form-select form-select-sm"
                        value={relRelation}
                        onChange={(e) => setRelRelation(e.target.value)}
                      >
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Spouse / Husband / Wife">Spouse / Husband / Wife</option>
                        <option value="Brother / Sister">Brother / Sister</option>
                        <option value="Parent (Father / Mother)">Parent (Father / Mother)</option>
                        <option value="Police Investigating Officer">Police Investigating Officer (MLC)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Government ID Proof *</label>
                      <select
                        className="form-select form-select-sm"
                        value={relIdType}
                        onChange={(e) => setRelIdType(e.target.value)}
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Voter ID Card">Voter ID Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Police Service Badge">Police Service Badge</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">ID Document Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. XXXX-XXXX-9021"
                        value={relIdNumber}
                        onChange={(e) => setRelIdNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="+91 98765 43210"
                        value={relPhone}
                        onChange={(e) => setRelPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold">Residential Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Permanent Residence Street / City"
                      value={relAddress}
                      onChange={(e) => setRelAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setReleaseModalRecord(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm fw-bold px-3">
                    <i className="bi bi-check-circle-fill me-1"></i> Release Body & Vacate Freezer Bay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Death Summary & Gatepass */}
      {activeSlipRecord && (
        <MortuaryHandoverSlip
          record={activeSlipRecord}
          onClose={() => setActiveSlipRecord(null)}
        />
      )}
    </div>
  );
}
