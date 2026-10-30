import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import BedService from '../../services/BedService';
import RealtimeNotificationHub, { playEmergencyCodeRedSiren } from '../../services/RealtimeNotificationHub';
import { getHospitalName } from '../../services/hospitalConfig';
import AmbulanceDispatchSlip from './AmbulanceDispatchSlip';
import { toast } from 'react-toastify';

const INITIAL_FLEET = [
  {
    id: 'AMB-01',
    code: 'AMB-01',
    name: 'Advanced Life Support (ALS-1)',
    type: 'Advanced Life Support (ALS)',
    regNumber: 'DL-01-EQ-9102',
    status: 'AVAILABLE_AT_BASE',
    driver: 'Rajesh Kumar (+91 98112 34567)',
    paramedic: 'Kavita Singh (EMT-P)',
    baseBay: 'Bay #1 (Trauma Center Entrance)',
    equipment: ['Ventilator', 'Defibrillator', 'Dual O2 Cylinder', 'Suction Machine', 'Syringe Pump'],
    fuel: '95%'
  },
  {
    id: 'AMB-02',
    code: 'AMB-02',
    name: 'Mobile Cardiac Care Unit (MCCU)',
    type: 'Cardiac Intensive Care',
    regNumber: 'DL-01-EQ-9103',
    status: 'AVAILABLE_AT_BASE',
    driver: 'Surendra Verma (+91 98223 45678)',
    paramedic: 'Sunil Rao (Cardiac EMT)',
    baseBay: 'Bay #2 (Cardiology Emergency)',
    equipment: ['12-Lead Tele-ECG', 'Biphasic Defibrillator', 'O2 Supply', 'Emergency Cardiac Drug Kit'],
    fuel: '88%'
  },
  {
    id: 'AMB-03',
    code: 'AMB-03',
    name: 'Basic Life Support (BLS-1)',
    type: 'Basic Life Support (BLS)',
    regNumber: 'DL-01-EQ-9104',
    status: 'AVAILABLE_AT_BASE',
    driver: 'Manoj Yadav (+91 98334 56789)',
    paramedic: 'Pooja Sharma (Paramedic)',
    baseBay: 'Bay #3 (OPD Annex)',
    equipment: ['Automated External Defibrillator (AED)', 'O2 Cylinder', 'Foldable Stretcher'],
    fuel: '92%'
  },
  {
    id: 'AMB-04',
    code: 'AMB-04',
    name: 'Neonatal Critical Transport (NICU)',
    type: 'Neonatal Transport Unit',
    regNumber: 'DL-01-EQ-9105',
    status: 'AVAILABLE_AT_BASE',
    driver: 'Amit Saxena (+91 98445 67890)',
    paramedic: 'Dr. Reena Sen (Pediatric EMT)',
    baseBay: 'Bay #4 (Maternity Block)',
    equipment: ['Transport Baby Incubator', 'Infant T-Piece Resuscitator', 'Micro-Ventilator', 'Pulse Oximeter'],
    fuel: '90%'
  },
  {
    id: 'AMB-05',
    code: 'AMB-05',
    name: 'Rapid Highway Trauma Interceptor',
    type: 'Poly-Trauma Response',
    regNumber: 'DL-01-EQ-9106',
    status: 'AVAILABLE_AT_BASE',
    driver: 'Vikram Choudhary (+91 98556 78901)',
    paramedic: 'Arjun Das (Trauma Specialist)',
    baseBay: 'Bay #5 (Emergency Express)',
    equipment: ['Hydraulic Extrication Kit', 'Full Body Vacuum Splint', 'Chest Tube Kit', 'IV Infusion Heater'],
    fuel: '85%'
  }
];

const DISPATCH_STORAGE_KEY = 'hospitalsync_ambulance_dispatches_v1';
const FLEET_STORAGE_KEY = 'hospitalsync_ambulance_fleet_v1';

