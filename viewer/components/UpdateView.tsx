import type { Update } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { ScopeCreepFlagList } from './ScopeCreepFlag';

export function UpdateView({ update }: { update: Update }) {
  const date = new Date(update.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-neutral-200 pb-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">{update.projectName}</p>
          <StatusBadge status={update.status} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {update.draft.subject}
        </h1>
        <p className="text-sm text-neutral-500">
          Update for {update.clientName} · {date}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Highlights
        </h2>
        <ul className="space-y-2">
          {update.draft.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-base text-neutral-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Details
        </h2>
        <div className="whitespace-pre-wrap text-base leading-relaxed text-neutral-800">
          {update.draft.body}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Commits in this update
        </h2>
        <ul className="space-y-1.5">
          {update.commits.map((c) => (
            <li key={c.sha} className="flex gap-3 text-sm text-neutral-600">
              <code className="font-mono text-xs text-neutral-400">{c.shortSha}</code>
              <span>{c.subject}</span>
            </li>
          ))}
        </ul>
      </section>

      {update.scopeCreepFlags.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Additional work estimate
          </h2>
          <ScopeCreepFlagList flags={update.scopeCreepFlags} />
        </section>
      )}

      {update.replies.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Replies
          </h2>
          <ul className="space-y-4">
            {update.replies.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>{r.signerName ?? 'Anonymous'}</span>
                  <span className="font-medium uppercase tracking-wider">
                    {r.classification.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{r.rawText}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
