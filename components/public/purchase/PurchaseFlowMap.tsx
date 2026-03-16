import { PublicSectionCard } from '@/components/public/PublicSection';

const STEPS = [
  {
    title: 'Confirm the commercial state',
    text: 'The buyer sees the selected plan, the user estimate context, and what activation means for their rollout.',
  },
  {
    title: 'Hand off to payment',
    text: 'A secure hosted checkout or payment handoff should begin without mixing purchase and protected app setup.',
  },
  {
    title: 'Enter protected setup',
    text: 'After activation, the user moves into the protected application flow rather than staying in the public layer.',
  },
] as const;

export function PurchaseFlowMap() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-9">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Flow map</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white">Payment is not the end. It is the transition point.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Step {index + 1}</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}