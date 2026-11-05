import React, { useState, useEffect, useMemo } from 'react';
import { getHospitalName } from '../../services/hospitalConfig';
import CssdSterilitySlip from './CssdSterilitySlip';
import { toast } from 'react-toastify';
import '../../styles/clinicalDesksPremium.css';

const INITIAL_MACHINES = [
  {
    id: 1,
    name: 'Steam Autoclave Unit 01 (Getinge GSS67H)',
    type: 'Porous High-Pressure Steam Autoclave',
    chamberCapacity: '480 Litres (8 STU)',
    currentTemp: '134.2 °C',
    currentPressure: '30.4 PSI',
    status: 'CYCLE_IN_PROGRESS',
    currentBatch: 'BATCH-2026-901',
    progress: 75
  },
  {
    id: 2,
    name: 'Steam Autoclave Unit 02 (Tuttnauer 5596)',
    type: 'Double-Door High Vacuum Autoclave',
    chamberCapacity: '350 Litres (6 STU)',
    currentTemp: '32.0 °C (Standby)',
    currentPressure: '0.0 PSI',
    status: 'READY_FOR_LOAD',
    currentBatch: null,
    progress: 0
  },
  {
    id: 3,
    name: 'Low-Temp H2O2 Gas Plasma (Sterrad 100NX)',
    type: 'Hydrogen Peroxide Vapor Sterilizer',
    chamberCapacity: '150 Litres (Optics/Endoscopes)',
    currentTemp: '48.0 °C',
    currentPressure: 'Low Vacuum Plasma',
    status: 'READY_FOR_LOAD',
    currentBatch: null,
    progress: 0
  }
];

const INITIAL_TRAYS = [
  {
    id: 1,
    trayCode: 'TRAY-ML-04',
    trayName: 'Major Laparotomy Surgical Instrument Set',
    department: 'Operation Theatre (OT Suite 1)',
    instrumentCount: 48,
    batchNumber: 'BATCH-2026-895',
    cycleType: 'Steam 134°C (18 Mins)',
    sterilizedDate: '2026-10-28',
    expiryDate: '2026-11-27',
    indicatorResult: 'CLASS-5 PASS (ACCEPT)',
    location: 'OT Suite 1 - Sterile Store',
    status: 'STERILE_VALID'
  },
  {
    id: 2,
    trayCode: 'TRAY-OT-02',
    trayName: 'Orthopedic Major Joint & Trauma Drill Plate Set',
    department: 'Operation Theatre (OT Suite 2)',
    instrumentCount: 62,
    batchNumber: 'BATCH-2026-896',
    cycleType: 'Steam 134°C (18 Mins)',
    sterilizedDate: '2026-10-28',
    expiryDate: '2026-11-27',
    indicatorResult: 'CLASS-5 PASS (ACCEPT)',
    location: 'OT Suite 2 - Ortho Rack',
    status: 'STERILE_VALID'
  },
  {
    id: 3,
    trayCode: 'TRAY-LAP-01',
    trayName: '4K Ultra-HD Laparoscopy Scope & Trocar Set',
    department: 'Minimally Invasive Surgery (OT Suite 3)',
    instrumentCount: 24,
    batchNumber: 'BATCH-2026-897',
    cycleType: 'Low-Temp Plasma (48°C)',
    sterilizedDate: '2026-10-29',
    expiryDate: '2026-11-15',
    indicatorResult: 'BIOLOGICAL NEGATIVE',
    location: 'CSSD Optical Clean Room',
    status: 'STERILE_VALID'
  },
  {
    id: 4,
    trayCode: 'TRAY-CS-03',
    trayName: 'Cesarean Delivery & Emergency Obstetrics Pack',
    department: 'Labor & Maternity OT',
    instrumentCount: 36,
    batchNumber: 'BATCH-2026-898',
    cycleType: 'Steam 134°C (18 Mins)',
    sterilizedDate: '2026-10-27',
    expiryDate: '2026-11-26',
    indicatorResult: 'CLASS-5 PASS (ACCEPT)',
    location: 'Maternity OT Sterile Bin',
    status: 'DISPATCHED_TO_OT'
  },
  {
    id: 5,
    trayCode: 'TRAY-TR-05',
    trayName: 'Emergency Trauma Cut-Down & Thoracotomy Tray',
    department: 'Emergency Trauma Care Center',
    instrumentCount: 30,
    batchNumber: 'BATCH-2026-880',
    cycleType: 'Steam 134°C (18 Mins)',
    sterilizedDate: '2026-09-25',
    expiryDate: '2026-10-25',
    indicatorResult: 'CLASS-5 EXPIRED',
    location: 'CSSD Decontamination Bay',
    status: 'RE_STERILIZATION_DUE'
  }
];

