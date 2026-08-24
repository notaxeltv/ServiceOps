'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { apiFetch } from './api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName?: string;
  role: string;
}

export interface MembershipInfo {
  role: string;
  organization: { id: string; name: string; slug: string; plan: string };
}

interface AuthContextValue {
  user: AuthUser | null;
  memberships: MembershipInfo[];
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => void;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'serviceops_token';
const USER_KEY = 'serviceops_user';

function persistSession(accessToken: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<MembershipInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;
    const me = await apiFetch<{
      memberships: MembershipInfo[];
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    }>('/auth/me', {}, storedToken);
    setMemberships(me.memberships);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as AuthUser;
      const current = me.memberships.find((m) => m.organization.id === parsed.organizationId);
      const updated: AuthUser = {
        ...parsed,
        organizationName: current?.organization.name ?? parsed.organizationName,
      };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as AuthUser);
      refreshSession().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshSession]);

  const applyAuth = (accessToken: string, authUser: AuthUser) => {
    persistSession(accessToken, authUser);
    setToken(accessToken);
    setUser(authUser);
    refreshSession();
  };

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applyAuth(res.accessToken, res.user);
  };

  const register = async (data: RegisterInput) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    applyAuth(res.accessToken, res.user);
  };

  const switchOrganization = async (organizationId: string) => {
    if (!token) return;
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/auth/switch-organization',
      { method: 'POST', body: JSON.stringify({ organizationId }) },
      token,
    );
    applyAuth(res.accessToken, res.user);
    window.location.href = '/dashboard';
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setMemberships([]);
  };

  const value = useMemo(
    () => ({
      user,
      memberships,
      token,
      loading,
      login,
      register,
      switchOrganization,
      refreshSession,
      logout,
    }),
    [user, memberships, token, loading, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
