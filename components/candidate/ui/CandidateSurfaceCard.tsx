'use client';

export default function CandidateSurfaceCard({
  children,
  className = '',
  as = 'section',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div';
}) {
  const Component = as;

  return (
    <Component
      className={`rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950/85 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
