/**
 * Scanner for Claude Code usage analytics data
 * Reads: stats-cache.json, facets/*.json, history.jsonl, sessions-index.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  InsightsData,
  StatsCache,
  FacetData,
  HistoryEntry,
  SessionEntry,
  ProjectFocusEntry,
} from './insightsTypes';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_JSON_SIZE = 1024 * 1024; // 1MB per JSON file

let cachedInsights: InsightsData | null = null;
let cachedStatsMtime: number = 0;

/**
 * Scan all insights data sources from ~/.claude/
 */
export async function scanInsights(): Promise<InsightsData | null> {
  const homeDir = os.homedir();
  const claudeDir = path.join(homeDir, '.claude');

  if (!await exists(claudeDir)) {
    return null;
  }

  // Check if stats-cache.json has changed since last scan
  const statsCachePath = path.join(claudeDir, 'stats-cache.json');
  try {
    const stat = await fs.stat(statsCachePath);
    if (cachedInsights && stat.mtimeMs === cachedStatsMtime) {
      return cachedInsights;
    }
    cachedStatsMtime = stat.mtimeMs;
  } catch { /* continue with fresh scan */ }

  const [statsCache, facets, history, sessions] = await Promise.all([
    readStatsCache(statsCachePath),
    readFacets(path.join(claudeDir, 'usage-data', 'facets')),
    readHistory(path.join(claudeDir, 'history.jsonl')),
    readAllSessions(path.join(claudeDir, 'projects')),
  ]);

  const projectFocus = computeProjectFocus(history);

  cachedInsights = { statsCache, facets, sessions, projectFocus };
  return cachedInsights;
}

/**
 * Force invalidate cache (for file watcher triggers)
 */
export function invalidateInsightsCache(): void {
  cachedStatsMtime = 0;
  cachedInsights = null;
}

// ===== Helpers =====

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function safeStat(filePath: string): Promise<{ size: number } | null> {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

// ===== Data readers =====

async function readStatsCache(filePath: string): Promise<StatsCache | null> {
  try {
    const stat = await safeStat(filePath);
    if (!stat || stat.size > MAX_FILE_SIZE) return null;

    const content = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(content);

    return {
      version: json.version || 0,
      lastComputedDate: json.lastComputedDate || '',
      dailyActivity: Array.isArray(json.dailyActivity) ? json.dailyActivity : [],
      dailyModelTokens: Array.isArray(json.dailyModelTokens) ? json.dailyModelTokens : [],
      modelUsage: json.modelUsage || {},
      totalSessions: json.totalSessions || 0,
      totalMessages: json.totalMessages || 0,
      longestSession: json.longestSession || { sessionId: '', duration: 0, messageCount: 0 },
      firstSessionDate: json.firstSessionDate || '',
      hourCounts: json.hourCounts || {},
      totalSpeculationTimeSavedMs: json.totalSpeculationTimeSavedMs || 0,
    };
  } catch {
    return null;
  }
}

async function readFacets(facetsDir: string): Promise<FacetData[]> {
  const results: FacetData[] = [];

  try {
    if (!await exists(facetsDir)) return results;

    const dirEntries = await fs.readdir(facetsDir);
    const files = dirEntries.filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(facetsDir, file);
        const stat = await safeStat(filePath);
        if (!stat || stat.size > MAX_JSON_SIZE) continue;

        const content = await fs.readFile(filePath, 'utf8');
        const json = JSON.parse(content);

        if (json && typeof json === 'object' && json.session_id) {
          results.push({
            underlying_goal: json.underlying_goal || '',
            goal_categories: json.goal_categories || {},
            outcome: json.outcome || 'unknown',
            user_satisfaction_counts: json.user_satisfaction_counts || {},
            claude_helpfulness: json.claude_helpfulness || '',
            session_type: json.session_type || 'unknown',
            friction_counts: json.friction_counts || {},
            friction_detail: json.friction_detail || '',
            primary_success: json.primary_success || '',
            brief_summary: json.brief_summary || '',
            session_id: json.session_id,
          });
        }
      } catch {
        // Skip invalid facet file
      }
    }
  } catch {
    // Facets directory not accessible
  }

  return results;
}

async function readHistory(historyPath: string): Promise<HistoryEntry[]> {
  const entries: HistoryEntry[] = [];

  try {
    const stat = await safeStat(historyPath);
    if (!stat || stat.size > MAX_FILE_SIZE) return entries;

    const content = await fs.readFile(historyPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const json = JSON.parse(trimmed);
        if (json && json.timestamp && json.project) {
          entries.push({
            display: json.display || '',
            timestamp: json.timestamp,
            project: json.project,
            sessionId: json.sessionId || '',
          });
        }
      } catch {
        // Skip invalid line
      }
    }
  } catch {
    // History file not accessible
  }

  return entries;
}

async function readAllSessions(projectsDir: string): Promise<SessionEntry[]> {
  const sessions: SessionEntry[] = [];

  try {
    if (!await exists(projectsDir)) return sessions;

    const projectDirs = await fs.readdir(projectsDir, { withFileTypes: true });

    for (const dir of projectDirs) {
      if (!dir.isDirectory()) continue;

      const indexPath = path.join(projectsDir, dir.name, 'sessions-index.json');
      try {
        const stat = await safeStat(indexPath);
        if (!stat || stat.size > MAX_JSON_SIZE) continue;

        const content = await fs.readFile(indexPath, 'utf8');
        const json = JSON.parse(content);

        if (json && Array.isArray(json.entries)) {
          for (const entry of json.entries) {
            if (!entry || !entry.sessionId) continue;
            sessions.push({
              sessionId: entry.sessionId,
              firstPrompt: entry.firstPrompt || 'No prompt',
              summary: entry.summary || '',
              messageCount: entry.messageCount || 0,
              created: entry.created || '',
              modified: entry.modified || '',
              projectPath: entry.projectPath || json.originalPath || '',
              gitBranch: entry.gitBranch || '',
            });
          }
        }
      } catch {
        // Skip invalid sessions index
      }
    }
  } catch {
    // Projects directory not accessible
  }

  // Sort by most recent first
  sessions.sort((a, b) => {
    const dateA = a.modified || a.created;
    const dateB = b.modified || b.created;
    return dateB.localeCompare(dateA);
  });

  return sessions;
}

// ===== Computed analytics =====

function computeProjectFocus(history: HistoryEntry[]): ProjectFocusEntry[] {
  const projectMap = new Map<string, { sessionIds: Set<string>; messageCount: number }>();

  for (const entry of history) {
    const project = entry.project;
    if (!project) continue;

    if (!projectMap.has(project)) {
      projectMap.set(project, { sessionIds: new Set(), messageCount: 0 });
    }
    const data = projectMap.get(project)!;
    if (entry.sessionId) {
      data.sessionIds.add(entry.sessionId);
    }
    data.messageCount++;
  }

  const results: ProjectFocusEntry[] = [];
  for (const [project, data] of projectMap) {
    const displayName = path.basename(project) || project;
    results.push({
      project,
      displayName,
      sessionCount: data.sessionIds.size,
      messageCount: data.messageCount,
    });
  }

  // Sort by message count descending
  results.sort((a, b) => b.messageCount - a.messageCount);
  return results;
}
