import React, { useState, useMemo } from 'react';
import PrintModal from '../common/PrintModal';
import BloodCrossMatchSlip from './BloodCrossMatchSlip';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import { toast } from 'react-toastify';

const INITIAL_BLOOD_STOCK = [
  { group: 'A +ve', prbc: 18, ffp: 12, platelets: 8, total: 38, status: 'NORMAL' },
  { group: 'A -ve', prbc: 4, ffp: 3, platelets: 2, total: 9, status: 'LOW' },
  { group: 'B +ve', prbc: 24, ffp: 16, platelets: 14, total: 54, status: 'NORMAL' },
  { group: 'B -ve', prbc: 3, ffp: 2, platelets: 1, total: 6, status: 'LOW' },
  { group: 'O +ve', prbc: 32, ffp: 20, platelets: 15, total: 67, status: 'NORMAL' },
  { group: 'O -ve', prbc: 2, ffp: 1, platelets: 1, total: 4, status: 'CRITICAL' },
  { group: 'AB +ve', prbc: 11, ffp: 8, platelets: 6, total: 25, status: 'NORMAL' },
  { group: 'AB -ve', prbc: 1, ffp: 1, platelets: 0, total: 2, status: 'CRITICAL' }
];

const INITIAL_REQUISITIONS = [
  {
    id: 801,
    patientId: 1,
    patientName: 'Rahul Sharma',
    uhid: 'MRN-2026-0001',
    bloodGroup: 'B +ve',
    component: 'PRBC (Packed Red Cells)',
    units: 2,
    wardBed: 'OT-3 / Laparoscopic Surgery',
    urgency: 'URGENT',
    doctorName: 'Dr. Sharma',
    indication: 'Intra-operative hemorrhage standby',
    status: 'COMPATIBLE_VERIFIED',
    bagNumber: 'BAG-2026-9481',
    date: '2026-10-30T10:15:00'
  },
  {
    id: 802,
    patientId: 2,
    patientName: 'John Doe',
    uhid: 'MRN-2026-0002',
    bloodGroup: 'O +ve',
    component: 'Platelet Concentrates (RDP)',
    units: 4,
    wardBed: 'GW-102 / Medical Ward',
    urgency: 'ROUTINE',
    doctorName: 'Dr. Vikram Patel',
    indication: 'Thrombocytopenia platelet transfusion',
    status: 'PENDING_CROSSMATCH',
    bagNumber: 'BAG-2026-9482',
    date: '2026-10-30T10:45:00'
  },
  {
    id: 803,
    patientId: 3,
    patientName: 'Robert Langdon',
    uhid: 'MRN-2026-0003',
    bloodGroup: 'O -ve',
    component: 'PRBC (Packed Red Cells)',
    units: 2,
    wardBed: 'ICU-01 (Intensive Care)',
    urgency: 'CRITICAL_STAT',
    doctorName: 'Dr. House',
    indication: 'Acute post-trauma severe hemorrhagic shock',
    status: 'DISPATCHED_TO_WARD',
    bagNumber: 'BAG-2026-9483',
    date: '2026-10-30T09:30:00'
  }
];

