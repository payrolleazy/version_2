"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import styles from './ModuleFeatureCarousel.module.css';

const AttendanceFeatureSpecPanel = dynamic(
  () => import('@/components/public/landing/AttendanceFeatureSpecPanel').then((mod) => mod.AttendanceFeatureSpecPanel),
  { ssr: false, loading: () => <div className={styles.loadingSurface} /> },
);

const LeaveFeatureSpecPanel = dynamic(
  () => import('@/components/public/landing/LeaveFeatureSpecPanel').then((mod) => mod.LeaveFeatureSpecPanel),
  { ssr: false, loading: () => <div className={styles.loadingSurface} /> },
);

const PayrollFeatureSpecPanel = dynamic(
  () => import('@/components/public/landing/PayrollFeatureSpecPanel').then((mod) => mod.PayrollFeatureSpecPanel),
  { ssr: false, loading: () => <div className={styles.loadingSurface} /> },
);

type Slide = {
  id: string;
  label: string;
  render: (isActive: boolean) => ReactNode;
};

const AUTO_ADVANCE_MS = 5000;

const SLIDES: Slide[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    render: (isActive) => <AttendanceFeatureSpecPanel isActive={isActive} />,
  },
  {
    id: 'leave',
    label: 'Leave',
    render: (isActive) => <LeaveFeatureSpecPanel isActive={isActive} />,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    render: (isActive) => <PayrollFeatureSpecPanel isActive={isActive} />,
  },
];

export function ModuleFeatureCarousel({ isActive }: { isActive: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canAutoAdvance, setCanAutoAdvance] = useState(true);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    setLoadedIndexes((current) => {
      const next = new Set(current);
      next.add(activeIndex);
      next.add((activeIndex + 1) % SLIDES.length);
      next.add((activeIndex - 1 + SLIDES.length) % SLIDES.length);
      return next;
    });
  }, [activeIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCanAutoAdvance(true);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      setCanAutoAdvance(!document.hidden && !mediaQuery.matches);
    };

    syncMotion();
    document.addEventListener('visibilitychange', syncMotion);
    mediaQuery.addEventListener('change', syncMotion);

    return () => {
      document.removeEventListener('visibilitychange', syncMotion);
      mediaQuery.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setActiveIndex(0);
      setIsPaused(false);
      return;
    }

    if (isPaused || !canAutoAdvance) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, canAutoAdvance, isActive, isPaused]);

  const renderedSlides = useMemo(
    () =>
      SLIDES.map((slide, index) => ({
        slide,
        index,
        shouldRender: loadedIndexes.has(index),
      })),
    [loadedIndexes],
  );

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {renderedSlides.map(({ slide, index, shouldRender }) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${index === activeIndex ? styles.slideActive : styles.slideInactive}`}
              aria-hidden={index !== activeIndex}
            >
              {shouldRender ? slide.render(isActive && index === activeIndex) : <div className={styles.loadingSurface} />}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.dots}>
        {SLIDES.map((slide, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.label} module`}
              aria-pressed={selected}
              onClick={() => setActiveIndex(index)}
              className={`${styles.dot} ${selected ? styles.dotActive : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

