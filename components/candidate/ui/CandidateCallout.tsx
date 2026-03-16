'use client';

type CandidateCalloutTone = 'info' | 'attention' | 'success' | 'error';

const toneClasses: Record<CandidateCalloutTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100',
  attention:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100',
  error: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100',
};

export default function CandidateCallout({
  title,
  message,
  tone,
  action,
}: {
  title: string;
  message: string;
  tone: CandidateCalloutTone;
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 opacity-85">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
