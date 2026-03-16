import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function CandidateOnboardingLoading() {
  return (
    <CandidatePageFrame
      title="Onboarding"
      subtitle="Candidate form workspace"
      containerClassName="ml-0 mr-auto max-w-full"
    >
      <CandidateLoadingState message="Loading onboarding workspace..." />
    </CandidatePageFrame>
  );
}
