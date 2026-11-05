import apiClient from './apiClient';

const BASE_URL = '/medicines';

const MedicineService = {
  getAllMedicines: () => apiClient.get(BASE_URL),
  getMedicineById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  createMedicine: (medicine) => apiClient.post(BASE_URL, medicine),
  updateMedicine: (id, medicine) => apiClient.put(`${BASE_URL}/${id}`, medicine),
  deleteMedicine: (id) => apiClient.delete(`${BASE_URL}/${id}`),
};

export default MedicineService;
