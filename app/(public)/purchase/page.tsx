import { Suspense } from 'react';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { ClientOwnerPurchaseExecutionSurface } from '@/components/public/purchase/ClientOwnerPurchaseExecutionSurface';

function PurchasePageFallback() {
  return (
    <div className="mx-auto max-w-[68rem] rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
      <div className="space-y-3">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Client purchase</p>
        <h1 className="text-3xl font-black tracking-tight text-white">Loading checkout</h1>
        <p className="text-sm leading-7 text-slate-300">Preparing the secure tenant purchase flow.</p>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <Suspense fallback={<PurchasePageFallback />}>
          <ClientOwnerPurchaseExecutionSurface />
        </Suspense>
      </PublicSection>
    </PublicPageFrame>
  );
}
