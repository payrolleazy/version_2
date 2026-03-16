import { PublicSectionCard } from '@/components/public/PublicSection';

const BANDS = [
  {
    title: 'Under the free threshold',
    text: 'The commercial path stays simple. The buyer should understand they can move forward without immediate paid activation.',
  },
  {
    title: 'Beyond the free threshold',
    text: 'The flow should surface prepaid billing logic early so the buyer understands what changes before setup begins.',
  },
  {
    title: 'Phased adoption',
    text: 'If they want to start with a subset of modules, the onboarding summary should reflect that cleanly before purchase.',
  },
] as const;

export function OnboardingDecisionBands() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Decision bands</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Show buyers the right path before they hit purchase.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {BANDS.map((band) => (
            <div key={band.title} className="rounded-[1.6rem] border border-slate-200/70 bg-white/92 p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{band.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{band.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}