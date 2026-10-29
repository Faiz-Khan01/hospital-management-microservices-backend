import axios from 'axios';
import AuthService from './AuthService';

const BASE_URL = 'http://localhost:8080/api/v1/medical-records';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${AuthService.getToken()}` }
});

const MedicalRecordService = {
  getAllRecords: () => axios.get(BASE_URL, getHeaders()),
  getRecordById: (id) => axios.get(`${BASE_URL}/${id}`, getHeaders()),
  getRecordsByPatientId: (patientId) => axios.get(`${BASE_URL}/patient/${patientId}`, getHeaders()),
  createRecord: (record) => axios.post(BASE_URL, record, getHeaders()),
  updateRecord: (id, record) => axios.put(`${BASE_URL}/${id}`, record, getHeaders()),
  deleteRecord: (id) => axios.delete(`${BASE_URL}/${id}`, getHeaders()),
};

export default MedicalRecordService;
