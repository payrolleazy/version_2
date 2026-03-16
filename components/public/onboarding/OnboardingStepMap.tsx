import { PublicSectionCard } from '@/components/public/PublicSection';

const STEPS = [
  {
    title: 'Company basics',
    text: 'Capture the organization identity and the main decision-maker or operator contact.',
  },
  {
    title: 'Workforce estimate',
    text: 'Understand employee count, expected growth, and whether the free threshold applies.',
  },
  {
    title: 'Modules of interest',
    text: 'Capture which parts of the platform matter first: recruitment, onboarding, attendance, payroll, or admin control.',
  },
  {
    title: 'Migration context',
    text: 'Understand whether they are moving from spreadsheets, another HRMS, or an existing biometric setup.',
  },
  {
    title: 'Commercial handoff',
    text: 'Summarize the buyer path and move them into the purchase and activation sequence.',
  },
] as const;

export function OnboardingStepMap() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Step map</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">One guided intake path from qualification to activation.</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[1.65rem] border border-slate-200/70 bg-slate-50/80 p-6">
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