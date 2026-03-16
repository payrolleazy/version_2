'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ActionButton } from '@/components/ui/ActionButton';
import { PublicSectionCard } from '@/components/public/PublicSection';

type WorkspaceKey = 'candidate' | 'employee' | 'admin' | 'recruiter' | 'payroll_admin' | 'master_admin';

type WorkspaceOption = {
  key: WorkspaceKey;
  label: string;
  configId: string;
  accentClass: string;
  accentTextClass: string;
};

type SecureSignInResponse = {
  status?: string;
  state_token?: string;
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
  error?: string;
};

const DeferredSignInHrmsShowcase = dynamic(
  () => import('@/components/public/signin/SignInHrmsShowcase').then((mod) => mod.SignInHrmsShowcase),
  {
    ssr: false,
    loading: () => <ShowcasePlaceholder />,
  },
);

function ShowcasePlaceholder() {
  return (
    <div className="pointer-events-none hidden xl:block" aria-hidden="true">
      <div className="mx-auto max-w-[620px] min-h-[640px] rounded-[2rem] border border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(241,245,249,0.78)_100%)]" />
    </div>
  );
}
const WORKSPACE_OPTIONS: WorkspaceOption[] = [
  {
    key: 'candidate',
    label: 'Candidate',
    configId: 'beff81c1-0ef5-443d-8d5b-c6dfe10f632a',
    accentClass: 'border-sky-300/35 bg-sky-300/16',
    accentTextClass: 'text-sky-200',
  },
  {
    key: 'employee',
    label: 'Employee',
    configId: '97f8bdb8-b550-4b71-b9e7-71938ecd3393',
    accentClass: 'border-cyan-300/35 bg-cyan-300/16',
    accentTextClass: 'text-cyan-200',
  },
  {
    key: 'admin',
    label: 'Admin',
    configId: '53015728-9f4d-4086-b008-e113e80c0634',
    accentClass: 'border-emerald-300/35 bg-emerald-300/16',
    accentTextClass: 'text-emerald-200',
  },
  {
    key: 'recruiter',
    label: 'Recruiter',
    configId: '3f0f7c48-7f8d-4b79-b818-0d7c6521b4c9',
    accentClass: 'border-fuchsia-300/35 bg-fuchsia-300/16',
    accentTextClass: 'text-fuchsia-200',
  },
  {
    key: 'payroll_admin',
    label: 'Payroll Admin',
    configId: 'b7e2e76a-090f-4584-bf34-8495a1a63812',
    accentClass: 'border-violet-300/35 bg-violet-300/16',
    accentTextClass: 'text-violet-200',
  },
  {
    key: 'master_admin',
    label: 'Master Admin',
    configId: 'd86be101-4e69-4ffa-98b4-97ba2113213a',
    accentClass: 'border-amber-300/35 bg-amber-300/16',
    accentTextClass: 'text-amber-200',
  },
] as const;

function getWorkspaceFromQuery(value: string | null): WorkspaceKey {
  return WORKSPACE_OPTIONS.some((option) => option.key === value)
    ? (value as WorkspaceKey)
    : 'candidate';
}

function getSecureSignInEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  }

  return {
    functionUrl: `${supabaseUrl}/functions/v1/secure-employee-signin`,
    supabaseAnonKey,
  };
}

async function invokeSecureSignIn(body: Record<string, string>): Promise<SecureSignInResponse> {
  const { functionUrl, supabaseAnonKey } = getSecureSignInEnv();
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && typeof payload.error === 'string'
      ? payload.error
      : 'Could not sign in.';

    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected response from secure-employee-signin.');
  }

  return payload as SecureSignInResponse;
}

