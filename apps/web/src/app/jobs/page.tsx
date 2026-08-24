'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Job {
  id: string;
  title: string;
  status: string;
  customer: { id: string; name: string };
}

interface Customer {
  id: string;
  name: string;
}

export default function JobsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiFetch<Job[]>('/jobs', {}, token),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/crm/customers', {}, token),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; customerId: string }) =>
      apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      setTitle('');
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Commesse</h2>
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold">Nuova commessa</h3>
          <div>
            <Label>Cliente</Label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Seleziona cliente</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Titolo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Button
            onClick={() => createMutation.mutate({ title, customerId })}
            disabled={!title || !customerId}
          >
            Crea commessa
          </Button>
        </Card>
        {isLoading ? (
          <p>Caricamento...</p>
        ) : (
          <div className="space-y-2">
            {jobs?.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{job.title}</span>
                  <span className="text-sm text-slate-500">{job.status}</span>
                </div>
                <p className="text-sm text-slate-500">{job.customer.name}</p>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
