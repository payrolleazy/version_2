import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function PurchaseCtaClose() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-sky-100/80 via-white to-cyan-50/70">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Activation close</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Once payment is confirmed, the next destination is protected setup.</h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            This page should close the commercial loop and make the post-activation path into the application feel deliberate and low-friction.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/signin">Go to sign in</ActionLink>
          <ActionLink href="/onboarding" variant="secondary">Back to onboarding</ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}