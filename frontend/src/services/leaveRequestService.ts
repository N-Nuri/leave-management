import apiClient from './api';

export interface LeaveRequest {
  id: number;
  userId: number;
  type: 'ANNUAL' | 'SICK' | 'PERSONAL';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  rejectReason?: string;
}

export interface CreateLeaveRequestDTO {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// ── Leave Request Service ─────────────────────────────────────
const leaveRequestService = {
  /**
   * Lấy tất cả leave requests của user hiện tại
   */
  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<LeaveRequest[]>('/leave-requests');
    return response.data;
  },

  /**
   * Lấy leave request theo ID
   */
  getLeaveRequestById: async (id: number): Promise<LeaveRequest> => {
    const response = await apiClient.get<LeaveRequest>(`/leave-requests/${id}`);
    return response.data;
  },

  /**
   * Tạo leave request mới
   */
  createLeaveRequest: async (data: CreateLeaveRequestDTO): Promise<LeaveRequest> => {
    const response = await apiClient.post<LeaveRequest>('/leave-requests', data);
    return response.data;
  },

  /**
   * Update leave request
   */
  updateLeaveRequest: async (id: number, data: Partial<CreateLeaveRequestDTO>): Promise<LeaveRequest> => {
    const response = await apiClient.put<LeaveRequest>(`/leave-requests/${id}`, data);
    return response.data;
  },

  /**
   * Cancel leave request (chỉ pending)
   */
  cancelLeaveRequest: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-requests/${id}`);
  },

  /**
   * Lấy danh sách pending requests (Manager)
   */
  getPendingRequests: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<LeaveRequest[]>('/leave-requests/pending');
    return response.data;
  },

  /**
   * Approve leave request (Manager)
   */
  approveLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/approve`);
    return response.data;
  },

  /**
   * Reject leave request (Manager)
   */
  rejectLeaveRequest: async (id: number, reason: string): Promise<LeaveRequest> => {
    const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Lấy leave requests của team (Manager)
   */
  getTeamLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<LeaveRequest[]>('/leave-requests/team');
    return response.data;
  },
};

export default leaveRequestService;
