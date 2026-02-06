import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ClaudeTreeProvider, TreeItem } from './claudeTreeProvider';
import { StatsViewProvider } from './statsViewProvider';
import { createDashboardPanel, updateDashboardPanel, disposeDashboardPanel } from './webview';
import { scanWorkspace } from './claudeScanner';
import { generateCommitCommand, stopGeneration } from './commit';

let fileWatcher: vscode.FileSystemWatcher | undefined;
let mcpWatcher: vscode.FileSystemWatcher | undefined;
let teamWatcher: fs.FSWatcher | undefined;
let taskWatcher: fs.FSWatcher | undefined;
let treeProvider: ClaudeTreeProvider;
let statsProvider: StatsViewProvider;
let treeView: vscode.TreeView<TreeItem>;

export function activate(context: vscode.ExtensionContext) {
  console.log('Claude Code Lens is now active');

  // Initialize commit generation state
  vscode.commands.executeCommand('setContext', 'claudeLens.isGenerating', false);

  // Register commit commands
  const commitCommand = vscode.commands.registerCommand(
    'claudeLens.generateCommit',
    generateCommitCommand
  );

  const stopCommitCommand = vscode.commands.registerCommand(
    'claudeLens.stopCommit',
    stopGeneration
  );

  // Create providers
  treeProvider = new ClaudeTreeProvider();
  statsProvider = new StatsViewProvider(context.extensionUri);

  // Create TreeView with reveal API and multi-select
  treeView = vscode.window.createTreeView('claudeLensView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: true,
  });

  // Register StatsViewProvider (Webview in sidebar)
  const statsRegistration = vscode.window.registerWebviewViewProvider(
    StatsViewProvider.viewType,
    statsProvider
  );

  // Initial refresh
  refreshAll();

  // Register commands
  const refreshCommand = vscode.commands.registerCommand('claudeLens.refresh', refreshAll);

  const openFileCommand = vscode.commands.registerCommand(
    'claudeLens.openFile',
    async (uri: vscode.Uri) => {
      if (uri) {
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
      }
    }
  );

  const openDashboardCommand = vscode.commands.registerCommand(
    'claudeLens.openDashboard',
    async () => {
      let scanResult = treeProvider.getScanResult();
      if (!scanResult) {
        scanResult = await scanWorkspace();
      }
      createDashboardPanel(context.extensionUri, scanResult);
    }
  );

  // New File command
  const newFileCommand = vscode.commands.registerCommand(
    'claudeLens.newFile',
    async (item: TreeItem) => {
      const targetPath = getTargetPath(item);
      if (!targetPath) return;

      const fileName = await vscode.window.showInputBox({
        prompt: 'Enter file name',
        placeHolder: 'filename.md',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'File name is required';
          }
          if (!/^[a-zA-Z0-9_\-\.]+$/.test(value)) {
            return 'File name can only contain letters, numbers, hyphens, underscores, and dots';
          }
          // Prevent path traversal (allow dotfiles like .gitignore)
          if (value === '.' || value === '..' || value.includes('..')) {
            return 'Invalid file name';
          }
          return null;
        }
      });
      if (!fileName) return;

      const filePath = path.join(targetPath, fileName);
      const template = fileName.endsWith('.md') ? getMarkdownTemplate(fileName) : '';
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(template, 'utf8')
      );
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
      await vscode.window.showTextDocument(doc);
    }
  );

  // New Folder command
  const newFolderCommand = vscode.commands.registerCommand(
    'claudeLens.newFolder',
    async (item: TreeItem) => {
      const targetPath = getTargetPath(item);
      if (!targetPath) return;

      const folderName = await vscode.window.showInputBox({
        prompt: 'Enter folder name',
        placeHolder: 'folder-name',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Folder name is required';
          }
          if (!/^[a-zA-Z0-9_\-]+$/.test(value)) {
            return 'Folder name can only contain letters, numbers, hyphens, and underscores';
          }
          // Prevent path traversal
          if (value === '.' || value === '..') {
            return 'Invalid folder name';
          }
          return null;
        }
      });
      if (!folderName) return;

      const folderPath = path.join(targetPath, folderName);
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderPath));
    }
  );

  // Delete command
  const deleteCommand = vscode.commands.registerCommand(
    'claudeLens.delete',
    async (item: TreeItem) => {
      const items = treeView.selection.length > 1 ? treeView.selection : [item];

      // Validate all items are within .claude folders
      for (const i of items) {
        if (!i.configItem?.uri) continue;
        const itemPath = i.configItem.uri.fsPath;
        const normalizedPath = path.normalize(itemPath);

        // Must contain .claude in the path
        if (!normalizedPath.includes(`${path.sep}.claude${path.sep}`) &&
            !normalizedPath.endsWith(`${path.sep}.claude`)) {
          vscode.window.showErrorMessage('Cannot delete files outside .claude folders');
          return;
        }

        // Prevent deleting .claude folder itself
        if (normalizedPath.endsWith(`${path.sep}.claude`) ||
            path.basename(normalizedPath) === '.claude') {
          vscode.window.showErrorMessage('Cannot delete the .claude folder itself');
          return;
        }
      }

      const names = items.map(i => i.configItem?.name || i.label).join(', ');
      const itemCount = items.length;

      const confirmation = await vscode.window.showWarningMessage(
        itemCount > 1
          ? `Delete ${itemCount} items (${names})?`
          : `Delete "${names}"?`,
        { modal: true },
        'Delete'
      );

      if (confirmation !== 'Delete') return;

      for (const i of items) {
        if (i.configItem?.uri) {
          const isFolder = i.contextValue === 'subfolder';
          await vscode.workspace.fs.delete(i.configItem.uri, { recursive: isFolder });
        }
      }
    }
  );

  // Rename command
  const renameCommand = vscode.commands.registerCommand(
    'claudeLens.rename',
    async (item: TreeItem) => {
      if (!item.configItem?.uri) return;

      const oldName = item.configItem.name;
      const newName = await vscode.window.showInputBox({
        prompt: 'Enter new name',
        value: oldName,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Name is required';
          }
          if (!/^[a-zA-Z0-9_\-\.]+$/.test(value)) {
            return 'Name can only contain letters, numbers, hyphens, underscores, and dots';
          }
          // Prevent path traversal (allow dotfiles like .gitignore)
          if (value === '.' || value === '..' || value.includes('..')) {
            return 'Invalid name';
          }
          return null;
        }
      });

      if (!newName || newName === oldName) return;

      const oldUri = item.configItem.uri;
      const parentDir = path.dirname(oldUri.fsPath);
      const newUri = vscode.Uri.file(path.join(parentDir, newName));

      await vscode.workspace.fs.rename(oldUri, newUri);
    }
  );

  // File system watcher for .claude folders
  fileWatcher = vscode.workspace.createFileSystemWatcher('**/.claude/**');
  fileWatcher.onDidCreate(refreshAll);
  fileWatcher.onDidDelete(refreshAll);

  // File system watcher for .mcp.json
  mcpWatcher = vscode.workspace.createFileSystemWatcher('**/.mcp.json');
  mcpWatcher.onDidCreate(refreshAll);
  mcpWatcher.onDidChange(refreshAll);
  mcpWatcher.onDidDelete(refreshAll);

  // Watch ~/.claude/teams/ and ~/.claude/tasks/ for real-time updates
  const homeDir = os.homedir();
  const teamsDir = path.join(homeDir, '.claude', 'teams');
  const tasksDir = path.join(homeDir, '.claude', 'tasks');

  // Debounce refreshAll for team/task changes
  let teamRefreshTimeout: ReturnType<typeof setTimeout> | undefined;
  const debouncedRefresh = () => {
    if (teamRefreshTimeout) clearTimeout(teamRefreshTimeout);
    teamRefreshTimeout = setTimeout(refreshAll, 500);
  };

  try {
    if (fs.existsSync(teamsDir)) {
      teamWatcher = fs.watch(teamsDir, { recursive: true }, debouncedRefresh);
    }
  } catch { /* teams dir doesn't exist yet */ }

  try {
    if (fs.existsSync(tasksDir)) {
      taskWatcher = fs.watch(tasksDir, { recursive: true }, debouncedRefresh);
    }
  } catch { /* tasks dir doesn't exist yet */ }

  // Periodically check if team/task dirs appeared (they're created at runtime)
  const dirCheckInterval = setInterval(() => {
    try {
      if (!teamWatcher && fs.existsSync(teamsDir)) {
        teamWatcher = fs.watch(teamsDir, { recursive: true }, debouncedRefresh);
        debouncedRefresh();
      }
      if (!taskWatcher && fs.existsSync(tasksDir)) {
        taskWatcher = fs.watch(tasksDir, { recursive: true }, debouncedRefresh);
        debouncedRefresh();
      }
    } catch { /* ignore */ }
  }, 10000);

  // Watch for workspace folder changes
  const workspaceFolderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(refreshAll);

  context.subscriptions.push(
    treeView,
    statsRegistration,
    refreshCommand,
    openFileCommand,
    openDashboardCommand,
    newFileCommand,
    newFolderCommand,
    deleteCommand,
    renameCommand,
    commitCommand,
    stopCommitCommand,
    fileWatcher,
    mcpWatcher,
    workspaceFolderWatcher,
    { dispose: disposeDashboardPanel },
    { dispose: () => {
      if (teamWatcher) teamWatcher.close();
      if (taskWatcher) taskWatcher.close();
      clearInterval(dirCheckInterval);
      if (teamRefreshTimeout) clearTimeout(teamRefreshTimeout);
    }},
  );
}

function getTargetPath(item: TreeItem): string | undefined {
  if (item.contextValue === 'claudeFolder' && item.folder) {
    return item.folder.claudePath.fsPath;
  }
  if (item.contextValue === 'subfolder' && item.configItem?.uri) {
    return item.configItem.uri.fsPath;
  }
  return undefined;
}

function getMarkdownTemplate(fileName: string): string {
  const name = path.basename(fileName, path.extname(fileName));
  return `---
name: ${name}
description: Description here
---

# ${name}

Content here...
`;
}


async function refreshAll(): Promise<void> {
  await treeProvider.refresh();
  const scanResult = treeProvider.getScanResult();
  if (scanResult) {
    statsProvider.updateStats(scanResult.stats);
    updateDashboardPanel(scanResult);
  }
}

export function deactivate() {
  if (fileWatcher) {
    fileWatcher.dispose();
  }
  if (mcpWatcher) {
    mcpWatcher.dispose();
  }
  if (teamWatcher) {
    teamWatcher.close();
  }
  if (taskWatcher) {
    taskWatcher.close();
  }
  disposeDashboardPanel();
}
