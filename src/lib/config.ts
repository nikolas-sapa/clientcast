import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { ProjectConfig } from './types.js';

const ConfigSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  hourlyRate: z.number().nonnegative(),
  scopeDoc: z.string().optional(),
  notifyChannel: z.enum(['email', 'slack', 'none']).optional(),
  slackWebhook: z.string().url().optional(),
  viewerUrl: z.string().url(),
  createdAt: z.string(),
});

export const CONFIG_FILENAME = '.clientcast.json';

export function configPath(projectDir: string): string {
  return join(projectDir, CONFIG_FILENAME);
}

export function isInitialized(projectDir: string): boolean {
  return existsSync(configPath(projectDir));
}

export function loadConfig(projectDir: string): ProjectConfig {
  const path = configPath(projectDir);
  if (!existsSync(path)) {
    throw new Error(
      'clientcast not initialized in this project. Run `clientcast init` first.'
    );
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return ConfigSchema.parse(raw);
}

export function saveConfig(projectDir: string, config: ProjectConfig): void {
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });
  writeFileSync(configPath(projectDir), JSON.stringify(config, null, 2));
}
