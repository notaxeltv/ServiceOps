'use client';

import { useState } from 'react';
import { use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const qc = useQueryClient();
  const [siteName, setSiteName] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', role: '' });

  const { data: customer, isLoading } = useQuery<{
    name: string;
    sites?: Array<{ id: string; name: string; address?: string }>;
    contacts?: Contact[];
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

  const createContact = useMutation({
    mutationFn: (body: typeof contactForm) =>
      apiFetch(`/crm/customers/${id}/contacts`, { method: 'POST', body: JSON.stringify(body) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      setContactForm({ name: '', email: '', phone: '', role: '' });
    },
  });

  const deleteContact = useMutation({
    mutationFn: (contactId: string) =>
      apiFetch(`/crm/customers/${id}/contacts/${contactId}`, { method: 'DELETE' }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', id] }),
  });

  if (isLoading) return <AuthGuard><AppShell><p>Caricamento...</p></AppShell></AuthGuard>;

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">{customer?.name}</h2>

        <Card className="mb-6">
          <h3 className="mb-4 font-semibold">Contatti</h3>
          <form
            className="mb-4 grid gap-2 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              createContact.mutate(contactForm);
            }}
          >
            <Input placeholder="Nome" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
            <Input placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
            <Input placeholder="Telefono" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
            <Input placeholder="Ruolo" value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} />
            <Button type="submit" className="md:col-span-2">Aggiungi contatto</Button>
          </form>
          <ul className="space-y-2 text-sm">
            {customer?.contacts?.map((c) => (
              <li key={c.id} className="flex justify-between rounded border border-slate-100 p-2">
                <span>
                  {c.name}
                  {c.role ? ` (${c.role})` : ''}
                  {c.email ? ` — ${c.email}` : ''}
                  {c.phone ? ` — ${c.phone}` : ''}
                </span>
                <button type="button" className="text-red-500" onClick={() => deleteContact.mutate(c.id)}>Elimina</button>
              </li>
            ))}
          </ul>
        </Card>

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
            {customer?.sites?.map((s) => (
              <li key={s.id}>{s.name} {s.address ? `— ${s.address}` : ''}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Storico commesse</h3>
          <ul className="space-y-2">
            {customer?.jobs?.map((j) => (
              <li key={j.id} className="text-sm">{j.title} — {j.status}</li>
            ))}
          </ul>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
