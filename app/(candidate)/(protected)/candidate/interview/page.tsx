'use client';

import { useCandidateSession } from '@/components/candidate/shell/CandidateSessionContext';

import CandidateInterviewConsole from '@/components/candidate/interview/CandidateInterviewConsole';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function InterviewPage() {
  const { session, isLoading } = useCandidateSession();

  if (isLoading || !session) {
    return (
      <CandidatePageFrame
        title="Interview"
        subtitle="Candidate interview console"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading interview console..." />
      </CandidatePageFrame>
    );
  }

  return <CandidateInterviewConsole session={session} />;
}
