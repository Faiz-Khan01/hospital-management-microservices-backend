import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthService from '../../services/AuthService';

describe('AuthService & RBAC Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn(), href: '' },
    });
  });

  describe('Session State', () => {
    it('returns false for isAuthenticated when no token is stored', () => {
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    it('returns true for isAuthenticated when valid token is stored', () => {
      localStorage.setItem('token', 'sample-jwt-token');
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it('retrieves stored username, email, userId, and token', () => {
      localStorage.setItem('token', 'jwt-test-123');
      localStorage.setItem('username', 'Dr. Watson');
      localStorage.setItem('email', 'watson@hospital.com');
      localStorage.setItem('userId', '42');

      expect(AuthService.getToken()).toBe('jwt-test-123');
      expect(AuthService.getUsername()).toBe('Dr. Watson');
      expect(AuthService.getUserId()).toBe(42);
    });

    it('clears all session items on logout', () => {
      localStorage.setItem('token', 'jwt-test-123');
      localStorage.setItem('username', 'Admin User');
      localStorage.setItem('role', 'ADMIN');
      localStorage.setItem('userId', '1');

      AuthService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe('RBAC & Role Retrieval', () => {
    it('retrieves stored role correctly', () => {
      localStorage.setItem('role', 'DOCTOR');
      expect(AuthService.getRole()).toBe('DOCTOR');
    });

    it('defaults to PATIENT or infers DOCTOR if username starts with Dr', () => {
      localStorage.setItem('username', 'Dr. Smith');
      localStorage.setItem('role', 'PATIENT');
      expect(AuthService.getRole()).toBe('DOCTOR');
    });

    it('detects demo mode flag properly', () => {
      expect(AuthService.isDemoMode()).toBe(false);
      localStorage.setItem('is_demo_mode', 'true');
      expect(AuthService.isDemoMode()).toBe(true);
    });
  });

  describe('Fallback / Offline Authentication', () => {
    it('authenticates admin fallback account when backend is offline', async () => {
      const res = await AuthService.login({
        username: 'admin',
        password: 'password123',
      });

      expect(res.token).toContain('demo-jwt-session-token');
      expect(res.role).toBe('ROLE_ADMIN');
      expect(localStorage.getItem('role')).toBe('ADMIN');
      expect(localStorage.getItem('is_demo_mode')).toBe('true');
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it('authenticates doctor fallback account', async () => {
      const res = await AuthService.login({
        username: 'doctor',
        password: 'doctor123',
      });

      expect(res.token).toBeDefined();
      expect(res.role).toBe('ROLE_DOCTOR');
      expect(localStorage.getItem('role')).toBe('DOCTOR');
    });

    it('authenticates patient fallback account', async () => {
      const res = await AuthService.login({
        username: 'patient',
        password: 'patient123',
      });

      expect(res.token).toBeDefined();
      expect(res.role).toBe('ROLE_PATIENT');
      expect(localStorage.getItem('role')).toBe('PATIENT');
    });

    it('rejects invalid credentials', async () => {
      await expect(
        AuthService.login({
          username: 'unknown_user_999',
          password: 'wrong_password',
        })
      ).rejects.toThrow();
    });
  });
});
