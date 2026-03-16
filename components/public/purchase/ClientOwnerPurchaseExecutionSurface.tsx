'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicSectionCard } from '@/components/public/PublicSection';
import { ActionButton, ActionLink } from '@/components/ui/ActionButton';
import { invokePublicEdgeFunction } from '@/lib/public-client/functions';

type PurchaseInitiateResponse = {
  success: true;
  provisioning_id: string;
  public_checkout_id: string;
  selected_plan_code: string;
  short_url?: string;
  status: string;
  purchase_activation_token?: string;
  next_step?: string;
  expires_at?: string;
};

type PurchaseResolveResponse = {
  success: true;
  status: string;
  provisioning_id: string;
  public_checkout_id: string;
  purchase_activation_token?: string;
};

type ProvisionActivateResponse = {
  success: true;
  status: string;
  next_route?: string;
  next_step?: string;
  credential_setup_token?: string;
  provisioning_id?: string;
};

type PendingPurchaseState = {
  provisioningId: string;
  publicCheckoutId: string;
  primaryWorkEmail: string;
  selectedPlanCode: string;
};

const STORAGE_KEY = 'payrolleazy_client_purchase_pending';

const PLAN_OPTIONS = [
  {
    code: 'starter_free_200',
    label: 'Starter Free 200',
    detail: 'Current live active commercial plan in the backend catalog.',
  },
] as const;

const MODULE_OPTIONS = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'recruitment', label: 'Recruitment' },
] as const;

const PAIN_POINT_OPTIONS = [
  { value: 'manual_attendance', label: 'Manual attendance work' },
  { value: 'leave_visibility', label: 'Leave visibility gaps' },
  { value: 'payroll_complexity', label: 'Payroll complexity' },
  { value: 'recruitment_fragmentation', label: 'Recruitment fragmentation' },
] as const;

const COUNTRY_OPTIONS = ['India'] as const;
const ADOPTION_OPTIONS = [
  { value: 'diy', label: 'DIY rollout' },
  { value: 'guided', label: 'Guided rollout' },
] as const;
const GROWTH_BAND_OPTIONS = ['0_200', '201_500', '501_1000', '1000_plus'] as const;

