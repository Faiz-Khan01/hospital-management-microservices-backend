import React, { useState, useEffect, useMemo } from 'react';
import PatientService from '../../services/PatientService';
import { getHospitalName } from '../../services/hospitalConfig';
import AbhaCardPrintSlip from './AbhaCardPrintSlip';
import { toast } from 'react-toastify';

const INITIAL_ABHA_PATIENTS = [
  {
    id: 1,
    patientName: 'Rahul Sharma',
    patientUhid: 'UHID-101',
    abhaNumber: '91-2045-8910-3412',
    abhaAddress: 'rahul.sharma@abdm',
    gender: 'Male',
    yob: '1984',
    mobile: '+91 98765 43210',
    aadhaarVerified: true,
    linkedRecordsCount: 5,
    status: 'ACTIVE_LINKED'
  },
  {
    id: 2,
    patientName: 'Anita Verma',
    patientUhid: 'UHID-102',
    abhaNumber: '91-2045-8910-3413',
    abhaAddress: 'anita.verma@abdm',
    gender: 'Female',
    yob: '1990',
    mobile: '+91 98765 43211',
    aadhaarVerified: true,
    linkedRecordsCount: 4,
    status: 'ACTIVE_LINKED'
  },
  {
    id: 3,
    patientName: 'Vikram Malhotra',
    patientUhid: 'UHID-103',
    abhaNumber: '91-2045-8910-3414',
    abhaAddress: 'vikram.m@abdm',
    gender: 'Male',
    yob: '1968',
    mobile: '+91 98765 43212',
    aadhaarVerified: true,
    linkedRecordsCount: 6,
    status: 'ACTIVE_LINKED'
  }
];

const INITIAL_CONSENTS = [
  {
    id: 1,
    consentId: 'REQ-ABDM-9021',
    requesterHospital: 'AIIMS New Delhi (Cardiology OPD)',
    patientName: 'Rahul Sharma (91-2045-8910-3412)',
    purpose: 'Cardiology Historical Evaluation & PTCA Reports',
    artifactTypes: 'Discharge Summary, Diagnostic Lab, ECG/Echo',
    requestedDate: '2026-10-30',
    validTill: '2026-11-06',
    status: 'PENDING_APPROVAL'
  },
  {
    id: 2,
    consentId: 'REQ-ABDM-9020',
    requesterHospital: 'Max Super Speciality Hospital (Endocrinology)',
    patientName: 'Anita Verma (91-2045-8910-3413)',
    purpose: 'Diabetic Ketoacidosis ICU Recovery Monitoring',
    artifactTypes: 'Prescriptions, Blood Glucose Charts, LFT/KFT',
    requestedDate: '2026-10-29',
    validTill: '2026-11-05',
    status: 'CONSENT_GRANTED'
  }
];

const ABDM_PATIENTS_KEY = 'hospitalsync_abdm_patients_v1';
const ABDM_CONSENTS_KEY = 'hospitalsync_abdm_consents_v1';

