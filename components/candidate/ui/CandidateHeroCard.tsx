'use client';

export default function CandidateHeroCard({
  children,
  className = '',
  gradientClassName = 'from-sky-600 via-cyan-600 to-indigo-700',
}: {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
}) {
  return (
    <section
      className={`rounded-[2rem] border border-white/50 bg-gradient-to-br ${gradientClassName} px-8 py-7 text-white shadow-2xl shadow-sky-900/10 dark:border-white/5 sm:px-10 sm:py-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
