'use client';

import { useState } from 'react';
import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

const NARRATIVES = [
  {
    key: 'recruitment',
    tab: 'Recruitment Suite',
    eyebrow: 'Hire',
    title: 'Run vacancy intake, candidate movement, interview scheduling, and offer progression in one recruiter workbench.',
    body: 'Track open positions, move candidates through the pipeline, assign interviewers, and hand successful candidates into onboarding without losing ownership context.',
    ctaHref: '/onboarding',
    ctaLabel: 'Start onboarding',
    accent: 'from-sky-500/30 via-cyan-400/20 to-blue-500/25',
  },
  {
    key: 'candidate',
    tab: 'Candidate & Onboarding',
    eyebrow: 'Onboard',
    title: 'Give candidates a guided launchpad for documents, profile completion, letters, and interview access.',
    body: 'The public promise continues into the product: guided onboarding, document readiness, and role-safe candidate access before employee activation.',
    ctaHref: '/features',
    ctaLabel: 'Stay in feature tour',
    accent: 'from-emerald-500/25 via-cyan-300/20 to-sky-400/20',
  },
  {
    key: 'operations',
    tab: 'Workforce Operations',
    eyebrow: 'Operate',
    title: 'Attendance, leave, approvals, hierarchy, and manager workflows continue from the same employee operating system.',
    body: 'Operational modules inherit the same strong portal isolation and guided next-step logic, so teams can act fast without searching across disconnected tools.',
    ctaHref: '/pricing',
    ctaLabel: 'See pricing',
    accent: 'from-violet-500/20 via-sky-300/15 to-cyan-300/20',
  },
  {
    key: 'payroll',
    tab: 'Payroll & Compliance',
    eyebrow: 'Pay',
    title: 'Carry attendance, leave, FNF, and statutory outputs through to payroll without duplicate operators or fragmented systems.',
    body: 'The payroll engine stays integrated with upstream employee actions and downstream exit/FNF continuity, making the system commercially stronger than a generic HRMS stack.',
    ctaHref: '/pricing',
    ctaLabel: 'Compare plans',
    accent: 'from-amber-400/25 via-sky-300/10 to-cyan-300/20',
  },
  {
    key: 'control',
    tab: 'Admin Control Plane',
    eyebrow: 'Control',
    title: 'Guide setup, subscription state, role-safe portals, and tenant operations from one hardened control plane.',
    body: 'This is where onboarding, pricing, and protected application access stay connected instead of becoming separate implementation silos.',
    ctaHref: '/onboarding',
    ctaLabel: 'Begin client onboarding',
    accent: 'from-slate-400/25 via-sky-300/12 to-cyan-300/12',
  },
] as const;

export function FeaturesNarrativeShell() {
  const [active, setActive] = useState<(typeof NARRATIVES)[number]['key']>('recruitment');
  const narrative = NARRATIVES.find((entry) => entry.key === active) ?? NARRATIVES[0];

  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="grid gap-8 xl:grid-cols-[0.28fr_0.42fr_0.3fr] xl:items-start">
        <div className="space-y-3">
          {NARRATIVES.map((entry) => {
            const selected = entry.key === active;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setActive(entry.key)}
                className={`flex w-full items-start justify-between rounded-[1.35rem] border px-4 py-4 text-left transition ${
                  selected
                    ? 'border-sky-300 bg-sky-50 text-slate-950 shadow-[var(--shadow-card)]'
                    : 'border-slate-200/70 bg-white/75 text-slate-700 hover:border-sky-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-sky-700">{entry.eyebrow}</p>
                  <p className="mt-2 text-sm font-bold">{entry.tab}</p>
                </div>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${selected ? 'bg-sky-500' : 'bg-slate-300'}`} />
              </button>
            );
          })}
        </div>

        <div className={`overflow-hidden rounded-[1.9rem] border border-slate-200/70 bg-gradient-to-br ${narrative.accent} p-6 shadow-[var(--shadow-card)]`}>
          <svg viewBox="0 0 520 340" className="h-auto w-full" role="img" aria-label={`${narrative.tab} workflow story`}>
            <rect x="28" y="36" width="464" height="268" rx="36" fill="rgba(255,255,255,0.75)" />
            <rect x="62" y="74" width="118" height="78" rx="22" fill="rgba(15,23,42,0.9)" />
            <rect x="204" y="74" width="118" height="78" rx="22" fill="rgba(2,132,199,0.82)" />
            <rect x="346" y="74" width="118" height="78" rx="22" fill="rgba(255,255,255,0.92)" stroke="rgba(148,163,184,0.32)" />
            <rect x="132" y="198" width="118" height="78" rx="22" fill="rgba(255,255,255,0.92)" stroke="rgba(148,163,184,0.32)" />
            <rect x="274" y="198" width="118" height="78" rx="22" fill="rgba(15,23,42,0.92)" />
            <path d="M180 114h24" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" />
            <path d="M322 114h24" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" />
            <path d="M263 152v20c0 16-6 16-20 16h-20" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M322 152v20c0 16-6 16-20 16h-20" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <text x="88" y="102" fill="#dbeafe" fontSize="18" fontWeight="800">Input</text>
            <text x="224" y="102" fill="#e0f2fe" fontSize="18" fontWeight="800">Control</text>
            <text x="370" y="102" fill="#0f172a" fontSize="18" fontWeight="800">Actor</text>
            <text x="156" y="226" fill="#0f172a" fontSize="18" fontWeight="800">Action</text>
            <text x="304" y="226" fill="#dbeafe" fontSize="18" fontWeight="800">Outcome</text>
          </svg>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/92 p-6 shadow-[var(--shadow-card)]">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">{narrative.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{narrative.title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{narrative.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionLink href={narrative.ctaHref}>{narrative.ctaLabel}</ActionLink>
            <ActionLink href="/pricing" variant="secondary">
              View pricing
            </ActionLink>
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
