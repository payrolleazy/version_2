'use client';

import { useState } from 'react';
import { getSupabaseBrowserClientSingleton } from '@/lib/supabase/browser-singleton';

export function useCandidateLogout() {
  const [supabase] = useState(() => getSupabaseBrowserClientSingleton());
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ignore local cleanup errors.
      }
    }

    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }

    window.location.href = '/signin';
  };

  return {
    loggingOut,
    logout,
  };
}
