'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ActivitiesPage() {
  const { token } = useAuth();
  const { data } = useQuery<Array<{ id: string; hours: number; hourlyCost: number; job: { title: string } }>>({
    queryKey: ['activities'],
    queryFn: () => apiFetch('/activities', {}, token),
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Attività</h2>
        <div className="space-y-2">
          {data?.map((a: { id: string; hours: number; hourlyCost: number; job: { title: string } }) => (
            <Card key={a.id}>
              <p className="font-medium">{a.job.title}</p>
              <p className="text-sm text-slate-500">{Number(a.hours)}h · €{Number(a.hourlyCost)}/h</p>
            </Card>
          ))}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
