'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScopeCreepFlag } from '@/lib/types';

const severityTone: Record<ScopeCreepFlag['severity'], string> = {
  minor: 'bg-amber-50 ring-amber-200 text-amber-900',
  moderate: 'bg-amber-100 ring-amber-300 text-amber-900',
  major: 'bg-red-50 ring-red-200 text-red-900',
};

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function ScopeCreepFlagList({
  flags,
  updateId,
  stripeEnabled,
}: {
  flags: ScopeCreepFlag[];
  updateId: string;
  stripeEnabled?: boolean;
}) {
  const total = flags.reduce((s, f) => s + f.estimatedCost, 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-700">
        {flags.length} item{flags.length === 1 ? '' : 's'} look{flags.length === 1 ? 's' : ''} like additional work beyond the original project scope.
        Estimated additional cost: <span className="font-semibold">{formatCurrency(total)}</span>.
      </p>
      <ul className="space-y-2">
        {flags.map((f) => (
          <FlagItem key={f.id} flag={f} updateId={updateId} stripeEnabled={stripeEnabled} />
        ))}
      </ul>
    </div>
  );
}

function FlagItem({
  flag,
  updateId,
  stripeEnabled,
}: {
  flag: ScopeCreepFlag;
  updateId: string;
  stripeEnabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function approveAndInvoice() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, flagId: flag.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Failed');
      router.refresh();
      if (data.paymentLink) window.open(data.paymentLink, '_blank');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`rounded-lg p-4 ring-1 ring-inset ${severityTone[flag.severity]}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider">{flag.severity}</span>
        <span className="text-sm font-medium">
          ~{flag.estimatedHours}h · {formatCurrency(flag.estimatedCost)}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium">{flag.description}</p>
      <p className="mt-1 text-sm opacity-80">{flag.rationale}</p>

      {stripeEnabled && !flag.paymentLink && (
        <div className="mt-3">
          <button
            type="button"
            onClick={approveAndInvoice}
            disabled={busy}
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? 'Generating…' : `Approve & invoice ${formatCurrency(flag.estimatedCost)}`}
          </button>
          {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
        </div>
      )}

      {flag.paymentLink && (
        <div className="mt-3">
          <a
            href={flag.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800"
          >
            Pay {formatCurrency(flag.estimatedCost)} →
          </a>
          <p className="mt-1 text-xs opacity-70">Payment link active</p>
        </div>
      )}
    </li>
  );
}
