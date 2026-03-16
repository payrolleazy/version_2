import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { OnboardingHero } from '@/components/public/onboarding/OnboardingHero';
import { OnboardingStepMap } from '@/components/public/onboarding/OnboardingStepMap';
import { OnboardingIntakePanels } from '@/components/public/onboarding/OnboardingIntakePanels';
import { OnboardingDecisionBands } from '@/components/public/onboarding/OnboardingDecisionBands';
import { OnboardingTransitionPath } from '@/components/public/onboarding/OnboardingTransitionPath';
import { OnboardingCtaClose } from '@/components/public/onboarding/OnboardingCtaClose';

export default function OnboardingPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <OnboardingHero />
        <OnboardingStepMap />
        <OnboardingIntakePanels />
        <OnboardingDecisionBands />
        <OnboardingTransitionPath />
        <OnboardingCtaClose />
      </PublicSection>
    </PublicPageFrame>
  );
}