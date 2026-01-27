import * as vscode from 'vscode';
import { ClaudeStats } from './types';
import { getStatsIcons } from './constants/icons';

export class StatsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'claudeConfigStats';

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

    this._updateHtml();
  }

  public updateStats(stats: ClaudeStats): void {
    this._stats = stats;
    this._updateHtml();
  }

  private _updateHtml(): void {
    if (!this._view) return;

    const stats = this._stats || { totalFiles: 0, skills: 0, commands: 0, agents: 0, hooks: 0, configs: 0 };
    const icons = getStatsIcons();

    this._view.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  </style>
</head>
<body>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">${icons.file}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.totalFiles}</span>
        <span class="stat-label">Files</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.target}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.skills}</span>
        <span class="stat-label">Skills</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.terminal}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.commands}</span>
        <span class="stat-label">Commands</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">${icons.robot}</span>
      <div class="stat-info">
        <span class="stat-value">${stats.agents}</span>
        <span class="stat-label">Agents</span>
      </div>
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
  </div>
</body>
</html>`;
  }
}
