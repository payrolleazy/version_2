import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { ClientOwnerActivationSurface } from '@/components/public/signup/ClientOwnerActivationSurface';

export default function ClientOwnerActivationPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <ClientOwnerActivationSurface />
      </PublicSection>
    </PublicPageFrame>
  );
}
