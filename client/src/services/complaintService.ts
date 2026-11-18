import { api } from './api';
import { Complaint, ComplaintUpdate } from '../types';

export const complaintService = {
  getComplaints: async (params?: Record<string, any>): Promise<{
    success: boolean;
    count: number;
    totalCount: number;
    page: number;
    totalPages: number;
    complaints: Complaint[];
  }> => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getComplaintById: async (id: string): Promise<{
    success: boolean;
    complaint: Complaint;
    timeline: ComplaintUpdate[];
    duplicateGroup?: any;
  }> => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (formData: FormData): Promise<{
    success: boolean;
    message: string;
    complaint: Complaint;
    duplicateWarning?: any;
  }> => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateComplaint: async (id: string, data: any): Promise<{
    success: boolean;
    message: string;
    complaint: Complaint;
  }> => {
    const response = await api.patch(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  getNearbyComplaints: async (lat: number, lng: number, radiusKm: number = 5): Promise<{
    success: boolean;
    count: number;
    complaints: Complaint[];
  }> => {
    const response = await api.get('/complaints/nearby', {
      params: { lat, lng, radiusKm }
    });
    return response.data;
  }
};
