import {
  callBulkUpsertGateway,
  callReadGateway,
  type GatewayResponse,
} from '@/lib/gateway';

const TENANT_READ_CONFIG_ID = '80e992fe-9d7c-4ab4-b89d-4999ceae2e79';
const TENANT_UPSERT_CONFIG_ID = '1cf17375-6c2a-45a9-a5f4-d9d5510740f7';
const COMPANY_TYPE_READ_CONFIG_ID = 'd59c5da7-a204-473e-9134-ab1ddbc69e7e';
const INDUSTRY_TYPE_READ_CONFIG_ID = '374b0e27-cce2-44fa-ba9a-a5a1fb8b7043';

export interface TenantOrgInfoRow {
  tenant_id: string;
  company_legal_name: string | null;
  company_display_name: string | null;
  status: string | null;
  company_type: string | null;
  industry_type: string | null;
  registered_address_line1: string | null;
  registered_city: string | null;
  registered_state_code: string | null;
  registered_pincode: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  default_timezone: string | null;
  default_currency_code: string | null;
  updated_at?: string | null;
}

export interface CompanyTypeOption {
  id: number;
  company_type: string;
}

export interface IndustryTypeOption {
  id: string;
  industry_type: string;
}

export async function readTenantOrgInfo(accessToken: string) {
  return callReadGateway<TenantOrgInfoRow[]>(TENANT_READ_CONFIG_ID, { limit: 1 }, accessToken);
}

export async function readCompanyTypes(accessToken: string) {
  return callReadGateway<CompanyTypeOption[]>(COMPANY_TYPE_READ_CONFIG_ID, {}, accessToken);
}

export async function readIndustryTypes(accessToken: string) {
  return callReadGateway<IndustryTypeOption[]>(INDUSTRY_TYPE_READ_CONFIG_ID, {}, accessToken);
}

export async function saveTenantOrgInfo(
  accessToken: string,
  row: TenantOrgInfoRow,
): Promise<GatewayResponse<unknown>> {
  return callBulkUpsertGateway(
    TENANT_UPSERT_CONFIG_ID,
    {
      input_rows: [
        {
          ...row,
          updated_at: new Date().toISOString(),
        },
      ],
    },
    accessToken,
  );
}
