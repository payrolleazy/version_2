import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

const PLANS = [
  {
    name: 'Launch',
    label: 'Best for first rollout',
    price: 'Free',
    detail: 'Up to 200 employee seats',
    features: [
      'Core portals with guided setup',
      'Candidate onboarding and preboarding',
      'Attendance, leave, and payroll base modules',
      'Recruitment suite activation path',
    ],
    cta: 'Start onboarding',
    href: '/onboarding',
    emphasized: false,
  },
  {
    name: 'Growth',
    label: 'Most teams land here next',
    price: 'Custom',
    detail: 'Above 200 seats, prepaid per active workforce band',
    features: [
      'Subscription-aware access controls',
      'Recruiter workbench and interview operations',
      'Compliance-ready workflow routing',
      'Operational analytics and admin visibility',
    ],
    cta: 'Talk pricing',
    href: '/purchase',
    emphasized: true,
  },
  {
    name: 'Scale',
    label: 'For large distributed operating teams',
    price: 'Custom+',
    detail: 'Complex org structures, advanced governance, rollout planning',
    features: [
      'Multi-role operational controls',
      'Extended payroll and compliance surfaces',
      'Position and vacancy driven recruitment expansion',
      'Cloudflare-first hardened app deployment path',
    ],
    cta: 'Plan rollout',
    href: '/purchase',
    emphasized: false,
  },
] as const;

export function PricingPlanGrid() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Plans</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Choose the commercial mode that matches your rollout stage.</h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            The free band removes early friction. Paid growth starts when adoption becomes real, not when curiosity begins.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                'rounded-[1.85rem] border p-7 shadow-[var(--shadow-card)] transition-transform duration-300',
                plan.emphasized
                  ? 'border-sky-300/80 bg-gradient-to-br from-sky-100 via-white to-cyan-50/90'
                  : 'border-slate-200/70 bg-white/92',
              ].join(' ')}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">{plan.label}</p>
                  <h3 className="text-3xl font-black tracking-tight text-slate-950">{plan.name}</h3>
                </div>
                <div>
                  <p className="text-4xl font-black leading-none text-slate-950">{plan.price}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{plan.detail}</p>
                </div>
                <ul className="space-y-3 text-sm leading-6 text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <ActionLink href={plan.href}>{plan.cta}</ActionLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}