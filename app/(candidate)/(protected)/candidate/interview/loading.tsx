import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function CandidateInterviewLoading() {
  return (
    <CandidatePageFrame
      title="Interview"
      subtitle="Candidate interview console"
      containerClassName="ml-0 mr-auto max-w-full"
    >
      <CandidateLoadingState message="Loading interview console..." />
    </CandidatePageFrame>
  );
}
