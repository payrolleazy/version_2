import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AdminStepStatus {
  step_code: string;
  sequence_no: number;
  step_status: string;
  last_blocking_reason_code?: string | null;
}

export interface AdminJourneyState {
  current_route?: string | null;
  current_step_code?: string | null;
  completion_percent?: number | null;
  pending_step_codes?: string[];
  completed_step_codes?: string[];
}

export interface AdminCommercialState {
  gate_status?: string | null;
  billing_state?: string | null;
  payment_state?: string | null;
  explanation?: {
    plan_code?: string | null;
    included_employee_count?: number | null;
    billing_state?: string | null;
    payment_state?: string | null;
    usage_state?: string | null;
  };
}

export interface AdminRouteResolution {
  decision?: string | null;
  next_route?: string | null;
  current_step_code?: string | null;
  blocking_reason_code?: string | null;
  journey_state?: AdminJourneyState | null;
  commercial_state?: AdminCommercialState | null;
  step_statuses?: AdminStepStatus[];
}

function asObject(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '') : [];
}

function normalizeStepStatus(entry: unknown): AdminStepStatus | null {
  const row = asObject(entry);
  const stepCode = asString(row.step_code);
  const sequenceNo = asNumber(row.sequence_no);
  const stepStatus = asString(row.step_status);

  if (!stepCode || sequenceNo === null || !stepStatus) {
    return null;
  }

  return {
    step_code: stepCode,
    sequence_no: sequenceNo,
    step_status: stepStatus,
    last_blocking_reason_code: asString(row.last_blocking_reason_code),
  };
}

export async function readAdminRouteResolution(tenantId: string): Promise<AdminRouteResolution | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc('gso_resolve_post_login_route', {
    p_params: {
      tenant_id: tenantId,
      portal_code: 'admin',
      role_scope: 'admin',
      role_code: 'admin',
    },
  });

  if (error) {
    return null;
  }

  const payload = asObject(data);
  const journey = asObject(payload.journey_state);
  const commercial = asObject(payload.commercial_state);
  const explanation = asObject(commercial.explanation);
  const stepStatuses = Array.isArray(payload.step_statuses)
    ? payload.step_statuses.map((entry) => normalizeStepStatus(entry)).filter((entry): entry is AdminStepStatus => entry !== null)
    : [];

  return {
    decision: asString(payload.decision),
    next_route: asString(payload.next_route),
    current_step_code: asString(payload.current_step_code),
    blocking_reason_code: asString(payload.blocking_reason_code),
    journey_state: {
      current_route: asString(journey.current_route),
      current_step_code: asString(journey.current_step_code),
      completion_percent: asNumber(journey.completion_percent),
      pending_step_codes: asStringArray(journey.pending_step_codes),
      completed_step_codes: asStringArray(journey.completed_step_codes),
    },
    commercial_state: {
      gate_status: asString(commercial.gate_status),
      billing_state: asString(commercial.billing_state),
      payment_state: asString(commercial.payment_state),
      explanation: {
        plan_code: asString(explanation.plan_code),
        included_employee_count: asNumber(explanation.included_employee_count),
        billing_state: asString(explanation.billing_state),
        payment_state: asString(explanation.payment_state),
        usage_state: asString(explanation.usage_state),
      },
    },
    step_statuses: stepStatuses,
  };
}

export async function resolveAdminStepRoute(tenantId: string) {
  const payload = await readAdminRouteResolution(tenantId);
  return payload?.next_route ?? null;
}
