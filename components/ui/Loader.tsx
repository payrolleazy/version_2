import React from 'react';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: {
    wrap: 'h-4 w-5 gap-[3px]',
    bar: 'w-[3px]',
  },
  sm: {
    wrap: 'h-5 w-6 gap-1',
    bar: 'w-[4px]',
  },
  md: {
    wrap: 'h-8 w-9 gap-[5px]',
    bar: 'w-[5px]',
  },
  lg: {
    wrap: 'h-12 w-14 gap-1.5',
    bar: 'w-[7px]',
  },
};

export default function Loader({
  size = 'sm',
  className = '',
  label = 'Loading...',
}: LoaderProps) {
  const scale = sizeClasses[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-end justify-center text-current ${className}`}
    >
      <div className={`relative inline-flex items-end justify-center ${scale.wrap}`}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`${scale.bar} h-full rounded-full bg-current`}
            style={{
              opacity: 0.92 - index * 0.16,
              boxShadow: index === 1 ? '0 0 18px currentColor' : '0 0 10px currentColor',
              animation: 'appLoaderWave 1.22s cubic-bezier(0.42, 0, 0.24, 1) infinite',
              animationDelay: `${index * 0.14}s`,
            }}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
      <style jsx>{`
        @keyframes appLoaderWave {
          0%,
          100% {
            transform: translateY(0) scaleY(0.42);
            opacity: 0.28;
          }
          38% {
            transform: translateY(-1px) scaleY(1);
            opacity: 1;
          }
          62% {
            transform: translateY(-3px) scaleY(0.82);
            opacity: 0.88;
          }
        }
      `}</style>
    </div>
  );
}
