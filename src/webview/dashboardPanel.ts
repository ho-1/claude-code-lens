/**
 * Dashboard panel lifecycle management
 */

import * as vscode from 'vscode';
import { ScanResult } from '../types';
import { getHtmlContent } from './htmlRenderer';
import { createClaudeMd } from './actions';

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Create or reveal the dashboard panel
 */
export function createDashboardPanel(
  extensionUri: vscode.Uri,
  scanResult: ScanResult,
  refreshCallback?: () => void
): vscode.WebviewPanel {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One);
    updateDashboardPanel(scanResult);
    return currentPanel;
  }

  const panel = vscode.window.createWebviewPanel(
    'claudeConfigDashboard',
    'Claude Code Dashboard',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri],
      retainContextWhenHidden: true,
    }
  );

  currentPanel = panel;

  panel.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case 'openFile':
        const uri = vscode.Uri.file(message.path);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        break;
      case 'folderAction':
        switch (message.action) {
          case 'addClaudeMd':
            await createClaudeMd(message.path);
            break;
        }
        // Refresh dashboard after file creation
        if (refreshCallback) {
          refreshCallback();
        }
        break;
    }
  });

  panel.onDidDispose(() => {
    currentPanel = undefined;
  });

  panel.webview.html = getHtmlContent(scanResult);

  return panel;
}

/**
 * Update the dashboard panel content
 */
export function updateDashboardPanel(scanResult: ScanResult): void {
  if (currentPanel) {
    currentPanel.webview.html = getHtmlContent(scanResult);
  }
}

/**
 * Dispose the dashboard panel
 */
export function disposeDashboardPanel(): void {
  if (currentPanel) {
    currentPanel.dispose();
    currentPanel = undefined;
  }
}
