import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import BedService from '../../services/BedService';
import { getHospitalName } from '../../services/hospitalConfig';
import DietaryMealSlip from './DietaryMealSlip';
import { toast } from 'react-toastify';
import '../../styles/clinicalDesksPremium.css';

const INITIAL_MEAL_ORDERS = [
  {
    id: 1,
    orderNumber: 'DIET-2026-101',
    bedNumber: 'GW-101',
    wardName: 'General Medicine Ward A',
    patientName: 'Rahul Sharma',
    patientUhid: 'UHID-101',
    patientAge: 42,
    patientGender: 'Male',
    mealSession: 'Lunch Tray (12:30 PM)',
    dietType: 'Diabetic Diet (Low Glycemic)',
    calories: '1,800 kcal',
    protein: '75g',
    carbs: '175g',
    restrictions: 'No refined sugar, Low salt (< 2g/day)',
    allergies: 'No known allergies',
    status: 'DELIVERED_TO_PATIENT',
    orderDate: '2026-10-30'
  },
  {
    id: 2,
    orderNumber: 'DIET-2026-102',
    bedNumber: 'ICU-02',
    wardName: 'Intensive Care Unit (ICU)',
    patientName: 'Anita Verma',
    patientUhid: 'UHID-102',
    patientAge: 36,
    patientGender: 'Female',
    mealSession: 'Lunch Tray (12:30 PM)',
    dietType: 'Enteral Tube Feed (Ryle\'s Tube)',
    calories: '1,500 kcal',
    protein: '85g',
    carbs: '140g',
    restrictions: 'Strictly sterile blended liquid feed',
    allergies: 'Lactose Intolerant (Soya base formula)',
    status: 'TROLLEY_DISPATCHED',
    orderDate: '2026-10-30'
  },
  {
    id: 3,
    orderNumber: 'DIET-2026-103',
    bedNumber: 'SW-201',
    wardName: 'Surgical Inpatient Wing',
    patientName: 'Vikram Malhotra',
    patientUhid: 'UHID-103',
    patientAge: 58,
    patientGender: 'Male',
    mealSession: 'Lunch Tray (12:30 PM)',
    dietType: 'Post-Op High Protein Soft Diet',
    calories: '2,100 kcal',
    protein: '95g',
    carbs: '220g',
    restrictions: 'Non-spicy, Low fibrous residue',
    allergies: 'Egg allergy',
    status: 'KITCHEN_PREPARING',
    orderDate: '2026-10-30'
  },
  {
    id: 4,
    orderNumber: 'DIET-2026-104',
    bedNumber: 'GW-103',
    wardName: 'General Medicine Ward A',
    patientName: 'Mohammad Farooq',
    patientUhid: 'UHID-104',
    patientAge: 64,
    patientGender: 'Male',
    mealSession: 'Lunch Tray (12:30 PM)',
    dietType: 'Cardiac Diet (Low Sodium & Cholesterol)',
    calories: '1,700 kcal',
    protein: '70g',
    carbs: '180g',
    restrictions: 'Sodium < 1.5g, Zero deep-fried items',
    allergies: 'None',
    status: 'PRESCRIBED',
    orderDate: '2026-10-30'
  }
];

const DIETARY_STORAGE_KEY = 'hospitalsync_dietary_orders_v1';

