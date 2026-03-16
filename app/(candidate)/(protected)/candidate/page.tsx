import { Suspense } from 'react';

import CandidateLaunchpad from '@/components/candidate/launchpad/CandidateLaunchpad';
import CandidateLaunchpadOnboardingPanelLoading from '@/components/candidate/launchpad/CandidateLaunchpadOnboardingPanelLoading';
import CandidateLaunchpadOnboardingPanelServer from '@/components/candidate/launchpad/CandidateLaunchpadOnboardingPanelServer';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { CandidateLaunchpadResponse, fetchCandidateLaunchpad } from '@/lib/candidate/contracts';

type LifeEvents = {
  birthday: string | null;
  anniversary: string | null;
};

type LaunchpadBundle = {
  launchpad: CandidateLaunchpadResponse | null;
  lifeEvents: LifeEvents;
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
      },
      error: 'Missing candidate session',
    };
  }

  const result = await fetchCandidateLaunchpad(session.access_token, true);

  if (result.success && result.data) {
    return {
      bundle: {
        launchpad: result.data,
        lifeEvents: EMPTY_LIFE_EVENTS,
      },
      error: null,
    };
  }

  return {
    bundle: {
      launchpad: null,
      lifeEvents: EMPTY_LIFE_EVENTS,
    },
    error: result.error ?? 'Failed to load your launchpad',
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
      onboardingPanel={
        <Suspense fallback={<CandidateLaunchpadOnboardingPanelLoading />}>
          <CandidateLaunchpadOnboardingPanelServer accessToken={snapshot.session.access_token} />
        </Suspense>
      }
    />
  );
}
