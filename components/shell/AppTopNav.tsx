'use client';

import { Bell, PanelLeft, ShieldCheck } from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { BrandSourceBox } from '@/components/BrandSourceBox';
import { useAppShell } from '@/components/shell/AppShellContext';
import type { PortalBootstrap } from '@/lib/bootstrap/portal-bootstrap';
import { PORTAL_LABEL } from '@/lib/auth/role-map';

export function AppTopNav({ bootstrap }: { bootstrap: PortalBootstrap }) {
  const { toggleCollapsed } = useAppShell();

  return (
    <header className="sticky top-0 z-30 rounded-[var(--radius-shell)] border border-white/70 bg-white/85 px-6 py-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <div>
            <BrandSourceBox className="h-[38px] px-3" wordmarkClassName="text-[14px]" />
            <h1 className="text-xl font-black text-slate-950">{PORTAL_LABEL[bootstrap.portal]}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Server validated
          </div>
          <SignOutButton className="border border-slate-200/80 bg-white text-slate-800 hover:bg-slate-50" />
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="rounded-[1.2rem] border border-slate-200/70 bg-white px-4 py-3 text-right shadow-[var(--shadow-card)]">
            <p className="text-sm font-black text-slate-900">{bootstrap.userName}</p>
            <p className="text-xs text-slate-500">{bootstrap.userEmail || 'Signed in'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
