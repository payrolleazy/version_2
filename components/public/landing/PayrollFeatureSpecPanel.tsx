"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './AttendanceFeatureSpecPanel.module.css';

type FeatureItem = {
  name: string;
  subs: [string, string, string];
};

type FeatureNode = {
  id: string;
  variant: 'core' | 'bio' | 'gam';
  ghost: string;
  tag: string;
  title: [string, string];
  features: FeatureItem[];
};

const REVEAL_DELAYS = [0, 350, 700];
const FEATURE_STAGGER_MS = 50;

const NODES: FeatureNode[] = [
  {
    id: 'runs',
    variant: 'core',
    ghost: '01',
    tag: 'RUNS',
    title: ['Payroll', 'Runs'],
    features: [
      { name: 'Standard and Ad-hoc Runs', subs: ['Launch regular payroll cycles', 'Create focused runs for selected employees', 'Handle special payouts without disturbing the full cycle'] },
      { name: 'Period and Area Selection', subs: ['Choose the payroll month clearly', 'Run by payroll area when required', 'Start each run with the right operating scope'] },
      { name: 'Background Batch Queueing', subs: ['Runs move into a background queue', 'Processing continues without blocking the screen', 'Operations teams can keep working while payroll runs'] },
      { name: 'Live Batch Progress', subs: ['Watch status, processed count, and progress', 'See completed, failed, or retrying runs', 'Track what is still in motion at a glance'] },
      { name: 'Source Data Locking', subs: ['Freeze the period before payroll processing', 'Lock attendance and leave inputs at the right stage', 'Protect payroll from moving source data'] },
      { name: 'Final Payroll Push', subs: ['Process the batch before final approval', 'Finalize the period when review is complete', 'Carry loss of pay and overtime into payroll cleanly'] },
    ],
  },
  {
    id: 'review',
    variant: 'bio',
    ghost: '02',
    tag: 'REVIEW',
    title: ['Calculation', 'Review'],
    features: [
      { name: 'Employee Reconciliation Summary', subs: ['Review employee-wise loss of pay', 'Check overtime before payroll is locked', 'Catch mismatches before final push'] },
      { name: 'Results Explorer', subs: ['Browse payroll outcomes by batch', 'Filter by period and pay component', 'Narrow down the exact result you need fast'] },
      { name: 'Component-Level Analysis', subs: ['See which component created the result', 'Review method-wise calculation output', 'Compare values across payroll periods'] },
      { name: 'Detailed Breakdown View', subs: ['Open the full calculation details', 'Inspect input values used for the result', 'Understand how each figure was produced'] },
      { name: 'Result Export', subs: ['Export the visible result set quickly', 'Share payroll review data outside the screen', 'Support offline audit and checking work'] },
      { name: 'Retry-Ready Processing', subs: ['Re-run failed processing when needed', 'Bring the batch back into motion safely', 'Keep payroll moving without rebuilding everything'] },
    ],
  },
  {
    id: 'delivery',
    variant: 'gam',
    ghost: '03',
    tag: 'PAYSLIPS',
    title: ['Payslip', 'Delivery'],
    features: [
      { name: 'Payslip Generation from Completed Batches', subs: ['Start payslip generation only from completed payroll', 'Tie payslips to the right payroll batch', 'Keep document delivery aligned with finalized results'] },
      { name: 'Force Regeneration Control', subs: ['Regenerate existing payslips when corrections happen', 'Refresh a full batch when required', 'Avoid manual one-off document rework'] },
      { name: 'Live Delivery Queue Monitoring', subs: ['Monitor pending, processing, and completed items', 'See how many payslips succeeded or failed', 'Keep document generation transparent in real time'] },
      { name: 'Direct Payslip Download', subs: ['Open completed payslips immediately', 'Download employee documents from the run screen', 'Reduce back-and-forth for payroll teams'] },
      { name: 'Failure Retry and Resolution', subs: ['Retry failed payslip items', 'Review unresolved error cases separately', 'Move stuck document jobs toward closure faster'] },
      { name: 'Processing Performance View', subs: ['Track speed and success trends', 'Watch failure counts and throughput', 'Understand how the document engine is performing'] },
    ],
  },
];

export function PayrollFeatureSpecPanel({ isActive }: { isActive: boolean }) {
  const [revealed, setRevealed] = useState<boolean[]>(() => NODES.map(() => false));

  useEffect(() => {
    const timers: number[] = [];

    if (!isActive) {
      setRevealed(NODES.map(() => false));
      return () => {
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    setRevealed(NODES.map(() => false));

    REVEAL_DELAYS.forEach((delay, index) => {
      const timer = window.setTimeout(() => {
        setRevealed((current) => {
          const next = [...current];
          next[index] = true;
          return next;
        });
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isActive]);

  const totalFeatures = useMemo(() => NODES.reduce((sum, node) => sum + node.features.length, 0), []);

  return (
    <div className={`${styles.panel} ${isActive ? styles.panelActive : ''}`}>
      <header className={styles.pageHead}>
        <div className={styles.pageHeadLeft}>
          <div className={styles.pageTitle}>Payroll Module</div>
          <div className={styles.pageSub}>Feature specification  3 nodes  {totalFeatures} capabilities</div>
        </div>
      </header>

      <main className={styles.columns}>
        {NODES.map((node, nodeIndex) => (
          <section
            key={node.id}
            className={`${styles.node} ${styles[`node${node.variant[0].toUpperCase()}${node.variant.slice(1)}`]} ${revealed[nodeIndex] ? styles.nodeRevealed : ''}`}
          >
            <div className={styles.nodeGhost}>{node.ghost}</div>

            <div className={styles.nodeHeader}>
              <div className={styles.nodeEyebrow}>
                <span className={styles.nodeTag}>{node.tag}</span>
                <span className={styles.nodeCount}>{String(node.features.length).padStart(2, '0')} features</span>
              </div>
              <h2 className={styles.nodeTitle}>
                {node.title[0]}
                <br />
                {node.title[1]}
              </h2>
              <div className={styles.nodeRule} />
            </div>

            <ul className={styles.featureList}>
              {node.features.map((feature, featureIndex) => (
                <li
                  key={feature.name}
                  className={`${styles.featureItem} ${revealed[nodeIndex] ? styles.featureItemRevealed : ''}`}
                  style={{ transitionDelay: revealed[nodeIndex] ? `${featureIndex * FEATURE_STAGGER_MS}ms` : '0ms' }}
                >
                  <span className={styles.featureNum}>{String(featureIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <div className={styles.featureName}>{feature.name}</div>
                    <div className={styles.featureSubs}>
                      {feature.subs.map((sub) => (
                        <div key={sub} className={styles.featureSub}>{sub}</div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className={styles.pageFoot}>
        <span>PAYROLL MODULE  {totalFeatures} CAPABILITIES ACROSS 3 NODES</span>
        <span>HOVER ANY FEATURE TO EXPAND</span>
      </footer>
    </div>
  );
}
