import { fetchCandidateOnboardingStatus } from '@/lib/candidate/contracts';
import CandidateLaunchpadOnboardingPanel from '@/components/candidate/launchpad/CandidateLaunchpadOnboardingPanel';

export default async function CandidateLaunchpadOnboardingPanelServer({
  accessToken,
}: {
  accessToken: string;
}) {
  const result = await fetchCandidateOnboardingStatus(accessToken);
  const onboardingStatus = result.success && result.data ? result.data : null;

  return <CandidateLaunchpadOnboardingPanel onboardingStatus={onboardingStatus} />;
}
