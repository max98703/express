
import axios from 'axios';

const axio = axios.create({
  baseURL: 'http://localhost:5000',
});

export default axio;