const INITIAL_BATCHES = [
  {
    id: 1,
    batchNumber: 'BATCH-2026-901',
    machineName: 'Steam Autoclave Unit 01 (Getinge)',
    machineType: 'High-Pressure Steam Autoclave',
    cycleDate: '2026-10-30',
    cycleTime: '08:30 AM',
    temperature: '134.2 °C',
    pressure: '30.4 PSI',
    holdTime: '18 Minutes',
    expiryDate: '2026-11-29',
    trayCount: 4,
    biologicalIndicator: 'NEGATIVE (NO GROWTH)',
    chemicalIntegrator: 'PASSED (ACCEPT)',
    status: 'IN_CYCLE'
  },
  {
    id: 2,
    batchNumber: 'BATCH-2026-900',
    machineName: 'Steam Autoclave Unit 02 (Tuttnauer)',
    machineType: 'High-Pressure Steam Autoclave',
    cycleDate: '2026-10-29',
    cycleTime: '04:15 PM',
    temperature: '134.0 °C',
    pressure: '30.1 PSI',
    holdTime: '18 Minutes',
    expiryDate: '2026-11-28',
    trayCount: 6,
    biologicalIndicator: 'NEGATIVE (NO GROWTH)',
    chemicalIntegrator: 'PASSED (ACCEPT)',
    status: 'RELEASED_CLEARED'
  }
];

const CSSD_BATCH_KEY = 'hospitalsync_cssd_batches_v1';
const CSSD_TRAYS_KEY = 'hospitalsync_cssd_trays_v1';

