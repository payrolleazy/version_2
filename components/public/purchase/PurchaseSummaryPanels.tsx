import { PublicSectionCard } from '@/components/public/PublicSection';

const PANELS = [
  {
    title: 'Plan summary',
    text: 'Show the chosen commercial path, the free-threshold logic, and a simple reminder of what the client is activating.',
  },
  {
    title: 'Billing summary',
    text: 'Keep the billing explanation simple: free threshold, seat logic, and what paid activation means without exposing internal billing complexity.',
  },
  {
    title: 'Customer confirmation',
    text: 'Confirm organization identity, the main contact, and the commercial direction before the payment action begins.',
  },
] as const;

export function PurchaseSummaryPanels() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Before payment</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Reduce doubt before the buyer commits.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {PANELS.map((panel) => (
            <div key={panel.title} className="rounded-[1.6rem] border border-slate-200/70 bg-slate-50/80 p-6">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{panel.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{panel.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}