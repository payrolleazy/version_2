'use client';

import { AnimatePresence, motion } from 'framer-motion';

import CandidateOnboardingSectionForm from '@/components/candidate/onboarding/CandidateOnboardingSectionForm';

interface CandidateOnboardingSectionDialogProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: any[];
  labelWidth?: string;
  maxWidth?: string;
}

// Candidate-owned wrapper around the shared onboarding section form.
// Keeps the protected candidate route tree insulated from the shared form implementation.
export default function CandidateOnboardingSectionDialog({
  session,
  isOpen,
  onClose,
  title,
  fields,
  labelWidth = 'w-auto',
  maxWidth = 'max-w-3xl',
}: CandidateOnboardingSectionDialogProps) {
  void labelWidth;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
            className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 shadow-2xl shadow-slate-950/15 dark:border-white/5 dark:bg-slate-950/95`}
          >
            <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200/80 bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-700 px-6 py-5 text-white dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">
                    Candidate Section
                  </p>
                  <h2 className="mt-3 text-2xl font-black">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/90">
                    Complete this section cleanly and save your progress without leaving the
                    onboarding workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/20 p-3 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  aria-label={`Close ${title} dialog`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6 sm:px-8">
              <CandidateOnboardingSectionForm session={session} fields={fields} title={title} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