function readPendingPurchase(): PendingPurchaseState | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingPurchaseState;
    if (!parsed.provisioningId || !parsed.publicCheckoutId || !parsed.primaryWorkEmail || !parsed.selectedPlanCode) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePendingPurchase(value: PendingPurchaseState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function clearPendingPurchase() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function appendEmailToRoute(nextRoute: string, email: string) {
  const url = new URL(nextRoute, window.location.origin);
  url.searchParams.set('email', email);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function ClientOwnerPurchaseExecutionSurface() {
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryWorkEmail, setPrimaryWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryOrRegion, setCountryOrRegion] = useState<string>(COUNTRY_OPTIONS[0]);
  const [estimatedEmployeeCount, setEstimatedEmployeeCount] = useState('75');
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(PLAN_OPTIONS[0].code);
  const [growthBand, setGrowthBand] = useState<string>(GROWTH_BAND_OPTIONS[0]);
  const [adoptionMode, setAdoptionMode] = useState<string>(ADOPTION_OPTIONS[0].value);
  const [migrationSource, setMigrationSource] = useState('');
  const [hasBiometricSetup, setHasBiometricSetup] = useState(false);
  const [modulesOfInterest, setModulesOfInterest] = useState<string[]>(['attendance', 'leave']);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingReturn, setIsResolvingReturn] = useState(false);

  async function continueOwnerActivation(provisioningId: string, purchaseActivationToken: string, email: string) {
    const activationPayload = await invokePublicEdgeFunction<ProvisionActivateResponse>('client-owner-provision', {
      action: 'activate_after_purchase',
      provisioning_id: provisioningId,
      purchase_activation_token: purchaseActivationToken,
    });

    if (activationPayload.next_route) {
      clearPendingPurchase();
      const target = appendEmailToRoute(activationPayload.next_route, email);
      window.location.assign(target);
      return true;
    }

    setStatusMessage(`Activation state: ${activationPayload.status}`);
    return false;
  }

  useEffect(() => {
    let cancelled = false;

    async function handleReturnFlow() {
      const isCheckoutReturn = searchParams.get('checkout_return') === '1';
      const isCheckoutCancelled = searchParams.get('checkout_cancelled') === '1';

      if (isCheckoutCancelled) {
        setStatusMessage('Checkout was cancelled before activation. You can submit again when ready.');
      }

      if (!isCheckoutReturn) {
        return;
      }

      const pending = readPendingPurchase();
      if (!pending) {
        setError('Could not recover the pending checkout state for this browser session. Start the purchase flow again.');
        return;
      }

      setIsResolvingReturn(true);
      setError(null);
      setStatusMessage('Verifying payment and preparing owner activation...');

      try {
        const resolvePayload = await invokePublicEdgeFunction<PurchaseResolveResponse>('public-client-purchase', {
          action: 'resolve_checkout',
          provisioning_id: pending.provisioningId,
          public_checkout_id: pending.publicCheckoutId,
        });

        if (!resolvePayload.purchase_activation_token) {
          if (!cancelled) {
            setStatusMessage(
              resolvePayload.status === 'awaiting_provider_confirmation'
                ? 'Payment is still being confirmed. Refresh this page in a few moments.'
                : `Checkout status: ${resolvePayload.status}`,
            );
          }
          return;
        }

        await continueOwnerActivation(
          pending.provisioningId,
          resolvePayload.purchase_activation_token,
          pending.primaryWorkEmail,
        );
      } catch (returnError) {
        if (!cancelled) {
          setError(returnError instanceof Error ? returnError.message : 'Could not resolve the checkout return.');
        }
      } finally {
        if (!cancelled) {
          setIsResolvingReturn(false);
        }
      }
    }

    void handleReturnFlow();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function toggleModule(moduleCode: string) {
    setModulesOfInterest((current) =>
      current.includes(moduleCode)
        ? current.filter((value) => value !== moduleCode)
        : [...current, moduleCode],
    );
  }

  function togglePainPoint(painPoint: string) {
    setPainPoints((current) =>
      current.includes(painPoint)
        ? current.filter((value) => value !== painPoint)
        : [...current, painPoint],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (modulesOfInterest.length === 0) {
      setError('Select at least one module to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage('Creating the client purchase intent...');

    try {
      const requestId = crypto.randomUUID();
      const numericEmployeeCount = Number(estimatedEmployeeCount);
      const returnUrl = `${window.location.origin}/purchase?checkout_return=1`;
      const cancelUrl = `${window.location.origin}/purchase?checkout_cancelled=1`;

      const intentPayload = await invokePublicEdgeFunction<{ success: true; provisioning_id: string }>('client-owner-provision', {
        action: 'capture_intent',
        request_id: requestId,
        company_name: companyName,
        primary_contact_name: primaryContactName,
        primary_work_email: primaryWorkEmail,
        phone_number: phoneNumber,
        country_or_region: countryOrRegion,
        estimated_employee_count: numericEmployeeCount,
        growth_band: growthBand,
        modules_of_interest: modulesOfInterest,
        adoption_mode: adoptionMode,
        migration_source: migrationSource || null,
        has_biometric_setup: hasBiometricSetup,
        pain_points: painPoints,
        selected_plan_code: selectedPlanCode,
        marketing_context: {
          source: 'version_2_purchase_surface',
        },
      });

      setStatusMessage('Creating secure checkout...');

      const checkoutPayload = await invokePublicEdgeFunction<PurchaseInitiateResponse>('public-client-purchase', {
        action: 'initiate_checkout',
        request_id: crypto.randomUUID(),
        provisioning_id: intentPayload.provisioning_id,
        selected_plan_code: selectedPlanCode,
        estimated_employee_count: numericEmployeeCount,
        return_url: returnUrl,
        cancel_url: cancelUrl,
      });

      writePendingPurchase({
        provisioningId: checkoutPayload.provisioning_id,
        publicCheckoutId: checkoutPayload.public_checkout_id,
        primaryWorkEmail,
        selectedPlanCode,
      });

      if (checkoutPayload.purchase_activation_token) {
        setStatusMessage('Preparing owner activation...');
        await continueOwnerActivation(
          checkoutPayload.provisioning_id,
          checkoutPayload.purchase_activation_token,
          primaryWorkEmail,
        );
        setIsSubmitting(false);
        return;
      }

      if (!checkoutPayload.short_url) {
        throw new Error('Checkout link was not returned.');
      }

      window.location.assign(checkoutPayload.short_url);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not start the purchase flow.');
      setStatusMessage(null);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <PublicSectionCard className="mx-auto max-w-[72rem] border-sky-200/70 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50/80">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">Client activation</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-[3rem]">
              Start the actual client-owner purchase flow.
            </h1>
            <p className="text-base leading-8 text-slate-600">
              This is now the executable public buyer path: capture the minimum commercial intake, create a secure checkout,
              then transition the owner into credential setup after payment verification.
            </p>
          </div>

          <div className="space-y-3 rounded-[1.6rem] border border-slate-200/70 bg-white/90 p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">What this surface does</p>
            <ul className="space-y-3 text-sm leading-7 text-slate-700">
              <li className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">Captures buyer and company intake for provisioning intent.</li>
              <li className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">Starts public hosted checkout through the new pre-tenant purchase seam.</li>
              <li className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">Resolves payment return, then pushes the owner into credential setup.</li>
            </ul>
          </div>

          {statusMessage ? (
            <div className="rounded-[1rem] border border-sky-300/70 bg-sky-100/80 px-4 py-3 text-sm text-sky-900">
              {statusMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1rem] border border-rose-300/70 bg-rose-100/80 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.9rem] border border-slate-900/90 bg-slate-950 p-7 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Company name</span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Acme Private Limited"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Primary contact</span>
                <input
                  type="text"
                  value={primaryContactName}
                  onChange={(event) => setPrimaryContactName(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Owner or main operator"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Work email</span>
                <input
                  type="email"
                  value={primaryWorkEmail}
                  onChange={(event) => setPrimaryWorkEmail(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="owner@company.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Phone number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Primary contact number"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Country</span>
                <select
                  value={countryOrRegion}
                  onChange={(event) => setCountryOrRegion(event.target.value)}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country} className="text-slate-950">
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Estimated employees</span>
                <input
                  type="number"
                  min="1"
                  value={estimatedEmployeeCount}
                  onChange={(event) => setEstimatedEmployeeCount(event.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Plan</span>
                <select
                  value={selectedPlanCode}
                  onChange={(event) => setSelectedPlanCode(event.target.value)}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                >
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan.code} value={plan.code} className="text-slate-950">
                      {plan.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-6 text-slate-400">
                  {PLAN_OPTIONS.find((plan) => plan.code === selectedPlanCode)?.detail}
                </p>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Adoption mode</span>
                <select
                  value={adoptionMode}
                  onChange={(event) => setAdoptionMode(event.target.value)}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                >
                  {ADOPTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-950">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Growth band</span>
                <select
                  value={growthBand}
                  onChange={(event) => setGrowthBand(event.target.value)}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                >
                  {GROWTH_BAND_OPTIONS.map((band) => (
                    <option key={band} value={band} className="text-slate-950">
                      {band}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Migration source</span>
                <input
                  type="text"
                  value={migrationSource}
                  onChange={(event) => setMigrationSource(event.target.value)}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10"
                  placeholder="Optional: current tool or process"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Modules of interest</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODULE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={modulesOfInterest.includes(option.value)}
                      onChange={() => toggleModule(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Primary pain points</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAIN_POINT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={painPoints.includes(option.value)}
                      onChange={() => togglePainPoint(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={hasBiometricSetup}
                onChange={(event) => setHasBiometricSetup(event.target.checked)}
              />
              <span>Biometric attendance setup already exists</span>
            </label>

            <div className="flex flex-wrap gap-4 pt-2">
              <ActionButton type="submit" disabled={isSubmitting || isResolvingReturn}>
                {isSubmitting ? 'Preparing checkout...' : isResolvingReturn ? 'Verifying payment...' : 'Start secure checkout'}
              </ActionButton>
              <ActionLink href="/signin" variant="secondary">Existing user sign in</ActionLink>
            </div>
          </form>
        </div>
      </div>
    </PublicSectionCard>
  );
}

