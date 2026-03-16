'use client';

import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { RecruiterSidebarPanels } from '@/components/recruiter/shell/RecruiterSidebar';

export default function RecruiterSidebarSection({
  sticky = false,
  className = '',
}: {
  sticky?: boolean;
  className?: string;
}) {
  const wrapperClass = sticky ? 'sticky top-24 w-full' : 'w-full';

  return (
    <section className={`hidden lg:block lg:min-h-0 ${className}`.trim()}>
      <div className={wrapperClass}>
        <CandidateSurfaceCard className="grid h-full gap-5 overflow-hidden p-0 [grid-template-rows:auto_minmax(0,1fr)]">
          <RecruiterSidebarPanels />
        </CandidateSurfaceCard>
      </div>
    </section>
  );
}
