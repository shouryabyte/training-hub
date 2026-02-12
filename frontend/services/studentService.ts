import { apiJson } from './apiClient';

export type Batch = {
  _id: string;
  name: 'ALPHA' | 'DELTA';
  description?: string;
};

export type Division = {
  _id: string;
  name: string;
  batch: Batch;
  hasResumeTrack: boolean;
  slug?: string;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  outcomes?: string[];
  sortOrder?: number;
  isActive?: boolean;
};

export type Enrollment = {
  _id: string;
  student: string;
  division: Division;
  createdAt: string;
  updatedAt: string;
};

export async function getDivisions() {
  return apiJson<Division[]>('/api/divisions', { method: 'GET' });
}

export async function enrollDivision(divisionId: string) {
  return apiJson<Enrollment>('/api/student/enroll', {
    method: 'POST',
    body: JSON.stringify({ divisionId }),
  });
}

export async function getMyEnrollments() {
  return apiJson<Enrollment[]>('/api/student/enrollments', { method: 'GET' });
}
