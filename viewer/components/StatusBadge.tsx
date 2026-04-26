import type { Update } from '@/lib/types';

const labels: Record<Update['status'], string> = {
  pending: 'Awaiting review',
  replied: 'Reply received',
  approved: 'Approved',
  concerns_flagged: 'Concerns flagged',
};

const tones: Record<Update['status'], string> = {
  pending: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  replied: 'bg-blue-50 text-blue-700 ring-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  concerns_flagged: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function StatusBadge({ status }: { status: Update['status'] }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tones[status]}`}
    >
      {labels[status]}
    </span>
  );
}
