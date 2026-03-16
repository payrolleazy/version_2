export interface GatewayResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function getGatewayEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function callPgFunction<T = unknown>(
  configId: string,
  params: Record<string, unknown>,
  accessToken: string,
  timeoutMs = 15000,
): Promise<GatewayResponse<T>> {
  const env = getGatewayEnv();

  if (!env) {
    return {
      success: false,
      error: 'Supabase environment is not configured.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.supabaseUrl}/functions/v1/a_crud_universal_pg_function_gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: env.supabaseAnonKey,
      },
      body: JSON.stringify({
        config_id: configId,
        params,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => null) as Record<string, unknown> | null;

    if (!response.ok) {
      return {
        success: false,
        error:
          (typeof result?.message === 'string' && result.message) ||
          (typeof result?.error === 'string' && result.error) ||
          `HTTP Error: ${response.status}`,
      };
    }

    if (result && Object.prototype.hasOwnProperty.call(result, 'success') && result.success === false) {
      return {
        success: false,
        error:
          (typeof result.message === 'string' && result.message) ||
          (typeof result.error === 'string' && result.error) ||
          'Request failed.',
        data: result.data as T | undefined,
      };
    }

    return {
      success: true,
      data: (result?.data ?? result) as T,
      message: typeof result?.message === 'string' ? result.message : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gateway request failed.',
    };
  }
}

export async function callReadGateway<T = unknown>(
  configId: string,
  params: {
    filters?: Record<string, unknown>;
    orderBy?: Array<[string, 'ASC' | 'DESC']>;
    limit?: number;
    offset?: number;
  },
  accessToken: string,
  timeoutMs = 15000,
): Promise<GatewayResponse<T>> {
  const env = getGatewayEnv();

  if (!env) {
    return {
      success: false,
      error: 'Supabase environment is not configured.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.supabaseUrl}/functions/v1/a_crud_universal_read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: env.supabaseAnonKey,
      },
      body: JSON.stringify({
        config_id: configId,
        ...params,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => null) as Record<string, unknown> | null;

    if (!response.ok) {
      return {
        success: false,
        error:
          (typeof result?.message === 'string' && result.message) ||
          (typeof result?.error === 'string' && result.error) ||
          `HTTP Error: ${response.status}`,
      };
    }

    if (result && Object.prototype.hasOwnProperty.call(result, 'success') && result.success === false) {
      return {
        success: false,
        error:
          (typeof result.message === 'string' && result.message) ||
          (typeof result.error === 'string' && result.error) ||
          'Request failed.',
        data: result.data as T | undefined,
      };
    }

    return {
      success: true,
      data: (result?.data ?? result) as T,
      message: typeof result?.message === 'string' ? result.message : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Read request failed.',
    };
  }
}

export async function callBulkUpsertGateway<T = unknown>(
  configId: string,
  params: {
    input_rows: Record<string, unknown>[];
  },
  accessToken: string,
  timeoutMs = 15000,
): Promise<GatewayResponse<T>> {
  const env = getGatewayEnv();

  if (!env) {
    return {
      success: false,
      error: 'Supabase environment is not configured.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.supabaseUrl}/functions/v1/a_crud_universal_bulk_upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: env.supabaseAnonKey,
      },
      body: JSON.stringify({
        config_id: configId,
        ...params,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => null) as Record<string, unknown> | null;

    if (!response.ok) {
      return {
        success: false,
        error:
          (typeof result?.message === 'string' && result.message) ||
          (typeof result?.error === 'string' && result.error) ||
          `HTTP Error: ${response.status}`,
      };
    }

    if (result && Object.prototype.hasOwnProperty.call(result, 'success') && result.success === false) {
      return {
        success: false,
        error:
          (typeof result.message === 'string' && result.message) ||
          (typeof result.error === 'string' && result.error) ||
          'Request failed.',
        data: result.data as T | undefined,
      };
    }

    return {
      success: true,
      data: (result?.data ?? result) as T,
      message: typeof result?.message === 'string' ? result.message : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk upsert request failed.',
    };
  }
}

