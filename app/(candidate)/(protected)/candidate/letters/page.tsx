import CandidateOfferRoomScreen from '@/components/candidate/letters/CandidateOfferRoomScreen';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { CandidateOfferRoomLetter, fetchCandidateOfferRoom } from '@/lib/candidate/contracts';
import type { CandidateOfferRoomStats } from '@/hooks/useCandidateOfferRoom';

async function loadInitialOfferRoomBundle(session: {
  access_token?: string;
}): Promise<{
  letters: CandidateOfferRoomLetter[];
  stats: CandidateOfferRoomStats;
  error: string | null;
}> {
  if (!session.access_token) {
    return {
      letters: [],
      stats: {
        unreadCount: 0,
        readCount: 0,
        acknowledgedCount: 0,
      },
      error: 'Missing candidate session',
    };
  }

  const result = await fetchCandidateOfferRoom(session.access_token);

  if (result.success) {
    const roomData = result.data;
    return {
      letters: Array.isArray(roomData?.letters) ? roomData.letters : [],
      stats: {
        unreadCount: Number(roomData?.unread_count ?? 0),
        readCount: Number(roomData?.read_count ?? 0),
        acknowledgedCount: Number(roomData?.acknowledged_count ?? 0),
      },
      error: null,
    };
  }

  return {
    letters: [],
    stats: {
      unreadCount: 0,
      readCount: 0,
      acknowledgedCount: 0,
    },
    error: result.message || result.error || 'Failed to fetch letters',
  };
}

export const dynamic = 'force-dynamic';

export default async function LettersPage() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
    return (
      <CandidatePageFrame
        title="My Letters"
        subtitle="Offer & appointment letters"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading your offer room..." />
      </CandidatePageFrame>
    );
  }

  const { letters, stats, error } = await loadInitialOfferRoomBundle(snapshot.session);

  return (
    <CandidatePageFrame
      title="My Letters"
      subtitle="Offer & appointment letters"
      containerClassName="max-w-full"
    >
      <CandidateOfferRoomScreen
        session={snapshot.session}
        initialLetters={letters}
        initialStats={stats}
        initialError={error}
      />
    </CandidatePageFrame>
  );
}
