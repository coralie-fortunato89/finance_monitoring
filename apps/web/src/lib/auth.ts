import axios from 'axios';
import { apiClient } from './api-client';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export function mapAuthError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }
  const status = error.response?.status;
  const message = (error.response?.data as { message?: string | string[] } | undefined)
    ?.message;

  if (status === 409) {
    return 'Un compte existe déjà avec cet email.';
  }
  if (status === 401) {
    return 'Email ou mot de passe incorrect.';
  }
  if (status === 400) {
    if (Array.isArray(message)) {
      return message.join(' ');
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    return 'Données invalides. Vérifiez le formulaire.';
  }
  if (status === 429) {
    return 'Trop de tentatives. Réessayez dans une minute.';
  }
  if (!error.response) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
  }
  return fallback;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', input);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', input);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/api/auth/me');
  return data;
}

export async function refreshSession(): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh');
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
    // Cookie may already be gone; treat logout as best-effort.
  }
}
