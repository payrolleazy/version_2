import { redirect } from 'next/navigation';
import { MasterAdminAssignRoleSurface } from '@/components/master-admin/MasterAdminAssignRoleSurface';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { resolveMasterAdminStepRoute } from '@/lib/master-admin/route-resolution';
import { readMasterAdminHandoffData } from '@/lib/master-admin/server';

export const dynamic = 'force-dynamic';

export default async function MasterAdminAssignRolePage() {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'master_admin');

  if (!access.allowed || !access.tenantId) {
    redirect('/');
  }

  const stepRoute = await resolveMasterAdminStepRoute(access.tenantId);
  if (stepRoute && stepRoute !== '/master_admin/assign_role') {
    redirect(stepRoute);
  }

  const handoff = await readMasterAdminHandoffData(access.tenantId);

  return (
    <MasterAdminAssignRoleSurface
      tenantId={access.tenantId}
      admins={handoff.admins}
      pendingAdminInvites={handoff.pendingAdminInvites}
      legacyPendingRequests={handoff.legacyPendingRequests}
    />
  );
}
