import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { buildPortalBootstrap } from '@/lib/bootstrap/portal-bootstrap';
import { AppShell } from '@/components/shell/AppShell';

export const dynamic = 'force-dynamic';

export default async function EmployeeProtectedLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'employee');

  if (!access.allowed) {
    redirect('/');
  }

  const bootstrap = buildPortalBootstrap(snapshot, 'employee', access);

  return <AppShell bootstrap={bootstrap}>{children}</AppShell>;
}
