import type { ScopeCreepFlag } from '@/lib/types';

const severityTone: Record<ScopeCreepFlag['severity'], string> = {
  minor: 'bg-amber-50 ring-amber-200 text-amber-900',
  moderate: 'bg-amber-100 ring-amber-300 text-amber-900',
  major: 'bg-red-50 ring-red-200 text-red-900',
};

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function ScopeCreepFlagList({ flags }: { flags: ScopeCreepFlag[] }) {
  const total = flags.reduce((s, f) => s + f.estimatedCost, 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-700">
        {flags.length} item{flags.length === 1 ? '' : 's'} appear{flags.length === 1 ? 's' : ''} to fall outside the original scope.
        Estimated impact: <span className="font-semibold">{formatCurrency(total)}</span>.
      </p>
      <ul className="space-y-2">
        {flags.map((f) => (
          <li
            key={f.id}
            className={`rounded-lg p-4 ring-1 ring-inset ${severityTone[f.severity]}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {f.severity}
              </span>
              <span className="text-sm font-medium">
                ~{f.estimatedHours}h · {formatCurrency(f.estimatedCost)}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium">{f.description}</p>
            <p className="mt-1 text-sm opacity-80">{f.rationale}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
