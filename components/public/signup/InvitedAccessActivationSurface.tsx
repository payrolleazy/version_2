'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActionButton, ActionLink } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { invokePublicEdgeFunctionWithStatus } from '@/lib/public-client/functions';

type InvitationRole = 'candidate' | 'admin';
type SignupJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

type SignupManagementSuccessResponse = {
  success: true;
  message: string;
  job_id: string;
  invitation_role: InvitationRole;
  estimated_completion?: string;
  status_check_url?: string;
  next_steps?: string;
};

type SignupManagementFailureResponse = {
  success: false;
  error: string;
  error_code?: string;
  details?: {
    job_id?: string;
    status?: string;
    priority?: number;
    submitted_minutes_ago?: number;
    estimated_completion?: string;
    status_check_url?: string;
    invitation_role?: InvitationRole;
  };
};

type SignupStatusResponse = {
  success: true;
  job: {
    job_id: string;
    email: string;
    status: SignupJobStatus;
    status_message: string;
    retry_count: number;
    max_retries: number;
    last_error?: string | null;
    last_error_code?: string | null;
    created_at: string;
    updated_at: string;
    completed_at?: string | null;
    processing_duration_ms?: number | null;
  };
  next_steps?: string | null;
};

const ROLE_OPTIONS: { value: InvitationRole; label: string; description: string }[] = [
  {
    value: 'candidate',
    label: 'Candidate access',
    description: 'Use this when the organization invited you into the candidate workspace.',
  },
  {
    value: 'admin',
    label: 'Admin access',
    description: 'Use this when the organization invited you as an admin operator.',
  },
];

function isTerminalStatus(status: SignupJobStatus | null) {
  return status === 'completed' || status === 'dead_letter';
}

export function InvitedAccessActivationSurface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('job_id') ?? '';
  const initialEmail = searchParams.get('email') ?? '';
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'candidate';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [invitationRole, setInvitationRole] = useState<InvitationRole>(initialRole);
  const [jobId, setJobId] = useState(initialJobId);
  const [jobStatus, setJobStatus] = useState<SignupJobStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [nextSteps, setNextSteps] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const canPoll = useMemo(() => jobId.length > 0 && !isTerminalStatus(jobStatus), [jobId, jobStatus]);

  function syncQuery(nextJobId: string, nextEmail: string, nextRole: InvitationRole) {
    const params = new URLSearchParams();
    if (nextJobId) params.set('job_id', nextJobId);
    if (nextEmail) params.set('email', nextEmail);
    if (nextRole) params.set('role', nextRole);
    const query = params.toString();
    router.replace(query ? `/signup/invite?${query}` : '/signup/invite');
  }

  async function pollStatus(targetJobId: string, targetEmail: string, silent = false) {
    if (!targetJobId) {
      return;
    }

    if (!silent) {
      setIsPolling(true);
      setError(null);
    }

    try {
      const { payload } = await invokePublicEdgeFunctionWithStatus<SignupStatusResponse>('signup_status_check', {
        job_id: targetJobId,
      });

      if (payload.success !== true) {
        throw new Error('Could not read signup status.');
      }

      setJobStatus(payload.job.status);
      setStatusMessage(payload.job.status_message);
      setNextSteps(payload.next_steps ?? null);

      const resolvedEmail = payload.job.email || targetEmail;
      if (resolvedEmail && resolvedEmail !== email) {
        setEmail(resolvedEmail);
      }
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : 'Could not read signup status.');
    } finally {
      if (!silent) {
        setIsPolling(false);
      }
    }
  }

  useEffect(() => {
    if (!initialJobId) {
      return;
    }

    void pollStatus(initialJobId, initialEmail);
  }, [initialEmail, initialJobId]);

  useEffect(() => {
    if (!canPoll) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void pollStatus(jobId, email, true);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canPoll, email, jobId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage('Verifying your invitation and creating the activation job...');
    setNextSteps(null);
    setIsSubmitting(true);

    try {
      const { status, payload } = await invokePublicEdgeFunctionWithStatus<SignupManagementSuccessResponse | SignupManagementFailureResponse>(
        'signup_management',
        {
          full_name: fullName,
          email,
          mobile_no: mobileNumber,
          password,
          invitation_role: invitationRole,
        },
      );

      if (payload.success === true) {
        setJobId(payload.job_id);
        setJobStatus('pending');
        setStatusMessage(payload.message || 'Activation job created.');
        setNextSteps(payload.next_steps ?? 'Keep this page open while the activation finishes.');
        syncQuery(payload.job_id, email, invitationRole);
        await pollStatus(payload.job_id, email, true);
        return;
      }

      if (status === 409 && payload.details?.job_id) {
        setJobId(payload.details.job_id);
        setJobStatus((payload.details.status as SignupJobStatus | undefined) ?? 'pending');
        setStatusMessage(payload.error);
        setNextSteps(`Existing activation job found. ${payload.details.estimated_completion ?? 'Please wait a few moments.'}`);
        syncQuery(payload.details.job_id, email, invitationRole);
        await pollStatus(payload.details.job_id, email, true);
        return;
      }

      throw new Error(payload.error || 'Could not start invited access activation.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not start invited access activation.');
      setStatusMessage(null);
      setNextSteps(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicSectionCard className="mx-auto max-w-[64rem] border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Invited access</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-[3rem]">
              Activate the workspace invitation.
            </h1>
            <p className="text-base leading-8 text-slate-600">
              This path creates the invited account only when a valid organization invitation already exists.
            </p>
          </div>

          <div className="space-y-3 rounded-[1.6rem] border border-slate-200/70 bg-white/90 p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Activation status</p>
            <div className="space-y-3 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                <span className="font-semibold text-slate-950">Current state:</span>{' '}
                {jobStatus ? jobStatus.replace('_', ' ') : 'Not started'}
              </div>
              {jobId ? (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-slate-600">
                  Job id: <span className="font-mono text-xs text-slate-900">{jobId}</span>
                </div>
              ) : null}
              {statusMessage ? (
                <div className="rounded-2xl border border-sky-200/70 bg-sky-50 px-4 py-3 text-sky-900">
                  {statusMessage}
                </div>
              ) : null}
              {nextSteps ? (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-slate-600">
                  {nextSteps}
                </div>
              ) : null}
              {jobStatus === 'completed' ? (
                <ActionLink href={email ? `/signin?email=${encodeURIComponent(email)}` : '/signin'}>
                  Continue to sign in
                </ActionLink>
              ) : (
                <ActionButton type="button" variant="secondary" onClick={() => void pollStatus(jobId, email)} disabled={!jobId || isPolling}>
                  {isPolling ? 'Refreshing status...' : 'Refresh status'}
                </ActionButton>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-[1rem] border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Your full name"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="you@company.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Mobile number</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(event) => setMobileNumber(event.target.value)}
                  required
                  autoComplete="tel"
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Invitation mobile number"
                />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Create your password"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Invitation type</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((option) => {
                  const selected = invitationRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInvitationRole(option.value)}
                      className={`rounded-[1rem] border px-4 py-4 text-left transition ${selected ? 'border-cyan-300/55 bg-cyan-300/12' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                    >
                      <div className="text-sm font-semibold text-white">{option.label}</div>
                      <div className="mt-1 text-xs leading-6 text-slate-300">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <ActionButton type="submit" disabled={isSubmitting || isPolling}>
                {isSubmitting ? 'Starting activation...' : 'Activate invited access'}
              </ActionButton>
              <ActionLink href="/signin" variant="secondary">Already have access</ActionLink>
            </div>
          </form>
        </div>
      </div>
    </PublicSectionCard>
  );
}
