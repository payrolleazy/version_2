import { PublicSectionCard } from '@/components/public/PublicSection';

const TRANSITIONS = [
  {
    title: 'Onboarding intake complete',
    text: 'The buyer now has a clear commercial recommendation and enough context captured to move forward confidently.',
  },
  {
    title: 'Purchase and activation',
    text: 'The commercial state is confirmed and the right billing path is activated without forcing protected setup too early.',
  },
  {
    title: 'Protected setup begins',
    text: 'After activation, the operational application setup takes over inside the protected portal, not on the public site.',
  },
] as const;

export function OnboardingTransitionPath() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">What happens next</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">This public flow ends when the protected setup flow begins.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {TRANSITIONS.map((step, index) => (
            <div key={step.title} className="rounded-[1.65rem] border border-slate-200/70 bg-slate-50/80 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Transition {index + 1}</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}