import React, { useState, useEffect, useMemo } from 'react';
import { getHospitalName } from '../../services/hospitalConfig';
import BiomedicalMaintenanceSlip from './BiomedicalMaintenanceSlip';
import { toast } from 'react-toastify';

const INITIAL_ASSETS = [
  {
    id: 1,
    assetCode: 'BME-VENT-01',
    name: 'Hamilton-C6 Intensive Care Mechanical Ventilator',
    manufacturer: 'Hamilton Medical (Switzerland)',
    model: 'Hamilton-C6 Advanced',
    serialNumber: 'HC6-908124',
    location: 'Intensive Care Unit (ICU)',
    roomBay: 'Bed ICU-01',
    criticality: 'LIFE_SUPPORT',
    contractType: 'Comprehensive CMC (OEM Direct)',
    lastCalibrationDate: '2026-10-15',
    nextPpmDue: '2027-04-15',
    status: 'OPERATIONAL',
    engineerInCharge: 'Er. Rohit Mehra (+91 98110 11223)'
  },
  {
    id: 2,
    assetCode: 'BME-DEFIB-02',
    name: 'Philips HeartStart XL+ Biphasic Defibrillator / Monitor',
    manufacturer: 'Philips Healthcare',
    model: 'HeartStart XL+ AED',
    serialNumber: 'PH-XL-881902',
    location: 'Emergency Trauma Center',
    roomBay: 'Trauma Resuscitation Bay #1',
    criticality: 'LIFE_SUPPORT',
    contractType: 'Comprehensive CMC',
    lastCalibrationDate: '2026-09-20',
    nextPpmDue: '2027-03-20',
    status: 'OPERATIONAL',
    engineerInCharge: 'Er. Rohit Mehra (+91 98110 11223)'
  },
  {
    id: 3,
    assetCode: 'BME-CT-03',
    name: 'Siemens SOMATOM 128-Slice Multi-Detector CT Scanner',
    manufacturer: 'Siemens Healthineers',
    model: 'SOMATOM go.Top 128',
    serialNumber: 'SM-CT-128-5541',
    location: 'Department of Radiology',
    roomBay: 'CT Scan Suite 1',
    criticality: 'HIGH_PRIORITY',
    contractType: 'Comprehensive CMC (Siemens Service)',
    lastCalibrationDate: '2026-06-10',
    nextPpmDue: '2026-12-10',
    status: 'OPERATIONAL',
    engineerInCharge: 'Er. Ankit Verma (+91 98220 22334)'
  },
  {
    id: 4,
    assetCode: 'BME-ANES-04',
    name: 'Dräger Perseus A500 Anesthesia Workstation & Vaporizer',
    manufacturer: 'Dräger Medical',
    model: 'Perseus A500',
    serialNumber: 'DRG-A500-7712',
    location: 'Operation Theatre (OT)',
    roomBay: 'OT Suite 1 (Cardiac Surgery)',
    criticality: 'LIFE_SUPPORT',
    contractType: 'Annual Maintenance Contract (AMC)',
    lastCalibrationDate: '2026-10-05',
    nextPpmDue: '2027-04-05',
    status: 'OPERATIONAL',
    engineerInCharge: 'Er. Rohit Mehra (+91 98110 11223)'
  },
  {
    id: 5,
    assetCode: 'BME-DIAL-05',
    name: 'Fresenius 4008S High-Flux Hemodialysis System',
    manufacturer: 'Fresenius Medical Care',
    model: '4008S Next-Gen',
    serialNumber: 'FMC-4008S-3329',
    location: 'Nephrology & Dialysis Unit',
    roomBay: 'Dialysis Station #3',
    criticality: 'HIGH_PRIORITY',
    contractType: 'Comprehensive CMC',
    lastCalibrationDate: '2026-05-18',
    nextPpmDue: '2026-11-18',
    status: 'UNDER_MAINTENANCE',
    engineerInCharge: 'Er. Ankit Verma (+91 98220 22334)'
  },
  {
    id: 6,
    assetCode: 'BME-CARM-06',
    name: 'GE OEC Elite High-Definition Mobile C-Arm System',
    manufacturer: 'GE Healthcare',
    model: 'OEC Elite CFD',
    serialNumber: 'GE-OEC-99021',
    location: 'Operation Theatre (OT)',
    roomBay: 'OT Suite 2 (Orthopedics)',
    criticality: 'HIGH_PRIORITY',
    contractType: 'Comprehensive CMC',
    lastCalibrationDate: '2026-08-14',
    nextPpmDue: '2027-02-14',
    status: 'OPERATIONAL',
    engineerInCharge: 'Er. Ankit Verma (+91 98220 22334)'
  }
];

