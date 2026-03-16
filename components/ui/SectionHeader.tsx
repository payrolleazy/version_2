import { StatusChip } from '@/components/ui/StatusChip';

export function SectionHeader({
  eyebrow,
  title,
  description,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">{eyebrow}</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-3xl text-sm text-slate-600">{description}</p>
      </div>
      {status ? <StatusChip tone="info">{status}</StatusChip> : null}
    </div>
  );
}
