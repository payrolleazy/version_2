'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  candidateNavItems,
  isCandidateNavActive,
} from '@/components/candidate/shell/candidateNav';

export default function CandidateBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {candidateNavItems.map((item) => {
          const active = isCandidateNavActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex min-h-[58px] flex-1 flex-col items-center justify-center px-1 py-2 transition-colors focus:outline-none active:bg-slate-50 dark:active:bg-slate-900"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {active ? (
                <span className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
              ) : null}

              <div className={`transition-transform duration-200 ${active ? 'scale-[1.06]' : 'scale-100'}`}>
                {item.icon(active)}
              </div>

              <span
                className={`mt-0.5 text-[10px] font-semibold tracking-wide transition-colors ${
                  active
                    ? 'text-cyan-700 dark:text-cyan-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
