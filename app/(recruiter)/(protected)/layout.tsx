import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import RecruiterClientShell from '@/components/recruiter/shell/RecruiterClientShell';

export const dynamic = 'force-dynamic';

export default async function RecruiterProtectedLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'recruiter');

  if (!access.allowed) {
    redirect('/');
  }

  return <RecruiterClientShell>{children}</RecruiterClientShell>;
}
