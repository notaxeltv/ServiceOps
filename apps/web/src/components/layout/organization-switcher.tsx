'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button, Input } from '@/components/ui/primitives';
import { apiFetch } from '@/lib/api';

export function OrganizationSwitcher() {
  const { user, memberships, token, switchOrganization } = useAuth();
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  if (!user) return null;

  const handleCreate = async () => {
    if (!newOrgName.trim() || !token) return;
    const org = await apiFetch<{ id: string }>(
      '/organizations',
      { method: 'POST', body: JSON.stringify({ name: newOrgName }) },
      token,
    );
    setNewOrgName('');
    setCreating(false);
    await switchOrganization(org.id);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        value={user.organizationId}
        onChange={(e) => switchOrganization(e.target.value)}
      >
        {memberships.map((m) => (
          <option key={m.organization.id} value={m.organization.id}>
            {m.organization.name}
          </option>
        ))}
      </select>
      {creating ? (
        <div className="flex gap-1">
          <Input
            className="h-8 w-40"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Nuova org"
          />
          <Button className="h-8 px-2 text-xs" onClick={handleCreate}>OK</Button>
        </div>
      ) : (
        <button
          type="button"
          className="text-xs text-blue-600 hover:underline"
          onClick={() => setCreating(true)}
        >
          + Org
        </button>
      )}
    </div>
  );
}
