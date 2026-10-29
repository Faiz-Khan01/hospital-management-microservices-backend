import apiClient from './apiClient';

const BASE_URL = "/prescriptions";

class PrescriptionService {
  async getAllPrescriptions() {
    const response = await apiClient.get(BASE_URL);
    return response;
  }

  async addPrescription(prescriptionData) {
    const response = await apiClient.post(BASE_URL, prescriptionData);
    return response;
  }

  async deletePrescription(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
}

export default new PrescriptionService();