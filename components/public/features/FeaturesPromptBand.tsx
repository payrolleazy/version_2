import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function FeaturesPromptBand() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Ready for the next step</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-[2.8rem]">
            If the workflow story makes sense, move into pricing or start client onboarding now.
          </h2>
          <p className="text-base leading-8 text-slate-300 sm:text-lg">
            This page should create confidence, then hand the user into either the pricing decision or the guided onboarding flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/pricing">View pricing</ActionLink>
          <ActionLink href="/onboarding" variant="secondary">
            Start onboarding
          </ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}
