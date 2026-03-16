import { cache } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ServerAuthSnapshot {
  session: Session | null;
  user: User | null;
  roleId: string | null;
  envReady: boolean;
}

export const getServerAuthSnapshot = cache(async (): Promise<ServerAuthSnapshot> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      session: null,
      user: null,
      roleId: null,
      envReady: false,
    };
  }

  // Verify the cookie-backed auth state with the auth server before trusting user data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      session: null,
      user: null,
      roleId: null,
      envReady: true,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const trustedSession = session
    ? {
        ...session,
        user,
      }
    : null;

  return {
    session: trustedSession,
    user,
    roleId: user.user_metadata?.role_id ?? null,
    envReady: true,
  };
});
