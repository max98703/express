
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5050',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('id_token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
