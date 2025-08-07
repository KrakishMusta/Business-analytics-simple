import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
const baseKEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
    params: {
    key: baseKEY
  },
})

export default api