import { PublicSectionCard } from '@/components/public/PublicSection';

const PILLARS = [
  {
    title: 'Recruitment Suite',
    points: ['Open positions and recruiter workbench', 'Candidate pipeline and interview flow', 'Offer and conversion tracking'],
  },
  {
    title: 'Candidate Launchpad',
    points: ['Interview console and document readiness', 'Letters and onboarding progression', 'Role-safe conversion into employee lifecycle'],
  },
  {
    title: 'Guided Onboarding',
    points: ['EOAP-driven execution', 'Position-aware readiness', 'Approval and activation continuity'],
  },
  {
    title: 'Employee Operations',
    points: ['Attendance and leave workflows', 'Manager approvals and hierarchy context', 'Self-service and action guidance'],
  },
  {
    title: 'Payroll & Compliance',
    points: ['Attendance-to-payroll continuity', 'Statutory outputs and FNF', 'Configurable compliance processing'],
  },
  {
    title: 'Admin Control Plane',
    points: ['Subscription-aware setup', 'Role-isolated portals', 'Tenant control and guided activation'],
  },
];

export function FeaturesPillars() {
  return (
    <PublicSectionCard className="p-7 sm:p-10">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-700">Module pillars</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-[2.8rem]">Every major surface fits into one operational sequence.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-[1.65rem] border border-slate-200/70 bg-slate-50/75 p-5">
              <h3 className="text-xl font-black text-slate-950">{pillar.title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {pillar.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
