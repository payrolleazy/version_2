import { SurfaceCard } from '@/components/ui/SurfaceCard';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <SurfaceCard className="p-8 text-center">
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm text-slate-600">{message}</p>
    </SurfaceCard>
  );
}
