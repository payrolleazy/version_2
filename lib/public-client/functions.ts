import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type JsonRecord = Record<string, unknown>;

function getPublicFunctionBase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  }

  return {
    functionBaseUrl: `${supabaseUrl}/functions/v1`,
    supabaseAnonKey,
  };
}

export async function invokePublicEdgeFunction<T extends JsonRecord>(
  functionName: string,
  body: JsonRecord,
): Promise<T> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(error.message || `Could not invoke ${functionName}.`);
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`Unexpected response from ${functionName}.`);
  }

  const payload = data as JsonRecord;

  if (payload.success === false) {
    const errorMessage = typeof payload.error === 'string'
      ? payload.error
      : typeof payload.error_code === 'string'
        ? payload.error_code
        : `Could not complete ${functionName}.`;

    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function invokePublicEdgeFunctionWithStatus<T extends JsonRecord>(
  functionName: string,
  body: JsonRecord,
): Promise<{ status: number; payload: T }> {
  const { functionBaseUrl, supabaseAnonKey } = getPublicFunctionBase();
  const response = await fetch(`${functionBaseUrl}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!payload || typeof payload !== 'object') {
    throw new Error(`Unexpected response from ${functionName}.`);
  }

  return {
    status: response.status,
    payload: payload as T,
  };
}
