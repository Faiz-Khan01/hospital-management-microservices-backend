import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { springSnappy } from '../../animations/motionConfig';

/**
 * AnimatedTabs Component
 *
 * Provides a standardized sliding active indicator pill using Motion's layoutId.
 * Fully keyboard accessible (role="tablist", Arrow navigation, Enter/Space selection).
 *
 * @param {Array} tabs - Array of tab objects [{ id, label, icon, count }] or string values
 * @param {string} activeTab - Currently active tab identifier
 * @param {function} onChange - Callback (tabId) => void
 * @param {string} layoutId - Motion layoutId string (must be unique per tab group)
 * @param {string} className - Optional container className
 */
export default function AnimatedTabs({
  tabs = [],
  activeTab,
  onChange,
  layoutId = 'hs-animated-tabs',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      const nextId = typeof nextTab === 'object' ? nextTab.id : nextTab;
      onChange(nextId);
    }
  };

  return (
    <div
      role="tablist"
      className={`d-inline-flex align-items-center p-1 rounded-3 position-relative ${className}`}
      style={{
        background: 'rgba(241, 245, 249, 0.85)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        gap: '4px'
      }}
    >
      {tabs.map((tab, idx) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const icon = typeof tab === 'object' ? tab.icon : null;
        const count = typeof tab === 'object' ? tab.count : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="btn btn-sm border-0 position-relative text-nowrap d-flex align-items-center gap-2 fw-bold"
            style={{
              padding: '7px 14px',
              fontSize: '0.82rem',
              color: isActive ? '#0f172a' : '#64748b',
              background: 'transparent',
              borderRadius: '8px',
              zIndex: 2,
              transition: 'color 0.2s ease',
              outline: 'none'
            }}
          >
            {/* Sliding Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId={shouldReduceMotion ? undefined : layoutId}
                className="position-absolute inset-0 rounded-3"
                style={{
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  zIndex: -1,
                  inset: 0
                }}
                transition={springSnappy}
              />
            )}

            {icon && <i className={`bi ${icon} ${isActive ? 'text-primary' : 'opacity-75'}`} />}
            <span>{label}</span>

            {count !== null && count !== undefined && (
              <span
                className={`badge rounded-pill ${
                  isActive ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-secondary border'
                }`}
                style={{ fontSize: '0.68rem', padding: '2px 7px' }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
