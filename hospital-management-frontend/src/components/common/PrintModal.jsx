import React from 'react';

function PrintModal({ show = true, onClose, title, children }) {
  if (!show) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4">
          
          <div className="modal-header bg-light border-0 py-3 no-print">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-printer text-primary"></i> {title}
            </h5>
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-primary btn-sm px-3 fw-semibold" onClick={handlePrint}>
                <i className="bi bi-printer me-1"></i> Print / Download PDF
              </button>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
          </div>

          <div className="modal-body p-4 p-md-5 printable-area">
            {children}
          </div>

          <div className="modal-footer bg-light border-0 py-2 no-print">
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Close Preview
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PrintModal;