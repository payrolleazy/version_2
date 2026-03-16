'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageFrame } from '@/components/ui/PageFrame';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  readCompanyTypes,
  readIndustryTypes,
  readTenantOrgInfo,
  saveTenantOrgInfo,
  type CompanyTypeOption,
  type IndustryTypeOption,
  type TenantOrgInfoRow,
} from '@/lib/master-admin/org-info';
import { resolveOwnerSetupRoute } from '@/lib/master-admin/setup';

type OrgInfoFormState = TenantOrgInfoRow;

function createDefaultForm(tenantId: string, ownerEmail: string | null): OrgInfoFormState {
  return {
    tenant_id: tenantId,
    company_legal_name: '',
    company_display_name: '',
    status: 'active',
    company_type: '',
    industry_type: '',
    registered_address_line1: '',
    registered_city: '',
    registered_state_code: '',
    registered_pincode: '',
    primary_contact_name: '',
    primary_contact_email: ownerEmail,
    primary_contact_phone: '',
    default_timezone: 'Asia/Kolkata',
    default_currency_code: 'INR',
  };
}

function normalizeForm(row: Partial<TenantOrgInfoRow>, tenantId: string, ownerEmail: string | null): OrgInfoFormState {
  const base = createDefaultForm(tenantId, ownerEmail);

  return {
    ...base,
    ...row,
    tenant_id: tenantId,
    primary_contact_email: row.primary_contact_email ?? ownerEmail ?? '',
  };
}

function completionChecks(form: OrgInfoFormState) {
  const requiredValues = [
    form.company_legal_name,
    form.company_display_name,
    form.company_type,
    form.industry_type,
    form.registered_address_line1,
    form.registered_city,
    form.registered_state_code,
    form.registered_pincode,
    form.primary_contact_name,
    form.primary_contact_email,
    form.primary_contact_phone,
    form.default_timezone,
    form.default_currency_code,
  ];

  const completed = requiredValues.filter((value) => typeof value === 'string' && value.trim() !== '').length;

  return {
    completed,
    total: requiredValues.length,
    ready: completed === requiredValues.length,
  };
}

