import { api } from './api';
import { Department, User } from '../types';

export const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  assignComplaint: async (data: {
    complaintId: string;
    departmentId: string;
    officerId?: string;
    priority?: string;
    adminNotes?: string;
  }) => {
    const response = await api.post('/admin/assign-complaint', data);
    return response.data;
  },

  getDepartments: async (): Promise<{ success: boolean; count: number; departments: Department[] }> => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  createDepartment: async (data: any) => {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  updateDepartment: async (id: string, data: any) => {
    const response = await api.patch(`/admin/departments/${id}`, data);
    return response.data;
  },

  getUsers: async (params?: { role?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    users: User[];
  }> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (id: string, data: any) => {
    const response = await api.patch(`/admin/users/${id}/role`, data);
    return response.data;
  },

  exportCSV: async () => {
    const response = await api.get('/admin/export-csv', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicFix_Complaints_Report_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
