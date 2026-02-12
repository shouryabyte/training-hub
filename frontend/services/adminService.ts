import { apiJson } from './apiClient';

export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  batch?: any;
};

export type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  batch?: any | null;
  createdAt?: string;
};

export type AdminDashboard = {
  stats: {
    students: number;
    teachers: number;
    byBatch: Record<string, number>;
    coursesTotal: number;
    coursesActive: number;
    coursesByBatch: Record<string, { total: number; active: number }>;
    revenue: number;
    paidPurchases: number;
    paidCustomers: number;
    activeSubscribers: number;
    totalEnrollments: number;
  };
  recentPurchases: any[];
  students: Array<{
    id: string;
    name: string;
    email: string;
    batch: { id: string; name: 'ALPHA' | 'DELTA' } | null;
    latestPurchase: null | {
      status: string;
      planKey?: string;
      planTitle?: string;
      validUntil?: string | null;
      amount?: number;
      provider?: string;
    };
    enrollments: number;
    enrolledCourses: Array<{ id: string; name: string; batchName: string | null; enrolledAt?: string }>;
  }>;
  teachers: Array<{
    id: string;
    name: string;
    email: string;
    coursesTotal: number;
    coursesActive: number;
    createdAt?: string;
  }>;
  batches: any[];
  plans: any[];
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

export type ProgramPlan = {
  _id: string;
  key: string;
  title: string;
  batch: any;
  includedDivisions: any[];
  durationLabel?: string;
  durationDays?: number | null;
  currency: string;
  amount: number;
  isActive: boolean;
};

export async function getAdminDashboard() {
  return apiJson<AdminDashboard>('/api/admin/dashboard', { method: 'GET' });
}

export async function listStudents() {
  return apiJson<User[]>('/api/admin/students', { method: 'GET' });
}

export async function assignBatch(userId: string, batchId: string) {
  return apiJson<User>('/api/admin/assign-batch', {
    method: 'POST',
    body: JSON.stringify({ userId, batchId }),
  });
}

export async function createBatch(payload: { name: 'ALPHA' | 'DELTA'; description?: string }) {
  return apiJson('/api/batch', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createDivision(payload: { name: string; batch: string; hasResumeTrack?: boolean }) {
  return apiJson('/api/division', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listCourses(batchId?: string) {
  const qs = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
  return apiJson<Course[]>(`/api/admin/courses${qs}`, { method: 'GET' });
}

export async function listManagedUsers(role?: 'TEACHER' | 'STUDENT') {
  const qs = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiJson<ManagedUser[]>(`/api/admin/users${qs}`, { method: 'GET' });
}

export async function createManagedUser(payload: { name: string; email: string; password: string; role: 'TEACHER' | 'STUDENT'; batch?: string }) {
  return apiJson<ManagedUser>('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateManagedUser(id: string, payload: { name?: string; password?: string; role?: 'TEACHER' | 'STUDENT'; batch?: string | null }) {
  return apiJson<ManagedUser>(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteManagedUser(id: string) {
  return apiJson<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function listPlans() {
  return apiJson<ProgramPlan[]>('/api/admin/plans', { method: 'GET' });
}

export async function createPlan(payload: Omit<ProgramPlan, '_id' | 'batch' | 'includedDivisions'> & { batch: string; includedDivisions: string[] }) {
  return apiJson<ProgramPlan>('/api/admin/plans', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePlan(id: string, payload: Omit<ProgramPlan, '_id' | 'batch' | 'includedDivisions'> & { batch: string; includedDivisions: string[] }) {
  return apiJson<ProgramPlan>(`/api/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deletePlan(id: string) {
  return apiJson<{ success: boolean }>(`/api/admin/plans/${id}`, { method: 'DELETE' });
}
