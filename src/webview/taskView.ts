/**
 * Task view rendering for the dashboard
 * Shows all tasks from ~/.claude/tasks/ as a kanban board
 */

import { ScanResult, TaskItem, TaskStatus } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { escapeHtml } from '../utils/escapeHtml';

/**
 * Render the tasks tab content
 */
export function renderTaskView(result: ScanResult): string {
  const { tasks } = result.teamData;

  return `
  <div class="team-view">
    ${tasks.length > 0
      ? renderTaskBoard(tasks)
      : renderTaskEmptyState()
    }
  </div>`;
}

/**
 * Render task board (Kanban-style)
 */
function renderTaskBoard(tasks: TaskItem[]): string {
  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s);

  return `
  <div class="team-section">
    <div class="team-section-header">
      <span class="team-section-icon">${SVG_ICONS.task(COLORS.task)}</span>
      <span class="team-section-title">Task Board</span>
      <span class="team-section-count">${tasks.length}</span>
    </div>
    <div class="task-board">
      ${renderTaskColumn('In Progress', byStatus('in_progress'), 'in_progress', COLORS.target)}
      ${renderTaskColumn('Pending', byStatus('pending'), 'pending', '#F59E0B')}
      ${renderTaskColumn('Completed', byStatus('completed'), 'completed', COLORS.terminal)}
    </div>
  </div>`;
}

/**
 * Render a task board column
 */
function renderTaskColumn(title: string, tasks: TaskItem[], status: TaskStatus, color: string): string {
  const statusIcon = status === 'completed'
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : status === 'in_progress'
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;

  return `
  <div class="task-column" data-status="${status}">
    <div class="task-column-header" style="border-color: ${color}">
      <span class="task-column-icon">${statusIcon}</span>
      <span class="task-column-title">${title}</span>
      <span class="task-column-count" style="background: rgba(${hexToRgb(color)}, 0.12); color: ${color}">${tasks.length}</span>
    </div>
    <div class="task-column-body">
      ${tasks.length > 0
        ? tasks.map(task => renderTaskCard(task, color)).join('')
        : '<div class="task-empty">No tasks</div>'
      }
    </div>
  </div>`;
}

/**
 * Render a single task card
 */
function renderTaskCard(task: TaskItem, accentColor: string): string {
  const hasBlockers = task.blockedBy && task.blockedBy.length > 0;
  const hasBlocks = task.blocks && task.blocks.length > 0;

  return `
  <div class="task-card ${hasBlockers ? 'task-blocked' : ''}" data-task-path="${escapeHtml(task.filePath)}">
    <div class="task-card-header">
      <span class="task-card-id" style="color: ${accentColor}">#${escapeHtml(task.id)}</span>
      ${task.owner ? `<span class="task-card-owner">@${escapeHtml(task.owner)}</span>` : ''}
    </div>
    <div class="task-card-subject">${escapeHtml(task.subject)}</div>
    ${task.description ? `<div class="task-card-desc">${escapeHtml(task.description.slice(0, 120))}${task.description.length > 120 ? '...' : ''}</div>` : ''}
    <div class="task-card-footer">
      <span class="task-card-team">${escapeHtml(task.teamName)}</span>
      ${hasBlockers ? `<span class="task-dep task-dep-blocked" title="Blocked by: ${escapeHtml(task.blockedBy!.join(', '))}">Blocked</span>` : ''}
      ${hasBlocks ? `<span class="task-dep task-dep-blocks" title="Blocks: ${escapeHtml(task.blocks!.join(', '))}">Blocks ${task.blocks!.length}</span>` : ''}
    </div>
  </div>`;
}

/**
 * Render empty state for tasks
 */
function renderTaskEmptyState(): string {
  return `
  <div class="team-empty-state">
    <div class="team-empty-icon">
      ${SVG_ICONS.task('#6B7280')}
    </div>
    <div class="team-empty-title">No Tasks Found</div>
    <div class="team-empty-desc">
      Tasks are created automatically when Claude Code uses agent teams or task lists.
    </div>
    <div class="team-empty-hint">
      Tasks are stored at <code>~/.claude/tasks/</code>
    </div>
  </div>`;
}

/**
 * Convert hex color to r,g,b string
 */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Get task view specific scripts
 */
export function getTaskViewScripts(): string {
  return `
    // Task card click - open task file
    document.querySelectorAll('.task-card[data-task-path]').forEach(card => {
      card.addEventListener('click', () => {
        vscode.postMessage({ type: 'openFile', path: card.dataset.taskPath });
      });
    });
  `;
}
