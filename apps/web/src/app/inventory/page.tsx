'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function InventoryPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [minStock, setMinStock] = useState('');

  const { data: materials } = useQuery<Array<{ id: string; name: string; stockQuantity: number; averageCost: number; minStock?: number }>>({
    queryKey: ['materials'],
    queryFn: () => apiFetch('/inventory/materials', {}, token),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => apiFetch<Array<{ id: string; name: string; stockQuantity: number; minStock: number }>>(
      '/inventory/materials/low-stock',
      {},
      token,
    ),
  });

  const create = useMutation({
    mutationFn: (payload: { name: string; minStock?: number }) =>
      apiFetch('/inventory/materials', { method: 'POST', body: JSON.stringify(payload) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      setName('');
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Magazzino</h2>
        {lowStock && lowStock.length > 0 && (
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <h3 className="mb-2 font-semibold text-amber-800">Alert scorte minime</h3>
            <ul className="text-sm text-amber-900">
              {lowStock.map((m) => (
                <li key={m.id}>
                  {m.name}: {Number(m.stockQuantity)} / min {Number(m.minStock)}
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card className="mb-6">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate({
                name,
                minStock: minStock ? Number(minStock) : undefined,
              });
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome materiale" />
            <Input value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Scorta min." type="number" />
            <Button type="submit">Aggiungi</Button>
          </form>
        </Card>
        <div className="space-y-2">
          {materials?.map((m: { id: string; name: string; stockQuantity: number; averageCost: number }) => (
            <Card key={m.id}>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-slate-500">
                Scorta: {Number(m.stockQuantity)} · Costo medio: €{Number(m.averageCost)}
              </p>
            </Card>
          ))}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
