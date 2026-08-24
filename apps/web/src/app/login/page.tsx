'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { loginSchema } from '@/lib/schemas';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Errore di accesso' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Accedi a ServiceOps</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Accesso...' : 'Accedi'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Non hai un account? <Link href="/register" className="text-blue-600">Registrati</Link>
        </p>
      </Card>
    </div>
  );
}
