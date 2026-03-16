import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function CandidateLettersLoading() {
  return (
    <CandidatePageFrame
      title="My Letters"
      subtitle="Offer & appointment letters"
      containerClassName="ml-0 mr-auto max-w-full"
    >
      <CandidateLoadingState message="Loading your offer room..." />
    </CandidatePageFrame>
  );
}