export default function DietaryPanel() {
  const [mealOrders, setMealOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(DIETARY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MEAL_ORDERS;
    } catch {
      return INITIAL_MEAL_ORDERS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeSlipOrder, setActiveSlipOrder] = useState(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedBedNumber, setSelectedBedNumber] = useState('GW-102');
  const [selectedWard, setSelectedWard] = useState('General Medicine Ward A');
  const [mealSession, setMealSession] = useState('Lunch Tray (12:30 PM)');
  const [dietType, setDietType] = useState('Diabetic Diet (Low Glycemic)');
  const [calories, setCalories] = useState('1,800 kcal');
  const [protein, setProtein] = useState('75g');
  const [carbs, setCarbs] = useState('180g');
  const [restrictions, setRestrictions] = useState('Low Sodium (< 2g/day), Zero sugar');
  const [allergies, setAllergies] = useState('No known food allergies');

  useEffect(() => {
    try {
      localStorage.setItem(DIETARY_STORAGE_KEY, JSON.stringify(mealOrders));
    } catch (e) {
      console.error(e);
    }
  }, [mealOrders]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    BedService.getAllBeds()
      .then(res => setBeds(res.data || []))
      .catch(() => setBeds([]));
  }, []);

  const handleCreateOrder = (e) => {
    e.preventDefault();

    const p = patients.find(pat => String(pat.id) === String(selectedPatientId));
    const pName = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name : 'Inpatient';

    const newOrder = {
      id: Date.now(),
      orderNumber: `DIET-2026-${Math.floor(105 + Math.random() * 50)}`,
      bedNumber: selectedBedNumber,
      wardName: selectedWard,
      patientName: pName,
      patientUhid: p?.uhid || `UHID-${selectedPatientId || 'AUTO'}`,
      patientAge: p?.age || 45,
      patientGender: p?.gender || 'Male',
      mealSession,
      dietType,
      calories,
      protein,
      carbs,
      restrictions,
      allergies,
      status: 'KITCHEN_PREPARING',
      orderDate: new Date().toLocaleDateString('en-IN')
    };

    setMealOrders(prev => [newOrder, ...prev]);
    toast.success(`Therapeutic meal order prescribed for Bed ${selectedBedNumber}!`);
    setShowOrderModal(false);
    setActiveSlipOrder(newOrder);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setMealOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    toast.info(`Meal order updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  const deliveredCount = mealOrders.filter(o => o.status === 'DELIVERED_TO_PATIENT').length;
  const inKitchenCount = mealOrders.filter(o => o.status === 'KITCHEN_PREPARING' || o.status === 'PRESCRIBED').length;
  const dispatchedCount = mealOrders.filter(o => o.status === 'TROLLEY_DISPATCHED').length;

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return mealOrders;
    return mealOrders.filter(o => o.status === filterStatus);
  }, [mealOrders, filterStatus]);

  return (
    <div className="desk-premium-page">

      {/* HERO BANNER */}
      <div className="desk-hero">
        <div className="hero-content">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="hero-icon orange">
                <i className="bi bi-cup-hot-fill"></i>
              </div>
              <div>
                <h4 className="hero-title">
                  Hospital Dietary, Nutrition & Patient Food Management Desk
                </h4>
                <p className="hero-subtitle">
                  {getHospitalName()} &bull; Clinical Therapeutic Dietetics &bull; ISO 22000 Food Safety Standards
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="hero-chip">
                <i className="bi bi-shield-check text-warning"></i>
                ISO 22000 Certified
              </span>
              <span className="hero-chip">
                <i className="bi bi-egg-fried text-warning"></i>
                HACCP Kitchen Standard
              </span>
              <button
                type="button"
                className="premium-btn orange"
                onClick={() => setShowOrderModal(true)}
              >
                <i className="bi bi-plus-circle-fill me-1"></i> Prescribe Diet Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="metric-grid">
        <div className="metric-card metric-orange">
          <div className="metric-icon">
            <i className="bi bi-egg-fried"></i>
          </div>
          <div className="metric-label">Total Inpatient Meals</div>
          <div className="metric-value">{mealOrders.length}</div>
        </div>

        <div className="metric-card metric-purple">
          <div className="metric-icon">
            <i className="bi bi-fire"></i>
          </div>
          <div className="metric-label">Kitchen Preparing</div>
          <div className="metric-value">{inKitchenCount}</div>
        </div>

        <div className="metric-card metric-blue">
          <div className="metric-icon">
            <i className="bi bi-truck"></i>
          </div>
          <div className="metric-label">Trolley Dispatched</div>
          <div className="metric-value">{dispatchedCount}</div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-icon">
            <i className="bi bi-check2-all"></i>
          </div>
          <div className="metric-label">Delivered to Bed</div>
          <div className="metric-value">{deliveredCount}</div>
        </div>
      </div>

      {/* Meals Table (Premium Panel) */}
      <div className="premium-panel">
        <div className="panel-toolbar">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-card-checklist text-warning"></i>
              Inpatient Therapeutic Meal Tray Dispatch Register
            </h6>

            <div className="premium-tabs">
              <button
                type="button"
                className={`premium-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All <span className="tab-count">{mealOrders.length}</span>
              </button>
              <button
                type="button"
                className={`premium-tab ${filterStatus === 'KITCHEN_PREPARING' ? 'active' : ''}`}
                onClick={() => setFilterStatus('KITCHEN_PREPARING')}
              >
                Preparing <span className="tab-count">{inKitchenCount}</span>
              </button>
              <button
                type="button"
                className={`premium-tab ${filterStatus === 'DELIVERED_TO_PATIENT' ? 'active' : ''}`}
                onClick={() => setFilterStatus('DELIVERED_TO_PATIENT')}
              >
                Delivered <span className="tab-count">{deliveredCount}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="premium-table">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Order # / Bed</th>
                  <th>Patient Details</th>
                  <th>Meal Session</th>
                  <th>Diet Category</th>
                  <th>Calories & Macros</th>
                  <th>Special Restrictions</th>
                  <th>Status & Delivery</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredOrders.map(item => {
                  const isDelivered = item.status === 'DELIVERED_TO_PATIENT';

                  return (
                    <tr key={item.id} className={isDelivered ? '' : 'table-warning-subtle'}>
                      <td className="ps-3">
                        <strong className="text-dark font-monospace">{item.orderNumber}</strong>
                        <div className="fw-bold text-danger" style={{ fontSize: '0.8rem' }}>
                          Bed: {item.bedNumber}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{item.wardName}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.patientName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.patientAge}y / {item.patientGender} • {item.patientUhid}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.mealSession}</span>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">{item.dietType}</span>
                      </td>
                      <td>
                        <strong className="text-success font-monospace">{item.calories}</strong>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>P: {item.protein} • C: {item.carbs}</div>
                      </td>
                      <td>
                        <div className="text-truncate text-danger" style={{ maxWidth: '200px', fontSize: '0.75rem' }}>
                          {item.restrictions}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Allergies: {item.allergies}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          isDelivered ? 'bg-success' :
                          item.status === 'TROLLEY_DISPATCHED' ? 'bg-info text-dark' : 'bg-warning text-dark'
                        } px-2 py-1`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>

                        {!isDelivered && (
                          <div className="btn-group btn-group-sm mt-1 d-block">
                            {item.status === 'PRESCRIBED' && (
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm py-0 px-1"
                                style={{ fontSize: '0.68rem' }}
                                onClick={() => handleUpdateStatus(item.id, 'KITCHEN_PREPARING')}
                              >
                                Start Cooking
                              </button>
                            )}
                            {item.status === 'KITCHEN_PREPARING' && (
                              <button
                                type="button"
                                className="btn btn-outline-info btn-sm py-0 px-1"
                                style={{ fontSize: '0.68rem' }}
                                onClick={() => handleUpdateStatus(item.id, 'TROLLEY_DISPATCHED')}
                              >
                                Dispatch Trolley
                              </button>
                            )}
                            {item.status === 'TROLLEY_DISPATCHED' && (
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm py-0 px-1"
                                style={{ fontSize: '0.68rem' }}
                                onClick={() => handleUpdateStatus(item.id, 'DELIVERED_TO_PATIENT')}
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm py-1 px-2"
                          title="Print Bedside Tray Card"
                          onClick={() => setActiveSlipOrder(item)}
                        >
                          <i className="bi bi-printer-fill me-1"></i> Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* Prescribe Diet Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-warning text-dark py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  Prescribe Clinical Therapeutic Diet Order
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
              </div>

              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Select Inpatient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.firstName || ''} {p.lastName || ''} {p.name || ''} (UHID: {p.uhid || p.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Bed / Ward Location *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedBedNumber}
                        onChange={(e) => {
                          setSelectedBedNumber(e.target.value);
                          const b = beds.find(bed => bed.bedNumber === e.target.value);
                          if (b) setSelectedWard(b.ward);
                        }}
                      >
                        <option value="GW-101">GW-101 (General Medicine Ward A)</option>
                        <option value="GW-102">GW-102 (General Medicine Ward A)</option>
                        <option value="ICU-01">ICU-01 (Intensive Care Unit)</option>
                        <option value="ICU-02">ICU-02 (Intensive Care Unit)</option>
                        <option value="SW-201">SW-201 (Surgical Inpatient Wing)</option>
                        {beds.map(b => (
                          <option key={b.id} value={b.bedNumber}>
                            {b.bedNumber} - {b.ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Meal Session</label>
                      <select
                        className="form-select form-select-sm"
                        value={mealSession}
                        onChange={(e) => setMealSession(e.target.value)}
                      >
                        <option value="Morning Breakfast (08:00 AM)">Morning Breakfast (08:00 AM)</option>
                        <option value="Mid-Day Nourishment (10:30 AM)">Mid-Day Nourishment (10:30 AM)</option>
                        <option value="Lunch Tray (12:30 PM)">Lunch Tray (12:30 PM)</option>
                        <option value="Evening High-Tea (05:00 PM)">Evening High-Tea (05:00 PM)</option>
                        <option value="Dinner Tray (07:30 PM)">Dinner Tray (07:30 PM)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Dietary Category *</label>
                      <select
                        className="form-select form-select-sm"
                        value={dietType}
                        onChange={(e) => setDietType(e.target.value)}
                      >
                        <option value="Diabetic Diet (Low Glycemic)">Diabetic Diet (Low Glycemic)</option>
                        <option value="Cardiac Diet (Low Sodium & Fat)">Cardiac Diet (Low Sodium & Fat)</option>
                        <option value="Renal Diet (Low Potassium & Protein)">Renal Diet (Low Potassium & Protein)</option>
                        <option value="Post-Op High-Protein Soft Diet">Post-Op High-Protein Soft Diet</option>
                        <option value="Enteral Tube Feed (Ryle's Tube)">Enteral Tube Feed (Ryle's Tube)</option>
                        <option value="Clear Liquid Diet">Clear Liquid Diet</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Calories (kcal)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Protein (g)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Carbs (g)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Dietary Restrictions & Sodium Limit</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={restrictions}
                        onChange={(e) => setRestrictions(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Known Food Allergies</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowOrderModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark btn-sm fw-bold px-3">
                    <i className="bi bi-send-fill me-1"></i> Submit Diet Order to Kitchen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Tray Card */}
      {activeSlipOrder && (
        <DietaryMealSlip
          mealOrder={activeSlipOrder}
          onClose={() => setActiveSlipOrder(null)}
        />
      )}
    </div>
  );
}
