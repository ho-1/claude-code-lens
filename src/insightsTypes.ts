/**
 * Type definitions for Claude Code usage analytics / insights
 */

// ===== Raw data structures (matching ~/.claude/ file formats) =====

export interface StatsCache {
  version: number
  lastComputedDate: string
  dailyActivity: DailyActivity[]
  dailyModelTokens: DailyModelTokens[]
  modelUsage: Record<string, ModelUsageEntry>
  totalSessions: number
  totalMessages: number
  longestSession: LongestSession
  firstSessionDate: string
  hourCounts: Record<string, number>
  totalSpeculationTimeSavedMs: number
}

export interface DailyActivity {
  date: string // "2026-01-17"
  messageCount: number
  sessionCount: number
  toolCallCount: number
}

export interface DailyModelTokens {
  date: string
  tokensByModel: Record<string, number>
}

export interface ModelUsageEntry {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens: number
  cacheCreationInputTokens: number
  webSearchRequests?: number
  costUSD?: number
}

export interface LongestSession {
  sessionId: string
  duration: number
  messageCount: number
  timestamp?: string
}

export interface FacetData {
  underlying_goal?: string
  goal_categories: Record<string, number>
  outcome: string
  user_satisfaction_counts: Record<string, number>
  claude_helpfulness?: string
  session_type: string
  friction_counts: Record<string, number>
  friction_detail?: string
  primary_success?: string
  brief_summary: string
  session_id: string
}

export interface HistoryEntry {
  display: string
  timestamp: number
  project: string
  sessionId: string
}

export interface SessionEntry {
  sessionId: string
  firstPrompt: string
  summary: string
  messageCount: number
  created: string
  modified: string
  projectPath: string
  gitBranch?: string
}

// ===== Aggregated data for rendering =====

export interface ProjectFocusEntry {
  project: string
  displayName: string
  sessionCount: number
  messageCount: number
}

export interface InsightsData {
  statsCache: StatsCache | null
  facets: FacetData[]
  sessions: SessionEntry[]
  projectFocus: ProjectFocusEntry[]
}
