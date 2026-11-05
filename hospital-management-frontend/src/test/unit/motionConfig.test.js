import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  springSmooth,
  springSnappy,
  springBouncy,
  fadeIn,
  fadeUp,
  fadeDown,
  slideIn,
  drawerTransition,
  scaleIn,
  pageTransition,
  cardHover,
  modalBackdrop,
  modalDialog,
  tabIndicator,
  shakeError,
  isReducedMotionPreferred,
  getSafeTransition,
  reducedMotionTransition,
} from '../../animations/motionConfig';

describe('motionConfig Universal Motion Engine', () => {
  describe('Spring Presets', () => {
    it('defines valid spring physics for springSmooth', () => {
      expect(springSmooth.type).toBe('spring');
      expect(springSmooth.stiffness).toBeGreaterThan(0);
      expect(springSmooth.damping).toBeGreaterThan(0);
      expect(springSmooth.mass).toBeDefined();
    });

    it('defines high-frequency spring for springSnappy', () => {
      expect(springSnappy.type).toBe('spring');
      expect(springSnappy.stiffness).toBeGreaterThan(springSmooth.stiffness);
    });

    it('defines expressive bouncy spring for springBouncy', () => {
      expect(springBouncy.type).toBe('spring');
      expect(springBouncy.damping).toBeLessThan(springSmooth.damping);
    });
  });

  describe('Motion Variants', () => {
    it('defines correct initial and animate states for fadeIn', () => {
      expect(fadeIn.initial).toEqual({ opacity: 0 });
      expect(fadeIn.animate.opacity).toBe(1);
      expect(fadeIn.exit.opacity).toBe(0);
    });

    it('defines y-axis displacement for fadeUp and fadeDown', () => {
      expect(fadeUp.initial.y).toBeGreaterThan(0);
      expect(fadeUp.animate.y).toBe(0);

      expect(fadeDown.initial.y).toBeLessThan(0);
      expect(fadeDown.animate.y).toBe(0);
    });

    it('generates directional slide presets for slideIn', () => {
      const slideRight = slideIn('right');
      expect(slideRight.initial.x).toBe('100%');
      expect(slideRight.animate.x).toBe(0);

      const slideLeft = slideIn('left');
      expect(slideLeft.initial.x).toBe('-100%');
      expect(slideLeft.animate.x).toBe(0);

      const slideUp = slideIn('up');
      expect(slideUp.initial.y).toBe(32);
      expect(slideUp.animate.y).toBe(0);
    });

    it('provides smooth mobile drawer transition preset', () => {
      expect(drawerTransition.initial.x).toBe('-100%');
      expect(drawerTransition.animate.x).toBe(0);
      expect(drawerTransition.exit.x).toBe('-100%');
    });

    it('provides scaleIn preset for modals and badges', () => {
      expect(scaleIn.initial.scale).toBeLessThan(1);
      expect(scaleIn.animate.scale).toBe(1);
    });

    it('provides subtle pageTransition without layout shift', () => {
      expect(pageTransition.initial.opacity).toBe(0);
      expect(pageTransition.animate.opacity).toBe(1);
      expect(pageTransition.animate.y).toBe(0);
    });

    it('defines cardHover elevation states', () => {
      expect(cardHover.rest.scale).toBe(1);
      expect(cardHover.hover.scale).toBeGreaterThan(1);
      expect(cardHover.hover.y).toBeLessThan(0);
    });

    it('defines modalBackdrop with gentle blur', () => {
      expect(modalBackdrop.initial.opacity).toBe(0);
      expect(modalBackdrop.animate.opacity).toBe(1);
      expect(modalBackdrop.animate.backdropFilter).toContain('blur');
    });

    it('defines modalDialog entrance with scale and translation', () => {
      expect(modalDialog.initial.scale).toBeLessThan(1);
      expect(modalDialog.animate.scale).toBe(1);
      expect(modalDialog.animate.y).toBe(0);
    });

    it('defines tabIndicator spring physics', () => {
      expect(tabIndicator.type).toBe('spring');
      expect(tabIndicator.stiffness).toBeGreaterThan(300);
    });

    it('defines shakeError oscillation sequence for validation feedback', () => {
      expect(Array.isArray(shakeError.animate.x)).toBe(true);
      expect(shakeError.animate.x.length).toBeGreaterThan(3);
    });
  });

  describe('Accessibility & Reduced Motion Safeguards', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('detects reduced motion preference when matchMedia matches', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      expect(isReducedMotionPreferred()).toBe(true);
    });

    it('returns false when user does not prefer reduced motion', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      expect(isReducedMotionPreferred()).toBe(false);
    });

    it('returns reducedMotionTransition when reduced motion is preferred', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const safe = getSafeTransition(springSmooth);
      expect(safe).toEqual(reducedMotionTransition);
    });

    it('returns standard transition when reduced motion is not requested', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      const safe = getSafeTransition(springSmooth);
      expect(safe).toEqual(springSmooth);
    });
  });
});
