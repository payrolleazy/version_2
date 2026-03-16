import CandidateOnboardingWorkspace, { type OnboardingStatusData } from '@/components/candidate/onboarding/CandidateOnboardingWorkspace';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { fetchCandidateOnboardingStatus } from '@/lib/candidate/contracts';

function normalizeOnboardingStatus(status: {
  onboarding_documentation?: {
    total_fields_tracked?: number | null;
    fields_filled?: number | null;
    fields_empty?: number | null;
    completion_percentage?: number | null;
    empty_fields?: string[];
  };
} | null): OnboardingStatusData | null {
  if (!status?.onboarding_documentation) {
    return null;
  }

  return {
    onboarding_documentation: {
      total_fields_tracked: Number(status.onboarding_documentation.total_fields_tracked ?? 0),
      fields_filled: Number(status.onboarding_documentation.fields_filled ?? 0),
      fields_empty: Number(status.onboarding_documentation.fields_empty ?? 0),
      completion_percentage: Number(status.onboarding_documentation.completion_percentage ?? 0),
      empty_fields: status.onboarding_documentation.empty_fields ?? [],
    },
  };
}

async function loadInitialOnboardingStatus(session: {
  access_token?: string;
}): Promise<OnboardingStatusData | null> {
  if (!session.access_token) {
    return null;
  }

  const result = await fetchCandidateOnboardingStatus(session.access_token);

  if (result.success && result.data) {
    return normalizeOnboardingStatus(result.data);
  }

  return null;
}

export const dynamic = 'force-dynamic';

export default async function OnboardingRoute() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
    return (
      <CandidatePageFrame
        title="Onboarding"
        subtitle="Candidate form workspace"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading onboarding workspace..." />
      </CandidatePageFrame>
    );
  }

  const initialStatus = await loadInitialOnboardingStatus(snapshot.session);

  return <CandidateOnboardingWorkspace session={snapshot.session} initialStatus={initialStatus} />;
}
