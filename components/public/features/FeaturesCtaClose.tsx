import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function FeaturesCtaClose() {
  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Close</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">Use this page to understand the operating system. Use the next action to start using it.</h2>
          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            The public layer should explain the product deeply enough for a serious buyer and still stay direct about the next route they should take.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/onboarding">Start client onboarding</ActionLink>
          <ActionLink href="/signin" variant="secondary">
            Existing user sign in
          </ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}
