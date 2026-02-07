/**
 * Scanner for Claude Code usage analytics data
 * Reads: stats-cache.json, facets/*.json, history.jsonl, sessions-index.json
 *
 * Cache strategy:
 *   - statsCache: only refreshed when stats-cache.json mtime changes (manual /stats trigger)
 *   - live data (facets, sessions, projectFocus): refreshed when history.jsonl mtime changes
 */

import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import {
  FacetData,
  HistoryEntry,
  InsightsData,
  ProjectFocusEntry,
  SessionEntry,
  StatsCache,
} from './insightsTypes'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_JSON_SIZE = 1024 * 1024 // 1MB per JSON file

// Separate cache tracking for stats-cache vs live data
let cachedStatsCache: StatsCache | null = null
let cachedStatsMtime: number = 0
let cachedLiveData: {
  facets: FacetData[]
  sessions: SessionEntry[]
  projectFocus: ProjectFocusEntry[]
} | null = null
let cachedHistoryMtime: number = 0

/**
 * Scan all insights data sources from ~/.claude/
 */
export async function scanInsights(): Promise<InsightsData | null> {
  const homeDir = os.homedir()
  const claudeDir = path.join(homeDir, '.claude')

  if (!(await exists(claudeDir))) {
    return null
  }

  const statsCachePath = path.join(claudeDir, 'stats-cache.json')
  const historyPath = path.join(claudeDir, 'history.jsonl')

  // Check mtimes to decide what to refresh
  let statsChanged = false
  let liveChanged = false

  try {
    const stat = await fs.stat(statsCachePath)
    if (stat.mtimeMs !== cachedStatsMtime) {
      cachedStatsMtime = stat.mtimeMs
      statsChanged = true
    }
  } catch {
    statsChanged = !cachedStatsCache
  }

  try {
    const stat = await fs.stat(historyPath)
    if (stat.mtimeMs !== cachedHistoryMtime) {
      cachedHistoryMtime = stat.mtimeMs
      liveChanged = true
    }
  } catch {
    liveChanged = !cachedLiveData
  }

  // Nothing changed — return cached
  if (!statsChanged && !liveChanged && cachedStatsCache !== undefined && cachedLiveData) {
    return { statsCache: cachedStatsCache, ...cachedLiveData }
  }

  // Refresh only what changed
  const promises: [
    Promise<StatsCache | null>,
    Promise<FacetData[]>,
    Promise<HistoryEntry[]>,
    Promise<SessionEntry[]>,
  ] = [
    statsChanged ? readStatsCache(statsCachePath) : Promise.resolve(cachedStatsCache),
    liveChanged
      ? readFacets(path.join(claudeDir, 'usage-data', 'facets'))
      : Promise.resolve(cachedLiveData?.facets || []),
    liveChanged ? readHistory(historyPath) : Promise.resolve([]), // dummy, won't be used
    liveChanged
      ? readAllSessions(path.join(claudeDir, 'projects'))
      : Promise.resolve(cachedLiveData?.sessions || []),
  ]

  const [statsCache, facets, history, sessions] = await Promise.all(promises)

  if (statsChanged) {
    cachedStatsCache = statsCache
  }

  if (liveChanged) {
    const projectFocus = computeProjectFocus(history)
    cachedLiveData = { facets, sessions, projectFocus }
  }

  return { statsCache: cachedStatsCache, ...cachedLiveData! }
}

/**
 * Invalidate live data cache (history, sessions, facets)
 */
export function invalidateLiveCache(): void {
  cachedHistoryMtime = 0
  cachedLiveData = null
}

/**
 * Invalidate stats cache (stats-cache.json)
 */
export function invalidateStatsCache(): void {
  cachedStatsMtime = 0
  cachedStatsCache = null
}

/**
 * Force invalidate all caches
 */
export function invalidateInsightsCache(): void {
  invalidateStatsCache()
  invalidateLiveCache()
}

// ===== Helpers =====

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function safeStat(filePath: string): Promise<{ size: number } | null> {
  try {
    return await fs.stat(filePath)
  } catch {
    return null
  }
}

// ===== Data readers =====

async function readStatsCache(filePath: string): Promise<StatsCache | null> {
  try {
    const stat = await safeStat(filePath)
    if (!stat || stat.size > MAX_FILE_SIZE) return null

    const content = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(content)

    return {
      version: json.version || 0,
      lastComputedDate: json.lastComputedDate || '',
      dailyActivity: Array.isArray(json.dailyActivity) ? json.dailyActivity : [],
      dailyModelTokens: Array.isArray(json.dailyModelTokens) ? json.dailyModelTokens : [],
      modelUsage: json.modelUsage || {},
      totalSessions: json.totalSessions || 0,
      totalMessages: json.totalMessages || 0,
      longestSession: json.longestSession || {
        sessionId: '',
        duration: 0,
        messageCount: 0,
      },
      firstSessionDate: json.firstSessionDate || '',
      hourCounts: json.hourCounts || {},
      totalSpeculationTimeSavedMs: json.totalSpeculationTimeSavedMs || 0,
    }
  } catch {
    return null
  }
}

async function readFacets(facetsDir: string): Promise<FacetData[]> {
  const results: FacetData[] = []

  try {
    if (!(await exists(facetsDir))) return results

    const dirEntries = await fs.readdir(facetsDir)
    const files = dirEntries.filter((f) => f.endsWith('.json'))

    for (const file of files) {
      try {
        const filePath = path.join(facetsDir, file)
        const stat = await safeStat(filePath)
        if (!stat || stat.size > MAX_JSON_SIZE) continue

        const content = await fs.readFile(filePath, 'utf8')
        const json = JSON.parse(content)

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
          })
        }
      } catch {
        // Skip invalid facet file
      }
    }
  } catch {
    // Facets directory not accessible
  }

  return results
}

