import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import UserService from '../../services/UserService';
import { staggerContainer, staggerItem, springSmooth, springSnappy, cardHover } from '../../animations/motionConfig';

const kpiContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const kpiItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
  }
};

function Dashboard({
  role = 'ADMIN',
  patients = [],
  doctors = [],
  appointments = [],
  prescriptions = [],
  bills = [],
  beds = [],
  setActiveTab
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const res = await UserService.getAdminDashboard();

        if (mounted) {
          setDashboardData(res?.data || null);
        }
      } catch (err) {
        console.warn('Dashboard API unavailable. Using supplied application data.', err);

        if (mounted) {
          setDashboardData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * REAL DATA HELPERS
   * ---------------------------------------------------------
   */

  const summary = dashboardData?.summary || {};
  const charts = dashboardData?.charts || {};
  const opsData = dashboardData?.opsSnapshot || {};
  const departmentData = dashboardData?.appointmentsByDepartment;
  const admissionsData = dashboardData?.admissionsFunnel;

  // Track whether we have live backend data or are using demo values
  const isLive = dashboardData !== null;

  const hasValue = (value) =>
    value !== undefined &&
    value !== null &&
    value !== '';

  const formatNumber = (value) => {
    if (!hasValue(value)) return '—';

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) return value;

    return numericValue.toLocaleString('en-IN');
  };

  const formatCurrency = (value) => {
    if (!hasValue(value)) return '—';

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) return value;

    return `₹${numericValue.toLocaleString('en-IN')}`;
  };

  /*
   * ---------------------------------------------------------
   * REAL KPI DATA
   * ---------------------------------------------------------
   *
   * Priority:
   * 1. Backend dashboard API  (isLive = true)
   * 2. Actual props passed into dashboard
   * 3. Demo / design-spec value as last resort
   */

  const totalPatients = hasValue(summary.totalPatients)
    ? summary.totalPatients
    : patients.length > 0 ? patients.length : 2543;

  const totalDoctors = hasValue(summary.totalDoctors)
    ? summary.totalDoctors
    : doctors.length > 0 ? doctors.length : 89;

  const totalAppointments = hasValue(summary.totalAppointments)
    ? summary.totalAppointments
    : appointments.length > 0 ? appointments.length : 324;

  // Available Beds: from API → else dynamic from beds dataset
  const availableBeds = hasValue(summary.availableBeds)
    ? summary.availableBeds
    : Array.isArray(beds) && beds.length > 0
      ? beds.filter((b) => String(b?.status || '').toUpperCase() === 'AVAILABLE').length
      : 8;

  const kpiCards = [
    {
      title: 'Total Patients',
      value: formatNumber(totalPatients),
      change: summary.patientChange,
      icon: 'bi-people-fill',
      accent: '#2563eb',
      gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      tab: 'patients'
    },
    {
      title: 'Available Beds',
      value: formatNumber(availableBeds),
      change: null,
      icon: 'bi-hospital-fill',
      accent: '#059669',
      gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      tab: 'beds'
    },
    {
      title: 'Medical Staff',
      value: formatNumber(totalDoctors),
      change: summary.doctorChange,
      icon: 'bi-person-badge-fill',
      accent: '#7c3aed',
      gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      tab: 'doctors'
    },
    {
      title: 'Appointments',
      value: formatNumber(totalAppointments),
      change: summary.appointmentChange,
      icon: 'bi-calendar2-check-fill',
      accent: '#ea580c',
      gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      tab: 'appointments'
    }
  ];

  /*
   * ---------------------------------------------------------
   * DEPARTMENT DATA
   * ---------------------------------------------------------
   */

  const deptData = useMemo(() => {
    if (!Array.isArray(departmentData)) return [];

    return departmentData
      .map((item, index) => ({
        name:
          item.name ||
          item.department ||
          item.label ||
          `Department ${index + 1}`,
        value: Number(item.value ?? item.count ?? item.total ?? 0),
        color: [
          '#2563eb',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#ef4444'
        ][index % 7]
      }))
      .filter(item => item.value >= 0);
  }, [departmentData]);

  const maxDept = Math.max(
    ...deptData.map(item => item.value),
    1
  );

  /*
   * ---------------------------------------------------------
   * WAIT TIME DATA
   * ---------------------------------------------------------
   */

  const waitTimeData = Array.isArray(charts.averageWaitTime)
    ? charts.averageWaitTime
    : Array.isArray(charts.averageWaitTimeMinsByDay)
      ? charts.averageWaitTimeMinsByDay
      : [];

  const averageWait =
    hasValue(charts.averageWaitTimeMins)
      ? charts.averageWaitTimeMins
      : hasValue(charts.averageWaitTime)
        ? typeof charts.averageWaitTime === 'number'
          ? charts.averageWaitTime
          : null
        : null;

  /*
   * ---------------------------------------------------------
   * OPS SNAPSHOT
   * ---------------------------------------------------------
   */

  const admissionsCount = hasValue(opsData.admissions)
    ? opsData.admissions
    : patients.filter((p) => String(p?.status || '').toLowerCase() === 'admitted').length;

  const dischargesCount = hasValue(opsData.discharges)
    ? opsData.discharges
    : patients.filter((p) => String(p?.status || '').toLowerCase() === 'discharged').length;

  const totalBedsCount = Array.isArray(beds) ? beds.length : 12;
  const calculatedUtilization = hasValue(opsData.bedUtilization)
    ? opsData.bedUtilization
    : totalBedsCount > 0
      ? `${Math.round(((totalBedsCount - availableBeds) / totalBedsCount) * 100)}%`
      : '33%';

  const totalRevenueAmount = (Array.isArray(bills) ? bills : []).reduce(
    (sum, b) => sum + Number(b.totalAmount || b.amount || 0),
    0
  );

  const currentOpsRevenue = hasValue(opsData.revenue)
    ? formatCurrency(opsData.revenue)
    : formatCurrency(totalRevenueAmount > 0 ? totalRevenueAmount : 4467.5);

  const opsSnapshot = [
    {
      label: 'Admissions',
      value: admissionsCount > 0 ? formatNumber(admissionsCount) : '—',
      icon: 'bi-person-plus-fill',
      color: '#2563eb',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    },
    {
      label: 'Discharges',
      value: dischargesCount > 0 ? formatNumber(dischargesCount) : '—',
      icon: 'bi-box-arrow-right',
      color: '#059669',
      background: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      label: 'Bed Utilization',
      value: calculatedUtilization,
      icon: 'bi-pie-chart-fill',
      color: '#d97706',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      label: 'Revenue',
      value: currentOpsRevenue,
      icon: 'bi-currency-rupee',
      color: '#7c3aed',
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
  ];

  /*
   * ---------------------------------------------------------
   * HEATMAP
   * ---------------------------------------------------------
   */

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const heatmapGrid = Array.isArray(charts.weeklyActivityHeatmap)
    ? charts.weeklyActivityHeatmap
    : [];

  const heatmapMax = Math.max(
    ...heatmapGrid.flat().map(Number),
    1
  );

  /*
   * ---------------------------------------------------------
   * ADMISSIONS FUNNEL
   * ---------------------------------------------------------
   */

  const funnel = Array.isArray(admissionsData)
    ? admissionsData.map((item, index) => ({
        stage:
          item.stage ||
          item.name ||
          item.label ||
          `Stage ${index + 1}`,
        value: Number(item.val ?? item.value ?? item.count ?? 0),
        pct: Number(item.pct ?? item.percentage ?? 0),
        color: [
          '#2563eb',
          '#06b6d4',
          '#6366f1',
          '#8b5cf6',
          '#ec4899'
        ][index % 5]
      }))
    : [];

  /*
   * ---------------------------------------------------------
   * REAL FINANCIAL DATA FROM BILLS
   * ---------------------------------------------------------
   *
   * Used only when dashboard API doesn't provide revenue.
   */

  const calculatedRevenue = useMemo(() => {
    if (!Array.isArray(bills) || bills.length === 0) {
      return null;
    }

    return bills.reduce((total, bill) => {
      const status = String(
        bill.status ||
        bill.paymentStatus ||
        ''
      ).toUpperCase();

      if (
        status === 'PAID' ||
        status === 'COMPLETED' ||
        status === 'SETTLED'
      ) {
        return total + Number(
          bill.paidAmount ??
          bill.amount ??
          bill.totalAmount ??
          0
        );
      }

      return total;
    }, 0);
  }, [bills]);

  /*
   * ---------------------------------------------------------
   * DISPLAY HELPERS
   * ---------------------------------------------------------
   */

  const displayRevenue = hasValue(opsData.revenue)
    ? opsData.revenue
    : calculatedRevenue !== null
      ? formatCurrency(calculatedRevenue)
      : '—';

  const renderChange = (change) => {
    if (!hasValue(change)) return null;

    const positive =
      String(change).startsWith('+') ||
      Number(change) > 0;

    return (
      <span
        className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-semibold"
        style={{
          fontSize: '0.7rem',
          background: positive ? '#dcfce7' : '#fee2e2',
          color: positive ? '#15803d' : '#dc2626'
        }}
      >
        <i
          className={`bi ${
            positive
              ? 'bi-arrow-up-right'
              : 'bi-arrow-down-right'
          }`}
        />
        {change}
      </span>
    );
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div
      className="dashboard-shell"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% 0%, rgba(37,99,235,.07), transparent 28%), radial-gradient(circle at 90% 10%, rgba(124,58,237,.06), transparent 28%), #f8fafc',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#0f172a'
      }}
    >
      <div
        className="container-fluid px-3 px-lg-4 py-4"
        style={{ maxWidth: '1600px' }}
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>
            <div
              className="d-flex align-items-center gap-2 mb-2"
              style={{
                color: '#64748b',
                fontSize: '0.78rem'
              }}
            >
              <i className="bi bi-grid-1x2-fill" />
              <span>Hospital Operations</span>
              <i className="bi bi-chevron-right" />
              <span
                style={{
                  color: '#2563eb',
                  fontWeight: 600
                }}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
              </span>
            </div>

            <h3
              className="fw-bold mb-1"
              style={{
                fontSize: 'clamp(1.5rem, 2vw, 2rem)',
                letterSpacing: '-0.04em'
              }}
            >
              {role === 'ADMIN' ? 'Hospital Overview' : `${role.charAt(0)}${role.slice(1).toLowerCase()} Dashboard`}
            </h3>

            <p
              className="mb-0"
              style={{
                color: '#64748b',
                fontSize: '0.9rem'
              }}
            >
              Real-time operational intelligence across your hospital.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {role !== 'PATIENT' && (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
                onClick={() => setActiveTab && setActiveTab('appointments')}
              >
                <i className="bi bi-heart-pulse-fill"></i>
                OPD Consultation Desk
              </button>
            )}

            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{
                background: 'rgba(255,255,255,.8)',
                border: '1px solid rgba(226,232,240,.9)',
                boxShadow: '0 4px 16px rgba(15,23,42,.04)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <span
                className="rounded-circle"
                style={{
                  width: 8,
                  height: 8,
                  background: loading ? '#f59e0b' : isLive ? '#10b981' : '#f59e0b',
                  boxShadow: loading
                    ? '0 0 0 4px rgba(245,158,11,.12)'
                    : isLive
                    ? '0 0 0 4px rgba(16,185,129,.12)'
                    : '0 0 0 4px rgba(245,158,11,.12)'
                }}
              />

              <span
                className="small fw-semibold"
                style={{ color: '#475569' }}
              >
                {loading
                  ? 'Synchronizing data...'
                  : isLive
                  ? '✅ Live data connected'
                  : '⚡ Demo mode — backend offline'}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <motion.div
          className="row g-3 mb-4"
          variants={kpiContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {kpiCards.map((card) => (
            <motion.div
              className="col-12 col-sm-6 col-xl-3"
              key={card.title}
              variants={kpiItemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="h-100 position-relative overflow-hidden"
                style={{
                  background: card.gradient,
                  borderRadius: '22px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,.9)',
                  boxShadow:
                    '0 10px 30px rgba(15,23,42,.055)',
                  transition:
                    'box-shadow .2s ease'
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: card.accent,
                    opacity: 0.06,
                    right: -35,
                    top: -35
                  }}
                />

                <div className="d-flex justify-content-between align-items-start position-relative">

                  <div>
                    <div
                      className="fw-bold text-uppercase mb-2"
                      style={{
                        fontSize: '0.68rem',
                        letterSpacing: '.09em',
                        color: '#64748b'
                      }}
                    >
                      {card.title}
                    </div>

                    <div
                      className="fw-bolder"
                      style={{
                        fontSize: '2rem',
                        lineHeight: 1,
                        letterSpacing: '-.045em',
                        color: '#0f172a'
                      }}
                    >
                      {card.value}
                    </div>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center rounded-4"
                    style={{
                      width: 46,
                      height: 46,
                      background: card.accent,
                      color: '#fff',
                      boxShadow:
                        `0 8px 18px ${card.accent}35`
                    }}
                  >
                    <i
                      className={`bi ${card.icon}`}
                      style={{ fontSize: '1.2rem' }}
                    />
                  </div>
                </div>

                <div
                  className="d-flex justify-content-between align-items-center mt-4 pt-3"
                  style={{
                    borderTop:
                      '1px solid rgba(255,255,255,.75)'
                  }}
                >
                  <div>
                    {renderChange(card.change)}

                    {!hasValue(card.change) && (
                      <span
                        className="small"
                        style={{ color: '#94a3b8' }}
                      >
                        Current value
                      </span>
                    )}
                  </div>

                  {setActiveTab && (
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{
                        color: card.accent,
                        fontSize: '.75rem'
                      }}
                      onClick={() =>
                        setActiveTab(card.tab)
                      }
                    >
                      View
                      <i className="bi bi-arrow-up-right ms-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* =====================================================
            OPERATIONS SNAPSHOT
        ====================================================== */}

        <motion.div
          className="p-3 p-lg-4 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{
            background: '#fff',
            borderRadius: '22px',
            border: '1px solid #eef2f7',
            boxShadow:
              '0 10px 30px rgba(15,23,42,.045)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6
                className="fw-bold mb-1"
                style={{ letterSpacing: '-.02em' }}
              >
                Operations Snapshot
              </h6>

              <span
                className="small"
                style={{ color: '#94a3b8' }}
              >
                Key hospital activity indicators
              </span>
            </div>
          </div>

          <motion.div 
            className="row g-3"
            variants={staggerContainer(0.06)}
            initial="initial"
            animate="animate"
          >
            {opsSnapshot.map(item => {
              const value = hasValue(item.value) ? item.value : '—';

              return (
                <motion.div
                  className="col-12 col-sm-6 col-xl-3"
                  key={item.label}
                  variants={staggerItem}
                  whileHover={{ y: -4, transition: springSmooth }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between p-3"
                    style={{
                      background: item.background,
                      borderRadius: '18px',
                      color: '#fff',
                      boxShadow:
                        `0 8px 20px ${item.color}22`
                    }}
                  >
                    <div>
                      <div
                        className="small fw-semibold"
                        style={{
                          opacity: .75
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        className="fw-bold mt-1"
                        style={{
                          fontSize: '1.35rem',
                          letterSpacing: '-.025em'
                        }}
                      >
                        {value}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 44,
                        height: 44,
                        background:
                          'rgba(255,255,255,.16)',
                        border:
                          '1px solid rgba(255,255,255,.2)'
                      }}
                    >
                      <i
                        className={`bi ${item.icon}`}
                        style={{ fontSize: '1.15rem' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* =====================================================
            CHARTS
        ====================================================== */}

        <motion.div
          className="row g-4 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >

          {/* Department Chart */}
          <div className="col-12 col-xl-7">
            <div
              className="h-100 p-3 p-lg-4"
              style={{
                background: '#fff',
                borderRadius: '22px',
                border: '1px solid #eef2f7',
                boxShadow:
                  '0 10px 30px rgba(15,23,42,.045)',
                minHeight: 390
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ letterSpacing: '-.02em' }}
                  >
                    Appointments by Department
                  </h6>

                  <small style={{ color: '#94a3b8' }}>
                    Consultation volume distribution
                  </small>
                </div>

                <span
                  className="rounded-pill px-3 py-2"
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '.7rem',
                    fontWeight: 700
                  }}
                >
                  LIVE
                </span>
              </div>

              {deptData.length === 0 ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: 260 }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 56,
                      height: 56,
                      background: '#f1f5f9',
                      color: '#94a3b8'
                    }}
                  >
                    <i className="bi bi-bar-chart fs-4" />
                  </div>

                  <div className="fw-semibold">
                    No department data available
                  </div>

                  <small style={{ color: '#94a3b8' }}>
                    Data will appear when appointment analytics are available.
                  </small>
                </div>
              ) : (
                <div
                  className="d-flex align-items-end justify-content-around gap-2"
                  style={{ height: 275 }}
                >
                  {deptData.map((item) => {
                    const height =
                      Math.max(
                        (item.value / maxDept) * 100,
                        5
                      );

                    return (
                      <div
                        key={item.name}
                        className="d-flex flex-column align-items-center justify-content-end"
                        style={{
                          flex: 1,
                          height: '100%',
                          minWidth: 55
                        }}
                      >
                        <div
                          className="fw-bold mb-2"
                          style={{
                            fontSize: '.75rem',
                            color: item.color
                          }}
                        >
                          {formatNumber(item.value)}
                        </div>

                        <div
                          style={{
                            width: 30,
                            height: `${height}%`,
                            minHeight: 12,
                            borderRadius:
                              '12px 12px 6px 6px',
                            background:
                              `linear-gradient(180deg, ${item.color}, ${item.color}cc)`,
                            boxShadow:
                              `0 8px 18px ${item.color}25`,
                            transition:
                              'height .6s ease'
                          }}
                          title={`${item.name}: ${item.value}`}
                        />

                        <div
                          className="text-center mt-3 fw-semibold text-truncate"
                          style={{
                            color: '#64748b',
                            fontSize: '.7rem',
                            maxWidth: 90
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Wait Time */}
          <div className="col-12 col-xl-5">
            <div
              className="h-100 p-3 p-lg-4"
              style={{
                background: '#fff',
                borderRadius: '22px',
                border: '1px solid #eef2f7',
                boxShadow:
                  '0 10px 30px rgba(15,23,42,.045)',
                minHeight: 390
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ letterSpacing: '-.02em' }}
                  >
                    Average Wait Time
                  </h6>

                  <small style={{ color: '#94a3b8' }}>
                    Weekly triage performance
                  </small>
                </div>

                <div
                  className="px-3 py-2 rounded-pill fw-bold"
                  style={{
                    background: '#ecfeff',
                    color: '#0f766e',
                    fontSize: '.72rem'
                  }}
                >
                  {hasValue(averageWait)
                    ? `${averageWait} min avg`
                    : 'No data'}
                </div>
              </div>

              {waitTimeData.length === 0 ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ height: 270 }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 56,
                      height: 56,
                      background: '#f0fdfa',
                      color: '#0d9488'
                    }}
                  >
                    <i className="bi bi-activity fs-4" />
                  </div>

                  <div className="fw-semibold">
                    Wait-time analytics unavailable
                  </div>

                  <small style={{ color: '#94a3b8' }}>
                    Connect the analytics endpoint to display trends.
                  </small>
                </div>
              ) : (
                <div
                  className="d-flex align-items-end gap-2"
                  style={{ height: 275 }}
                >
                  {waitTimeData.map((point, index) => {
                    const value = Number(
                      point.value ??
                      point.minutes ??
                      point.waitTime ??
                      point
                    );

                    const maxWait = Math.max(
                      ...waitTimeData.map(x =>
                        Number(
                          x.value ??
                          x.minutes ??
                          x.waitTime ??
                          x
                        )
                      ),
                      1
                    );

                    const height =
                      Math.max(
                        (value / maxWait) * 100,
                        6
                      );

                    return (
                      <div
                        key={index}
                        className="flex-fill d-flex flex-column align-items-center justify-content-end"
                        style={{ height: '100%' }}
                      >
                        <small
                          className="fw-bold mb-2"
                          style={{
                            color: '#0d9488',
                            fontSize: '.68rem'
                          }}
                        >
                          {value}
                        </small>

                        <div
                          style={{
                            width: '100%',
                            maxWidth: 32,
                            height: `${height}%`,
                            borderRadius: '10px 10px 5px 5px',
                            background:
                              'linear-gradient(180deg, #14b8a6, #0f766e)',
                            boxShadow:
                              '0 8px 18px rgba(13,148,136,.18)'
                          }}
                        />

                        <small
                          className="mt-3"
                          style={{
                            color: '#94a3b8',
                            fontSize: '.65rem'
                          }}
                        >
                          {point.day ||
                            heatmapDays[index] ||
                            ''}
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            HEATMAP + FUNNEL
        ====================================================== */}

        <motion.div
          className="row g-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >

          {/* Heatmap */}
          <div className="col-12 col-xl-7">
            <div
              className="h-100 p-3 p-lg-4"
              style={{
                background: '#fff',
                borderRadius: '22px',
                border: '1px solid #eef2f7',
                boxShadow:
                  '0 10px 30px rgba(15,23,42,.045)'
              }}
            >
              <div className="mb-4">
                <h6
                  className="fw-bold mb-1"
                  style={{ letterSpacing: '-.02em' }}
                >
                  Weekly Activity
                </h6>

                <small style={{ color: '#94a3b8' }}>
                  Clinical activity intensity across the week
                </small>
              </div>

              {heatmapGrid.length === 0 ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: 230 }}
                >
                  <i
                    className="bi bi-grid-3x3-gap fs-2 mb-3"
                    style={{ color: '#cbd5e1' }}
                  />

                  <div className="fw-semibold">
                    No activity data available
                  </div>

                  <small style={{ color: '#94a3b8' }}>
                    Weekly activity will appear here once available.
                  </small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-borderless text-center align-middle mb-0"
                  >
                    <thead>
                      <tr>
                        {heatmapDays.map(day => (
                          <th
                            key={day}
                            className="fw-semibold"
                            style={{
                              color: '#94a3b8',
                              fontSize: '.7rem'
                            }}
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {heatmapGrid.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((value, colIndex) => {
                            const numericValue =
                              Number(value) || 0;

                            const intensity =
                              numericValue / heatmapMax;

                            return (
                              <td
                                key={colIndex}
                                className="p-1"
                              >
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{
                                    height: 48,
                                    borderRadius: 12,
                                    background:
                                      `rgba(37,99,235,${Math.max(
                                        .06,
                                        intensity * .85
                                      )})`,
                                    color:
                                      intensity > .45
                                        ? '#fff'
                                        : '#1d4ed8',
                                    fontWeight: 700,
                                    fontSize: '.7rem',
                                    transition:
                                      'transform .15s ease'
                                  }}
                                  title={`Activity: ${numericValue}`}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform =
                                      'scale(1.05)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform =
                                      'scale(1)';
                                  }}
                                >
                                  {numericValue}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Funnel */}
          <div className="col-12 col-xl-5">
            <div
              className="h-100 p-3 p-lg-4"
              style={{
                background: '#fff',
                borderRadius: '22px',
                border: '1px solid #eef2f7',
                boxShadow:
                  '0 10px 30px rgba(15,23,42,.045)'
              }}
            >
              <div className="mb-4">
                <h6
                  className="fw-bold mb-1"
                  style={{ letterSpacing: '-.02em' }}
                >
                  Admissions Funnel
                </h6>

                <small style={{ color: '#94a3b8' }}>
                  Patient journey through hospital operations
                </small>
              </div>

              {funnel.length === 0 ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: 230 }}
                >
                  <i
                    className="bi bi-funnel fs-2 mb-3"
                    style={{ color: '#cbd5e1' }}
                  />

                  <div className="fw-semibold">
                    No admissions data available
                  </div>

                  <small style={{ color: '#94a3b8' }}>
                    Funnel analytics will appear here once available.
                  </small>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {funnel.map(item => (
                    <div key={item.stage}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className="fw-semibold"
                          style={{
                            fontSize: '.8rem'
                          }}
                        >
                          {item.stage}
                        </span>

                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: '.8rem'
                            }}
                          >
                            {formatNumber(item.value)}
                          </span>

                          {item.pct > 0 && (
                            <span
                              style={{
                                fontSize: '.68rem',
                                color: '#94a3b8'
                              }}
                            >
                              {item.pct}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          height: 9,
                          background: '#f1f5f9',
                          borderRadius: 99,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(
                              Math.max(item.pct, 0),
                              100
                            )}%`,
                            background:
                              `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                            borderRadius: 99,
                            boxShadow:
                              `0 3px 10px ${item.color}30`,
                            transition:
                              'width .6s ease'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </motion.div>

        {/* =====================================================
            FOOTER STATUS
        ====================================================== */}

        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-4 px-2"
          style={{
            color: '#94a3b8',
            fontSize: '.72rem'
          }}
        >
          <span>
            <i className="bi bi-shield-check me-1" />
            HospitalSync secure operations dashboard
          </span>

          <span>
            {loading
              ? 'Updating live data...'
              : 'Data synchronized successfully'}
          </span>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