export function MasterAdminOrgInfoSurface({
  tenantId,
  ownerEmail,
}: {
  tenantId: string;
  ownerEmail: string | null;
}) {
  const [form, setForm] = useState<OrgInfoFormState>(() => createDefaultForm(tenantId, ownerEmail));
  const [companyTypes, setCompanyTypes] = useState<CompanyTypeOption[]>([]);
  const [industryTypes, setIndustryTypes] = useState<IndustryTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const progress = useMemo(() => completionChecks(form), [form]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.access_token;
        if (!accessToken) {
          throw new Error('Authentication required to load organization setup.');
        }

        const [tenantResult, companyTypeResult, industryTypeResult] = await Promise.all([
          readTenantOrgInfo(accessToken),
          readCompanyTypes(accessToken),
          readIndustryTypes(accessToken),
        ]);

        if (!tenantResult.success) {
          throw new Error(tenantResult.error ?? 'Could not load organization information.');
        }

        if (!companyTypeResult.success) {
          throw new Error(companyTypeResult.error ?? 'Could not load company type options.');
        }

        if (!industryTypeResult.success) {
          throw new Error(industryTypeResult.error ?? 'Could not load industry type options.');
        }

        if (cancelled) {
          return;
        }

        const existingRow = Array.isArray(tenantResult.data) ? tenantResult.data[0] : null;
        setForm(normalizeForm(existingRow ?? {}, tenantId, ownerEmail));
        setCompanyTypes(Array.isArray(companyTypeResult.data) ? companyTypeResult.data : []);
        setIndustryTypes(Array.isArray(industryTypeResult.data) ? industryTypeResult.data : []);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load organization information.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, ownerEmail]);

  function updateField<Key extends keyof OrgInfoFormState>(field: Key, value: OrgInfoFormState[Key]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setStatusMessage('Saving organization profile...');

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('Authentication required to save organization information.');
      }

      const result = await saveTenantOrgInfo(accessToken, form);

      if (!result.success) {
        throw new Error(result.error ?? 'Could not save organization information.');
      }

      const nextRouteResult = await resolveOwnerSetupRoute(accessToken, tenantId);
      const nextRoute = nextRouteResult.success ? nextRouteResult.data?.next_route : null;

      if (nextRoute && nextRoute !== '/master_admin/org_info') {
        window.location.assign(nextRoute);
        return;
      }

      setStatusMessage(
        progress.ready
          ? 'Organization profile is complete. Proceed to the next setup step.'
          : 'Organization profile was saved.',
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save organization information.');
      setStatusMessage(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageFrame>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Company profile"
            title="Complete the organization setup required for owner onboarding"
            description="This page is the first routed setup step for a newly provisioned client owner. The required fields here match the live GSO organization-profile validator."
          />

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Legal name</span>
                <input
                  value={form.company_legal_name ?? ''}
                  onChange={(event) => updateField('company_legal_name', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Display name</span>
                <input
                  value={form.company_display_name ?? ''}
                  onChange={(event) => updateField('company_display_name', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Company type</span>
                <select
                  value={form.company_type ?? ''}
                  onChange={(event) => updateField('company_type', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                >
                  <option value="">Select company type</option>
                  {companyTypes.map((option) => (
                    <option key={option.id} value={option.company_type}>
                      {option.company_type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Industry type</span>
                <select
                  value={form.industry_type ?? ''}
                  onChange={(event) => updateField('industry_type', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                >
                  <option value="">Select industry type</option>
                  {industryTypes.map((option) => (
                    <option key={option.id} value={option.industry_type}>
                      {option.industry_type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Registered address line 1</span>
                <input
                  value={form.registered_address_line1 ?? ''}
                  onChange={(event) => updateField('registered_address_line1', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">City</span>
                <input
                  value={form.registered_city ?? ''}
                  onChange={(event) => updateField('registered_city', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">State code</span>
                <input
                  value={form.registered_state_code ?? ''}
                  onChange={(event) => updateField('registered_state_code', event.target.value.toUpperCase())}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pincode</span>
                <input
                  value={form.registered_pincode ?? ''}
                  onChange={(event) => updateField('registered_pincode', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Primary contact name</span>
                <input
                  value={form.primary_contact_name ?? ''}
                  onChange={(event) => updateField('primary_contact_name', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Primary contact email</span>
                <input
                  type="email"
                  value={form.primary_contact_email ?? ''}
                  onChange={(event) => updateField('primary_contact_email', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Primary contact phone</span>
                <input
                  value={form.primary_contact_phone ?? ''}
                  onChange={(event) => updateField('primary_contact_phone', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Default timezone</span>
                <input
                  value={form.default_timezone ?? ''}
                  onChange={(event) => updateField('default_timezone', event.target.value)}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Default currency</span>
                <input
                  value={form.default_currency_code ?? ''}
                  onChange={(event) => updateField('default_currency_code', event.target.value.toUpperCase())}
                  className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition focus:border-sky-400"
                  required
                />
              </label>
            </div>

            {statusMessage ? (
              <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {statusMessage}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4">
              <ActionButton type="submit" disabled={isLoading || isSaving}>
                {isSaving ? 'Saving profile...' : 'Save organization profile'}
              </ActionButton>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeader
            eyebrow="Readiness"
            title="Live setup requirement status"
            description="These fields match the current GSO company-profile validator for master admin onboarding."
          />

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Completion</p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {progress.completed}/{progress.total}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {progress.ready
                  ? 'The required organization profile fields are complete.'
                  : 'Complete the remaining required organization fields to unlock the next setup step.'}
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Tenant context</p>
              <p className="mt-2 break-all text-sm font-black text-slate-950">{tenantId}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This page is bound to the tenant created during the live client-owner provisioning flow.
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  );
}
