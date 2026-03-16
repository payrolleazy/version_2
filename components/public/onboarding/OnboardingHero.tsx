import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

const HERO_CHIPS = [
  'Guided intake before setup',
  'Low-friction buyer qualification',
  'Clean handoff into purchase',
];

export function OnboardingHero() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Client onboarding</p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-[3.55rem]">
              Qualify the client first, then move them into setup without confusion.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              This intake is not admin setup. It is the public commercial onboarding flow that captures the minimum buyer context
              needed to recommend a path, confirm pricing fit, and hand off into activation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {HERO_CHIPS.map((chip) => (
              <PublicValueChip key={chip}>{chip}</PublicValueChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/purchase">Proceed to purchase</ActionLink>
            <ActionLink href="/pricing" variant="secondary">Review pricing first</ActionLink>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Flow promise</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">What this is</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Commercial qualification</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Enough detail to personalize the path without overloading the buyer.</p>
            </div>
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">What this is not</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Protected setup work</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Operational setup remains inside the application after activation.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}