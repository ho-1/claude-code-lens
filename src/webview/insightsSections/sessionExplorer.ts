/**
 * Session Explorer section
 * Feature 2: Browsable session list grouped by project
 */

import { InsightsData, SessionEntry } from '../../insightsTypes';
import { escapeHtml } from '../../utils/escapeHtml';

const MAX_SESSIONS_INITIAL = 5;

export function renderSessionExplorer(insights: InsightsData): string {
  const { sessions } = insights;
  if (sessions.length === 0) {
    return `
    <div class="insights-section-block">
      <div class="insights-section-header">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <span>Session Explorer</span>
      </div>
      <div class="chart-empty">No session data found</div>
    </div>`;
  }

  // Group by project
  const projectGroups = new Map<string, SessionEntry[]>();
  for (const session of sessions) {
    const project = session.projectPath || 'Unknown';
    if (!projectGroups.has(project)) {
      projectGroups.set(project, []);
    }
    projectGroups.get(project)!.push(session);
  }

  // Sort projects by most recent session
  const sortedProjects = Array.from(projectGroups.entries()).sort((a, b) => {
    const aDate = a[1][0]?.modified || a[1][0]?.created || '';
    const bDate = b[1][0]?.modified || b[1][0]?.created || '';
    return bDate.localeCompare(aDate);
  });

  const projectSections = sortedProjects.map(([projectPath, sessions], pIdx) => {
    const displayName = projectPath.split('/').pop() || projectPath;
    const totalMessages = sessions.reduce((s, sess) => s + sess.messageCount, 0);

    const sessionItems = sessions.slice(0, MAX_SESSIONS_INITIAL).map((s, i) => {
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

    const moreCount = sessions.length - MAX_SESSIONS_INITIAL;
    const moreButton = moreCount > 0
      ? `<button class="session-more-btn" data-project="${pIdx}" data-expanded="false">Show ${moreCount} more</button>`
      : '';

    const hiddenSessions = sessions.slice(MAX_SESSIONS_INITIAL).map((s, i) => {
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
    <div class="session-project-group">
      <div class="session-project-header" data-project="${pIdx}">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" class="session-chevron">
          <path d="M6 12L10 8L6 4"/>
        </svg>
        <span class="session-project-name">${escapeHtml(displayName)}</span>
        <span class="session-project-count">${sessions.length} sessions · ${totalMessages.toLocaleString()} msgs</span>
      </div>
      <div class="session-project-body" data-project-body="${pIdx}">
        ${sessionItems}
        ${hiddenSessions ? `<div class="session-hidden" data-hidden="${pIdx}" style="display:none">${hiddenSessions}</div>` : ''}
        ${moreButton}
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
      <span class="insights-since">${sessions.length} sessions across ${sortedProjects.length} projects</span>
    </div>
    ${projectSections}
  </div>`;
}

export function getSessionExplorerScripts(): string {
  return `
    // Session project group collapse/expand
    document.querySelectorAll('.session-project-header').forEach(header => {
      header.addEventListener('click', () => {
        const projectId = header.dataset.project;
        const body = document.querySelector('[data-project-body="' + projectId + '"]');
        const chevron = header.querySelector('.session-chevron');
        if (body) {
          body.classList.toggle('collapsed');
          if (chevron) chevron.classList.toggle('rotated');
        }
      });
    });

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

