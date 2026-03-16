import React from 'react';

export interface CandidateNavItem {
  id: string;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

export const candidateNavItems: CandidateNavItem[] = [
  {
    id: 'launchpad',
    label: 'Launchpad',
    href: '/candidate',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-cyan-600' : 'text-slate-400'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    href: '/candidate/onboarding',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-cyan-600' : 'text-slate-400'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/candidate/documents',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-cyan-600' : 'text-slate-400'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'letters',
    label: 'Offer Room',
    href: '/candidate/letters',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-cyan-600' : 'text-slate-400'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'interview',
    label: 'Interview',
    href: '/candidate/interview',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-cyan-600' : 'text-slate-400'}`}
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 4h2a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export function isCandidateNavActive(pathname: string, href: string) {
  if (href === '/candidate') return pathname === '/candidate';
  return pathname.startsWith(href);
}
