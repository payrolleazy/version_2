import type { CandidatePipelineRow, RequisitionBindingRow } from '@/lib/recruiter/contracts';

export function formatLabel(value: string | null | undefined) {
  if (!value) return 'Pending';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Needs review';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Needs review';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTimeRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start) return 'Time not set';
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return 'Time not set';

  const formatter = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const startText = formatter.format(startDate);
  if (!end) return startText;

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return startText;
  return `${startText} - ${formatter.format(endDate)}`;
}

export function getDaysOpen(openedAt: string | null | undefined, closedAt: string | null | undefined) {
  if (!openedAt) return null;
  const start = new Date(openedAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = closedAt ? new Date(closedAt) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getDaysSinceUpdate(value: string | null | undefined) {
  if (!value) return null;
  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return null;

  return Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getMetaLabel(meta: Record<string, unknown> | null, keys: string[]) {
  if (!meta) return null;
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return null;
}

export function getRequisitionTitle(row: RequisitionBindingRow) {
  return (
    getMetaLabel(row.meta, ['requisition_title', 'position_name', 'title', 'position_title']) ??
    `Requisition ${row.requisition_uuid.slice(0, 8)}`
  );
}

export function getCandidateDisplayName(candidate: CandidatePipelineRow) {
  const sourceMetaName =
    typeof candidate.source_metadata?.candidate_name === 'string'
      ? candidate.source_metadata.candidate_name
      : null;
  const metaName = typeof candidate.meta?.candidate_name === 'string' ? candidate.meta.candidate_name : null;
  return sourceMetaName ?? metaName ?? `Candidate ${candidate.id.slice(0, 8)}`;
}

export function getCandidateRole(candidate: CandidatePipelineRow) {
  const sourceRole =
    typeof candidate.source_metadata?.applied_role === 'string'
      ? candidate.source_metadata.applied_role
      : null;
  const metaRole = typeof candidate.meta?.applied_role === 'string' ? candidate.meta.applied_role : null;
  return sourceRole ?? metaRole ?? 'Role not mapped';
}

export function getCandidateSourceLabel(candidate: CandidatePipelineRow) {
  if (candidate.source_code && candidate.source_code.trim().length > 0) {
    return formatLabel(candidate.source_code);
  }
  return 'Direct pipeline';
}

export function getScoreValue(score: number | string | null) {
  if (typeof score === 'number') return score;
  if (typeof score === 'string' && score.trim().length > 0) {
    const parsed = Number(score);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function isFreshCandidate(row: CandidatePipelineRow) {
  const days = getDaysSinceUpdate(row.updated_at ?? row.created_at);
  return typeof days === 'number' ? days <= 7 : false;
}

export function isStaleCandidate(row: CandidatePipelineRow) {
  const days = getDaysSinceUpdate(row.updated_at ?? row.created_at);
  return typeof days === 'number' ? days > 7 : false;
}

export function getPanelCount(panelJson: Record<string, unknown> | null) {
  if (!panelJson || typeof panelJson !== 'object') return 0;
  if (Array.isArray((panelJson as Record<string, unknown>).panel)) {
    return ((panelJson as Record<string, unknown>).panel as unknown[]).length;
  }
  if (Array.isArray((panelJson as Record<string, unknown>).interviewers)) {
    return ((panelJson as Record<string, unknown>).interviewers as unknown[]).length;
  }
  return Object.values(panelJson).filter(Boolean).length;
}