const INITIAL_TICKETS = [
  {
    id: 1,
    ticketNumber: 'TKT-2026-441',
    assetCode: 'BME-DIAL-05',
    assetName: 'Fresenius 4008S Hemodialysis System',
    location: 'Dialysis Station #3',
    faultDescription: 'Intermittent ultrafiltration pump pressure alarm during rinse cycle.',
    reportedBy: 'Sister Sunita (Dialysis In-Charge)',
    reportedTime: '2026-10-29 14:30',
    urgency: 'HIGH',
    assignedEngineer: 'Er. Ankit Verma',
    status: 'IN_PROGRESS'
  },
  {
    id: 2,
    ticketNumber: 'TKT-2026-440',
    assetCode: 'BME-VENT-01',
    assetName: 'Hamilton-C6 Intensive Care Ventilator',
    location: 'Bed ICU-01',
    faultDescription: 'Quarterly O2 cell calibration & flow sensor replacement complete.',
    reportedBy: 'Sister Shweta (ICU In-Charge)',
    reportedTime: '2026-10-28 10:15',
    urgency: 'ROUTINE',
    assignedEngineer: 'Er. Rohit Mehra',
    status: 'RESOLVED_TESTED'
  }
];

const BME_STORAGE_KEY = 'hospitalsync_bme_assets_v1';
const BME_TKT_KEY = 'hospitalsync_bme_tickets_v1';