export default function AmbulancePanel() {
  const [fleet, setFleet] = useState(() => {
    try {
      const saved = localStorage.getItem(FLEET_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FLEET;
    } catch {
      return INITIAL_FLEET;
    }
  });

  const [dispatches, setDispatches] = useState(() => {
    try {
      const saved = localStorage.getItem(DISPATCH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [activeSlipDispatch, setActiveSlipDispatch] = useState(null);

  // Form State
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [urgency, setUrgency] = useState('CRITICAL_CODE_RED');
  const [chiefComplaint, setChiefComplaint] = useState('Acute Severe Chest Pain & Breathlessness');
  const [patientMode, setPatientMode] = useState('custom');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [customPatientAge, setCustomPatientAge] = useState('45');
  const [customPatientGender, setCustomPatientGender] = useState('Male');
  const [reservedBed, setReservedBed] = useState('');
  const [distanceKm, setDistanceKm] = useState('5.5');
  const [etaMinutes, setEtaMinutes] = useState('12');

  useEffect(() => {
    try {
      localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
    } catch (e) {
      console.error(e);
    }
  }, [fleet]);

  useEffect(() => {
    try {
      localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(dispatches));
    } catch (e) {
      console.error(e);
    }
  }, [dispatches]);

  // Load real patients & emergency beds
  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    BedService.getAllBeds()
      .then(res => {
        const bedData = res.data || [];
        setBeds(bedData);
        const availErBed = bedData.find(b => (b.ward?.toLowerCase().includes('emergency') || b.type === 'Emergency') && b.status === 'AVAILABLE');
        if (availErBed) {
          setReservedBed(`${availErBed.bedNumber} (${availErBed.ward})`);
        } else {
          setReservedBed('Trauma Bay - Bed #01');
        }
      })
      .catch(() => {
        setReservedBed('Trauma Bay - Bed #01');
      });
  }, []);

  // Set default available ambulance when modal opens
  useEffect(() => {
    if (showDispatchModal && !selectedAmbulanceId) {
      const avail = fleet.find(a => a.status === 'AVAILABLE_AT_BASE');
      if (avail) setSelectedAmbulanceId(avail.id);
    }
  }, [showDispatchModal, fleet, selectedAmbulanceId]);

  // Handle Dispatch Submission
  const handleCreateDispatch = (e) => {
    e.preventDefault();

    if (!pickupLocation || !callerPhone) {
      toast.error('Please enter pickup location and caller contact.');
      return;
    }

    const assignedAmb = fleet.find(a => a.id === selectedAmbulanceId);
    if (!assignedAmb) {
      toast.error('Please select an ambulance.');
      return;
    }

    let pName = customPatientName;
    let pAge = customPatientAge;
    let pGender = customPatientGender;
    let pUhid = `UHID-EMG-${Math.floor(1000 + Math.random() * 9000)}`;

    if (patientMode === 'registered' && selectedPatientId) {
      const p = patients.find(pat => String(pat.id) === String(selectedPatientId));
      if (p) {
        pName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
        pAge = p.age || '40';
        pGender = p.gender || 'Other';
        pUhid = p.uhid || `UHID-${p.id}`;
      }
    }

    if (!pName) {
      pName = 'Emergency Patient';
    }

    const newDispatchNumber = `EMS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newDispatch = {
      id: Date.now(),
      dispatchNumber: newDispatchNumber,
      callTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN'),
      ambulanceId: assignedAmb.id,
      ambulanceCode: assignedAmb.code,
      ambulanceType: assignedAmb.type,
      regNumber: assignedAmb.regNumber,
      driverName: assignedAmb.driver.split('(')[0].trim(),
      driverPhone: assignedAmb.driver.includes('(') ? assignedAmb.driver.split('(')[1].replace(')', '') : '+91 98765 43210',
      paramedicName: assignedAmb.paramedic,
      baseBay: assignedAmb.baseBay,
      callerName: callerName || 'Good Samaritan / Relative',
      callerPhone,
      pickupLocation,
      landmark,
      urgency,
      chiefComplaint,
      patientName: pName,
      patientAge: pAge,
      patientGender: pGender,
      patientUhid: pUhid,
      reservedBed: reservedBed || 'Trauma Bay Bed 1',
      distanceKm,
      etaMinutes,
      status: 'DISPATCHED_TO_SCENE'
    };

    // Update fleet vehicle status
    setFleet(prev => prev.map(a => a.id === assignedAmb.id ? { ...a, status: 'DISPATCHED_TO_SCENE' } : a));

    // Add dispatch record
    setDispatches(prev => [newDispatch, ...prev]);

    // Play Siren & Realtime Broadcast
    if (urgency === 'CRITICAL_CODE_RED') {
      playEmergencyCodeRedSiren();
    }

    RealtimeNotificationHub.publishNotification({
      type: 'EMERGENCY_AMBULANCE_DISPATCH',
      title: `🚨 AMBULANCE DISPATCHED: ${assignedAmb.code} (${urgency})`,
      message: `${assignedAmb.name} dispatched to ${pickupLocation}. Patient: ${pName} (${chiefComplaint}). Reserved: ${reservedBed}`,
      targetRoles: ['DOCTOR', 'NURSE', 'ADMIN'],
      ambulanceCode: assignedAmb.code
    });

    toast.success(`Ambulance ${assignedAmb.code} Dispatched Successfully!`);
    setShowDispatchModal(false);
    resetForm();
    setActiveSlipDispatch(newDispatch);
  };

  const resetForm = () => {
    setCallerName('');
    setCallerPhone('');
    setPickupLocation('');
    setLandmark('');
    setCustomPatientName('');
  };

  // Status transition handler
  const handleUpdateStatus = (dispatchId, newStatus) => {
    const targetDisp = dispatches.find(d => d.id === dispatchId);
    if (!targetDisp) return;

    setDispatches(prev => prev.map(d => {
      if (d.id === dispatchId) {
        return { ...d, status: newStatus };
      }
      return d;
    }));

    // Update fleet state accordingly
    setFleet(prev => prev.map(a => {
      if (a.id === targetDisp.ambulanceId) {
        if (newStatus === 'COMPLETED') {
          return { ...a, status: 'AVAILABLE_AT_BASE' };
        } else {
          return { ...a, status: newStatus };
        }
      }
      return a;
    }));

    if (newStatus === 'PATIENT_ON_BOARD') {
      toast.info(`🚑 Patient on board ${targetDisp.ambulanceCode}. En route to Trauma Care.`);
    } else if (newStatus === 'HOSPITAL_ARRIVAL') {
      toast.success(`🏥 ${targetDisp.ambulanceCode} has arrived at Emergency Trauma Bay.`);
    } else if (newStatus === 'COMPLETED') {
      toast.success(`Trip completed. ${targetDisp.ambulanceCode} is now available at base.`);
    }
  };

  // Quick siren test
  const triggerManualAlarm = () => {
    playEmergencyCodeRedSiren();
    toast.warning('EMERGENCY CODE RED AUDIBLE ALARM SOUNDED!');
  };

  const filteredDispatches = useMemo(() => {
    if (filterStatus === 'ALL') return dispatches;
    if (filterStatus === 'ACTIVE') return dispatches.filter(d => d.status !== 'COMPLETED');
    return dispatches.filter(d => d.status === filterStatus);
  }, [dispatches, filterStatus]);

  const activeMissionCount = fleet.filter(a => a.status !== 'AVAILABLE_AT_BASE' && a.status !== 'MAINTENANCE').length;
  const readyFleetCount = fleet.filter(a => a.status === 'AVAILABLE_AT_BASE').length;

  return (
    <div className="container-fluid py-3">
      {/* Top Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-truck-front-fill text-danger me-2 fs-2"></i>
            Ambulance Fleet & Rapid Emergency Dispatch Desk
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • 24x7 Critical Care Fleet Tracking • NABH Standard EMS Protocol
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button 
            type="button" 
            className="btn btn-outline-danger btn-sm fw-semibold shadow-sm"
            onClick={triggerManualAlarm}
          >
            <i className="bi bi-volume-up-fill me-1"></i> Sound Emergency Siren
          </button>
          <button 
            type="button" 
            className="btn btn-danger btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowDispatchModal(true)}
          >
            <i className="bi bi-telephone-plus-fill me-1"></i> Dispatch Ambulance (SOS)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Fleet Vehicles</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-primary">{fleet.length}</h3>
                <i className="bi bi-truck fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">ALS, BLS, Neonatal & Mobile ICU</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Ready at Base Station</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-success">{readyFleetCount}</h3>
                <i className="bi bi-check-circle-fill fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">Equipped & Ready for immediate launch</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-danger border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Active On Missions</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-danger">{activeMissionCount}</h3>
                <i className="bi bi-lightning-charge-fill fs-1 text-danger opacity-25"></i>
              </div>
              <small className="text-muted">Dispatched / En-route / At Trauma</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Today's Total Runs</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{dispatches.length}</h3>
                <i className="bi bi-clock-history fs-1 text-warning opacity-50"></i>
              </div>
              <small className="text-muted">Average Response Time: 8.4 mins</small>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Vehicles Status Grid */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-grid-3x3-gap-fill text-danger me-2"></i>
            Live Fleet Matrix & Equipment Status
          </h5>
          <span className="badge bg-light text-dark border">
            {readyFleetCount} of {fleet.length} Available
          </span>
        </div>
        <div className="card-body p-3">
          <div className="row g-3">
            {fleet.map(vehicle => {
              const isAvailable = vehicle.status === 'AVAILABLE_AT_BASE';
              const isDispatched = vehicle.status === 'DISPATCHED_TO_SCENE';
              const isPatientOnBoard = vehicle.status === 'PATIENT_ON_BOARD';
              const isArrival = vehicle.status === 'HOSPITAL_ARRIVAL';

              return (
                <div key={vehicle.id} className="col-lg-4 col-md-6">
                  <div className={`card h-100 border shadow-sm ${
                    !isAvailable ? 'border-danger' : 'border-success-subtle'
                  }`}>
                    <div className={`card-header py-2 d-flex justify-content-between align-items-center ${
                      !isAvailable ? 'bg-danger text-white' : 'bg-success-subtle text-dark'
                    }`}>
                      <div>
                        <strong className="fs-6 me-2">{vehicle.code}</strong>
                        <span className="small opacity-75 font-monospace">{vehicle.regNumber}</span>
                      </div>
                      <span className={`badge ${
                        isAvailable ? 'bg-success text-white' :
                        isDispatched ? 'bg-warning text-dark' :
                        isPatientOnBoard ? 'bg-white text-danger fw-bold' : 'bg-primary'
                      } px-2 py-1 small`}>
                        {vehicle.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="card-body p-3">
                      <div className="fw-bold text-dark mb-1">{vehicle.name}</div>
                      <div className="text-muted small mb-2">{vehicle.type}</div>

                      <div className="bg-light p-2 rounded small mb-2 border">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted"><i className="bi bi-geo-alt me-1"></i>Base:</span>
                          <span className="fw-semibold text-dark">{vehicle.baseBay}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted"><i className="bi bi-person me-1"></i>Pilot:</span>
                          <span className="text-dark">{vehicle.driver}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted"><i className="bi bi-heart-pulse me-1"></i>EMT:</span>
                          <span className="text-dark fw-semibold">{vehicle.paramedic}</span>
                        </div>
                      </div>

                      <div className="small mb-2">
                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>KEY EQUIPMENT ONBOARD:</span>
                        <div className="d-flex flex-wrap gap-1">
                          {vehicle.equipment.map((eq, i) => (
                            <span key={i} className="badge bg-secondary-subtle text-dark" style={{ fontSize: '0.68rem' }}>
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top small">
                        <span className="text-muted">
                          <i className="bi bi-fuel-pump me-1"></i>Fuel: <strong>{vehicle.fuel}</strong>
                        </span>
                        {isAvailable ? (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                            onClick={() => {
                              setSelectedAmbulanceId(vehicle.id);
                              setShowDispatchModal(true);
                            }}
                          >
                            <i className="bi bi-send-fill me-1"></i> Dispatch Now
                          </button>
                        ) : (
                          <span className="text-danger fw-bold animate-pulse">
                            <i className="bi bi-broadcast me-1"></i> Mission Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-clock-history text-danger me-2"></i>
            Live Emergency Dispatches & Run Records
          </h5>

          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All Runs ({dispatches.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'ACTIVE' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('ACTIVE')}
            >
              Active Missions ({dispatches.filter(d => d.status !== 'COMPLETED').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'COMPLETED' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              Completed ({dispatches.filter(d => d.status === 'COMPLETED').length})
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Trip # / Time</th>
                  <th>Ambulance</th>
                  <th>Patient Details</th>
                  <th>Pickup Location</th>
                  <th>Urgency</th>
                  <th>Reserved Bed</th>
                  <th>Status & Progress</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredDispatches.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-truck fs-1 d-block mb-2 opacity-50"></i>
                      No ambulance dispatches logged. Click "Dispatch Ambulance (SOS)" to launch a mission.
                    </td>
                  </tr>
                ) : (
                  filteredDispatches.map(item => {
                    const isCompleted = item.status === 'COMPLETED';

                    return (
                      <tr key={item.id} className={!isCompleted ? 'table-warning-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-danger font-monospace">{item.dispatchNumber}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {item.date} • {item.callTime}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{item.ambulanceCode}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.ambulanceType}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Pilot: {item.driverName}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.patientName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {item.patientAge}y / {item.patientGender} • {item.patientUhid}
                          </div>
                          <div className="text-danger fw-semibold" style={{ fontSize: '0.75rem' }}>
                            {item.chiefComplaint}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.pickupLocation}</div>
                          {item.landmark && (
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Near: {item.landmark}</div>
                          )}
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Caller: {item.callerName} ({item.callerPhone})
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.urgency === 'CRITICAL_CODE_RED' ? 'bg-danger' :
                            item.urgency === 'URGENT_CODE_YELLOW' ? 'bg-warning text-dark' : 'bg-primary'
                          }`}>
                            {item.urgency?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {item.reservedBed}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <span className={`badge ${
                              item.status === 'COMPLETED' ? 'bg-success' :
                              item.status === 'HOSPITAL_ARRIVAL' ? 'bg-primary' :
                              item.status === 'PATIENT_ON_BOARD' ? 'bg-danger' : 'bg-warning text-dark'
                            } px-2 py-1`}>
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {!isCompleted && (
                            <div className="btn-group btn-group-sm mt-1">
                              {item.status === 'DISPATCHED_TO_SCENE' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm py-0 px-1"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => handleUpdateStatus(item.id, 'PATIENT_ON_BOARD')}
                                >
                                  Patient On Board
                                </button>
                              )}
                              {item.status === 'PATIENT_ON_BOARD' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm py-0 px-1"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => handleUpdateStatus(item.id, 'HOSPITAL_ARRIVAL')}
                                >
                                  Arrived Hospital
                                </button>
                              )}
                              {item.status === 'HOSPITAL_ARRIVAL' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm py-0 px-1"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                                >
                                  Complete Trip
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm py-1 px-2"
                            title="Print Official Dispatch Pass"
                            onClick={() => setActiveSlipDispatch(item)}
                          >
                            <i className="bi bi-printer-fill me-1"></i> Pass
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Emergency Dispatch Form Modal */}
      {showDispatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-danger text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-truck-front-fill me-2"></i>
                  Launch Emergency Ambulance Dispatch (Rapid Protocol)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDispatchModal(false)}></button>
              </div>

              <form onSubmit={handleCreateDispatch}>
                <div className="modal-body p-3">
                  <div className="row g-3">
                    {/* Vehicle Selection */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-danger">Select Ambulance Unit *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedAmbulanceId}
                        onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Available Ambulance --</option>
                        {fleet.map(a => (
                          <option key={a.id} value={a.id} disabled={a.status !== 'AVAILABLE_AT_BASE'}>
                            {a.code} - {a.name} ({a.status === 'AVAILABLE_AT_BASE' ? 'Available' : 'Busy'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Urgency */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Triage Priority *</label>
                      <select
                        className="form-select form-select-sm"
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                      >
                        <option value="CRITICAL_CODE_RED">🚨 Critical (Code Red - STEMI / Trauma / Stroke)</option>
                        <option value="URGENT_CODE_YELLOW">⚠️ Urgent (Code Yellow - Acute Fracture / Severe Pain)</option>
                        <option value="ROUTINE_TRANSFER">🟢 Routine (Elective Inter-Hospital Transfer)</option>
                      </select>
                    </div>

                    {/* Caller Info */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Caller Contact Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="+91 98765 43210"
                        value={callerPhone}
                        onChange={(e) => setCallerPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Caller Name / Relation</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Traffic Police / Relative / Bystander"
                        value={callerName}
                        onChange={(e) => setCallerName(e.target.value)}
                      />
                    </div>

                    {/* Pickup Address */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Pickup Address / GPS Location *</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Complete street address, sector, or landmark where patient is situated..."
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Nearest Landmark</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Near Metro Pillar #42"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Estimated Distance (km)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Estimated ETA (minutes)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={etaMinutes}
                        onChange={(e) => setEtaMinutes(e.target.value)}
                      />
                    </div>

                    {/* Patient Information */}
                    <div className="col-12">
                      <div className="border-top pt-2">
                        <label className="form-label small fw-semibold mb-2">Patient Details</label>
                        <div className="d-flex gap-3 mb-2">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="customPat"
                              checked={patientMode === 'custom'}
                              onChange={() => setPatientMode('custom')}
                            />
                            <label className="form-check-label small" htmlFor="customPat">Direct Emergency Intake</label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="regPat"
                              checked={patientMode === 'registered'}
                              onChange={() => setPatientMode('registered')}
                            />
                            <label className="form-check-label small" htmlFor="regPat">Existing Registered Patient</label>
                          </div>
                        </div>

                        {patientMode === 'registered' ? (
                          <div className="mb-2">
                            <select
                              className="form-select form-select-sm"
                              value={selectedPatientId}
                              onChange={(e) => setSelectedPatientId(e.target.value)}
                            >
                              <option value="">-- Select Patient from Registry --</option>
                              {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.firstName} {p.lastName} (Age: {p.age || 'N/A'}, UHID: {p.uhid || p.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="row g-2 mb-2">
                            <div className="col-md-6">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Patient Full Name / Identity"
                                value={customPatientName}
                                onChange={(e) => setCustomPatientName(e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Age"
                                value={customPatientAge}
                                onChange={(e) => setCustomPatientAge(e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <select
                                className="form-select form-select-sm"
                                value={customPatientGender}
                                onChange={(e) => setCustomPatientGender(e.target.value)}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Chief Medical Complaint / Mechanism *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Severe chest pain, Dyspnea, Poly-trauma RTA, Stroke with left weakness"
                            value={chiefComplaint}
                            onChange={(e) => setChiefComplaint(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="form-label small fw-semibold">Reserve Hospital Receiving Bed</label>
                          <select
                            className="form-select form-select-sm"
                            value={reservedBed}
                            onChange={(e) => setReservedBed(e.target.value)}
                          >
                            <option value="Trauma Bay - Bed 01">Trauma Bay - Bed 01 (Resuscitation)</option>
                            <option value="Trauma Bay - Bed 02">Trauma Bay - Bed 02 (Critical Care)</option>
                            <option value="ICU Bay - Bed 01">ICU Bay - Bed 01 (Ventilator)</option>
                            {beds.filter(b => b.status === 'AVAILABLE').map(b => (
                              <option key={b.id} value={`${b.bedNumber} (${b.ward})`}>
                                {b.bedNumber} - {b.ward} ({b.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowDispatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm fw-bold px-3">
                    <i className="bi bi-send-check-fill me-1"></i> Confirm & Dispatch Ambulance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Dispatch Gatepass Modal */}
      {activeSlipDispatch && (
        <AmbulanceDispatchSlip
          dispatch={activeSlipDispatch}
          onClose={() => setActiveSlipDispatch(null)}
        />
      )}
    </div>
  );
}
