import React from 'react';
import { motion } from 'motion/react';
import { springBouncy, scaleIn } from '../../animations/motionConfig';

/**
 * LottieFeedback Component
 * Provides smooth, GPU-accelerated medical micro-interaction feedback
 * for clinical confirmations: success, vital pulse, lab processing, and payment.
 */
export default function LottieFeedback({ type = 'success', size = 80, message = '' }) {
  const renderVisual = () => {
    switch (type) {
      case 'heartbeat':
      case 'vitals':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="6 6"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              style={{ opacity: 0.3 }}
            />
            <motion.path
              d="M20 50 L35 50 L42 30 L50 70 L58 40 L65 55 L70 50 L80 50"
              stroke="#ef4444"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
            />
          </svg>
        );

      case 'lab':
      case 'processing':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              stroke="#0ea5e9"
              strokeWidth="5"
              strokeDasharray="180"
              strokeDashoffset="60"
              strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="22"
              fill="rgba(14, 165, 233, 0.15)"
              animate={{ scale: [0.85, 1.15, 0.85] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
            <motion.path
              d="M45 42 L55 42 L55 52 L50 60 L45 52 Z"
              fill="#0284c7"
              initial={{ y: -2 }}
              animate={{ y: 2 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
            />
          </svg>
        );

      case 'payment':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="#d1fae5"
              stroke="#10b981"
              strokeWidth="4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springBouncy}
            />
            <motion.path
              d="M42 35 C42 35, 60 33, 60 42 C60 52, 40 50, 40 60 C40 68, 58 66, 58 66 M50 28 L50 72"
              stroke="#059669"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            />
          </svg>
        );

      case 'success':
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="rgba(16, 185, 129, 0.12)"
              stroke="#10b981"
              strokeWidth="5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springBouncy}
            />
            <motion.path
              d="M32 50 L44 62 L68 36"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            />
          </svg>
        );
    }
  };

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="d-flex flex-column align-items-center justify-content-center py-2"
    >
      <div className="d-flex align-items-center justify-content-center">
        {renderVisual()}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-2 mb-0 fw-semibold text-center"
          style={{ fontSize: '0.95rem' }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
