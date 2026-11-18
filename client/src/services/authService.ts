import { api } from './api';
import { User, UserRole } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('civicfix_token', response.data.token);
    }
    return response.data;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('civicfix_token', response.data.token);
    }
    return response.data;
  },

  demoLogin: async (role: UserRole): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/demo-login', { role });
    if (response.data.token) {
      localStorage.setItem('civicfix_token', response.data.token);
    }
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('civicfix_token');
    }
  }
};
