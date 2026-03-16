import CandidateInterviewConsole from '@/components/candidate/interview/CandidateInterviewConsole';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import {
  CandidateInterviewConsoleResponse,
  fetchCandidateInterviewConsole,
} from '@/lib/candidate/contracts';

async function loadInitialInterviewBundle(session: {
  access_token?: string;
}): Promise<{
  consoleData: CandidateInterviewConsoleResponse | null;
  error: string | null;
}> {
  if (!session.access_token) {
    return {
      consoleData: null,
      error: 'Missing candidate session',
    };
  }

  const result = await fetchCandidateInterviewConsole(session.access_token);

  if (result.success && result.data) {
    return {
      consoleData: result.data,
      error: null,
    };
  }

  return {
    consoleData: null,
    error: result.error ?? 'Could not load the interview console.',
  };
}

export const dynamic = 'force-dynamic';

export default async function InterviewPage() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
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

  const { consoleData, error } = await loadInitialInterviewBundle(snapshot.session);

  return (
    <CandidateInterviewConsole
      session={snapshot.session}
      initialConsoleData={consoleData}
      initialError={error}
    />
  );
}
