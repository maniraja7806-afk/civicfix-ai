import { api } from './api';
import { AiAnalysis } from '../types';

export const aiService = {
  analyzeImage: async (file: File, userNotes?: string): Promise<{
    success: boolean;
    message: string;
    analysis: AiAnalysis;
  }> => {
    const formData = new FormData();
    formData.append('image', file);
    if (userNotes) {
      formData.append('userNotes', userNotes);
    }
    const response = await api.post('/ai/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  classifyComplaint: async (data: {
    category: string;
    title: string;
    description?: string;
    landmark?: string;
    address?: string;
    nearbyReportCount?: number;
    reportedSeverity?: string;
  }): Promise<{
    success: boolean;
    priority: string;
    score: number;
    reason: string;
    factors: any;
  }> => {
    const response = await api.post('/ai/classify-complaint', data);
    return response.data;
  },

  detectDuplicates: async (data: {
    category: string;
    title: string;
    description?: string;
    latitude: number;
    longitude: number;
    maxDistanceMeters?: number;
  }): Promise<{
    success: boolean;
    count: number;
    hasDuplicates: boolean;
    duplicates: any[];
  }> => {
    const response = await api.post('/ai/detect-duplicates', data);
    return response.data;
  },

  suggestDepartment: async (data: {
    category: string;
    title?: string;
    description?: string;
  }): Promise<{
    success: boolean;
    recommendation: {
      departmentId: string;
      departmentName: string;
      departmentCode: string;
      confidenceScore: number;
      reason: string;
      suggestedOfficerId?: string;
      suggestedOfficerName?: string;
    };
  }> => {
    const response = await api.post('/ai/suggest-department', data);
    return response.data;
  }
};
