import React, { useState, useEffect, useMemo } from 'react';
import { getHospitalName } from '../../services/hospitalConfig';
import LinenDispatchSlip from './LinenDispatchSlip';
import { toast } from 'react-toastify';

const INITIAL_LAUNDRY_MACHINES = [
  {
    id: 1,
    name: 'Barrier Washer-Extractor Unit 01 (Girbau 55kg)',
    type: 'Double-Door Hygienic Barrier Washer',
    capacity: '55 kg / cycle',
    temp: '85.4 °C (Thermal Disinfection)',
    status: 'CYCLE_ACTIVE',
    currentLoad: 'OT Surgical Drapes & Green Linen (48 kg)'
  },
  {
    id: 2,
    name: 'Thermal Sluice Washer Unit 02 (Electrolux 40kg)',
    type: 'Infection Control Sluice Disinfection',
    capacity: '40 kg / cycle',
    temp: '28.0 °C (Standby)',
    status: 'READY_FOR_LOAD',
    currentLoad: 'None (Drum Sanitized)'
  },
  {
    id: 3,
    name: 'High-Speed Steam Flatwork Ironer (Lapauw)',
    type: 'Heated Roller Calender Ironer',
    capacity: '250 Sheets / hour',
    temp: '162.0 °C (Steam Pressure 8 Bar)',
    status: 'CYCLE_ACTIVE',
    currentLoad: 'ICU Cotton Bed Sheets'
  }
];

const INITIAL_WARD_EXCHANGES = [
  {
    id: 1,
    ward: 'Operation Theatre (OT Suites)',
    soiledCollectedKg: 48.5,
    cleanDispatchedPcs: 145,
    lastDispatchTime: '08:45 AM',
    stockStatus: 'OPTIMAL_PAR_LEVEL',
    inStockSheets: 85,
    inStockGowns: 50,
    inStockDrapes: 65
  },
  {
    id: 2,
    ward: 'Intensive Care Unit (ICU)',
    soiledCollectedKg: 36.0,
    cleanDispatchedPcs: 110,
    lastDispatchTime: '09:30 AM',
    stockStatus: 'OPTIMAL_PAR_LEVEL',
    inStockSheets: 60,
    inStockGowns: 40,
    inStockDrapes: 20
  },
  {
    id: 3,
    ward: 'Emergency Trauma Care Center',
    soiledCollectedKg: 28.2,
    cleanDispatchedPcs: 95,
    lastDispatchTime: '10:15 AM',
    stockStatus: 'REPLENISHMENT_NEEDED',
    inStockSheets: 25,
    inStockGowns: 20,
    inStockDrapes: 15
  },
  {
    id: 4,
    ward: 'General Medicine Ward A',
    soiledCollectedKg: 42.0,
    cleanDispatchedPcs: 130,
    lastDispatchTime: '07:30 AM',
    stockStatus: 'OPTIMAL_PAR_LEVEL',
    inStockSheets: 70,
    inStockGowns: 45,
    inStockDrapes: 10
  }
];

const INITIAL_DISPATCHES = [
  {
    id: 1,
    dispatchNumber: 'LIN-2026-801',
    destinationWard: 'Operation Theatre (OT Suites)',
    floor: 'Floor 3 - Surgical Block',
    dispatchDate: '2026-10-30',
    totalPieces: 145,
    washTemp: '85.0 °C',
    ironTemp: '160.0 °C',
    disinfectant: 'Sodium Hypochlorite 1%',
    status: 'DELIVERED_TO_WARD'
  },
  {
    id: 2,
    dispatchNumber: 'LIN-2026-802',
    destinationWard: 'Intensive Care Unit (ICU)',
    floor: 'Floor 2 - Critical Care',
    dispatchDate: '2026-10-30',
    totalPieces: 110,
    washTemp: '85.0 °C',
    ironTemp: '160.0 °C',
    disinfectant: 'Oxygen Bleach & Hypo',
    status: 'DELIVERED_TO_WARD'
  }
];

const LAUNDRY_DISPATCH_KEY = 'hospitalsync_laundry_dispatches_v1';
const LAUNDRY_WARDS_KEY = 'hospitalsync_laundry_wards_v1';

