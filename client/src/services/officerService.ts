import { api } from './api';
import { Complaint } from '../types';

export const officerService = {
  getAssignments: async (): Promise<{
    success: boolean;
    count: number;
    assignments: Complaint[];
  }> => {
    const response = await api.get('/officer/assignments');
    return response.data;
  },

  getStats: async (): Promise<{
    success: boolean;
    stats: {
      total: number;
      assigned: number;
      inProgress: number;
      resolved: number;
      critical: number;
      resolutionRate: number;
    };
  }> => {
    const response = await api.get('/officer/stats');
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: { status: string; comment?: string; rejectionReason?: string }
  ): Promise<{ success: boolean; message: string; complaint: Complaint }> => {
    const response = await api.patch(`/officer/complaints/${id}/status`, data);
    return response.data;
  },

  submitEvidence: async (id: string, formData: FormData): Promise<{
    success: boolean;
    message: string;
    complaint: Complaint;
  }> => {
    const response = await api.post(`/officer/complaints/${id}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
