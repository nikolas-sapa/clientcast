import { describe, it, expect } from 'vitest';
import { loadUpdateLocal, saveUpdateLocal } from '../src/lib/local-store.js';
import type { Update } from '../src/lib/types.js';

describe('local store ID boundary', () => {
  it.each(['', '.', '..', '../outside', 'a/b', '/outside', 'a\\b'])(
    'rejects unsafe ID %j before filesystem access', async (id) => {
      await expect(loadUpdateLocal(id)).rejects.toThrow(/invalid update id/i);
      await expect(saveUpdateLocal({ id } as Update)).rejects.toThrow(/invalid update id/i);
    }
  );
});
