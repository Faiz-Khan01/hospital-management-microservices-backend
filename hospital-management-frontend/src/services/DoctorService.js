import apiClient from './apiClient';

const BASE_URL = "/doctors";

class DoctorService {
  async getAllDoctors() {
    const response = await apiClient.get(BASE_URL);
    return response;
  }

  async createDoctor(doctorData) {
    const response = await apiClient.post(BASE_URL, doctorData);
    return response;
  }

  async updateDoctor(id, updatedData) {
    const response = await apiClient.put(`${BASE_URL}/${id}`, updatedData);
    return response;
  }

  async updateDoctorAvailability(id, newStatus) {
    const response = await apiClient.patch(`${BASE_URL}/${id}/availability`, { availability: newStatus });
    return response;
  }

  async deleteDoctor(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
}

export default new DoctorService();