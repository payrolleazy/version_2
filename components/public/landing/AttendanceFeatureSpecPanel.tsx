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

const REVEAL_DELAYS = [0, 200, 400];
const FEATURE_STAGGER_MS = 55;

const NODES: FeatureNode[] = [
  {
    id: 'core',
    variant: 'core',
    ghost: '01',
    tag: 'CORE',
    title: ['Core', 'Attendance'],
    features: [
      { name: 'Assured Punch Capture', subs: ['Async queue + deduplication', 'Idempotency guarantee', 'Status-trackable punches'] },
      { name: 'Attendance Truth Validation', subs: ['Shift & schedule check', 'Geofence  IP  source verify', 'Company policy gate'] },
      { name: 'Regularization Workflow', subs: ['Request  cancel  approve paths', 'Bulk correction support', 'Full audit trail'] },
      { name: 'Auto Clock-Out Handling', subs: ['Dedicated runtime path', 'Rule-based trigger', 'Independent of manual action'] },
      { name: 'Employee Attendance Dashboard', subs: ['Attendance visibility', 'Pending punch state', 'Personal history view'] },
      { name: 'Mood Capture', subs: ['Daily mood score intake', 'Linked to attendance record', 'Optional per policy'] },
      { name: 'Workday Sentiment Analysis', subs: ['Built on captured mood data', 'Trend detection', 'Manager-visible signal'] },
    ],
  },
  {
    id: 'bio',
    variant: 'bio',
    ghost: '02',
    tag: 'BIO',
    title: ['Biometric', 'Integration'],
    features: [
      { name: 'Connector Registry', subs: ['Tenant-level connectors', 'Provider  auth  poll config', 'Status management'] },
      { name: 'Device Registry', subs: ['Device code  serial  location', 'Operational status tracking', 'Per-connector linkage'] },
      { name: 'Raw Punch Intake', subs: ['Upstream punches stored raw', 'No direct truth mutation', 'Log-first architecture'] },
      { name: 'Normalized Punch Pipeline', subs: ['Direction  date  device ctx', 'Geo payload + dedupe hash', 'Pre-publish normalization'] },
      { name: 'Employee Mapping Engine', subs: ['External code  platform user', 'Mapping status + confidence score', 'Source-tagged records'] },
      { name: 'Reconciliation Dashboard', subs: ['Unmapped & conflict surfacing', 'Exception-first review', 'No silent drops'] },
      { name: 'Case Resolution Actions', subs: ['Ignore  map  retry publish', 'Admin-controlled resolution', 'Full case audit'] },
      { name: 'Publish Readiness Validation', subs: ['Mapping + date + direction check', 'Open case gate', 'Employee anchor verify'] },
      { name: 'Controlled Attendance Publish', subs: ['Publish via truth function only', 'Publish log + retry state', 'BIO  AMS controlled path'] },
      { name: 'Connector Sync Runtime', subs: ['Internal sync worker', 'Pull  ingest  normalize  publish', 'Configurable per connector'] },
      { name: 'Flat File Upload Intake', subs: ['CSV and TXT support', 'Dedicated upload runtime', 'Parser configuration'] },
      { name: 'Source Onboarding Layer', subs: ['Source profiles', 'Onboarding state tracking', 'Guided setup flow'] },
      { name: 'Field Mapping Layer', subs: ['Mapping profiles + rules', 'Transform strategies', 'Trim  parse  normalize'] },
      { name: 'Import Session Workflow', subs: ['Upload  parse  preview', 'Approval  publish lifecycle', 'Session state tracking'] },
      { name: 'Validation Summary Layer', subs: ['Ready  duplicate  unmapped', 'Invalid timestamp  direction', 'Publish-blocked classification'] },
      { name: 'Preview & Import Runs', subs: ['API + DB preview runs', 'Claim  complete  recover', 'Dedicated run model'] },
    ],
  },
  {
    id: 'gam',
    variant: 'gam',
    ghost: '03',
    tag: 'GAMIFY',
    title: ['Gamify', 'Attendance'],
    features: [
      { name: 'Attendance Discipline Scoring', subs: ['Present  punctuality  OT bonus', 'Geofence + mood-linked rules', 'Score events per record'] },
      { name: 'Rule-Based Badge Awards', subs: ['Threshold-driven (score  streak)', 'Config not hardcode', 'Window-based evaluation'] },
      { name: 'Leaderboard Snapshots', subs: ['Scope + window ranking', 'Top-N payload generation', 'Periodic snapshot model'] },
      { name: 'Recognition Events', subs: ['Message + points to user', 'Attendance-linked trigger', 'Peer recognition support'] },
      { name: 'Participation Controls', subs: ['Leaderboard opt-in', 'Recognition opt-in', 'Per-user settings'] },
      { name: 'Reward Acknowledgement', subs: ['Badge acknowledge', 'Recognition acknowledge', 'Explicit user action'] },
      { name: 'Admin Rule Control', subs: ['Scoring rule management', 'Badge rule management', 'Leaderboard + recognition rules'] },
      { name: 'Reversible Score Administration', subs: ['Score event reversal', 'Explicit admin flow', 'No silent mutation'] },
      { name: 'Async Refresh Runtime', subs: ['Score  summary  badge refresh', 'Leaderboard worker queue', 'Recovery + execution logs'] },
    ],
  },
];

export function AttendanceFeatureSpecPanel({ isActive }: { isActive: boolean }) {
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
          <div className={styles.pageTitle}>Attendance Module</div>
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
        <span>ATTENDANCE MODULE  {totalFeatures} CAPABILITIES ACROSS 3 NODES</span>
        <span>HOVER ANY FEATURE TO EXPAND</span>
      </footer>
    </div>
  );
}

