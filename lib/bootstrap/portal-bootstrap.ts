import type { PortalId } from '@/lib/auth/role-map';
import type { ServerAuthSnapshot } from '@/lib/auth/session';
import type { PortalAccessContext } from '@/lib/auth/portal-access';
import { getPortalNavigation } from '@/lib/navigation/portal-nav';

export interface PortalBootstrap {
  portal: PortalId;
  roleId: string | null;
  roleName: string | null;
  tenantId: string | null;
  userName: string;
  userEmail: string;
  navigation: ReturnType<typeof getPortalNavigation>;
}

export function buildPortalBootstrap(
  snapshot: ServerAuthSnapshot,
  portal: PortalId,
  access: PortalAccessContext,
): PortalBootstrap {
  return {
    portal,
    roleId: access.effectiveRoleId ?? snapshot.roleId,
    roleName: access.effectiveRole,
    tenantId: access.tenantId,
    userName: snapshot.user?.user_metadata?.full_name ?? snapshot.user?.email?.split('@')[0] ?? 'User',
    userEmail: snapshot.user?.email ?? '',
    navigation: getPortalNavigation(portal),
  };
}
