import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

const HERO_CHIPS = ['Hire', 'Onboard', 'Operate', 'Pay', 'Control'];

export function FeaturesHero() {
  return (
    <PublicSectionCard className="p-7 sm:p-10 lg:p-12">
      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Guided product tour</p>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl xl:text-[4.15rem]">
              Explore the platform in the same workflow sequence your teams actually operate.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              This is not a list of disconnected features. It is one workforce operating system across recruitment, onboarding, employee operations,
              payroll, compliance, and control plane execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {HERO_CHIPS.map((chip) => (
              <PublicValueChip key={chip}>{chip}</PublicValueChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/onboarding">Start onboarding</ActionLink>
            <ActionLink href="/pricing" variant="secondary">
              View pricing
            </ActionLink>
            <ActionLink href="/signin" variant="secondary">
              Existing user sign in
            </ActionLink>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[var(--shadow-soft)]">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.22em] text-cyan-200/85">Tour map</p>
          <div className="mt-5 grid gap-3">
            {[
              'Open positions and recruiter workbench',
              'Candidate launchpad and guided onboarding',
              'Employee operations and approvals',
              'Payroll, compliance, and exit continuity',
            ].map((item, index) => (
              <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-cyan-100/80">0{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
