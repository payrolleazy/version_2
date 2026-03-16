'use client';

import React, { useId, useMemo } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import Loader from '@/components/ui/Loader';

interface CandidateActionButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shine?: boolean;
  block?: boolean;
}

const sizeClasses = {
  sm: 'h-11 px-5 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-7 text-[1.05rem]',
};

const variantClasses = {
  primary:
    'border-sky-200/80 bg-gradient-to-r from-sky-100 via-cyan-100 to-indigo-100 text-slate-900 shadow-lg shadow-sky-900/8 hover:from-sky-200 hover:via-cyan-200 hover:to-indigo-200 dark:border-sky-100/80 dark:from-sky-200 dark:via-cyan-100 dark:to-indigo-200 dark:text-slate-950',
  secondary:
    'border-white/30 bg-white/20 text-white shadow-sm hover:bg-white/30 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  ghost:
    'border-transparent bg-transparent text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white',
  outline:
    'border-slate-200 bg-white/75 text-slate-900 shadow-sm hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-950',
  destructive:
    'border-transparent bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700',
};

export default function CandidateActionButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  shine = false,
  block = false,
  disabled,
  ...props
}: CandidateActionButtonProps) {
  const isDisabled = disabled || isLoading;
  const reactId = useId();

  const shineProfile = useMemo(() => {
    const seed = reactId.split('').reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0);

    return {
      angle: 16 + (seed % 15),
      duration: 4.4 + (seed % 5) * 0.42,
      delay: 2.2 + (seed % 7) * 0.36,
      width: 22 + (seed % 10),
      opacity: 0.36 + (seed % 4) * 0.04,
      glowOpacity: 0.12 + (seed % 4) * 0.025,
    };
  }, [reactId]);

  return (
    <motion.button
      suppressHydrationWarning
      whileHover={!isDisabled ? { y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      className={[
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border font-semibold tracking-[0.01em] transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        block ? 'w-full' : '',
        isDisabled ? 'cursor-not-allowed opacity-60' : '',
        className,
      ].join(' ')}
      disabled={isDisabled}
      type={props.type ?? 'button'}
      {...props}
    >
      {shine ? (
        <>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-[-35%] left-[-42%] rounded-full blur-xl"
            style={{
              width: `${shineProfile.width + 18}%`,
              background:
                'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 18%, rgba(224,242,254,0.52) 46%, rgba(199,210,254,0.28) 66%, rgba(255,255,255,0) 100%)',
              transform: `rotate(${shineProfile.angle - 4}deg)`,
            }}
            initial={{ x: '-165%', opacity: 0 }}
            animate={{
              x: ['-165%', '295%'],
              opacity: [0, shineProfile.glowOpacity, shineProfile.glowOpacity, 0],
            }}
            transition={{
              duration: shineProfile.duration + 0.55,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: shineProfile.delay + 0.45,
              times: [0, 0.18, 0.82, 1],
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-[-20%] left-[-38%] rounded-full blur-[0.5px]"
            style={{
              width: `${shineProfile.width}%`,
              background:
                'linear-gradient(118deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.24) 14%, rgba(255,255,255,0.82) 40%, rgba(186,230,253,0.74) 54%, rgba(199,210,254,0.42) 68%, rgba(255,255,255,0) 100%)',
              transform: `rotate(${shineProfile.angle}deg)`,
            }}
            initial={{ x: '-150%', opacity: 0 }}
            animate={{
              x: ['-150%', '310%'],
              opacity: [0, shineProfile.opacity, shineProfile.opacity, 0],
            }}
            transition={{
              duration: shineProfile.duration,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: shineProfile.delay,
              times: [0, 0.18, 0.82, 1],
            }}
          />
        </>
      ) : null}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? <Loader /> : null}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
