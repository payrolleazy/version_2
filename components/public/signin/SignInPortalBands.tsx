import { PublicSectionCard } from '@/components/public/PublicSection';

const BANDS = [
  {
    title: 'Candidate access',
    text: 'Invitation-based onboarding, documents, interview access, and pre-joining workflow.',
  },
  {
    title: 'Recruiter access',
    text: 'Pipeline operations, interviews, offers, and candidate conversion into onboarding.',
  },
  {
    title: 'Operator access',
    text: 'Admin, payroll, and master-admin workspaces remain available through the same secure entry.',
  },
] as const;

export function SignInPortalBands() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Workspace map</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">One sign-in surface. Multiple protected portal zones.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {BANDS.map((band) => (
            <div key={band.title} className="rounded-[1.6rem] border border-slate-200/70 bg-slate-50/80 p-6">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{band.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{band.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
