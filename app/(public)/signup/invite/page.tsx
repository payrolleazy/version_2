import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { InvitedAccessActivationSurface } from '@/components/public/signup/InvitedAccessActivationSurface';

export default function InvitedAccessActivationPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <InvitedAccessActivationSurface />
      </PublicSection>
    </PublicPageFrame>
  );
}
