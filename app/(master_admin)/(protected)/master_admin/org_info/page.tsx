import { redirect } from 'next/navigation';
import { MasterAdminOrgInfoSurface } from '@/components/master-admin/MasterAdminOrgInfoSurface';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { resolveMasterAdminStepRoute } from '@/lib/master-admin/route-resolution';

export const dynamic = 'force-dynamic';

export default async function MasterAdminOrgInfoPage() {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'master_admin');

  if (!access.allowed || !access.tenantId) {
    redirect('/');
  }

  const stepRoute = await resolveMasterAdminStepRoute(access.tenantId);
  if (stepRoute && stepRoute !== '/master_admin/org_info') {
    redirect(stepRoute);
  }

  return (
    <MasterAdminOrgInfoSurface
      tenantId={access.tenantId}
      ownerEmail={snapshot.user?.email ?? null}
    />
  );
}
