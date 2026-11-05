import apiClient from './apiClient';

const BASE_URL = '/medical-records';

const MedicalRecordService = {
  getAllRecords: () => apiClient.get(BASE_URL),
  getRecordById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  getRecordsByPatientId: (patientId) => apiClient.get(`${BASE_URL}/patient/${patientId}`),
  createRecord: (record) => apiClient.post(BASE_URL, record),
  updateRecord: (id, record) => apiClient.put(`${BASE_URL}/${id}`, record),
  deleteRecord: (id) => apiClient.delete(`${BASE_URL}/${id}`),
};

export default MedicalRecordService;
