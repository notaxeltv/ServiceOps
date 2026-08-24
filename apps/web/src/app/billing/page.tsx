'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Quote {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  job?: { title: string };
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  job?: { title: string };
}

export default function BillingPage() {
  const { token } = useAuth();

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => apiFetch<Quote[]>('/billing/quotes', {}, token),
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiFetch<Invoice[]>('/billing/invoices', {}, token),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiFetch<{ plan: string; status: string }>('/billing/subscription', {}, token),
  });

  const checkout = useMutation({
    mutationFn: (plan: 'PRO' | 'BUSINESS') =>
      apiFetch<{ url: string }>(
        '/billing/stripe/checkout',
        { method: 'POST', body: JSON.stringify({ plan }) },
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
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => checkout.mutate('PRO')} disabled={checkout.isPending}>
              Upgrade Pro
            </Button>
            <Button variant="outline" onClick={() => checkout.mutate('BUSINESS')} disabled={checkout.isPending}>
              Upgrade Business
            </Button>
          </div>
          {checkout.isError && (
            <p className="mt-2 text-sm text-amber-600">
              Stripe non configurato o prezzi mancanti. Imposta STRIPE_SECRET_KEY nell&apos;API.
            </p>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold">Preventivi</h3>
            <ul className="space-y-2 text-sm">
              {quotes?.map((q) => (
                <li key={q.id} className="flex justify-between border-b border-slate-100 py-2">
                  <span>{q.number} — {q.job?.title}</span>
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
                  <span>{inv.number} — {inv.job?.title}</span>
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
