import React from 'react';
import { getHospitalName } from '../../services/hospitalConfig';

export default function DietaryMealSlip({ mealOrder, onClose }) {
  if (!mealOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-warning text-dark py-2 no-print">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-cup-hot-fill me-2"></i>
              NABH Clinical Nutrition & Inpatient Meal Tray Card — Bed #{mealOrder.bedNumber}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white" id="dietary-print-slip">
            {/* Header */}
            <div className="border-bottom pb-3 mb-3 text-center position-relative">
              <div className="badge bg-warning text-dark text-uppercase px-3 py-1 mb-2 fw-semibold tracking-wide">
                Department of Clinical Nutrition & Therapeutic Dietetics
              </div>
              <h4 className="fw-bold text-dark mb-0">{getHospitalName()}</h4>
              <p className="text-muted small mb-1">NABH Food Safety & Therapeutic Diet Standards • ISO 22000 Certified Kitchen</p>
              <div className="small fw-semibold text-danger">
                Therapeutic Inpatient Meal Tray Card & Nutritionist Clearance Manifest
              </div>
            </div>

            {/* Inpatient & Bed Grid */}
            <div className="row g-2 mb-3 bg-light p-3 rounded border">
              <div className="col-md-3">
                <span className="text-muted small d-block">Bed / Ward Location:</span>
                <span className="fw-bold text-danger fs-6">{mealOrder.bedNumber} ({mealOrder.wardName || 'Inpatient Wing'})</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Patient Name / UHID:</span>
                <span className="fw-bold text-dark">{mealOrder.patientName}</span>
                <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{mealOrder.patientUhid || 'UHID-9081'}</div>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Age / Gender:</span>
                <span className="fw-semibold text-dark">{mealOrder.patientAge || '45'} Yrs / {mealOrder.patientGender || 'Male'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-muted small d-block">Meal Session / Date:</span>
                <span className="fw-bold text-primary">{mealOrder.mealSession || 'Lunch Tray'}</span>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{mealOrder.orderDate || new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Prescribed Therapeutic Diet */}
            <div className="card mb-3 border-warning-subtle">
              <div className="card-header bg-warning-subtle text-dark fw-bold py-1 small d-flex justify-content-between align-items-center">
                <span><i className="bi bi-egg-fried me-1"></i> THERAPEUTIC DIET CATEGORY & MACRO TARGETS</span>
                <span className="badge bg-dark">{mealOrder.dietType}</span>
              </div>
              <div className="card-body p-3">
                <div className="row g-2 small">
                  <div className="col-md-3">
                    <span className="text-muted d-block">Calorie Target:</span>
                    <strong className="text-success font-monospace fs-6">{mealOrder.calories || '1,800 kcal/day'}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Protein Target:</span>
                    <strong className="text-primary font-monospace fs-6">{mealOrder.protein || '75g (High Protein)'}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Carbohydrates / Glycemic:</span>
                    <strong className="text-dark font-monospace">{mealOrder.carbs || '180g (Complex Carbs)'}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block">Sodium / Fluid Restriction:</span>
                    <strong className="text-danger font-monospace">{mealOrder.restrictions || 'Low Sodium (< 2g/day)'}</strong>
                  </div>

                  <div className="col-12 mt-2 pt-2 border-top">
                    <span className="text-muted d-block">Allergies & Clinical Contraindications:</span>
                    <strong className="text-danger">{mealOrder.allergies || 'No Known Food Allergies (Lactose Tolerant)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Menu Tray Details */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-card-checklist me-1 text-primary"></i> PRESCRIBED MEAL TRAY ITEMS
              </div>
              <div className="card-body p-2">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Tray Item</th>
                      <th>Portion Size</th>
                      <th>Nutritional Spec</th>
                      <th>Dietary Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Steamed Brown Rice / Phulka Roti</td>
                      <td>2 Pieces / 1 Cup</td>
                      <td>Complex fiber, Low Glycemic</td>
                      <td>Freshly prepared, zero refined flour</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Moong Dal / Soya Paneer Gravy</td>
                      <td>150 ml katori</td>
                      <td>High biological value protein</td>
                      <td>No added oil tadka, low sodium salt</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Steamed Greens (Spinach & Beans)</td>
                      <td>100 grams</td>
                      <td>Micronutrients & Potassium verified</td>
                      <td>Steamed & pureed for easy mastication</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Probiotic Low-Fat Curd / Yogurt</td>
                      <td>100 ml sealed cup</td>
                      <td>Gut flora & digestible calcium</td>
                      <td>Unsweetened fresh culture</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kitchen Hygiene & Temperature Certification */}
            <div className="card mb-3 border-secondary-subtle">
              <div className="card-header bg-light text-dark fw-bold py-1 small">
                <i className="bi bi-thermometer-sun me-1 text-success"></i> HACCP FOOD SAFETY & TEMPERATURE DISPATCH LOG
              </div>
              <div className="card-body p-2">
                <div className="row g-2 text-center small">
                  <div className="col-4">
                    <div className="p-1 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>COOKING CORE TEMP</span>
                      <strong className="text-success font-monospace">&gt; 75.0 °C (Pathogen Free)</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-1 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>TROLLEY DISPATCH TEMP</span>
                      <strong className="text-primary font-monospace">64.5 °C (Insulated Hot Box)</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-1 border rounded bg-light">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>KITCHEN HYGIENE AUDIT</span>
                      <strong className="text-success font-monospace">HACCP GRADE-A PASS</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="row text-center pt-4 mt-3 border-top">
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">DIETITIAN SIGN</span>
                </div>
                <small className="fw-bold text-dark d-block">Dt. Pooja Menon, M.Sc</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Chief Clinical Nutritionist</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">EXECUTIVE CHEF</span>
                </div>
                <small className="fw-semibold text-dark d-block">Chef Ramesh Negi</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Hospital Kitchen In-Charge</small>
              </div>
              <div className="col-4">
                <div className="border-bottom pb-4 mb-1 text-muted" style={{ borderStyle: 'dashed' }}>
                  <span className="badge bg-light text-dark border">WARD NURSE ACK</span>
                </div>
                <small className="fw-semibold text-dark d-block">Bedside Nursing Staff</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Meal Received & Delivered</small>
              </div>
            </div>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.7rem' }}>
              * Generated electronically by HospitalSync Dietary Automation Suite. FSSAI & NABH Compliant.
            </div>
          </div>

          <div className="modal-footer bg-light py-2 no-print">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Close
            </button>
            <button type="button" className="btn btn-warning text-dark btn-sm fw-bold" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print Bedside Meal Tray Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
