/**
 * HTML rendering functions for the dashboard webview
 */

import { ScanResult } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { DASHBOARD_STYLES } from './styles';
import { renderCardView, getCardViewScripts } from './cardView';
import { renderGraphView, getGraphViewScripts } from './graphView';

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
      <span class="guide-separator">|</span>
      <a href="https://skills.sh/" class="guide-link community">skills.sh</a>
    </div>
  </div>

  ${renderStatsBar(stats)}

  ${renderTabBar()}

  <div id="tab-card" class="tab-content active">
    ${renderCardView(result)}
  </div>

  <div id="tab-graph" class="tab-content">
    ${renderGraphView(result)}
  </div>

  <script>
    const vscode = acquireVsCodeApi();

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

    ${getStatsScripts()}

    ${getGraphViewScripts()}

    // Copy prompt button handler
    document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({
          type: 'copyPrompt',
          folderType: btn.dataset.folderType
        });
      });
    });

  </script>
</body>
</html>`;
}

/**
 * Render the tab bar
 */
function renderTabBar(): string {
  return `
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="card">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
      </svg>
      Cards
    </button>
    <button class="tab-btn" data-tab="graph">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        <path d="M3 3l5 0m-5 5l10 0m-10 5l5 0m5-5l0-5m0 10l0-5" stroke="currentColor" stroke-width="1" fill="none"/>
      </svg>
      Graph
    </button>
  </div>`;
}

/**
 * Render the stats bar
 */
function renderStatsBar(stats: ScanResult['stats']): string {
  const skillsFormatted = stats.skillItems.map(s => `/${s}`);
  const commandsFormatted = stats.commandItems.map(c => `/${c}`);
  const agentsFormatted = stats.agentItems;

  return `
  <div class="stats-bar">
    <div class="stat-item clickable" data-dropdown="skills">
      <span class="stat-icon">${SVG_ICONS.target(COLORS.target)}</span>
      <span class="stat-value">${stats.skills}</span>
      <span class="stat-label">Skills</span>
      <div class="stat-dropdown" id="dropdown-skills">
        ${skillsFormatted.length > 0
          ? skillsFormatted.map(s => `<div class="dropdown-item">${escapeHtml(s)}</div>`).join('')
          : '<div class="dropdown-empty">No skills found</div>'
        }
      </div>
    </div>
    <div class="stat-item clickable" data-dropdown="commands">
      <span class="stat-icon">${SVG_ICONS.terminal(COLORS.terminal)}</span>
      <span class="stat-value">${stats.commands}</span>
      <span class="stat-label">Commands</span>
      <div class="stat-dropdown" id="dropdown-commands">
        ${commandsFormatted.length > 0
          ? commandsFormatted.map(c => `<div class="dropdown-item">${escapeHtml(c)}</div>`).join('')
          : '<div class="dropdown-empty">No commands found</div>'
        }
      </div>
    </div>
    <div class="stat-item clickable" data-dropdown="agents">
      <span class="stat-icon">${SVG_ICONS.robot(COLORS.robot)}</span>
      <span class="stat-value">${stats.agents}</span>
      <span class="stat-label">Agents</span>
      <div class="stat-dropdown" id="dropdown-agents">
        ${agentsFormatted.length > 0
          ? agentsFormatted.map(a => `<div class="dropdown-item">${escapeHtml(a)}</div>`).join('')
          : '<div class="dropdown-empty">No agents found</div>'
        }
      </div>
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
  </div>`;
}

/**
 * Get stats dropdown scripts
 */
function getStatsScripts(): string {
  return `
    // Stats dropdown handler
    document.querySelectorAll('.stat-item.clickable').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = item.querySelector('.stat-dropdown');
        const isOpen = dropdown.classList.contains('show');

        // Close all dropdowns
        document.querySelectorAll('.stat-dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.stat-item.active').forEach(i => i.classList.remove('active'));

        // Toggle current dropdown
        if (!isOpen) {
          dropdown.classList.add('show');
          item.classList.add('active');
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.stat-item.clickable')) {
        document.querySelectorAll('.stat-dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.stat-item.active').forEach(i => i.classList.remove('active'));
      }
    });
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
