import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { SignInExecutionSurface } from '@/components/public/signin/SignInExecutionSurface';

function SignInPageFallback() {
  return (
    <div className="mx-auto flex min-h-[34rem] w-full max-w-[49rem] items-center justify-end">
      <div className="w-full max-w-[32rem] rounded-[1.75rem] border border-sky-400/70 bg-blue-900 p-6 text-white shadow-[0_26px_60px_rgba(8,47,73,0.28)] sm:p-8">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-100/80">Secure sign in</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Loading workspace access</h1>
          <p className="text-sm leading-7 text-sky-50/80">Preparing the sign-in flow.</p>
        </div>
      </div>
    </div>
  );
}

export default async function SignInPage() {
  const snapshot = await getServerAuthSnapshot();

  if (snapshot.session) {
    redirect('/portal');
  }

  return (
    <PublicPageFrame>
      <PublicSection>
        <Suspense fallback={<SignInPageFallback />}>
          <SignInExecutionSurface />
        </Suspense>
      </PublicSection>
    </PublicPageFrame>
  );
}
