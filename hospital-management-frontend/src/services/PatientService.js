import apiClient from './apiClient';

const BASE_URL = "/patients";

class PatientService {
  async getAllPatients() {
    const response = await apiClient.get(BASE_URL);
    return response;
  }

  async createPatient(patient) {
    const response = await apiClient.post(BASE_URL, patient);
    return response;
  }

  async updatePatient(id, updatedData) {
    const response = await apiClient.put(`${BASE_URL}/${id}`, updatedData);
    return response;
  }

  async deletePatient(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
}

export default new PatientService();