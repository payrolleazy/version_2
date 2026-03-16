import CandidateCallout from '@/components/candidate/ui/CandidateCallout';

export default function CandidateLaunchpadDocumentsPanelLoading() {
  return (
    <div className="flex min-h-0 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-3.5 lg:p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <CandidateCallout
        tone="info"
        title="Document readiness is loading"
        message="Open documents to review your checklist while the launchpad refreshes the upload summary."
      />
    </div>
  );
}
