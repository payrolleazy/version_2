import { PublicSectionCard } from '@/components/public/PublicSection';

const STEPS = [
  {
    title: 'Choose your starting path',
    text: 'New clients move through onboarding and commercial qualification. Existing users go straight to sign in.',
  },
  {
    title: 'Confirm workforce size',
    text: 'We show the free threshold and whether prepaid billing is needed before setup starts.',
  },
  {
    title: 'Complete company onboarding',
    text: 'Once commercial state is clear, the protected application setup takes over without confusion.',
  },
] as const;

export function PricingFlowSteps() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">How buying works</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Commercial clarity before application setup.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[1.6rem] border border-slate-200/70 bg-slate-50/80 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Step {index + 1}</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}