import { apiJson } from './apiClient';
import type { Division } from './studentService';

export type PublicCatalog = {
  batches: any[];
  divisions: Division[];
  plans: any[];
};

export async function listPublicCourses(batch?: 'ALPHA' | 'DELTA') {
  const qs = batch ? `?batch=${encodeURIComponent(batch)}` : '';
  return apiJson<Division[]>(`/api/public/courses${qs}`, { method: 'GET', auth: false, retryOn401: false });
}

export async function getPublicCatalog() {
  return apiJson<PublicCatalog>('/api/public/catalog', { method: 'GET', auth: false, retryOn401: false });
}
