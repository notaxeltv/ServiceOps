'use client';

import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface DocumentLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  job?: { title: string };
  lines?: DocumentLine[];
}

export default function BillingPage() {
  const { token } = useAuth();

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => apiFetch<Quote[]>('/billing/quotes', {}, token),
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiFetch<Quote[]>('/billing/invoices', {}, token),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiFetch<{ plan: string; status: string; paymentProvider?: string }>('/billing/subscription', {}, token),
  });

  const checkout = useMutation({
    mutationFn: (params: { plan: 'PRO' | 'BUSINESS'; provider?: string }) =>
      apiFetch<{ url: string }>(
        '/billing/checkout',
        { method: 'POST', body: JSON.stringify(params) },
        token,
      ),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Billing</h2>

        <Card className="mb-6">
          <h3 className="mb-2 font-semibold">Subscription</h3>
          <p className="text-sm text-slate-600">
            Piano: {subscription?.plan ?? 'FREE'} — {subscription?.status ?? 'active'}
            {subscription?.paymentProvider ? ` (${subscription.paymentProvider})` : ''}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => checkout.mutate({ plan: 'PRO', provider: 'STRIPE' })}>
              Pro (Stripe)
            </Button>
            <Button variant="outline" onClick={() => checkout.mutate({ plan: 'BUSINESS', provider: 'STRIPE' })}>
              Business (Stripe)
            </Button>
            <Button variant="outline" onClick={() => checkout.mutate({ plan: 'PRO', provider: 'LEMONSQUEEZY' })}>
              Pro (Lemon)
            </Button>
            <Button variant="outline" onClick={() => checkout.mutate({ plan: 'BUSINESS', provider: 'LEMONSQUEEZY' })}>
              Business (Lemon)
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold">Preventivi</h3>
            <ul className="space-y-2 text-sm">
              {quotes?.map((q) => (
                <li key={q.id} className="flex justify-between border-b border-slate-100 py-2">
                  <Link href={`/billing/quotes/${q.id}`} className="text-blue-600 hover:underline">
                    {q.number} — {q.job?.title}
                  </Link>
                  <span>€{Number(q.totalAmount).toFixed(2)} ({q.status})</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="mb-4 font-semibold">Fatture</h3>
            <ul className="space-y-2 text-sm">
              {invoices?.map((inv) => (
                <li key={inv.id} className="flex justify-between border-b border-slate-100 py-2">
                  <Link href={`/billing/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                    {inv.number} — {inv.job?.title}
                  </Link>
                  <span>€{Number(inv.totalAmount).toFixed(2)} ({inv.status})</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
