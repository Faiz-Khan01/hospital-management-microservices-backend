import apiClient from './apiClient';

const BASE_URL = "/billing";

class BillingService {
  async getAllBills() {
    const response = await apiClient.get(BASE_URL);
    return response;
  }

  async createBill(billingData) {
    const response = await apiClient.post(BASE_URL, billingData);
    return response;
  }

  async updatePaymentStatus(id, status) {
    const response = await apiClient.put(`${BASE_URL}/${id}/status`, { status });
    return response;
  }

  async deleteBill(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
}

export default new BillingService();