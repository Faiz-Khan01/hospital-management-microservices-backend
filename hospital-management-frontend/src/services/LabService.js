import axios from 'axios';
import AuthService from './AuthService';

const LAB_TEST_URL = 'http://localhost:8080/api/v1/lab-tests';
const LAB_REPORT_URL = 'http://localhost:8080/api/v1/lab-reports';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${AuthService.getToken()}` }
});

const LabService = {
  // Lab Tests
  getAllTests: () => axios.get(LAB_TEST_URL, getHeaders()),
  getTestById: (id) => axios.get(`${LAB_TEST_URL}/${id}`, getHeaders()),
  createTest: (test) => axios.post(LAB_TEST_URL, test, getHeaders()),
  deleteTest: (id) => axios.delete(`${LAB_TEST_URL}/${id}`, getHeaders()),

  // Lab Reports
  getAllReports: () => axios.get(LAB_REPORT_URL, getHeaders()),
  getReportById: (id) => axios.get(`${LAB_REPORT_URL}/${id}`, getHeaders()),
  getReportsByPatient: (patientId) => axios.get(`${LAB_REPORT_URL}/patient/${patientId}`, getHeaders()),
  createReport: (report) => axios.post(LAB_REPORT_URL, report, getHeaders()),
  updateReport: (id, report) => axios.put(`${LAB_REPORT_URL}/${id}`, report, getHeaders()),
  deleteReport: (id) => axios.delete(`${LAB_REPORT_URL}/${id}`, getHeaders()),
};

export default LabService;
