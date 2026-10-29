import React from 'react';

function HospitalTaxInvoiceSlip({ invoice }) {
  if (!invoice) return null;

  const todayStr = invoice.date || new Date().toISOString().split('T')[0];
  const invoiceNo = invoice.id ? `INV-2026-${invoice.id}` : `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const consultationFee = Number(invoice.consultationFee || 500);
  const medicineCharges = Number(invoice.medicineCharges || 650);
  const labCharges = Number(invoice.labCharges || 1200);
  const roomCharges = Number(invoice.roomCharges || 0);

  const defaultItems = [
    { desc: 'Doctor Specialist OPD Consultation & Clinical Review', sac: '999312', amount: consultationFee },
    { desc: 'Dispensed Pharmacy Medications & Medical Supplies', sac: '3004', amount: medicineCharges },
    ...(labCharges > 0 ? [{ desc: 'Clinical Pathology, Blood Chemistry & Diagnostic Testing', sac: '999319', amount: labCharges }] : []),
    ...(roomCharges > 0 ? [{ desc: 'Inpatient Ward / Bed Care & Nursing Charges', sac: '999311', amount: roomCharges }] : [])
  ];

  const items = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items.map((it, idx) => ({
        desc: it.description || it.desc || 'Medical Care & Services',
        sac: it.sac || (idx === 0 ? '999312' : idx === 1 ? '3004' : '999319'),
        amount: Number(it.amount || 500)
      }))
    : defaultItems;

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = Number(invoice.discount || 0);
  const taxableAmount = Math.max(0, subtotal - discount);

  // 5% GST (2.5% CGST + 2.5% SGST)
  const cgst = taxableAmount * 0.025;
  const sgst = taxableAmount * 0.025;
  const totalTax = cgst + sgst;
  const grandTotal = Number(invoice.totalAmount || (taxableAmount + totalTax));

  const isPaid = (invoice.paymentStatus || '').toLowerCase() === 'paid';

  return (
    <div className="tax-invoice-container" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1e293b', background: '#fff' }}>
      <style>{`
        .tax-invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 12px;
        }

        .ti-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 2px solid #0f766e;
        }

        .ti-brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .ti-brand-sub {
          font-size: 11px;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 3px;
        }

        .ti-header-right {
          text-align: right;
        }

        .ti-tax-tag {
          display: inline-block;
          padding: 4px 12px;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .ti-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 20px;
          margin-top: 20px;
        }

        .ti-meta-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .ti-meta-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ti-meta-val {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .ti-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
        }

        .ti-table th {
          background: #f1f5f9;
          border-bottom: 2px solid #cbd5e1;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 14px;
        }

        .ti-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          vertical-align: middle;
        }

        .ti-calc-section {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: flex-start;
        }

        .ti-qr-card {
          padding: 14px 18px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ti-summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 18px;
        }

        .ti-sum-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #475569;
          margin-bottom: 6px;
        }

        .ti-sum-row.grand {
          border-top: 2px solid #cbd5e1;
          padding-top: 8px;
          margin-top: 8px;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .ti-footer {
          margin-top: 36px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .ti-paid-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #ecfdf5;
          border: 1.5px solid #10b981;
          color: #047857;
          border-radius: 20px;
          font-weight: 800;
          font-size: 11px;
        }
      `}</style>

      {/* HEADER */}
      <div className="ti-header">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="d-flex align-items-center justify-content-center rounded-3 bg-teal text-white shadow-xs" style={{ width: 48, height: 48, background: '#0f766e', fontSize: 24 }}>
              <i className="bi bi-hospital"></i>
            </div>
            <div>
              <h2 className="ti-brand-title">HospitalSync Healthcare</h2>
              <div className="ti-brand-sub">Advanced Multispecialty Medical Center & Hospital</div>
            </div>
          </div>
          <div className="small text-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            <div>24 Hospital Boulevard, Medical Enclave, New Delhi - 110001</div>
            <div><strong>GSTIN:</strong> 07AABCH1234F1Z8 · <strong>PAN:</strong> AABCH1234F</div>
            <div>Accounts & Billing Desk: billing@hospitalsync.org · Helpline: 1800-200-9999</div>
          </div>
        </div>

        <div className="ti-header-right">
          <div className="ti-tax-tag">OFFICIAL GST TAX INVOICE</div>
          <div className="fs-5 fw-bold text-dark font-monospace">{invoiceNo}</div>
          <div className="small text-muted mt-1">Invoice Date: <strong>{todayStr}</strong></div>
          <div className="mt-2">
            {isPaid ? (
              <span className="ti-paid-badge">
                <i className="bi bi-check-circle-fill"></i> PAYMENT SETTLED
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1 fw-bold">
                <i className="bi bi-clock-history me-1"></i> PAYMENT PENDING
              </span>
            )}
          </div>
        </div>
      </div>

      {/* METADATA GRID */}
      <div className="ti-meta-grid">
        <div className="ti-meta-col">
          <span className="ti-meta-label">Patient Details</span>
          <span className="ti-meta-val">{invoice.patientName || 'Patient'}</span>
          <small className="text-muted">
            Patient ID: #{invoice.patientId || '101'} · Category: Regular Inpatient / OPD
          </small>
        </div>

        <div className="ti-meta-col text-end" style={{ alignItems: 'flex-end' }}>
          <span className="ti-meta-label">Payment & Billing Method</span>
          <span className="ti-meta-val text-primary">{invoice.paymentMethod || 'UPI / Instant Bank Transfer'}</span>
          <small className="text-muted">Transaction Ref: TXN-{(invoice.id || 101) * 987}</small>
        </div>
      </div>

      {/* CHARGES TABLE */}
      <table className="ti-table">
        <thead>
          <tr>
            <th style={{ width: 35 }}>#</th>
            <th>Service Description & Line Item</th>
            <th className="text-center" style={{ width: 110 }}>HSN / SAC</th>
            <th className="text-end" style={{ width: 140 }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td className="text-muted fw-bold">{String(idx + 1).padStart(2, '0')}</td>
              <td>
                <div className="fw-bold text-dark">{it.desc}</div>
                <small className="text-muted">Authorized hospital clinical service</small>
              </td>
              <td className="text-center">
                <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: 10 }}>
                  {it.sac}
                </span>
              </td>
              <td className="text-end fw-bold text-dark">₹{it.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CALCULATION & PAYMENT PROOF */}
      <div className="ti-calc-section">
        {/* QR & COMPLIANCE */}
        <div className="ti-qr-card">
          <div className="bg-white p-2 border rounded-2 text-center" style={{ minWidth: 84 }}>
            <i className="bi bi-qr-code fs-1 text-dark d-block"></i>
            <small style={{ fontSize: 9 }} className="fw-bold text-muted">SCAN TO PAY</small>
          </div>
          <div>
            <div className="fw-bold text-dark" style={{ fontSize: 12 }}>UPI & Digital Healthcare Checkout</div>
            <p className="mb-0 text-muted" style={{ fontSize: 11, lineHeight: 1.4 }}>
              Scan with GPay, PhonePe, Paytm or BHIM UPI for zero-convenience fee digital settlements.
              <br />
              <span className="font-monospace text-primary fw-bold">hospitalsync.billing@icici</span>
            </p>
          </div>
        </div>

        {/* SUMMARY TOTALS */}
        <div className="ti-summary-box">
          <div className="ti-sum-row">
            <span>Subtotal (Healthcare):</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="ti-sum-row text-danger">
              <span>Hospital Concession / Discount:</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="ti-sum-row">
            <span>CGST (2.5%):</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div className="ti-sum-row">
            <span>SGST (2.5%):</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>
          <div className="ti-sum-row grand">
            <span>Grand Total:</span>
            <span className="text-teal" style={{ color: '#0f766e' }}>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER & REVENUE STAMP */}
      <div className="ti-footer">
        <div className="small text-muted" style={{ maxWidth: 440, fontSize: 10, lineHeight: 1.5 }}>
          <div>* Computer generated official tax invoice pursuant to GST Section 31(1) of CGST Act 2017.</div>
          <div>* Inpatient insurance claims subject to final TPA approval and cashless authorization.</div>
          <div>* Medical expenses eligible for tax deductions under Section 80D of the Income Tax Act.</div>
        </div>

        <div className="text-center" style={{ minWidth: 180 }}>
          <div className="fw-bold text-dark" style={{ fontSize: 13, color: '#0f766e', marginBottom: 4 }}>
            <i className="bi bi-patch-check-fill text-success me-1"></i> ACCOUNTS DEPARTMENT
          </div>
          <div style={{ borderTop: '1.5px dashed #94a3b8', paddingTop: 4, fontSize: 11, fontWeight: 700, color: '#334155' }}>
            Authorized Billing Officer
            <br />
            <small className="text-muted" style={{ fontSize: 9 }}>FINANCIAL CONTROLLER</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalTaxInvoiceSlip;
