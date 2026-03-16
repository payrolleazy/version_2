'use client';

import { useCandidateSession } from '@/components/candidate/shell/CandidateSessionContext';
import CandidateOnboardingWorkspace from '@/components/candidate/onboarding/CandidateOnboardingWorkspace';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function OnboardingRoute() {
  const { session, isLoading } = useCandidateSession();

  if (isLoading || !session) {
    return (
      <CandidatePageFrame
        title="Onboarding"
        subtitle="Candidate form workspace"
        containerClassName="max-w-5xl"
      >
        <CandidateLoadingState message="Loading onboarding workspace..." />
      </CandidatePageFrame>
    );
  }

  return <CandidateOnboardingWorkspace session={session} />;
}
