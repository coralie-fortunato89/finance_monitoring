import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.toString() ?? '';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export type HealthResponse = {
  status: string;
  database: 'up' | 'down';
};

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/api/health');
  return data;
}
