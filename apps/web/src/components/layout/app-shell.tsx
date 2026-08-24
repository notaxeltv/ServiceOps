'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/customers', label: 'Clienti' },
  { href: '/jobs', label: 'Commesse' },
  { href: '/activities', label: 'Attività' },
  { href: '/inventory', label: 'Magazzino' },
  { href: '/reports', label: 'Report' },
  { href: '/settings', label: 'Impostazioni' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">ServiceOps</h1>
          <p className="text-xs text-slate-500">Sistema operativo servizi</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm',
                pathname.startsWith(link.href)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">Organizzazione</p>
            <p className="font-medium">{user?.organizationId}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
              Esci
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
