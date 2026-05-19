import axios from 'axios';

// ── API Configuration ─────────────────────────────────────────
const API_URL = '/api'; // nginx sẽ proxy /api → backend:8080

// ── Create axios instance ─────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptor: Thêm JWT token vào mỗi request ────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor: Xử lý response errors ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
