import { PublicSectionCard } from '@/components/public/PublicSection';

export function FeaturesPlatformMap() {
  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
        <div className="space-y-4">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Platform map</p>
          <h2 className="max-w-3xl text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">
            One connected lifecycle from vacancy to onboarding, operations, payroll, and final settlement.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            The public story should prove that recruitment, onboarding, workforce operations, payroll, and admin control are connected execution
            surfaces, not standalone tools.
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200/70 bg-slate-50/90 p-5 shadow-[var(--shadow-card)]">
          <svg viewBox="0 0 760 300" className="h-auto w-full" role="img" aria-label="Platform lifecycle map">
            <defs>
              <linearGradient id="feature-link" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bff6ff" />
                <stop offset="50%" stopColor="#8be3ff" />
                <stop offset="100%" stopColor="#72b8ff" />
              </linearGradient>
            </defs>
            {[
              { x: 18, label: 'Open position', value: 'Hierarchy + recruiter demand' },
              { x: 164, label: 'Recruit', value: 'Pipeline, interview, offer' },
              { x: 310, label: 'Convert', value: 'Candidate portal + signup' },
              { x: 456, label: 'Operate', value: 'Employee workflows + approvals' },
              { x: 602, label: 'Pay', value: 'Payroll, compliance, FNF' },
            ].map((step) => (
              <g key={step.label}>
                <rect x={step.x} y="80" width="128" height="132" rx="26" fill="white" stroke="rgba(148,163,184,0.35)" />
                <text x={step.x + 18} y="116" fill="#0369a1" fontSize="16" fontWeight="800">{step.label}</text>
                <text x={step.x + 18} y="148" fill="#0f172a" fontSize="20" fontWeight="800">{step.value}</text>
              </g>
            ))}
            {[146, 292, 438, 584].map((x) => (
              <path key={x} d={`M${x} 146h18`} stroke="url(#feature-link)" strokeWidth="10" strokeLinecap="round" />
            ))}
          </svg>
        </div>
      </div>
    </PublicSectionCard>
  );
}