function WorkspaceRailItem({
  option,
  active,
  onClick,
}: {
  option: WorkspaceOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative w-full border px-4 py-3 text-left text-sm font-bold tracking-[0.04em] transition',
        'first:rounded-t-[1.1rem] last:rounded-b-[1.1rem]',
        active
          ? `${option.accentClass} ${option.accentTextClass} z-10 translate-x-2 rounded-r-[1.15rem] shadow-[0_12px_24px_rgba(15,23,42,0.22)]`
          : 'border-white/8 bg-blue-950 text-slate-300 hover:border-white/16 hover:bg-blue-900 hover:text-white',
      ].join(' ')}
    >
      <span className="block">{option.label}</span>
      {active ? (
        <span className="pointer-events-none absolute inset-y-0 -right-3 w-3 rounded-r-[0.9rem] bg-blue-900" />
      ) : null}
    </button>
  );
}

function SignInSkeleton() {
  return (
    <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_49rem]">
      <ShowcasePlaceholder />
      <div className="flex justify-end">
        <div className="w-full max-w-[49rem]">
          <PublicSectionCard className="ml-auto w-full border-sky-400/70 bg-gradient-to-br from-sky-100/80 via-white to-sky-50/90">
            <div className="rounded-[1.9rem] border border-sky-400/70 bg-blue-900 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.14)] sm:p-4">
              <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
                <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
                  {WORKSPACE_OPTIONS.map((option) => (
                    <div key={option.key} className="h-[52px] rounded-l-[1.1rem] border border-white/10 bg-blue-950" />
                  ))}
                </div>
                <div className="rounded-[1.55rem] border border-white/18 bg-[#17336a] p-7 text-white sm:p-8">
                  <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:hidden">
                    {WORKSPACE_OPTIONS.map((option) => (
                      <div key={option.key} className="h-[48px] rounded-[1rem] border border-white/10 bg-blue-950" />
                    ))}
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded bg-white/10" />
                      <div className="h-10 w-44 rounded bg-white/10" />
                      <div className="h-4 w-full max-w-[28rem] rounded bg-white/10" />
                    </div>
                    <div className="h-[76px] rounded-[1.2rem] border border-white/12 bg-white/8" />
                    <div className="h-[52px] rounded-[1rem] border border-white/12 bg-white/8" />
                    <div className="h-[52px] rounded-[1rem] border border-white/12 bg-white/8" />
                    <div className="h-[50px] rounded-[1.05rem] bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </PublicSectionCard>
        </div>
      </div>
    </div>
  );
}

