import { notFound } from 'next/navigation';
import { fetchUpdate } from '@/lib/blob';
import { UpdateView } from '@/components/UpdateView';
import { ReplyForm } from '@/components/ReplyForm';

export const dynamic = 'force-dynamic';

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await fetchUpdate(id);
  if (!update) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <UpdateView update={update} />
      <ReplyForm updateId={id} disabled={update.status === 'approved'} />
    </main>
  );
}
