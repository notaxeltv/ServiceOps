'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { token } = useAuth();
  const { data: org } = useQuery<{ name: string; plan: string }>({
    queryKey: ['organization'],
    queryFn: () => apiFetch('/organizations/current', {}, token),
  });
  const { data: users } = useQuery<Array<{ role: string; user: { firstName: string; lastName: string; email: string } }>>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/users', {}, token),
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Impostazioni</h2>
        <Card className="mb-6">
          <h3 className="mb-2 font-semibold">Organizzazione</h3>
          <p>{org?.name}</p>
          <p className="text-sm text-slate-500">Piano: {org?.plan}</p>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Utenti</h3>
          <ul className="space-y-2 text-sm">
            {users?.map((m: { role: string; user: { firstName: string; lastName: string; email: string } }) => (
              <li key={m.user.email}>
                {m.user.firstName} {m.user.lastName} — {m.user.email} ({m.role})
              </li>
            ))}
          </ul>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
