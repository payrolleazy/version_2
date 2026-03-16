import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { ClientOwnerPurchaseExecutionSurface } from '@/components/public/purchase/ClientOwnerPurchaseExecutionSurface';

export default function PurchasePage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <ClientOwnerPurchaseExecutionSurface />
      </PublicSection>
    </PublicPageFrame>
  );
}
