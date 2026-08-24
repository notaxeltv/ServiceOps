'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button, Card, Input, Label } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface SsoConfig {
  provider: string;
  enabled: boolean;
  issuer: string;
  clientId?: string;
  metadataUrl?: string;
}

export default function SettingsPage() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [ssoForm, setSsoForm] = useState({
    provider: 'OIDC',
    enabled: false,
    issuer: '',
    clientId: '',
    clientSecret: '',
    metadataUrl: '',
    idpCert: '',
  });

  const { data: org } = useQuery<{ name: string; plan: string }>({
    queryKey: ['organization'],
    queryFn: () => apiFetch('/organizations/current', {}, token),
  });

  const { data: users } = useQuery<Array<{ role: string; user: { firstName: string; lastName: string; email: string } }>>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/users', {}, token),
  });

  const { data: ssoConfig } = useQuery<SsoConfig | null>({
    queryKey: ['sso-config'],
    queryFn: () => apiFetch('/auth/sso/config', {}, token),
    enabled: user?.role === 'OWNER' || user?.role === 'ADMIN',
  });

  useEffect(() => {
    if (ssoConfig) {
      setSsoForm({
        provider: ssoConfig.provider ?? 'OIDC',
        enabled: ssoConfig.enabled ?? false,
        issuer: ssoConfig.issuer ?? '',
        clientId: ssoConfig.clientId ?? '',
        clientSecret: '',
        metadataUrl: ssoConfig.metadataUrl ?? '',
        idpCert: '',
      });
    }
  }, [ssoConfig]);

  const saveSso = useMutation({
    mutationFn: () => apiFetch('/auth/sso/config', { method: 'PATCH', body: JSON.stringify(ssoForm) }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sso-config'] }),
  });

  return (
    <AuthGuard>
      <AppShell>
        <h2 className="mb-6 text-2xl font-bold">Impostazioni</h2>
        <Card className="mb-6">
          <h3 className="mb-2 font-semibold">Organizzazione</h3>
          <p>{org?.name}</p>
          <p className="text-sm text-slate-500">Piano: {org?.plan}</p>
        </Card>

        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
          <Card className="mb-6">
            <h3 className="mb-4 font-semibold">SSO Enterprise (OIDC / SAML)</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Provider</Label>
                <select
                  className="w-full rounded border p-2"
                  value={ssoForm.provider}
                  onChange={(e) => setSsoForm({ ...ssoForm, provider: e.target.value })}
                >
                  <option value="OIDC">OIDC</option>
                  <option value="SAML">SAML</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="checkbox"
                  checked={ssoForm.enabled}
                  onChange={(e) => setSsoForm({ ...ssoForm, enabled: e.target.checked })}
                />
                <Label>Abilitato</Label>
              </div>
              <Input placeholder="Issuer / Entry point URL" value={ssoForm.issuer} onChange={(e) => setSsoForm({ ...ssoForm, issuer: e.target.value })} />
              <Input placeholder="Client ID (OIDC)" value={ssoForm.clientId} onChange={(e) => setSsoForm({ ...ssoForm, clientId: e.target.value })} />
              <Input placeholder="Client Secret (OIDC)" value={ssoForm.clientSecret} onChange={(e) => setSsoForm({ ...ssoForm, clientSecret: e.target.value })} />
              <Input placeholder="Metadata URL (SAML)" value={ssoForm.metadataUrl} onChange={(e) => setSsoForm({ ...ssoForm, metadataUrl: e.target.value })} />
              <Input placeholder="IdP cert PEM (SAML)" value={ssoForm.idpCert} onChange={(e) => setSsoForm({ ...ssoForm, idpCert: e.target.value })} />
            </div>
            <Button className="mt-4" onClick={() => saveSso.mutate()} disabled={saveSso.isPending}>
              Salva SSO
            </Button>
          </Card>
        )}

        <Card>
          <h3 className="mb-4 font-semibold">Utenti</h3>
          <ul className="space-y-2 text-sm">
            {users?.map((m) => (
              <li key={m.user.email}>
                {m.user.firstName} {m.user.lastName} — {m.user.email} ({m.role})
              </li>
            ))}
          </ul>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
