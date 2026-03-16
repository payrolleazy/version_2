import CandidateLaunchpadDocumentsPanel from '@/components/candidate/launchpad/CandidateLaunchpadDocumentsPanel';
import { fetchCandidateDocumentRequirements } from '@/lib/candidate/contracts';

export default async function CandidateLaunchpadDocumentsPanelServer({
  accessToken,
}: {
  accessToken: string;
}) {
  const result = await fetchCandidateDocumentRequirements(accessToken);
  const documentData = result.success && result.data ? result.data : null;

  return <CandidateLaunchpadDocumentsPanel documentData={documentData} />;
}
