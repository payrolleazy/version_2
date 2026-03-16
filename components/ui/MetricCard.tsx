import { SurfaceCard } from '@/components/ui/SurfaceCard';

export function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <SurfaceCard className="p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </SurfaceCard>
  );
}
