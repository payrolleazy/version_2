import { PublicSectionCard } from '@/components/public/PublicSection';

const STEPS = [
  'Choose whether you are a buyer or an invited user',
  'Buyer path goes to onboarding, pricing, and purchase',
  'Invitation path stays tied to backend-issued role access',
  'Protected setup begins only after the correct path is validated',
] as const;

export function SignUpTransitionPath() {
  return (
    <PublicSectionCard>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Transition</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">The signup route should guide, then hand off cleanly.</h2>
          <p className="text-base leading-8 text-slate-600">
            Signup is not one generic form in this product. It is a controlled routing surface that decides whether the
            user belongs in commercial onboarding or invitation-based protected access.
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
