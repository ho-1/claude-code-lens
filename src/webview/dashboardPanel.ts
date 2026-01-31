/**
 * Dashboard panel lifecycle management
 */

import * as vscode from 'vscode';
import { ScanResult } from '../types';
import { getHtmlContent } from './htmlRenderer';

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Create or reveal the dashboard panel
 */
export function createDashboardPanel(
  extensionUri: vscode.Uri,
  scanResult: ScanResult
): vscode.WebviewPanel {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One);
    updateDashboardPanel(scanResult);
    return currentPanel;
  }

  const panel = vscode.window.createWebviewPanel(
    'claudeLensDashboard',
    'Claude Code Lens',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri],
      retainContextWhenHidden: true,
    }
  );

  currentPanel = panel;

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === 'openFile') {
      const uri = vscode.Uri.file(message.path);
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Two,
        preview: true,
        preserveFocus: false,
      });
    } else if (message.type === 'openSettings') {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        '@ext:Byungho.claude-code-lens'
      );
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
