import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function CandidateLaunchpadLoading() {
  return (
    <CandidatePageFrame title="Launchpad" subtitle="Candidate home" containerClassName="ml-0 mr-auto max-w-full">
      <CandidateLoadingState message="Loading your launchpad..." />
    </CandidatePageFrame>
  );
}
