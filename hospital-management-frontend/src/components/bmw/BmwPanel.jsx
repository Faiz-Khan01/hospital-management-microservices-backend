import React, { useState, useEffect, useMemo } from 'react';
import { getHospitalName } from '../../services/hospitalConfig';
import BmwDailyManifestSlip from './BmwDailyManifestSlip';
import { toast } from 'react-toastify';
import '../../styles/clinicalDesksPremium.css';

const INITIAL_WASTE_BAGS = [
  {
    id: 1,
    barcode: 'BMW-YEL-2026-901',
    category: 'YELLOW',
    categoryLabel: 'Anatomical & Soiled Dressing',
    wardSource: 'Operation Theatre (OT Suite 1)',
    weightKg: 4.85,
    collectionTime: '09:15 AM',
    collectedBy: 'Sanitation Lead Ramu',
    status: 'IN_INTERIM_STORAGE'
  },
  {
    id: 2,
    barcode: 'BMW-RED-2026-902',
    category: 'RED',
    categoryLabel: 'Contaminated Plastic Tubing & Catheters',
    wardSource: 'Intensive Care Unit (ICU)',
    weightKg: 6.20,
    collectionTime: '09:30 AM',
    collectedBy: 'Sanitation Staff Rajesh',
    status: 'IN_INTERIM_STORAGE'
  },
  {
    id: 3,
    barcode: 'BMW-WHT-2026-903',
    category: 'WHITE',
    categoryLabel: 'Puncture-Proof Sharps & Scalpels',
    wardSource: 'Emergency Trauma Care Center',
    weightKg: 1.40,
    collectionTime: '10:00 AM',
    collectedBy: 'Sanitation Lead Ramu',
    status: 'IN_INTERIM_STORAGE'
  },
  {
    id: 4,
    barcode: 'BMW-BLU-2026-904',
    category: 'BLUE',
    categoryLabel: 'Glass Vials & Medicine Ampoules',
    wardSource: 'General Medicine Ward A',
    weightKg: 3.10,
    collectionTime: '10:15 AM',
    collectedBy: 'Sanitation Staff Rajesh',
    status: 'IN_INTERIM_STORAGE'
  },
  {
    id: 5,
    barcode: 'BMW-RED-2026-905',
    category: 'RED',
    categoryLabel: 'Contaminated Gloves & Dialysis Lines',
    wardSource: 'Nephrology & Dialysis Unit',
    weightKg: 5.75,
    collectionTime: '11:00 AM',
    collectedBy: 'Sanitation Lead Ramu',
    status: 'IN_INTERIM_STORAGE'
  }
];

const INITIAL_MANIFESTS = [
  {
    id: 1,
    manifestNumber: 'BMW-MAN-2026-440',
    dispatchDate: '2026-10-29',
    dispatchTime: '04:30 PM',
    cbmwtfOperator: 'Synergy Waste Management Pvt Ltd',
    vehicleNumber: 'DL-1L-AA-4012',
    driverName: 'Ramesh Kumar',
    yellowBags: 12,
    yellowWeight: '38.40',
    redBags: 16,
    redWeight: '52.10',
    whiteBoxes: 5,
    whiteWeight: '8.20',
    blueBoxes: 7,
    blueWeight: '14.80',
    totalWeight: '113.50',
    status: 'DISPATCHED_TO_CBMWTF'
  }
];

const BMW_BAGS_KEY = 'hospitalsync_bmw_bags_v1';
const BMW_MANIFESTS_KEY = 'hospitalsync_bmw_manifests_v1';

