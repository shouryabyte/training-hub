import { apiJson, clearAuthToken, setAuthToken } from './apiClient';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
};

export type AuthResponse = {
  message: string;
  token?: string;
  user?: AuthUser;
  verificationRequired?: boolean;
};

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  adminInviteKey?: string;
  teacherInviteKey?: string;
}) {
  const data = await apiJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const data = await apiJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function requestEmailOtp(payload: { email: string; purpose?: string }) {
  return apiJson<{ success: boolean }>('/api/auth/otp/request', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function verifyEmailOtp(payload: { email: string; code: string; purpose?: string }) {
  return apiJson<{ success: boolean }>('/api/auth/otp/verify', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function googleLogin(payload: { credential: string }) {
  const data = await apiJson<AuthResponse>('/api/auth/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  if (data?.token) setAuthToken(data.token);
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
