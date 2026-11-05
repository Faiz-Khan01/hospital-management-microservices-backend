import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient from '../../services/apiClient';

describe('apiClient Axios Interceptors & Security', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('injects Authorization Bearer header when token is present in localStorage', async () => {
      localStorage.setItem('token', 'valid-jwt-token-xyz');

      // Execute request interceptor on a dummy config
      const handler = apiClient.interceptors.request.handlers[0].fulfilled;
      const config = { headers: {} };
      const modified = handler(config);

      expect(modified.headers.Authorization).toBe('Bearer valid-jwt-token-xyz');
    });

    it('does not inject Authorization header when no token exists', async () => {
      const handler = apiClient.interceptors.request.handlers[0].fulfilled;
      const config = { headers: {} };
      const modified = handler(config);

      expect(modified.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor Error Handling', () => {
    it('passes through successful response unchanged', () => {
      const handler = apiClient.interceptors.response.handlers[0].fulfilled;
      const response = { status: 200, data: { success: true } };

      expect(handler(response)).toBe(response);
    });

    it('clears session on 401 unauthorized for non-demo users', async () => {
      localStorage.setItem('token', 'real-production-token');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'DOCTOR');

      const errorHandler = apiClient.interceptors.response.handlers[0].rejected;
      const error401 = { response: { status: 401, data: { message: 'Unauthorized' } } };

      await expect(errorHandler(error401)).rejects.toBeDefined();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('preserves session on 401 when in demo mode', async () => {
      localStorage.setItem('token', 'demo-jwt-token');
      localStorage.setItem('is_demo_mode', 'true');

      const errorHandler = apiClient.interceptors.response.handlers[0].rejected;
      const error401 = { response: { status: 401 } };

      await expect(errorHandler(error401)).rejects.toBeDefined();

      // Demo token must not be erased
      expect(localStorage.getItem('token')).toBe('demo-jwt-token');
    });
  });
});
