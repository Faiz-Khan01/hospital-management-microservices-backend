import axios from 'axios';
import AuthService from './AuthService';

const BASE_URL = 'http://localhost:8080/api/v1/medicines';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${AuthService.getToken()}` }
});

const MedicineService = {
  getAllMedicines: () => axios.get(BASE_URL, getHeaders()),
  getMedicineById: (id) => axios.get(`${BASE_URL}/${id}`, getHeaders()),
  createMedicine: (medicine) => axios.post(BASE_URL, medicine, getHeaders()),
  updateMedicine: (id, medicine) => axios.put(`${BASE_URL}/${id}`, medicine, getHeaders()),
  deleteMedicine: (id) => axios.delete(`${BASE_URL}/${id}`, getHeaders()),
};

export default MedicineService;
