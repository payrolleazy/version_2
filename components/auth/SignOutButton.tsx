'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ActionButton } from '@/components/ui/ActionButton';

export function SignOutButton({
  className = '',
  redirectTo = '/signin',
  children,
}: {
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.location.assign(redirectTo);
    }
  }

  return (
    <ActionButton
      type="button"
      variant="secondary"
      className={className}
      disabled={isLoading}
      onClick={handleSignOut}
    >
      {isLoading ? 'Signing out...' : children ?? 'Sign out'}
    </ActionButton>
  );
}
