import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken, clearAccessToken, hasAuthSession } from '../services/apiClient';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refresh as apiRefresh,
  googleLogin as apiGoogleLogin,
  AuthResponse,
  AuthUser,
} from '../services/authService';
import { decodeJwt } from '../utils/jwt';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: 'ADMIN' | 'TEACHER' | 'STUDENT',
    adminInviteKey?: string,
    teacherInviteKey?: string
  ) => Promise<AuthResponse>;
  googleLogin: (credential: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser | null) {
  try {
    if (!user) localStorage.removeItem('auth_user');
    else localStorage.setItem('auth_user', JSON.stringify(user));
  } catch {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<AuthUser | null>(() => loadUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const currentToken = getAuthToken();
      if (currentToken) {
        const payload = decodeJwt(currentToken);
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
          // Access token expired; keep session flag so we can try refresh-cookie flow.
          clearAccessToken();
          setToken(null);
        } else {
          setToken(currentToken);
          if (mounted) setIsReady(true);
          return;
        }
      }

      // Avoid noisy refresh calls for public/first-time visitors.
      if (!hasAuthSession()) {
        if (mounted) setIsReady(true);
        return;
      }

      try {
        const r = await apiRefresh();
        if (r?.token) {
          const newToken = getAuthToken();
          setToken(newToken);
        } else {
          setUser(null);
          saveUser(null);
        }
      } catch {
        setUser(null);
        saveUser(null);
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isReady,
      login: async (email, password) => {
        const r = await apiLogin({ email, password });
        if (r?.token) {
          setAuthToken(r.token);
          setToken(r.token);
        }
        if (r?.user) {
          setUser(r.user);
          saveUser(r.user);
        }
        return r;
      },
      register: async (name, email, password, role, adminInviteKey, teacherInviteKey) => {
        const r = await apiRegister({ name, email, password, role, adminInviteKey, teacherInviteKey });
        if (r?.token) {
          setAuthToken(r.token);
          setToken(r.token);
        }
        if (r?.user) {
          setUser(r.user);
          saveUser(r.user);
        }
        return r;
      },
      googleLogin: async (credential) => {
        const r = await apiGoogleLogin({ credential });
        if (r?.token) {
          setAuthToken(r.token);
          setToken(r.token);
        }
        if (r?.user) {
          setUser(r.user);
          saveUser(r.user);
        }
        return r;
      },
      logout: async () => {
        try {
          await apiLogout();
        } finally {
          clearAuthToken();
          setToken(null);
          setUser(null);
          saveUser(null);
        }
      },
    }),
    [token, user, isReady]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
