import { callPgFunction, type GatewayResponse } from '@/lib/gateway';

const GSO_RESOLVE_POST_LOGIN_ROUTE_CONFIG_ID = 'gso-resolve-post-login-route';
const GSO_COMPLETE_STEP_CONFIG_ID = 'gso-complete-step';
const INSERT_ADMIN_INVITES_CONFIG_ID = 'ums_insert_admin_invites';

export interface OwnerRouteResolution {
  success: boolean;
  next_route?: string;
  current_step_code?: string | null;
  blocking_reason_code?: string | null;
  decision?: string;
  commercial_state?: {
    gate_status?: string;
    billing_state?: string;
    payment_state?: string;
    explanation?: {
      plan_code?: string;
      included_employee_count?: number;
      billing_state?: string;
      payment_state?: string;
      usage_state?: string;
    };
    allowed_capabilities?: {
      max_free_employees?: number;
      billing_enabled?: boolean;
    };
  };
  journey_state?: {
    current_route?: string;
    current_step_code?: string;
    completion_percent?: number;
    pending_step_codes?: string[];
    completed_step_codes?: string[];
  };
  step_statuses?: Array<{
    step_code: string;
    sequence_no: number;
    step_status: string;
    last_blocking_reason_code?: string | null;
  }>;
}

export interface DirectAdminInviteInput {
  name: string;
  email: string;
  mobile: string;
}

function buildOwnerSetupParams(tenantId: string) {
  return {
    tenant_id: tenantId,
    portal_code: 'master_admin',
    role_scope: 'master_admin',
    role_code: 'master_admin',
  };
}

export async function resolveOwnerSetupRoute(accessToken: string, tenantId: string) {
  return callPgFunction<OwnerRouteResolution>(
    GSO_RESOLVE_POST_LOGIN_ROUTE_CONFIG_ID,
    buildOwnerSetupParams(tenantId),
    accessToken,
  );
}

export async function completeOwnerSetupStep(
  accessToken: string,
  tenantId: string,
  stepCode: string,
  outputPayload: Record<string, unknown> = {},
): Promise<GatewayResponse<unknown>> {
  return callPgFunction(
    GSO_COMPLETE_STEP_CONFIG_ID,
    {
      ...buildOwnerSetupParams(tenantId),
      step_code: stepCode,
      output_payload: outputPayload,
    },
    accessToken,
  );
}

export async function createDirectAdminInvite(
  accessToken: string,
  tenantId: string,
  invite: DirectAdminInviteInput,
): Promise<GatewayResponse<unknown>> {
  return callPgFunction(
    INSERT_ADMIN_INVITES_CONFIG_ID,
    {
      tenant_id: tenantId,
      user_roles_data: [
        {
          userId: null,
          name: invite.name.trim(),
          email_users_roles: invite.email.trim().toLowerCase(),
          mobile: invite.mobile.trim(),
          role: 'admin',
        },
      ],
    },
    accessToken,
  );
}
