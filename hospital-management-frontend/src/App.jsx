import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'motion/react';

import AuthService from './services/AuthService';
import PatientService from './services/PatientService';
import DoctorService from './services/DoctorService';
import AppointmentService from './services/AppointmentService';
import PrescriptionService from './services/PrescriptionService';
import BillingService from './services/BillingService';
import BedService from './services/BedService';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';

const Login = lazy(() => import('./components/auth/Login'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const PatientForm = lazy(() => import('./components/patients/PatientForm'));
const PatientList = lazy(() => import('./components/patients/PatientList'));
const DoctorForm = lazy(() => import('./components/doctors/DoctorForm'));
const DoctorList = lazy(() => import('./components/doctors/DoctorList'));
const AppointmentsPanel = lazy(() => import('./components/appointments/AppointmentsPanel'));
const PrescriptionPanel = lazy(() => import('./components/prescriptions/PrescriptionPanel'));
const BillingPanel = lazy(() => import('./components/billing/BillingPanel'));
const MedicalRecordPanel = lazy(() => import('./components/medicalrecords/MedicalRecordPanel'));
const LabPanel = lazy(() => import('./components/lab/LabPanel'));
const PharmacyPanel = lazy(() => import('./components/pharmacy/PharmacyPanel'));
const PaymentsPanel = lazy(() => import('./components/payments/PaymentsPanel'));
const BedsPanel = lazy(() => import('./components/admissions/BedsPanel'));
const OtPanel = lazy(() => import('./components/surgery/OtPanel'));
const BloodBankPanel = lazy(() => import('./components/bloodbank/BloodBankPanel'));
const AmbulancePanel = lazy(() => import('./components/ambulance/AmbulancePanel'));
const ProfilePanel = lazy(() => import('./components/settings/ProfilePanel'));
const SettingsPanel = lazy(() => import('./components/settings/SettingsPanel'));
const HelpSupportPanel = lazy(() => import('./components/settings/HelpSupportPanel'));
const StaffApprovalsPanel = lazy(() => import('./components/settings/StaffApprovalsPanel'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());

  const role = String(AuthService.getRole() || '').replace(/^ROLE_/, '').toUpperCase();
  const [activeTab, setActiveTab] = useState(() => (role === 'PATIENT' ? 'appointments' : 'dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hs_dark_mode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.body.style.background = darkMode ? '#0f172a' : '';
    document.body.style.color = darkMode ? '#e2e8f0' : '';
    localStorage.setItem('hs_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Enforce patient tab restriction — only block truly forbidden tabs
  // 'profile', 'help' are allowed for ALL roles including PATIENT
  // 'settings' is already ADMIN-only in Sidebar, no need to block it here too
  useEffect(() => {
    const patientForbidden = ['dashboard', 'patients', 'doctors', 'beds', 'pharmacy'];
    if (role === 'PATIENT' && patientForbidden.includes(activeTab)) {
      setActiveTab('appointments');
    }
  }, [role, activeTab]);

  const fetchAllData = useCallback(() => {
    setLoading(true);
    setDataError(false);

    const safe = (promise) => promise.catch(e => {
      console.warn('Service fetch failed:', e.message);
      return { data: [] };
    });

    Promise.all([
      safe(PatientService.getAllPatients()),
      safe(DoctorService.getAllDoctors()),
      safe(AppointmentService.getAllAppointments()),
      safe(PrescriptionService.getAllPrescriptions()),
      safe(BillingService.getAllBills()),
      safe(BedService.getAllBeds()),
    ]).then(([patRes, docRes, appRes, rxRes, billRes, bedRes]) => {
      setPatients(Array.isArray(patRes.data) ? patRes.data : []);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
      setPrescriptions(Array.isArray(rxRes.data) ? rxRes.data : []);
      setBills(Array.isArray(billRes.data) ? billRes.data : []);
      setBeds(Array.isArray(bedRes.data) ? bedRes.data : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated, fetchAllData]);

  // ── Auth Guard ──
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />
        <Suspense fallback={<LoadingView label="Loading..." />}>
          <Login onLogin={() => {
            const currentRole = String(AuthService.getRole() || '').replace(/^ROLE_/, '').toUpperCase();
            setActiveTab(currentRole === 'PATIENT' ? 'appointments' : 'dashboard');
            setIsAuthenticated(true);
          }} />
        </Suspense>
      </div>
    );
  }

  const counts = {
    patients: patients.length,
    doctors: doctors.length,
    appointments: appointments.length,
    prescriptions: prescriptions.length,
    bills: bills.length,
    beds: beds.length
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: darkMode ? '#0f172a' : '#f1f5f9' }}>
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme={darkMode ? 'dark' : 'light'} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setSearchQuery(''); }}
        counts={counts}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(p => !p)}
        darkMode={darkMode}
      />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, overflowX: 'hidden' }}>
        <Navbar
          toggleSidebar={() => setSidebarOpen(p => !p)}
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSearchQuery(''); }}
          onSearch={setSearchQuery}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(p => !p)}
          beds={beds}
          doctors={doctors}
          onDataRefresh={fetchAllData}
        />

        <main style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
          {loading ? (
            <div className="text-center py-5 my-5">
              <div className="spinner-border" style={{ width: '3rem', height: '3rem', borderColor: '#0ea5e9', borderRightColor: 'transparent' }} />
              <p className="mt-3 fw-semibold" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Synchronizing clinical data...
              </p>
            </div>
          ) : (
            <ErrorBoundary onReset={() => setActiveTab(role === 'PATIENT' ? 'appointments' : 'dashboard')}>
              <Suspense fallback={<LoadingView label="Loading module..." />}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                  {activeTab === 'dashboard' && role !== 'PATIENT' && (
                    <Dashboard
                      role={role}
                      patients={patients}
                      doctors={doctors}
                      appointments={appointments}
                      prescriptions={prescriptions}
                      bills={bills}
                      beds={beds}
                      setActiveTab={setActiveTab}
                      darkMode={darkMode}
                    />
                  )}

                  {activeTab === 'patients' && role !== 'PATIENT' && (
                    <div>
                      <PatientForm onPatientAdded={fetchAllData} darkMode={darkMode} />
                      <PatientList patients={patients} onPatientDeleted={fetchAllData} onPatientUpdated={fetchAllData} searchQuery={searchQuery} darkMode={darkMode} />
                    </div>
                  )}

                  {activeTab === 'doctors' && role !== 'PATIENT' && (
                    <div>
                      <DoctorForm onDoctorAdded={fetchAllData} darkMode={darkMode} />
                      <DoctorList doctors={doctors} onDoctorUpdated={fetchAllData} searchQuery={searchQuery} darkMode={darkMode} />
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <AppointmentsPanel
                      role={role}
                      appointments={appointments}
                      patients={patients}
                      doctors={doctors}
                      onAppointmentBooked={fetchAllData}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                    />
                  )}

                  {activeTab === 'prescriptions' && (
                    <PrescriptionPanel
                      role={role}
                      prescriptions={prescriptions}
                      patients={patients}
                      doctors={doctors}
                      onPrescriptionAdded={fetchAllData}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                    />
                  )}

                  {activeTab === 'billing' && (
                    <BillingPanel
                      role={role}
                      bills={bills}
                      patients={patients}
                      onBillGenerated={fetchAllData}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                    />
                  )}

                  {activeTab === 'medical-records' && (
                    <MedicalRecordPanel
                      role={role}
                      patients={patients}
                      doctors={doctors}
                      appointments={appointments}
                      prescriptions={prescriptions}
                      bills={bills}
                      beds={beds}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                      onDataRefresh={fetchAllData}
                    />
                  )}

                  {activeTab === 'lab' && (
                    <LabPanel role={role} patients={patients} searchQuery={searchQuery} darkMode={darkMode} />
                  )}

                  {activeTab === 'pharmacy' && role !== 'PATIENT' && (
                    <PharmacyPanel
                      role={role}
                      prescriptions={prescriptions}
                      patients={patients}
                      doctors={doctors}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                      onDataRefresh={fetchAllData}
                    />
                  )}

                  {activeTab === 'payments' && (
                    <PaymentsPanel
                      role={role}
                      patients={patients}
                      bills={bills}
                      onPaymentSuccess={fetchAllData}
                      searchQuery={searchQuery}
                      darkMode={darkMode}
                    />
                  )}

                  {activeTab === 'beds' && role !== 'PATIENT' && (
                    <BedsPanel initialBeds={beds} patients={patients} doctors={doctors} onBedsUpdated={fetchAllData} darkMode={darkMode} />
                  )}

                  {activeTab === 'ot' && (
                    <OtPanel role={role} patients={patients} doctors={doctors} searchQuery={searchQuery} darkMode={darkMode} />
                  )}

                  {activeTab === 'blood-bank' && (
                    <BloodBankPanel role={role} patients={patients} doctors={doctors} searchQuery={searchQuery} darkMode={darkMode} />
                  )}

                  {activeTab === 'ambulance' && (
                    <AmbulancePanel role={role} patients={patients} doctors={doctors} searchQuery={searchQuery} darkMode={darkMode} />
                  )}

                  {activeTab === 'profile' && (
                    <ProfilePanel role={role} darkMode={darkMode} />
                  )}

                  {activeTab === 'settings' && role === 'ADMIN' && (
                    <SettingsPanel role={role} darkMode={darkMode} />
                  )}

                  {activeTab === 'staff-approvals' && role === 'ADMIN' && (
                    <StaffApprovalsPanel />
                  )}

                  {activeTab === 'help' && (
                    <HelpSupportPanel role={role} darkMode={darkMode} />
                  )}
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
          )}
        </main>

        <footer style={{
          background: darkMode ? 'rgba(255,255,255,0.04)' : '#fff',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '.75rem',
          color: darkMode ? '#475569' : '#94a3b8',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
        }}>
          HospitalSync Pro Suite v3.0 &bull; Enterprise Healthcare Platform &bull; HIPAA Compliant
        </footer>
      </div>
    </div>
  );
}

function LoadingView({ label }) {
  return (
    <div className="text-center py-5 my-5">
      <div className="spinner-border text-primary" role="status" aria-label={label} />
      <p className="mt-3 text-secondary fw-semibold">{label}</p>
    </div>
  );
}

export default App;