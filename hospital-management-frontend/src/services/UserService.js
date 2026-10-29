import apiClient from './apiClient';

const BASE_URL = '/users';

const UserService = {
  getAdminDashboard: () => apiClient.get(`${BASE_URL}/dashboard/admin`),
  getAllUsers: () => apiClient.get(BASE_URL),
  getUserById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  updateProfile: (id, data) => apiClient.put(`${BASE_URL}/${id}`, data),
  changePassword: (id, data) => apiClient.put(`${BASE_URL}/${id}/password`, data),
};

export default UserService;
