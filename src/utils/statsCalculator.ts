/**
 * Statistics calculator for Claude config items
 */

import { ClaudeFolder, ClaudeConfigItem, ClaudeStats, TeamData } from '../types'
import { getFolderCategory } from '../constants/folderCategories'

/**
 * Calculate statistics from scanned Claude folders
 */
export function calculateStats(folders: ClaudeFolder[], teamData?: TeamData): ClaudeStats {
  const stats: ClaudeStats = {
    totalFiles: 0,
    skills: 0,
    commands: 0,
    agents: 0,
    hooks: 0,
    configs: 0,
    teams: 0,
    tasks: 0,
    teammates: 0,
    skillItems: [],
    commandItems: [],
    agentItems: [],
    teamItems: [],
  }

  for (const folder of folders) {
    processItems(folder.items, stats)

    // Count hooks from settings.json
    stats.hooks += folder.hooksCount

    // Count .mcp.json as a config file
    if (folder.mcpConfig) {
      stats.totalFiles++
      stats.configs++
    }
  }

  // Add team/task stats
  if (teamData) {
    stats.teams = teamData.teams.length
    stats.tasks = teamData.tasks.length
    stats.teammates = teamData.teams.reduce((sum, t) => sum + t.members.length, 0)
    stats.teamItems = teamData.teams.map((t) => t.name)
  }

  return stats
}

/**
 * Process items recursively and update stats
 */
function processItems(items: ClaudeConfigItem[], stats: ClaudeStats): void {
  for (const item of items) {
    if (item.type === 'file') {
      stats.totalFiles++
      const lowerName = item.name.toLowerCase()

      // Count config files (settings*.json only)
      if (lowerName.startsWith('settings') && lowerName.endsWith('.json')) {
        stats.configs++
      }
    } else if (item.children) {
      const category = getFolderCategory(item.name)

      // Only process skills, commands, agents as special categories
      if (category === 'skills' || category === 'commands' || category === 'agents') {
        processCategoryFolder(category, item.children, stats)
      } else {
        // For 'rules' and other folders, just count files recursively
        processItems(item.children, stats)
      }
    }
  }
}

/**
 * Process a category folder (skills, commands, agents)
 */
function processCategoryFolder(
  category: 'skills' | 'commands' | 'agents',
  children: ClaudeConfigItem[],
  stats: ClaudeStats,
): void {
  // For skills, commands, agents - count top-level items
  const result = countTopLevelItems(children)
  stats[category] += result.count
  stats.totalFiles += result.totalFiles

  // Collect item names
  const itemsKey = `${category.slice(0, -1)}Items` as 'skillItems' | 'commandItems' | 'agentItems'
  stats[itemsKey].push(...result.names)
}

/**
 * Count top-level items in a category folder
 * Each subfolder = 1 item, each top-level .md = 1 item
 */
function countTopLevelItems(items: ClaudeConfigItem[]): {
  count: number
  totalFiles: number
  names: string[]
} {
  let count = 0
  let totalFiles = 0
  const names: string[] = []

  for (const item of items) {
    if (item.type === 'folder') {
      // Subfolder = 1 item (skill/command/agent)
      count++
      names.push(item.name)
      totalFiles += countFilesRecursive(item.children || [])
    } else if (item.type === 'file') {
      if (item.name.toLowerCase().endsWith('.md')) {
        // Top-level .md file = 1 item
        count++
        // Remove .md extension
        names.push(item.name.replace(/\.md$/i, ''))
      }
      totalFiles++
    }
  }

  return { count, totalFiles, names }
}

/**
 * Count all files recursively
 */
function countFilesRecursive(items: ClaudeConfigItem[]): number {
  let count = 0

  for (const item of items) {
    if (item.type === 'file') {
      count++
    } else if (item.children) {
      count += countFilesRecursive(item.children)
    }
  }

  return count
}
