'use client';

const STATUS_COLORS = {
  PRESENT: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  LATE_IN: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  EARLY_OUT: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  ABSENT: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  ON_LEAVE: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  HOLIDAY: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  WEEKEND: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  PENDING_APPROVAL: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  FROZEN: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  PROCESSING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  PROCESSED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  FINALIZED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  PENDING_HR_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  PENDING_MANAGER_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  HR_APPROVED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  HR_REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  MANAGER_REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  ACTIVATION_IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  ASSETS_PENDING: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  DOCUMENTS_PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  ON_HOLD: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  ATTENTION_REQUIRED: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  READY: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
} as const;

type StatusType = keyof typeof STATUS_COLORS;

function getStatusColors(status: string) {
  if (!status) {
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }

  const normalizedStatus = status.toUpperCase().replace(/ /g, '_') as StatusType;
  return STATUS_COLORS[normalizedStatus] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  };
}

function formatStatusLabel(status: string): string {
  if (!status) return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StatusBadge({
  status,
  size = 'md',
  showDot = false,
  className = '',
}: {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}) {
  const colors = getStatusColors(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} ${className}`.trim()}
    >
      {showDot ? (
        <span className={`${dotSizes[size]} rounded-full ${colors.text.replace('text-', 'bg-')}`} />
      ) : null}
      {formatStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;
