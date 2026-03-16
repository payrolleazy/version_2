'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClientSingleton } from '@/lib/supabase/browser-singleton';

interface CandidateSessionContextValue {
  session: Session | null;
  isLoading: boolean;
  supabase: SupabaseClient;
}

const CandidateSessionContext = createContext<CandidateSessionContextValue | null>(null);

function isSameSession(left: Session | null, right: Session | null) {
  return left?.access_token === right?.access_token && left?.refresh_token === right?.refresh_token;
}

export function CandidateSessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const [supabase] = useState(() => getSupabaseBrowserClientSingleton());
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [isLoading, setIsLoading] = useState(initialSession === undefined);

  useEffect(() => {
    let mounted = true;

    if (initialSession === undefined) {
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession((current) => (isSameSession(current, data.session ?? null) ? current : (data.session ?? null)));
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession((current) => (isSameSession(current, nextSession) ? current : nextSession));
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase, initialSession]);

  const value = useMemo(
    () => ({ session, isLoading, supabase }),
    [session, isLoading, supabase],
  );

  return <CandidateSessionContext.Provider value={value}>{children}</CandidateSessionContext.Provider>;
}

export function useCandidateSession() {
  const context = useContext(CandidateSessionContext);

  if (!context) {
    throw new Error('useCandidateSession must be used within CandidateSessionProvider.');
  }

  return context;
}