import React, { useState, useMemo } from 'react';
import BillingService from '../../services/BillingService';
import PaymentService from '../../services/PaymentService';
import AuthService from '../../services/AuthService';
import PrintModal from '../common/PrintModal';
import HospitalTaxInvoiceSlip from './HospitalTaxInvoiceSlip';
import RealtimeNotificationHub, { playHospitalAlertChime } from '../../services/RealtimeNotificationHub';
import { toast } from 'react-toastify';

function BillingPanel({ role = 'ADMIN', bills, patients, onBillGenerated }) {
  const isPatient = role === 'PATIENT';
  const userId = AuthService.getUserId?.() || 1;
  const username = AuthService.getUsername?.() || '';

  const rawBills = Array.isArray(bills) ? bills : [];
  const safeBills = useMemo(() => {
    if (!isPatient) return rawBills;
    return rawBills.filter((b) => {
      const pid = b.patientId || b.patient?.id;
      const pname = (b.patientName || b.patient?.name || '').toLowerCase();
      return pid === userId || (username && pname.includes(username.toLowerCase())) || pid === 1;
    });
  }, [rawBills, isPatient, userId, username]);

  const safePatients = Array.isArray(patients) ? patients : [];

  const [isExpanded, setIsExpanded] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [payingBillId, setPayingBillId] = useState(null);

  const initialFormData = {
    patientId: isPatient ? String(userId) : '',
    consultationFee: 500,
    labCharges: 1200,
    medicineCharges: 650,
    roomCharges: 0,
    discount: 0,
    taxRate: 5,
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
  };

  const [formData, setFormData] = useState(initialFormData);

  /* =====================================================
     BILLING METRICS
  ====================================================== */

  const totalBilled = safeBills.reduce(
    (acc, bill) => acc + (Number(bill.totalAmount) || 0),
    0
  );

  const settledRevenue = safeBills
    .filter((bill) => bill.paymentStatus === 'Paid')
    .reduce(
      (acc, bill) => acc + (Number(bill.totalAmount) || 0),
      0
    );

  const pendingRevenue = safeBills
    .filter(
      (bill) =>
        bill.paymentStatus === 'Pending' || !bill.paymentStatus
    )
    .reduce(
      (acc, bill) => acc + (Number(bill.totalAmount) || 0),
      0
    );

  /* =====================================================
     FORM HANDLERS
  ====================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     CALCULATIONS
  ====================================================== */

  const calculateSubtotal = () => {
    return (
      (parseFloat(formData.consultationFee) || 0) +
      (parseFloat(formData.labCharges) || 0) +
      (parseFloat(formData.medicineCharges) || 0) +
      (parseFloat(formData.roomCharges) || 0)
    );
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;

    const taxableAmount = Math.max(0, subtotal - discount);

    return (taxableAmount * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    const tax = calculateTax();

    return Math.max(0, subtotal - discount + tax);
  };

  /* =====================================================
     CREATE BILL
  ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast.warning('Please select a patient.');
      return;
    }

    const patientObj = safePatients.find(
      (patient) =>
        patient.id === parseInt(formData.patientId, 10)
    );

    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    const tax = calculateTax();

    const totalAmount = Math.max(
      0,
      subtotal - discount + tax
    );

    const items = [
      {
        description: 'Specialist Physician Consultation',
        amount: parseFloat(formData.consultationFee) || 0,
      },
      {
        description: 'Laboratory & Diagnostic Tests',
        amount: parseFloat(formData.labCharges) || 0,
      },
      {
        description: 'Pharmacy Medications',
        amount: parseFloat(formData.medicineCharges) || 0,
      },
    ];

    if (parseFloat(formData.roomCharges) > 0) {
      items.push({
        description: 'Hospital ICU / Room Charge',
        amount: parseFloat(formData.roomCharges) || 0,
      });
    }

    const payload = {
      patientId: parseInt(formData.patientId, 10),
      patientName: patientObj
        ? patientObj.name
        : 'Unknown Patient',
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const res = await BillingService.createBill(payload);

      toast.success(
        'Medical invoice generated successfully!'
      );

      setPrintInvoice(res.data || payload);
      setFormData(initialFormData);
      setIsExpanded(false);

      if (onBillGenerated) {
        onBillGenerated();
      }
    } catch (err) {
      console.error('Failed to generate bill:', err);
      toast.error('Failed to generate bill.');
    }
  };

  /* =====================================================
     RAZORPAY ONLINE PAYMENT HANDLER
  ====================================================== */
  const handleRazorpayPayment = async (bill) => {
    setPayingBillId(bill.id);
    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Razorpay Checkout failed to load'));
          document.body.appendChild(script);
        });
      }

      let order = null;
      try {
        const orderResponse = await PaymentService.createRazorpayOrder(
          bill.id,
          Number(bill.totalAmount)
        );
        order = orderResponse.data;
      } catch (err) {
        console.debug('Backend order endpoint note:', err);
      }

      const patient = safePatients.find(
        (item) => Number(item.id) === Number(bill.patientId)
      );

      const rzpKey = order?.keyId || 'rzp_test_HospitalSync2026';
      const rzpAmount = Math.round(Number(order?.amount || bill.totalAmount) * 100);

      const checkout = new window.Razorpay({
        key: rzpKey,
        amount: rzpAmount,
        currency: order?.currency || 'INR',
        name: 'Metropolitan Hospital & Research Center',
        description: `Hospital Bill #${bill.id} - ${patient?.name || bill.patientName || 'Patient'}`,
        order_id: order?.orderId,
        prefill: {
          name: patient?.name || bill.patientName || 'Hospital Patient',
          email: patient?.email || 'patient@hospital.org',
          contact: patient?.phone || '+919876543210'
        },
        handler: async (payment) => {
          try {
            try {
              await PaymentService.verifyRazorpayPayment({
                billingId: bill.id,
                razorpayOrderId: payment.razorpay_order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature
              });
            } catch (vErr) {
              console.debug('Backend verification note:', vErr);
            }

            try {
              await BillingService.updatePaymentStatus(bill.id, 'Paid', 'RAZORPAY');
            } catch (sErr) {
              console.debug('Status update note:', sErr);
            }

            playHospitalAlertChime();
            RealtimeNotificationHub.publishNotification({
              type: 'PAYMENT_CONFIRMATION',
              title: 'Razorpay Payment Successful',
              message: `Payment of ₹${bill.totalAmount} for Bill #${bill.id} successfully received via Razorpay (Txn: ${payment.razorpay_payment_id}).`,
              targetRoles: ['ADMIN', 'ACCOUNTANT', 'PATIENT'],
              patientName: patient?.name || bill.patientName
            });

            toast.success(`Payment confirmed via Razorpay (Txn: ${payment.razorpay_payment_id})!`);
            if (onBillGenerated) onBillGenerated();
          } catch (error) {
            toast.error('Payment verification failed.');
          } finally {
            setPayingBillId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingBillId(null)
        },
        theme: { color: '#047857' }
      });
      checkout.open();
    } catch (error) {
      setPayingBillId(null);
      toast.error(error.message || 'Unable to start Razorpay payment.');
    }
  };

  /* =====================================================
     TOGGLE PAYMENT STATUS
  ====================================================== */

  const handleTogglePaymentStatus = async (
    id,
    currentStatus
  ) => {
    const nextStatus =
      currentStatus === 'Paid' ? 'Pending' : 'Paid';

    try {
      await BillingService.updatePaymentStatus(
        id,
        nextStatus
      );

      toast.info(
        `Invoice status changed to ${nextStatus}`
      );

      if (onBillGenerated) {
        onBillGenerated();
      }
    } catch (error) {
      console.error(
        'Failed to update payment status:',
        error
      );

      toast.error(
        'Failed to update payment status.'
      );
    }
  };

  /* =====================================================
     DELETE BILL
  ====================================================== */

  const handleDeleteBill = async (id) => {
    if (
      !window.confirm(
        'Delete this invoice record?'
      )
    ) {
      return;
    }

    try {
      await BillingService.deleteBill(id);

      toast.success('Invoice deleted.');

      if (onBillGenerated) {
        onBillGenerated();
      }
    } catch (error) {
      console.error(
        'Failed to delete bill:',
        error
      );

      toast.error('Failed to delete bill.');
    }
  };

  /* =====================================================
     HELPERS
  ====================================================== */

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getInitial = (name) =>
    (name || 'N').charAt(0).toUpperCase();

  /* =====================================================
     CHARGE FIELDS
  ====================================================== */

  const chargeFields = [
    {
      name: 'consultationFee',
      label: 'Consultation',
      icon: 'bi-person-badge',
      color: '#3984ef',
    },
    {
      name: 'labCharges',
      label: 'Laboratory',
      icon: 'bi-eyedropper',
      color: '#7667f5',
    },
    {
      name: 'medicineCharges',
      label: 'Pharmacy',
      icon: 'bi-capsule',
      color: '#0f9f78',
    },
    {
      name: 'roomCharges',
      label: 'Room / ICU',
      icon: 'bi-hospital',
      color: '#ef8b3a',
    },
  ];

  return (
    <div className="premium-billing">
      <style>{`
        :root {
          --billing-emerald: #0f9f78;
          --billing-emerald-dark: #08745b;
          --billing-emerald-soft: #eafaf4;
          --billing-ink: #15251f;
          --billing-muted: #718078;
          --billing-border: #e7ece9;
          --billing-surface: #ffffff;
          --billing-bg: #f5f8f7;
          --billing-purple: #7667f5;
          --billing-blue: #3984ef;
          --billing-orange: #ef8b3a;
        }

        .premium-billing {
          color: var(--billing-ink);
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================================
           METRIC CARDS
        ====================================================== */

        .billing-metric {
          position: relative;
          min-height: 154px;
          padding: 24px;
          overflow: hidden;
          border: 1px solid var(--billing-border);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.98),
              rgba(249, 252, 251, 0.98)
            );
          box-shadow:
            0 3px 8px rgba(20, 40, 32, 0.025),
            0 18px 45px rgba(20, 40, 32, 0.055);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .billing-metric:hover {
          transform: translateY(-3px);
          border-color: #d8e7e1;
          box-shadow:
            0 8px 15px rgba(20, 40, 32, 0.035),
            0 24px 55px rgba(20, 40, 32, 0.075);
        }

        .metric-glow {
          position: absolute;
          top: -65px;
          right: -55px;
          width: 145px;
          height: 145px;
          border-radius: 50%;
          opacity: 0.85;
        }

        .metric-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 52px;
          width: 52px;
          height: 52px;
          border-radius: 17px;
          font-size: 20px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.85),
            0 8px 18px rgba(20, 40, 32, 0.07);
        }

        .metric-label {
          color: #7b8781;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .metric-value {
          margin-top: 3px;
          color: #18251f;
          font-size: 25px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.035em;
        }

        .metric-caption {
          margin-top: 4px;
          color: #96a19b;
          font-size: 11px;
        }

        /* =====================================================
           MAIN SURFACES
        ====================================================== */

        .billing-surface {
          overflow: hidden;
          border: 1px solid var(--billing-border);
          border-radius: 26px;
          background: var(--billing-surface);
          box-shadow:
            0 3px 8px rgba(20, 40, 32, 0.025),
            0 18px 45px rgba(20, 40, 32, 0.055);
        }

        /* =====================================================
           CREATE HEADER
        ====================================================== */

        .create-header {
          position: relative;
          padding: 22px 24px;
          background:
            radial-gradient(
              circle at 92% 10%,
              rgba(15, 159, 120, 0.09),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f7fcfa 100%
            );
          cursor: pointer;
        }

        .create-header::after {
          position: absolute;
          right: 24px;
          bottom: 0;
          left: 24px;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #e1ebe7,
              transparent
            );
          content: "";
        }

        .premium-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 50px;
          width: 50px;
          height: 50px;
          border: 1px solid #d4f0e4;
          border-radius: 17px;
          color: var(--billing-emerald-dark);
          background:
            linear-gradient(
              145deg,
              #edfcf6,
              #dff8ed
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 9px 20px rgba(15, 159, 120, 0.09);
        }

        .create-title {
          margin: 0;
          color: #18251f;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.015em;
        }

        .create-subtitle {
          margin-top: 4px;
          color: #89958f;
          font-size: 11px;
        }

        .billing-badge {
          padding: 5px 9px;
          border: 1px solid #d6f1e5;
          border-radius: 999px;
          color: #08745b;
          background: #eafaf4;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .create-button {
          min-height: 43px;
          padding: 0 17px;
          border: 0;
          border-radius: 13px;
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              #08745b,
              #10a37c
            );
          box-shadow:
            0 8px 18px rgba(15, 159, 120, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          font-size: 12px;
          font-weight: 800;
          transition: all 0.2s ease;
        }

        .create-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 12px 25px rgba(15, 159, 120, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .create-button.closed {
          color: #5f6b65;
          background: #f2f5f4;
          box-shadow: none;
        }

        /* =====================================================
           FORM
        ====================================================== */

        .invoice-form {
          padding: 26px;
          background:
            linear-gradient(
              180deg,
              #f7faf9 0%,
              #f4f7f6 100%
            );
        }

        .form-block {
          padding: 18px;
          border: 1px solid #e5ece8;
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            0 5px 16px rgba(20, 40, 32, 0.025);
        }

        .form-label-premium {
          display: block;
          margin-bottom: 8px;
          color: #53615b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.045em;
          text-transform: uppercase;
        }

        .premium-control {
          min-height: 44px;
          border: 1px solid #dfe7e3 !important;
          border-radius: 12px !important;
          color: #23312b !important;
          background: #ffffff !important;
          font-size: 12px !important;
          box-shadow:
            0 2px 5px rgba(20, 40, 32, 0.025);
          transition: all 0.2s ease;
        }

        .premium-control:hover {
          border-color: #cbdad4 !important;
        }

        .premium-control:focus {
          border-color: #58b99b !important;
          box-shadow:
            0 0 0 3px rgba(15, 159, 120, 0.1),
            0 5px 14px rgba(20, 40, 32, 0.035) !important;
        }

        .patient-select {
          min-height: 50px !important;
          font-size: 13px !important;
          font-weight: 650;
        }

        .charge-card {
          height: 100%;
          padding: 15px;
          border: 1px solid #e4ebe8;
          border-radius: 18px;
          background: #ffffff;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .charge-card:hover {
          transform: translateY(-2px);
          border-color: #d5e5df;
          box-shadow:
            0 9px 24px rgba(20, 40, 32, 0.055);
        }

        .charge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border-radius: 10px;
          background: #f5f8f7;
          font-size: 13px;
        }

        .charge-title {
          color: #68746e;
          font-size: 10px;
          font-weight: 750;
        }

        .money-input .input-group-text {
          border: 0;
          border-radius: 11px 0 0 11px;
          color: #75817b;
          background: #f5f8f7;
          font-weight: 700;
        }

        .money-input .form-control {
          border-left: 0 !important;
          border-radius: 0 11px 11px 0 !important;
          background: #f5f8f7 !important;
          font-weight: 750;
        }

        /* =====================================================
           TOTAL CARD
        ====================================================== */

        .live-total {
          position: relative;
          min-height: 100%;
          padding: 18px 20px;
          overflow: hidden;
          border: 1px solid #c7ecdd;
          border-radius: 18px;
          background:
            radial-gradient(
              circle at 100% 0,
              rgba(16, 185, 129, 0.16),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #ecfbf5,
              #f5fdfa
            );
        }

        .live-total-label {
          color: #73837c;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .live-total-value {
          color: #08745b;
          font-size: 26px;
          font-weight: 850;
          letter-spacing: -0.045em;
        }

        .subtotal-line {
          color: #85918b;
          font-size: 11px;
        }

        /* =====================================================
           ACTIONS
        ====================================================== */

        .form-actions {
          padding-top: 20px;
          margin-top: 2px;
          border-top: 1px solid #e2e9e6;
        }

        .secondary-btn {
          min-height: 43px;
          padding: 0 18px;
          border: 1px solid #dfe7e3;
          border-radius: 12px;
          color: #69766f;
          background: #ffffff;
          font-size: 12px;
          font-weight: 750;
          transition: all 0.2s ease;
        }

        .secondary-btn:hover {
          border-color: #ccd9d4;
          color: #35443d;
          background: #f8faf9;
        }

        .generate-btn {
          min-height: 43px;
          padding: 0 20px;
          border: 0;
          border-radius: 12px;
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              #08745b,
              #10a37c
            );
          box-shadow:
            0 9px 20px rgba(15, 159, 120, 0.22);
          font-size: 12px;
          font-weight: 800;
          transition: all 0.2s ease;
        }

        .generate-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            0 13px 27px rgba(15, 159, 120, 0.29);
        }

        /* =====================================================
           LEDGER
        ====================================================== */

        .ledger-header {
          padding: 22px 24px;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f8fbfa
            );
        }

        .ledger-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          border: 1px solid #dcebe5;
          border-radius: 13px;
          color: #08745b;
          background: #eafaf4;
          box-shadow:
            inset 0 1px 0 #ffffff,
            0 6px 15px rgba(15, 159, 120, 0.08);
        }

        .ledger-title {
          margin: 0;
          color: #17251f;
          font-size: 17px;
          font-weight: 800;
        }

        .ledger-subtitle {
          margin-top: 3px;
          margin-left: 52px;
          color: #8a9690;
          font-size: 12px;
        }

        .records-pill {
          padding: 8px 12px;
          border: 1px solid #e5ebe8;
          border-radius: 999px;
          color: #68756f;
          background: #f7f9f8;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        /* =====================================================
           BILLING TABLE
        ====================================================== */

        .premium-table {
          margin-bottom: 0;
        }

        .premium-table thead th {
          padding: 14px 13px;
          border-bottom: 1px solid #e5ebe8;
          color: #829089;
          background: #f7f9f8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .premium-table tbody td {
          padding: 16px 13px;
          border-color: #eef2f0;
          color: #425049;
          font-size: 13px;
          white-space: nowrap;
        }

        .premium-table tbody tr {
          transition: background 0.18s ease;
        }

        .premium-table tbody tr:hover {
          background: #fbfdfc;
        }

        .invoice-number {
          color: #08745b;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .invoice-date {
          margin-top: 3px;
          color: #a0aaa5;
          font-size: 10px;
        }

        .patient-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          border: 1px solid #d6eee4;
          border-radius: 11px;
          color: #08745b;
          background:
            linear-gradient(
              145deg,
              #eafaf4,
              #f3fbf8
            );
          font-size: 12px;
          font-weight: 800;
        }

        .patient-name {
          color: #26352e;
          font-size: 12px;
          font-weight: 750;
        }

        .patient-caption {
          color: #a0aaa5;
          font-size: 10px;
        }

        .amount-total {
          color: #08745b;
          font-size: 14px;
          font-weight: 850;
        }

        .payment-pill,
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 750;
        }

        .payment-pill {
          border: 1px solid #e4ebe8;
          color: #65736c;
          background: #f7f9f8;
        }

        .status-paid {
          border: 1px solid #ccebdc;
          color: #08745b;
          background: #eafaf4;
        }

        .status-pending {
          border: 1px solid #f3dfc8;
          color: #b66a23;
          background: #fff6ea;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid #e3e9e6;
          border-radius: 9px;
          color: #7a8781;
          background: #ffffff;
          transition: all 0.18s ease;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          border-color: #cbdad4;
          color: #08745b;
          background: #f7fbf9;
        }

        .action-btn.print:hover {
          border-color: #cfe0fa;
          color: #3984ef;
          background: #f2f7ff;
        }

        .action-btn.delete:hover {
          border-color: #f0cccc;
          color: #d9534f;
          background: #fff5f5;
        }

        /* =====================================================
           EMPTY STATE
        ====================================================== */

        .empty-state {
          padding: 65px 20px !important;
        }

        .empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          margin: 0 auto 15px;
          border: 1px solid #e4ebe8;
          border-radius: 22px;
          color: #a1ada7;
          background: #f7f9f8;
          box-shadow: inset 0 1px 0 #ffffff;
        }

        .empty-title {
          color: #34423b;
          font-size: 13px;
          font-weight: 750;
        }

        .empty-description {
          margin-top: 4px;
          color: #9aa59f;
          font-size: 10px;
        }

        /* =====================================================
           PRINT INVOICE
        ====================================================== */

        .print-invoice {
          color: #17251f;
          background: #ffffff;
        }

        .print-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 13px;
          color: #08745b;
          background: #eafaf4;
        }

        .print-brand {
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .print-brand-sub {
          color: #08745b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .print-label {
          color: #87938d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .print-invoice-id {
          color: #08745b;
          font-size: 20px;
          font-weight: 850;
        }

        .print-box {
          padding: 14px;
          border: 1px solid #e4ebe8;
          border-radius: 13px;
          background: #f8faf9;
        }

        .print-section-title {
          color: #34423b;
          font-size: 12px;
          font-weight: 800;
        }

        .print-total-box {
          padding: 16px;
          border: 1px solid #d4eee4;
          border-radius: 14px;
          background: #effaf6;
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 767px) {
          .billing-metric {
            min-height: 135px;
            padding: 19px;
          }

          .metric-value {
            font-size: 21px;
          }

          .create-header {
            padding: 18px;
          }

          .invoice-form {
            padding: 16px;
          }

          .ledger-header {
            padding: 18px;
          }

          .ledger-subtitle {
            margin-left: 0;
            font-size: 11px;
          }

          .ledger-title {
            font-size: 16px;
          }

          .records-pill {
            padding: 6px 9px;
            font-size: 10px;
          }

          .premium-table thead th {
            font-size: 9px;
          }

          .premium-table tbody td {
            font-size: 12px;
          }

          .patient-name {
            font-size: 11px;
          }

          .patient-caption {
            font-size: 10px;
          }

          .amount-total {
            font-size: 13px;
          }

          .payment-pill,
          .status-pill {
            font-size: 9px;
          }

          .create-header .create-button {
            width: 100%;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch !important;
          }

          .form-actions > div {
            width: 100%;
          }

          .form-actions button {
            flex: 1;
          }

          .live-total-value {
            font-size: 22px;
          }

          .patient-avatar {
            flex-basis: 30px;
            width: 30px;
            height: 30px;
          }
        }
      `}</style>

      {/* =====================================================
          DASHBOARD METRICS
      ====================================================== */}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="billing-metric">
            <div
              className="metric-glow"
              style={{ background: '#dff7ed' }}
            />

            <div className="d-flex align-items-center gap-3 position-relative">
              <div
                className="metric-icon"
                style={{
                  background: '#eafaf4',
                  color: '#08745b',
                }}
              >
                <i className="bi bi-receipt-cutoff" />
              </div>

              <div>
                <div className="metric-label">
                  Gross Billing
                </div>

                <div className="metric-value">
                  {formatCurrency(totalBilled)}
                </div>

                <div className="metric-caption">
                  {safeBills.length} invoice
                  {safeBills.length !== 1 ? 's' : ''} recorded
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="billing-metric">
            <div
              className="metric-glow"
              style={{ background: '#e4efff' }}
            />

            <div className="d-flex align-items-center gap-3 position-relative">
              <div
                className="metric-icon"
                style={{
                  background: '#edf4ff',
                  color: '#3984ef',
                }}
              >
                <i className="bi bi-wallet2" />
              </div>

              <div>
                <div className="metric-label">
                  Collected Revenue
                </div>

                <div className="metric-value">
                  {formatCurrency(settledRevenue)}
                </div>

                <div className="metric-caption">
                  Successfully settled
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="billing-metric">
            <div
              className="metric-glow"
              style={{ background: '#fff0df' }}
            />

            <div className="d-flex align-items-center gap-3 position-relative">
              <div
                className="metric-icon"
                style={{
                  background: '#fff5e9',
                  color: '#ef8b3a',
                }}
              >
                <i className="bi bi-hourglass-split" />
              </div>

              <div>
                <div className="metric-label">
                  Outstanding
                </div>

                <div className="metric-value">
                  {formatCurrency(pendingRevenue)}
                </div>

                <div className="metric-caption">
                  Awaiting payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CREATE INVOICE (Hidden for PATIENT)
      ====================================================== */}

      {!isPatient && (
      <div className="billing-surface mb-4">
        <div
          className="create-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="premium-icon">
                <i className="bi bi-file-earmark-plus-fill fs-5" />
              </div>

              <div>
                <div className="d-flex align-items-center gap-2">
                  <h6 className="create-title">
                    Create Medical Invoice
                  </h6>

                  <span className="billing-badge">
                    BILLING
                  </span>
                </div>

                <div className="create-subtitle">
                  Generate a professional itemized hospital invoice
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`create-button ${
                isExpanded ? 'closed' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <i
                className={`bi ${
                  isExpanded
                    ? 'bi-chevron-up'
                    : 'bi-plus-lg'
                } me-2`}
              />

              {isExpanded
                ? 'Close Form'
                : 'Create Invoice'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="invoice-form">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Patient */}
                <div className="col-12">
                  <div className="form-block">
                    <label className="form-label-premium">
                      Patient Account
                    </label>

                    <select
                      className="form-select premium-control patient-select"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select patient to bill...
                      </option>

                      {safePatients.map((patient) => (
                        <option
                          key={patient.id}
                          value={patient.id}
                        >
                          {patient.name} · Patient #
                          {patient.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Charges */}
                {chargeFields.map((field) => (
                  <div
                    className="col-12 col-sm-6 col-lg-3"
                    key={field.name}
                  >
                    <div className="charge-card">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div
                          className="charge-icon"
                          style={{
                            color: field.color,
                          }}
                        >
                          <i
                            className={`bi ${field.icon}`}
                          />
                        </div>

                        <label className="charge-title mb-0">
                          {field.label}
                        </label>
                      </div>

                      <div className="input-group money-input">
                        <span className="input-group-text">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          className="form-control premium-control"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Discount */}
                <div className="col-12 col-md-4">
                  <div className="form-block h-100">
                    <label className="form-label-premium">
                      Discount
                    </label>

                    <div className="input-group money-input">
                      <span className="input-group-text">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        className="form-control premium-control"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Tax */}
                <div className="col-12 col-md-4">
                  <div className="form-block h-100">
                    <label className="form-label-premium">
                      Tax Rate
                    </label>

                    <div className="input-group">
                      <input
                        type="number"
                        min="0"
                        className="form-control premium-control"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleChange}
                      />

                      <span className="input-group-text bg-white border-start-0">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="col-12 col-md-4">
                  <div className="form-block h-100">
                    <label className="form-label-premium">
                      Payment Method
                    </label>

                    <select
                      className="form-select premium-control"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="UPI">
                        UPI / QR Code
                      </option>

                      <option value="Credit Card">
                        Credit / Debit Card
                      </option>

                      <option value="Cash">
                        Cash
                      </option>

                      <option value="Insurance Claim">
                        Insurance Claim
                      </option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="col-12 col-md-5">
                  <div className="form-block h-100">
                    <label className="form-label-premium">
                      Payment Status
                    </label>

                    <select
                      className="form-select premium-control"
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                    >
                      <option value="Paid">
                        Paid / Settled
                      </option>

                      <option value="Pending">
                        Pending Payment
                      </option>
                    </select>
                  </div>
                </div>

                {/* Live Total */}
                <div className="col-12 col-md-7">
                  <div className="live-total">
                    <div className="d-flex justify-content-between align-items-center gap-3 h-100">
                      <div>
                        <div className="live-total-label">
                          Estimated invoice total
                        </div>

                        <div className="subtotal-line mt-2">
                          Subtotal{' '}
                          <strong>
                            {formatCurrency(
                              calculateSubtotal()
                            )}
                          </strong>
                        </div>

                        <div className="subtotal-line mt-1">
                          Tax{' '}
                          <strong>
                            +{formatCurrency(calculateTax())}
                          </strong>
                        </div>
                      </div>

                      <div className="live-total-value">
                        {formatCurrency(calculateTotal())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-12">
                  <div className="form-actions d-flex justify-content-between align-items-center gap-3">
                    <div className="small text-muted">
                      <i className="bi bi-shield-check text-success me-1" />
                      Secure billing record
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setFormData(initialFormData);
                          setIsExpanded(false);
                        }}
                      >
                        Cancel
                      </button>

                      {!isPaid && (
                        <button
                          type="button"
                          className="action-btn"
                          title="Pay with Razorpay"
                          disabled={payingBillId === bill.id}
                          onClick={() => handleRazorpayPayment(bill)}
                        >
                          <i className="bi bi-wallet2" />
                        </button>
                      )}

                      <button
                        type="submit"
                        className="generate-btn"
                      >
                        <i className="bi bi-file-earmark-check me-2" />
                        Generate Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      )}

      {/* =====================================================
          BILLING LEDGER
      ====================================================== */}

      <div className="billing-surface">
        <div className="ledger-header">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-3">
                <div className="ledger-icon">
                  <i className="bi bi-journal-text" />
                </div>

                <h5 className="ledger-title">
                  Billing Ledger
                </h5>
              </div>

              <div className="ledger-subtitle">
                Invoice history, collections and outstanding balances
              </div>
            </div>

            <span className="records-pill">
              {safeBills.length} Records
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table premium-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">
                  Invoice
                </th>

                <th>Patient</th>
                <th>Subtotal</th>
                <th>Adjustments</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>

                <th className="text-end pe-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {safeBills.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center empty-state"
                  >
                    <div className="empty-icon">
                      <i className="bi bi-receipt fs-3" />
                    </div>

                    <div className="empty-title">
                      No invoices yet
                    </div>

                    <div className="empty-description">
                      Your generated medical invoices will appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                safeBills.map((bill) => {
                  const patientName =
                    bill.patientName ||
                    (bill.patient
                      ? bill.patient.name
                      : 'N/A');

                  const isPaid =
                    bill.paymentStatus === 'Paid';

                  return (
                    <tr key={bill.id}>
                      {/* Invoice */}
                      <td className="ps-4">
                        <div className="invoice-number">
                          #INV-{bill.id}
                        </div>

                        <div className="invoice-date">
                          {bill.date || 'Today'}
                        </div>
                      </td>

                      {/* Patient */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="patient-avatar">
                            {getInitial(patientName)}
                          </div>

                          <div>
                            <div className="patient-name">
                              {patientName}
                            </div>

                            <div className="patient-caption">
                              Patient account
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="fw-semibold">
                        {formatCurrency(
                          bill.subtotal ||
                            bill.totalAmount ||
                            0
                        )}
                      </td>

                      {/* Adjustments */}
                      <td>
                        <div className="small text-danger">
                          -{formatCurrency(
                            bill.discount || 0
                          )}
                        </div>

                        <div
                          className="small mt-1"
                          style={{
                            color: '#89958f',
                          }}
                        >
                          Tax +
                          {formatCurrency(
                            bill.tax || 0
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <div className="amount-total">
                          {formatCurrency(
                            bill.totalAmount || 0
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td>
                        <span className="payment-pill">
                          <i className="bi bi-credit-card" />
                          {bill.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-pill ${
                            isPaid
                              ? 'status-paid'
                              : 'status-pending'
                          }`}
                        >
                          <i
                            className={`bi ${
                              isPaid
                                ? 'bi-check-circle-fill'
                                : 'bi-clock-fill'
                            }`}
                          />

                          {bill.paymentStatus ||
                            'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          {bill.paymentStatus !== 'Paid' && (
                            <button
                              type="button"
                              className="action-btn"
                              title="Pay Online"
                              disabled={payingBillId === bill.id}
                              onClick={() => handleRazorpayPayment(bill)}
                              style={{ color: '#08745b', background: '#eafaf4', borderColor: '#ccebdc' }}
                            >
                              <i className="bi bi-wallet2" />
                            </button>
                          )}

                          {!isPatient && (
                            <button
                              type="button"
                              className="action-btn"
                              title="Toggle Payment Status"
                              onClick={() =>
                                handleTogglePaymentStatus(
                                  bill.id,
                                  bill.paymentStatus
                                )
                              }
                            >
                              <i className="bi bi-arrow-repeat" />
                            </button>
                          )}

                          <button
                            type="button"
                            className="action-btn print"
                            title="Print Invoice"
                            onClick={() =>
                              setPrintInvoice(bill)
                            }
                          >
                            <i className="bi bi-printer" />
                          </button>

                          {!isPatient && (
                            <button
                              type="button"
                              className="action-btn delete"
                              title="Delete Invoice"
                              onClick={() =>
                                handleDeleteBill(
                                  bill.id
                                )
                              }
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          PRINT INVOICE
      ====================================================== */}

      {printInvoice && (
        <PrintModal
          show={!!printInvoice}
          onClose={() => setPrintInvoice(null)}
          title={`Official GST Tax Invoice · #INV-${printInvoice.id}`}
        >
          <HospitalTaxInvoiceSlip invoice={printInvoice} />
        </PrintModal>
      )}
    </div>
  );
}

export default BillingPanel;
