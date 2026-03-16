import { PublicSectionCard } from '@/components/public/PublicSection';

const VALUES = [
  {
    title: 'DIY-first migration',
    body: 'Guide clients from public discovery into onboarding without support-heavy dead time.',
  },
  {
    title: 'Role-isolated portals',
    body: 'Candidate, recruiter, payroll, and admin journeys stay separated while still sharing one hardened app runtime.',
  },
  {
    title: 'Cloudflare-first runtime',
    body: 'Built for low-latency delivery, server-side protected layouts, and edge-friendly deployment from day one.',
  },
];

export function LandingValueBand() {
  return (
    <PublicSectionCard className="border-white/80 bg-white/85 p-6 sm:p-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-sky-700">Value</p>
            <h2 className="mt-3 text-xl font-black text-slate-950">{value.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{value.body}</p>
          </div>
        ))}
      </div>
    </PublicSectionCard>
  );
}
