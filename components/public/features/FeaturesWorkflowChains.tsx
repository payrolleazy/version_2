import { PublicSectionCard } from '@/components/public/PublicSection';

const CHAINS = [
  ['Recruit', 'Interview', 'Offer', 'Convert'],
  ['Candidate', 'Onboard', 'Activate', 'Operate'],
  ['Attend', 'Regularize', 'Payroll', 'FNF'],
  ['Setup', 'Control', 'Scale', 'Optimize'],
];

export function FeaturesWorkflowChains() {
  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Workflow chains</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">The product is strongest when workflows keep moving instead of stopping at module boundaries.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {CHAINS.map((chain) => (
            <div key={chain.join('-')} className="rounded-[1.7rem] border border-slate-200/70 bg-white/92 p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center gap-3">
                {chain.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">{step}</span>
                    {index < chain.length - 1 ? <span className="text-sky-600">?</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
