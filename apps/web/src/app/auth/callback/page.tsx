'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/primitives';
import { API_URL } from '@/lib/api';

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/login?error=sso');
      return;
    }

    (async () => {
      const me = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      const membership = me.memberships?.find(
        (m: { organization: { id: string } }) =>
          m.organization.id === (JSON.parse(localStorage.getItem('serviceops_user') || '{}').organizationId || me.memberships[0]?.organization?.id),
      ) ?? me.memberships?.[0];

      const user = {
        id: me.id,
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
        organizationId: membership?.organization?.id ?? '',
        organizationName: membership?.organization?.name ?? '',
        role: membership?.role ?? 'MEMBER',
      };

      localStorage.setItem('serviceops_token', token);
      localStorage.setItem('serviceops_user', JSON.stringify(user));
      await refreshSession();
      router.replace('/dashboard');
    })().catch(() => router.replace('/login?error=sso'));
  }, [params, router, refreshSession]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Card>
        <p>Completamento accesso SSO...</p>
      </Card>
    </div>
  );
}
