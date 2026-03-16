'use client';

import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { CandidateSidebarPanels } from '@/components/candidate/shell/CandidateSidebar';

export default function CandidateSidebarSection({
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
        <CandidateSurfaceCard className="h-full overflow-hidden p-0">
          <CandidateSidebarPanels />
        </CandidateSurfaceCard>
      </div>
    </section>
  );
}
