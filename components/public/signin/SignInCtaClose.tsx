import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function SignInCtaClose() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-sky-100/80 via-white to-cyan-50/70">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Ready</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">If you need commercial onboarding instead of workspace access, go there directly.</h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Public onboarding and protected sign-in should stay separate. That keeps commercial entry clean and operational access secure.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/onboarding">Go to client onboarding</ActionLink>
          <ActionLink href="/pricing" variant="secondary">
            Review plans first
          </ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}
