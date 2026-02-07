/**
 * Dashboard panel lifecycle management
 */

import * as path from 'path'
import * as vscode from 'vscode'
import { ScanResult, ClaudeConfigItem } from '../types'
import { getHtmlContent } from './htmlRenderer'

let currentPanel: vscode.WebviewPanel | undefined
let allowedPathsCache: Set<string> | undefined

/**
 * Build set of allowed paths from scan result
 * Called once when scan result is updated, not on every path check
 */
function buildAllowedPaths(scanResult: ScanResult): Set<string> {
  const allowedPaths = new Set<string>()

  function collectPaths(items: ClaudeConfigItem[]) {
    for (const item of items) {
      allowedPaths.add(item.uri.fsPath)
      if (item.children) {
        collectPaths(item.children)
      }
    }
  }

  for (const folder of scanResult.folders) {
    allowedPaths.add(folder.claudePath.fsPath)
    collectPaths(folder.items)
    if (folder.mcpConfig) {
      allowedPaths.add(folder.mcpConfig.uri.fsPath)
    }
  }

  return allowedPaths
}

/**
 * Validate that a file path is within allowed directories
 * Prevents path traversal attacks from webview messages
 */
function isPathAllowed(filePath: string): boolean {
  if (!allowedPathsCache) {
    return false
  }

  // Normalize the path to prevent traversal tricks
  const normalizedPath = path.normalize(filePath)

  // Check if path is within any workspace folder
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    return false
  }

  const isInWorkspace = workspaceFolders.some(
    (folder) =>
      normalizedPath.startsWith(folder.uri.fsPath + path.sep) ||
      normalizedPath === folder.uri.fsPath,
  )

  if (!isInWorkspace) {
    return false
  }

  return allowedPathsCache.has(normalizedPath)
}

/**
 * Create or reveal the dashboard panel
 */
export function createDashboardPanel(
  extensionUri: vscode.Uri,
  scanResult: ScanResult,
): vscode.WebviewPanel {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One)
    updateDashboardPanel(scanResult)
    return currentPanel
  }

  const panel = vscode.window.createWebviewPanel(
    'claudeLensDashboard',
    'Claude Code Lens',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri],
      retainContextWhenHidden: true,
    },
  )

  currentPanel = panel
  allowedPathsCache = buildAllowedPaths(scanResult)

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === 'openFile') {
      const requestedPath = message.path

      // Validate path before opening
      if (!requestedPath || typeof requestedPath !== 'string') {
        vscode.window.showErrorMessage('Invalid file path')
        return
      }

      if (!isPathAllowed(requestedPath)) {
        vscode.window.showErrorMessage('Access denied: file is outside allowed directories')
        return
      }

      try {
        const uri = vscode.Uri.file(requestedPath)
        const doc = await vscode.workspace.openTextDocument(uri)
        await vscode.window.showTextDocument(doc, {
          viewColumn: vscode.ViewColumn.Two,
          preview: true,
          preserveFocus: false,
        })
      } catch (error) {
        vscode.window.showErrorMessage('Failed to open file')
      }
    } else if (message.type === 'openSettings') {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        '@ext:Byungho.claude-code-lens',
      )
    }
  })

  panel.onDidDispose(() => {
    currentPanel = undefined
  })

  panel.webview.html = getHtmlContent(scanResult)

  return panel
}

/**
 * Update the dashboard panel content
 */
export function updateDashboardPanel(scanResult: ScanResult): void {
  if (currentPanel) {
    currentScanResult = scanResult
    allowedPathsCache = buildAllowedPaths(scanResult)
    currentPanel.webview.html = getHtmlContent(scanResult)
  }
}

/**
 * Dispose the dashboard panel
 */
export function disposeDashboardPanel(): void {
  if (currentPanel) {
    currentPanel.dispose()
    currentPanel = undefined
  }
  allowedPathsCache = undefined
}
