import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function PricingCtaClose() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-sky-100/80 via-white to-cyan-50/70">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Ready to move</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Move from pricing clarity into onboarding without friction.</h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Use pricing to qualify, use onboarding to operationalize, and keep existing customers out of unnecessary loops.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/onboarding">Start onboarding</ActionLink>
          <ActionLink href="/signin" variant="secondary">Existing user sign in</ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}