const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type JsonRecord = Record<string, unknown>;

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_session', '1');
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_session');
}

export function getAuthToken() {
  return getStoredToken();
}

export function clearAccessToken() {
  try {
    localStorage.removeItem('auth_token');
  } catch {
    // ignore
  }
}

export function hasAuthSession(): boolean {
  try {
    return localStorage.getItem('auth_session') === '1' || Boolean(localStorage.getItem('auth_user'));
  } catch {
    return false;
  }
}

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = await readJsonSafe(res);
    if (data && typeof data.token === 'string') return data.token;
    return null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiJson<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean; retryOn401?: boolean } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  const shouldAuth = opts.auth !== false;
  const storedToken = shouldAuth ? getStoredToken() : null;
  const hadToken = Boolean(storedToken);
  if (shouldAuth) {
    if (storedToken) headers.Authorization = `Bearer ${storedToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers,
      credentials: 'include',
    });
  } catch (err: any) {
    throw new ApiError(err?.message || 'Network error (is the backend running?)', 0, null);
  }

  if (res.status === 401 && opts.retryOn401 !== false && hadToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAuthToken(newToken);
      const retryHeaders: Record<string, string> = { ...headers, Authorization: `Bearer ${newToken}` };
      let retryRes: Response;
      try {
        retryRes = await fetch(url, { ...opts, headers: retryHeaders, credentials: 'include' });
      } catch (err: any) {
        throw new ApiError(err?.message || 'Network error (is the backend running?)', 0, null);
      }
      if (!retryRes.ok) {
        const data = await readJsonSafe(retryRes);
        throw new ApiError((data && data.message) || 'Request failed', retryRes.status, data);
      }
      return (await readJsonSafe(retryRes)) as T;
    }

    // Refresh failed (cookie missing/expired). Stop future refresh loops.
    clearAuthToken();
  }

  if (!res.ok) {
    const data = await readJsonSafe(res);
    throw new ApiError((data && (data as JsonRecord).message as string) || 'Request failed', res.status, data);
  }

  return (await readJsonSafe(res)) as T;
}
