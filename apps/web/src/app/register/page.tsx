'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { registerSchema } from '@/lib/schemas';
import { Button, Card, Input, Label } from '@/components/ui/primitives';

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Errore registrazione' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold">Crea il tuo account</h1>
        <p className="mb-6 text-sm text-slate-500">Onboarding: crea organizzazione e primo utente owner</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>First name</Label>
            <Input {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label>Last name</Label>
            <Input {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <Label>Organization</Label>
            <Input {...register('organizationName')} />
            {errors.organizationName && (
              <p className="text-sm text-red-600">{errors.organizationName.message}</p>
            )}
          </div>
          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creazione...' : 'Registrati'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Hai già un account? <Link href="/login" className="text-blue-600">Accedi</Link>
        </p>
      </Card>
    </div>
  );
}
