// Canonical type definitions for clientcast.
// Mirror these in viewer/lib/types.ts when changes happen.

export interface ProjectConfig {
  projectId: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  hourlyRate: number;
  scopeDoc?: string;
  notifyChannel?: 'email' | 'slack' | 'none';
  slackWebhook?: string;
  viewerUrl: string;
  createdAt: string;
}

export interface Commit {
  sha: string;
  shortSha: string;
  author: string;
  date: string;
  subject: string;
  body: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface UpdateDraft {
  subject: string;
  bullets: string[];
  body: string;
}

export interface Update {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  createdAt: string;
  sinceRef: string;
  scopeDocSnapshot?: string;
  hourlyRateSnapshot: number;
  commits: Commit[];
  draft: UpdateDraft;
  status: 'pending' | 'replied' | 'approved' | 'concerns_flagged';
  replies: Reply[];
  scopeCreepFlags: ScopeCreepFlag[];
}

export interface Reply {
  id: string;
  updateId: string;
  createdAt: string;
  rawText: string;
  classification: ReplyClassification;
  signerName?: string;
}

export interface ReplyClassification {
  category: 'approve' | 'feedback' | 'scope_creep' | 'concern' | 'mixed';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  actionItems: string[];
}

export interface ScopeCreepFlag {
  id: string;
  replyId: string;
  description: string;
  estimatedHours: number;
  estimatedCost: number;
  rationale: string;
  severity: 'minor' | 'moderate' | 'major';
}
