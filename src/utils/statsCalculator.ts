/**
 * Statistics calculator for Claude config items
 */

import { ClaudeFolder, ClaudeConfigItem, ClaudeStats } from '../types';
import { getFolderCategory } from '../constants/folderCategories';

/**
 * Calculate statistics from scanned Claude folders
 */
export function calculateStats(folders: ClaudeFolder[]): ClaudeStats {
  const stats: ClaudeStats = {
    totalFiles: 0,
    skills: 0,
    commands: 0,
    agents: 0,
    hooks: 0,
    configs: 0,
  };

  for (const folder of folders) {
    processItems(folder.items, stats);
  }

  return stats;
}

/**
 * Process items recursively and update stats
 */
function processItems(items: ClaudeConfigItem[], stats: ClaudeStats): void {
  for (const item of items) {
    if (item.type === 'file') {
      stats.totalFiles++;
      const lowerName = item.name.toLowerCase();

      // Count config files (settings*.json only)
      if (lowerName.startsWith('settings') && lowerName.endsWith('.json')) {
        stats.configs++;
      }
    } else if (item.children) {
      const category = getFolderCategory(item.name);

      if (category) {
        processCategoryFolder(category, item.children, stats);
      } else {
        processItems(item.children, stats);
      }
    }
  }
}

/**
 * Process a category folder (skills, commands, agents, hooks)
 */
function processCategoryFolder(
  category: 'skills' | 'commands' | 'agents' | 'hooks',
  children: ClaudeConfigItem[],
  stats: ClaudeStats
): void {
  if (category === 'hooks') {
    // For hooks, count all files
    stats.hooks += countFilesInFolder(children, stats);
  } else {
    // For skills, commands, agents - count top-level items
    const result = countTopLevelItems(children);
    stats[category] += result.count;
    stats.totalFiles += result.totalFiles;
  }
}

/**
 * Count top-level items in a category folder
 * Each subfolder = 1 item, each top-level .md = 1 item
 */
function countTopLevelItems(items: ClaudeConfigItem[]): { count: number; totalFiles: number } {
  let count = 0;
  let totalFiles = 0;

  for (const item of items) {
    if (item.type === 'folder') {
      // Subfolder = 1 item (skill/command/agent)
      count++;
      totalFiles += countFilesRecursive(item.children || []);
    } else if (item.type === 'file') {
      if (item.name.toLowerCase().endsWith('.md')) {
        // Top-level .md file = 1 item
        count++;
      }
      totalFiles++;
    }
  }

  return { count, totalFiles };
}

/**
 * Count all files recursively
 */
function countFilesRecursive(items: ClaudeConfigItem[]): number {
  let count = 0;

  for (const item of items) {
    if (item.type === 'file') {
      count++;
    } else if (item.children) {
      count += countFilesRecursive(item.children);
    }
  }

  return count;
}

/**
 * Count files in a folder, also updating totalFiles in stats
 */
function countFilesInFolder(items: ClaudeConfigItem[], stats: ClaudeStats): number {
  let count = 0;

  for (const item of items) {
    if (item.type === 'file') {
      stats.totalFiles++;
      count++;
    } else if (item.children) {
      count += countFilesInFolder(item.children, stats);
    }
  }

  return count;
}
