import apiClient from './apiClient';

const BASE_URL = '/payments';

const PaymentService = {
  getAllPayments: () => apiClient.get(BASE_URL),
  getPaymentById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  getPaymentsByPatient: (patientId) => apiClient.get(`${BASE_URL}/patient/${patientId}`),
  createPayment: (payment) => apiClient.post(BASE_URL, payment),
  updatePayment: (id, payment) => apiClient.put(`${BASE_URL}/${id}`, payment),
  deletePayment: (id) => apiClient.delete(`${BASE_URL}/${id}`),
  createRazorpayOrder: (billingId, amount) =>
    apiClient.post(`${BASE_URL}/razorpay/order`, { billingId, amount }),
  verifyRazorpayPayment: (payload) =>
    apiClient.post(`${BASE_URL}/razorpay/verify`, payload),
};

export default PaymentService;
