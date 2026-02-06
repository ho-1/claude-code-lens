/**
 * HTML rendering functions for the dashboard webview
 */

import { ScanResult } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { DASHBOARD_STYLES } from './styles';
import { renderCardView, getCardViewScripts } from './cardView';
import { renderTeamView, getTeamViewScripts } from './teamView';

/**
 * Generate the complete HTML content for the dashboard
 */
export function getHtmlContent(result: ScanResult): string {
  const { stats } = result;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;">
  <title>Claude Code Dashboard</title>
  <style>
    ${DASHBOARD_STYLES}
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Claude Code Dashboard</div>
    <div class="subtitle">View and manage your .claude configuration files</div>
    <div class="guide-links">
      <span class="guide-label">Docs:</span>
      <a href="https://docs.anthropic.com/en/docs/claude-code/skills" class="guide-link">Skills</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/hooks" class="guide-link">Hooks</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" class="guide-link">MCP</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/sub-agents" class="guide-link">Agents</a>
      <a href="https://code.claude.com/docs/en/agent-teams" class="guide-link">Teams</a>
      <span class="guide-separator">|</span>
      <a href="https://skills.sh/" class="guide-link community">skills.sh</a>
    </div>
  </div>

  ${renderStatsBar(stats)}

  ${renderTabBar(result)}

  <div id="tab-card" class="tab-content active">
    ${renderCardView(result)}
  </div>

  <div id="tab-teams" class="tab-content">
    ${renderTeamView(result)}
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Open extension settings
    function openSettings() {
      vscode.postMessage({ type: 'openSettings' });
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');
      });
    });

    ${getCardViewScripts()}

    ${getTeamViewScripts()}
  </script>
</body>
</html>`;
}

/**
 * Render the tab bar
 */
function renderTabBar(result: ScanResult): string {
  const hasTeamData = result.teamData.teams.length > 0 || result.teamData.tasks.length > 0;
  const teamBadge = hasTeamData ? `<span class="tab-badge">${result.teamData.teams.length + result.teamData.tasks.length}</span>` : '';

  return `
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="card">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
      </svg>
      Cards
    </button>
    <button class="tab-btn" data-tab="teams">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      Teams
      ${teamBadge}
    </button>
  </div>`;
}

/**
 * Render the stats bar with settings button
 */
function renderStatsBar(stats: ScanResult['stats']): string {
  return `
  <div class="stats-bar-container">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.target(COLORS.target)}</span>
        <span class="stat-value">${stats.skills}</span>
        <span class="stat-label">Skills</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.terminal(COLORS.terminal)}</span>
        <span class="stat-value">${stats.commands}</span>
        <span class="stat-label">Commands</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.robot(COLORS.robot)}</span>
        <span class="stat-value">${stats.agents}</span>
        <span class="stat-label">Agents</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.bolt(COLORS.bolt)}</span>
        <span class="stat-value">${stats.hooks}</span>
        <span class="stat-label">Hooks</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.gear(COLORS.gear)}</span>
        <span class="stat-value">${stats.configs}</span>
        <span class="stat-label">Configs</span>
      </div>
      ${stats.teams > 0 ? `
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.team(COLORS.team)}</span>
        <span class="stat-value">${stats.teams}</span>
        <span class="stat-label">Teams</span>
      </div>
      ` : ''}
      ${stats.tasks > 0 ? `
      <div class="stat-item">
        <span class="stat-icon">${SVG_ICONS.task(COLORS.task)}</span>
        <span class="stat-value">${stats.tasks}</span>
        <span class="stat-label">Tasks</span>
      </div>
      ` : ''}
    </div>
    <button class="settings-btn" onclick="openSettings()" title="Extension Settings">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z" clip-rule="evenodd"/>
      </svg>
    </button>
  </div>`;
}

