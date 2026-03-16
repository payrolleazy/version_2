'use client';

import { useCandidateSession } from '@/components/candidate/shell/CandidateSessionContext';

import CandidateOfferRoomScreen from '@/components/candidate/letters/CandidateOfferRoomScreen';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';

export default function LettersPage() {
  const { session, isLoading } = useCandidateSession();

  if (isLoading || !session) {
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

  return (
    <CandidatePageFrame
      title="My Letters"
      subtitle="Offer & appointment letters"
      containerClassName="max-w-full"
    >
      <CandidateOfferRoomScreen session={session} />
    </CandidatePageFrame>
  );
}