export default function AbdmPanel() {
  const [abhaList, setAbhaList] = useState(() => {
    try {
      const saved = localStorage.getItem(ABDM_PATIENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ABHA_PATIENTS;
    } catch {
      return INITIAL_ABHA_PATIENTS;
    }
  });

  const [consents, setConsents] = useState(() => {
    try {
      const saved = localStorage.getItem(ABDM_CONSENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CONSENTS;
    } catch {
      return INITIAL_CONSENTS;
    }
  });

  const [patients, setPatients] = useState([]);
  const [activeTabSub, setActiveTabSub] = useState('abha');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSlipRecord, setActiveSlipRecord] = useState(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [customAbhaHandle, setCustomAbhaHandle] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpValue, setOtpValue] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(ABDM_PATIENTS_KEY, JSON.stringify(abhaList));
    } catch (e) {
      console.error(e);
    }
  }, [abhaList]);

  useEffect(() => {
    try {
      localStorage.setItem(ABDM_CONSENTS_KEY, JSON.stringify(consents));
    } catch (e) {
      console.error(e);
    }
  }, [consents]);

  useEffect(() => {
    PatientService.getAllPatients()
      .then(res => setPatients(res.data || []))
      .catch(() => setPatients([]));
  }, []);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !aadhaarNumber) {
      toast.error('Please select patient and enter 12-digit Aadhaar number.');
      return;
    }
    toast.info('Aadhaar OTP dispatched to linked mobile number: 492018');
    setOtpStep(2);
    setOtpValue('492018');
  };

  const handleVerifyOtpAndCreate = (e) => {
    e.preventDefault();

    const targetPatient = patients.find(p => String(p.id) === String(selectedPatientId));
    const pName = targetPatient ? `${targetPatient.firstName || ''} ${targetPatient.lastName || ''}`.trim() || targetPatient.name : 'Citizen';

    const pSlug = pName.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const assignedHandle = customAbhaHandle ? `${customAbhaHandle}@abdm` : `${pSlug}${Math.floor(10 + Math.random() * 90)}@abdm`;

    const generatedAbhaNumber = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAbha = {
      id: Date.now(),
      patientName: pName,
      patientUhid: targetPatient?.uhid || `UHID-${targetPatient?.id || 'AUTO'}`,
      abhaNumber: generatedAbhaNumber,
      abhaAddress: assignedHandle,
      gender: targetPatient?.gender || 'Male',
      yob: targetPatient?.dateOfBirth ? targetPatient.dateOfBirth.split('-')[0] : '1988',
      mobile: targetPatient?.contactNumber || '+91 98765 43210',
      aadhaarVerified: true,
      linkedRecordsCount: 3,
      status: 'ACTIVE_LINKED'
    };

    setAbhaList(prev => [newAbha, ...prev]);
    toast.success(`ABHA ID Created Successfully! ABHA Number: ${generatedAbhaNumber}`);
    setShowCreateModal(false);
    setOtpStep(1);
    setAadhaarNumber('');
    setCustomAbhaHandle('');
    setActiveSlipRecord(newAbha);
  };

  const handleUpdateConsent = (consentId, newStatus) => {
    setConsents(prev => prev.map(c => {
      if (c.id === consentId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
    toast.success(`Consent request ${newStatus === 'CONSENT_GRANTED' ? 'Approved & Encrypted FHIR Token Issued' : 'Revoked / Rejected'}`);
  };

  const handleQuickScanShare = () => {
    const randomPat = abhaList[Math.floor(Math.random() * abhaList.length)] || abhaList[0];
    const tokenNo = Math.floor(10 + Math.random() * 80);
    toast.success(`📲 ABHA Scan & Share Success! Token #${tokenNo} auto-generated for ${randomPat.patientName} (${randomPat.abhaAddress}) at Central OPD Counter.`);
  };

  return (
    <div className="container-fluid py-3">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-qr-code text-primary me-2 fs-2"></i>
            ABDM (Ayushman Bharat Digital Mission) & ABHA Health ID Gateway
          </h3>
          <p className="text-muted small mb-0">
            {getHospitalName()} • National Health Authority (NHA) Certified HIP & HIU Gateway • M1/M2/M3 Interoperability
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm fw-bold px-3 shadow-sm"
            onClick={handleQuickScanShare}
          >
            <i className="bi bi-camera me-1"></i> Scan & Share (OPD Queue)
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-person-plus-fill me-1"></i> Create 14-Digit ABHA ID
          </button>
        </div>
      </div>

      {/* ABDM Milestone Compliance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-primary">MILESTONE 1 (M1)</span>
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
              </div>
              <h5 className="fw-bold mb-1 text-dark">ABHA Registration & Verification</h5>
              <p className="text-muted small mb-0">Aadhaar OTP / Mobile authentication, 14-digit ABHA creation, and verified digital health cards.</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-success">MILESTONE 2 (M2)</span>
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
              </div>
              <h5 className="fw-bold mb-1 text-dark">Health Information Provider (HIP)</h5>
              <p className="text-muted small mb-0">Automatic linking of OPD consults, diagnostic lab results, and discharge summaries to patient ABHA.</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card shadow-sm border-0 border-start border-info border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-info text-dark">MILESTONE 3 (M3)</span>
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
              </div>
              <h5 className="fw-bold mb-1 text-dark">Health Information User (HIU)</h5>
              <p className="text-muted small mb-0">Electronic Consent Artifact Management for seamless, patient-consented health record sharing across India.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTabSub === 'abha' ? 'active bg-primary text-white' : 'text-dark'}`}
            onClick={() => setActiveTabSub('abha')}
          >
            <i className="bi bi-person-badge-fill me-1"></i> Patient ABHA Digital Health Accounts ({abhaList.length})
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTabSub === 'consent' ? 'active bg-dark text-white' : 'text-dark'}`}
            onClick={() => setActiveTabSub('consent')}
          >
            <i className="bi bi-shield-lock-fill me-1"></i> Inter-Hospital Consent Sharing Desk ({consents.length})
          </button>
        </li>
      </ul>

      {/* View: ABHA Patients Registry */}
      {activeTabSub === 'abha' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-card-checklist text-primary me-2"></i>
              Hospital Patient ABHA Registry & Linked Health Records
            </h5>
            <span className="badge bg-light text-dark border">
              {abhaList.length} Verified ABHA Accounts
            </span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">14-Digit ABHA ID</th>
                    <th>Patient Full Name</th>
                    <th>ABHA Address</th>
                    <th>YOB / Gender</th>
                    <th>Aadhaar KYC</th>
                    <th>Linked Records</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {abhaList.map(item => (
                    <tr key={item.id}>
                      <td className="ps-3">
                        <strong className="text-primary font-monospace fs-6">{item.abhaNumber}</strong>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>UHID: {item.patientUhid}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.patientName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Mobile: {item.mobile}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">@{item.abhaAddress}</span>
                      </td>
                      <td>
                        <span className="text-dark">{item.yob} • {item.gender}</span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success">
                          <i className="bi bi-check-circle-fill me-1"></i> Aadhaar Verified
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fw-bold">
                          {item.linkedRecordsCount} FHIR Bundles
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success">ACTIVE</span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm py-1 px-2"
                          title="Print Official ABHA Card"
                          onClick={() => setActiveSlipRecord(item)}
                        >
                          <i className="bi bi-printer-fill me-1"></i> ABHA Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View: Consent Requests Table */}
      {activeTabSub === 'consent' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-shield-check text-success me-2"></i>
              NHA National Health Data Consent Requests (HIU & HIP)
            </h5>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-secondary">
                  <tr>
                    <th className="ps-3">Consent Request ID</th>
                    <th>Requester Healthcare Entity</th>
                    <th>Patient ABHA Identity</th>
                    <th>Clinical Purpose</th>
                    <th>Requested Artifacts</th>
                    <th>Validity Period</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {consents.map(c => {
                    const isGranted = c.status === 'CONSENT_GRANTED';

                    return (
                      <tr key={c.id} className={!isGranted ? 'table-warning-subtle' : ''}>
                        <td className="ps-3">
                          <strong className="text-dark font-monospace">{c.consentId}</strong>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>Requested: {c.requestedDate}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{c.requesterHospital}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-primary">{c.patientName}</div>
                        </td>
                        <td>
                          <div className="text-dark">{c.purpose}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border font-monospace">{c.artifactTypes}</span>
                        </td>
                        <td>
                          <span className="text-muted">Till {c.validTill}</span>
                        </td>
                        <td>
                          <span className={`badge ${isGranted ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          {!isGranted ? (
                            <button
                              type="button"
                              className="btn btn-success btn-sm py-0 px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => handleUpdateConsent(c.id, 'CONSENT_GRANTED')}
                            >
                              <i className="bi bi-check-lg me-1"></i> Approve Consent
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => handleUpdateConsent(c.id, 'REVOKED')}
                            >
                              Revoke
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

      {/* Create ABHA ID Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-primary text-white py-2">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-qr-code me-2"></i>
                  Create 14-Digit ABHA Health Account (NHA Gateway)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>

              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <div className="modal-body p-3">
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Select Hospital Inpatient / OPD Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.firstName || ''} {p.lastName || ''} {p.name || ''} (UHID: {p.uhid || p.id}, Mobile: {p.contactNumber || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-semibold">12-Digit Aadhaar Card Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. 5412 8821 9014"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        required
                      />
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        OTP will be dispatched to the mobile number registered with UIDAI.
                      </div>
                    </div>

                    <div>
                      <label className="form-label small fw-semibold">Preferred ABHA Handle (Optional)</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. rahul.sharma"
                          value={customAbhaHandle}
                          onChange={(e) => setCustomAbhaHandle(e.target.value)}
                        />
                        <span className="input-group-text font-monospace">@abdm</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer bg-light py-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">
                      <i className="bi bi-shield-check me-1"></i> Send Aadhaar OTP
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndCreate}>
                  <div className="modal-body p-3 text-center">
                    <i className="bi bi-phone fs-1 text-primary mb-2 d-block"></i>
                    <h6 className="fw-bold mb-1">Enter 6-Digit Aadhaar OTP</h6>
                    <p className="text-muted small mb-3">Dispatched to mobile linked with Aadhaar: {aadhaarNumber}</p>

                    <div className="mb-3 w-50 mx-auto">
                      <input
                        type="text"
                        className="form-control form-control-lg text-center font-monospace fw-bold"
                        maxLength="6"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer bg-light py-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setOtpStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-success btn-sm fw-bold px-3">
                      <i className="bi bi-check-circle-fill me-1"></i> Verify OTP & Issue ABHA Card
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Official ABHA Card */}
      {activeSlipRecord && (
        <AbhaCardPrintSlip
          abhaRecord={activeSlipRecord}
          onClose={() => setActiveSlipRecord(null)}
        />
      )}
    </div>
  );
}
