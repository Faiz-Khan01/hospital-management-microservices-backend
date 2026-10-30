import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import DoctorService from '../../services/DoctorService';
import BillingService from '../../services/BillingService';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import TpaClaimSettlementSlip from './TpaClaimSettlementSlip';
import { toast } from 'react-toastify';

const INITIAL_INSURANCE_PROVIDERS = [
  { id: 'STAR', name: 'Star Health and Allied Insurance', tpa: 'In-House TPA Desk', helpline: '1800 425 2255' },
  { id: 'HDFC', name: 'HDFC ERGO General Insurance', tpa: 'Health India TPA', helpline: '1800 2666' },
  { id: 'CARE', name: 'Care Health Insurance (Religare)', tpa: 'In-House TPA', helpline: '1800 102 4488' },
  { id: 'ICICI', name: 'ICICI Lombard Health Care', tpa: 'MediAssist Healthcare TPA', helpline: '1800 2666' },
  { id: 'PMJAY', name: 'Ayushman Bharat (AB-PMJAY)', tpa: 'National Health Authority (NHA)', helpline: '14555' },
  { id: 'MAX', name: 'Max Bupa (Niva Bupa Health)', tpa: 'Vidal Health TPA', helpline: '1860 500 8888' },
  { id: 'BAJAJ', name: 'Bajaj Allianz General Insurance', tpa: 'HAT TPA Services', helpline: '1800 209 5858' }
];

const INITIAL_CLAIMS = [
  {
    id: 1,
    claimNumber: 'CLM-2026-9012',
    patientName: 'Rahul Sharma',
    patientUhid: 'UHID-101',
    patientAge: 42,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    insuranceProvider: 'Star Health and Allied Insurance',
    tpaDeskName: 'Star Health In-House Desk',
    policyNumber: 'STAR-IND-2026-891024',
    admissionDate: '2026-10-28',
    roomCategory: 'Twin Sharing Deluxe (Floor 3)',
    treatingDoctor: 'Dr. Sarah Jenkins',
    treatmentDiagnosis: 'Acute Coronary Syndrome • Coronary Angioplasty (PTCA)',
    totalBillAmount: 185000,
    approvedAmount: 160000,
    copayPercentage: 10,
    copayAmount: 16000,
    deductibleAmount: 4500,
    netTpaDisbursed: 139500,
    patientPayable: 25000,
    status: 'PRE_AUTH_APPROVED',
    notes: 'Initial pre-auth sanctioned. Final settlement awaiting discharge summary.'
  },
  {
    id: 2,
    claimNumber: 'CLM-2026-9013',
    patientName: 'Anita Verma',
    patientUhid: 'UHID-102',
    patientAge: 36,
    patientGender: 'Female',
    patientPhone: '+91 98765 43211',
    insuranceProvider: 'Care Health Insurance (Religare)',
    tpaDeskName: 'Care In-House Adjudication',
    policyNumber: 'CARE-FLOATER-99210',
    admissionDate: '2026-10-27',
    roomCategory: 'ICU Bed 02 (Critical Care)',
    treatingDoctor: 'Dr. Priya Nair',
    treatmentDiagnosis: 'Severe Diabetic Ketoacidosis with Sepsis Management',
    totalBillAmount: 92000,
    approvedAmount: 85000,
    copayPercentage: 0,
    copayAmount: 0,
    deductibleAmount: 3200,
    netTpaDisbursed: 81800,
    patientPayable: 10200,
    status: 'SETTLED',
    notes: 'Discharge claim adjudicated. Electronic fund transfer completed.'
  },
  {
    id: 3,
    claimNumber: 'CLM-2026-9014',
    patientName: 'Vikram Malhotra',
    patientUhid: 'UHID-103',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+91 98765 43212',
    insuranceProvider: 'Ayushman Bharat (AB-PMJAY)',
    tpaDeskName: 'National Health Authority Golden Card',
    policyNumber: 'ABHA-PMJAY-DEL-908123',
    admissionDate: '2026-10-29',
    roomCategory: 'General Orthopedic Ward',
    treatingDoctor: 'Dr. Vikram Patel',
    treatmentDiagnosis: 'Total Knee Replacement (Right Side Package)',
    totalBillAmount: 125000,
    approvedAmount: 125000,
    copayPercentage: 0,
    copayAmount: 0,
    deductibleAmount: 0,
    netTpaDisbursed: 125000,
    patientPayable: 0,
    status: 'PRE_AUTH_APPROVED',
    notes: 'Ayushman Bharat 100% cashless treatment package approved.'
  }
];