export default function BmwPanel() {
  const [bags, setBags] = useState(() => {
    try {
      const saved = localStorage.getItem(BMW_BAGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WASTE_BAGS;
    } catch {
      return INITIAL_WASTE_BAGS;
    }
  });

  const [manifests, setManifests] = useState(() => {
    try {
      const saved = localStorage.getItem(BMW_MANIFESTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MANIFESTS;
    } catch {
      return INITIAL_MANIFESTS;
    }
  });

  const [showLogBagModal, setShowLogBagModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [activeSlipManifest, setActiveSlipManifest] = useState(null);
  const [activeTabSub, setActiveTabSub] = useState('bags');

  // Form State for Log Bag
  const [newWard, setNewWard] = useState('Operation Theatre (OT Suite 1)');
  const [newCategory, setNewCategory] = useState('YELLOW');
  const [newWeight, setNewWeight] = useState('3.50');
  const [newStaff, setNewStaff] = useState('Sanitation Staff Ramu');

  // Form State for CBMWTF Dispatch
  const [cbmwtfOperator, setCbmwtfOperator] = useState('Synergy Waste Management Pvt Ltd');
  const [vehicleNumber, setVehicleNumber] = useState('DL-1L-AA-4012');
  const [driverName, setDriverName] = useState('Ramesh Kumar');

  useEffect(() => {
    try {
      localStorage.setItem(BMW_BAGS_KEY, JSON.stringify(bags));
    } catch (e) {
      console.error(e);
    }
  }, [bags]);

  useEffect(() => {
    try {
      localStorage.setItem(BMW_MANIFESTS_KEY, JSON.stringify(manifests));
    } catch (e) {
      console.error(e);
    }
  }, [manifests]);

  const handleCreateBag = (e) => {
    e.preventDefault();
    const w = parseFloat(newWeight) || 2.0;

    const catLabels = {
      YELLOW: 'Anatomical & Soiled Dressing',
      RED: 'Contaminated Plastic Tubing & Gloves',
      WHITE: 'Puncture-Proof Sharps & Needles',
      BLUE: 'Glass Vials & Medicine Ampoules'
    };

    const newBag = {
      id: Date.now(),
      barcode: `BMW-${newCategory.substring(0, 3)}-2026-${Math.floor(906 + Math.random() * 50)}`,
      category: newCategory,
      categoryLabel: catLabels[newCategory] || 'Bio-Medical Waste',
      wardSource: newWard,
      weightKg: w,
      collectionTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      collectedBy: newStaff,
      status: 'IN_INTERIM_STORAGE'
    };

    setBags(prev => [newBag, ...prev]);
    toast.success(`Waste bag ${newBag.barcode} weighed & tagged (${w} kg)!`);
    setShowLogBagModal(false);
  };

  const handleCreateDispatch = (e) => {
    e.preventDefault();

    const pendingBags = bags.filter(b => b.status === 'IN_INTERIM_STORAGE');
    if (pendingBags.length === 0) {
      toast.error('No pending waste bags in storage for handover.');
      return;
    }

    const yellowBags = pendingBags.filter(b => b.category === 'YELLOW');
    const redBags = pendingBags.filter(b => b.category === 'RED');
    const whiteBags = pendingBags.filter(b => b.category === 'WHITE');
    const blueBags = pendingBags.filter(b => b.category === 'BLUE');

    const yellowWeight = yellowBags.reduce((acc, b) => acc + b.weightKg, 0).toFixed(2);
    const redWeight = redBags.reduce((acc, b) => acc + b.weightKg, 0).toFixed(2);
    const whiteWeight = whiteBags.reduce((acc, b) => acc + b.weightKg, 0).toFixed(2);
    const blueWeight = blueBags.reduce((acc, b) => acc + b.weightKg, 0).toFixed(2);
    const totalWeight = (parseFloat(yellowWeight) + parseFloat(redWeight) + parseFloat(whiteWeight) + parseFloat(blueWeight)).toFixed(2);

    const newManifest = {
      id: Date.now(),
      manifestNumber: `BMW-MAN-2026-${Math.floor(441 + Math.random() * 50)}`,
      dispatchDate: new Date().toLocaleDateString('en-IN'),
      dispatchTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      cbmwtfOperator,
      vehicleNumber,
      driverName,
      yellowBags: yellowBags.length,
      yellowWeight,
      redBags: redBags.length,
      redWeight,
      whiteBoxes: whiteBags.length,
      whiteWeight,
      blueBoxes: blueBags.length,
      blueWeight,
      totalWeight,
      status: 'DISPATCHED_TO_CBMWTF'
    };

    // Mark bags as dispatched
    setBags(prev => prev.map(b => ({ ...b, status: 'DISPATCHED' })));
    setManifests(prev => [newManifest, ...prev]);

    toast.success(`Consignment Manifest #${newManifest.manifestNumber} issued to ${cbmwtfOperator}!`);
    setShowDispatchModal(false);
    setActiveSlipManifest(newManifest);
    setActiveTabSub('manifests');
  };

  const totalPendingWeight = bags
    .filter(b => b.status === 'IN_INTERIM_STORAGE')
    .reduce((acc, b) => acc + b.weightKg, 0)
    .toFixed(1);

  const pendingBagsCount = bags.filter(b => b.status === 'IN_INTERIM_STORAGE').length;

  return (
    <div className="desk-premium-page">

      {/* HERO BANNER */}
      <div className="desk-hero">
        <div className="hero-content">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="hero-icon orange">
                <i className="bi bi-trash3-fill"></i>
              </div>
              <div>
                <h4 className="hero-title">
                  Bio-Medical Waste (BMW) Management & Pollution Control Desk
                </h4>
                <p className="hero-subtitle">
                  {getHospitalName()} &bull; CPCB Form VI Compliance &bull; Color-Coded Segregation & Barcode Weight Tracking
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="hero-chip">
                <i className="bi bi-shield-check text-warning"></i>
                CPCB Form VI Compliance
              </span>
              <span className="hero-chip">
                <i className="bi bi-qr-code text-warning"></i>
                Barcoded Weight Audit
              </span>
              <button
                type="button"
                className="premium-btn"
                onClick={() => setShowLogBagModal(true)}
              >
                <i className="bi bi-upc-scan me-1"></i> Scan & Weigh
              </button>
              <button
                type="button"
                className="premium-btn orange"
                onClick={() => setShowDispatchModal(true)}
              >
                <i className="bi bi-truck me-1"></i> Dispatch CBMWTF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="metric-grid">
        <div className="metric-card metric-orange">
          <div className="metric-icon">
            <i className="bi bi-fire"></i>
          </div>
          <div className="metric-label">🟡 Yellow Waste (Anatomical)</div>
          <div className="metric-value">
            {bags.filter(b => b.category === 'YELLOW').reduce((a, b) => a + b.weightKg, 0).toFixed(1)} kg
          </div>
        </div>

        <div className="metric-card metric-red">
          <div className="metric-icon">
            <i className="bi bi-recycle"></i>
          </div>
          <div className="metric-label">🔴 Red Waste (Plastic)</div>
          <div className="metric-value">
            {bags.filter(b => b.category === 'RED').reduce((a, b) => a + b.weightKg, 0).toFixed(1)} kg
          </div>
        </div>

        <div className="metric-card metric-purple">
          <div className="metric-icon">
            <i className="bi bi-shield-slash"></i>
          </div>
          <div className="metric-label">⚪ White Sharps Box</div>
          <div className="metric-value">
            {bags.filter(b => b.category === 'WHITE').reduce((a, b) => a + b.weightKg, 0).toFixed(1)} kg
          </div>
        </div>

        <div className="metric-card metric-blue">
          <div className="metric-icon">
            <i className="bi bi-prescription"></i>
          </div>
          <div className="metric-label">🔵 Blue Glass & Ampoules</div>
          <div className="metric-value">
            {bags.filter(b => b.category === 'BLUE').reduce((a, b) => a + b.weightKg, 0).toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="premium-panel mb-4">
        <div className="panel-toolbar">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="premium-tabs">
              <button
                type="button"
                className={`premium-tab ${activeTabSub === 'bags' ? 'active' : ''}`}
                onClick={() => setActiveTabSub('bags')}
              >
                <i className="bi bi-upc-scan me-1"></i> Barcoded Bags & Storage <span className="tab-count">{bags.length}</span>
              </button>
              <button
                type="button"
                className={`premium-tab ${activeTabSub === 'manifests' ? 'active' : ''}`}
                onClick={() => setActiveTabSub('manifests')}
              >
                <i className="bi bi-file-earmark-text-fill me-1"></i> CPCB Form VI Dispatches <span className="tab-count">{manifests.length}</span>
              </button>
            </div>
            <span className="badge bg-warning-subtle text-dark border border-warning">
              Pending in Storage: {pendingBagsCount} Bags ({totalPendingWeight} kg)
            </span>
          </div>
        </div>

        {/* Subtab 1: Bags Table */}
        {activeTabSub === 'bags' && (
          <div className="table-wrap">
            <table className="premium-table">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Barcode Tag</th>
                    <th>Color Stream</th>
                    <th>Ward Source</th>
                    <th>Weight (kg)</th>
                    <th>Collected By</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {bags.map(item => {
                    const isDispatched = item.status === 'DISPATCHED';

                    return (
                      <tr key={item.id} className={!isDispatched ? 'table-warning-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-dark font-monospace">{item.barcode}</strong>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.category === 'YELLOW' ? 'bg-warning text-dark' :
                            item.category === 'RED' ? 'bg-danger' :
                            item.category === 'WHITE' ? 'bg-light text-dark border' : 'bg-primary'
                          } fw-bold`}>
                            {item.category}
                          </span>
                          <span className="ms-2 text-muted" style={{ fontSize: '0.72rem' }}>{item.categoryLabel}</span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.wardSource}</div>
                        </td>
                        <td>
                          <strong className="text-dark font-monospace fs-6">{item.weightKg} kg</strong>
                        </td>
                        <td>
                          <span className="text-dark">{item.collectedBy}</span>
                        </td>
                        <td>
                          <span className="text-muted font-monospace">{item.collectionTime}</span>
                        </td>
                        <td>
                          <span className={`badge ${isDispatched ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        )}

        {/* Subtab 2: Form VI Dispatches Table */}
        {activeTabSub === 'manifests' && (
          <div className="table-wrap">
            <table className="premium-table">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Manifest # / Date</th>
                    <th>Treatment Operator</th>
                    <th>Vehicle & Driver</th>
                    <th>Yellow (kg)</th>
                    <th>Red (kg)</th>
                    <th>White (kg)</th>
                    <th>Blue (kg)</th>
                    <th>Total Weight</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {manifests.map(m => (
                    <tr key={m.id}>
                      <td className="ps-3">
                        <strong className="text-dark font-monospace">{m.manifestNumber}</strong>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{m.dispatchDate} • {m.dispatchTime}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{m.cbmwtfOperator}</div>
                      </td>
                      <td>
                        <div className="font-monospace text-danger fw-semibold">{m.vehicleNumber}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>Driver: {m.driverName}</div>
                      </td>
                      <td>
                        <strong className="text-warning-emphasis font-monospace">{m.yellowWeight} kg</strong>
                      </td>
                      <td>
                        <strong className="text-danger font-monospace">{m.redWeight} kg</strong>
                      </td>
                      <td>
                        <strong className="text-dark font-monospace">{m.whiteWeight} kg</strong>
                      </td>
                      <td>
                        <strong className="text-primary font-monospace">{m.blueWeight} kg</strong>
                      </td>
                      <td>
                        <strong className="text-success font-monospace fs-6">{m.totalWeight} kg</strong>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm py-1 px-2"
                          onClick={() => setActiveSlipManifest(m)}
                        >
                          <i className="bi bi-printer-fill me-1"></i> Form VI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scan & Weigh Bag Modal */}
      {showLogBagModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-dark text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-upc-scan me-2 text-warning"></i>
                  Scan & Weigh Bio-Medical Waste Bag
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLogBagModal(false)}></button>
              </div>

              <form onSubmit={handleCreateBag}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Generating Ward / Department *</label>
                    <select
                      className="form-select form-select-sm"
                      value={newWard}
                      onChange={(e) => setNewWard(e.target.value)}
                    >
                      <option value="Operation Theatre (OT Suite 1)">Operation Theatre (OT Suite 1)</option>
                      <option value="Operation Theatre (OT Suite 2)">Operation Theatre (OT Suite 2)</option>
                      <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                      <option value="Emergency Trauma Care Center">Emergency Trauma Care Center</option>
                      <option value="General Medicine Ward A">General Medicine Ward A</option>
                      <option value="Nephrology & Dialysis Unit">Nephrology & Dialysis Unit</option>
                      <option value="Pathology & Microbiology Lab">Pathology & Microbiology Lab</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Waste Color Stream *</label>
                    <select
                      className="form-select form-select-sm"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="YELLOW">🟡 Yellow (Anatomical tissues, Soiled linen, Dressings)</option>
                      <option value="RED">🔴 Red (Contaminated plastics, Tubing, Catheters, Gloves)</option>
                      <option value="WHITE">⚪ White Translucent (Sharps, Needles, Scalpels)</option>
                      <option value="BLUE">🔵 Blue (Glass vials, Ampoules, Ortho metallic implants)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Digital Scale Measured Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.05"
                      className="form-control form-control-sm font-monospace"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label small fw-semibold">Sanitation Staff In-Charge</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newStaff}
                      onChange={(e) => setNewStaff(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowLogBagModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark btn-sm fw-bold px-3">
                    <i className="bi bi-tag-fill me-1"></i> Generate Barcode & Store Bag
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch to CBMWTF Facility Modal */}
      {showDispatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-danger text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-truck me-2"></i>
                  Handover Waste Consignment to CBMWTF (Form VI)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDispatchModal(false)}></button>
              </div>

              <form onSubmit={handleCreateDispatch}>
                <div className="modal-body p-3">
                  <div className="p-2 bg-light rounded border mb-3 small">
                    <strong>Pending Consignment:</strong> {pendingBagsCount} Bags • Total Weight: <strong>{totalPendingWeight} kg</strong>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">CBMWTF Operator Agency *</label>
                    <select
                      className="form-select form-select-sm"
                      value={cbmwtfOperator}
                      onChange={(e) => setCbmwtfOperator(e.target.value)}
                    >
                      <option value="Synergy Waste Management Pvt Ltd">Synergy Waste Management Pvt Ltd (Okhla Plant)</option>
                      <option value="Biotic Solutions Bio-Medical Facility">Biotic Solutions Bio-Medical Facility</option>
                      <option value="SMS Envoclean Treatment Center">SMS Envoclean Treatment Center</option>
                    </select>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">GPS Vehicle Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. DL-1L-AA-4012"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Driver / Waste Transporter Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowDispatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm fw-bold px-3">
                    <i className="bi bi-send-check-fill me-1"></i> Confirm Handover & Issue Manifest
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable CPCB Form VI Manifest */}
      {activeSlipManifest && (
        <BmwDailyManifestSlip
          manifest={activeSlipManifest}
          onClose={() => setActiveSlipManifest(null)}
        />
      )}
    </div>
  );
}
