import { PublicSectionCard } from '@/components/public/PublicSection';

const STEPS = [
  'Authenticate through the hardened sign-in path',
  'Resolve live portal access from real role truth',
  'Bootstrap the correct protected workspace shell',
  'Land directly in the relevant portal, not a generic dashboard',
] as const;

export function SignInTransitionPath() {
  return (
    <PublicSectionCard>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Transition</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Authentication should flow directly into the right protected zone.</h2>
          <p className="text-base leading-8 text-slate-600">
            The app should not force a user to guess their portal. The route decision belongs to the hardened server-side
            access layer after authentication succeeds.
          </p>
        </div>

        <div className="grid gap-3">
          {STEPS.map((step, index) => (
            <div key={step} className="rounded-[1.35rem] border border-slate-200/70 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-700">
              <span className="mr-2 font-black text-sky-600">0{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
