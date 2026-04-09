import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const apiService = {
  async detectDisease(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/api/disease`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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
