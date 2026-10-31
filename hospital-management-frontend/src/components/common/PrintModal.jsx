import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { modalBackdrop, modalAnimation, buttonPress } from '../../animations/motionConfig';

function PrintModal({ show = true, onClose, title, children }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={modalBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            zIndex: 1060,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              variants={modalAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="modal-content shadow-lg border-0 rounded-4 overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="modal-header bg-light border-0 py-3 no-print">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                  <i className="bi bi-printer text-primary" /> {title}
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <motion.button
                    variants={buttonPress}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    className="btn btn-primary btn-sm px-3 fw-semibold shadow-sm"
                    onClick={handlePrint}
                  >
                    <i className="bi bi-printer me-1" /> Print / Download PDF
                  </motion.button>
                  <button type="button" className="btn-close" onClick={onClose} />
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PrintModal;
