import { apiJson, clearAuthToken, setAuthToken } from './apiClient';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export async function register(payload: { name: string; email: string; password: string; adminInviteKey?: string; teacherInviteKey?: string }) {
  const data = await apiJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const data = await apiJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function logout() {
  try {
    await apiJson<{ message: string }>('/api/auth/logout', { method: 'POST', auth: false, body: JSON.stringify({}) });
  } finally {
    clearAuthToken();
  }
}

export async function refresh() {
  const data = await apiJson<{ token: string }>('/api/auth/refresh', { method: 'POST', auth: false, body: JSON.stringify({}), retryOn401: false });
  if (data?.token) setAuthToken(data.token);
  return data;
}