async function readHistory(historyPath: string): Promise<HistoryEntry[]> {
  const entries: HistoryEntry[] = []

  try {
    const stat = await safeStat(historyPath)
    if (!stat || stat.size > MAX_FILE_SIZE) return entries

    const content = await fs.readFile(historyPath, 'utf8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const json = JSON.parse(trimmed)
        if (json && json.timestamp && json.project) {
          entries.push({
            display: json.display || '',
            timestamp: json.timestamp,
            project: json.project,
            sessionId: json.sessionId || '',
          })
        }
      } catch {
        // Skip invalid line
      }
    }
  } catch {
    // History file not accessible
  }

  return entries
}

async function readAllSessions(projectsDir: string): Promise<SessionEntry[]> {
  const sessions: SessionEntry[] = []

  try {
    if (!(await exists(projectsDir))) return sessions

    const projectDirs = await fs.readdir(projectsDir, { withFileTypes: true })

    for (const dir of projectDirs) {
      if (!dir.isDirectory()) continue

      const dirPath = path.join(projectsDir, dir.name)
      const indexedIds = new Set<string>()

      // 1. Read sessions-index.json (if exists)
      const indexPath = path.join(dirPath, 'sessions-index.json')
      try {
        const stat = await safeStat(indexPath)
        if (stat && stat.size <= MAX_JSON_SIZE) {
          const content = await fs.readFile(indexPath, 'utf8')
          const json = JSON.parse(content)

          if (json && Array.isArray(json.entries)) {
            for (const entry of json.entries) {
              if (!entry?.sessionId) continue
              indexedIds.add(entry.sessionId)
              sessions.push({
                sessionId: entry.sessionId,
                firstPrompt: entry.firstPrompt || 'No prompt',
                summary: entry.summary || '',
                messageCount: entry.messageCount || 0,
                created: entry.created || '',
                modified: entry.modified || '',
                projectPath: entry.projectPath || json.originalPath || '',
                gitBranch: entry.gitBranch || '',
              })
            }
          }
        }
      } catch {
        // No index or invalid — will fallback to .jsonl scan
      }

      // 2. Scan .jsonl files not covered by the index
      try {
        const files = await fs.readdir(dirPath)
        const unindexed = files.filter(
          (f) => f.endsWith('.jsonl') && !indexedIds.has(path.basename(f, '.jsonl')),
        )

        const extraEntries = await Promise.all(
          unindexed.map((f) =>
            extractSessionFromJsonl(path.join(dirPath, f), path.basename(f, '.jsonl')),
          ),
        )

        for (const entry of extraEntries) {
          if (entry) sessions.push(entry)
        }
      } catch {
        // Can't read directory
      }
    }
  } catch {
    // Projects directory not accessible
  }

  // Sort by most recent first
  sessions.sort((a, b) => {
    const dateA = a.modified || a.created
    const dateB = b.modified || b.created
    return dateB.localeCompare(dateA)
  })

  return sessions
}

/**
 * Extract session metadata directly from a .jsonl session file.
 * Used as fallback when sessions-index.json is stale or missing.
 */
async function extractSessionFromJsonl(
  filePath: string,
  sessionId: string,
): Promise<SessionEntry | null> {
  try {
    const stat = await fs.stat(filePath)
    if (stat.size > MAX_FILE_SIZE) return null

    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')

    let projectPath = ''
    let gitBranch = ''
    let firstPrompt = ''
    let metaPrompt = ''
    let messageCount = 0
    let firstTimestamp = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const json = JSON.parse(trimmed)

        // Creation timestamp from first snapshot
        if (!firstTimestamp && json.type === 'file-history-snapshot') {
          firstTimestamp = json.snapshot?.timestamp || ''
        }

        if (json.type === 'user' || json.type === 'assistant') {
          messageCount++
        }

        if (json.type === 'user') {
          // Extract project path & branch from first user message
          if (!projectPath && json.cwd) {
            projectPath = json.cwd
            gitBranch = json.gitBranch || ''
          }

          // Extract first prompt content
          const msgContent =
            typeof json.message?.content === 'string' ? json.message.content.slice(0, 200) : ''
          if (msgContent) {
            if (json.isMeta && !metaPrompt) {
              metaPrompt = msgContent
            } else if (!json.isMeta && !firstPrompt) {
              firstPrompt = msgContent
            }
          }
        }
      } catch {
        // Skip invalid line
      }
    }

    if (!projectPath) return null

    const modified = new Date(stat.mtimeMs).toISOString()
    const created = firstTimestamp || modified

    return {
      sessionId,
      firstPrompt: firstPrompt || metaPrompt || 'No prompt',
      summary: '',
      messageCount,
      created,
      modified,
      projectPath,
      gitBranch,
    }
  } catch {
    return null
  }
}

// ===== Computed analytics =====

function computeProjectFocus(history: HistoryEntry[]): ProjectFocusEntry[] {
  const projectMap = new Map<string, { sessionIds: Set<string>; messageCount: number }>()

  for (const entry of history) {
    const project = entry.project
    if (!project) continue

    if (!projectMap.has(project)) {
      projectMap.set(project, { sessionIds: new Set(), messageCount: 0 })
    }
    const data = projectMap.get(project)!
    if (entry.sessionId) {
      data.sessionIds.add(entry.sessionId)
    }
    data.messageCount++
  }

  const results: ProjectFocusEntry[] = []
  for (const [project, data] of projectMap) {
    const displayName = path.basename(project) || project
    results.push({
      project,
      displayName,
      sessionCount: data.sessionIds.size,
      messageCount: data.messageCount,
    })
  }

  // Sort by message count descending
  results.sort((a, b) => b.messageCount - a.messageCount)
  return results
}
