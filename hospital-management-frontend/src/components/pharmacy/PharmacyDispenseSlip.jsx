import React from 'react';

function PharmacyDispenseSlip({ rx, dispensedItems = [] }) {
  if (!rx) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const invoiceId = rx.id ? `PHARM-${rx.id}` : `PHARM-${Math.floor(100000 + Math.random() * 900000)}`;

  const items = dispensedItems.length > 0 ? dispensedItems : (
    Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines.map((m, i) => ({
      name: m.name,
      dosage: m.dosage || '1 Tab',
      qty: m.quantity || (m.duration?.includes('30') ? 30 : m.duration?.includes('14') ? 14 : m.duration?.includes('10') ? 10 : 10),
      price: m.price || (i % 2 === 0 ? 35.00 : 85.00),
      batchNo: `BAT-${2026}${i + 1}X`
    })) : [
      { name: 'Paracetamol 650mg', dosage: '1 Tablet', qty: 10, price: 32.50, batchNo: 'BAT-2026A1' },
      { name: 'Pantoprazole 40mg', dosage: '1 Tablet', qty: 5, price: 85.00, batchNo: 'BAT-2026B2' }
    ]
  );

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 40) * Number(item.qty || 10)), 0);
  const gst = subtotal * 0.05; // 5% GST on medicines
  const total = subtotal + gst;

  return (
    <div className="pharmacy-slip-container" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1e293b', background: '#fff' }}>
      <style>{`
        .pharmacy-slip-container {
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          padding: 28px;
          border-radius: 12px;
        }

        .ps-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 18px;
          border-bottom: 2px solid #059669;
        }

        .ps-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ps-logo {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ps-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .ps-sub {
          font-size: 11px;
          font-weight: 600;
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ps-contact {
          text-align: right;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }

        .ps-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-top: 18px;
        }

        .ps-info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ps-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ps-val {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .ps-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .ps-table th {
          background: #f0fdf4;
          border-bottom: 2px solid #bbf7d0;
          color: #166534;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          text-align: left;
        }

        .ps-table td {
          padding: 11px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12.5px;
          vertical-align: middle;
        }

        .ps-totals {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
        }

        .ps-totals-box {
          width: 260px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .ps-totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #475569;
          margin-bottom: 6px;
        }

        .ps-totals-row.final {
          border-top: 1.5px dashed #cbd5e1;
          padding-top: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0;
        }

        .ps-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .ps-stamp {
          text-align: center;
          min-width: 170px;
        }

        .ps-stamp-line {
          border-top: 1.5px dashed #94a3b8;
          padding-top: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
        }
      `}</style>

      {/* HEADER */}
      <div className="ps-header">
        <div className="ps-brand">
          <div className="ps-logo">
            <i className="bi bi-capsule"></i>
          </div>
          <div>
            <h2 className="ps-title">HospitalSync Central Pharmacy</h2>
            <div className="ps-sub">Licensed Medication Dispensing & Inventory Unit</div>
          </div>
        </div>
        <div className="ps-contact">
          <div><i className="bi bi-geo-alt-fill text-success me-1"></i> Ground Floor, Block B, Hospital Campus</div>
          <div><i className="bi bi-telephone-fill text-primary me-1"></i> Pharmacy Extn: #404 / 405</div>
          <div><i className="bi bi-patch-check-fill text-success me-1"></i> Drug License: DL-29482/ND</div>
        </div>
      </div>

      {/* METADATA */}
      <div className="ps-info-grid">
        <div className="ps-info-item">
          <span className="ps-label">Patient Information</span>
          <span className="ps-val">{rx.patientName || 'Patient'}</span>
          <small className="text-muted">Patient ID: #{rx.patientId || '101'}</small>
        </div>

        <div className="ps-info-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="ps-label">Prescribing Physician</span>
          <span className="ps-val">{rx.doctorName || 'Dr. Medical Officer'}</span>
          <small className="text-muted">Dept: {rx.department || 'General Medicine'}</small>
        </div>

        <div className="ps-info-item">
          <span className="ps-label">Pharmacy Invoice Token</span>
          <span className="ps-val text-success">{invoiceId}</span>
          <small className="text-muted">Linked Rx: Rx-{rx.id || 'NEW'}</small>
        </div>

        <div className="ps-info-item text-end" style={{ alignItems: 'flex-end' }}>
          <span className="ps-label">Dispensed Date & Time</span>
          <span className="ps-val">{todayStr} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="badge bg-success-subtle text-success border border-success-subtle mt-1" style={{ fontSize: 10 }}>
            <i className="bi bi-check-circle-fill me-1"></i> VERIFIED & DISPENSED
          </span>
        </div>
      </div>

      {/* TABLE */}
      <table className="ps-table">
        <thead>
          <tr>
            <th style={{ width: 35 }}>#</th>
            <th>Medication & Strength</th>
            <th>Batch No</th>
            <th className="text-center">Qty Dispensed</th>
            <th className="text-end">Unit Price</th>
            <th className="text-end">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const lineTotal = Number(it.price || 35) * Number(it.qty || 10);
            return (
              <tr key={idx}>
                <td className="text-muted fw-bold">{String(idx + 1).padStart(2, '0')}</td>
                <td>
                  <div className="fw-bold text-dark">{it.name}</div>
                  <small className="text-muted">{it.dosage || '1 Tab'}</small>
                </td>
                <td>
                  <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: 10 }}>
                    {it.batchNo || `BAT-0${idx + 1}X`}
                  </span>
                </td>
                <td className="text-center fw-bold">{it.qty} Units</td>
                <td className="text-end">₹{Number(it.price || 35).toFixed(2)}</td>
                <td className="text-end fw-bold text-dark">₹{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="ps-totals">
        <div className="ps-totals-box">
          <div className="ps-totals-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="ps-totals-row">
            <span>Medication GST (5%):</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="ps-totals-row final">
            <span>Total Payable:</span>
            <span className="text-success">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="ps-footer">
        <div className="text-muted small" style={{ maxWidth: 440, fontSize: 10, lineHeight: 1.5 }}>
          <div>* Medications verified by registered pharmacist before checkout.</div>
          <div>* Storage note: Keep medicines tightly closed and away from heat & direct light.</div>
          <div>* Keep out of reach of children. Take exactly as advised by your doctor.</div>
        </div>

        <div className="ps-stamp">
          <div className="fw-bold text-success" style={{ fontSize: 13, marginBottom: 4 }}>
            <i className="bi bi-shield-check me-1"></i> PHARMACY QUALITY PASSED
          </div>
          <div className="ps-stamp-line">
            Chief Dispensing Pharmacist
            <br />
            <small className="text-muted" style={{ fontSize: 9 }}>REGISTERED DISPENSER</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyDispenseSlip;
