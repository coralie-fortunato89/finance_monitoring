import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export type HealthResponse = {
  status: string;
  database: 'up' | 'down';
};

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}
