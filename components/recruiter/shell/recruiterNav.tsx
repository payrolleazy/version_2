import React from 'react';

export interface RecruiterNavChildItem {
  id: string;
  label: string;
  href?: string;
  description: string;
  ready?: boolean;
}

export interface RecruiterNavSection {
  id: string;
  label: string;
  href?: string;
  icon: (active: boolean) => React.ReactNode;
  children: RecruiterNavChildItem[];
}

const baseIconClass = (active: boolean) =>
  `h-5 w-5 transition-colors ${active ? 'text-sky-600' : 'text-slate-400'}`;

export const recruiterNavSections: RecruiterNavSection[] = [
  {
    id: 'workbench',
    label: 'Workbench',
    href: '/recruiter',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
    children: [
      { id: 'dashboard', label: 'Dashboard', href: '/recruiter', description: 'Recruiter workbench home', ready: true },
      { id: 'queue', label: 'My Queue', href: '/recruiter/queue', description: 'Everything needing action', ready: true },
      { id: 'calendar', label: 'Calendar', href: '/recruiter/calendar', description: 'Upcoming interview schedule', ready: true },
    ],
  },
  {
    id: 'requisitions',
    label: 'Requisitions',
    href: '/recruiter/requisitions',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
    children: [
      { id: 'open-requisitions', label: 'Open Requisitions', href: '/recruiter/requisitions', description: 'Owned hiring demand', ready: true },
      { id: 'position-mapping', label: 'Position Mapping', description: 'Vacancy to requisition alignment', ready: false },
      { id: 'closed-requisitions', label: 'Closed Requisitions', description: 'Closed and archived views', ready: false },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    href: '/recruiter/pipeline',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6v10H3zM15 3h6v18h-6zM9 11h6v6H9z" />
      </svg>
    ),
    children: [
      { id: 'board', label: 'Candidate Board', href: '/recruiter/pipeline', description: 'Stage movement workbench', ready: true },
      { id: 'list', label: 'Candidate List', description: 'Table mode for recruiter-owned candidates', ready: false },
    ],
  },
  {
    id: 'interviews',
    label: 'Interviews',
    href: '/recruiter/interviews',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 4h2a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    children: [
      { id: 'schedule-board', label: 'Schedule Board', description: 'Interview planning workspace', ready: false },
      { id: 'pending-feedback', label: 'Pending Feedback', description: 'Outstanding interviewer reviews', ready: false },
      { id: 'history', label: 'History', description: 'Past interview rounds', ready: false },
    ],
  },
  {
    id: 'offers',
    label: 'Offers',
    href: '/recruiter/offers',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    children: [
      { id: 'draft-offers', label: 'Draft Offers', description: 'Offers waiting to be issued', ready: false },
      { id: 'issued-offers', label: 'Issued', description: 'Offers already sent out', ready: false },
      { id: 'accepted-rejected', label: 'Accepted / Rejected', description: 'Final offer outcomes', ready: false },
    ],
  },
  {
    id: 'conversions',
    label: 'Conversions',
    href: '/recruiter/conversions',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18M4 17a2 2 0 012-2h3m10 2a2 2 0 01-2-2h-3" />
      </svg>
    ),
    children: [
      { id: 'ready-handoff', label: 'Ready For Handoff', description: 'Conversion candidates waiting', ready: false },
      { id: 'signup-eoap', label: 'In Signup / EOAP', description: 'Track downstream onboarding handoff', ready: false },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/recruiter/analytics/funnel',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V8m5 8V5m5 11v-4" />
      </svg>
    ),
    children: [
      { id: 'vacancy-aging', label: 'Vacancy Aging', description: 'Hierarchy-backed vacancy views', ready: false },
      { id: 'funnel', label: 'Funnel', description: 'Pipeline conversion metrics', ready: false },
      { id: 'kra', label: 'KRA', description: 'Recruiter performance KPIs', ready: false },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/recruiter/settings/pipelines',
    icon: (active) => (
      <svg className={baseIconClass(active)} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1.724 1.724 0 013.35 0l.14.804a1.724 1.724 0 002.573 1.148l.723-.416a1.724 1.724 0 012.357.632l.402.696a1.724 1.724 0 01-.632 2.357l-.696.402a1.724 1.724 0 000 2.984l.696.402a1.724 1.724 0 01.632 2.357l-.402.696a1.724 1.724 0 01-2.357.632l-.723-.416a1.724 1.724 0 00-2.573 1.148l-.14.804a1.724 1.724 0 01-3.35 0l-.14-.804a1.724 1.724 0 00-2.573-1.148l-.723.416a1.724 1.724 0 01-2.357-.632l-.402-.696a1.724 1.724 0 01.632-2.357l.696-.402a1.724 1.724 0 000-2.984l-.696-.402a1.724 1.724 0 01-.632-2.357l.402-.696a1.724 1.724 0 012.357-.632l.723.416a1.724 1.724 0 002.573-1.148l.14-.804z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'pipeline-templates', label: 'Pipeline Templates', description: 'Tenant-wide hiring templates', ready: false },
    ],
  },
];

export function isRecruiterNavActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === '/recruiter') return pathname === '/recruiter';
  return pathname.startsWith(href);
}
