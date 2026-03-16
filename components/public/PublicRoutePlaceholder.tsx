import { ActionLink } from '@/components/ui/ActionButton';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection, PublicSectionCard } from '@/components/public/PublicSection';
import { PublicValueChip } from '@/components/public/PublicValueChip';

export function PublicRoutePlaceholder({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <PublicPageFrame>
      <PublicSection>
        <PublicSectionCard>
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">{eyebrow}</p>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950">{title}</h1>
                <p className="max-w-3xl text-lg text-slate-600">{description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <PublicValueChip>Cloudflare-first</PublicValueChip>
                <PublicValueChip>Shared public shell</PublicValueChip>
                <PublicValueChip>Wave 0 scaffolded</PublicValueChip>
              </div>
              <div className="flex flex-wrap gap-4">
                <ActionLink href="/onboarding">Start onboarding</ActionLink>
                <ActionLink href="/pricing" variant="secondary">
                  View pricing
                </ActionLink>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-950/95 p-6 text-white shadow-[var(--shadow-soft)]">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-200/85">Wave 0</p>
              <h2 className="mt-3 text-2xl font-black">Shared public foundation is now active</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                This route is mounted under the new public shell and ready for deeper page-specific implementation in the next waves.
              </p>
            </div>
          </div>
        </PublicSectionCard>
      </PublicSection>
    </PublicPageFrame>
  );
}
