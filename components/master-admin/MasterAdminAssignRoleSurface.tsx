'use client';

import { useEffect, useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageFrame } from '@/components/ui/PageFrame';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createDirectAdminInvite } from '@/lib/master-admin/setup';
import type { MasterAdminTenantUser, PendingRoleAssignmentRequest } from '@/lib/master-admin/server';

function formatStatus(value: string | null | undefined) {
  return value ? value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Unknown';
}

function toneForRequestStatus(status: string | null | undefined): 'info' | 'success' | 'warning' {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'failed' || status === 'rejected') {
    return 'warning';
  }

  return 'info';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function MasterAdminAssignRoleSurface({
  tenantId,
  admins,
  pendingAdminInvites,
  legacyPendingRequests,
}: {
  tenantId: string;
  admins: MasterAdminTenantUser[];
  pendingAdminInvites: MasterAdminTenantUser[];
  legacyPendingRequests: PendingRoleAssignmentRequest[];
}) {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMobile, setInviteMobile] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shouldMonitor = admins.length === 0 && pendingAdminInvites.length > 0;

  useEffect(() => {
    if (!shouldMonitor) {
      return;
    }

    const intervalId = window.setInterval(() => {
      window.location.reload();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [shouldMonitor]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    const mobile = inviteMobile.trim();

    if (!name || !email || !mobile) {
      setError('Name, email, and mobile are required.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid admin email address.');
      return;
    }

    setIsSubmittingInvite(true);
    setError(null);
    setStatusMessage('Creating the direct admin invite...');

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('Authentication required to invite the admin.');
      }

      const result = await createDirectAdminInvite(accessToken, tenantId, {
        name,
        email,
        mobile,
      });

      if (!result.success) {
        throw new Error(result.error ?? 'Could not create the admin invite.');
      }

      setInviteName('');
      setInviteEmail('');
      setInviteMobile('');
      setStatusMessage('Admin invite created. Waiting for activation and user binding...');
      window.location.reload();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Could not create the admin invite.');
      setStatusMessage(null);
    } finally {
      setIsSubmittingInvite(false);
    }
  }

  return (
    <PageFrame>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Admin handoff"
            title="Invite the first admin for this tenant"
            description="This step now follows the direct admin-invite seam. Setup completes only after the invited admin activates and the admin row is bound to a real user id."
          />

          {shouldMonitor ? (
            <div className="mt-6 rounded-[1rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              This page auto-refreshes every 15 seconds while the invited admin is still pending activation.
            </div>
          ) : null}

          {statusMessage ? (
            <div className="mt-6 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {statusMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <form className="mt-8 space-y-6" onSubmit={handleInvite}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Admin name</span>
                <input
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  placeholder="Operations admin"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Admin email</span>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  placeholder="admin@company.com"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Admin mobile</span>
                <input
                  type="tel"
                  value={inviteMobile}
                  onChange={(event) => setInviteMobile(event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  placeholder="Primary mobile number"
                  required
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              <ActionButton type="submit" disabled={isSubmittingInvite}>
                {isSubmittingInvite ? 'Inviting admin...' : 'Create admin invite'}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={() => window.location.reload()}>
                Refresh status
              </ActionButton>
            </div>
          </form>

          {admins.length === 0 && pendingAdminInvites.length === 0 ? (
            <div className="mt-8 rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
              No admin is active yet. Create the first admin invite above, then wait for activation before this setup step can complete.
            </div>
          ) : null}
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Current admins"
              title="Resolved admin access"
              description="These rows are active tenant admin bindings with a real user id already attached."
            />
            <div className="mt-5 space-y-3">
              {admins.length === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  No active admin user is assigned yet.
                </div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                    <p className="text-sm font-black text-slate-950">{admin.name ?? admin.email ?? 'Unnamed admin'}</p>
                    <p className="mt-1 text-sm text-slate-600">{admin.email ?? 'No email available'}</p>
                    {admin.mobile ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{admin.mobile}</p> : null}
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Pending activation"
              title="Invited admins"
              description="These admin invite rows exist in UserRoles but do not have a bound user id yet, so GSO will keep admin handoff blocked until activation finishes."
            />
            <div className="mt-5 space-y-3">
              {pendingAdminInvites.length === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  No admin invite is currently waiting for activation.
                </div>
              ) : (
                pendingAdminInvites.map((invite) => (
                  <div key={invite.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black text-slate-950">{invite.name ?? invite.email ?? 'Unnamed invite'}</p>
                      <StatusChip tone="warning">Pending activation</StatusChip>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{invite.email ?? 'No email available'}</p>
                    {invite.mobile ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{invite.mobile}</p> : null}
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Legacy bridge"
              title="Promotion requests"
              description="These rows remain visible for legacy observability, but first-admin onboarding no longer depends on the candidate-promotion request path."
            />
            <div className="mt-5 space-y-3">
              {legacyPendingRequests.length === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  No unresolved legacy promotion request is present for this tenant.
                </div>
              ) : (
                legacyPendingRequests.map((request) => (
                  <div key={request.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black text-slate-950">{request.userIdToAssign ?? 'Unknown target user'}</p>
                      <StatusChip tone={toneForRequestStatus(request.status)}>{formatStatus(request.status)}</StatusChip>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Request id: {request.id}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Tenant"
              title="Current context"
              description="This direct admin invite step is bound to the tenant created during owner provisioning."
            />
            <div className="mt-5 rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="break-all text-sm font-black text-slate-950">{tenantId}</p>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
