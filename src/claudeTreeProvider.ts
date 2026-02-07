import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult, TeamConfig } from './types';
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

  updateInsights(insights: import('./insightsTypes').InsightsData | null): void {
    if (this._scanResult) {
      this._scanResult = { ...this._scanResult, insights };
    }
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

    // Root level: show folders + agent teams section
    if (!element) {
      const items: TreeItem[] = this._scanResult.folders.map((folder, index) => this._createFolderTreeItem(folder, index));

      // Add Agent Teams section if there are teams
      const { teamData } = this._scanResult;
      if (teamData.teams.length > 0) {
        items.push(this._createAgentTeamsRoot());
      }

      return items;
    }

    // Agent Teams root: show individual teams directly
    if (element.contextValue === 'agentTeamsRoot') {
      const { teamData } = this._scanResult;
      return teamData.teams.map(team => this._createTeamItem(team));
    }

    // Individual team: show members
    if (element.contextValue === 'teamItem' && element.teamConfig) {
      return element.teamConfig.members.map(member => {
        const item = new TreeItem(
          member.name,
          vscode.TreeItemCollapsibleState.None
        );
        item.contextValue = 'teamMember';
        item.description = member.agentType === 'lead' ? 'Lead' : 'Teammate';
        item.iconPath = member.agentType === 'lead'
          ? new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.yellow'))
          : new vscode.ThemeIcon('person', new vscode.ThemeColor('charts.green'));
        item.tooltip = new vscode.MarkdownString(
          `**${member.name}**\n\nRole: ${member.agentType}\n\nAgent ID: \`${member.agentId}\``
        );
        return item;
      });
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

  private _createAgentTeamsRoot(): TreeItem {
    const item = new TreeItem(
      'Agent Teams',
      vscode.TreeItemCollapsibleState.Expanded
    );
    item.contextValue = 'agentTeamsRoot';
    item.iconPath = new vscode.ThemeIcon('organization', new vscode.ThemeColor('charts.green'));
    item.description = `${this._scanResult?.teamData.teams.length || 0} teams`;
    return item;
  }

  private _createTeamItem(team: TeamConfig): TreeItem {
    const lead = team.members.find(m => m.agentType === 'lead');
    const teammateCount = team.members.filter(m => m.agentType === 'teammate').length;

    const item = new TreeItem(
      team.name,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    item.contextValue = 'teamItem';
    item.teamConfig = team;
    item.iconPath = new vscode.ThemeIcon('organization', new vscode.ThemeColor('charts.green'));
    item.description = `${team.members.length} members`;
    item.tooltip = new vscode.MarkdownString(
      `**Team: ${team.name}**\n\n` +
      `Lead: ${lead?.name || 'Unknown'}\n\n` +
      `Teammates: ${teammateCount}\n\n` +
      (team.createdAt ? `Created: ${team.createdAt}` : '')
    );

    if (team.configPath) {
      item.command = {
        command: 'claudeLens.openFile',
        title: 'Open Config',
        arguments: [vscode.Uri.file(team.configPath)],
      };
    }

    return item;
  }

  private _createFolderTreeItem(folder: ClaudeFolder, index: number): TreeItem {
    const relativePath = path.relative(
      folder.workspaceFolder.uri.fsPath,
      folder.claudePath.fsPath
    );
    const isRoot = !relativePath || relativePath === '.claude';

    // Match dashboard card display: show workspace name for root, workspace/subpath for nested
    const label = isRoot
      ? folder.workspaceFolder.name
      : `${folder.workspaceFolder.name}/${relativePath.replace(/\/?\.claude$/, '')}`;
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
    item.description = '.claude';
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
  teamConfig?: TeamConfig;
}
