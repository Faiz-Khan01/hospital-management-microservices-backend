import apiClient from './apiClient';

const LAB_TEST_URL = '/lab-tests';
const LAB_REPORT_URL = '/lab-reports';

const LabService = {
  // Lab Tests
  getAllTests: () => apiClient.get(LAB_TEST_URL),
  getTestById: (id) => apiClient.get(`${LAB_TEST_URL}/${id}`),
  createTest: (test) => apiClient.post(LAB_TEST_URL, test),
  deleteTest: (id) => apiClient.delete(`${LAB_TEST_URL}/${id}`),

  // Lab Reports
  getAllReports: () => apiClient.get(LAB_REPORT_URL),
  getReportById: (id) => apiClient.get(`${LAB_REPORT_URL}/${id}`),
  getReportsByPatient: (patientId) => apiClient.get(`${LAB_REPORT_URL}/patient/${patientId}`),
  createReport: (report) => apiClient.post(LAB_REPORT_URL, report),
  updateReport: (id, report) => apiClient.put(`${LAB_REPORT_URL}/${id}`, report),
  deleteReport: (id) => apiClient.delete(`${LAB_REPORT_URL}/${id}`),
};

export default LabService;
