import { apiJson } from './apiClient';

export type MeResponse = {
  user: any;
  purchases: any[];
  enrollments: any[];
};

export async function getMe() {
  return apiJson<MeResponse>('/api/auth/me', { method: 'GET' });
}

