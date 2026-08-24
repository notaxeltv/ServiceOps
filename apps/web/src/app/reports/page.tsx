'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card } from '@/components/ui/primitives';
import { apiFetch, API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface JobMargin {
  jobId: string;
  title: string;
  customerName: string;
  revenue: number;
  margin: number;
  marginPercent: number;
}

export default function ReportsPage() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ['job-margins'],
    queryFn: () => apiFetch<JobMargin[]>('/reports/jobs/margins', {}, token),
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Report margini</h2>
          <a
            href={`${API_URL}/reports/jobs/export/csv`}
            className="text-sm text-blue-600"
            onClick={(e) => {
              e.preventDefault();
              if (token) {
                window.open(`${API_URL}/reports/jobs/export/csv`, '_blank');
              }
            }}
          >
            Export CSV
          </a>
        </div>
        <div className="space-y-2">
          {data?.map((row) => (
            <Card key={row.jobId}>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-sm text-slate-500">{row.customerName}</p>
                </div>
                <div className="text-right">
                  <p>€{row.revenue.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">
                    Margine €{row.margin.toFixed(2)} ({row.marginPercent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
