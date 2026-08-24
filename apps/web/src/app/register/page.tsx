'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button, Card, Input, Label } from '@/components/ui/primitives';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold">Crea il tuo account</h1>
        <p className="mb-6 text-sm text-slate-500">Onboarding: crea organizzazione e primo utente owner</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {(['firstName', 'lastName', 'email', 'password', 'organizationName'] as const).map((field) => (
            <div key={field}>
              <Label htmlFor={field}>{field}</Label>
              <Input
                id={field}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creazione...' : 'Registrati'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Hai già un account? <Link href="/login" className="text-blue-600">Accedi</Link>
        </p>
      </Card>
    </div>
  );
}
