'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface DashboardKpis {
  totalRevenue: number;
  totalMargin: number;
  averageMarginPercent: number;
  jobCount: number;
  openJobs: number;
  overdueJobs: number;
  customerCount: number;
  lowStockCount: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardKpis>('/reports/dashboard', {}, token),
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
        {isLoading ? (
          <p>Caricamento KPI...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Ricavi totali" value={`€${data?.totalRevenue?.toFixed(2) ?? '0'}`} />
            <KpiCard title="Margine totale" value={`€${data?.totalMargin?.toFixed(2) ?? '0'}`} />
            <KpiCard title="Margine medio" value={`${data?.averageMarginPercent?.toFixed(1) ?? '0'}%`} />
            <KpiCard title="Commesse aperti" value={String(data?.openJobs ?? 0)} />
            <KpiCard title="Commesse in ritardo" value={String(data?.overdueJobs ?? 0)} />
            <KpiCard title="Clienti" value={String(data?.customerCount ?? 0)} />
            <KpiCard title="Commesse totali" value={String(data?.jobCount ?? 0)} />
            <KpiCard
              title="Scorte sotto minimo"
              value={String(data?.lowStockCount ?? 0)}
              alert={Boolean(data?.lowStockCount && data.lowStockCount > 0)}
            />
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}

function KpiCard({
  title,
  value,
  alert,
}: {
  title: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? 'border-amber-300 bg-amber-50' : undefined}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
