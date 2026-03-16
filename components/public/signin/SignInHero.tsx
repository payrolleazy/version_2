import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

const HERO_CHIPS = [
  'Server-gated portal access',
  'Role-aware workspace routing',
  'Zero guesswork after login',
];

export function SignInHero() {
  return (
    <PublicSectionCard className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Sign in</p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-[3.55rem]">
              Existing users should reach the correct workspace without hunting.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              This surface is the controlled entry into the protected application. Once authenticated, the app should
              route the user into the correct portal based on live role truth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {HERO_CHIPS.map((chip) => (
              <PublicValueChip key={chip}>{chip}</PublicValueChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/onboarding">Need a new setup?</ActionLink>
            <ActionLink href="/pricing" variant="secondary">
              Review pricing first
            </ActionLink>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Entry model</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Who uses this</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Existing workspace users</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Candidates, recruiters, operators, and internal teams all enter through one hardened path.
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">After auth</p>
              <p className="mt-3 text-2xl font-black leading-tight text-white">Portal auto-selection</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The application validates live role truth and moves the user into the correct portal zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
