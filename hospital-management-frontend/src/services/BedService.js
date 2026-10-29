import apiClient from './apiClient';

const BASE_URL = '/beds';

const BedService = {
  getAllBeds: async () => {
    const response = await apiClient.get(BASE_URL);
    const list = response.data?.data || response.data;
    return { data: Array.isArray(list) ? list : [] };
  },

  getAvailableBeds: async () => {
    const response = await apiClient.get(`${BASE_URL}/available`);
    const list = response.data?.data || response.data;
    return { data: Array.isArray(list) ? list : [] };
  },

  getAvailableBedsCount: async () => {
    const response = await apiClient.get(`${BASE_URL}/available-count`);
    return response;
  },

  getBedsSummary: async () => {
    const response = await apiClient.get(`${BASE_URL}/summary`);
    return response;
  },

  createBed: async (bedData) => {
    const response = await apiClient.post(BASE_URL, bedData);
    return response;
  },

  updateBedStatus: async (id, status) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { status });
    return response;
  },

  deleteBed: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
};

export default BedService;