export default function LaundryPanel() {
  const [machines, setMachines] = useState(INITIAL_LAUNDRY_MACHINES);
  const [wardExchanges, setWardExchanges] = useState(() => {
    try {
      const saved = localStorage.getItem(LAUNDRY_WARDS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WARD_EXCHANGES;
    } catch {
      return INITIAL_WARD_EXCHANGES;
    }
  });

  const [dispatches, setDispatches] = useState(() => {
    try {
      const saved = localStorage.getItem(LAUNDRY_DISPATCH_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [activeSlipDispatch, setActiveSlipDispatch] = useState(null);

  // Form State
  const [targetWard, setTargetWard] = useState('Emergency Trauma Care Center');
  const [targetFloor, setTargetFloor] = useState('Ground Floor - Trauma Bay');
  const [sheetsCount, setSheetsCount] = useState('40');
  const [gownsCount, setGownsCount] = useState('30');
  const [drapesCount, setDrapesCount] = useState('25');

  useEffect(() => {
    try {
      localStorage.setItem(LAUNDRY_DISPATCH_KEY, JSON.stringify(dispatches));
    } catch (e) {
      console.error(e);
    }
  }, [dispatches]);

  useEffect(() => {
    try {
      localStorage.setItem(LAUNDRY_WARDS_KEY, JSON.stringify(wardExchanges));
    } catch (e) {
      console.error(e);
    }
  }, [wardExchanges]);

  const handleCreateDispatch = (e) => {
    e.preventDefault();

    const total = (parseInt(sheetsCount, 10) || 0) + (parseInt(gownsCount, 10) || 0) + (parseInt(drapesCount, 10) || 0);
    const newDispatchNum = `LIN-2026-${Math.floor(803 + Math.random() * 50)}`;

    const newDisp = {
      id: Date.now(),
      dispatchNumber: newDispatchNum,
      destinationWard: targetWard,
      floor: targetFloor,
      dispatchDate: new Date().toLocaleDateString('en-IN'),
      totalPieces: total,
      washTemp: '85.0 °C',
      ironTemp: '160.0 °C',
      disinfectant: 'Sodium Hypochlorite 1%',
      status: 'DELIVERED_TO_WARD'
    };

    setDispatches(prev => [newDisp, ...prev]);

    // Update ward inventory par level
    setWardExchanges(prev => prev.map(w => {
      if (w.ward === targetWard) {
        return {
          ...w,
          cleanDispatchedPcs: w.cleanDispatchedPcs + total,
          inStockSheets: w.inStockSheets + (parseInt(sheetsCount, 10) || 0),
          inStockGowns: w.inStockGowns + (parseInt(gownsCount, 10) || 0),
          inStockDrapes: w.inStockDrapes + (parseInt(drapesCount, 10) || 0),
          stockStatus: 'OPTIMAL_PAR_LEVEL'
        };
      }
      return w;
    }));

    toast.success(`Clean linen consignment #${newDispatchNum} dispatched to ${targetWard} (${total} Pcs)!`);
    setShowDispatchModal(false);
    setActiveSlipDispatch(newDisp);
  };

  const totalDispatchedToday = dispatches.reduce((acc, d) => acc + (d.totalPieces || 0), 0);
  const totalSoiledCollected = wardExchanges.reduce((acc, w) => acc + (w.soiledCollectedKg || 0), 0).toFixed(1);

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-tag-fill text-info me-2 fs-2"></i>
            Hospital Laundry & Linen Asset Management Desk
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • NABH FMS Linen Standards • Thermal Barrier Disinfection & Automated Ironing
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-info text-dark btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowDispatchModal(true)}
          >
            <i className="bi bi-box-seam me-1"></i> Dispatch Clean Linen to Ward
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-info border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Clean Linen Dispatched</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{totalDispatchedToday} Pcs</h3>
                <i className="bi bi-tag fs-1 text-info opacity-50"></i>
              </div>
              <small className="text-muted">Sheets, gowns, surgical drapes</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Soiled Linen Collected</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{totalSoiledCollected} kg</h3>
                <i className="bi bi-basket3-fill fs-1 text-warning opacity-50"></i>
              </div>
              <small className="text-muted">Segregated sluice disinfection</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Thermal Wash Temp</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-success">85.4 °C</h3>
                <i className="bi bi-thermometer-sun fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">NABH guideline: &gt; 71°C for 10 mins</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Bio-Burden Clearance</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-primary">0 CFU</h3>
                <i className="bi bi-shield-check fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">100% Pathogen-free certification</small>
            </div>
          </div>
        </div>
      </div>

      {/* Laundry Machine Status Grid */}
      <div className="row g-3 mb-4">
        {machines.map(m => (
          <div key={m.id} className="col-md-4">
            <div className="card border shadow-sm h-100">
              <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                <strong className="small text-dark text-truncate">{m.name}</strong>
                <span className={`badge ${m.status === 'CYCLE_ACTIVE' ? 'bg-primary' : 'bg-success'} px-2 py-1`}>
                  {m.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="card-body p-3 small">
                <div className="text-muted mb-2">{m.type} • Cap: {m.capacity}</div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Operating Temp:</span>
                  <strong className="text-dark font-monospace">{m.temp}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Current Batch:</span>
                  <strong className="text-primary">{m.currentLoad}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ward Linen Inventory Exchange Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-grid-3x3-gap-fill text-info me-2"></i>
            Ward Linen Par-Level Inventory & Exchange Matrix
          </h5>
          <span className="badge bg-light text-dark border">
            {wardExchanges.length} Monitored Hospital Wards
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Hospital Ward</th>
                  <th>Soiled Collected (kg)</th>
                  <th>Clean Dispatched (pcs)</th>
                  <th>Bed Sheets Par</th>
                  <th>Gowns Par</th>
                  <th>OT Drapes Par</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody className="small">
                {wardExchanges.map(item => (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <strong className="text-dark fs-6">{item.ward}</strong>
                    </td>
                    <td>
                      <span className="font-monospace fw-semibold text-warning-emphasis">{item.soiledCollectedKg} kg</span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-dark border font-monospace fs-6">{item.cleanDispatchedPcs} Pcs</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{item.inStockSheets} Sheets</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{item.inStockGowns} Gowns</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{item.inStockDrapes} Drapes</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.stockStatus === 'OPTIMAL_PAR_LEVEL' ? 'bg-success' : 'bg-danger'
                      } px-2 py-1`}>
                        {item.stockStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Clean Linen Ward Delivery Manifests
          </h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Manifest # / Date</th>
                  <th>Destination Ward</th>
                  <th>Total Pieces</th>
                  <th>Thermal Temp</th>
                  <th>Ironing Calender</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {dispatches.map(d => (
                  <tr key={d.id}>
                    <td className="ps-3">
                      <strong className="text-dark font-monospace">{d.dispatchNumber}</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{d.dispatchDate}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{d.destinationWard}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{d.floor}</div>
                    </td>
                    <td>
                      <strong className="text-primary font-monospace fs-6">{d.totalPieces} Pcs</strong>
                    </td>
                    <td>
                      <span className="text-success font-monospace">{d.washTemp}</span>
                    </td>
                    <td>
                      <span className="text-danger font-monospace">{d.ironTemp}</span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success">
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <button
                        type="button"
                        className="btn btn-outline-info text-dark btn-sm py-1 px-2"
                        onClick={() => setActiveSlipDispatch(d)}
                      >
                        <i className="bi bi-printer-fill me-1"></i> Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dispatch Clean Linen Modal */}
      {showDispatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-info text-dark py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-box-seam me-2"></i>
                  Dispatch Clean Linen Consignment to Ward
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDispatchModal(false)}></button>
              </div>

              <form onSubmit={handleCreateDispatch}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Destination Ward *</label>
                    <select
                      className="form-select form-select-sm"
                      value={targetWard}
                      onChange={(e) => {
                        setTargetWard(e.target.value);
                        if (e.target.value.includes('OT')) setTargetFloor('Floor 3 - Surgical Block');
                        else if (e.target.value.includes('ICU')) setTargetFloor('Floor 2 - Critical Care');
                        else setTargetFloor('Ground Floor - Trauma Bay');
                      }}
                    >
                      <option value="Operation Theatre (OT Suites)">Operation Theatre (OT Suites)</option>
                      <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                      <option value="Emergency Trauma Care Center">Emergency Trauma Care Center</option>
                      <option value="General Medicine Ward A">General Medicine Ward A</option>
                      <option value="Labor & Maternity Ward">Labor & Maternity Ward</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Bed Sheets (Pcs)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm font-monospace"
                        value={sheetsCount}
                        onChange={(e) => setSheetsCount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Patient Gowns (Pcs)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm font-monospace"
                        value={gownsCount}
                        onChange={(e) => setGownsCount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">OT Drapes (Pcs)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm font-monospace"
                        value={drapesCount}
                        onChange={(e) => setDrapesCount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-2 bg-light rounded border small text-muted">
                    <i className="bi bi-shield-check text-success me-1"></i>
                    All items undergo thermal barrier wash at 85°C with steam calender ironing at 160°C.
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowDispatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-info text-dark btn-sm fw-bold px-3">
                    <i className="bi bi-send-check-fill me-1"></i> Issue Consignment Manifest
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Linen Slip */}
      {activeSlipDispatch && (
        <LinenDispatchSlip
          dispatch={activeSlipDispatch}
          onClose={() => setActiveSlipDispatch(null)}
        />
      )}
    </div>
  );
}