export function SignInExecutionSurface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceKey>(() => getWorkspaceFromQuery(searchParams.get('portal')));
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [stateToken, setStateToken] = useState('');
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowShowcase(true);
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isMounted]);

  const selectedWorkspace = WORKSPACE_OPTIONS.find((option) => option.key === workspace) ?? WORKSPACE_OPTIONS[0];

  async function applySession(session: SecureSignInResponse['session']) {
    if (!session?.access_token || !session.refresh_token) {
      throw new Error('Login failed: no session returned.');
    }

    const supabase = createSupabaseBrowserClient();
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    router.replace('/portal');
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const payload = await invokeSecureSignIn({
        email,
        password,
        configId: selectedWorkspace.configId,
      });

      if (payload.status === 'otp_sent' && payload.state_token) {
        setStateToken(payload.state_token);
        setIsOtpStage(true);
        setNotice('OTP sent. Enter the code to continue.');
        setPassword('');
        return;
      }

      await applySession(payload.session);
    } catch (clientError) {
      setError(clientError instanceof Error ? clientError.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const payload = await invokeSecureSignIn({
        otp,
        state_token: stateToken,
      });

      await applySession(payload.session);
    } catch (clientError) {
      setError(clientError instanceof Error ? clientError.message : 'Could not verify OTP.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleWorkspaceChange(nextWorkspace: WorkspaceKey) {
    setWorkspace(nextWorkspace);
    setIsOtpStage(false);
    setStateToken('');
    setOtp('');
    setPassword('');
    setNotice(null);
    setError(null);
  }

  return (
    <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_49rem]">
      {showShowcase ? <DeferredSignInHrmsShowcase /> : <ShowcasePlaceholder />}
      <div className="flex justify-end">
        <div className="w-full max-w-[49rem]">
          {!isMounted ? (
            <SignInSkeleton />
          ) : (
            <PublicSectionCard className="ml-auto w-full border-sky-400/70 bg-gradient-to-br from-sky-100/80 via-white to-sky-50/90">
              <div className="rounded-[1.9rem] border border-sky-400/70 bg-blue-900 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.14)] sm:p-4">
                <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
                  <div className="hidden lg:flex lg:flex-col lg:gap-0.5 lg:pt-8">
                    {WORKSPACE_OPTIONS.map((option) => (
                      <WorkspaceRailItem
                        key={option.key}
                        option={option}
                        active={option.key === workspace}
                        onClick={() => handleWorkspaceChange(option.key)}
                      />
                    ))}
                  </div>

                  <div className="rounded-[1.55rem] border border-white/18 bg-[#17336a] p-7 text-white sm:p-8">
                    <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:hidden">
                      {WORKSPACE_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleWorkspaceChange(option.key)}
                          className={[
                            'rounded-[1rem] border px-4 py-3 text-left text-sm font-bold tracking-[0.04em] transition',
                            option.key === workspace
                              ? `${option.accentClass} ${option.accentTextClass}`
                              : 'border-white/10 bg-blue-950 text-slate-300 hover:border-white/18 hover:bg-blue-900 hover:text-white',
                          ].join(' ')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Workspace access</p>
                      <h1 className="text-3xl font-black tracking-tight text-white">Sign in</h1>
                      <p className="max-w-xl text-sm leading-6 text-slate-200/92">
                        Choose the exact role rail you want to open. The session will stay locked to that role context only.
                      </p>
                    </div>

                    <div className={`mt-6 rounded-[1.2rem] border px-5 py-4 ${selectedWorkspace.accentClass}`}>
                      <p className="text-2xl font-black tracking-tight text-white">{selectedWorkspace.label}</p>
                    </div>

                    {!isOtpStage ? (
                      <form className="mt-7 space-y-5" onSubmit={handlePasswordSubmit}>
                        <label className="block space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">Email</span>
                          <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="email"
                            className="w-full rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/75 focus:border-cyan-300/50 focus:bg-white/12"
                            placeholder="you@company.com"
                          />
                        </label>

                        <label className="block space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">Password</span>
                          <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/75 focus:border-cyan-300/50 focus:bg-white/12"
                            placeholder="Enter your password"
                          />
                        </label>

                        {notice ? (
                          <div className="rounded-[1rem] border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                            {notice}
                          </div>
                        ) : null}

                        {error ? (
                          <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                            {error}
                          </div>
                        ) : null}

                        <ActionButton type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? 'Signing in...' : `Sign in to ${selectedWorkspace.label}`}
                        </ActionButton>
                      </form>
                    ) : (
                      <form className="mt-7 space-y-5" onSubmit={handleOtpSubmit}>
                        <label className="block space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">One-time password</span>
                          <input
                            type="text"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value)}
                            required
                            autoComplete="one-time-code"
                            className="w-full rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/75 focus:border-cyan-300/50 focus:bg-white/12"
                            placeholder="Enter OTP"
                          />
                        </label>

                        {notice ? (
                          <div className="rounded-[1rem] border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                            {notice}
                          </div>
                        ) : null}

                        {error ? (
                          <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                            {error}
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <ActionButton type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                          </ActionButton>
                          <ActionButton
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                              setIsOtpStage(false);
                              setStateToken('');
                              setOtp('');
                              setNotice(null);
                              setError(null);
                            }}
                            disabled={isSubmitting}
                          >
                            Back
                          </ActionButton>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </PublicSectionCard>
          )}
        </div>
      </div>
    </div>
  );
}



