import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

const HERO_CHIPS = [
  'Commercial activation',
  'Secure payment handoff',
  'Clean transition into setup',
];

export function PurchaseHero() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Purchase</p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-[3.55rem]">
              Activate the client cleanly, then hand them into protected setup.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              This is the commercial activation surface. It should confirm the plan, confirm the billing path, and make the next step after payment absolutely obvious.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {HERO_CHIPS.map((chip) => (
              <PublicValueChip key={chip}>{chip}</PublicValueChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/signin">Existing user sign in</ActionLink>
            <ActionLink href="/onboarding" variant="secondary">Return to onboarding</ActionLink>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Activation path</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Commercial state</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Confirmed before setup</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">The buyer knows the plan and billing path before entering the application layer.</p>
            </div>
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">After payment</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Go straight to setup</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Activation should reduce uncertainty, not create another maze of steps.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}