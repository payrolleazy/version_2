import { Suspense } from 'react';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { InvitedAccessActivationSurface } from '@/components/public/signup/InvitedAccessActivationSurface';

function InvitedAccessActivationFallback() {
  return (
    <div className="mx-auto max-w-[64rem] rounded-[1.8rem] border border-slate-200/70 bg-white/95 p-6 shadow-[var(--shadow-card)]">
      <div className="space-y-3">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Invited access</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-[3rem]">Loading invitation</h1>
        <p className="text-base leading-8 text-slate-600">Preparing the secure workspace invitation flow.</p>
      </div>
    </div>
  );
}

export default function InvitedAccessActivationPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <Suspense fallback={<InvitedAccessActivationFallback />}>
          <InvitedAccessActivationSurface />
        </Suspense>
      </PublicSection>
    </PublicPageFrame>
  );
}
