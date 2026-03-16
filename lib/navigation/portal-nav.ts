import type { PortalId } from '@/lib/auth/role-map';

export interface PortalNavChild {
  label: string;
  href: string;
}

export interface PortalNavItem {
  label: string;
  href: string;
  children?: PortalNavChild[];
}

const NAVIGATION: Record<PortalId, PortalNavItem[]> = {
  candidate: [
    { label: 'Launchpad', href: '/candidate' },
    { label: 'Documents', href: '/candidate/documents' },
    { label: 'Letters', href: '/candidate/letters' },
  ],
  employee: [
    { label: 'Overview', href: '/employee' },
  ],
  admin: [
    { label: 'Overview', href: '/admin' },
  ],
  recruiter: [
    { label: 'Overview', href: '/recruiter' },
    {
      label: 'Hiring',
      href: '/recruiter/requisitions',
      children: [
        { label: 'Pipeline', href: '/recruiter/pipeline' },
        { label: 'Queue', href: '/recruiter/queue' },
        { label: 'Calendar', href: '/recruiter/calendar' },
      ],
    },
  ],
  master_admin: [
    { label: 'Overview', href: '/master_admin' },
    {
      label: 'Setup',
      href: '/master_admin/org_info',
      children: [
        { label: 'Org info', href: '/master_admin/org_info' },
        { label: 'Billing', href: '/master_admin/billing' },
        { label: 'Assign role', href: '/master_admin/assign_role' },
      ],
    },
  ],
};

export function getPortalNavigation(portal: PortalId) {
  return NAVIGATION[portal];
}
