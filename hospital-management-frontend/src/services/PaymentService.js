import axios from 'axios';
import AuthService from './AuthService';

const BASE_URL = 'http://localhost:8080/api/v1/payments';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${AuthService.getToken()}` }
});

const PaymentService = {
  getAllPayments: () => axios.get(BASE_URL, getHeaders()),
  getPaymentById: (id) => axios.get(`${BASE_URL}/${id}`, getHeaders()),
  getPaymentsByPatient: (patientId) => axios.get(`${BASE_URL}/patient/${patientId}`, getHeaders()),
  createPayment: (payment) => axios.post(BASE_URL, payment, getHeaders()),
  updatePayment: (id, payment) => axios.put(`${BASE_URL}/${id}`, payment, getHeaders()),
  deletePayment: (id) => axios.delete(`${BASE_URL}/${id}`, getHeaders()),
  createRazorpayOrder: (billingId, amount) =>
    axios.post(`${BASE_URL}/razorpay/order`, { billingId, amount }, getHeaders()),
  verifyRazorpayPayment: (payload) =>
    axios.post(`${BASE_URL}/razorpay/verify`, payload, getHeaders()),
};

export default PaymentService;
