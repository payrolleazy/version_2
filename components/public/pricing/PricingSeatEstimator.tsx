import { PublicSectionCard } from '@/components/public/PublicSection';

const EXAMPLES = [
  { seats: '120 seats', state: 'Free band', note: 'No prepaid upgrade required yet.' },
  { seats: '260 seats', state: 'Paid band', note: 'First paid workforce band activates above 200.' },
  { seats: '900 seats', state: 'Planned scale', note: 'Commercial planning should align with rollout sequencing.' },
] as const;

export function PricingSeatEstimator() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Seat logic</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white">One commercial rule, clearly explained.</h2>
          <p className="text-base leading-8 text-slate-300">
            Your first 200 employee seats stay inside the free threshold. Beyond that, billing follows prepaid workforce bands.
            No hidden jumps, no buyer confusion.
          </p>
        </div>

        <div className="grid gap-4">
          {EXAMPLES.map((example) => (
            <div key={example.seats} className="rounded-[1.45rem] border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-white">{example.seats}</p>
                  <p className="text-sm text-slate-300">{example.note}</p>
                </div>
                <span className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                  {example.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}