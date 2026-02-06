import * as vscode from 'vscode';
import { ClaudeStats } from './types';
import { getStatsIcons } from './constants/icons';
import { escapeHtml } from './utils/escapeHtml';

export class StatsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'claudeLensStats';

  private _view?: vscode.WebviewView;
  private _stats?: ClaudeStats;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'openDashboard') {
        vscode.commands.executeCommand('claudeLens.openDashboard');
      }
    });

    this._updateHtml();
  }

  public updateStats(stats: ClaudeStats): void {
    this._stats = stats;
    this._updateHtml();
  }

  private _updateHtml(): void {
    if (!this._view) return;

    const stats = this._stats || { totalFiles: 0, skills: 0, commands: 0, agents: 0, hooks: 0, configs: 0, teams: 0, tasks: 0, teammates: 0, skillItems: [], commandItems: [], agentItems: [], teamItems: [] };
    const icons = getStatsIcons();

    // Format items for display
    const skillsFormatted = stats.skillItems.map(s => `/${s}`);
    const commandsFormatted = stats.commandItems.map(c => `/${c}`);
    const agentsFormatted = stats.agentItems;

    this._view.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .stat-card {
      background: var(--vscode-editor-background);
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--vscode-widget-border, transparent);
    }
    .stat-card.clickable {
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .stat-card.clickable:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .stat-card.active {
      border-color: var(--vscode-focusBorder);
    }
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-foreground);
      line-height: 1;
    }
    .stat-label {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dropdown {
      display: none;
      grid-column: 1 / -1;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
      border-radius: 6px;
      padding: 8px 0;
      max-height: 150px;
      overflow-y: auto;
    }
    .dropdown.show {
      display: block;
    }
    .dropdown-item {
      padding: 6px 12px;
      font-size: 12px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-editor-font-family, monospace);
    }
    .dropdown-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .dropdown-empty {
      padding: 8px 12px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .dashboard-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      margin-top: 12px;
      padding: 8px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-family: var(--vscode-font-family);
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .dashboard-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .dashboard-btn svg {
      width: 14px;
      height: 14px;
    }
  </style>
</head>
<body>
  <div class="stats-grid">
    <div class="stat-card clickable" data-dropdown="skills">
      <span class="stat-icon">${icons.target}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.skills}</span>
        <span class="stat-label">Skills</span>
      </div>
    </div>
    <div class="dropdown" id="dropdown-skills">
      ${skillsFormatted.length > 0
        ? skillsFormatted.map(s => `<div class="dropdown-item">${escapeHtml(s)}</div>`).join('')
        : '<div class="dropdown-empty">No skills found</div>'
      }
    </div>
    <div class="stat-card clickable" data-dropdown="commands">
      <span class="stat-icon">${icons.terminal}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.commands}</span>
        <span class="stat-label">Commands</span>
      </div>
    </div>
    <div class="dropdown" id="dropdown-commands">
      ${commandsFormatted.length > 0
        ? commandsFormatted.map(c => `<div class="dropdown-item">${escapeHtml(c)}</div>`).join('')
        : '<div class="dropdown-empty">No commands found</div>'
      }
    </div>
    <div class="stat-card clickable" data-dropdown="agents">
      <span class="stat-icon">${icons.robot}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.agents}</span>
        <span class="stat-label">Agents</span>
      </div>
    </div>
    <div class="dropdown" id="dropdown-agents">
      ${agentsFormatted.length > 0
        ? agentsFormatted.map(a => `<div class="dropdown-item">${escapeHtml(a)}</div>`).join('')
        : '<div class="dropdown-empty">No agents found</div>'
      }
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.bolt}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.hooks}</span>
        <span class="stat-label">Hooks</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.gear}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.configs}</span>
        <span class="stat-label">Configs</span>
      </div>
    </div>
    <div class="stat-card clickable" data-dropdown="teams">
      <span class="stat-icon">${icons.team}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.teams}</span>
        <span class="stat-label">Teams</span>
      </div>
    </div>
    <div class="dropdown" id="dropdown-teams">
      ${stats.teamItems.length > 0
        ? stats.teamItems.map(t => `<div class="dropdown-item">${escapeHtml(t)}</div>`).join('')
        : '<div class="dropdown-empty">No teams found</div>'
      }
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.task}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.tasks}</span>
        <span class="stat-label">Tasks</span>
      </div>
    </div>
  </div>
  <button class="dashboard-btn" id="openDashboard">
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
    </svg>
    Open Dashboard
  </button>
  <script>
    const cards = document.querySelectorAll('.stat-card.clickable');
    let activeDropdown = null;

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const dropdownId = card.dataset.dropdown;
        const dropdown = document.getElementById('dropdown-' + dropdownId);

        // Close other dropdowns
        document.querySelectorAll('.dropdown.show').forEach(d => {
          if (d !== dropdown) d.classList.remove('show');
        });
        document.querySelectorAll('.stat-card.active').forEach(c => {
          if (c !== card) c.classList.remove('active');
        });

        // Toggle current dropdown
        const isOpen = dropdown.classList.contains('show');
        if (isOpen) {
          dropdown.classList.remove('show');
          card.classList.remove('active');
          activeDropdown = null;
        } else {
          dropdown.classList.add('show');
          card.classList.add('active');
          activeDropdown = dropdown;
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.stat-card.clickable') && !e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.stat-card.active').forEach(c => c.classList.remove('active'));
        activeDropdown = null;
      }
    });

    // Open Dashboard button
    const vscode = acquireVsCodeApi();
    document.getElementById('openDashboard').addEventListener('click', () => {
      vscode.postMessage({ command: 'openDashboard' });
    });
  </script>
</body>
</html>`;
  }
}