export default function CssdPanel() {
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [trays, setTrays] = useState(() => {
    try {
      const saved = localStorage.getItem(CSSD_TRAYS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRAYS;
    } catch {
      return INITIAL_TRAYS;
    }
  });

  const [batches, setBatches] = useState(() => {
    try {
      const saved = localStorage.getItem(CSSD_BATCH_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BATCHES;
    } catch {
      return INITIAL_BATCHES;
    }
  });

  const [activeTabSub, setActiveTabSub] = useState('trays');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [activeSlipBatch, setActiveSlipBatch] = useState(null);

  // New Batch Form State
  const [selectedMachineId, setSelectedMachineId] = useState('1');
  const [cycleType, setCycleType] = useState('Steam 134°C Porous Load (18 Mins)');
  const [selectedTrayCodes, setSelectedTrayCodes] = useState(['Major Laparotomy Set', 'Orthopedic Drill Pack']);
  const [biVerified, setBiVerified] = useState(true);
  const [chemVerified, setChemVerified] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(CSSD_TRAYS_KEY, JSON.stringify(trays));
    } catch (e) {
      console.error(e);
    }
  }, [trays]);

  useEffect(() => {
    try {
      localStorage.setItem(CSSD_BATCH_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error(e);
    }
  }, [batches]);

  const handleStartBatch = (e) => {
    e.preventDefault();

    const m = machines.find(mac => String(mac.id) === String(selectedMachineId)) || machines[0];
    const newBatchNum = `BATCH-2026-${Math.floor(902 + Math.random() * 50)}`;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30); // 30 days validity for triple-wrap

    const newBatch = {
      id: Date.now(),
      batchNumber: newBatchNum,
      machineName: m.name,
      machineType: m.type,
      cycleDate: new Date().toLocaleDateString('en-IN'),
      cycleTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temperature: cycleType.includes('Plasma') ? '48.0 °C' : '134.2 °C',
      pressure: cycleType.includes('Plasma') ? 'Gas Plasma' : '30.4 PSI',
      holdTime: cycleType.includes('Plasma') ? '45 Minutes' : '18 Minutes',
      expiryDate: expDate.toLocaleDateString('en-IN'),
      trayCount: selectedTrayCodes.length,
      biologicalIndicator: biVerified ? 'NEGATIVE (NO GROWTH)' : 'INCUBATION PENDING',
      chemicalIntegrator: chemVerified ? 'PASSED (ACCEPT)' : 'PENDING EVAL',
      status: 'RELEASED_CLEARED'
    };

    setBatches(prev => [newBatch, ...prev]);
    toast.success(`Sterilization Batch #${newBatchNum} successfully processed and certified!`);
    setShowBatchModal(false);
    setActiveSlipBatch(newBatch);
  };

  const handleMarkDispatched = (trayId) => {
    setTrays(prev => prev.map(t => {
      if (t.id === trayId) {
        return { ...t, status: 'DISPATCHED_TO_OT', location: 'Active in Operation Theatre Suite' };
      }
      return t;
    }));
    toast.info('Surgical tray marked as dispatched to OT.');
  };

  const sterileCount = trays.filter(t => t.status === 'STERILE_VALID').length;
  const dispatchedCount = trays.filter(t => t.status === 'DISPATCHED_TO_OT').length;
  const expiredCount = trays.filter(t => t.status === 'RE_STERILIZATION_DUE').length;

  return (
    <div className="desk-premium-page">

      {/* HERO BANNER */}
      <div className="desk-hero">
        <div className="hero-content">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="hero-icon emerald">
                <i className="bi bi-shield-check"></i>
              </div>
              <div>
                <h4 className="hero-title">
                  CSSD & Hospital Infection Control Surveillance Desk
                </h4>
                <p className="hero-subtitle">
                  {getHospitalName()} &bull; Central Sterile Services &bull; NABH HIC.2 Standard &bull; Biological Spore Testing
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="hero-chip">
                <i className="bi bi-shield-check text-success"></i>
                NABH HIC.2 Standard
              </span>
              <span className="hero-chip">
                <i className="bi bi-check2-all text-success"></i>
                Class-5 Integrator
              </span>
              <button
                type="button"
                className="premium-btn green"
                onClick={() => setShowBatchModal(true)}
              >
                <i className="bi bi-play-circle-fill me-1"></i> Run Sterilizer Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="metric-grid">
        <div className="metric-card metric-green">
          <div className="metric-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="metric-label">Sterile Surgical Packs</div>
          <div className="metric-value">{sterileCount}</div>
        </div>

        <div className="metric-card metric-blue">
          <div className="metric-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="metric-label">In Operation Theatres</div>
          <div className="metric-value">{dispatchedCount}</div>
        </div>

        <div className="metric-card metric-red">
          <div className="metric-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="metric-label">Re-Sterilization Due</div>
          <div className="metric-value">{expiredCount}</div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-icon">
            <i className="bi bi-activity"></i>
          </div>
          <div className="metric-label">HAI Infection Rate</div>
          <div className="metric-value">0.4%</div>
        </div>
      </div>

      {/* Autoclave Machine Status Cards */}
      <div className="row g-3 mb-4">
        {machines.map(m => (
          <div key={m.id} className="col-md-4">
            <div className="card border shadow-sm h-100">
              <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                <strong className="small text-dark text-truncate">{m.name}</strong>
                <span className={`badge ${m.status === 'READY_FOR_LOAD' ? 'bg-success' : 'bg-primary'} px-2 py-1`}>
                  {m.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="card-body p-3 small">
                <div className="text-muted mb-2">{m.type} • Cap: {m.chamberCapacity}</div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Chamber Temp:</span>
                  <strong className="text-dark font-monospace">{m.currentTemp}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Chamber Pressure:</span>
                  <strong className="text-dark font-monospace">{m.currentPressure}</strong>
                </div>
                {m.currentBatch && (
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Active Cycle:</span>
                    <strong className="text-primary font-monospace">{m.currentBatch}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Toolbar */}
      <div className="premium-panel mb-4">
        <div className="panel-toolbar">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="premium-tabs">
              <button
                type="button"
                className={`premium-tab ${activeTabSub === 'trays' ? 'active' : ''}`}
                onClick={() => setActiveTabSub('trays')}
              >
                <i className="bi bi-box-seam me-1"></i> Surgical Trays <span className="tab-count">{trays.length}</span>
              </button>
              <button
                type="button"
                className={`premium-tab ${activeTabSub === 'batches' ? 'active' : ''}`}
                onClick={() => setActiveTabSub('batches')}
              >
                <i className="bi bi-clock-history me-1"></i> Autoclave Cycles & Passes <span className="tab-count">{batches.length}</span>
              </button>
              <button
                type="button"
                className={`premium-tab ${activeTabSub === 'hai' ? 'active' : ''}`}
                onClick={() => setActiveTabSub('hai')}
              >
                <i className="bi bi-virus me-1"></i> HAI Infection Surveillance
              </button>
            </div>
            {activeTabSub === 'trays' && (
              <span className="badge bg-light text-dark border">{sterileCount} Available Packs</span>
            )}
          </div>
        </div>

        {/* Subtab 1: Surgical Trays */}
        {activeTabSub === 'trays' && (
          <div className="table-wrap">
            <table className="premium-table">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Tray Code</th>
                    <th>Tray Nomenclature & Dept</th>
                    <th>Instruments</th>
                    <th>Cycle Batch #</th>
                    <th>Chemical Indicator</th>
                    <th>Sterility Valid Till</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {trays.map(item => {
                    const isSterile = item.status === 'STERILE_VALID';
                    const isDispatched = item.status === 'DISPATCHED_TO_OT';

                    return (
                      <tr key={item.id} className={item.status === 'RE_STERILIZATION_DUE' ? 'table-danger-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-success font-monospace">{item.trayCode}</strong>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.location}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.trayName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.department}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{item.instrumentCount} Pcs</span>
                        </td>
                        <td>
                          <span className="font-monospace text-dark">{item.batchNumber}</span>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{item.cycleType}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.indicatorResult.includes('PASS') || item.indicatorResult.includes('NEGATIVE')
                              ? 'bg-success-subtle text-success border border-success'
                              : 'bg-danger'
                          }`}>
                            {item.indicatorResult}
                          </span>
                        </td>
                        <td>
                          <strong className="font-monospace text-dark">{item.expiryDate}</strong>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sterilized: {item.sterilizedDate}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            isSterile ? 'bg-success' :
                            isDispatched ? 'bg-primary' : 'bg-danger'
                          } px-2 py-1`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          {isSterile && (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm py-0 px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => handleMarkDispatched(item.id)}
                            >
                              Dispatch to OT
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
        )}

        {/* Subtab 2: Batches & Passes */}
        {activeTabSub === 'batches' && (
          <div className="table-wrap">
            <table className="premium-table">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Batch # / Time</th>
                    <th>Sterilizer Unit</th>
                    <th>Temp & Pressure</th>
                    <th>Hold Time</th>
                    <th>Biological Spore Test</th>
                    <th>Packs Cleared</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {batches.map(b => (
                    <tr key={b.id}>
                      <td className="ps-3">
                        <strong className="text-success font-monospace">{b.batchNumber}</strong>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{b.cycleDate} • {b.cycleTime}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{b.machineName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.machineType}</div>
                      </td>
                      <td>
                        <div className="font-monospace text-dark">{b.temperature} • {b.pressure}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">{b.holdTime}</span>
                      </td>
                      <td>
                        <span className="badge bg-success font-monospace">{b.biologicalIndicator}</span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{b.trayCount} Surgical Packs</span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm py-1 px-2"
                          onClick={() => setActiveSlipBatch(b)}
                        >
                          <i className="bi bi-printer-fill me-1"></i> Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subtab 3: Hospital Infection Control Surveillance */}
      {activeTabSub === 'hai' && (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-activity text-danger me-2"></i>
                  NABH Infection Surveillance Dashboard (Current Month)
                </h6>
              </div>
              <div className="card-body p-3">
                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Surgical Site Infection (SSI Rate):</span>
                    <strong className="text-success">0.38% (Benchmark &lt; 1.5%)</strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Catheter-Associated UTI (CAUTI):</span>
                    <strong className="text-success">0.4 / 1000 urinary catheter days</strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Central Line Infection (CLABSI):</span>
                    <strong className="text-success">0.2 / 1000 central line days</strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Ventilator-Associated Pneumonia (VAP):</span>
                    <strong className="text-success">0.5 / 1000 ventilator days</strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-shield-shaded text-primary me-2"></i>
                  Hand Hygiene & Terminal Environmental Disinfection
                </h6>
              </div>
              <div className="card-body p-3 small">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>OT Terminal Fumigation & Air Sampling</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Microbiology settle plates: 0 CFU colony count</div>
                    </div>
                    <span className="badge bg-success">CLEAR</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Hand Hygiene Compliance Rate</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>WHO 5 Moments audit across ICU & Wards</div>
                    </div>
                    <span className="badge bg-primary">94.8% COMPLIANT</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>HEPA Filter Air Quality Audit</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>OT Laminar Air Flow: 22 Air Changes/Hr (ACH)</div>
                    </div>
                    <span className="badge bg-success">OPTIMAL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Sterilization Batch Modal */}
      {showBatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-success text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-shield-plus me-2"></i>
                  Run Sterilization Autoclave Cycle & Certify Batch
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBatchModal(false)}></button>
              </div>

              <form onSubmit={handleStartBatch}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Select Sterilizer Unit *</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                    >
                      {machines.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Sterilization Cycle Protocol *</label>
                    <select
                      className="form-select form-select-sm"
                      value={cycleType}
                      onChange={(e) => setCycleType(e.target.value)}
                    >
                      <option value="Steam 134°C Porous Load (18 Mins)">Steam 134°C Porous Load (18 Mins • 30 PSI)</option>
                      <option value="Steam 121°C Rubber / Plastic Pack (30 Mins)">Steam 121°C Rubber / Plastic Pack (30 Mins • 15 PSI)</option>
                      <option value="Low-Temp H2O2 Plasma 48°C (45 Mins)">Low-Temp H2O2 Plasma 48°C (45 Mins • Endoscopes)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Quality Validation Checkpoints (Mandatory)</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="biCheck"
                        checked={biVerified}
                        onChange={(e) => setBiVerified(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="biCheck">
                        Biological Indicator Spore Ampoule (Geobacillus stearothermophilus) verified Negative.
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="chemCheck"
                        checked={chemVerified}
                        onChange={(e) => setChemVerified(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="chemCheck">
                        Class 5 Chemical Integrator strip confirmed in ACCEPT color window.
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowBatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm fw-bold px-3">
                    <i className="bi bi-check-circle-fill me-1"></i> Certify & Issue Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Sterility Certificate */}
      {activeSlipBatch && (
        <CssdSterilitySlip
          batch={activeSlipBatch}
          onClose={() => setActiveSlipBatch(null)}
        />
      )}
    </div>
  );
}
