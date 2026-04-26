import { execa } from 'execa';

export interface ClaudeOptions {
  model?: 'sonnet' | 'opus' | 'haiku';
  systemPrompt?: string;
  cwd?: string;
}

interface ClaudeJsonOutput {
  result?: string;
  text?: string;
  [k: string]: unknown;
}

function buildArgs(opts: ClaudeOptions, prompt: string): string[] {
  const args = ['--output-format=json', '--print'];
  if (opts.model) args.push('--model', opts.model);
  if (opts.systemPrompt) args.push('--append-system-prompt', opts.systemPrompt);
  args.push(prompt);
  return args;
}

export async function claudeText(prompt: string, opts: ClaudeOptions = {}): Promise<string> {
  const { stdout } = await execa('claude', buildArgs(opts, prompt), {
    cwd: opts.cwd,
    maxBuffer: 50_000_000,
  });
  const parsed = JSON.parse(stdout) as ClaudeJsonOutput;
  return ((parsed.result ?? parsed.text ?? '') as string).trim();
}

export async function claudeJSON<T = unknown>(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<T> {
  const text = await claudeText(prompt, opts);
  // Look for fenced JSON first, then fall back to first object/array.
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1]) as T;
  const obj = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (obj) return JSON.parse(obj[1]) as T;
  throw new Error(`Claude did not return parseable JSON. Got:\n${text.slice(0, 500)}`);
}

export async function claudeAvailable(): Promise<boolean> {
  try {
    await execa('claude', ['--version'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
