import axios from 'axios';
import type { ApiSystemMetrics } from '@/types/apiMetrics';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

export const apiService = {
  async getCurrentMetrics(): Promise<ApiSystemMetrics> {
    const response = await apiClient.get('/metrics/current');
    return response.data;
  },

  async getHistoryMetrics(): Promise<ApiSystemMetrics> {
    const response = await apiClient.get('/metrics/history');
    return response.data;
  },
};