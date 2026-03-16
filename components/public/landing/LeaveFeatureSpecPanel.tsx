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

const REVEAL_DELAYS = [0, 1000, 2000];
const FEATURE_STAGGER_MS = 55;

const NODES: FeatureNode[] = [
  {
    id: 'employee',
    variant: 'core',
    ghost: '01',
    tag: 'EMPLOYEE',
    title: ['Employee', 'Leave'],
    features: [
      { name: 'Leave Balance Overview', subs: ['See available, used, and pending days', 'Separate balances for each leave type', 'Quick yearly summary on one screen'] },
      { name: 'Upcoming Leave Planner', subs: ['Track approved upcoming time off', 'Know how many days remain before it starts', 'See the full leave window at a glance'] },
      { name: 'Flexible Leave Application', subs: ['Choose leave type and dates easily', 'Support for full day and half day requests', 'Add reason before submission'] },
      { name: 'Instant Leave Calculation', subs: ['See deduction before submitting', 'Preview closing balance in advance', 'Get policy warnings before applying'] },
      { name: 'Sandwich Rule Visibility', subs: ['Weekend and holiday impact shown clearly', 'Extra deducted days explained upfront', 'No hidden balance surprise'] },
      { name: 'Emergency Leave Option', subs: ['Mark urgent leave separately', 'Bypass some notice restrictions when needed', 'Send for stricter approval review'] },
      { name: 'Leave History and Cancellation', subs: ['Filter past requests by status and date', 'Cancel pending requests when plans change', 'Track every application with its status'] },
      { name: 'Balance Ledger Clarity', subs: ['See every credit, debit, carry forward, and expiry', 'Track pending impact on balance', 'Review yearly leave movement anytime'] },
    ],
  },
  {
    id: 'manager',
    variant: 'bio',
    ghost: '02',
    tag: 'MANAGER',
    title: ['Manager', 'Review'],
    features: [
      { name: 'Team Leave Inbox', subs: ['See pending requests in one review queue', 'Open employee details and reason quickly', 'Act without leaving the review screen'] },
      { name: 'Emergency Request Highlighting', subs: ['Urgent leave requests stand out clearly', 'High-priority cases are easier to catch', 'Faster response for urgent absences'] },
      { name: 'Approve or Reject with Remarks', subs: ['Approve or reject from the same screen', 'Remarks can be added during review', 'Rejection forces a reason'] },
      { name: 'Multi-Level Approval Progress', subs: ['See current approval stage instantly', 'Track how many approval levels remain', 'Better visibility on request movement'] },
      { name: 'Team Availability Snapshot', subs: ['Know how many team members are on leave today', 'Watch pending approvals and emergencies', 'See team size alongside leave load'] },
      { name: 'Team Leave History Search', subs: ['Search by employee name, code, or request number', 'Review processed requests later', 'Keep a clean history view for managers'] },
    ],
  },
  {
    id: 'admin',
    variant: 'gam',
    ghost: '03',
    tag: 'ADMIN',
    title: ['Admin', 'Control'],
    features: [
      { name: 'Leave Type Setup', subs: ['Create different leave categories', 'Control half day, paid leave, and approvals', 'Set attachments, notice, and limits'] },
      { name: 'Advanced Leave Policies', subs: ['Set accrual frequency and annual quota', 'Control carry forward, lapse, and expiry', 'Define eligibility, duration, and special rules'] },
      { name: 'Flexible Approval Rules', subs: ['Choose approval levels and escalation time', 'Allow delegate approval when needed', 'Auto-approve in no-manager cases'] },
      { name: 'Department and Employee Assignment', subs: ['Apply policies by department, designation, or employee', 'Start policies from an effective date', 'Keep rollout controlled and targeted'] },
      { name: 'Leave Analytics', subs: ['Track annual usage and monthly trends', 'See emergency patterns and policy share', 'Spot approval bottlenecks early'] },
      { name: 'Year-End Balance Processing', subs: ['Run carry forward or lapse processing on schedule', 'Handle leave cycle closure cleanly', 'Support end-of-year balance rollover'] },
      { name: 'Operations and Cleanup Console', subs: ['Check pending, failed, and stuck leave tasks', 'Archive older records when needed', 'Monitor overall leave system health'] },
    ],
  },
];

export function LeaveFeatureSpecPanel({ isActive }: { isActive: boolean }) {
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
          <div className={styles.pageTitle}>Leave Module</div>
          <div className={styles.pageSub}>Feature specification  3 nodes  {totalFeatures} capabilities</div>
        </div>
      </header>

      <main className={styles.columns}>
        {NODES.map((node, nodeIndex) => {
          const isRevealed = revealed[nodeIndex];

          return (
            <section
              key={node.id}
              className={`${styles.node} ${styles[`node${node.variant[0].toUpperCase()}${node.variant.slice(1)}`]} ${isRevealed ? styles.nodeRevealed : ''}`}
              style={{
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? 'translate3d(0, 0, 0)' : 'translate3d(72px, 0, 0)',
                transition: 'transform 640ms cubic-bezier(0.22, 1, 0.36, 1), opacity 640ms ease',
                willChange: 'transform, opacity',
              }}
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
                    className={`${styles.featureItem} ${isRevealed ? styles.featureItemRevealed : ''}`}
                    style={{ transitionDelay: isRevealed ? `${featureIndex * FEATURE_STAGGER_MS}ms` : '0ms' }}
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
          );
        })}
      </main>

      <footer className={styles.pageFoot}>
        <span>LEAVE MODULE  {totalFeatures} CAPABILITIES ACROSS 3 NODES</span>
        <span>HOVER ANY FEATURE TO EXPAND</span>
      </footer>
    </div>
  );
}

