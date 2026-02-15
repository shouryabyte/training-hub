import { apiJson } from './apiClient';
import type { Division } from './studentService';

export type PublicCatalog = {
  batches: any[];
  divisions: Division[];
  plans: any[];
};

const CATALOG_CACHE_KEY = 'public_catalog_cache_v1';
const COURSES_CACHE_KEY_PREFIX = 'public_courses_cache_v1:';
const DEFAULT_TTL_MS = 60_000;

let catalogMem: { ts: number; data: PublicCatalog } | null = null;
let catalogInFlight: Promise<PublicCatalog> | null = null;

const coursesMem = new Map<string, { ts: number; data: Division[] }>();
const coursesInFlight = new Map<string, Promise<Division[]>>();

function now() {
  return Date.now();
}

function readLocal<T>(key: string): { ts: number; data: T } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Number.isFinite(Number(parsed.ts))) return null;
    return { ts: Number(parsed.ts), data: parsed.data as T };
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, entry: { ts: number; data: T }) {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export async function listPublicCourses(batch?: 'ALPHA' | 'DELTA') {
  const cacheKey = `${COURSES_CACHE_KEY_PREFIX}${batch || 'all'}`;
  const t = now();

  const mem = coursesMem.get(cacheKey);
  if (mem && t - mem.ts < DEFAULT_TTL_MS) return mem.data;

  const stored = readLocal<Division[]>(cacheKey);
  if (stored && t - stored.ts < DEFAULT_TTL_MS) {
    coursesMem.set(cacheKey, stored);
    return stored.data;
  }

  const inFlight = coursesInFlight.get(cacheKey);
  if (inFlight) return inFlight;

  const qs = batch ? `?batch=${encodeURIComponent(batch)}` : '';
  const p = apiJson<Division[]>(`/api/public/courses${qs}`, { method: 'GET', auth: false, retryOn401: false })
    .then((data) => {
      const entry = { ts: now(), data: data || [] };
      coursesMem.set(cacheKey, entry);
      writeLocal(cacheKey, entry);
      return entry.data;
    })
    .finally(() => {
      coursesInFlight.delete(cacheKey);
    });

  coursesInFlight.set(cacheKey, p);
  return p;
}

export async function getPublicCatalog() {
  const t = now();
  if (catalogMem && t - catalogMem.ts < DEFAULT_TTL_MS) return catalogMem.data;

  const stored = readLocal<PublicCatalog>(CATALOG_CACHE_KEY);
  if (stored && t - stored.ts < DEFAULT_TTL_MS) {
    catalogMem = stored;
    return stored.data;
  }

  if (catalogInFlight) return catalogInFlight;

  catalogInFlight = apiJson<PublicCatalog>('/api/public/catalog', { method: 'GET', auth: false, retryOn401: false })
    .then((data) => {
      const entry = { ts: now(), data: data || { batches: [], divisions: [], plans: [] } };
      catalogMem = entry;
      writeLocal(CATALOG_CACHE_KEY, entry);
      return entry.data;
    })
    .finally(() => {
      catalogInFlight = null;
    });

  return catalogInFlight;
}
