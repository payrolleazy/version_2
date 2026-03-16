import { callPgFunction, callReadGateway, type GatewayResponse } from '@/lib/gateway';

const GET_RECRUITER_DASHBOARD = 'rcm-get-recruiter-dashboard';

const RXP_READ_CONFIGS = {
  REQUISITION_PIPELINE_BINDING: 'rxp-read-requisition-pipeline-binding',
  CANDIDATE_PIPELINE_STATE: 'rxp-read-candidate-pipeline-state',
  INTERVIEW_PLAN: 'rxp-read-interview-plan',
  INTERVIEW_FEEDBACK: 'rxp-read-interview-feedback',
  OFFER: 'rxp-read-offer',
  CONVERSION_STATE: 'rxp-read-conversion-state',
} as const;

export interface RecruiterDashboardStatusItem {
  application_status: string;
  count: number;
}

export interface RecruiterDashboardInterviewItem {
  id: string;
  candidate_pipeline_state_id: string;
  round_code: string | null;
  status: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
}

export interface RecruiterDashboardOfferItem {
  offer_status: string;
  count: number;
}

export interface RecruiterDashboardResponse {
  success: boolean;
  tenant_id?: string | null;
  user_id?: string | null;
  is_admin?: boolean;
  open_requisition_count?: number;
  candidate_status_summary?: RecruiterDashboardStatusItem[];
  upcoming_interviews?: RecruiterDashboardInterviewItem[];
  pending_feedback_count?: number;
  offer_summary?: RecruiterDashboardOfferItem[];
}

export interface RequisitionBindingRow {
  id: string;
  tenant_id: string;
  requisition_uuid: string;
  pipeline_template_id: string | null;
  pipeline_status: string | null;
  owner_user_id: string | null;
  opened_at: string | null;
  closed_at: string | null;
  meta: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CandidatePipelineRow {
  id: string;
  candidate_bridge_id: string | null;
  requisition_uuid: string | null;
  pipeline_binding_id?: string | null;
  current_stage_code: string | null;
  application_status: string | null;
  owner_user_id: string | null;
  current_score: number | string | null;
  source_code: string | null;
  source_metadata: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InterviewPlanRow {
  id: string;
  candidate_pipeline_state_id: string;
  round_code: string | null;
  status: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  panel_json: Record<string, unknown> | null;
  meeting_payload: Record<string, unknown> | null;
  created_by?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InterviewFeedbackRow {
  id: string;
  interview_plan_id: string;
  evaluator_user_id: string | null;
  feedback_status: string | null;
  recommendation: string | null;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OfferRow {
  id: string;
  candidate_pipeline_state_id: string;
  offer_status: string | null;
  offer_version: number | null;
  expiry_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConversionRow {
  id: string;
  candidate_pipeline_state_id: string;
  conversion_status: string | null;
  signup_job_id: string | null;
  eoap_workflow_id: string | null;
  last_error: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchRecruiterDashboard(
  accessToken: string,
): Promise<GatewayResponse<RecruiterDashboardResponse>> {
  return callPgFunction<RecruiterDashboardResponse>(GET_RECRUITER_DASHBOARD, {}, accessToken);
}

export async function fetchRecruiterRequisitions(
  accessToken: string,
  limit = 100,
): Promise<GatewayResponse<RequisitionBindingRow[]>> {
  return callReadGateway<RequisitionBindingRow[]>(
    RXP_READ_CONFIGS.REQUISITION_PIPELINE_BINDING,
    { limit },
    accessToken,
  );
}

export async function fetchRecruiterCandidatePipeline(
  accessToken: string,
  limit = 150,
): Promise<GatewayResponse<CandidatePipelineRow[]>> {
  return callReadGateway<CandidatePipelineRow[]>(
    RXP_READ_CONFIGS.CANDIDATE_PIPELINE_STATE,
    { limit },
    accessToken,
  );
}

export async function fetchRecruiterInterviewPlans(
  accessToken: string,
  limit = 100,
): Promise<GatewayResponse<InterviewPlanRow[]>> {
  return callReadGateway<InterviewPlanRow[]>(RXP_READ_CONFIGS.INTERVIEW_PLAN, { limit }, accessToken);
}

export async function fetchRecruiterInterviewFeedback(
  accessToken: string,
  limit = 100,
): Promise<GatewayResponse<InterviewFeedbackRow[]>> {
  return callReadGateway<InterviewFeedbackRow[]>(RXP_READ_CONFIGS.INTERVIEW_FEEDBACK, { limit }, accessToken);
}

export async function fetchRecruiterOffers(
  accessToken: string,
  limit = 100,
): Promise<GatewayResponse<OfferRow[]>> {
  return callReadGateway<OfferRow[]>(RXP_READ_CONFIGS.OFFER, { limit }, accessToken);
}

export async function fetchRecruiterConversions(
  accessToken: string,
  limit = 100,
): Promise<GatewayResponse<ConversionRow[]>> {
  return callReadGateway<ConversionRow[]>(RXP_READ_CONFIGS.CONVERSION_STATE, { limit }, accessToken);
}
