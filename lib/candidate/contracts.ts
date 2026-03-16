import { callPgFunction, type GatewayResponse } from '@/lib/gateway';

const EOAP_GATEWAY_CONFIGS = {
  EMP_ONBOARDING_STATUS: 'emp-onboarding-dashboard-data',
  CANDIDATE_MARK_LETTER_READ: 'candidate-mark-letter-read',
} as const;

const CXP_GATEWAY_CONFIGS = {
  GET_LAUNCHPAD: 'cxp-get-candidate-launchpad',
  GET_DOCUMENT_REQUIREMENTS: 'cxp-get-candidate-document-requirements',
  GET_OFFER_ROOM: 'cxp-get-offer-room',
  GET_INTERVIEW_CONSOLE: 'cxp-get-candidate-interview-console',
  ACKNOWLEDGE_LETTER: 'cxp-acknowledge-letter',
} as const;

export interface CandidateLaunchpadIssue {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'blocking' | string;
  issue_code: string;
  resolution_hint?: string | null;
}

export interface CandidateOfferRoomAcknowledgement {
  acknowledgement_type: string;
  acknowledged_at: string | null;
  acknowledgement_payload?: Record<string, unknown> | null;
}

export interface CandidateOfferRoomLetter {
  id: string;
  letter_type: string;
  letter_title: string;
  html_content: string;
  shared_by: string;
  shared_at: string;
  is_read: boolean;
  read_at: string | null;
  status: string;
  template_name: string | null;
  shared_by_email: string | null;
  room_status: 'new' | 'read' | 'acknowledged' | string;
  acknowledgement?: CandidateOfferRoomAcknowledgement | null;
}

export interface CandidateDocumentGroup {
  sub_folder: string;
  total_documents: number;
  required_documents: number;
  uploaded_documents: number;
  pending_required_documents: number;
  documents: Array<{
    document_key: string;
    description: string | null;
    is_required: boolean;
    is_uploaded: boolean;
    file_count: number;
    last_uploaded_at: string | null;
  }>;
}

export interface CandidateDocumentRequirementsResponse {
  success: boolean;
  tenant_id?: string | null;
  candidate_user_id?: string | null;
  summary?: {
    total_documents?: number | null;
    required_documents?: number | null;
    uploaded_documents?: number | null;
    completion_percentage?: number | null;
    pending_required_documents?: number | null;
  };
  groups?: CandidateDocumentGroup[];
}

export interface CandidateLaunchpadResponse {
  success: boolean;
  candidate_name?: string | null;
  summary?: {
    overall_status?: string | null;
    overall_score?: number | null;
    next_recommended_action?: string | null;
    pending_required_documents?: number | null;
    unread_letters?: number | null;
    unread_notifications?: number | null;
    actionable_notifications?: number | null;
    day0_packet_status?: string | null;
  };
  readiness?: {
    success?: boolean;
    issues?: CandidateLaunchpadIssue[];
    snapshot?: {
      overall_status?: string | null;
      overall_score?: number | null;
      next_recommended_action?: string | null;
    };
  };
  documents?: {
    success?: boolean;
    summary?: {
      total_documents?: number | null;
      required_documents?: number | null;
      uploaded_documents?: number | null;
      completion_percentage?: number | null;
      pending_required_documents?: number | null;
    };
    groups?: CandidateDocumentGroup[];
  };
  offer_room?: {
    success?: boolean;
    unread_count?: number | null;
    read_count?: number | null;
    acknowledged_count?: number | null;
    letters?: unknown[];
  };
  day0_packet?: {
    success?: boolean;
    packet?: {
      packet_status?: string | null;
      joining_date?: string | null;
      packet_json?: {
        candidate_name?: string | null;
        position?: {
          position_id?: number | null;
        };
        reporting_manager?: {
          manager_name?: string | null;
          manager_email?: string | null;
        };
      };
    };
  };
  notifications?: {
    unread_count?: number | null;
    actionable_count?: number | null;
  };
}

