import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MedicineService from '../../services/MedicineService';
import PrescriptionService from '../../services/PrescriptionService';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import PrintModal from '../common/PrintModal';
import PharmacyDispenseSlip from './PharmacyDispenseSlip';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'Antibiotics',
  'Cardiovascular',
  'Pain Relief',
  'Vitamins & Minerals',
  'Respiratory',
  'Antidiabetic',
  'Neurological',
  'Dermatology',
  'Gastrointestinal',
  'Other'
];

const INITIAL_FORM = {
  name: '',
  genericName: '',
  category: 'Antibiotics',
  manufacturer: '',
  price: '',
  stock: '',
  unit: 'Tablet',
  expiryDate: ''
};

const DEMO_MEDICINES = [
  { id: 1, name: 'Paracetamol 650mg', genericName: 'Acetaminophen', category: 'Pain Relief', manufacturer: 'GSK Healthcare', price: 32.50, stock: 120, unit: 'Tablet', expiryDate: '2027-08-31' },
  { id: 2, name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Gastrointestinal', manufacturer: 'Alkem Labs', price: 85.00, stock: 95, unit: 'Tablet', expiryDate: '2027-11-30' },
  { id: 3, name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotics', manufacturer: 'Cipla Ltd', price: 110.00, stock: 45, unit: 'Capsule', expiryDate: '2026-12-31' },
  { id: 4, name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotics', manufacturer: 'Sun Pharma', price: 125.00, stock: 24, unit: 'Tablet', expiryDate: '2027-04-30' },
  { id: 5, name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Respiratory', manufacturer: 'Dr. Reddy', price: 28.00, stock: 160, unit: 'Tablet', expiryDate: '2028-01-15' },
  { id: 6, name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Torrent Pharma', price: 42.00, stock: 210, unit: 'Tablet', expiryDate: '2027-09-30' },
  { id: 7, name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', manufacturer: 'Lupin Ltd', price: 98.00, stock: 75, unit: 'Tablet', expiryDate: '2027-06-30' },
  { id: 8, name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan + CPM', category: 'Respiratory', manufacturer: 'Dabur Pharma', price: 85.00, stock: 35, unit: 'Syrup (ml)', expiryDate: '2026-10-31' }
];

const FALLBACK_PRESCRIPTIONS = [
  {
    id: 10482,
    patientName: 'John Doe',
    patientAge: 32,
    patientGender: 'Male',
    doctorName: 'Dr. Rahul Dey',
    department: 'General Medicine',
    date: new Date().toISOString().split('T')[0],
    diagnosis: 'Viral Upper Respiratory Infection',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'Take after meals', quantity: 10 },
      { name: 'Pantoprazole 40mg', dosage: '1 Tablet', frequency: '1-0-0', duration: '5 Days', instructions: 'Take before breakfast', quantity: 5 }
    ]
  },
  {
    id: 10485,
    patientName: 'Emma Watson',
    patientAge: 28,
    patientGender: 'Female',
    doctorName: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    diagnosis: 'Hypertension Stage 1 Review',
    medicines: [
      { name: 'Atorvastatin 10mg', dosage: '1 Tablet', frequency: '0-0-1', duration: '30 Days', instructions: 'Take at bedtime', quantity: 30 }
    ]
  }
];

function PharmacyPanel({
  role = 'ADMIN',
  prescriptions = [],
  patients = [],
  doctors = [],
  searchQuery = '',
  darkMode = false,
  onDataRefresh
}) {
  const [activeMainTab, setActiveMainTab] = useState('INVENTORY'); // 'INVENTORY' | 'DISPENSE'
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);

  // Dispensing Desk states
  const [dispensedRxIds, setDispensedRxIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hospitalsync_dispensed_rx') || '[]');
    } catch {
      return [];
    }
  });
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [dispensingId, setDispensingId] = useState(null);
  const [printDispenseSlip, setPrintDispenseSlip] = useState(null);
  const [dispenseSearch, setDispenseSearch] = useState('');
  const [dispenseFilter, setDispenseFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'DISPENSED'

  const pendingRxCount = useMemo(() => {
    return allPrescriptions.filter(p => !dispensedRxIds.includes(p.id)).length;
  }, [allPrescriptions, dispensedRxIds]);

  const filteredDispenseList = useMemo(() => {
    return allPrescriptions.filter(p => {
      const isDispensed = dispensedRxIds.includes(p.id);
      if (dispenseFilter === 'PENDING' && isDispensed) return false;
      if (dispenseFilter === 'DISPENSED' && !isDispensed) return false;

      if (dispenseSearch) {
        const q = dispenseSearch.toLowerCase();
        const pName = (p.patientName || '').toLowerCase();
        const dName = (p.doctorName || '').toLowerCase();
        const rxId = String(p.id || '');
        return pName.includes(q) || dName.includes(q) || rxId.includes(q);
      }
      return true;
    });
  }, [allPrescriptions, dispensedRxIds, dispenseFilter, dispenseSearch]);

  const fetchMedicines = () => {
    setLoading(true);

    MedicineService.getAllMedicines()
      .then(res => {
        const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEMO_MEDICINES;
        setMedicines(data);
      })
      .catch(() => {
        setMedicines(DEMO_MEDICINES);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedicines();

    // Fetch prescriptions for Dispense Desk
    PrescriptionService.getAllPrescriptions()
      .then(res => {
        const remote = Array.isArray(res.data) && res.data.length > 0 ? res.data : [];
        const combined = [...remote, ...FALLBACK_PRESCRIPTIONS];
        const unique = [];
        const seen = new Set();
        combined.forEach(p => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            unique.push(p);
          }
        });
        setAllPrescriptions(unique);
      })
      .catch(() => {
        const combined = Array.isArray(prescriptions) && prescriptions.length > 0 ? prescriptions : FALLBACK_PRESCRIPTIONS;
        setAllPrescriptions(combined);
      });

    // Real-time listener for incoming prescriptions
    const unsubscribe = RealtimeNotificationHub.subscribe(notif => {
      if (notif.type === 'PRESCRIPTION_NOTIFICATION') {
        const newRx = {
          id: notif.meta?.prescriptionId || Date.now(),
          patientName: notif.patientName || 'New Patient',
          doctorName: notif.doctorName || 'Dr. Specialist',
          department: 'General OPD',
          date: new Date().toISOString().split('T')[0],
          diagnosis: 'Doctor Consultation Rx',
          medicines: notif.meta?.medicines || [
            { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days', quantity: 10 }
          ]
        };
        setAllPrescriptions(prev => [newRx, ...prev.filter(p => p.id !== newRx.id)]);
      }
    });

    return () => unsubscribe();
  }, [prescriptions]);

  const handleDispense = async (rx) => {
    try {
      setDispensingId(rx.id);

      const rxMeds = Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines : [
        { name: rx.medicineName || 'Paracetamol 650mg', quantity: 10, dosage: rx.dosage || '1 Tab' }
      ];

      const updatedMedicines = [...medicines];
      const dispensedItems = [];

      for (const item of rxMeds) {
        const medNameLower = (item.name || '').toLowerCase().trim();
        const foundIdx = updatedMedicines.findIndex(m =>
          (m.name || '').toLowerCase().includes(medNameLower) ||
          medNameLower.includes((m.name || '').toLowerCase())
        );

        const qtyToDeduct = Number(item.quantity || (item.duration?.includes('30') ? 30 : item.duration?.includes('14') ? 14 : 10));

        if (foundIdx !== -1) {
          const matchedMed = updatedMedicines[foundIdx];
          const newStock = Math.max(0, (Number(matchedMed.stock) || 0) - qtyToDeduct);
          updatedMedicines[foundIdx] = { ...matchedMed, stock: newStock };

          dispensedItems.push({
            name: matchedMed.name,
            dosage: item.dosage || '1 Tab',
            qty: qtyToDeduct,
            price: Number(matchedMed.price) || 35.00,
            batchNo: `BAT-2026${matchedMed.id}X`
          });

          try {
            await MedicineService.updateMedicine(matchedMed.id, {
              ...matchedMed,
              stock: newStock
            });
          } catch (e) {
            console.debug('Backend medicine stock update:', e);
          }
        } else {
          dispensedItems.push({
            name: item.name,
            dosage: item.dosage || '1 Tab',
            qty: qtyToDeduct,
            price: 45.00,
            batchNo: 'BAT-GENERIC'
          });
        }
      }

      setMedicines(updatedMedicines);

      const nextDispensed = [...dispensedRxIds, rx.id];
      setDispensedRxIds(nextDispensed);
      localStorage.setItem('hospitalsync_dispensed_rx', JSON.stringify(nextDispensed));

      playHospitalAlertChime();
      RealtimeNotificationHub.publishNotification({
        type: 'PAYMENT_CONFIRMATION',
        title: 'Medications Dispensed',
        message: `Medications for ${rx.patientName || 'Patient'} (Rx-${rx.id}) successfully dispensed. Ready for billing checkout.`,
        targetRoles: ['ADMIN', 'ACCOUNTANT', 'PATIENT'],
        patientName: rx.patientName,
        doctorName: rx.doctorName,
        meta: { rxId: rx.id, dispensedItems }
      });

      toast.success(`Rx-${rx.id} dispensed! Stock deducted from inventory.`);

      setPrintDispenseSlip({ rx, items: dispensedItems });
    } catch (err) {
      console.error('Dispense error:', err);
      toast.error('Failed to dispense medications.');
    } finally {
      setDispensingId(null);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    MedicineService.createMedicine({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10)
    })
      .then(() => {
        toast.success('Medicine added successfully!');
        setForm(INITIAL_FORM);
        setShowForm(false);
        fetchMedicines();
      })
      .catch(() => toast.error('Failed to add medicine.'));
  };

  const handleDelete = id => {
    if (!window.confirm('Remove this medicine from inventory?')) return;

    MedicineService.deleteMedicine(id)
      .then(() => {
        toast.success('Medicine removed.');
        fetchMedicines();
      })
      .catch(() => toast.error('Delete failed.'));
  };

  const getStockState = stock => {
    const quantity = Number(stock) || 0;

    if (quantity <= 20) {
      return {
        label: 'Critical',
        icon: 'bi-exclamation-octagon-fill',
        color: '#dc2626',
        soft: '#fef2f2',
        border: '#fecaca',
        width: Math.min(100, Math.max(8, quantity * 4))
      };
    }

    if (quantity <= 100) {
      return {
        label: 'Low Stock',
        icon: 'bi-exclamation-triangle-fill',
        color: '#d97706',
        soft: '#fffbeb',
        border: '#fde68a',
        width: Math.min(100, quantity)
      };
    }

    return {
      label: 'Healthy',
      icon: 'bi-check-circle-fill',
      color: '#059669',
      soft: '#ecfdf5',
      border: '#a7f3d0',
      width: Math.min(100, Math.max(30, quantity / 10))
    };
  };

  const isExpiringSoon = dateStr => {
    if (!dateStr) return false;

    const diff =
      (new Date(dateStr) - new Date()) /
      (1000 * 60 * 60 * 24);

    return diff >= 0 && diff < 90;
  };

  const isExpired = dateStr => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const filtered = medicines.filter(medicine => {
    const search = searchTerm.toLowerCase().trim();

    const matchSearch =
      !search ||
      medicine.name?.toLowerCase().includes(search) ||
      medicine.genericName?.toLowerCase().includes(search) ||
      medicine.manufacturer?.toLowerCase().includes(search);

    const matchCategory =
      !categoryFilter ||
      medicine.category === categoryFilter;

    const matchStock =
      !stockFilter ||
      (stockFilter === 'critical' && medicine.stock <= 20) ||
      (stockFilter === 'low' &&
        medicine.stock > 20 &&
        medicine.stock <= 100) ||
      (stockFilter === 'ok' && medicine.stock > 100);

    return matchSearch && matchCategory && matchStock;
  });

  const stats = {
    total: medicines.length,
    critical: medicines.filter(m => m.stock <= 20).length,
    low: medicines.filter(
      m => m.stock > 20 && m.stock <= 100
    ).length,
    expiring: medicines.filter(m =>
      isExpiringSoon(m.expiryDate)
    ).length
  };

  const totalUnits = medicines.reduce(
    (sum, medicine) => sum + (Number(medicine.stock) || 0),
    0
  );

  const updateForm = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <style>{`
        .pharmacy-shell {
          --pharmacy-primary: #047857;
          --pharmacy-primary-dark: #065f46;
          --pharmacy-primary-light: #ecfdf5;
          --pharmacy-accent: #14b8a6;
          --pharmacy-text: #0f172a;
          --pharmacy-muted: #64748b;
          --pharmacy-border: #e2e8f0;
          --pharmacy-bg: #f7f9fc;
          color: var(--pharmacy-text);
        }

        .pharmacy-hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 22px;
          background:
            radial-gradient(circle at 90% 10%, rgba(20, 184, 166, .16), transparent 30%),
            radial-gradient(circle at 65% 120%, rgba(4, 120, 87, .10), transparent 35%),
            linear-gradient(135deg, #ffffff 0%, #f5fffb 100%);
          border: 1px solid #dcefe8;
          box-shadow: 0 12px 35px rgba(15, 23, 42, .05);
        }

        .pharmacy-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          margin-bottom: 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, .09);
          border: 1px solid rgba(16, 185, 129, .16);
          color: #047857;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .pharmacy-hero-title {
          font-size: clamp(1.45rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -.045em;
          margin: 0;
        }

        .pharmacy-hero-subtitle {
          color: var(--pharmacy-muted);
          font-size: 13px;
          margin: 7px 0 0;
          max-width: 620px;
        }

        .pharmacy-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 18px;
          border: 0;
          border-radius: 13px;
          color: white;
          background: linear-gradient(135deg, #047857, #0d9488);
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(5, 150, 105, .22);
          transition: all .2s ease;
        }

        .pharmacy-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 20px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }

        .pharmacy-nav-tab:hover {
          background: #047857 !important;
          color: #ffffff !important;
          border-color: #047857 !important;
          box-shadow: 0 6px 18px rgba(4, 120, 87, 0.28);
          transform: translateY(-1px);
        }

        .pharmacy-nav-tab.dispense-tab {
          border-color: #cbd5e1;
        }

        .pharmacy-nav-tab.dispense-tab:hover {
          background: #0f766e !important; /* Premium Dark Teal - hover is rich color, never white */
          color: #ffffff !important;
          border-color: #0f766e !important;
          box-shadow: 0 6px 18px rgba(15, 118, 110, 0.32);
          transform: translateY(-1px);
        }

        .pharmacy-nav-tab.active-inventory {
          background: linear-gradient(135deg, #047857, #059669) !important;
          color: #ffffff !important;
          border-color: #047857 !important;
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.28);
        }

        .pharmacy-nav-tab.active-inventory:hover {
          background: #065f46 !important;
          color: #ffffff !important;
        }

        .pharmacy-nav-tab.active-dispense {
          background: linear-gradient(135deg, #0d9488, #0f766e) !important;
          color: #ffffff !important;
          border-color: #0d9488 !important;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
        }

        .pharmacy-nav-tab.active-dispense:hover {
          background: #064e3b !important;
          color: #ffffff !important;
        }

        .pharmacy-stat {
          position: relative;
          overflow: hidden;
          padding: 18px;
          border-radius: 20px;
          background: white;
          border: 1px solid #eef2f6;
          box-shadow: 0 8px 20px rgba(15, 23, 42, .035);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--stat-soft);
          color: var(--stat-color);
          border: 1px solid var(--stat-border);
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1.1;
          color: #0f172a;
          margin: 4px 0 2px;
        }

        .stat-meta {
          font-size: 11px;
          color: #94a3b8;
        }

        .premium-panel {
          border-radius: 24px;
          background: white;
          border: 1px solid #edf2f7;
          box-shadow: 0 10px 30px rgba(15, 23, 42, .04);
          overflow: hidden;
        }

        .panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid #edf2f7;
          background: white;
        }

        .panel-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #d1fae5;
        }

        .panel-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .panel-subtitle {
          font-size: 11px;
          color: #64748b;
        }

        .premium-form {
          padding: 24px;
          background: #fbfdfc;
        }

        .form-group-card {
          padding: 12px;
          border-radius: 14px;
          background: white;
          border: 1px solid #e7ebf0;
        }

        .premium-label {
          display: block;
          margin-bottom: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .03em;
          text-transform: uppercase;
          color: #475569;
        }

        .premium-control {
          border-radius: 10px !important;
          border: 1px solid #dce2e8 !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e9edf2;
        }

        .premium-cancel {
          height: 42px;
          padding: 0 18px;
          border-radius: 11px;
          border: 1px solid #d5dbe2;
          background: white;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
        }

        .premium-submit {
          height: 42px;
          padding: 0 20px;
          border-radius: 11px;
          border: 0;
          background: linear-gradient(135deg, #047857, #059669);
          color: white;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 7px 16px rgba(5, 150, 105, .20);
        }

        .filters-bar {
          padding: 15px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e7ebf0;
        }

        .inventory-table {
          margin: 0;
          width: 100%;
        }

        .inventory-table thead th {
          padding: 13px 14px;
          border-bottom: 1px solid #e8edf2;
          background: #fafbfc;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .inventory-table tbody td {
          padding: 14px;
          border-color: #edf1f4;
          vertical-align: middle;
        }

        .stock-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid;
          width: fit-content;
        }

        .stock-bar {
          width: 100%;
          max-width: 100px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
        }

        .stock-bar-fill {
          height: 100%;
          border-radius: 99px;
        }
      `}</style>

      <div className="pharmacy-shell">
        {/* =====================================================
            HERO
        ====================================================== */}
        <div className="pharmacy-hero">
          <div className="row align-items-center g-4 position-relative">
            <div className="col-lg">
              <div className="pharmacy-eyebrow">
                <i className="bi bi-shield-check" />
                Pharmacy Operations & Dispensing
              </div>

              <h1 className="pharmacy-hero-title">
                Medicine Inventory & Dispensing
              </h1>

              <p className="pharmacy-hero-subtitle">
                Monitor medication availability, stock health, dispense doctor prescriptions, and print verified pharmacy invoices.
              </p>
            </div>

            <div className="col-lg-auto pharmacy-hero-actions d-flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={`pharmacy-nav-tab ${
                  activeMainTab === 'INVENTORY' ? 'active-inventory' : ''
                }`}
                onClick={() => setActiveMainTab('INVENTORY')}
              >
                <i className="bi bi-grid-fill"></i>
                Medicine Catalog
              </button>

              <button
                type="button"
                className={`pharmacy-nav-tab dispense-tab ${
                  activeMainTab === 'DISPENSE' ? 'active-dispense' : ''
                }`}
                onClick={() => setActiveMainTab('DISPENSE')}
              >
                <i className={`bi bi-bag-check-fill ${activeMainTab === 'DISPENSE' ? 'text-warning' : 'text-teal'}`}></i>
                Dispensing Desk
                {pendingRxCount > 0 && (
                  <span className={`badge rounded-pill ms-1 fw-bold ${activeMainTab === 'DISPENSE' ? 'bg-warning text-dark' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}`} style={{ fontSize: 10 }}>
                    {pendingRxCount} Pending
                  </span>
                )}
              </button>

              {activeMainTab === 'INVENTORY' && (
                <button
                  type="button"
                  className="pharmacy-add-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  <i className={`bi ${showForm ? 'bi-chevron-up' : 'bi-plus-lg'}`} />
                  {showForm ? 'Close Form' : 'Add Medicine'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT VIEWS
        ====================================================== */}
        {activeMainTab === 'INVENTORY' ? (
          <>
            {/* STATS */}
            <div className="row g-3 mb-4">
              {[
                {
                  label: 'Total Medicines',
                  value: stats.total,
                  meta: `${totalUnits.toLocaleString()} units in inventory`,
                  icon: 'bi-capsule-pill',
                  color: '#2563eb',
                  soft: '#eff6ff',
                  border: '#dbeafe'
                },
                {
                  label: 'Critical Stock',
                  value: stats.critical,
                  meta: 'Immediate attention required',
                  icon: 'bi-exclamation-octagon-fill',
                  color: '#dc2626',
                  soft: '#fef2f2',
                  border: '#fecaca'
                },
                {
                  label: 'Low Stock',
                  value: stats.low,
                  meta: 'Consider replenishment',
                  icon: 'bi-arrow-down-circle-fill',
                  color: '#d97706',
                  soft: '#fffbeb',
                  border: '#fde68a'
                },
                {
                  label: 'Expiring Soon',
                  value: stats.expiring,
                  meta: 'Within next 90 days',
                  icon: 'bi-calendar-x-fill',
                  color: '#7c3aed',
                  soft: '#f5f3ff',
                  border: '#ddd6fe'
                }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="col-6 col-xl-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div
                    className="pharmacy-stat"
                    style={{
                      '--stat-color': stat.color,
                      '--stat-soft': stat.soft,
                      '--stat-border': stat.border
                    }}
                  >
                    <div className="d-flex align-items-center gap-3 position-relative">
                      <div className="stat-icon">
                        <i className={`bi ${stat.icon} fs-5`} />
                      </div>
                      <div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-meta">{stat.meta}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ADD MEDICINE FORM */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="premium-panel mb-4">
                    <div className="panel-header">
                      <div className="d-flex align-items-center gap-3">
                        <div className="panel-icon">
                          <i className="bi bi-bag-plus-fill fs-5" />
                        </div>
                        <div>
                          <div className="panel-title">Add Medicine to Stock</div>
                          <div className="panel-subtitle">Enter details to record new medication inventory batch.</div>
                        </div>
                      </div>
                    </div>

                    <div className="premium-form">
                      <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                          <div className="col-12 col-lg-4">
                            <div className="form-group-card">
                              <label className="premium-label">Brand / Product Name</label>
                              <input
                                type="text"
                                className="form-control premium-control"
                                placeholder="e.g. Paracetamol 650mg"
                                value={form.name}
                                onChange={e => updateForm('name', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-12 col-lg-4">
                            <div className="form-group-card">
                              <label className="premium-label">Generic Name</label>
                              <input
                                type="text"
                                className="form-control premium-control"
                                placeholder="e.g. Acetaminophen"
                                value={form.genericName}
                                onChange={e => updateForm('genericName', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-12 col-lg-4">
                            <div className="form-group-card">
                              <label className="premium-label">Category</label>
                              <select
                                className="form-select premium-control"
                                value={form.category}
                                onChange={e => updateForm('category', e.target.value)}
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="col-12 col-lg-3">
                            <div className="form-group-card">
                              <label className="premium-label">Manufacturer</label>
                              <input
                                type="text"
                                className="form-control premium-control"
                                placeholder="e.g. Cipla Ltd"
                                value={form.manufacturer}
                                onChange={e => updateForm('manufacturer', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="col-6 col-lg-3">
                            <div className="form-group-card">
                              <label className="premium-label">Unit Price (₹)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="form-control premium-control"
                                placeholder="0.00"
                                value={form.price}
                                onChange={e => updateForm('price', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-6 col-lg-3">
                            <div className="form-group-card">
                              <label className="premium-label">Stock Quantity</label>
                              <input
                                type="number"
                                min="0"
                                className="form-control premium-control"
                                placeholder="0"
                                value={form.stock}
                                onChange={e => updateForm('stock', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-12 col-lg-3">
                            <div className="form-group-card">
                              <label className="premium-label">Expiry Date</label>
                              <input
                                type="date"
                                className="form-control premium-control"
                                value={form.expiryDate}
                                onChange={e => updateForm('expiryDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="premium-cancel"
                            onClick={() => {
                              setForm(INITIAL_FORM);
                              setShowForm(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="premium-submit">
                            <i className="bi bi-check2-circle me-2" />
                            Add to Inventory
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INVENTORY TABLE PANEL */}
            <div className="premium-panel">
              <div className="panel-header">
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="panel-icon">
                      <i className="bi bi-grid-1x2-fill" />
                    </div>
                    <div>
                      <div className="panel-title">Medicine Catalog & Stock</div>
                      <div className="panel-subtitle">Search, filter and monitor your hospital medication inventory.</div>
                    </div>
                  </div>
                  <span className="badge bg-light text-secondary border px-3 py-2 fw-bold">
                    {filtered.length} Items Listed
                  </span>
                </div>
              </div>

              {/* FILTERS */}
              <div className="p-3">
                <div className="filters-bar">
                  <div className="row g-2">
                    <div className="col-12 col-lg-5">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search by medicine, generic name or manufacturer..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-lg-4">
                      <select
                        className="form-select form-select-sm"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 col-lg-3">
                      <select
                        className="form-select form-select-sm"
                        value={stockFilter}
                        onChange={e => setStockFilter(e.target.value)}
                      >
                        <option value="">All Stock Levels</option>
                        <option value="critical">Critical (&le; 20 units)</option>
                        <option value="low">Low Stock (21-100 units)</option>
                        <option value="ok">Healthy (&gt; 100 units)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="table-responsive">
                <table className="table inventory-table align-middle">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th>Manufacturer</th>
                      <th>Unit Price</th>
                      <th>Stock Availability</th>
                      <th>Expiry</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(medicine => {
                      const stockState = getStockState(medicine.stock);
                      return (
                        <tr key={medicine.id}>
                          <td>
                            <div className="fw-bold text-dark">{medicine.name}</div>
                            <small className="text-muted">{medicine.genericName}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-secondary border">{medicine.category}</span>
                          </td>
                          <td className="small text-secondary">{medicine.manufacturer || '—'}</td>
                          <td className="fw-bold text-dark">₹{Number(medicine.price || 0).toFixed(2)}</td>
                          <td>
                            <div className="stock-wrapper">
                              <span
                                className="stock-pill"
                                style={{
                                  color: stockState.color,
                                  background: stockState.soft,
                                  borderColor: stockState.border
                                }}
                              >
                                <i className={`bi ${stockState.icon}`} />
                                {stockState.label} · {medicine.stock} {medicine.unit || 'Units'}
                              </span>
                              <div className="stock-bar">
                                <div
                                  className="stock-bar-fill"
                                  style={{
                                    width: `${stockState.width}%`,
                                    background: stockState.color
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="small text-secondary">{medicine.expiryDate || '—'}</td>
                          <td className="text-end pe-4">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              title="Remove medicine"
                              onClick={() => handleDelete(medicine.id)}
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* =====================================================
              PRESCRIPTION DISPENSING DESK
          ====================================================== */
          <div className="dispense-desk">
            {/* METRICS ROW */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning-emphasis" style={{ width: 46, height: 46, fontSize: 22 }}>
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                  <div>
                    <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Awaiting Dispense</small>
                    <div className="fs-4 fw-bold text-dark">{pendingRxCount} Orders</div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success" style={{ width: 46, height: 46, fontSize: 22 }}>
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <div>
                    <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Dispensed & Checked Out</small>
                    <div className="fs-4 fw-bold text-dark">{dispensedRxIds.length} Prescriptions</div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white rounded-4 border shadow-xs d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary" style={{ width: 46, height: 46, fontSize: 22 }}>
                    <i className="bi bi-box-seam-fill"></i>
                  </div>
                  <div>
                    <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: 10 }}>Inventory Items</small>
                    <div className="fs-4 fw-bold text-dark">{medicines.length} Formulations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOOLBAR */}
            <div className="p-3 bg-white rounded-4 border shadow-xs mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn btn-sm px-3 py-1 rounded-pill fw-bold ${dispenseFilter === 'ALL' ? 'btn-primary text-white' : 'btn-light text-secondary'}`}
                  onClick={() => setDispenseFilter('ALL')}
                >
                  All Orders ({allPrescriptions.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm px-3 py-1 rounded-pill fw-bold ${dispenseFilter === 'PENDING' ? 'btn-warning text-dark' : 'btn-light text-secondary'}`}
                  onClick={() => setDispenseFilter('PENDING')}
                >
                  <i className="bi bi-clock me-1"></i> Pending Dispense ({pendingRxCount})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm px-3 py-1 rounded-pill fw-bold ${dispenseFilter === 'DISPENSED' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                  onClick={() => setDispenseFilter('DISPENSED')}
                >
                  <i className="bi bi-check-lg me-1"></i> Dispensed ({dispensedRxIds.length})
                </button>
              </div>

              <div style={{ maxWidth: 280, width: '100%' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search patient, doctor, Rx #..."
                  value={dispenseSearch}
                  onChange={(e) => setDispenseSearch(e.target.value)}
                />
              </div>
            </div>

            {/* PRESCRIPTION CARDS LIST */}
            <div className="d-flex flex-column gap-3">
              {filteredDispenseList.length === 0 ? (
                <div className="text-center p-5 bg-white rounded-4 border text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50"></i>
                  <h6>No prescriptions matching filter</h6>
                  <p className="small mb-0">When doctors issue prescriptions in OPD Consultation, they appear here live for dispensing.</p>
                </div>
              ) : (
                filteredDispenseList.map((rx) => {
                  const isDispensed = dispensedRxIds.includes(rx.id);
                  const rxMeds = Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines : [
                    { name: rx.medicineName || 'Paracetamol 650mg', dosage: rx.dosage || '1 Tab', duration: rx.duration || '5 Days' }
                  ];

                  return (
                    <motion.div
                      key={rx.id}
                      className="bg-white rounded-4 border p-4 shadow-xs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`d-flex align-items-center justify-content-center rounded-3 ${isDispensed ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`} style={{ width: 44, height: 44, fontSize: 20 }}>
                            <i className="bi bi-prescription2"></i>
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <h6 className="fw-bold mb-0 text-dark">Rx-{rx.id}</h6>
                              {isDispensed ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: 10 }}>
                                  <i className="bi bi-check-circle-fill me-1"></i> DISPENSED
                                </span>
                              ) : (
                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold" style={{ fontSize: 10 }}>
                                  <i className="bi bi-hourglass-split me-1"></i> PENDING DISPENSE
                                </span>
                              )}
                            </div>
                            <small className="text-muted">
                              Patient: <strong className="text-dark">{rx.patientName || 'Patient'}</strong> · Specialist: <strong className="text-dark">{rx.doctorName || 'Dr. Specialist'}</strong> ({rx.department || 'General OPD'})
                            </small>
                          </div>
                        </div>

                        <div className="text-end">
                          <small className="text-muted d-block" style={{ fontSize: 11 }}>Date of Rx</small>
                          <span className="fw-bold text-dark small">{rx.date || new Date().toISOString().split('T')[0]}</span>
                        </div>
                      </div>

                      {/* MEDICINES & STOCK CHECK TABLE */}
                      <div className="table-responsive my-3">
                        <table className="table table-sm table-bordered align-middle mb-0">
                          <thead className="table-light text-uppercase text-secondary" style={{ fontSize: 10 }}>
                            <tr>
                              <th style={{ width: 30 }}>#</th>
                              <th>Prescribed Medication</th>
                              <th>Dosage & Instructions</th>
                              <th className="text-center" style={{ width: 110 }}>Required Qty</th>
                              <th style={{ width: 180 }}>Pharmacy Inventory Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rxMeds.map((med, mIdx) => {
                              const medNameLower = (med.name || '').toLowerCase().trim();
                              const matched = medicines.find(m =>
                                (m.name || '').toLowerCase().includes(medNameLower) ||
                                medNameLower.includes((m.name || '').toLowerCase())
                              );
                              const reqQty = med.quantity || (med.duration?.includes('30') ? 30 : 10);
                              const stockQty = matched ? Number(matched.stock) || 0 : 0;

                              return (
                                <tr key={mIdx}>
                                  <td className="text-center text-muted fw-bold" style={{ fontSize: 11 }}>{mIdx + 1}</td>
                                  <td>
                                    <div className="fw-bold text-dark" style={{ fontSize: 12 }}>{med.name}</div>
                                  </td>
                                  <td className="text-secondary small">
                                    {med.dosage || '1 Tab'} · {med.frequency || '1-0-1'} ({med.duration || '5 Days'})
                                  </td>
                                  <td className="text-center fw-bold small">{reqQty} Units</td>
                                  <td>
                                    {matched ? (
                                      stockQty >= reqQty ? (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: 10 }}>
                                          <i className="bi bi-check-circle-fill me-1"></i> In Stock ({stockQty} avail.)
                                        </span>
                                      ) : stockQty > 0 ? (
                                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: 10 }}>
                                          <i className="bi bi-exclamation-triangle-fill me-1"></i> Low Stock ({stockQty} avail.)
                                        </span>
                                      ) : (
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: 10 }}>
                                          <i className="bi bi-x-circle-fill me-1"></i> Out of Stock
                                        </span>
                                      )
                                    ) : (
                                      <span className="badge bg-light text-secondary border" style={{ fontSize: 10 }}>
                                        Generic Match
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* ACTIONS */}
                      <div className="d-flex flex-wrap align-items-center justify-content-between pt-2">
                        <div className="small text-muted">
                          <i className="bi bi-info-circle me-1 text-primary"></i>
                          Diagnosis: <strong className="text-dark">{rx.diagnosis || 'Clinical OPD Evaluation'}</strong>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          {!isDispensed ? (
                            <button
                              type="button"
                              className="btn btn-success btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm rounded-pill"
                              disabled={dispensingId === rx.id}
                              onClick={() => handleDispense(rx)}
                            >
                              {dispensingId === rx.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" />
                                  Dispensing...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-bag-check-fill fs-6"></i>
                                  Dispense & Checkout (Deduct Stock)
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm px-3 py-1 fw-bold d-inline-flex align-items-center gap-2 rounded-pill"
                              onClick={() => setPrintDispenseSlip({ rx })}
                            >
                              <i className="bi bi-printer-fill fs-6"></i>
                              Print Dispense Slip / Label
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            PHARMACY DISPENSE PRINT MODAL
        ====================================================== */}
        {printDispenseSlip && (
          <PrintModal
            show={!!printDispenseSlip}
            onClose={() => setPrintDispenseSlip(null)}
            title={`Pharmacy Dispense Receipt · Rx-${printDispenseSlip.rx?.id || 'NEW'}`}
          >
            <PharmacyDispenseSlip rx={printDispenseSlip.rx} dispensedItems={printDispenseSlip.items} />
          </PrintModal>
        )}
      </div>
    </>
  );
}

export default PharmacyPanel;
