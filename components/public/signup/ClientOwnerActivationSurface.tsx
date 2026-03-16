'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { ActionButton, ActionLink } from '@/components/ui/ActionButton';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { invokePublicEdgeFunction } from '@/lib/public-client/functions';

type CredentialBootstrapResponse = {
  success: true;
  status: string;
  next_route?: string;
  post_signin_route?: string | null;
  email_confirmation_required?: boolean;
};

export function ClientOwnerActivationSurface() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('Activation token is missing from this link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setStatusMessage('Creating your owner credentials...');
    setIsSubmitting(true);

    try {
      const payload = await invokePublicEdgeFunction<CredentialBootstrapResponse>('client-owner-credential-bootstrap', {
        action: 'complete_credential_setup',
        credential_setup_token: token,
        password,
      });

      if (!payload.email_confirmation_required && email) {
        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          window.location.assign('/portal');
          return;
        }
      }

      setStatusMessage(
        payload.email_confirmation_required
          ? 'Credential setup is complete. Confirm the email if required, then sign in.'
          : 'Credential setup is complete. Sign in to continue into the protected workspace.',
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not complete owner activation.');
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicSectionCard className="mx-auto max-w-[42rem] border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Owner activation</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Set your workspace password</h1>
          <p className="text-sm leading-7 text-slate-300">
            This is the final public step before the client owner enters the protected application workspace.
          </p>
        </div>

        {!token ? (
          <div className="mt-7 space-y-4 rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
            <p>The activation link is incomplete.</p>
            <ActionLink href="/purchase" variant="secondary">Return to purchase</ActionLink>
          </div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {email ? (
              <div className="rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-slate-200">
                Owner email: <span className="font-semibold text-white">{email}</span>
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                placeholder="Create your workspace password"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                placeholder="Repeat the password"
              />
            </label>

            {statusMessage ? (
              <div className="rounded-[1rem] border border-sky-300/35 bg-sky-400/10 px-4 py-3 text-sm text-cyan-100">
                {statusMessage}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4">
              <ActionButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Activating workspace...' : 'Complete activation'}
              </ActionButton>
              <ActionLink href="/signin" variant="secondary">Go to sign in</ActionLink>
            </div>
          </form>
        )}
      </div>
    </PublicSectionCard>
  );
}
