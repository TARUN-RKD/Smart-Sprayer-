import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:9000';
    }

    return origin;
  }

  return '';
};

const API_BASE_URL = getApiBaseUrl();

const apiService = {
  async detectDisease(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/api/detect-disease`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getLatestDetection() {
    const response = await axios.get(`${API_BASE_URL}/api/detection/latest`);
    return response.data;
  },

  async getPesticides() {
    const response = await axios.get(`${API_BASE_URL}/api/pesticides`);
    return response.data;
  },

  async getPesticideById(id) {
    const response = await axios.get(`${API_BASE_URL}/api/pesticides/${id}`);
    return response.data;
  },

  async sprayPesticide(pesticideId, diseaseId) {
    const response = await axios.post(`${API_BASE_URL}/api/spray`, {
      pesticide_id: pesticideId,
      disease_id: diseaseId ?? null,
    });
    return response.data;
  },
};

export default apiService;
