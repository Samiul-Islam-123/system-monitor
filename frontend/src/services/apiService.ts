import axios from 'axios';
import { SystemMetrics } from '@/lib/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

export const apiService = {
  async getCurrentMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get('/metrics/current');
    return response.data;
  },

  async getHistoryMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get('/metrics/history');
    return response.data;
  },
};