import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
const baseKEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: baseKEY,
    // dateFrom: '2025-08-07',
  },
});

// Добавляем интерсептор для обработки параметров
api.interceptors.request.use((config) => {
  // Если limit не указан в параметрах запроса, устанавливаем значение по умолчанию 20
  if (!config.params?.limit) {
    config.params = {
      ...config.params,
      limit: 20,
    };
  }
  
  // Всегда добавляем API ключ, если он не был переопределен
  if (!config.params?.key) {
    config.params = {
      ...config.params,
      key: baseKEY,
    };
  }

  return config;
});

export default api;