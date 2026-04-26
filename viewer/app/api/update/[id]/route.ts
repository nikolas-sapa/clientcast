import { NextResponse } from 'next/server';
import { fetchUpdate } from '@/lib/blob';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const update = await fetchUpdate(id);
  if (!update) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(update);
}
