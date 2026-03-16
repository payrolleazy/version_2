import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface MasterAdminTenantUser {
  id: string;
  userId: string | null;
  tenantId: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  enableDisable: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface PendingRoleAssignmentRequest {
  id: string;
  userIdToAssign: string | null;
  roleNameToAssign: string | null;
  status: string | null;
  createdAt: string | null;
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function normalizeTenantUser(row: Record<string, unknown>): MasterAdminTenantUser {
  return {
    id: String(row.id ?? ''),
    userId: asString(row.userId),
    tenantId: String(row.tenant_id ?? ''),
    name: asString(row.name),
    email: asString(row.email_users_roles),
    mobile: asString(row.mobile),
    role: String(row.role ?? ''),
    enableDisable: asString(row.enable_disable),
    updatedAt: asString(row.updated_at),
    createdAt: asString(row.date_of_creation),
  };
}

function normalizePendingRequest(row: Record<string, unknown>): PendingRoleAssignmentRequest {
  return {
    id: String(row.id ?? ''),
    userIdToAssign: asString(row.user_id_to_assign),
    roleNameToAssign: asString(row.role_name_to_assign),
    status: asString(row.status),
    createdAt: asString(row.created_at),
  };
}

export async function readMasterAdminHandoffData(tenantId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      admins: [] as MasterAdminTenantUser[],
      pendingAdminInvites: [] as MasterAdminTenantUser[],
      legacyPendingRequests: [] as PendingRoleAssignmentRequest[],
    };
  }

  const { data: userRows } = await supabase
    .from('UserRoles')
    .select('id, "userId", tenant_id, name, email_users_roles, mobile, role, enable_disable, updated_at, date_of_creation')
    .eq('tenant_id', tenantId)
    .eq('enable_disable', '1')
    .order('updated_at', { ascending: false });

  const users = Array.isArray(userRows)
    ? userRows.map((row) => normalizeTenantUser(row as Record<string, unknown>))
    : [];

  const admins = users.filter((row) => row.role === 'admin' && !!row.userId);
  const pendingAdminInvites = users.filter((row) => row.role === 'admin' && !row.userId);

  let legacyPendingRequests: PendingRoleAssignmentRequest[] = [];
  const { data: requestRows } = await supabase
    .from('role_assignment_requests')
    .select('id, user_id_to_assign, role_name_to_assign, status, created_at')
    .eq('tenant_id', tenantId)
    .eq('role_name_to_assign', 'admin')
    .order('created_at', { ascending: false })
    .limit(10);

  if (Array.isArray(requestRows)) {
    legacyPendingRequests = requestRows
      .map((row) => normalizePendingRequest(row as Record<string, unknown>))
      .filter((row) => row.status !== 'completed');
  }

  return {
    admins,
    pendingAdminInvites,
    legacyPendingRequests,
  };
}
