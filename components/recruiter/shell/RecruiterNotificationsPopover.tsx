'use client';

import { useEffect, useRef, useState } from 'react';

export default function RecruiterNotificationsPopover() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

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

  return (
    <div ref={wrapperRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition-colors hover:bg-white"
        aria-label="Open recruiter notifications"
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
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[360px] overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/95 shadow-2xl shadow-slate-950/12 backdrop-blur">
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-700 px-5 py-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">Notifications</p>
            <h3 className="mt-3 text-2xl font-black">Recruiter alerts</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-50/90">
              Recruiter notifications will plug into INS in a later build wave.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">No recruiter alerts yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The shell is ready now, but real recruiter alerts will arrive when the notification wave is built.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