export interface CandidateInterviewConsoleItem {
  interview_plan_id: string;
  round_code: string | null;
  status: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  meeting_provider: string | null;
  join_url: string | null;
  meeting_label: string | null;
  instructions: string | null;
  contact_name: string | null;
  contact_email: string | null;
}

export interface CandidateInterviewConsoleResponse {
  success: boolean;
  has_interview?: boolean;
  message?: string | null;
  candidate?: {
    candidate_user_id?: string | null;
    candidate_name?: string | null;
    position_title?: string | null;
    application_status?: string | null;
  };
  primary_interview?: CandidateInterviewConsoleItem | null;
  upcoming_interviews?: CandidateInterviewConsoleItem[];
}

export interface CandidateOnboardingStatusResponse {
  onboarding_documentation?: {
    total_fields_tracked?: number | null;
    fields_filled?: number | null;
    fields_empty?: number | null;
    completion_percentage?: number | null;
    empty_fields?: string[];
  };
}

export async function fetchCandidateLaunchpad(
  accessToken: string,
  refresh = true,
): Promise<GatewayResponse<CandidateLaunchpadResponse>> {
  return callPgFunction<CandidateLaunchpadResponse>(
    CXP_GATEWAY_CONFIGS.GET_LAUNCHPAD,
    { refresh },
    accessToken,
  );
}

export async function fetchCandidateDocumentRequirements(
  accessToken: string,
): Promise<GatewayResponse<CandidateDocumentRequirementsResponse>> {
  return callPgFunction<CandidateDocumentRequirementsResponse>(
    CXP_GATEWAY_CONFIGS.GET_DOCUMENT_REQUIREMENTS,
    {},
    accessToken,
  );
}

export async function fetchCandidateOfferRoom(
  accessToken: string,
): Promise<GatewayResponse<{
  success: boolean;
  unread_count?: number | null;
  read_count?: number | null;
  acknowledged_count?: number | null;
  letters?: CandidateOfferRoomLetter[];
}>> {
  return callPgFunction(
    CXP_GATEWAY_CONFIGS.GET_OFFER_ROOM,
    {},
    accessToken,
  );
}

export async function markCandidateLetterRead(
  accessToken: string,
  letterId: string,
): Promise<GatewayResponse<{ success: boolean }>> {
  return callPgFunction<{ success: boolean }>(
    EOAP_GATEWAY_CONFIGS.CANDIDATE_MARK_LETTER_READ,
    { letter_id: letterId },
    accessToken,
  );
}

export async function fetchCandidateInterviewConsole(
  accessToken: string,
): Promise<GatewayResponse<CandidateInterviewConsoleResponse>> {
  return callPgFunction<CandidateInterviewConsoleResponse>(
    CXP_GATEWAY_CONFIGS.GET_INTERVIEW_CONSOLE,
    {},
    accessToken,
  );
}

export async function fetchCandidateOnboardingStatus(
  accessToken: string,
): Promise<GatewayResponse<CandidateOnboardingStatusResponse>> {
  return callPgFunction<CandidateOnboardingStatusResponse>(
    EOAP_GATEWAY_CONFIGS.EMP_ONBOARDING_STATUS,
    {},
    accessToken,
  );
}

export async function acknowledgeCandidateLetter(
  accessToken: string,
  letterId: string,
  acknowledgementType = 'acknowledged',
  acknowledgementPayload: Record<string, unknown> = {},
): Promise<GatewayResponse<{
  success: boolean;
  letter_id?: string;
  acknowledgement_type?: string;
  acknowledged_at?: string;
}>> {
  return callPgFunction(
    CXP_GATEWAY_CONFIGS.ACKNOWLEDGE_LETTER,
    {
      letter_id: letterId,
      acknowledgement_type: acknowledgementType,
      acknowledgement_payload: acknowledgementPayload,
    },
    accessToken,
  );
}



