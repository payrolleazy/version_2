import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

const PREVIEW_ITEMS = [
  'First 200 employee seats available in the free band',
  'Guided onboarding before protected app rollout',
  'Subscription-aware redirect into the correct portal flow',
];

export function LandingPricingPreview() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Pricing preview</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-[2.8rem]">Price by adoption, not by friction.</h2>
          <p className="text-base leading-8 text-slate-300 sm:text-lg">
            Prospects should understand the free threshold, the operating model, and the path into the application before they ever touch a portal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-[4rem] font-black leading-none text-cyan-200">200</p>
              <div className="pb-2">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/85">Free band</p>
                <p className="text-sm text-slate-300">Employee seats before usage billing begins</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
              {PREVIEW_ITEMS.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ActionLink href="/pricing">View pricing</ActionLink>
        </div>
      </div>
    </PublicSectionCard>
  );
}
