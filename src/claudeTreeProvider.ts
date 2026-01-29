import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult } from './types';
import { scanWorkspace } from './claudeScanner';
import { getThemeIcon, getThemeFolderIcon } from './utils/iconUtils';

export class ClaudeTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _scanResult?: ScanResult;
  private _expandedState: Map<string, boolean> = new Map();

  async refresh(): Promise<void> {
    this._scanResult = await scanWorkspace();
    this._onDidChangeTreeData.fire();
  }

  getScanResult(): ScanResult | undefined {
    return this._scanResult;
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  collapseAll(): void {
    for (const key of this._expandedState.keys()) {
      this._expandedState.set(key, false);
    }
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!this._scanResult) {
      this._scanResult = await scanWorkspace();
    }

    // Root level: show folders
    if (!element) {
      return this._scanResult.folders.map((folder, index) => this._createFolderTreeItem(folder, index));
    }

    // Folder level: show items
    if (element.contextValue === 'claudeFolder' && element.folder) {
      return element.folder.items.map(item => this._createItemTreeItem(item));
    }

    // Subfolder level: show children with parent folder context
    if (element.contextValue === 'subfolder' && element.configItem?.children) {
      const parentName = element.configItem.name;
      return element.configItem.children.map(item => this._createItemTreeItem(item, parentName));
    }

    return [];
  }

  private _createFolderTreeItem(folder: ClaudeFolder, index: number): TreeItem {
    const relativePath = path.relative(
      folder.workspaceFolder.uri.fsPath,
      folder.claudePath.fsPath
    );
    const isRoot = !relativePath || relativePath === '.claude';
    // Remove .claude from path for cleaner display
    const label = isRoot ? 'root' : relativePath.replace(/\/?\.claude$/, '');
    const itemId = folder.claudePath.fsPath;

    // Initialize expand state if not set
    if (!this._expandedState.has(itemId)) {
      this._expandedState.set(itemId, true);
    }
    const isExpanded = this._expandedState.get(itemId);

    const item = new TreeItem(
      label,
      isExpanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
    );
    item.id = itemId;
    item.contextValue = 'claudeFolder';
    item.folder = folder;
    item.iconPath = new vscode.ThemeIcon('folder');
    if (!isRoot) {
      item.description = folder.workspaceFolder.name;
    }
    return item;
  }

  private _createItemTreeItem(configItem: ClaudeConfigItem, parentFolder?: string): TreeItem {
    const itemId = configItem.uri.fsPath;

    if (configItem.type === 'folder') {
      // Initialize expand state if not set
      if (!this._expandedState.has(itemId)) {
        this._expandedState.set(itemId, false);
      }
      const isExpanded = this._expandedState.get(itemId);

      const item = new TreeItem(
        configItem.name,
        isExpanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
      );
      item.id = itemId;
      item.contextValue = 'subfolder';
      item.configItem = configItem;
      item.iconPath = getThemeFolderIcon(configItem.name);
      return item;
    }

    // File item
    const title = configItem.parsed?.frontmatter.name || configItem.name;
    const description = configItem.parsed?.frontmatter.description || '';
    const frontmatter = configItem.parsed?.frontmatter;

    const item = new TreeItem(
      title,
      vscode.TreeItemCollapsibleState.None
    );
    item.id = itemId;
    item.contextValue = 'configFile';
    item.configItem = configItem;
    item.description = description;

    // Build tooltip with metadata
    let tooltipContent = `**${title}**\n\n`;
    if (description) {
      tooltipContent += `${description}\n\n`;
    }
    if (frontmatter?.model) {
      tooltipContent += `**Model:** ${frontmatter.model}\n\n`;
    }
    if (frontmatter?.tools && frontmatter.tools.length > 0) {
      tooltipContent += `**Tools:** ${frontmatter.tools.join(', ')}\n\n`;
    }
    if (frontmatter?.permissionMode) {
      tooltipContent += `**Permission:** ${frontmatter.permissionMode}\n\n`;
    }
    if (frontmatter?.hooksCount) {
      tooltipContent += `**Hooks:** ${frontmatter.hooksCount} configured\n\n`;
    }
    tooltipContent += `*${configItem.relativePath}*`;

    item.tooltip = new vscode.MarkdownString(tooltipContent);
    item.iconPath = getThemeIcon(configItem.name, parentFolder);
    item.command = {
      command: 'claudeLens.openFile',
      title: 'Open File',
      arguments: [configItem.uri],
    };

    return item;
  }

}

export class TreeItem extends vscode.TreeItem {
  folder?: ClaudeFolder;
  configItem?: ClaudeConfigItem;
}
