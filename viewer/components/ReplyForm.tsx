'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReplyFormProps {
  updateId: string;
  disabled?: boolean;
}

export function ReplyForm({ updateId, disabled }: ReplyFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (disabled) {
    return (
      <div className="mt-12 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-medium">Approved.</p>
        <p className="mt-1 text-sm opacity-80">No further action needed.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, replyText: text, signerName: name || undefined }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed to submit');
      }
      router.refresh();
      setText('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-4 border-t border-neutral-200 pt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Your response
      </h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          placeholder="Optional"
        />
      </div>

      <div>
        <label htmlFor="reply" className="block text-sm font-medium text-neutral-700">
          Reply
        </label>
        <textarea
          id="reply"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          placeholder="Approve, give feedback, or ask for changes..."
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Send reply'}
      </button>
    </form>
  );
}
