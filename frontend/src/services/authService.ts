import apiClient from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// ── Auth Service ──────────────────────────────────────────────
const authService = {
  /**
   * Login với username/password
   * Response: { token, user }
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    // Lưu token vào localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Logout - xóa token
   */
  logout: () => {
    localStorage.removeItem('token');
    // Optional: gọi API logout backend
    // await apiClient.post('/auth/logout');
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
