import apiClient from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  leaveBalance?: {
    total: number;
    used: number;
    remaining: number;
    carriedOver: number;
  };
}

// ── User Service ──────────────────────────────────────────────
const userService = {
  /**
   * Lấy danh sách tất cả users (Admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Lấy thông tin user theo ID
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Lấy thông tin leave balance của user
   */
  getUserLeaveBalance: async (userId: number) => {
    const response = await apiClient.get(`/users/${userId}/leave-balance`);
    return response.data;
  },

  /**
   * Update profile user
   */
  updateProfile: async (userId: number, data: Partial<User>) => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Lấy team members (nếu là manager)
   */
  getTeamMembers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/team/members');
    return response.data;
  },
};

export default userService;
