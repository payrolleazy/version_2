import { ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

const PATHS = [
  {
    title: 'I am evaluating the product',
    text: 'Go through the executable client purchase path so the organization enters the platform through the new commercial activation flow.',
    cta: 'Start client activation',
    href: '/purchase',
  },
  {
    title: 'I was invited by the organization',
    text: 'Use the dedicated invited-access activation path to create your account from the live organization invitation.',
    cta: 'Activate invited access',
    href: '/signup/invite',
  },
] as const;

export function SignUpPathSplit() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Choose the right path</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Two journeys, one product. They should not be mixed.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PATHS.map((path) => (
            <div key={path.title} className="rounded-[1.6rem] border border-slate-200/70 bg-slate-50/80 p-6">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{path.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{path.text}</p>
              <div className="mt-5">
                <ActionLink href={path.href} variant="secondary">{path.cta}</ActionLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
