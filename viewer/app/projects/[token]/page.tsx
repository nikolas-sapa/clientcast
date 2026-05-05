import { notFound } from 'next/navigation';
import { fetchProjectIndex } from '@/lib/project-index';
import { fetchUpdate } from '@/lib/blob';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import type { Update } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const index = await fetchProjectIndex(token);
  if (!index) notFound();

  const updates = await Promise.all(index.updateIds.slice(0, 50).map((id) => fetchUpdate(id)));
  const valid = updates.filter((u): u is Update => u !== null);

  const totalFlagged = valid.reduce(
    (s, u) => s + u.scopeCreepFlags.reduce((a, f) => a + f.estimatedCost, 0),
    0
  );
  const replied = valid.filter((u) => u.replies.length > 0).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header className="mb-12 space-y-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Project dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {index.projectName}
        </h1>
        <p className="text-sm text-neutral-500">
          {valid.length} update{valid.length === 1 ? '' : 's'} · {replied} replied · ~$
          {totalFlagged.toLocaleString()} additional work flagged
        </p>
      </header>

      <ul className="space-y-3">
        {valid.map((u) => (
          <li
            key={u.id}
            className="rounded-lg border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300"
          >
            <Link href={`/u/${u.id}`} className="block">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-900">{u.draft.subject}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {u.commits.length} commit{u.commits.length === 1 ? '' : 's'}
                    {u.scopeCreepFlags.length > 0 && (
                      <>
                        {' · '}
                        <span className="font-medium text-amber-700">
                          {u.scopeCreepFlags.length} flagged ($
                          {u.scopeCreepFlags
                            .reduce((s, f) => s + f.estimatedCost, 0)
                            .toLocaleString()}
                          )
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <StatusBadge status={u.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {valid.length === 0 && (
        <p className="text-sm text-neutral-500">No updates yet for this project.</p>
      )}
    </main>
  );
}