export default function BiomedicalPanel() {
  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem(BME_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(BME_TKT_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeTabSub, setActiveTabSub] = useState('assets');
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeSlipAsset, setActiveSlipAsset] = useState(null);

  // Form State for Ticket Logging
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [faultText, setFaultText] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [urgency, setUrgency] = useState('HIGH');
  const [assignedEng, setAssignedEng] = useState('Er. Rohit Mehra');

  useEffect(() => {
    try {
      localStorage.setItem(BME_STORAGE_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error(e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem(BME_TKT_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !faultText) {
      toast.error('Please select equipment and describe the fault.');
      return;
    }

    const targetAsset = assets.find(a => String(a.id) === String(selectedAssetId));
    if (!targetAsset) return;

    const newTicket = {
      id: Date.now(),
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      assetCode: targetAsset.assetCode,
      assetName: targetAsset.name,
      location: targetAsset.location,
      faultDescription: faultText,
      reportedBy: reportedBy || 'On-Duty Clinical Staff',
      reportedTime: new Date().toLocaleString(),
      urgency,
      assignedEngineer: assignedEng,
      status: 'IN_PROGRESS'
    };

    // Mark asset under maintenance if critical/high
    if (urgency === 'CRITICAL_BREAKDOWN' || urgency === 'HIGH') {
      setAssets(prev => prev.map(a => a.id === targetAsset.id ? { ...a, status: 'UNDER_MAINTENANCE' } : a));
    }

    setTickets(prev => [newTicket, ...prev]);
    toast.warning(`Breakdown Ticket #${newTicket.ticketNumber} logged & dispatched to ${assignedEng}!`);
    setShowLogModal(false);
    setFaultText('');
    setReportedBy('');
    setActiveTabSub('tickets');
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    const t = tickets.find(tk => tk.id === ticketId);
    if (!t) return;

    setTickets(prev => prev.map(tk => {
      if (tk.id === ticketId) {
        return { ...tk, status: newStatus };
      }
      return tk;
    }));

    if (newStatus === 'RESOLVED_TESTED') {
      setAssets(prev => prev.map(a => a.assetCode === t.assetCode ? { ...a, status: 'OPERATIONAL' } : a));
      toast.success(`Equipment ${t.assetCode} certified repaired and back in clinical service.`);
    }
  };

  const operationalCount = assets.filter(a => a.status === 'OPERATIONAL').length;
  const maintenanceCount = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
  const lifeSupportCount = assets.filter(a => a.criticality === 'LIFE_SUPPORT').length;

  const filteredAssets = useMemo(() => {
    if (filterStatus === 'ALL') return assets;
    return assets.filter(a => a.status === filterStatus);
  }, [assets, filterStatus]);

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-tools text-warning-emphasis me-2 fs-2"></i>
            Biomedical Engineering & Hospital Asset Maintenance Desk
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • NABH FMS Standard Equipment Calibration • IEC 62353 Safety Management
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-warning text-dark btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowLogModal(true)}
          >
            <i className="bi bi-exclamation-triangle-fill me-1"></i> Log Breakdown Ticket
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Biomedical Assets</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-primary">{assets.length}</h3>
                <i className="bi bi-cpu fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">Ventilators, Defibrillators, CT, Anesthesia</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-danger border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Life Support Devices</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-danger">{lifeSupportCount}</h3>
                <i className="bi bi-heart-pulse-fill fs-1 text-danger opacity-25"></i>
              </div>
              <small className="text-muted">High-priority critical clinical systems</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Operational & Calibrated</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-success">{operationalCount}</h3>
                <i className="bi bi-check-circle-fill fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">Electrical safety test passed (100%)</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Under Repair / Tickets</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{maintenanceCount}</h3>
                <i className="bi bi-wrench-adjustable fs-1 text-warning opacity-50"></i>
              </div>
              <small className="text-muted">Active BME engineering tickets</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTabSub === 'assets' ? 'active bg-dark text-white' : 'text-dark'}`}
            onClick={() => setActiveTabSub('assets')}
          >
            <i className="bi bi-grid-fill me-1"></i> Medical Equipment Inventory ({assets.length})
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTabSub === 'tickets' ? 'active bg-warning text-dark' : 'text-dark'}`}
            onClick={() => setActiveTabSub('tickets')}
          >
            <i className="bi bi-card-checklist me-1"></i> Breakdown Complaints & Service Tickets ({tickets.length})
          </button>
        </li>
      </ul>

      {/* View: Assets Inventory Grid */}
      {activeTabSub === 'assets' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-shield-check text-success me-2"></i>
              NABH Bio-Medical Asset Registry & Calibration Status
            </h5>

            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({assets.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'OPERATIONAL' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('OPERATIONAL')}
              >
                Operational ({operationalCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'UNDER_MAINTENANCE' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('UNDER_MAINTENANCE')}
              >
                In Maintenance ({maintenanceCount})
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Asset Code / S/N</th>
                    <th>Equipment Name & Model</th>
                    <th>Location / Room</th>
                    <th>Criticality</th>
                    <th>Last Calibration</th>
                    <th>Next Due (PPM)</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {filteredAssets.map(item => {
                    const isOperational = item.status === 'OPERATIONAL';

                    return (
                      <tr key={item.id} className={!isOperational ? 'table-warning-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-dark font-monospace">{item.assetCode}</strong>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>{item.serialNumber}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.manufacturer} • {item.model}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-primary">{item.location}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.roomBay}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.criticality === 'LIFE_SUPPORT' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {item.criticality?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="text-dark">{item.lastCalibrationDate}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-danger font-monospace">{item.nextPpmDue}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            isOperational ? 'bg-success' : 'bg-warning text-dark'
                          } px-2 py-1`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm py-1 px-2"
                            title="Print Electrical Safety & Calibration Certificate"
                            onClick={() => setActiveSlipAsset(item)}
                          >
                            <i className="bi bi-printer-fill me-1"></i> Cert
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
      )}

      {/* View: Breakdown Tickets Table */}
      {activeTabSub === 'tickets' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-wrench text-danger me-2"></i>
              Active Breakdown Maintenance & Service Tickets
            </h5>
            <button
              type="button"
              className="btn btn-outline-warning text-dark btn-sm fw-bold"
              onClick={() => setShowLogModal(true)}
            >
              <i className="bi bi-plus-circle me-1"></i> New Ticket
            </button>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Ticket # / Time</th>
                    <th>Equipment / Location</th>
                    <th>Reported Fault</th>
                    <th>Reported By</th>
                    <th>Urgency</th>
                    <th>Assigned BME Engineer</th>
                    <th>Status & Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {tickets.map(t => {
                    const isResolved = t.status === 'RESOLVED_TESTED';

                    return (
                      <tr key={t.id} className={!isResolved ? 'table-warning-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-danger font-monospace">{t.ticketNumber}</strong>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{t.reportedTime}</div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{t.assetCode}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.assetName}</div>
                          <div className="text-primary" style={{ fontSize: '0.75rem' }}>{t.location}</div>
                        </td>
                        <td>
                          <div className="text-dark fw-semibold">{t.faultDescription}</div>
                        </td>
                        <td>
                          <div className="text-dark">{t.reportedBy}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            t.urgency === 'CRITICAL_BREAKDOWN' ? 'bg-danger' :
                            t.urgency === 'HIGH' ? 'bg-warning text-dark' : 'bg-secondary'
                          }`}>
                            {t.urgency?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{t.assignedEngineer}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Biomedical Specialist</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            isResolved ? 'bg-success' : 'bg-warning text-dark'
                          } px-2 py-1`}>
                            {t.status.replace(/_/g, ' ')}
                          </span>

                          {!isResolved && (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm py-0 px-2 d-block mt-1"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => handleUpdateTicketStatus(t.id, 'RESOLVED_TESTED')}
                            >
                              <i className="bi bi-check-lg me-1"></i> Certify Repaired
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Log Breakdown Ticket Modal */}
      {showLogModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-warning text-dark py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Log Bio-Medical Equipment Breakdown Ticket
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowLogModal(false)}></button>
              </div>

              <form onSubmit={handleCreateTicket}>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Select Malfunctioning Equipment *</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Equipment Asset --</option>
                      {assets.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.assetCode} - {a.name} ({a.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Breakdown Urgency Priority *</label>
                    <select
                      className="form-select form-select-sm"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="CRITICAL_BREAKDOWN">🚨 Critical Breakdown (Device Offline during Patient Care)</option>
                      <option value="HIGH">⚠️ High Priority (Backup system needed)</option>
                      <option value="ROUTINE">🟢 Routine / Calibration / Preventive Notice</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Specific Fault / Error Code Reported *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="e.g. Pressure sensor fault code E-22, display flicker, battery not charging..."
                      value={faultText}
                      onChange={(e) => setFaultText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Reporting Staff / Nurse</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Sister In-Charge / Doctor"
                        value={reportedBy}
                        onChange={(e) => setReportedBy(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assign BME Engineer</label>
                      <select
                        className="form-select form-select-sm"
                        value={assignedEng}
                        onChange={(e) => setAssignedEng(e.target.value)}
                      >
                        <option value="Er. Rohit Mehra">Er. Rohit Mehra (Lead BME)</option>
                        <option value="Er. Ankit Verma">Er. Ankit Verma (Imaging & Dialysis)</option>
                        <option value="OEM Authorized Technician">OEM Authorized Technician (Direct)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowLogModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark btn-sm fw-bold px-3">
                    <i className="bi bi-send-check-fill me-1"></i> Dispatch Ticket to BME
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Calibration Certificate */}
      {activeSlipAsset && (
        <BiomedicalMaintenanceSlip
          asset={activeSlipAsset}
          onClose={() => setActiveSlipAsset(null)}
        />
      )}
    </div>
  );
}
