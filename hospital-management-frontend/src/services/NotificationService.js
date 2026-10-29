import apiClient from './apiClient';

const BASE_URL = '/notifications';

const NotificationService = {
  getUserNotifications: (userId, page = 0, size = 20) =>
    apiClient.get(`${BASE_URL}/user/${userId}`, { params: { page, size } }),
  getUnreadCount: (userId) =>
    apiClient.get(`${BASE_URL}/user/${userId}/unread-count`),
  markAsRead: (id) =>
    apiClient.patch(`${BASE_URL}/${id}/read`),
  markAllAsRead: (userId) =>
    apiClient.patch(`${BASE_URL}/user/${userId}/read-all`),
  triggerEvent: (eventRequest) =>
    apiClient.post(`${BASE_URL}/trigger`, eventRequest),
};

export default NotificationService;
