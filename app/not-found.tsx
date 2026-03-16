import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-950/20">
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Not Found
        </span>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-white">This page does not exist.</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            The route you requested is unavailable in the current Payrolleazy build. Return to the public product layer and continue from there.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          Back to landing
        </Link>
      </div>
    </main>
  );
}
