'use client';

import { useState } from 'react';
import { use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const qc = useQueryClient();
  const [siteName, setSiteName] = useState('');

  const { data: customer, isLoading } = useQuery<{
    name: string;
    sites?: Array<{ id: string; name: string; address?: string }>;
    jobs?: Array<{ id: string; title: string; status: string }>;
  }>({
    queryKey: ['customer', id],
    queryFn: () => apiFetch(`/crm/customers/${id}`, {}, token),
  });

  const createSite = useMutation({
    mutationFn: (name: string) =>
      apiFetch(`/crm/customers/${id}/sites`, { method: 'POST', body: JSON.stringify({ name }) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      setSiteName('');
    },
  });

  if (isLoading) return <AuthGuard><AppShell><p>Caricamento...</p></AppShell></AuthGuard>;

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">{customer?.name}</h2>
        <Card className="mb-6">
          <h3 className="mb-4 font-semibold">Sedi / impianti</h3>
          <form
            className="flex gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              createSite.mutate(siteName);
            }}
          >
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Nome sede" />
            <Button type="submit">Aggiungi sede</Button>
          </form>
          <ul className="space-y-1 text-sm">
            {customer?.sites?.map((s: { id: string; name: string; address?: string }) => (
              <li key={s.id}>{s.name} {s.address ? `— ${s.address}` : ''}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Storico commesse</h3>
          <ul className="space-y-2">
            {customer?.jobs?.map((j: { id: string; title: string; status: string }) => (
              <li key={j.id} className="text-sm">{j.title} — {j.status}</li>
            ))}
          </ul>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
