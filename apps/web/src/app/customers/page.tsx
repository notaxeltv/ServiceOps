'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  _count?: { jobs: number };
}

export default function CustomersPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/crm/customers', {}, token),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      apiFetch('/crm/customers', { method: 'POST', body: JSON.stringify(payload) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setName('');
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Clienti</h2>
        </div>
        <Card className="mb-6">
          <h3 className="mb-4 font-semibold">Nuovo cliente</h3>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate({ name });
            }}
          >
            <Input placeholder="Nome cliente" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit">Aggiungi</Button>
          </form>
        </Card>
        {isLoading ? (
          <p>Caricamento...</p>
        ) : (
          <div className="space-y-2">
            {customers?.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-slate-500">{c._count?.jobs ?? 0} commesse</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
