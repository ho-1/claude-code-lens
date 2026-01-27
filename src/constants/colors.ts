/**
 * Color palette for Claude config viewer
 * Unified color scheme used across webview and tree view
 */

export const COLORS = {
  // File type colors
  document: '#F97316', // orange - CLAUDE.md
  gear: '#6B7280', // gray - settings.json
  robot: '#8B5CF6', // purple - agents/
  target: '#3B82F6', // blue - skills/
  terminal: '#10B981', // green - commands/
  bolt: '#EF4444', // red - hooks/
  folder: '#FBBF24', // yellow - folders
  file: '#9CA3AF', // default gray

  // Permission colors
  allow: '#10B981', // green
  deny: '#EF4444', // red
} as const;

export type ColorKey = keyof typeof COLORS;

/**
 * VS Code theme color IDs for tree view icons
 */
export const THEME_COLORS = {
  robot: 'charts.purple',
  target: 'charts.blue',
  terminal: 'charts.green',
  bolt: 'charts.red',
  document: 'charts.orange',
  gear: 'descriptionForeground',
} as const;
