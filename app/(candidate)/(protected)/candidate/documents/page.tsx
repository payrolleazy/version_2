import CandidateDocumentsPage from '@/components/candidate/documents/CandidateDocumentsPage';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import {
  CandidateDocumentRequirementsResponse,
  fetchCandidateDocumentRequirements,
} from '@/lib/candidate/contracts';

async function loadInitialDocumentBundle(session: {
  access_token?: string;
}): Promise<{
  documentData: CandidateDocumentRequirementsResponse | null;
  error: string | null;
}> {
  if (!session.access_token) {
    return {
      documentData: null,
      error: 'Missing candidate session',
    };
  }

  const result = await fetchCandidateDocumentRequirements(session.access_token);

  if (result.success && result.data) {
    return {
      documentData: result.data,
      error: null,
    };
  }

  return {
    documentData: null,
    error: result.error ?? 'Could not load document requirements.',
  };
}

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
    return (
      <CandidatePageFrame
        title="Documents"
        subtitle="Candidate document workspace"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading document workspace..." />
      </CandidatePageFrame>
    );
  }

  const { documentData, error } = await loadInitialDocumentBundle(snapshot.session);

  return (
    <CandidateDocumentsPage
      session={snapshot.session}
      initialDocumentData={documentData}
      initialError={error}
    />
  );
}
