import { PublicSectionCard } from '@/components/public/PublicSection';

export function LandingHero() {
  return (
    <PublicSectionCard className="landing-hero-shell relative min-h-[38rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(238,244,255,0.9)_48%,rgba(191,246,255,0.58)_100%)] p-7 sm:p-10 lg:p-12">
      <div className="grid min-h-[32rem] items-stretch lg:grid-cols-[1.1fr_0.9fr]">
        <div aria-hidden="true" />

        <div className="landing-hero-copy flex h-full flex-col justify-center text-right">
          <p className="text-base font-black uppercase tracking-[0.28em] text-sky-700/85 sm:text-lg lg:text-xl">
            People Manager
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-[4.25rem] lg:leading-[0.95]">
            Faster onboarding,{` `}
            <span className="inline-flex items-baseline gap-3">
              <span className="landing-fastest-word text-sky-700">Fastest</span>
              <span>Go Live</span>
            </span>
          </h1>

          <p className="ml-auto mt-6 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
            A comprehensive HRMS suite built for guided rollout across hiring,
            onboarding, payroll, and workforce operations.
          </p>
        </div>
      </div>
    </PublicSectionCard>
  );
}

