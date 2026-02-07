/**
 * Session Explorer section
 * Feature 2: Browsable session list grouped by project
 */

import { InsightsData, SessionEntry } from '../../insightsTypes';
import { escapeHtml } from '../../utils/escapeHtml';

const MAX_SESSIONS_INITIAL = 5;

export function renderSessionExplorer(insights: InsightsData, workspacePaths?: string[]): string {
  const { sessions } = insights;

  // Filter to current workspace project sessions
  const filtered = workspacePaths && workspacePaths.length > 0
    ? sessions.filter(s => workspacePaths.some(wp => s.projectPath === wp))
    : sessions;

  if (filtered.length === 0) {
    const projectName = workspacePaths?.[0]?.split('/').pop() || 'this project';
    return `
    <div class="insights-section-block">
      <div class="insights-section-header">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <span>Session Explorer</span>
      </div>
      <div class="chart-empty">No sessions found for ${escapeHtml(projectName)}</div>
    </div>`;
  }

  const totalMessages = filtered.reduce((s, sess) => s + sess.messageCount, 0);

  const visibleSessions = filtered.slice(0, MAX_SESSIONS_INITIAL).map(s => {
    const date = formatDate(s.modified || s.created);
    const prompt = cleanPrompt(s.firstPrompt);
    const summary = escapeHtml(s.summary || prompt);
    return `
    <div class="session-item">
      <div class="session-item-header">
        <span class="session-summary">${summary}</span>
        <span class="session-meta">${s.messageCount} msgs</span>
      </div>
      <div class="session-item-footer">
        <span class="session-date">${date}</span>
        ${s.gitBranch ? `<span class="session-branch">${escapeHtml(s.gitBranch)}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  const moreCount = filtered.length - MAX_SESSIONS_INITIAL;
  const moreButton = moreCount > 0
    ? `<button class="session-more-btn" data-project="local" data-expanded="false">Show ${moreCount} more</button>`
    : '';

  const hiddenSessions = filtered.slice(MAX_SESSIONS_INITIAL).map(s => {
    const date = formatDate(s.modified || s.created);
    const prompt = cleanPrompt(s.firstPrompt);
    const summary = escapeHtml(s.summary || prompt);
    return `
    <div class="session-item">
      <div class="session-item-header">
        <span class="session-summary">${summary}</span>
        <span class="session-meta">${s.messageCount} msgs</span>
      </div>
      <div class="session-item-footer">
        <span class="session-date">${date}</span>
        ${s.gitBranch ? `<span class="session-branch">${escapeHtml(s.gitBranch)}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
      <span>Session Explorer</span>
      <span class="insights-since">${filtered.length} sessions · ${totalMessages.toLocaleString()} msgs</span>
    </div>
    ${visibleSessions}
    ${hiddenSessions ? `<div class="session-hidden" data-hidden="local" style="display:none">${hiddenSessions}</div>` : ''}
    ${moreButton}
  </div>`;
}

export function getSessionExplorerScripts(): string {
  return `
    // Show more sessions
    document.querySelectorAll('.session-more-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const projectId = btn.dataset.project;
        const hidden = document.querySelector('[data-hidden="' + projectId + '"]');
        if (hidden) {
          const isExpanded = btn.dataset.expanded === 'true';
          hidden.style.display = isExpanded ? 'none' : 'block';
          btn.dataset.expanded = isExpanded ? 'false' : 'true';
          btn.textContent = isExpanded ? btn.textContent.replace('Hide', 'Show') : btn.textContent.replace('Show', 'Hide');
        }
      });
    });
  `;
}

function formatDate(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}

function cleanPrompt(prompt: string): string {
  if (!prompt || prompt === 'No prompt') return 'No prompt';
  // Remove XML command tags
  return prompt
    .replace(/<command-message>.*?<\/command-message>/g, '')
    .replace(/<command-name>.*?<\/command-name>/g, '')
    .replace(/<command-args>.*?<\/command-args>/g, '')
    .trim()
    .slice(0, 100) || 'No prompt';
}

