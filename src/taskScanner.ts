/**
 * Scanner for ~/.claude/tasks/ directories
 * Discovers task items and maps them to workspace projects via sessions-index
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { TaskItem, TaskStatus } from './types'

const MAX_JSON_SIZE = 1024 * 1024 // 1MB

/**
 * Scan all tasks from ~/.claude/tasks/ with project path mapping
 */
export async function scanTasks(): Promise<TaskItem[]> {
  const homeDir = os.homedir()
  const tasksDir = path.join(homeDir, '.claude', 'tasks')
  const projectsDir = path.join(homeDir, '.claude', 'projects')

  const [sessionProjectMap, tasks] = await Promise.all([
    buildSessionProjectMap(projectsDir),
    readAllTasks(tasksDir),
  ])

  // Attach projectPath to each task via sessionId (= teamName = directory name)
  for (const task of tasks) {
    const projectPath = sessionProjectMap.get(task.teamName)
    if (projectPath) {
      task.projectPath = projectPath
    }
  }

  return tasks
}

/**
 * Build a Map<sessionId, projectPath> from sessions-index.json files
 */
async function buildSessionProjectMap(projectsDir: string): Promise<Map<string, string>> {
  const map = new Map<string, string>()

  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const indexPath = path.join(projectsDir, entry.name, 'sessions-index.json')
      try {
        const stat = await fs.stat(indexPath)
        if (stat.size > MAX_JSON_SIZE) continue

        const content = await fs.readFile(indexPath, 'utf8')
        const json = JSON.parse(content)

        if (!json || !Array.isArray(json.entries)) continue

        // Derive projectPath from directory name or entry data
        const projectPath = json.originalPath || projectKeyToPath(entry.name)

        for (const e of json.entries) {
          if (e && e.sessionId) {
            map.set(e.sessionId, e.projectPath || projectPath)
          }
        }
      } catch {
        // Skip unreadable index
      }
    }
  } catch {
    // Projects directory not accessible
  }

  return map
}

/**
 * Convert project directory key back to filesystem path
 * e.g. "-Users-ho-1-dev-foo" → "/Users/ho-1/dev/foo"
 */
function projectKeyToPath(key: string): string {
  if (!key || key === '-') return ''
  return key.replace(/^-/, '/').replace(/-/g, '/')
}

/**
 * Read all task items from ~/.claude/tasks/
 */
async function readAllTasks(tasksDir: string): Promise<TaskItem[]> {
  const tasks: TaskItem[] = []

  try {
    await fs.access(tasksDir)
  } catch {
    return tasks
  }

  try {
    const teamEntries = await fs.readdir(tasksDir, { withFileTypes: true })

    for (const teamEntry of teamEntries) {
      if (!teamEntry.isDirectory()) continue

      const teamTaskDir = path.join(tasksDir, teamEntry.name)

      try {
        const taskFiles = await fs.readdir(teamTaskDir, { withFileTypes: true })

        for (const taskFile of taskFiles) {
          if (!taskFile.isFile() || !taskFile.name.endsWith('.json')) continue

          const taskPath = path.join(teamTaskDir, taskFile.name)
          try {
            const stat = await fs.stat(taskPath)
            if (stat.size > MAX_JSON_SIZE) continue

            const content = await fs.readFile(taskPath, 'utf8')
            const json = JSON.parse(content)

            const taskEntries = Array.isArray(json) ? json : [json]

            for (const t of taskEntries) {
              if (!t || typeof t !== 'object') continue

              tasks.push({
                id: String(t.id || t.taskId || taskFile.name.replace('.json', '')),
                subject: String(t.subject || t.title || t.name || 'Untitled'),
                description: t.description || undefined,
                status: validateStatus(t.status),
                owner: t.owner || undefined,
                blockedBy: Array.isArray(t.blockedBy) ? t.blockedBy.map(String) : undefined,
                blocks: Array.isArray(t.blocks) ? t.blocks.map(String) : undefined,
                teamName: teamEntry.name,
                filePath: taskPath,
              })
            }
          } catch {
            // Skip invalid task file
          }
        }
      } catch {
        // Skip unreadable team task directory
      }
    }
  } catch {
    // Tasks directory not accessible
  }

  return tasks
}

function validateStatus(status: unknown): TaskStatus {
  if (status === 'pending' || status === 'in_progress' || status === 'completed') {
    return status
  }
  return 'pending'
}
