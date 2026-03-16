'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCandidateSession } from '@/components/candidate/shell/CandidateSessionContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';
import {
  CandidateLaunchpadIssue,
  CandidateLaunchpadResponse,
  fetchCandidateLaunchpad,
} from '@/lib/candidate/contracts';

function NotificationItem({
  title,
  description,
  href,
  tone,
  badge,
  onNavigate,
}: {
  title: string;
  description: string;
  href: string;
  tone: 'attention' | 'info' | 'success';
  badge?: string;
  onNavigate: (href: string) => void;
}) {
  const toneClasses =
    tone === 'attention'
      ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:hover:bg-amber-950/50'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50'
        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900';

  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function mapIssueTone(issue: CandidateLaunchpadIssue): 'attention' | 'info' {
  return issue.severity === 'blocking' || issue.severity === 'warning' ? 'attention' : 'info';
}

export default function CandidateNotificationsPopover() {
  const { session } = useCandidateSession();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CandidateLaunchpadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !session?.access_token) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchCandidateLaunchpad(session.access_token, false);

      if (!active) return;

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error ?? 'Could not load notifications.');
      }

      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, [open, session?.access_token]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = Math.max(
    Number(data?.summary?.unread_notifications ?? 0),
    Number(data?.notifications?.unread_count ?? 0),
  );

  const quickItems = useMemo(() => {
    const items: Array<{
      title: string;
      description: string;
      href: string;
      tone: 'attention' | 'info' | 'success';
      badge?: string;
    }> = [];

    const pendingDocuments = Number(data?.summary?.pending_required_documents ?? 0);
    const unreadLetters = Number(data?.summary?.unread_letters ?? 0);
    const issues = data?.readiness?.issues ?? [];

    if (pendingDocuments > 0) {
      items.push({
        title: 'Pending document uploads',
        description: `${pendingDocuments} required document${pendingDocuments === 1 ? '' : 's'} still need your attention.`,
        href: '/candidate/documents',
        tone: 'attention',
        badge: `${pendingDocuments}`,
      });
    }

    if (unreadLetters > 0) {
      items.push({
        title: 'Unread letters waiting',
        description: `${unreadLetters} letter${unreadLetters === 1 ? '' : 's'} are still unread in your offer room.`,
        href: '/candidate/letters',
        tone: 'info',
        badge: `${unreadLetters}`,
      });
    }

    issues.slice(0, 2).forEach((issue) => {
      items.push({
        title: issue.title,
        description: issue.resolution_hint ?? issue.message,
        href: issue.issue_code.includes('document') ? '/candidate/documents' : '/candidate/onboarding',
        tone: mapIssueTone(issue),
        badge: issue.severity,
      });
    });

    if (items.length === 0) {
      items.push({
        title: 'You are all caught up',
        description: 'No active blockers are waiting right now. Keep an eye on your launchpad for updates.',
        href: '/candidate',
        tone: 'success',
      });
    }

    return items.slice(0, 4);
  }, [data]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={wrapperRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition-colors hover:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-slate-950"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.45rem] items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-1.5 py-1 text-[10px] font-black text-white shadow-lg shadow-sky-900/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+14px)] z-50 w-[400px] overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-2xl shadow-slate-950/12 backdrop-blur dark:border-white/5 dark:bg-slate-950/95"
          >
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-700 px-5 py-5 text-white dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">
                    Notifications
                  </p>
                  <h3 className="mt-3 text-2xl font-black">Candidate alerts</h3>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/90">
                    Clean shortcuts to what actually needs your attention right now.
                  </p>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/90">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All clear'}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {loading ? (
                <CandidateCallout
                  tone="info"
                  title="Loading alerts"
                  message="Fetching your latest candidate updates."
                />
              ) : error ? (
                <CandidateCallout
                  tone="error"
                  title="Notifications unavailable"
                  message={error}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Unread
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                        {unreadCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Actionable
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                        {Number(data?.summary?.actionable_notifications ?? data?.notifications?.actionable_count ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {quickItems.map((item) => (
                      <NotificationItem
                        key={`${item.title}-${item.href}`}
                        title={item.title}
                        description={item.description}
                        href={item.href}
                        tone={item.tone}
                        badge={item.badge}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                    <CandidateActionButton
                      variant="outline"
                      block
                      onClick={() => handleNavigate('/candidate')}
                    >
                      Open full launchpad
                    </CandidateActionButton>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
