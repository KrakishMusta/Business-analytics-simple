import axios from 'axios';

const baseURL = 'https://business-analytics-simple.project-zero-one01.workers.dev' + import.meta.env.VITE_API_URL;
const baseKEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
    params: {
    key: baseKEY,
    // dateFrom: '2025-08-07',
    limit: 20
  },
})

export default api