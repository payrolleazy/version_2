import { PublicSectionCard } from '@/components/public/PublicSection';

const ROLES = [
  { title: 'Recruiter', body: 'Owns vacancy intake, candidate movement, interview orchestration, and conversion readiness.' },
  { title: 'Candidate', body: 'Completes guided onboarding, joins interviews, reviews letters, and progresses toward activation.' },
  { title: 'Employee', body: 'Runs attendance, leave, approvals, and operational workflows in the protected employee portal.' },
  { title: 'Admin', body: 'Controls setup, policies, visibility, and cross-functional operational governance.' },
  { title: 'Master Admin', body: 'Owns tenant-level control, role access, onboarding progression, and subscription-aware setup.' },
  { title: 'Payroll Admin', body: 'Executes payroll, compliance processing, FNF continuity, and downstream settlement operations.' },
];

export function FeaturesRoleView() {
  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Role-based operations</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">Different roles, one connected product architecture.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {ROLES.map((role) => (
            <div key={role.title} className="rounded-[1.65rem] border border-slate-200/70 bg-slate-50/80 p-5">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-sky-700">Role</p>
              <h3 className="mt-3 text-xl font-black text-slate-950">{role.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{role.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
