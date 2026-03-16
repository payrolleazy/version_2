import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import CandidateClientShell from '@/components/candidate/shell/CandidateClientShell';

export const dynamic = 'force-dynamic';

export default async function CandidateProtectedLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'candidate');

  if (!access.allowed) {
    redirect('/');
  }

  return <CandidateClientShell initialSession={snapshot.session}>{children}</CandidateClientShell>;
}