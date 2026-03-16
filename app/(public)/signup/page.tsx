import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection } from '@/components/public/PublicSection';
import { SignUpHero } from '@/components/public/signup/SignUpHero';
import { SignUpPathSplit } from '@/components/public/signup/SignUpPathSplit';
import { SignUpGuardrails } from '@/components/public/signup/SignUpGuardrails';
import { SignUpTransitionPath } from '@/components/public/signup/SignUpTransitionPath';
import { SignUpCtaClose } from '@/components/public/signup/SignUpCtaClose';

export default function SignUpPage() {
  return (
    <PublicPageFrame>
      <PublicSection>
        <SignUpHero />
        <SignUpPathSplit />
        <SignUpGuardrails />
        <SignUpTransitionPath />
        <SignUpCtaClose />
      </PublicSection>
    </PublicPageFrame>
  );
}
