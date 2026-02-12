import { apiJson } from './apiClient';

export type Project = {
  _id: string;
  title: string;
  description: string;
  partner?: string;
  url?: string;
  status: 'LIVE' | 'UPCOMING';
  cohortBadge?: string;
  techStack: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isFeatured?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function listProjects() {
  return apiJson<Project[]>('/api/projects', { method: 'GET', auth: false });
}

export type UpsertProjectPayload = {
  title: string;
  description: string;
  partner?: string;
  url?: string;
  status?: 'LIVE' | 'UPCOMING';
  cohortBadge?: string;
  techStack?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  startsAt?: string | null;
  endsAt?: string | null;
  isFeatured?: boolean;
};

export async function createProject(payload: UpsertProjectPayload) {
  return apiJson<Project>('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateProject(id: string, payload: Partial<UpsertProjectPayload>) {
  return apiJson<Project>(`/api/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteProject(id: string) {
  return apiJson<{ success: boolean }>(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
