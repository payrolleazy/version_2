import type { ServerAuthSnapshot } from '@/lib/auth/session';
import type { PortalId } from '@/lib/auth/role-map';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface PortalAccessContext {
  allowed: boolean;
  reason: 'ok' | 'env-missing' | 'unauthenticated' | 'forbidden' | 'invalid-portal' | 'rpc-error';
  portal: PortalId;
  effectiveRoleId: string | null;
  effectiveRole: string | null;
  tenantId: string | null;
  matchedRoles: Array<{
    tenantId: string;
    roleId: string;
    role: string;
  }>;
}

type UserRoleRow = {
  tenant_id: string;
  roleId: string;
  role: string;
  updated_at?: string | null;
  date_of_creation?: string | null;
};

type EmploymentRow = {
  user_id: string;
  tenant_id: string;
  dol?: string | null;
};

type RoleBoundPortal = 'employee' | 'admin' | 'master_admin';

function fallbackAccess(portal: PortalId, reason: PortalAccessContext['reason']): PortalAccessContext {
  return {
    allowed: false,
    reason,
    portal,
    effectiveRoleId: null,
    effectiveRole: null,
    tenantId: null,
    matchedRoles: [],
  };
}

function isMatchedRole(item: unknown): item is { tenantId: string; roleId: string; role: string } {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const record = item as Record<string, unknown>;

  return (
    typeof record.tenantId === 'string' &&
    typeof record.roleId === 'string' &&
    typeof record.role === 'string'
  );
}

function isUserRoleRow(item: unknown): item is UserRoleRow {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const record = item as Record<string, unknown>;

  return (
    typeof record.tenant_id === 'string' &&
    typeof record.roleId === 'string' &&
    typeof record.role === 'string'
  );
}

function isEmploymentRow(item: unknown): item is EmploymentRow {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const record = item as Record<string, unknown>;

  return typeof record.user_id === 'string' && typeof record.tenant_id === 'string';
}

function compareNullableDateDesc(left?: string | null, right?: string | null) {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  const leftTs = new Date(left).getTime();
  const rightTs = new Date(right).getTime();

  if (Number.isNaN(leftTs) && Number.isNaN(rightTs)) return 0;
  if (Number.isNaN(leftTs)) return 1;
  if (Number.isNaN(rightTs)) return -1;

  return rightTs - leftTs;
}

function sortRoleRows(rows: UserRoleRow[]) {
  return [...rows].sort((left, right) => {
    const updatedCompare = compareNullableDateDesc(left.updated_at, right.updated_at);
    if (updatedCompare !== 0) return updatedCompare;

    const createdCompare = compareNullableDateDesc(left.date_of_creation, right.date_of_creation);
    if (createdCompare !== 0) return createdCompare;

    return left.tenant_id.localeCompare(right.tenant_id);
  });
}

function toMatchedRoles(rows: UserRoleRow[]) {
  return rows.map((row) => ({
    tenantId: row.tenant_id,
    roleId: row.roleId,
    role: row.role.toLowerCase(),
  }));
}

function buildAllowedContext(portal: PortalId, rows: UserRoleRow[]): PortalAccessContext {
  const matchedRoles = toMatchedRoles(sortRoleRows(rows));
  const chosen = matchedRoles[0];

  return {
    allowed: true,
    reason: 'ok',
    portal,
    effectiveRoleId: chosen.roleId,
    effectiveRole: chosen.role,
    tenantId: chosen.tenantId,
    matchedRoles,
  };
}

async function getRoleBoundPortalAccessContext(
  snapshot: ServerAuthSnapshot,
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  portal: RoleBoundPortal,
): Promise<PortalAccessContext> {
  const { data, error } = await supabase
    .from('UserRoles')
    .select('tenant_id, "roleId", role, updated_at, date_of_creation')
    .eq('userId', snapshot.user!.id)
    .eq('enable_disable', '1')
    .eq('role', portal);

  if (error || !Array.isArray(data)) {
    return fallbackAccess(portal, 'rpc-error');
  }

  const roleRows = sortRoleRows(data.filter(isUserRoleRow));

  if (roleRows.length === 0) {
    return fallbackAccess(portal, 'forbidden');
  }

  const tenantIds = [...new Set(roleRows.map((row) => row.tenant_id))];
  const today = new Date().toISOString().slice(0, 10);
  const { data: employmentData, error: employmentError } = await supabase
    .from('emp_active_master')
    .select('user_id, tenant_id, dol')
    .eq('user_id', snapshot.user!.id)
    .in('tenant_id', tenantIds);

  if (employmentError || !Array.isArray(employmentData)) {
    return fallbackAccess(portal, 'rpc-error');
  }

  const activeTenantIds = new Set(
    employmentData
      .filter(isEmploymentRow)
      .filter((row) => !row.dol || row.dol >= today)
      .map((row) => row.tenant_id),
  );

  const matchedRows = roleRows.filter((row) => activeTenantIds.has(row.tenant_id));

  if (matchedRows.length === 0) {
    return fallbackAccess(portal, 'forbidden');
  }

  return buildAllowedContext(portal, matchedRows);
}

export async function getPortalAccessContext(
  snapshot: ServerAuthSnapshot,
  portal: PortalId,
): Promise<PortalAccessContext> {
  if (!snapshot.envReady) {
    return fallbackAccess(portal, 'env-missing');
  }

  if (!snapshot.session || !snapshot.user) {
    return fallbackAccess(portal, 'unauthenticated');
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackAccess(portal, 'env-missing');
  }

  if (portal === 'employee' || portal === 'admin' || portal === 'master_admin') {
    return getRoleBoundPortalAccessContext(snapshot, supabase, portal);
  }

  const { data, error } = await supabase.rpc('app_get_portal_access_context', {
    p_params: { portal },
  });

  if (error || !data || typeof data !== 'object') {
    return fallbackAccess(portal, 'rpc-error');
  }

  const payload = data as Record<string, unknown>;

  return {
    allowed: payload.allowed === true,
    reason: (payload.reason as PortalAccessContext['reason']) ?? 'rpc-error',
    portal,
    effectiveRoleId: typeof payload.effectiveRoleId === 'string' ? payload.effectiveRoleId : null,
    effectiveRole: typeof payload.effectiveRole === 'string' ? payload.effectiveRole : null,
    tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : null,
    matchedRoles: Array.isArray(payload.matchedRoles) ? payload.matchedRoles.filter(isMatchedRole) : [],
  };
}
