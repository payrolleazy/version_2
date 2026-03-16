'use client';

type CandidateMessageTone = 'error' | 'neutral' | 'success';

const toneClasses: Record<CandidateMessageTone, string> = {
  error: 'border-red-200 bg-white/90 text-slate-900 dark:border-red-900/40 dark:bg-slate-950/85 dark:text-white',
  neutral: 'border-slate-200 bg-white/90 text-slate-900 dark:border-slate-800 dark:bg-slate-950/85 dark:text-white',
  success: 'border-emerald-200 bg-white/90 text-slate-900 dark:border-emerald-900/40 dark:bg-slate-950/85 dark:text-white',
};

export default function CandidateMessageState({
  title,
  message,
  tone = 'neutral',
  action,
}: {
  title: string;
  message: string;
  tone?: CandidateMessageTone;
  action?: React.ReactNode;
}) {
  return (
    <div className={`mt-6 rounded-[2rem] border p-8 shadow-xl ${toneClasses[tone]}`}>
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
