export default function CandidateLaunchpadOnboardingPanelLoading() {
  return (
    <div className="flex min-h-0 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-3.5 lg:p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Onboarding</p>
          <h2 className="mt-2 whitespace-nowrap text-[1.55rem] font-black text-slate-900 dark:text-white lg:text-[1.72rem]">
            Section progress
          </h2>
        </div>
        <div className="h-9 w-32 rounded-[1rem] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80" />
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 flex-col justify-between gap-4">
          <div className="min-h-0 flex-1 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-6 w-36 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-5 w-56 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="h-2.5 w-8 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
