import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { SignInExecutionSurface } from '@/components/public/signin/SignInExecutionSurface';

export default async function SignInPage() {
  const snapshot = await getServerAuthSnapshot();

  if (snapshot.session) {
    redirect('/portal');
  }

  return (
    <PublicPageFrame>
      <PublicSection>
        <SignInExecutionSurface />
      </PublicSection>
    </PublicPageFrame>
  );
}
