import React, { useState, useMemo } from 'react';
import { getHospitalName, formatDoctorName } from '../../services/hospitalConfig';
import ChemoAdministrationSlip from './ChemoAdministrationSlip';

const INITIAL_BAYS = [
  {
    id: 'BAY-01',
    bayNumber: '01',
    type: 'Chemotherapy Recliner Suite A',
    status: 'INFUSION_ACTIVE',
    patientName: 'Sunita Sharma',
    patientId: '401',
    uhid: 'MRN-2026-0401',
    age: 52,
    gender: 'Female',
    heightCm: 158,
    weightKg: 62,
    bsa: '1.64',
    diagnosis: 'Invasive Ductal Carcinoma Breast (Stage IIb, HER2+)',
    regimenName: 'AC-T (Doxorubicin + Cyclophosphamide)',
    cycleNumber: 3,
    totalCycles: 6,
    cycleDay: 1,
    intent: 'Adjuvant Chemotherapy',
    oncologistName: 'Dr. Vikram Malhotra',
    primaryNurse: 'Sister Reena Mathew, RN',
    verifierNurse: 'Sister Shalini Nair, RN',
    accessType: 'Subcutaneous Chemoport (Left Chest)',
    anc: '3,100 /µL',
    platelets: '210,000 /µL',
    hemoglobin: '11.8 g/dL',
    creatinine: '0.85 mg/dL',
    liverFn: 'SGPT 24 U/L, Bilirubin 0.6 mg',
    currentDrug: 'Doxorubicin (Adriamycin)',
    currentDose: '98 mg (60 mg/m²)',
    totalVolumeMl: 250,
    infusedVolumeMl: 175,
    infusionRateMlHr: 125,
    vesicantRisk: 'Vesicant',
    startTime: '10:00 AM',
    estCompletionTime: '12:00 PM',
    dualCheckVerified: true,
    drugs: [
      { id: 1, name: 'Doxorubicin HCl', dose: '98 mg (60 mg/m²)', diluent: '250 mL Normal Saline', route: 'ChemoPort IV', rate: '125 mL/hr', dur: '120 mins', vesicant: 'Vesicant', verified: true },
      { id: 2, name: 'Cyclophosphamide', dose: '984 mg (600 mg/m²)', diluent: '500 mL Normal Saline', route: 'ChemoPort IV', rate: '250 mL/hr', dur: '120 mins', vesicant: 'Non-vesicant', verified: true }
    ],
    preMeds: [
      { drug: 'Inj. Palonosetron', dose: '0.25 mg IV Push', reason: '2nd Gen 5-HT3 Antiemetic', time: '09:15 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Dexamethasone', dose: '12 mg IV Push', reason: 'Pre-chemo Corticosteroid', time: '09:20 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Ranitidine', dose: '50 mg IV Push', reason: 'H2 Blocker', time: '09:25 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Aprepitant (Emend)', dose: '150 mg IV Infusion', reason: 'NK1 Receptor Antagonist', time: '09:30 AM', status: 'Given & Tolerated' }
    ]
  },
  {
    id: 'BAY-02',
    bayNumber: '02',
    type: 'Chemotherapy Recliner Suite A',
    status: 'INFUSION_ACTIVE',
    patientName: 'Rameshwar Nath',
    patientId: '408',
    uhid: 'MRN-2026-0408',
    age: 64,
    gender: 'Male',
    heightCm: 168,
    weightKg: 68,
    bsa: '1.78',
    diagnosis: 'Colorectal Adenocarcinoma (Stage IIIb)',
    regimenName: 'FOLFOX-6 (mFOLFOX6)',
    cycleNumber: 4,
    totalCycles: 6,
    cycleDay: 1,
    intent: 'Adjuvant Curative',
    oncologistName: 'Dr. Anand K. Sen',
    primaryNurse: 'Sister Mini Varghese, RN',
    verifierNurse: 'Sister Shalini Nair, RN',
    accessType: 'Subcutaneous Chemoport (Right Subclavian)',
    anc: '2,450 /µL',
    platelets: '185,000 /µL',
    hemoglobin: '11.4 g/dL',
    creatinine: '0.92 mg/dL',
    liverFn: 'SGPT 28 U/L, Bilirubin 0.7 mg',
    currentDrug: 'Oxaliplatin',
    currentDose: '150 mg (85 mg/m²)',
    totalVolumeMl: 500,
    infusedVolumeMl: 320,
    infusionRateMlHr: 250,
    vesicantRisk: 'Irritant',
    startTime: '09:45 AM',
    estCompletionTime: '11:45 AM',
    dualCheckVerified: true,
    drugs: [
      { id: 1, name: 'Oxaliplatin', dose: '150 mg (85 mg/m²)', diluent: '500 mL D5W', route: 'ChemoPort IV', rate: '250 mL/hr', dur: '120 mins', vesicant: 'Irritant', verified: true },
      { id: 2, name: 'Leucovorin Calcium', dose: '710 mg (400 mg/m²)', diluent: '250 mL D5W', route: 'ChemoPort IV', rate: '125 mL/hr', dur: '120 mins', vesicant: 'Non-vesicant', verified: true },
      { id: 3, name: '5-Fluorouracil (5-FU) Bolus', dose: '710 mg (400 mg/m²)', diluent: 'IV Push over 5 min', route: 'ChemoPort IV', rate: 'Slow Push', dur: '5 mins', vesicant: 'Irritant', verified: true },
      { id: 4, name: '5-Fluorouracil (5-FU) Infusion', dose: '4,270 mg (2400 mg/m²)', diluent: 'Elastomeric Ambulatory Pump', route: 'ChemoPort IV', rate: '5 mL/hr', dur: '46 hours', vesicant: 'Irritant', verified: true }
    ],
    preMeds: [
      { drug: 'Inj. Ondansetron', dose: '16 mg IV Infusion in 100mL NS', reason: '5-HT3 Antiemetic', time: '09:00 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Dexamethasone', dose: '8 mg IV Push', reason: 'Pre-chemo Corticosteroid', time: '09:15 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Famotidine', dose: '20 mg IV Push', reason: 'H2 Receptor Blocker', time: '09:20 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Pheniramine (Avil)', dose: '22.75 mg IV Slow Push', reason: 'H1 Antihistamine Antiallergic', time: '09:25 AM', status: 'Given & Tolerated' }
    ]
  },
  {
    id: 'BAY-03',
    bayNumber: '03',
    type: 'Chemotherapy Isolation Bay B',
    status: 'PRE_MEDS',
    patientName: 'Harpreet Singh Gill',
    patientId: '415',
    uhid: 'MRN-2026-0415',
    age: 58,
    gender: 'Male',
    heightCm: 175,
    weightKg: 80,
    bsa: '1.97',
    diagnosis: 'Diffuse Large B-Cell Lymphoma (DLBCL, Stage III)',
    regimenName: 'R-CHOP (Rituximab + CHOP)',
    cycleNumber: 2,
    totalCycles: 6,
    cycleDay: 1,
    intent: 'Curative Immunochemotherapy',
    oncologistName: 'Dr. Vikram Malhotra',
    primaryNurse: 'Sister Jyoti Sharma, RN',
    verifierNurse: 'Sister Reena Mathew, RN',
    accessType: 'Right Arm PICC Line',
    anc: '2,800 /µL',
    platelets: '195,000 /µL',
    hemoglobin: '12.2 g/dL',
    creatinine: '1.02 mg/dL',
    liverFn: 'SGPT 32 U/L, Bilirubin 0.8 mg',
    currentDrug: 'Pre-Medication Protocol & Hydration',
    currentDose: 'Diphenhydramine + Paracetamol + Dexa',
    totalVolumeMl: 500,
    infusedVolumeMl: 350,
    infusionRateMlHr: 150,
    vesicantRisk: 'Non-vesicant',
    startTime: '10:30 AM',
    estCompletionTime: '03:30 PM',
    dualCheckVerified: true,
    drugs: [
      { id: 1, name: 'Rituximab (MabThera)', dose: '740 mg (375 mg/m²)', diluent: '500 mL Normal Saline', route: 'PICC Line IV', rate: '50-200 mL/hr stepped', dur: '240 mins', vesicant: 'Non-vesicant', verified: true },
      { id: 2, name: 'Cyclophosphamide', dose: '1,477 mg (750 mg/m²)', diluent: '500 mL Normal Saline', route: 'PICC Line IV', rate: '250 mL/hr', dur: '120 mins', vesicant: 'Non-vesicant', verified: true },
      { id: 3, name: 'Doxorubicin', dose: '98 mg (50 mg/m²)', diluent: '100 mL Normal Saline', route: 'PICC Line IV', rate: '100 mL/hr', dur: '60 mins', vesicant: 'Vesicant', verified: true },
      { id: 4, name: 'Vincristine Sulfate', dose: '2.0 mg (Capped Max Dose)', diluent: '50 mL Normal Saline', route: 'PICC Line IV', rate: 'Slow drip 15 min', dur: '15 mins', vesicant: 'Vesicant', verified: true }
    ],
    preMeds: [
      { drug: 'Tab. Paracetamol', dose: '1000 mg Oral', reason: 'Prophylaxis for Rituximab Rigors', time: '10:15 AM', status: 'Given' },
      { drug: 'Inj. Diphenhydramine', dose: '50 mg IV Slow Push', reason: 'Antihistamine Prophylaxis', time: '10:20 AM', status: 'Given' },
      { drug: 'Inj. Dexamethasone', dose: '20 mg IV Push', reason: 'Pre-treatment Corticosteroid', time: '10:25 AM', status: 'Given' },
      { drug: 'Inj. Ondansetron', dose: '8 mg IV Push', reason: '5-HT3 Antiemetic', time: '10:30 AM', status: 'Given' }
    ]
  },
  {
    id: 'BAY-04',
    bayNumber: '04',
    type: 'Chemotherapy Recliner Suite B',
    status: 'OBSERVATION',
    patientName: 'Meenakshi Iyer',
    patientId: '422',
    uhid: 'MRN-2026-0422',
    age: 47,
    gender: 'Female',
    heightCm: 162,
    weightKg: 58,
    bsa: '1.61',
    diagnosis: 'Serous Ovarian Carcinoma (Stage IIIc)',
    regimenName: 'Paclitaxel + Carboplatin (AUC 5)',
    cycleNumber: 5,
    totalCycles: 6,
    cycleDay: 1,
    intent: 'Adjuvant Chemotherapy',
    oncologistName: 'Dr. Anand K. Sen',
    primaryNurse: 'Sister Shalini Nair, RN',
    verifierNurse: 'Sister Mini Varghese, RN',
    accessType: 'Subcutaneous Chemoport (Right Subclavian)',
    anc: '2,200 /µL',
    platelets: '160,000 /µL',
    hemoglobin: '10.9 g/dL',
    creatinine: '0.78 mg/dL',
    liverFn: 'SGPT 22 U/L, Bilirubin 0.5 mg',
    currentDrug: 'Post-Infusion Saline Flush & Heparin Lock',
    currentDose: '20 mL Normal Saline + 100 U/mL Heparin',
    totalVolumeMl: 1000,
    infusedVolumeMl: 1000,
    infusionRateMlHr: 0,
    vesicantRisk: 'Irritant',
    startTime: '07:30 AM',
    estCompletionTime: '11:00 AM',
    dualCheckVerified: true,
    drugs: [
      { id: 1, name: 'Paclitaxel', dose: '280 mg (175 mg/m²)', diluent: '500 mL D5W (Non-PVC set with 0.22µ filter)', route: 'ChemoPort IV', rate: '165 mL/hr', dur: '180 mins', vesicant: 'Irritant', verified: true },
      { id: 2, name: 'Carboplatin', dose: '460 mg (AUC 5 - Calvert Formula)', diluent: '500 mL D5W', route: 'ChemoPort IV', rate: '250 mL/hr', dur: '60 mins', vesicant: 'Irritant', verified: true }
    ],
    preMeds: [
      { drug: 'Inj. Dexamethasone', dose: '20 mg IV 30 min pre-pacli', reason: 'Hypersensitivity Prevention', time: '07:00 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Diphenhydramine', dose: '50 mg IV Push', reason: 'H1 Blocker', time: '07:15 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Ranitidine', dose: '50 mg IV Push', reason: 'H2 Blocker', time: '07:20 AM', status: 'Given & Tolerated' },
      { drug: 'Inj. Palonosetron', dose: '0.25 mg IV Push', reason: 'Antiemetic', time: '07:25 AM', status: 'Given & Tolerated' }
    ]
  },
  {
    id: 'BAY-05',
    bayNumber: '05',
    type: 'Immunotherapy & Targeted Bay',
    status: 'AVAILABLE',
    patientName: '',
    patientId: '',
    uhid: '',
    age: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    bsa: '',
    diagnosis: '',
    regimenName: '',
    cycleNumber: '',
    totalCycles: '',
    cycleDay: '',
    intent: '',
    oncologistName: '',
    primaryNurse: '',
    verifierNurse: '',
    accessType: '',
    anc: '',
    platelets: '',
    hemoglobin: '',
    creatinine: '',
    liverFn: '',
    currentDrug: '',
    currentDose: '',
    totalVolumeMl: 0,
    infusedVolumeMl: 0,
    infusionRateMlHr: 0,
    vesicantRisk: '',
    startTime: '',
    estCompletionTime: '',
    dualCheckVerified: false,
    drugs: [],
    preMeds: []
  },
  {
    id: 'BAY-06',
    bayNumber: '06',
    type: 'Chemotherapy Recliner Suite C',
    status: 'AVAILABLE',
    patientName: '',
    patientId: '',
    uhid: '',
    age: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    bsa: '',
    diagnosis: '',
    regimenName: '',
    cycleNumber: '',
    totalCycles: '',
    cycleDay: '',
    intent: '',
    oncologistName: '',
    primaryNurse: '',
    verifierNurse: '',
    accessType: '',
    anc: '',
    platelets: '',
    hemoglobin: '',
    creatinine: '',
    liverFn: '',
    currentDrug: '',
    currentDose: '',
    totalVolumeMl: 0,
    infusedVolumeMl: 0,
    infusionRateMlHr: 0,
    vesicantRisk: '',
    startTime: '',
    estCompletionTime: '',
    dualCheckVerified: false,
    drugs: [],
    preMeds: []
  }
];

