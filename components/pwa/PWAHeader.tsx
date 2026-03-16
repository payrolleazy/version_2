'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCandidateLogout } from '@/hooks/useCandidateLogout';

interface PWAHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function PWAHeader({ title, subtitle, showBack = false, onBack }: PWAHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { loggingOut, logout } = useCandidateLogout();

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {showBack ? (
          <button
            onClick={onBack ?? (() => router.back())}
            className="-ml-2 rounded-xl p-2 text-gray-600 transition-colors active:bg-gray-100 dark:text-gray-300 dark:active:bg-gray-800"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-base font-bold text-transparent">
            Payrolleazy
          </span>
        )}

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">{title}</p>
          {subtitle ? <p className="mt-px text-[10px] leading-none text-gray-400 dark:text-gray-500">{subtitle}</p> : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="-mr-2 rounded-xl p-2 text-gray-500 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    disabled={loggingOut}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {loggingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}