'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  acknowledgeCandidateLetter,
  fetchCandidateOfferRoom,
  markCandidateLetterRead,
  type CandidateOfferRoomLetter,
} from '@/lib/candidate/contracts';

export interface CandidateOfferRoomStats {
  unreadCount: number;
  readCount: number;
  acknowledgedCount: number;
}

const EMPTY_STATS: CandidateOfferRoomStats = {
  unreadCount: 0,
  readCount: 0,
  acknowledgedCount: 0,
};

interface UseCandidateOfferRoomOptions {
  initialLetters?: CandidateOfferRoomLetter[];
  initialStats?: CandidateOfferRoomStats;
  initialError?: string | null;
}

export function useCandidateOfferRoom(
  accessToken?: string,
  enabled = true,
  options: UseCandidateOfferRoomOptions = {},
) {
  const hasInitialState =
    options.initialLetters !== undefined ||
    options.initialStats !== undefined ||
    options.initialError !== undefined;

  const [letters, setLetters] = useState<CandidateOfferRoomLetter[]>(options.initialLetters ?? []);
  const [loading, setLoading] = useState(!hasInitialState);
  const [error, setError] = useState<string | null>(options.initialError ?? null);
  const [selectedLetter, setSelectedLetter] = useState<CandidateOfferRoomLetter | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [stats, setStats] = useState<CandidateOfferRoomStats>(options.initialStats ?? EMPTY_STATS);

  const fetchLetters = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchCandidateOfferRoom(accessToken);
      if (!result.success) {
        throw new Error(result.message || result.error || 'Failed to fetch letters');
      }

      const roomData = result.data;
      const roomLetters = Array.isArray(roomData?.letters) ? roomData.letters : [];

      setLetters(roomLetters);
      setStats({
        unreadCount: Number(roomData?.unread_count ?? 0),
        readCount: Number(roomData?.read_count ?? 0),
        acknowledgedCount: Number(roomData?.acknowledged_count ?? 0),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch letters');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (hasInitialState || !enabled || !accessToken) {
      return;
    }

    void fetchLetters();
  }, [accessToken, enabled, fetchLetters, hasInitialState]);

  const openLetter = useCallback(
    async (letter: CandidateOfferRoomLetter) => {
      setSelectedLetter(letter);

      if (!accessToken || letter.room_status !== 'new') {
        return;
      }

      try {
        const result = await markCandidateLetterRead(accessToken, letter.id);
        if (!result.success) return;

        const readAt = new Date().toISOString();
        setLetters((currentLetters) =>
          currentLetters.map((currentLetter) =>
            currentLetter.id === letter.id
              ? { ...currentLetter, is_read: true, read_at: readAt, room_status: 'read' }
              : currentLetter,
          ),
        );

        setSelectedLetter((currentLetter) =>
          currentLetter && currentLetter.id === letter.id
            ? { ...currentLetter, is_read: true, read_at: readAt, room_status: 'read' }
            : currentLetter,
        );

        setStats((currentStats) => ({
          unreadCount: Math.max(0, currentStats.unreadCount - 1),
          readCount: currentStats.readCount + 1,
          acknowledgedCount: currentStats.acknowledgedCount,
        }));
      } catch {
        // Keep the existing visual state if mark-read fails.
      }
    },
    [accessToken],
  );

  const closeLetter = useCallback(() => {
    setSelectedLetter(null);
  }, []);

  const acknowledgeSelected = useCallback(async () => {
    if (!selectedLetter || !accessToken || selectedLetter.room_status === 'acknowledged') {
      return;
    }

    setAcknowledging(true);

    try {
      const result = await acknowledgeCandidateLetter(accessToken, selectedLetter.id);
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to acknowledge letter');
      }

      const acknowledgedAt = result.data?.acknowledged_at ?? new Date().toISOString();

      setLetters((currentLetters) =>
        currentLetters.map((currentLetter) =>
          currentLetter.id === selectedLetter.id
            ? {
                ...currentLetter,
                is_read: true,
                read_at: currentLetter.read_at ?? acknowledgedAt,
                room_status: 'acknowledged',
                acknowledgement: {
                  acknowledgement_type: result.data?.acknowledgement_type ?? 'acknowledged',
                  acknowledged_at: acknowledgedAt,
                  acknowledgement_payload: {},
                },
              }
            : currentLetter,
        ),
      );

      setSelectedLetter((currentLetter) =>
        currentLetter
          ? {
              ...currentLetter,
              is_read: true,
              read_at: currentLetter.read_at ?? acknowledgedAt,
              room_status: 'acknowledged',
              acknowledgement: {
                acknowledgement_type: result.data?.acknowledgement_type ?? 'acknowledged',
                acknowledged_at: acknowledgedAt,
                acknowledgement_payload: {},
              },
            }
          : currentLetter,
      );

      setStats((currentStats) => ({
        unreadCount: currentStats.unreadCount,
        readCount: Math.max(0, currentStats.readCount - (selectedLetter.room_status === 'read' ? 1 : 0)),
        acknowledgedCount: currentStats.acknowledgedCount + 1,
      }));
    } catch {
      // Keep the existing visual state if acknowledgement fails.
    } finally {
      setAcknowledging(false);
    }
  }, [accessToken, selectedLetter]);

  const downloadSelectedPdf = useCallback(async (elementId = 'letter-content-render') => {
    if (!selectedLetter) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${selectedLetter.letter_title}</title></head><body>${element.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }, [selectedLetter]);

  return {
    letters,
    loading,
    error,
    stats,
    selectedLetter,
    acknowledging,
    fetchLetters,
    openLetter,
    closeLetter,
    acknowledgeSelected,
    downloadSelectedPdf,
  };
}
