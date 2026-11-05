import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

/**
 * AnimatedCounter Component
 * 
 * High-performance, GPU-synced numeric interpolation component built with Motion for React.
 * Supports integers, decimals, currency prefixes, units, dynamic API updates, and prefers-reduced-motion.
 *
 * @param {number|string} value - The target numeric value or string to display
 * @param {number} duration - Animation duration in seconds (default: 0.85s)
 * @param {string} prefix - Optional prefix symbol (e.g., '₹', '$')
 * @param {string} suffix - Optional suffix unit (e.g., '%', 'L', ' Pcs', ' Days')
 * @param {number} decimals - Fixed decimal places (optional)
 * @param {function} formatter - Optional custom formatter function (val) => string
 * @param {string} className - Additional CSS class names
 * @param {object} style - Inline styles
 */
export default function AnimatedCounter({
  value,
  duration = 0.85,
  prefix = '',
  suffix = '',
  decimals = null,
  formatter = null,
  className = '',
  style = {}
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(() => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  });

  const prevValueRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // If value is null, undefined or empty
    if (value === null || value === undefined || value === '') {
      setDisplayValue('—');
      return;
    }

    // Extract numeric component if string contains formatted numbers
    let rawStr = String(value).trim();
    let isNegative = rawStr.startsWith('-');
    let cleanedStr = rawStr.replace(/[^0-9.]/g, '');

    // Check if it's purely a non-numeric string (e.g. "Optimal", "Standby")
    const num = parseFloat(cleanedStr);
    if (isNaN(num)) {
      setDisplayValue(rawStr);
      return;
    }

    const targetNum = isNegative ? -num : num;

    // Detect decimal places if not explicitly supplied
    let targetDecimals = decimals;
    if (targetDecimals === null) {
      const parts = cleanedStr.split('.');
      targetDecimals = parts.length > 1 ? parts[1].length : 0;
    }

    const formatNumber = (val) => {
      if (formatter && typeof formatter === 'function') {
        return formatter(val);
      }
      return val.toLocaleString('en-IN', {
        minimumFractionDigits: targetDecimals,
        maximumFractionDigits: targetDecimals
      });
    };

    // If reduced motion is requested, snap immediately without animation
    if (shouldReduceMotion) {
      setDisplayValue(formatNumber(targetNum));
      prevValueRef.current = targetNum;
      return;
    }

    const startVal = isFirstRender.current ? 0 : prevValueRef.current;
    isFirstRender.current = false;

    // Run smooth motion interpolation
    const controls = animate(startVal, targetNum, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayValue(formatNumber(latest));
      },
      onComplete: () => {
        prevValueRef.current = targetNum;
        setDisplayValue(formatNumber(targetNum));
      }
    });

    return () => controls.stop();
  }, [value, duration, decimals, formatter, shouldReduceMotion]);

  return (
    <span className={`hs-animated-counter ${className}`} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
