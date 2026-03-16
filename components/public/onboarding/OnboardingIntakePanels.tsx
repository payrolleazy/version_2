import { PublicSectionCard } from '@/components/public/PublicSection';

const PANELS = [
  {
    title: 'What we capture',
    items: [
      'Company name, primary contact, and work email',
      'Approximate employee count and growth expectation',
      'Modules they want to start with',
      'Current migration context and rollout constraints',
    ],
  },
  {
    title: 'Why it matters',
    items: [
      'Keeps the pricing discussion grounded in actual workforce size',
      'Prevents sending the buyer into the wrong product path',
      'Supports DIY onboarding without hiding the real implementation effort',
      'Makes the handoff into purchase and setup feel intentional',
    ],
  },
] as const;

export function OnboardingIntakePanels() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-9">
      <div className="grid gap-8 lg:grid-cols-2">
        {PANELS.map((panel) => (
          <div key={panel.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-black tracking-tight text-white">{panel.title}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {panel.items.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PublicSectionCard>
  );
}