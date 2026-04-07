import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const apiService = {
  async detectDisease(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post('http://localhost:9000/api/disease', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("response.data", response.data)

    return response.data;
  },

  async getPesticides() {
    const response = await axios.get(`${API_BASE_URL}/pesticides`);
    return response.data;
  },

  async getPesticideById(id) {
    const response = await axios.get(`${API_BASE_URL}/pesticides/${id}`);
    return response.data;
  },
};

export default apiService;
