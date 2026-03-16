'use client';

import { createContext, useContext } from 'react';

interface CandidateShellContextValue {
  isPWA: boolean;
}

const CandidateShellContext = createContext<CandidateShellContextValue>({
  isPWA: false,
});

export function CandidateShellProvider({
  children,
  isPWA,
}: {
  children: React.ReactNode;
  isPWA: boolean;
}) {
  return <CandidateShellContext.Provider value={{ isPWA }}>{children}</CandidateShellContext.Provider>;
}

export function useCandidateShell() {
  return useContext(CandidateShellContext);
}
