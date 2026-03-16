"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

const HrmsLifecycleCanvas = dynamic(
  () => import('@/components/public/landing/HrmsLifecycleCanvas').then((mod) => mod.HrmsLifecycleCanvas),
  {
    ssr: false,
    loading: () => <StoryPanelPlaceholder />,
  },
);

const ModuleFeatureCarousel = dynamic(
  () => import('@/components/public/landing/ModuleFeatureCarousel').then((mod) => mod.ModuleFeatureCarousel),
  {
    ssr: false,
    loading: () => <StoryPanelPlaceholder />,
  },
);

function StoryPanelPlaceholder() {
  return <div className="absolute inset-0 rounded-[2rem] bg-white/96" aria-hidden="true" />;
}

type FeatureRailItem = {
  key: string;
  label: string;
  glowClass: string;
};

const RAIL_ITEMS: FeatureRailItem[] = [
  {
    key: 'ai',
    label: 'AI',
    glowClass:
      'border-sky-300/90 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.98)_0%,rgba(239,253,255,0.98)_18%,rgba(224,242,254,0.92)_54%,rgba(255,255,255,0.9)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_72px_rgba(114,184,255,0.18),0_0_110px_rgba(191,246,255,0.22)]',
  },
  {
    key: 'advanced-autoscaling',
    label: 'Advanced Autoscaling',
    glowClass:
      'border-sky-300/90 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.98)_0%,rgba(239,253,255,0.98)_18%,rgba(224,242,254,0.92)_54%,rgba(255,255,255,0.9)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_72px_rgba(114,184,255,0.18),0_0_110px_rgba(191,246,255,0.22)]',
  },
  {
    key: 'instant-branching',
    label: 'Instant Branching',
    glowClass:
      'border-sky-300/90 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.98)_0%,rgba(239,253,255,0.98)_18%,rgba(224,242,254,0.92)_54%,rgba(255,255,255,0.9)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_72px_rgba(114,184,255,0.18),0_0_110px_rgba(191,246,255,0.22)]',
  },
  {
    key: 'auth-included',
    label: 'Auth Included',
    glowClass:
      'border-sky-300/90 bg-[radial-gradient(circle_at_22%_82%,rgba(255,255,255,0.98)_0%,rgba(239,253,255,0.98)_18%,rgba(224,242,254,0.92)_54%,rgba(255,255,255,0.9)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_72px_rgba(114,184,255,0.18),0_0_110px_rgba(191,246,255,0.22)]',
  },
  {
    key: 'production-grade-features',
    label: 'Production-Grade Features',
    glowClass:
      'border-sky-300/90 bg-[radial-gradient(circle_at_80%_82%,rgba(255,255,255,0.98)_0%,rgba(239,253,255,0.98)_18%,rgba(224,242,254,0.92)_54%,rgba(255,255,255,0.9)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_72px_rgba(114,184,255,0.18),0_0_110px_rgba(191,246,255,0.22)]',
  },
];

export function LandingProductStoryShell() {
  const [activeKey, setActiveKey] = useState(RAIL_ITEMS[0].key);
  const [sectionInView, setSectionInView] = useState(false);
  const [loadedPanelKeys, setLoadedPanelKeys] = useState<Set<string>>(() => new Set());
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionInView(entry?.isIntersecting ?? false);
      },
      {
        threshold: [0.12],
        rootMargin: '-6% 0px -6% 0px',
      },
    );

    observer.observe(sectionNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!mostVisible) {
          return;
        }

        const nextKey = mostVisible.target.getAttribute('data-key');
        if (nextKey) {
          setActiveKey(nextKey);
        }
      },
      {
        threshold: [0.25, 0.45, 0.65, 0.85],
        rootMargin: '-16% 0px -30% 0px',
      },
    );

    panelRefs.current.forEach((panel) => {
      if (panel) {
        observer.observe(panel);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionInView) {
      return;
    }

    setLoadedPanelKeys((current) => {
      const next = new Set(current);
      next.add(activeKey);

      if (activeKey === RAIL_ITEMS[0].key || activeKey === RAIL_ITEMS[1].key) {
        next.add(RAIL_ITEMS[0].key);
        next.add(RAIL_ITEMS[1].key);
      }

      return next;
    });
  }, [activeKey, sectionInView]);

  return (
    <div ref={sectionRef}>
      <SurfaceCard className="relative mt-8 overflow-visible p-7 sm:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)] xl:items-start">
          <div className="space-y-6 sm:space-y-8">
            {RAIL_ITEMS.map((item, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const shouldMountHeavyPanel = loadedPanelKeys.has(item.key);
              const isActive = sectionInView && item.key === activeKey;

              return (
                <div
                  key={item.key}
                  ref={(node) => {
                    panelRefs.current[index] = node;
                  }}
                  data-key={item.key}
                  className={`group/branch relative rounded-[2rem] border transition-all duration-500 ${
                    isFirst
                      ? 'min-h-[114vh] overflow-hidden md:min-h-[124vh]'
                      : isSecond
                        ? 'min-h-[96vh] overflow-hidden md:min-h-[106vh]'
                        : 'min-h-[76vh] overflow-hidden'
                  } ${
                    isActive
                      ? item.glowClass
                      : 'border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.88)_100%)] shadow-[0_12px_36px_rgba(15,23,42,0.06)]'
                  }`}
                >
                  {isFirst ? (
                    shouldMountHeavyPanel ? (
                      <>
                        <div className="absolute inset-0 rounded-[2rem] bg-white/96" />
                        <HrmsLifecycleCanvas isActive={isActive} />
                      </>
                    ) : (
                      <StoryPanelPlaceholder />
                    )
                  ) : isSecond ? (
                    shouldMountHeavyPanel ? (
                      <>
                        <div className="absolute inset-0 rounded-[2rem] bg-white/96" />
                        <ModuleFeatureCarousel isActive={isActive} />
                      </>
                    ) : (
                      <StoryPanelPlaceholder />
                    )
                  ) : (
                    <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_42%,rgba(191,246,255,0.08)_100%)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="xl:sticky xl:top-28 xl:self-start">
            <div className="space-y-3">
              {RAIL_ITEMS.map((item, index) => {
                const isActive = sectionInView && item.key === activeKey;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveKey(item.key);
                      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                      panelRefs.current[index]?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
                    }}
                    className={`w-full rounded-[1.8rem] border px-5 py-5 text-left transition duration-300 ${
                      isActive
                        ? 'border-sky-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(240,249,255,0.98)_100%)] shadow-[var(--shadow-card)]'
                        : 'border-slate-200/70 bg-white/88 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white'
                    }`}
                  >
                    <h3 className="text-xl font-black text-slate-950">{item.label}</h3>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

