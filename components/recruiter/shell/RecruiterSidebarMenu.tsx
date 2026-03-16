'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  isRecruiterNavActive,
  recruiterNavSections,
  type RecruiterNavChildItem,
} from '@/components/recruiter/shell/recruiterNav';

function ChildItem({
  item,
  active,
}: {
  item: RecruiterNavChildItem;
  active: boolean;
}) {
  if (!item.href || item.ready === false) {
    return (
      <div className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-slate-400 dark:text-slate-500">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">{item.description}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all ${
        active
          ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950'
          : 'text-slate-600 hover:bg-white/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-950/80 dark:hover:text-white'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
          active
            ? 'bg-white/15 dark:bg-slate-950/10'
            : 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-900 dark:group-hover:bg-slate-800'
        }`}
      >
        <span className="text-sm font-black leading-none">{item.label.charAt(0)}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-6">{item.label}</p>
        <p
          className={`mt-1 text-xs leading-5 ${
            active ? 'text-white/75 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {item.description}
        </p>
      </div>
    </Link>
  );
}

export default function RecruiterSidebarMenu() {
  const pathname = usePathname();
  const initialOpen = useMemo(
    () =>
      recruiterNavSections.reduce<Record<string, boolean>>((acc, section) => {
        acc[section.id] = section.children.some((child) => isRecruiterNavActive(pathname, child.href));
        return acc;
      }, {}),
    [pathname],
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpen);

  return (
    <div className="space-y-2">
      {recruiterNavSections.map((section) => {
        const active =
          isRecruiterNavActive(pathname, section.href) ||
          section.children.some((child) => isRecruiterNavActive(pathname, child.href));
        const open = openSections[section.id] ?? active;

        return (
          <div
            key={section.id}
            className="rounded-[1.7rem] border border-white/50 bg-white/70 p-2.5 shadow-sm dark:border-white/5 dark:bg-slate-950/70"
          >
            <button
              type="button"
              onClick={() =>
                setOpenSections((current) => ({
                  ...current,
                  [section.id]: !open,
                }))
              }
              className={`group flex w-full items-center gap-3 rounded-[1.35rem] px-3.5 py-3 text-left transition-colors ${
                active
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950'
                  : 'text-slate-700 hover:bg-white/90 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  active
                    ? 'bg-white/15 dark:bg-slate-950/10'
                    : 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-900 dark:group-hover:bg-slate-800'
                }`}
              >
                {section.icon(active)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black leading-6">{section.label}</p>
              </div>
              <svg
                className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open ? (
              <div className="space-y-2 px-2 pb-2 pt-3">
                {section.children.map((child) => (
                  <ChildItem
                    key={child.id}
                    item={child}
                    active={isRecruiterNavActive(pathname, child.href)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
