import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { FeaturesCtaClose } from '@/components/public/features/FeaturesCtaClose';
import { FeaturesHero } from '@/components/public/features/FeaturesHero';
import { FeaturesPillars } from '@/components/public/features/FeaturesPillars';
import { FeaturesPlatformMap } from '@/components/public/features/FeaturesPlatformMap';
import { FeaturesPromptBand } from '@/components/public/features/FeaturesPromptBand';
import { FeaturesRoleView } from '@/components/public/features/FeaturesRoleView';
import { FeaturesWorkflowChains } from '@/components/public/features/FeaturesWorkflowChains';
import { FeaturesNarrativeShell } from '@/components/public/features/FeaturesNarrativeShell';

export default function FeaturesPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <FeaturesHero />
        <FeaturesPlatformMap />
        <FeaturesNarrativeShell />
        <FeaturesPillars />
        <FeaturesWorkflowChains />
        <FeaturesRoleView />
        <FeaturesPromptBand />
        <FeaturesCtaClose />
      </PublicSection>
    </PublicPageFrame>
  );
}