const COMMON_REGIMENS = [
  {
    name: 'FOLFOX-6 (mFOLFOX6)',
    cancer: 'Colorectal / Gastric',
    intent: 'Adjuvant / Palliative',
    drugs: 'Oxaliplatin 85 mg/m², Leucovorin 400 mg/m², 5-FU bolus + 46hr infusion'
  },
  {
    name: 'AC-T (Doxorubicin + Cyclophosphamide -> Paclitaxel)',
    cancer: 'Breast Cancer',
    intent: 'Adjuvant / Neoadjuvant',
    drugs: 'Doxorubicin 60 mg/m², Cyclophosphamide 600 mg/m² q2-3w'
  },
  {
    name: 'R-CHOP',
    cancer: 'Non-Hodgkin Lymphoma (DLBCL)',
    intent: 'Curative',
    drugs: 'Rituximab 375 mg/m², Cyclo 750 mg/m², Doxo 50 mg/m², Vincristine 1.4 mg/m², Prednisone'
  },
  {
    name: 'Paclitaxel + Carboplatin',
    cancer: 'Ovarian / Non-Small Cell Lung (NSCLC)',
    intent: 'Adjuvant / Advanced',
    drugs: 'Paclitaxel 175 mg/m², Carboplatin AUC 5-6 IV q3w'
  },
  {
    name: 'Gemcitabine + Cisplatin',
    cancer: 'Bladder / Biliary / Pancreatic',
    intent: 'Curative / Adjuvant',
    drugs: 'Gemcitabine 1000 mg/m² (Days 1,8), Cisplatin 70 mg/m² (Day 1)'
  },
  {
    name: 'Pembrolizumab (Keytruda Immunotherapy)',
    cancer: 'Melanoma / MSI-H Colorectal / Lung',
    intent: 'Targeted Immunotherapy',
    drugs: 'Pembrolizumab 200 mg fixed IV over 30 min q3w'
  }
];

