'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface JobDetail {
  id: string;
  title: string;
  status: string;
  customer: { name: string };
  economics: {
    revenue: number;
    laborCost: number;
    materialCost: number;
    margin: number;
    marginPercent: number;
  };
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number }>;
  activities: Array<{ id: string; hours: number; hourlyCost: number; description?: string }>;
  materialUsages: Array<{ id: string; quantity: number; unitCost: number; material: { name: string } }>;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => apiFetch<JobDetail>(`/jobs/${id}`, {}, token),
  });

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => apiFetch<Array<{ id: string; name: string }>>('/inventory/materials', {}, token),
  });

  const addItem = useMutation({
    mutationFn: (body: { description: string; quantity: number; unitPrice: number }) =>
      apiFetch(`/jobs/${id}/items`, { method: 'POST', body: JSON.stringify(body) }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }),
  });

  const addActivity = useMutation({
    mutationFn: (body: { jobId: string; date: string; hours: number; hourlyCost: number }) =>
      apiFetch('/activities', { method: 'POST', body: JSON.stringify(body) }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }),
  });

  const addMaterial = useMutation({
    mutationFn: (body: { jobId: string; materialId: string; quantity: number; unitCost: number }) =>
      apiFetch('/activities/material-usages', { method: 'POST', body: JSON.stringify(body) }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }),
  });

  const createQuote = useMutation({
    mutationFn: () =>
      apiFetch('/billing/quotes/from-job', { method: 'POST', body: JSON.stringify({ jobId: id }) }, token),
  });

  const createInvoice = useMutation({
    mutationFn: () =>
      apiFetch('/billing/invoices/from-job', { method: 'POST', body: JSON.stringify({ jobId: id }) }, token),
  });

  if (isLoading || !job) return <AuthGuard><AppShell><p>Caricamento...</p></AppShell></AuthGuard>;

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-2 text-2xl font-bold">{job.title}</h2>
        <p className="mb-4 text-slate-500">Cliente: {job.customer.name} · Stato: {job.status}</p>
        <div className="mb-6 flex gap-2">
          <Button variant="outline" onClick={() => createQuote.mutate()} disabled={createQuote.isPending}>
            Crea preventivo
          </Button>
          <Button variant="outline" onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending}>
            Crea fattura
          </Button>
          {createQuote.isSuccess && <span className="text-sm text-green-600">Preventivo creato</span>}
          {createInvoice.isSuccess && <span className="text-sm text-green-600">Fattura creata</span>}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card><p className="text-sm text-slate-500">Ricavi</p><p className="text-xl font-semibold">€{job.economics.revenue.toFixed(2)}</p></Card>
          <Card><p className="text-sm text-slate-500">Costo ore</p><p className="text-xl font-semibold">€{job.economics.laborCost.toFixed(2)}</p></Card>
          <Card><p className="text-sm text-slate-500">Costo materiali</p><p className="text-xl font-semibold">€{job.economics.materialCost.toFixed(2)}</p></Card>
          <Card><p className="text-sm text-slate-500">Margine</p><p className="text-xl font-semibold">€{job.economics.margin.toFixed(2)} ({job.economics.marginPercent.toFixed(1)}%)</p></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold">Aggiungi voce (ricavo)</h3>
            <QuickForm
              fields={[
                { key: 'description', label: 'Descrizione' },
                { key: 'quantity', label: 'Quantità', type: 'number' },
                { key: 'unitPrice', label: 'Prezzo unitario', type: 'number' },
              ]}
              onSubmit={(v) => addItem.mutate({
                description: v.description as string,
                quantity: Number(v.quantity),
                unitPrice: Number(v.unitPrice),
              })}
            />
            <ul className="mt-4 space-y-1 text-sm">
              {job.items.map((i) => (
                <li key={i.id}>{i.description}: {Number(i.quantity)} x €{Number(i.unitPrice)}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Registra ore</h3>
            <QuickForm
              fields={[
                { key: 'hours', label: 'Ore', type: 'number' },
                { key: 'hourlyCost', label: 'Costo orario', type: 'number' },
              ]}
              onSubmit={(v) => addActivity.mutate({
                jobId: id,
                date: new Date().toISOString(),
                hours: Number(v.hours),
                hourlyCost: Number(v.hourlyCost),
              })}
            />
            <ul className="mt-4 space-y-1 text-sm">
              {job.activities.map((a) => (
                <li key={a.id}>{Number(a.hours)}h @ €{Number(a.hourlyCost)}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Registra materiale</h3>
            <div className="mb-2">
              <Label>Materiale</Label>
              <select id="material-select" className="w-full rounded-md border p-2">
                {materials?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <QuickForm
              fields={[
                { key: 'quantity', label: 'Quantità', type: 'number' },
                { key: 'unitCost', label: 'Costo unitario', type: 'number' },
              ]}
              onSubmit={(v) => {
                const materialId = (document.getElementById('material-select') as HTMLSelectElement)?.value;
                if (!materialId) return;
                addMaterial.mutate({
                  jobId: id,
                  materialId,
                  quantity: Number(v.quantity),
                  unitCost: Number(v.unitCost),
                });
              }}
            />
            <ul className="mt-4 space-y-1 text-sm">
              {job.materialUsages.map((m) => (
                <li key={m.id}>{m.material.name}: {Number(m.quantity)} x €{Number(m.unitCost)}</li>
              ))}
            </ul>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function QuickForm({
  fields,
  onSubmit,
}: {
  fields: Array<{ key: string; label: string; type?: string }>;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
        setValues({});
      }}
    >
      {fields.map((f) => (
        <div key={f.key}>
          <Label>{f.label}</Label>
          <Input
            type={f.type ?? 'text'}
            value={values[f.key] ?? ''}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
          />
        </div>
      ))}
      <Button type="submit">Salva</Button>
    </form>
  );
}
