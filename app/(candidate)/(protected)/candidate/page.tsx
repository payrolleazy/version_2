import CandidateLaunchpad from '@/components/candidate/launchpad/CandidateLaunchpad';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import {
  CandidateLaunchpadResponse,
  CandidateOnboardingStatusResponse,
  fetchCandidateLaunchpad,
  fetchCandidateOnboardingStatus,
} from '@/lib/candidate/contracts';

type LifeEvents = {
  birthday: string | null;
  anniversary: string | null;
};

type LaunchpadBundle = {
  launchpad: CandidateLaunchpadResponse | null;
  lifeEvents: LifeEvents;
  onboardingStatus: CandidateOnboardingStatusResponse | null;
};

const EMPTY_LIFE_EVENTS: LifeEvents = {
  birthday: null,
  anniversary: null,
};

async function loadInitialLaunchpadBundle(session: {
  access_token?: string;
}): Promise<{ bundle: LaunchpadBundle; error: string | null }> {
  if (!session.access_token) {
    return {
      bundle: {
        launchpad: null,
        lifeEvents: EMPTY_LIFE_EVENTS,
        onboardingStatus: null,
      },
      error: 'Missing candidate session',
    };
  }

  const [launchpadResult, onboardingResult] = await Promise.all([
    fetchCandidateLaunchpad(session.access_token, false),
    fetchCandidateOnboardingStatus(session.access_token),
  ]);

  if (launchpadResult.success && launchpadResult.data) {
    return {
      bundle: {
        launchpad: launchpadResult.data,
        lifeEvents: EMPTY_LIFE_EVENTS,
        onboardingStatus: onboardingResult.success && onboardingResult.data ? onboardingResult.data : null,
      },
      error: null,
    };
  }

  return {
    bundle: {
      launchpad: null,
      lifeEvents: EMPTY_LIFE_EVENTS,
      onboardingStatus: null,
    },
    error: launchpadResult.error ?? 'Failed to load your launchpad',
  };
}

export const dynamic = 'force-dynamic';

export default async function CandidateHomePage() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
    return (
      <CandidatePageFrame title="Launchpad" subtitle="Candidate home">
        <CandidateLoadingState message="Loading your launchpad..." />
      </CandidatePageFrame>
    );
  }

  const { bundle, error } = await loadInitialLaunchpadBundle(snapshot.session);

  return (
    <CandidateLaunchpad
      session={snapshot.session}
      initialBundle={bundle}
      initialError={error}
      initialOnboardingStatus={bundle.onboardingStatus}
    />
  );
}

