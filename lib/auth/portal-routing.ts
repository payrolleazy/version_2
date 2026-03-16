import type { PortalId } from '@/lib/auth/role-map';
import { PORTAL_ROOT_PATH, ROLE_IDS } from '@/lib/auth/role-map';
import type { ServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext, type PortalAccessContext } from '@/lib/auth/portal-access';
import { resolveAdminStepRoute } from '@/lib/admin/route-resolution';
import { resolveMasterAdminStepRoute } from '@/lib/master-admin/route-resolution';

export interface PortalResolution {
  portal: PortalId;
  href: string;
  access: PortalAccessContext;
}

export interface PortalRestriction {
  requestedPortal: PortalId | null;
  suggestedPortals: PortalId[];
}

export type PortalResolutionResult =
  | {
      kind: 'allowed';
      portal: PortalId;
      href: string;
      access: PortalAccessContext;
    }
  | {
      kind: 'restricted';
      requestedPortal: PortalId | null;
      suggestedPortals: PortalId[];
    };

const PORTAL_SUGGESTION_ORDER: PortalId[] = ['employee', 'admin', 'recruiter', 'master_admin', 'candidate'];

function roleHintToPortal(roleId: string | null): PortalId | null {
  if (roleId === ROLE_IDS.MASTER_ADMIN) {
    return 'master_admin';
  }

  if (roleId === ROLE_IDS.ADMIN) {
    return 'admin';
  }

  if (roleId === ROLE_IDS.EMPLOYEE) {
    return 'employee';
  }

  if (roleId === ROLE_IDS.RECRUITER) {
    return 'recruiter';
  }

  if (roleId === ROLE_IDS.CANDIDATE) {
    return 'candidate';
  }

  return null;
}

async function resolvePortalHref(portal: PortalId, access: PortalAccessContext) {
  if (portal === 'master_admin' && access.tenantId) {
    return (await resolveMasterAdminStepRoute(access.tenantId)) ?? PORTAL_ROOT_PATH[portal];
  }

  if (portal === 'admin' && access.tenantId) {
    return (await resolveAdminStepRoute(access.tenantId)) ?? PORTAL_ROOT_PATH[portal];
  }

  return PORTAL_ROOT_PATH[portal];
}

async function listSuggestedPortals(snapshot: ServerAuthSnapshot, excludedPortal?: PortalId) {
  const accessEntries = await Promise.all(
    PORTAL_SUGGESTION_ORDER
      .filter((portal) => portal !== excludedPortal)
      .map(async (portal) => [portal, await getPortalAccessContext(snapshot, portal)] as const),
  );

  return accessEntries
    .filter((entry) => entry[1].allowed)
    .map((entry) => entry[0]);
}

export async function resolvePortalDestination(
  snapshot: ServerAuthSnapshot,
): Promise<PortalResolutionResult> {
  const requestedPortal = roleHintToPortal(snapshot.roleId);

  if (!requestedPortal) {
    return {
      kind: 'restricted',
      requestedPortal: null,
      suggestedPortals: await listSuggestedPortals(snapshot),
    };
  }

  const access = await getPortalAccessContext(snapshot, requestedPortal);

  if (access.allowed) {
    return {
      kind: 'allowed',
      portal: requestedPortal,
      href: await resolvePortalHref(requestedPortal, access),
      access,
    };
  }

  return {
    kind: 'restricted',
    requestedPortal,
    suggestedPortals: await listSuggestedPortals(snapshot, requestedPortal),
  };
}