export default function ChemoInfusionPanel({ patients = [], doctors = [], searchQuery = '', darkMode = false }) {
  const [bays, setBays] = useState(INITIAL_BAYS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBayForPrint, setSelectedBayForPrint] = useState(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showExtravasationGuide, setShowExtravasationGuide] = useState(false);
  const [rateAdjustModalBay, setRateAdjustModalBay] = useState(null);
  const [tempRate, setTempRate] = useState(125);

  // New admission form state
  const [admitForm, setAdmitForm] = useState({
    bayId: 'BAY-05',
    patientId: '',
    patientName: '',
    uhid: '',
    age: '',
    gender: 'Female',
    heightCm: 165,
    weightKg: 65,
    diagnosis: 'Invasive Carcinoma Breast (Stage IIa)',
    regimenName: 'AC-T (Doxorubicin + Cyclophosphamide)',
    cycleNumber: 1,
    totalCycles: 6,
    cycleDay: 1,
    intent: 'Adjuvant Chemotherapy',
    oncologistName: doctors[0]?.name ? formatDoctorName(doctors[0].name) : 'Dr. Vikram Malhotra',
    primaryNurse: 'Sister Reena Mathew, RN',
    verifierNurse: 'Sister Shalini Nair, RN',
    accessType: 'Subcutaneous Chemoport (Right Subclavian)',
    anc: '3,200 /µL',
    platelets: '220,000 /µL',
    hemoglobin: '12.0 g/dL',
    creatinine: '0.82 mg/dL',
    liverFn: 'Normal (SGPT 22 U/L)'
  });

  // Calculate Mosteller BSA
  const calculatedBsa = useMemo(() => {
    const h = parseFloat(admitForm.heightCm) || 0;
    const w = parseFloat(admitForm.weightKg) || 0;
    if (h > 0 && w > 0) {
      return Math.sqrt((h * w) / 3600).toFixed(2);
    }
    return '1.70';
  }, [admitForm.heightCm, admitForm.weightKg]);

  // Overall Statistics
  const totalBays = bays.length;
  const activeInfusions = bays.filter(b => b.status === 'INFUSION_ACTIVE').length;
  const preMedsCount = bays.filter(b => b.status === 'PRE_MEDS').length;
  const observationCount = bays.filter(b => b.status === 'OBSERVATION').length;
  const availableBays = bays.filter(b => b.status === 'AVAILABLE').length;

  // Filtered bays based on query and tab
  const filteredBays = bays.filter(bay => {
    if (filterStatus !== 'ALL' && bay.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        bay.bayNumber.toLowerCase().includes(q) ||
        (bay.patientName && bay.patientName.toLowerCase().includes(q)) ||
        (bay.uhid && bay.uhid.toLowerCase().includes(q)) ||
        (bay.regimenName && bay.regimenName.toLowerCase().includes(q)) ||
        (bay.diagnosis && bay.diagnosis.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Action handlers
  const handleStartInfusion = (bayId) => {
    setBays(prev => prev.map(b => {
      if (b.id === bayId) {
        return {
          ...b,
          status: 'INFUSION_ACTIVE',
          startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return b;
    }));
  };

  const handlePauseResume = (bayId) => {
    setBays(prev => prev.map(b => {
      if (b.id === bayId) {
        const isPaused = b.infusionRateMlHr === 0;
        return {
          ...b,
          infusionRateMlHr: isPaused ? (b.savedRate || 125) : 0,
          savedRate: isPaused ? undefined : b.infusionRateMlHr
        };
      }
      return b;
    }));
  };

  const handleProgressStep = (bayId) => {
    setBays(prev => prev.map(b => {
      if (b.id === bayId) {
        const newInfused = Math.min(b.totalVolumeMl, b.infusedVolumeMl + 50);
        const isFinished = newInfused >= b.totalVolumeMl;
        return {
          ...b,
          infusedVolumeMl: newInfused,
          status: isFinished ? 'OBSERVATION' : b.status
        };
      }
      return b;
    }));
  };

  const handleDischargeBay = (bayId) => {
    if (window.confirm('Are you sure you want to complete this daycare chemo session and mark Bay as AVAILABLE?')) {
      setBays(prev => prev.map(b => {
        if (b.id === bayId) {
          return {
            ...b,
            status: 'AVAILABLE',
            patientName: '',
            patientId: '',
            uhid: '',
            diagnosis: '',
            regimenName: '',
            currentDrug: '',
            infusedVolumeMl: 0,
            totalVolumeMl: 0,
            infusionRateMlHr: 0,
            drugs: [],
            preMeds: []
          };
        }
        return b;
      }));
    }
  };

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    const chosenRegimen = COMMON_REGIMENS.find(r => r.name.startsWith(admitForm.regimenName.split(' ')[0])) || COMMON_REGIMENS[0];

    const newBayData = {
      ...admitForm,
      id: admitForm.bayId,
      bayNumber: admitForm.bayId.replace('BAY-', ''),
      status: 'PRE_MEDS',
      bsa: calculatedBsa,
      currentDrug: 'Pre-Medications & Hydration',
      currentDose: 'IV Antiemetic & Corticosteroids',
      totalVolumeMl: 500,
      infusedVolumeMl: 50,
      infusionRateMlHr: 125,
      vesicantRisk: admitForm.regimenName.includes('Doxorubicin') || admitForm.regimenName.includes('Vincristine') ? 'Vesicant' : 'Irritant',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estCompletionTime: '03:00 PM',
      dualCheckVerified: true,
      drugs: [
        { id: 1, name: admitForm.regimenName.split('(')[0].trim(), dose: `BSA Adjusted (${calculatedBsa} m²)`, diluent: '500 mL Normal Saline / D5W', route: admitForm.accessType, rate: '125 mL/hr', dur: '120 mins', vesicant: 'Vesicant', verified: true }
      ],
      preMeds: [
        { drug: 'Inj. Ondansetron', dose: '16 mg IV', reason: 'Antiemetic 5-HT3', time: 'Just Now', status: 'Given' },
        { drug: 'Inj. Dexamethasone', dose: '8 mg IV Push', reason: 'Pre-chemo Corticosteroid', time: 'Just Now', status: 'Given' }
      ]
    };

    setBays(prev => prev.map(b => b.id === admitForm.bayId ? { ...b, ...newBayData } : b));
    setShowAdmitModal(false);
  };

  return (
    <div className="container-fluid p-3" style={{ minHeight: '85vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* HEADER BANNER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span className="badge rounded-circle p-2 text-white" style={{ backgroundColor: '#701a75' }}>
              <i className="bi bi-droplet-half fs-5"></i>
            </span>
            Daycare Chemotherapy & Oncology Infusion Desk
          </h4>
          <p className="text-muted small mb-0">
            {getHospitalName()} &bull; ASCO / ONS Dual-Nurse Safety Protocol &bull; Dynamic BSA Dosimetry & Extravasation Safeguards
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
            onClick={() => setShowExtravasationGuide(true)}
          >
            <i className="bi bi-shield-exclamation text-danger"></i>
            Extravasation & Antidotes
          </button>
          <button
            className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1 shadow-sm"
            style={{ backgroundColor: '#701a75' }}
            onClick={() => setShowAdmitModal(true)}
          >
            <i className="bi bi-plus-circle-fill"></i>
            Admit Patient to Daycare Bay
          </button>
        </div>
      </div>

      {/* STATS METRIC TILES */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-2">
          <div className="card shadow-sm border-0 border-start border-4 border-primary h-100 p-2">
            <div className="text-muted small fw-bold">TOTAL SUITE BAYS</div>
            <div className="fs-4 fw-bold text-primary">{totalBays}</div>
            <div className="small text-muted">6 Dedicated Recliners</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-success h-100 p-2">
            <div className="text-muted small fw-bold">ACTIVE INFUSIONS</div>
            <div className="fs-4 fw-bold text-success d-flex align-items-center gap-2">
              {activeInfusions}
              <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
            </div>
            <div className="small text-muted">Pumps Running Continuously</div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card shadow-sm border-0 border-start border-4 border-warning h-100 p-2">
            <div className="text-muted small fw-bold">PRE-MEDS / PREP</div>
            <div className="fs-4 fw-bold text-warning">{preMedsCount}</div>
            <div className="small text-muted">Anti-emetic / Hydration</div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card shadow-sm border-0 border-start border-4 border-info h-100 p-2">
            <div className="text-muted small fw-bold">OBSERVATION / FLUSH</div>
            <div className="fs-4 fw-bold text-info">{observationCount}</div>
            <div className="small text-muted">Post-infusion 30-min flush</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-secondary h-100 p-2">
            <div className="text-muted small fw-bold">AVAILABLE BAYS</div>
            <div className="fs-4 fw-bold text-secondary">{availableBays}</div>
            <div className="small text-muted">Sanitized for next cycle</div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & CONTROLS */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {[
          { key: 'ALL', label: `All Bays (${bays.length})` },
          { key: 'INFUSION_ACTIVE', label: `Active Infusion (${activeInfusions})` },
          { key: 'PRE_MEDS', label: `Pre-Medications (${preMedsCount})` },
          { key: 'OBSERVATION', label: `Observation (${observationCount})` },
          { key: 'AVAILABLE', label: `Available (${availableBays})` },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`btn btn-sm px-3 fw-semibold ${filterStatus === item.key ? 'text-white' : 'btn-outline-secondary'}`}
            style={{ backgroundColor: filterStatus === item.key ? '#701a75' : 'transparent', borderColor: filterStatus === item.key ? '#701a75' : undefined }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* INFUSION BAYS GRID */}
      <div className="row g-3">
        {filteredBays.map(bay => {
          const isOccupied = bay.status !== 'AVAILABLE';
          const progressPercent = bay.totalVolumeMl > 0 ? Math.round((bay.infusedVolumeMl / bay.totalVolumeMl) * 100) : 0;

          return (
            <div key={bay.id} className="col-12 col-lg-6">
              <div
                className="card h-100 shadow-sm border-0"
                style={{
                  borderLeft: `5px solid ${
                    bay.status === 'INFUSION_ACTIVE' ? '#16a34a' :
                    bay.status === 'PRE_MEDS' ? '#eab308' :
                    bay.status === 'OBSERVATION' ? '#0284c7' : '#94a3b8'
                  }`,
                  background: darkMode ? '#1e293b' : '#ffffff'
                }}
              >
                {/* CARD HEADER */}
                <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark px-2 py-1 fs-6">BAY {bay.bayNumber}</span>
                    <span className="text-secondary small fw-bold">{bay.type}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge px-2 py-1 text-uppercase ${
                        bay.status === 'INFUSION_ACTIVE' ? 'bg-success' :
                        bay.status === 'PRE_MEDS' ? 'bg-warning text-dark' :
                        bay.status === 'OBSERVATION' ? 'bg-info text-dark' : 'bg-secondary'
                      }`}
                    >
                      {bay.status === 'INFUSION_ACTIVE' && <i className="bi bi-play-circle-fill me-1"></i>}
                      {bay.status.replace('_', ' ')}
                    </span>
                    {bay.dualCheckVerified && (
                      <span className="badge bg-purple text-white" style={{ backgroundColor: '#701a75' }} title="ASCO/ONS Dual Independent RN Verification Complete">
                        <i className="bi bi-check2-all me-1"></i>Dual RN
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="card-body p-3">
                  {!isOccupied ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-check-circle fs-1 text-success opacity-50 mb-2 d-block"></i>
                      <div className="fw-bold">Bay {bay.bayNumber} is Sanitized & Available</div>
                      <div className="small mb-3">Recliner, smart IV infusion pump, and anaphylaxis kit ready</div>
                      <button
                        className="btn btn-sm btn-outline-primary fw-bold px-3"
                        onClick={() => {
                          setAdmitForm(prev => ({ ...prev, bayId: bay.id }));
                          setShowAdmitModal(true);
                        }}
                      >
                        <i className="bi bi-box-arrow-in-right me-1"></i> Admit Oncology Patient
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* PATIENT INFO ROW */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold fs-6 text-dark d-flex align-items-center gap-2">
                            {bay.patientName}
                            <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '11px' }}>
                              {bay.uhid}
                            </span>
                          </div>
                          <div className="text-muted small">
                            {bay.age}Y &bull; {bay.gender} &bull; H: {bay.heightCm}cm W: {bay.weightKg}kg &bull; <strong>BSA: {bay.bsa} m²</strong>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1 fw-bold">
                            Cycle {bay.cycleNumber}/{bay.totalCycles} (Day {bay.cycleDay})
                          </span>
                        </div>
                      </div>

                      {/* DIAGNOSIS & REGIMEN */}
                      <div className="p-2 rounded bg-light border mb-2 small">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Diagnosis:</span>
                          <span className="fw-semibold text-danger">{bay.diagnosis}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span className="text-muted">Regimen:</span>
                          <strong className="text-purple" style={{ color: '#701a75' }}>{bay.regimenName}</strong>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span className="text-muted">Access Line:</span>
                          <span className="text-dark fw-bold">{bay.accessType}</span>
                        </div>
                      </div>

                      {/* LAB READINESS BADGES */}
                      <div className="d-flex flex-wrap gap-1 mb-2 font-monospace" style={{ fontSize: '11px' }}>
                        <span className="badge bg-success-subtle text-success border">ANC: {bay.anc}</span>
                        <span className="badge bg-success-subtle text-success border">Plt: {bay.platelets}</span>
                        <span className="badge bg-secondary-subtle text-dark border">Hb: {bay.hemoglobin}</span>
                        <span className="badge bg-info-subtle text-info border">Cr: {bay.creatinine}</span>
                        <span className="badge bg-light text-muted border">Vesicant: <strong className={bay.vesicantRisk === 'Vesicant' ? 'text-danger' : 'text-warning'}>{bay.vesicantRisk}</strong></span>
                      </div>

                      {/* LIVE INFUSION PUMP STATUS */}
                      <div className="p-2 border rounded bg-white shadow-sm mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="small">
                            <span className="text-muted">Current Drug: </span>
                            <strong className="text-dark">{bay.currentDrug}</strong>
                            <span className="badge bg-secondary ms-1">{bay.currentDose}</span>
                          </div>
                          <div className="small fw-bold text-primary font-monospace">
                            {bay.infusionRateMlHr} mL/hr
                          </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className={`progress-bar progress-bar-striped ${bay.status === 'INFUSION_ACTIVE' ? 'progress-bar-animated bg-success' : 'bg-info'}`}
                            role="progressbar"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1" style={{ fontSize: '10px' }}>
                          <span className="text-muted">{bay.infusedVolumeMl} mL of {bay.totalVolumeMl} mL ({progressPercent}%)</span>
                          <span className="text-muted">Started: {bay.startTime} &bull; Est: {bay.estCompletionTime}</span>
                        </div>
                      </div>

                      {/* ONCOLOGIST & STAFF */}
                      <div className="row g-1 text-muted small mb-2" style={{ fontSize: '11px' }}>
                        <div className="col-6">
                          <i className="bi bi-person-badge me-1"></i>Oncologist: <span className="text-dark fw-bold">{bay.oncologistName}</span>
                        </div>
                        <div className="col-6">
                          <i className="bi bi-shield-check me-1"></i>Primary RN: <span className="text-dark">{bay.primaryNurse}</span>
                        </div>
                      </div>

                      {/* ACTION CONTROLS */}
                      <div className="d-flex flex-wrap gap-1 pt-1 border-top">
                        {bay.status === 'PRE_MEDS' && (
                          <button
                            className="btn btn-success btn-sm fw-bold px-2 py-1"
                            onClick={() => handleStartInfusion(bay.id)}
                          >
                            <i className="bi bi-play-fill me-1"></i> Start Chemo Pump
                          </button>
                        )}

                        {bay.status === 'INFUSION_ACTIVE' && (
                          <>
                            <button
                              className="btn btn-outline-warning btn-sm fw-semibold px-2 py-1"
                              onClick={() => handlePauseResume(bay.id)}
                            >
                              <i className={`bi ${bay.infusionRateMlHr === 0 ? 'bi-play-fill' : 'bi-pause-fill'} me-1`}></i>
                              {bay.infusionRateMlHr === 0 ? 'Resume' : 'Pause'}
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm fw-semibold px-2 py-1"
                              onClick={() => {
                                setRateAdjustModalBay(bay);
                                setTempRate(bay.infusionRateMlHr || 125);
                              }}
                            >
                              <i className="bi bi-sliders me-1"></i> Adjust Rate
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm fw-semibold px-2 py-1"
                              onClick={() => handleProgressStep(bay.id)}
                              title="Simulate +50mL infused"
                            >
                              <i className="bi bi-plus-lg me-1"></i> +50 mL
                            </button>
                          </>
                        )}

                        <button
                          className="btn btn-outline-dark btn-sm fw-semibold px-2 py-1"
                          onClick={() => setSelectedBayForPrint(bay)}
                        >
                          <i className="bi bi-printer me-1"></i> Flowsheet
                        </button>

                        {(bay.status === 'OBSERVATION' || bay.status === 'INFUSION_ACTIVE') && (
                          <button
                            className="btn btn-outline-danger btn-sm fw-semibold px-2 py-1 ms-auto"
                            onClick={() => handleDischargeBay(bay.id)}
                          >
                            <i className="bi bi-box-arrow-right me-1"></i> Discharge
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RATE ADJUST MODAL */}
      {rateAdjustModalBay && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Adjust Infusion Pump Rate: Bay {rateAdjustModalBay.bayNumber}
                </h5>
                <button type="button" className="btn-close" onClick={() => setRateAdjustModalBay(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Patient: <strong>{rateAdjustModalBay.patientName}</strong> &bull; Drug: <strong>{rateAdjustModalBay.currentDrug}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label fw-bold">New Flow Rate (mL/hour):</label>
                  <input
                    type="number"
                    className="form-control form-control-lg font-monospace text-center fw-bold text-primary"
                    value={tempRate}
                    onChange={(e) => setTempRate(Number(e.target.value))}
                    min={5}
                    max={500}
                    step={5}
                  />
                  <div className="form-text">Standard rate range: 50 - 250 mL/hr depending on drug protocol</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRateAdjustModalBay(null)}>Cancel</button>
                <button
                  className="btn btn-primary fw-bold"
                  onClick={() => {
                    setBays(prev => prev.map(b => b.id === rateAdjustModalBay.id ? { ...b, infusionRateMlHr: tempRate } : b));
                    setRateAdjustModalBay(null);
                  }}
                >
                  Confirm & Program Pump
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMISSION MODAL */}
      {showAdmitModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white" style={{ backgroundColor: '#701a75' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2"></i>Daycare Chemotherapy Admission & Protocol Order
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAdmitModal(false)}></button>
              </div>
              <form onSubmit={handleAdmitSubmit}>
                <div className="modal-body p-3">
                  {/* ROW 1: BAY & PATIENT SELECTION */}
                  <div className="row g-2 mb-2">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Target Infusion Bay:</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.bayId}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, bayId: e.target.value }))}
                        required
                      >
                        {bays.map(b => (
                          <option key={b.id} value={b.id}>
                            Bay {b.bayNumber} ({b.status === 'AVAILABLE' ? 'Available' : 'Occupied - Replace'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">Select Registered Patient:</label>
                      <select
                        className="form-select form-select-sm"
                        onChange={(e) => {
                          const p = patients.find(item => String(item.id) === e.target.value);
                          if (p) {
                            setAdmitForm(prev => ({
                              ...prev,
                              patientId: String(p.id),
                              patientName: p.name,
                              uhid: `MRN-2026-${String(p.id).padStart(4, '0')}`,
                              age: p.age || 50,
                              gender: p.gender || 'Female'
                            }));
                          }
                        }}
                      >
                        <option value="">-- Choose from Patient Database --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (MRN-{String(p.id).padStart(4, '0')})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Manual Name (if new):</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.patientName}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, patientName: e.target.value }))}
                        placeholder="Patient Full Name"
                        required
                      />
                    </div>
                  </div>

                  {/* ROW 2: ANTHROPOMETRY & BSA CALCULATION */}
                  <div className="p-2 border rounded bg-light mb-2">
                    <div className="small fw-bold text-secondary mb-1">
                      Body Surface Area (BSA) Dosimetry - Mosteller Formula:
                    </div>
                    <div className="row g-2 align-items-center">
                      <div className="col-3">
                        <label className="form-label small mb-0">Height (cm):</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={admitForm.heightCm}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, heightCm: e.target.value }))}
                          min={100}
                          max={220}
                          required
                        />
                      </div>
                      <div className="col-3">
                        <label className="form-label small mb-0">Weight (kg):</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={admitForm.weightKg}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, weightKg: e.target.value }))}
                          min={30}
                          max={200}
                          required
                        />
                      </div>
                      <div className="col-3">
                        <label className="form-label small mb-0">Calculated BSA:</label>
                        <div className="badge bg-dark fs-6 d-block py-2">
                          {calculatedBsa} m²
                        </div>
                      </div>
                      <div className="col-3">
                        <label className="form-label small mb-0">Vascular Access:</label>
                        <select
                          className="form-select form-select-sm"
                          value={admitForm.accessType}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, accessType: e.target.value }))}
                        >
                          <option value="Subcutaneous Chemoport (Right Subclavian)">Chemoport (Right Subclavian)</option>
                          <option value="Subcutaneous Chemoport (Left Chest)">Chemoport (Left Chest)</option>
                          <option value="PICC Line (Right Basilic)">PICC Line (Right Basilic)</option>
                          <option value="Peripheral IV Catheter (18G/20G)">Peripheral IV Catheter</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ROW 3: REGIMEN & DIAGNOSIS */}
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Select Oncology Protocol / Regimen:</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.regimenName}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, regimenName: e.target.value }))}
                      >
                        {COMMON_REGIMENS.map((r, i) => (
                          <option key={i} value={r.name}>{r.name} - ({r.cancer})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Primary Histopathologic Diagnosis:</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={admitForm.diagnosis}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* ROW 4: CYCLE & ONCOLOGIST */}
                  <div className="row g-2 mb-2">
                    <div className="col-2">
                      <label className="form-label small mb-0 fw-bold">Cycle No:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={admitForm.cycleNumber}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, cycleNumber: Number(e.target.value) }))}
                        min={1}
                        max={12}
                      />
                    </div>
                    <div className="col-2">
                      <label className="form-label small mb-0 fw-bold">Total Cycles:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={admitForm.totalCycles}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, totalCycles: Number(e.target.value) }))}
                        min={1}
                        max={12}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small mb-0 fw-bold">Medical Oncologist:</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.oncologistName}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, oncologistName: e.target.value }))}
                      >
                        {doctors.length > 0 ? (
                          doctors.map(d => (
                            <option key={d.id} value={formatDoctorName(d.name)}>{formatDoctorName(d.name)} ({d.specialization || 'Oncology'})</option>
                          ))
                        ) : (
                          <>
                            <option value="Dr. Vikram Malhotra">Dr. Vikram Malhotra (Medical Oncology)</option>
                            <option value="Dr. Anand K. Sen">Dr. Anand K. Sen (Medical Oncology)</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="col-4">
                      <label className="form-label small mb-0 fw-bold">Treatment Intent:</label>
                      <select
                        className="form-select form-select-sm"
                        value={admitForm.intent}
                        onChange={(e) => setAdmitForm(prev => ({ ...prev, intent: e.target.value }))}
                      >
                        <option value="Adjuvant Chemotherapy">Adjuvant Chemotherapy</option>
                        <option value="Neoadjuvant Chemotherapy">Neoadjuvant Chemotherapy</option>
                        <option value="Curative Immunochemotherapy">Curative Immunochemotherapy</option>
                        <option value="Palliative Disease Control">Palliative Disease Control</option>
                      </select>
                    </div>
                  </div>

                  {/* ROW 5: LAB CLEARANCE CHECK */}
                  <div className="p-2 border rounded bg-white">
                    <div className="small fw-bold text-success mb-1">
                      <i className="bi bi-shield-check me-1"></i>Pre-Infusion Lab Safeguards (Mandatory within 48h):
                    </div>
                    <div className="row g-2 text-center" style={{ fontSize: '11px' }}>
                      <div className="col-3">
                        <span className="text-muted d-block">ANC:</span>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center"
                          value={admitForm.anc}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, anc: e.target.value }))}
                        />
                      </div>
                      <div className="col-3">
                        <span className="text-muted d-block">Platelets:</span>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center"
                          value={admitForm.platelets}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, platelets: e.target.value }))}
                        />
                      </div>
                      <div className="col-3">
                        <span className="text-muted d-block">Hemoglobin:</span>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center"
                          value={admitForm.hemoglobin}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, hemoglobin: e.target.value }))}
                        />
                      </div>
                      <div className="col-3">
                        <span className="text-muted d-block">Creatinine:</span>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center"
                          value={admitForm.creatinine}
                          onChange={(e) => setAdmitForm(prev => ({ ...prev, creatinine: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAdmitModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#701a75' }}>
                    <i className="bi bi-check-circle-fill me-1"></i> Confirm Admission & Pre-Meds
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EXTRAVASATION & ANTIDOTES CLINICAL GUIDE MODAL */}
      {showExtravasationGuide && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>ASCO / EONS Cytotoxic Extravasation Emergency Protocol
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowExtravasationGuide(false)}></button>
              </div>
              <div className="modal-body p-3" style={{ fontSize: '13px' }}>
                <div className="alert alert-danger fw-bold py-2 mb-3">
                  IMMEDIATE ACTION: 1. Stop infusion immediately. 2. Do NOT remove IV cannula yet. 3. Aspirate 3-5 mL blood/fluid through catheter. 4. Elevate limb.
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Drug Classification</th>
                        <th>Common Chemotherapeutic Agents</th>
                        <th>Thermal Management</th>
                        <th>Specific Antidote / Clinical Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold text-danger">Anthracyclines (DNA-Binding Vesicants)</td>
                        <td>Doxorubicin (Adriamycin), Daunorubicin, Epirubicin</td>
                        <td><span className="badge bg-primary">COLD PACK</span> 20 min qid x 3 days</td>
                        <td>
                          <strong>Dexrazoxane (Savene/Totect):</strong> 1000 mg/m² IV within 6 hrs, then 1000 mg/m² day 2, 500 mg/m² day 3.<br />
                          Alternative: Topical DMSO 99% every 8 hrs x 7-14 days.
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-warning text-dark">Vinca Alkaloids (Non-DNA Binding Vesicants)</td>
                        <td>Vincristine, Vinblastine, Vinorelbine</td>
                        <td><span className="badge bg-danger">WARM PACK</span> (Cold is contraindicated)</td>
                        <td>
                          <strong>Hyaluronidase:</strong> 150-300 units injected subcutaneously around extravasation site in clockwise clock face pattern.
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-dark">Taxanes & Platinum Irritants</td>
                        <td>Paclitaxel, Docetaxel, Cisplatin, Oxaliplatin</td>
                        <td><span className="badge bg-primary">COLD / WARM</span> (Oxaliplatin: WARM only, cold induces pharyngolaryngeal spasm)</td>
                        <td>
                          Sodium Thiosulfate 1/6 M for Cisplatin (&gt;20 mL extravasation).<br />
                          Hyaluronidase subcutaneous for severe Taxane swelling.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-2 bg-light border rounded">
                  <span className="fw-bold text-secondary">Document in Chart:</span> Exact date/time, estimated volume extravasated, photo documentation of site, patient pain score (0-10), antidote administered, and plastic surgery consultation if ulceration develops.
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowExtravasationGuide(false)}>Close Protocol</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL */}
      {selectedBayForPrint && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Official Chemotherapy Administration Flowsheet: Bay {selectedBayForPrint.bayNumber}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBayForPrint(null)}></button>
              </div>
              <div className="modal-body p-0 printable-area">
                <ChemoAdministrationSlip session={selectedBayForPrint} />
              </div>
              <div className="modal-footer no-print">
                <button className="btn btn-secondary" onClick={() => setSelectedBayForPrint(null)}>Close</button>
                <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#701a75' }} onClick={() => window.print()}>
                  <i className="bi bi-printer-fill me-2"></i> Print Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
