import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { LandingHero } from '@/components/public/landing/LandingHero';
import { LandingProductStoryShell } from '@/components/public/landing/LandingProductStoryShell';

export default function PublicLandingPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <LandingHero />
        <LandingProductStoryShell />
      </PublicSection>
    </PublicPageFrame>
  );
}
