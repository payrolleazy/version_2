import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

export function LandingCtaClose() {
  return (
    <PublicSectionCard className="border-white/80 bg-white/88 p-7 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Next move</p>
          <h2 className="max-w-3xl text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">
            Start the client onboarding path if you are evaluating the product. Sign in immediately if you already operate inside it.
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            The public layer should never trap users. Every CTA should either qualify a new account or move an existing user directly to the
            correct application entry point.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <ActionLink href="/onboarding">Start onboarding</ActionLink>
          <ActionLink href="/signin" variant="secondary">
            Existing user sign in
          </ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}
