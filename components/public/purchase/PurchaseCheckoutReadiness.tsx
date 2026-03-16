import { PublicSectionCard } from '@/components/public/PublicSection';

const READINESS = [
  'Plan and threshold context are clear',
  'Customer identity is confirmed',
  'Payment handoff is framed as secure and intentional',
  'Post-payment setup path is explained before checkout begins',
] as const;

export function PurchaseCheckoutReadiness() {
  return (
    <PublicSectionCard>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Checkout readiness</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">The buyer should know exactly what happens after clicking pay.</h2>
          <p className="text-base leading-8 text-slate-600">
            The purchase surface should remove uncertainty, not create it. Payment, activation, and transition into protected setup must read as one clean sequence.
          </p>
        </div>

        <div className="grid gap-3">
          {READINESS.map((item) => (
            <div key={item} className="rounded-[1.35rem] border border-slate-200/70 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}