const TPA_STORAGE_KEY = 'hospitalsync_tpa_claims_v1';

export default function TpaDeskPanel() {
  const [claims, setClaims] = useState(() => {
    try {
      const saved = localStorage.getItem(TPA_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
    } catch {
      return INITIAL_CLAIMS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showPreAuthModal, setShowPreAuthModal] = useState(false);
  const [activeSlipClaim, setActiveSlipClaim] = useState(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [providerId, setProviderId] = useState('STAR');
  const [policyNumber, setPolicyNumber] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomCategory, setRoomCategory] = useState('Twin Sharing Deluxe');
  const [treatmentDiagnosis, setTreatmentDiagnosis] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('85000');
  const [copayPercent, setCopayPercent] = useState('10');
  const [customPatientName, setCustomPatientName] = useState('');
  const [patientMode, setPatientMode] = useState('registered');

  useEffect(() => {
    try {
      localStorage.setItem(TPA_STORAGE_KEY, JSON.stringify(claims));
    } catch (e) {
      console.error(e);
    }
  }, [claims]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));

    DoctorService.getAllDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  const handleCreatePreAuth = (e) => {
    e.preventDefault();

    let pName = customPatientName;
    let pAge = 40;
    let pGender = 'Male';
    let pPhone = '+91 98765 43210';
    let pUhid = 'UHID-TPA-AUTO';

    if (patientMode === 'registered' && selectedPatientId) {
      const p = patients.find(pat => String(pat.id) === String(selectedPatientId));
      if (p) {
        pName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name;
        pAge = p.age || 40;
        pGender = p.gender || 'Other';
        pPhone = p.contactNumber || p.phone || '+91 98765 43210';
        pUhid = p.uhid || `UHID-${p.id}`;
      }
    }

    if (!pName) {
      toast.error('Please enter or select a patient.');
      return;
    }

    const providerObj = INITIAL_INSURANCE_PROVIDERS.find(pr => pr.id === providerId) || INITIAL_INSURANCE_PROVIDERS[0];
    const docObj = doctors.find(d => String(d.id) === String(selectedDoctorId));

    const est = parseFloat(estimatedCost) || 50000;
    const cp = parseFloat(copayPercent) || 0;
    const approved = Math.round(est * 0.9); // Initial 90% sanction
    const copayVal = Math.round((approved * cp) / 100);
    const nonMed = 2500;
    const netDisb = approved - copayVal - nonMed;
    const patientDue = est - netDisb;

    const newClaim = {
      id: Date.now(),
      claimNumber: `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: pName,
      patientUhid: pUhid,
      patientAge: pAge,
      patientGender: pGender,
      patientPhone: pPhone,
      insuranceProvider: providerObj.name,
      tpaDeskName: providerObj.tpa,
      policyNumber: policyNumber || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      admissionDate,
      roomCategory,
      treatingDoctor: docObj?.name ? formatDoctorName(docObj.name) : 'Dr. Sarah Jenkins',
      treatmentDiagnosis: treatmentDiagnosis || 'Elective Surgical Procedure & Critical Inpatient Care',
      totalBillAmount: est,
      approvedAmount: approved,
      copayPercentage: cp,
      copayAmount: copayVal,
      deductibleAmount: nonMed,
      netTpaDisbursed: netDisb,
      patientPayable: patientDue,
      status: 'PRE_AUTH_APPROVED',
      notes: 'Electronic cashless pre-authorization sanctioned by TPA portal.'
    };

    setClaims(prev => [newClaim, ...prev]);
    toast.success(`Pre-Authorization Sanctioned: ₹${approved.toLocaleString('en-IN')} approved!`);
    setShowPreAuthModal(false);
    setActiveSlipClaim(newClaim);
  };

  const handleUpdateClaimStatus = (claimId, newStatus) => {
    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
    toast.success(`Claim status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  const filteredClaims = useMemo(() => {
    if (filterStatus === 'ALL') return claims;
    return claims.filter(c => c.status === filterStatus);
  }, [claims, filterStatus]);

  const totalSanctioned = claims.reduce((acc, c) => acc + (Number(c.approvedAmount) || 0), 0);
  const totalSettled = claims.filter(c => c.status === 'SETTLED').reduce((acc, c) => acc + (Number(c.netTpaDisbursed) || 0), 0);

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-shield-check text-primary me-2 fs-2"></i>
            TPA / Cashless Health Insurance & PM-JAY Helpdesk
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • IRDAI Empaneled Cashless Portal • Real-Time Pre-Auth Adjudication
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowPreAuthModal(true)}
          >
            <i className="bi bi-file-earmark-plus-fill me-1"></i> New Cashless Pre-Auth
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Cashless Claims</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-primary">{claims.length}</h3>
                <i className="bi bi-folder-check fs-1 text-primary opacity-25"></i>
              </div>
              <small className="text-muted">Star, Care, HDFC, Ayushman Bharat</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total TPA Sanctioned</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-success">₹{(totalSanctioned / 100000).toFixed(1)}L</h3>
                <i className="bi bi-currency-rupee fs-1 text-success opacity-25"></i>
              </div>
              <small className="text-muted">Pre-approved Cashless Limits</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-info border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Settled / Disbursed</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-info">₹{(totalSettled / 100000).toFixed(1)}L</h3>
                <i className="bi bi-check-all fs-1 text-info opacity-25"></i>
              </div>
              <small className="text-muted">Direct Hospital Bank Credit</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Empaneled TPAs / Insurers</span>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <h3 className="fw-bold mb-0 text-dark">{INITIAL_INSURANCE_PROVIDERS.length}</h3>
                <i className="bi bi-building-check fs-1 text-warning opacity-50"></i>
              </div>
              <small className="text-muted">Govt PM-JAY & Private Insurers</small>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-card-checklist text-primary me-2"></i>
            Cashless Hospitalization Claims & Pre-Auth Registry
          </h5>

          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All ({claims.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'PRE_AUTH_APPROVED' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('PRE_AUTH_APPROVED')}
            >
              Pre-Auth Active ({claims.filter(c => c.status === 'PRE_AUTH_APPROVED').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'SETTLED' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('SETTLED')}
            >
              Settled ({claims.filter(c => c.status === 'SETTLED').length})
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-secondary">
                <tr>
                  <th className="ps-3">Claim # / Date</th>
                  <th>Patient Details</th>
                  <th>Insurer / Policy</th>
                  <th>Diagnosis / Doctor</th>
                  <th>Bill / Approved</th>
                  <th>Patient Due</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No insurance claims found in registry.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(item => {
                    const isSettled = item.status === 'SETTLED';

                    return (
                      <tr key={item.id}>
                        <td className="ps-3">
                          <strong className="text-primary font-monospace">{item.claimNumber}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.admissionDate}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.patientName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {item.patientAge}y / {item.patientGender} • {item.patientUhid}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.insuranceProvider}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{item.policyNumber}</div>
                        </td>
                        <td>
                          <div className="text-truncate text-dark" style={{ maxWidth: '220px' }}>
                            {item.treatmentDiagnosis}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.treatingDoctor}</div>
                        </td>
                        <td>
                          <div className="fw-bold text-success font-monospace">
                            ₹{Number(item.approvedAmount).toLocaleString('en-IN')}
                          </div>
                          <div className="text-muted text-decoration-line-through font-monospace" style={{ fontSize: '0.75rem' }}>
                            ₹{Number(item.totalBillAmount).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-danger font-monospace">
                            ₹{Number(item.patientPayable).toLocaleString('en-IN')}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Co-pay + Non-med</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            isSettled ? 'bg-success' :
                            item.status === 'PRE_AUTH_APPROVED' ? 'bg-primary' : 'bg-warning text-dark'
                          } px-2 py-1`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>

                          {!isSettled && (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm py-0 px-1 d-block mt-1"
                              style={{ fontSize: '0.68rem' }}
                              onClick={() => handleUpdateClaimStatus(item.id, 'SETTLED')}
                            >
                              Mark Settled
                            </button>
                          )}
                        </td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm py-1 px-2"
                            title="Print TPA Claim Pass"
                            onClick={() => setActiveSlipClaim(item)}
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

      {/* Cashless Pre-Auth Modal */}
      {showPreAuthModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-primary text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-shield-plus me-2"></i>
                  Submit Cashless Pre-Authorization Request (IRDAI Form)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPreAuthModal(false)}></button>
              </div>

              <form onSubmit={handleCreatePreAuth}>
                <div className="modal-body p-3">
                  <div className="row g-3">
                    {/* Patient Mode */}
                    <div className="col-12">
                      <div className="d-flex gap-3 mb-1">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="regPatient"
                            checked={patientMode === 'registered'}
                            onChange={() => setPatientMode('registered')}
                          />
                          <label className="form-check-label small" htmlFor="regPatient">Registered Inpatient</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="customPatient"
                            checked={patientMode === 'custom'}
                            onChange={() => setPatientMode('custom')}
                          />
                          <label className="form-check-label small" htmlFor="customPatient">Walk-In / Direct Policyholder</label>
                        </div>
                      </div>

                      {patientMode === 'registered' ? (
                        <select
                          className="form-select form-select-sm"
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          required
                        >
                          <option value="">-- Select Patient from Registry --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.firstName} {p.lastName} {p.name || ''} (UHID: {p.uhid || p.id}, Age: {p.age || 'N/A'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Patient Full Name"
                          value={customPatientName}
                          onChange={(e) => setCustomPatientName(e.target.value)}
                          required
                        />
                      )}
                    </div>

                    {/* Insurance Provider */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">TPA / Insurance Company *</label>
                      <select
                        className="form-select form-select-sm"
                        value={providerId}
                        onChange={(e) => setProviderId(e.target.value)}
                      >
                        {INITIAL_INSURANCE_PROVIDERS.map(pr => (
                          <option key={pr.id} value={pr.id}>
                            {pr.name} ({pr.tpa})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Policy / ABHA Health ID *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. STAR-IND-2026-908123"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        required
                      />
                    </div>

                    {/* Doctor & Room */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Treating Doctor</label>
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

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Room Eligibility Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={roomCategory}
                        onChange={(e) => setRoomCategory(e.target.value)}
                      >
                        <option value="General Ward (Govt / Semi-Private)">General Ward (Govt / Semi-Private)</option>
                        <option value="Twin Sharing Deluxe">Twin Sharing Deluxe (Standard)</option>
                        <option value="Single Private AC Room">Single Private AC Room</option>
                        <option value="ICU / CCU Isolation Bed">ICU / CCU Isolation Bed</option>
                      </select>
                    </div>

                    {/* Diagnosis */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Clinical Diagnosis & Proposed Procedure *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Laparoscopic Cholecystectomy / Acute Myocardial Infarction"
                        value={treatmentDiagnosis}
                        onChange={(e) => setTreatmentDiagnosis(e.target.value)}
                        required
                      />
                    </div>

                    {/* Financial Estimation */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Estimated Gross Package Cost (₹) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm font-monospace"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Policy Co-Pay Percentage (%)</label>
                      <select
                        className="form-select form-select-sm"
                        value={copayPercent}
                        onChange={(e) => setCopayPercent(e.target.value)}
                      >
                        <option value="0">0% (Ayushman Bharat / Zero Co-Pay)</option>
                        <option value="10">10% Co-Pay</option>
                        <option value="15">15% Co-Pay</option>
                        <option value="20">20% Co-Pay (Senior Citizen / Zonal)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowPreAuthModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">
                    <i className="bi bi-shield-check me-1"></i> Sanction Cashless Pre-Auth
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Claim Slip */}
      {activeSlipClaim && (
        <TpaClaimSettlementSlip
          claim={activeSlipClaim}
          onClose={() => setActiveSlipClaim(null)}
        />
      )}
    </div>
  );
}
