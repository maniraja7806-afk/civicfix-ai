import { api } from './api';

export const publicService = {
  getTransparencyData: async () => {
    const response = await api.get('/public/transparency');
    return response.data;
  }
};
