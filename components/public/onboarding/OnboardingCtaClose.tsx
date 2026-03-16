import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function OnboardingCtaClose() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-sky-100/80 via-white to-cyan-50/70">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Move forward</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Once the intake is clear, the next step is commercial activation.</h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Buyers should leave this page knowing exactly why purchase comes next and why protected setup should start only after activation.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/purchase">Proceed to purchase</ActionLink>
          <ActionLink href="/pricing" variant="secondary">Review pricing</ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}