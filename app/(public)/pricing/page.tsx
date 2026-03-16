import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { PricingHero } from '@/components/public/pricing/PricingHero';
import { PricingPlanGrid } from '@/components/public/pricing/PricingPlanGrid';
import { PricingSeatEstimator } from '@/components/public/pricing/PricingSeatEstimator';
import { PricingFlowSteps } from '@/components/public/pricing/PricingFlowSteps';
import { PricingFaq } from '@/components/public/pricing/PricingFaq';
import { PricingCtaClose } from '@/components/public/pricing/PricingCtaClose';

export default function PricingPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <PricingHero />
        <PricingPlanGrid />
        <PricingSeatEstimator />
        <PricingFlowSteps />
        <PricingFaq />
        <PricingCtaClose />
      </PublicSection>
    </PublicPageFrame>
  );
}