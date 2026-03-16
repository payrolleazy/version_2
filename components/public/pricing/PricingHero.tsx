import { PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

const HERO_CHIPS = [
  'First 200 employees free',
  'Prepaid, seat-aware billing',
  'Guided setup before rollout',
];

export function PricingHero() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Pricing</p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-[3.65rem]">
              Start free. Scale when the workforce starts moving.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              Pricing is built around live adoption, not forced complexity. Buyers see the free threshold, understand how
              billing works, and move into setup with zero ambiguity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {HERO_CHIPS.map((chip) => (
              <PublicValueChip key={chip}>{chip}</PublicValueChip>
            ))}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Commercial model</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Free threshold</p>
              <p className="mt-3 text-[3.4rem] font-black leading-none text-cyan-200">200</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Employee seats before usage billing begins.</p>
            </div>
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Billing mode</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Prepaid seat bands</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Commercial state stays visible to admins before rollout.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}