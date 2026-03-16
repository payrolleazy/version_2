'use client';

import Loader from '@/components/ui/Loader';

export default function CandidateLoadingState({
  message,
  minHeightClass = 'min-h-[60vh]',
}: {
  message: string;
  minHeightClass?: string;
}) {
  return (
    <div className={`mx-auto flex items-center justify-center ${minHeightClass}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" className="text-sky-600 dark:text-sky-400" label={message} />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>
      </div>
    </div>
  );
}
