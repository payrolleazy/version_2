import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function CandidateDocumentsLoading() {
  return (
    <CandidatePageFrame
      title="Documents"
      subtitle="Candidate document workspace"
      containerClassName="ml-0 mr-auto max-w-full"
    >
      <CandidateLoadingState message="Loading document workspace..." />
    </CandidatePageFrame>
  );
}
