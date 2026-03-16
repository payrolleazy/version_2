interface UploadedFile {
  originalName: string;
  dataUrl: string;
  mimeType?: string;
  uploadedAt?: string | null;
}

interface FileListResponse {
  successful?: UploadedFile[];
  error?: string;
  message?: string;
}

interface UploadResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

function getFunctionEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

function buildFunctionUrl(path: string) {
  const { supabaseUrl } = getFunctionEnv();
  return `${supabaseUrl}/functions/v1/${path}`;
}

function buildFunctionHeaders(accessToken: string) {
  const { supabaseAnonKey } = getFunctionEnv();

  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: supabaseAnonKey,
  };
}

export interface CandidateUploadedFile {
  originalName: string;
  dataUrl: string;
  mimeType: string;
  uploadedAt?: string | null;
}

export async function listCandidateDocumentFiles(
  accessToken: string,
  documentType: string,
): Promise<CandidateUploadedFile[]> {
  const response = await fetch(
    `${buildFunctionUrl('secure-file-handler/list-decrypted-files')}?documentType=${encodeURIComponent(documentType)}`,
    {
      method: 'GET',
      headers: buildFunctionHeaders(accessToken),
    },
  );

  const payload = await response.json().catch(() => null) as FileListResponse | null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Failed to list uploaded files.');
  }

  return Array.isArray(payload?.successful)
    ? payload.successful.map((file) => ({
        originalName: file.originalName,
        dataUrl: file.dataUrl,
        uploadedAt: file.uploadedAt,
        mimeType:
          file.mimeType ||
          file.dataUrl?.substring(file.dataUrl.indexOf(':') + 1, file.dataUrl.indexOf(';')) ||
          'application/octet-stream',
      }))
    : [];
}

export async function uploadCandidateDocumentFiles(
  accessToken: string,
  documentType: string,
  files: Array<{ name: string; base64: string | ArrayBuffer | null; mimeType: string }>,
): Promise<void> {
  const response = await fetch(buildFunctionUrl('secure-file-handler/encrypt-upload'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildFunctionHeaders(accessToken),
    },
    body: JSON.stringify({ documentType, files }),
  });

  const payload = await response.json().catch(() => null) as UploadResponse | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || payload?.message || 'Upload failed.');
  }
}