function BloodBankPanel({ role = 'ADMIN', patients = [], doctors = [], searchQuery = '', darkMode = false }) {
  const hospitalName = getHospitalName();
  const isPatient = role === 'PATIENT';

  const [bloodStock, setBloodStock] = useState(() => {
    const saved = localStorage.getItem('hospitalsync_blood_stock');
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_STOCK;
  });

  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('hospitalsync_blood_requisitions');
    return saved ? JSON.parse(saved) : INITIAL_REQUISITIONS;
  });

  const [activeTab, setActiveTab] = useState('inventory'); // inventory | requisitions | donors
  const [showReqModal, setShowReqModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [activePrintSlip, setActivePrintSlip] = useState(null);

  // New Requisition Form State
  const [reqForm, setReqForm] = useState({
    patientId: patients[0]?.id ? String(patients[0].id) : '1',
    patientName: patients[0]?.name || 'Rahul Sharma',
    bloodGroup: 'B +ve',
    component: 'PRBC (Packed Red Cells)',
    units: 1,
    wardBed: 'ICU-01 / Emergency Bed',
    urgency: 'URGENT',
    doctorName: doctors[0]?.name || 'Dr. Sharma',
    indication: 'Pre-operative surgery blood reserve'
  });

  // Donor Intake Form State
  const [donorForm, setDonorForm] = useState({
    donorName: '',
    donorAge: '28',
    donorGender: 'Male',
    donorPhone: '',
    bloodGroup: 'O +ve',
    hemoglobin: '14.2',
    units: 1,
    weight: '68'
  });

  const saveStock = (updated) => {
    setBloodStock(updated);
    localStorage.setItem('hospitalsync_blood_stock', JSON.stringify(updated));
  };

  const saveRequisitions = (updated) => {
    setRequisitions(updated);
    localStorage.setItem('hospitalsync_blood_requisitions', JSON.stringify(updated));
  };

  // Status progression
  const handleUpdateRequisitionStatus = (reqId, newStatus) => {
    const target = requisitions.find(r => r.id === reqId);
    if (!target) return;

    // Deduct stock if dispatched
    if (newStatus === 'DISPATCHED_TO_WARD' && target.status !== 'DISPATCHED_TO_WARD') {
      const stockUpdated = bloodStock.map(b => {
        if (b.group === target.bloodGroup) {
          const newPrbc = Math.max(0, b.prbc - Number(target.units || 1));
          const newTotal = newPrbc + b.ffp + b.platelets;
          return {
            ...b,
            prbc: newPrbc,
            total: newTotal,
            status: newTotal < 5 ? (newTotal < 2 ? 'CRITICAL' : 'LOW') : 'NORMAL'
          };
        }
        return b;
      });
      saveStock(stockUpdated);
    }

    const updated = requisitions.map(r => r.id === reqId ? { ...r, status: newStatus } : r);
    saveRequisitions(updated);

    playHospitalAlertChime();
    RealtimeNotificationHub.publishNotification({
      type: 'BLOOD_BANK_ALERT',
      title: `Blood Bank: ${target.bloodGroup} ${target.component}`,
      message: `Requisition for ${target.patientName} (${target.wardBed}) updated to ${newStatus.replace(/_/g, ' ')}.`,
      targetRoles: ['ADMIN', 'DOCTOR', 'NURSE'],
      patientName: target.patientName
    });

    toast.info(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  // Submit Requisition
  const handleRequisitionSubmit = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => String(p.id) === String(reqForm.patientId));
    const newReq = {
      id: Date.now(),
      ...reqForm,
      patientName: patientObj ? patientObj.name : reqForm.patientName,
      uhid: `MRN-2026-${String(reqForm.patientId).padStart(4, '0')}`,
      status: reqForm.urgency === 'CRITICAL_STAT' ? 'COMPATIBLE_VERIFIED' : 'PENDING_CROSSMATCH',
      bagNumber: `BAG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString()
    };

    const updated = [newReq, ...requisitions];
    saveRequisitions(updated);
    setShowReqModal(false);

    playHospitalAlertChime();
    RealtimeNotificationHub.publishNotification({
      type: 'BLOOD_REQUISITION',
      title: `${newReq.urgency}: Blood Requisition for ${newReq.patientName}`,
      message: `Urgent requisition of ${newReq.units} unit(s) ${newReq.bloodGroup} ${newReq.component} for ${newReq.wardBed}.`,
      targetRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'],
      patientName: newReq.patientName
    });

    toast.success(`Blood requisition submitted for ${newReq.patientName}!`);
  };

  // Submit Donor Registration
  const handleDonorSubmit = (e) => {
    e.preventDefault();
    if (!donorForm.donorName.trim()) {
      toast.warning('Please enter donor name.');
      return;
    }

    // Add 1 unit PRBC to blood stock
    const stockUpdated = bloodStock.map(b => {
      if (b.group === donorForm.bloodGroup) {
        const newPrbc = b.prbc + Number(donorForm.units || 1);
        const newTotal = newPrbc + b.ffp + b.platelets;
        return {
          ...b,
          prbc: newPrbc,
          total: newTotal,
          status: newTotal < 5 ? (newTotal < 2 ? 'CRITICAL' : 'LOW') : 'NORMAL'
        };
      }
      return b;
    });

    saveStock(stockUpdated);
    setShowDonorModal(false);
    setDonorForm({
      donorName: '',
      donorAge: '28',
      donorGender: 'Male',
      donorPhone: '',
      bloodGroup: 'O +ve',
      hemoglobin: '14.2',
      units: 1,
      weight: '68'
    });

    playHospitalAlertChime();
    toast.success(`Donation registered! 1 unit of ${donorForm.bloodGroup} added to inventory stock.`);
  };

  const totalInventoryUnits = useMemo(() => {
    return bloodStock.reduce((acc, curr) => acc + curr.total, 0);
  }, [bloodStock]);

  const criticalShortageCount = useMemo(() => {
    return bloodStock.filter(b => b.status === 'CRITICAL' || b.status === 'LOW').length;
  }, [bloodStock]);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL_STAT':
        return <span className="badge bg-danger text-white px-2 py-1"><i className="bi bi-exclamation-octagon-fill me-1"></i>CRITICAL STAT</span>;
      case 'URGENT':
        return <span className="badge bg-warning text-dark px-2 py-1"><i className="bi bi-alarm-fill me-1"></i>URGENT</span>;
      default:
        return <span className="badge bg-secondary text-white px-2 py-1">ROUTINE</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_CROSSMATCH':
        return <span className="badge bg-warning text-dark px-2 py-1"><i className="bi bi-hourglass-split me-1"></i>Cross-Match Pending</span>;
      case 'COMPATIBLE_VERIFIED':
        return <span className="badge bg-success text-white px-2 py-1"><i className="bi bi-check-circle-fill me-1"></i>Compatible Verified</span>;
      case 'DISPATCHED_TO_WARD':
        return <span className="badge bg-info text-dark px-2 py-1"><i className="bi bi-send-fill me-1"></i>Dispatched to Bed</span>;
      case 'TRANSFUSED':
        return <span className="badge bg-primary text-white px-2 py-1"><i className="bi bi-heart-pulse-fill me-1"></i>Transfused</span>;
      default:
        return <span className="badge bg-secondary text-white px-2 py-1">{status}</span>;
    }
  };

  return (
    <div className="bloodbank-panel p-3 p-md-4" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-danger text-white p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
            <i className="bi bi-droplet-fill fs-4"></i>
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              Central Blood Bank & Transfusion Registry
            </h4>
            <p className="text-muted small mb-0">
              {hospitalName} &bull; State Council Licensed &bull; NABH Blood Bank Certified
            </p>
          </div>
        </div>

        {!isPatient && (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-xs"
              onClick={() => setShowDonorModal(true)}
            >
              <i className="bi bi-heart-fill text-danger"></i>
              Register Blood Donor
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
              onClick={() => setShowReqModal(true)}
            >
              <i className="bi bi-plus-circle-fill"></i>
              Emergency Blood Requisition
            </button>
          </div>
        )}
      </div>

      {/* METRICS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>TOTAL UNITS IN VAULT</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-danger">{totalInventoryUnits}</span>
              <span className="text-muted small">Bags Available</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>LOW / CRITICAL GROUPS</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-warning text-dark">{criticalShortageCount}</span>
              <span className="text-muted small">Groups Short</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>ACTIVE REQUISITIONS</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-primary">{requisitions.filter(r => r.status !== 'TRANSFUSED').length}</span>
              <span className="text-muted small">Pending Transfusion</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>COMPATIBLE VERIFIED</div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-success">{requisitions.filter(r => r.status === 'COMPATIBLE_VERIFIED' || r.status === 'DISPATCHED_TO_WARD').length}</span>
              <span className="text-muted small">Ready for Patient</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOOD GROUP INVENTORY GRID */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-grid-3x3 text-danger"></i> Blood Group Cold Vault Inventory
          </h6>
          <span className="text-muted small">Storage at 2°C - 6°C &bull; Dual Monitored</span>
        </div>

        <div className="row g-3">
          {bloodStock.map((b) => {
            const isCritical = b.status === 'CRITICAL';
            const isLow = b.status === 'LOW';

            return (
              <div key={b.group} className="col-6 col-md-4 col-xl-3">
                <div
                  className="p-3 rounded-4 bg-white border shadow-sm h-100 transition-all"
                  style={{
                    borderColor: isCritical ? '#f43f5e' : isLow ? '#f59e0b' : '#e2e8f0',
                    borderWidth: isCritical ? '2px' : '1px'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-danger fs-6 fw-bold px-2 py-1">{b.group}</span>
                    {isCritical ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger fw-bold" style={{ fontSize: '10px' }}>
                        CRITICAL SHORTAGE
                      </span>
                    ) : isLow ? (
                      <span className="badge bg-warning-subtle text-warning border border-warning fw-bold text-dark" style={{ fontSize: '10px' }}>
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success fw-bold" style={{ fontSize: '10px' }}>
                        IN STOCK
                      </span>
                    )}
                  </div>

                  <div className="display-6 fw-bold text-dark mb-1">{b.total} <span className="fs-6 text-muted fw-normal">Units</span></div>

                  <div className="bg-light p-2 rounded-2 mt-2" style={{ fontSize: '11px' }}>
                    <div className="d-flex justify-content-between text-muted">
                      <span>PRBC (Red Cells):</span>
                      <strong className="text-dark">{b.prbc}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-1">
                      <span>FFP (Plasma):</span>
                      <strong className="text-dark">{b.ffp}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-1">
                      <span>Platelets:</span>
                      <strong className="text-dark">{b.platelets}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REQUISITIONS & TRANSFUSION ROSTER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i> Patient Blood Requisitions & Transfusion Queue
            </h6>
            <span className="text-muted small">Cross-Match Verification Active</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '20%' }}>Recipient Patient</th>
                <th style={{ width: '15%' }}>Required Units</th>
                <th style={{ width: '18%' }}>Ward / Bed Location</th>
                <th style={{ width: '14%' }}>Urgency</th>
                <th style={{ width: '15%' }} className="text-center">Cross-Match Status</th>
                <th style={{ width: '18%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No active blood requisitions in queue.
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="fw-bold text-dark">{req.patientName}</div>
                      <div className="text-muted small" style={{ fontSize: '11px' }}>
                        {req.uhid} &bull; Group: <strong className="text-danger">{req.bloodGroup}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{req.units} Unit(s)</div>
                      <div className="text-muted small" style={{ fontSize: '11px' }}>{req.component}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{req.wardBed}</div>
                      <div className="text-muted small" style={{ fontSize: '11px' }}>Attending: {formatDoctorName(req.doctorName)}</div>
                    </td>
                    <td>
                      {getUrgencyBadge(req.urgency)}
                    </td>
                    <td className="text-center">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1 flex-wrap">
                        {/* Print Cross-Match Certificate */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-1 px-2 fw-semibold"
                          style={{ fontSize: '11px', borderRadius: '6px' }}
                          title="Print Blood Compatibility Slip"
                          onClick={() => setActivePrintSlip(req)}
                        >
                          <i className="bi bi-printer me-1"></i> Cert
                        </button>

                        {/* Progression Actions */}
                        {!isPatient && (
                          <>
                            {req.status === 'PENDING_CROSSMATCH' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleUpdateRequisitionStatus(req.id, 'COMPATIBLE_VERIFIED')}
                              >
                                Verify Match
                              </button>
                            )}
                            {req.status === 'COMPATIBLE_VERIFIED' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-info text-dark py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleUpdateRequisitionStatus(req.id, 'DISPATCHED_TO_WARD')}
                              >
                                Dispatch Bag
                              </button>
                            )}
                            {req.status === 'DISPATCHED_TO_WARD' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary py-1 px-2 fw-semibold"
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => handleUpdateRequisitionStatus(req.id, 'TRANSFUSED')}
                              >
                                Transfused
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMERGENCY REQUISITION MODAL */}
      {showReqModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-danger text-white border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-droplet-fill fs-5"></i>
                  <h5 className="modal-title fw-bold mb-0">Emergency Blood Requisition</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReqModal(false)}></button>
              </div>
              <form onSubmit={handleRequisitionSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-bold text-dark">Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={reqForm.patientId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const found = patients.find(p => String(p.id) === String(pId));
                          setReqForm({
                            ...reqForm,
                            patientId: pId,
                            patientName: found ? found.name : reqForm.patientName
                          });
                        }}
                        required
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.phone || `ID: ${p.id}`})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-bold text-dark">Blood Group *</label>
                      <select
                        className="form-select form-select-sm"
                        value={reqForm.bloodGroup}
                        onChange={(e) => setReqForm({ ...reqForm, bloodGroup: e.target.value })}
                        required
                      >
                        {['A +ve', 'A -ve', 'B +ve', 'B -ve', 'O +ve', 'O -ve', 'AB +ve', 'AB -ve'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Component</label>
                      <select
                        className="form-select form-select-sm"
                        value={reqForm.component}
                        onChange={(e) => setReqForm({ ...reqForm, component: e.target.value })}
                      >
                        <option value="PRBC (Packed Red Cells)">PRBC (Packed Red Cells)</option>
                        <option value="FFP (Fresh Frozen Plasma)">FFP (Fresh Frozen Plasma)</option>
                        <option value="Platelet Concentrates (RDP)">Platelet Concentrates (RDP)</option>
                        <option value="Cryoprecipitate">Cryoprecipitate</option>
                        <option value="Whole Blood">Whole Blood</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-bold text-dark">Units</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control form-control-sm"
                        value={reqForm.units}
                        onChange={(e) => setReqForm({ ...reqForm, units: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-bold text-dark">Urgency</label>
                      <select
                        className="form-select form-select-sm"
                        value={reqForm.urgency}
                        onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                      >
                        <option value="CRITICAL_STAT">CRITICAL STAT</option>
                        <option value="URGENT">URGENT</option>
                        <option value="ROUTINE">ROUTINE</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Ward / Bed Location</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. ICU-01, OT-1, EM-02"
                        value={reqForm.wardBed}
                        onChange={(e) => setReqForm({ ...reqForm, wardBed: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark">Ordering Doctor</label>
                      <select
                        className="form-select form-select-sm"
                        value={reqForm.doctorName}
                        onChange={(e) => setReqForm({ ...reqForm, doctorName: e.target.value })}
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.name}>{formatDoctorName(d.name)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark">Clinical Indication</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={reqForm.indication}
                        onChange={(e) => setReqForm({ ...reqForm, indication: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReqModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm px-4 fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-send-fill"></i> Dispatch Requisition to Blood Bank
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DONOR REGISTRATION MODAL */}
      {showDonorModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-danger text-white border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-heart-fill fs-5"></i>
                  <h5 className="modal-title fw-bold mb-0">Voluntary Blood Donor Registration</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDonorModal(false)}></button>
              </div>
              <form onSubmit={handleDonorSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-bold text-dark">Donor Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Aman Gupta"
                        value={donorForm.donorName}
                        onChange={(e) => setDonorForm({ ...donorForm, donorName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-bold text-dark">Blood Group *</label>
                      <select
                        className="form-select form-select-sm"
                        value={donorForm.bloodGroup}
                        onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                      >
                        {['A +ve', 'A -ve', 'B +ve', 'B -ve', 'O +ve', 'O -ve', 'AB +ve', 'AB -ve'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-bold text-dark">Age (Yrs)</label>
                      <input
                        type="number"
                        min="18"
                        max="65"
                        className="form-control form-control-sm"
                        value={donorForm.donorAge}
                        onChange={(e) => setDonorForm({ ...donorForm, donorAge: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-bold text-dark">Weight (Kg)</label>
                      <input
                        type="number"
                        min="45"
                        className="form-control form-control-sm"
                        value={donorForm.weight}
                        onChange={(e) => setDonorForm({ ...donorForm, weight: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Hemoglobin (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="12.5"
                        className="form-control form-control-sm"
                        value={donorForm.hemoglobin}
                        onChange={(e) => setDonorForm({ ...donorForm, hemoglobin: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-bold text-dark">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="+91 98765 43210"
                        value={donorForm.donorPhone}
                        onChange={(e) => setDonorForm({ ...donorForm, donorPhone: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark">Units Donated</label>
                      <input
                        type="number"
                        min="1"
                        max="2"
                        className="form-control form-control-sm"
                        value={donorForm.units}
                        onChange={(e) => setDonorForm({ ...donorForm, units: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDonorModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm px-4 fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-heart-fill"></i> Complete Donation & Credit Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PRINT CROSS-MATCH COMPATIBILITY SLIP MODAL */}
      {activePrintSlip && (
        <PrintModal
          title={`Blood Compatibility Certificate - ${activePrintSlip.patientName}`}
          onClose={() => setActivePrintSlip(null)}
        >
          <BloodCrossMatchSlip
            requisition={activePrintSlip}
            patient={patients.find(p => String(p.id) === String(activePrintSlip.patientId))}
          />
        </PrintModal>
      )}

    </div>
  );
}

export default BloodBankPanel;
