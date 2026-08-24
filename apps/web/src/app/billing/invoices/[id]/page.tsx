'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface DocumentLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceDetail {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  job?: { title: string };
  lines?: DocumentLine[];
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const qc = useQueryClient();
  const [line, setLine] = useState({ description: '', quantity: '1', unitPrice: '0' });

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => apiFetch<InvoiceDetail>(`/billing/invoices/${id}`, {}, token),
  });

  const addLine = useMutation({
    mutationFn: () =>
      apiFetch(`/billing/invoices/${id}/lines`, {
        method: 'POST',
        body: JSON.stringify({
          description: line.description,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        }),
      }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      setLine({ description: '', quantity: '1', unitPrice: '0' });
    },
  });

  if (isLoading) return <AuthGuard><AppShell><p>Caricamento...</p></AppShell></AuthGuard>;

  return (
    <AuthGuard>
      <AppShell>
        <Link href="/billing" className="text-sm text-blue-600">← Billing</Link>
        <h2 className="mb-2 mt-4 text-2xl font-bold">{invoice?.number}</h2>
        <p className="mb-6 text-slate-500">{invoice?.job?.title} — €{Number(invoice?.totalAmount).toFixed(2)}</p>

        <Card className="mb-6">
          <h3 className="mb-4 font-semibold">Righe dettaglio</h3>
          <ul className="mb-4 space-y-1 text-sm">
            {invoice?.lines?.map((l: { id: string; description: string; quantity: number; unitPrice: number }) => (
              <li key={l.id}>
                {l.description}: {Number(l.quantity)} × €{Number(l.unitPrice).toFixed(2)}
              </li>
            ))}
          </ul>
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder="Descrizione" value={line.description} onChange={(e) => setLine({ ...line, description: e.target.value })} />
            <Input placeholder="Qty" type="number" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: e.target.value })} />
            <Input placeholder="Prezzo" type="number" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: e.target.value })} />
          </div>
          <Button className="mt-3" onClick={() => addLine.mutate()}>Aggiungi riga</Button>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
