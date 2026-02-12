import { apiJson } from './apiClient';

export type Batch = {
  _id: string;
  name: 'ALPHA' | 'DELTA';
  description?: string;
};

export type Course = {
  _id: string;
  name: string;
  slug?: string;
  batch: any;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  outcomes?: string[];
  sortOrder?: number;
  isActive?: boolean;
};

export async function listBatches() {
  return apiJson<Batch[]>('/api/teacher/batches', { method: 'GET' });
}

export async function listCourses(batchId?: string) {
  const qs = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
  return apiJson<Course[]>(`/api/teacher/courses${qs}`, { method: 'GET' });
}

export async function createCourse(payload: Omit<Course, '_id' | 'batch'> & { batch: string }) {
  return apiJson<Course>('/api/teacher/courses', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCourse(id: string, payload: Omit<Course, '_id' | 'batch'> & { batch: string }) {
  return apiJson<Course>(`/api/teacher/courses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCourse(id: string) {
  return apiJson<{ success: boolean; disabled?: boolean }>(`/api/teacher/courses/${id}`, { method: 'DELETE' });
}
