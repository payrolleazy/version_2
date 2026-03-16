export const ROLE_IDS = {
  EMPLOYEE: '9e9942d7-0d41-4405-8546-e32e155d4d2c',
  CANDIDATE: '390c05eb-2f6a-474e-957d-3496458f388a',
  ADMIN: 'd971edc1-ed25-4697-95bf-3a8f1ab43467',
  RECRUITER: '65c6e2cc-bf39-4c00-8405-0c32ac5d93f1',
  SUPER_ADMIN: '95b1c199-b3c1-428e-bbb4-0722429f3c96',
  MASTER_ADMIN: '9d498d99-120a-4a98-871f-19e0e876d64d',
  PAYROLL_ADMIN: 'dbbeefb8-985b-49f4-94a5-6f3a8a3c1ce6',
} as const;

export type PortalId = 'candidate' | 'employee' | 'admin' | 'recruiter' | 'master_admin';

export const PORTAL_ALLOWED_ROLES: Record<PortalId, string[]> = {
  candidate: [ROLE_IDS.CANDIDATE],
  employee: [ROLE_IDS.EMPLOYEE],
  admin: [ROLE_IDS.ADMIN],
  recruiter: [ROLE_IDS.RECRUITER, ROLE_IDS.ADMIN, ROLE_IDS.MASTER_ADMIN],
  master_admin: [ROLE_IDS.MASTER_ADMIN],
};

export const PORTAL_ROOT_PATH: Record<PortalId, string> = {
  candidate: '/candidate',
  employee: '/employee',
  admin: '/admin',
  recruiter: '/recruiter',
  master_admin: '/master_admin',
};

export const PORTAL_LABEL: Record<PortalId, string> = {
  candidate: 'Candidate',
  employee: 'Employee',
  admin: 'Admin',
  recruiter: 'Recruiter',
  master_admin: 'Master Admin',
};
