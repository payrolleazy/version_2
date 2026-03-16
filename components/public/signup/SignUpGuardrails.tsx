import { PublicSectionCard } from '@/components/public/PublicSection';

const GUARDRAILS = [
  {
    title: 'Do not allow random candidate signup',
    text: 'Candidate access should continue to depend on invitation truth rather than open public registration.',
  },
  {
    title: 'Do not create internal users from the buyer path',
    text: 'Commercial onboarding should activate the client first, then hand them into protected setup intentionally.',
  },
  {
    title: 'Keep signup and portal access separate',
    text: 'Public signup should clarify the path, not collapse onboarding, purchase, and protected access into one screen.',
  },
] as const;

export function SignUpGuardrails() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-9">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Guardrails</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white">Public signup should stay controlled even while the product feels easy to enter.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {GUARDRAILS.map((item) => (
            <div key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-black tracking-tight text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
