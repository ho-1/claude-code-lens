import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult, TeamConfig, TaskItem, TaskStatus } from './types';
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

    // Root level: show folders + agent teams section
    if (!element) {
      const items: TreeItem[] = this._scanResult.folders.map((folder, index) => this._createFolderTreeItem(folder, index));

      // Add Agent Teams section if there are teams or tasks
      const { teamData } = this._scanResult;
      if (teamData.teams.length > 0 || teamData.tasks.length > 0) {
        items.push(this._createAgentTeamsRoot());
      }

      return items;
    }

    // Agent Teams root: show teams and task groups
    if (element.contextValue === 'agentTeamsRoot') {
      const { teamData } = this._scanResult;
      const items: TreeItem[] = [];

      if (teamData.teams.length > 0) {
        items.push(this._createTeamsGroupItem(teamData.teams));
      }
      if (teamData.tasks.length > 0) {
        items.push(this._createTasksGroupItem(teamData.tasks));
      }

      return items;
    }

    // Teams group: show individual teams
    if (element.contextValue === 'teamsGroup') {
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

    // Tasks group: show tasks grouped by status
    if (element.contextValue === 'tasksGroup') {
      const { teamData } = this._scanResult;
      const statusGroups: { status: TaskStatus; label: string; icon: string; color: string }[] = [
        { status: 'in_progress', label: 'In Progress', icon: 'sync~spin', color: 'charts.blue' },
        { status: 'pending', label: 'Pending', icon: 'circle-outline', color: 'charts.yellow' },
        { status: 'completed', label: 'Completed', icon: 'pass-filled', color: 'charts.green' },
      ];

      return statusGroups
        .map(group => {
          const tasks = teamData.tasks.filter(t => t.status === group.status);
          if (tasks.length === 0) return null;

          const item = new TreeItem(
            `${group.label} (${tasks.length})`,
            vscode.TreeItemCollapsibleState.Expanded
          );
          item.contextValue = `taskStatus_${group.status}`;
          item.taskItems = tasks;
          item.iconPath = new vscode.ThemeIcon(group.icon, new vscode.ThemeColor(group.color));
          return item;
        })
        .filter((item): item is TreeItem => item !== null);
    }

    // Task status group: show individual tasks
    if (element.contextValue?.startsWith('taskStatus_') && element.taskItems) {
      return element.taskItems.map(task => this._createTaskTreeItem(task));
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

  private _createTeamsGroupItem(teams: TeamConfig[]): TreeItem {
    const item = new TreeItem(
      `Teams (${teams.length})`,
      vscode.TreeItemCollapsibleState.Expanded
    );
    item.contextValue = 'teamsGroup';
    item.iconPath = new vscode.ThemeIcon('organization', new vscode.ThemeColor('charts.green'));
    return item;
  }

  private _createTasksGroupItem(tasks: TaskItem[]): TreeItem {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    const item = new TreeItem(
      `Tasks (${tasks.length})`,
      vscode.TreeItemCollapsibleState.Expanded
    );
    item.contextValue = 'tasksGroup';
    item.iconPath = new vscode.ThemeIcon('checklist', new vscode.ThemeColor('charts.blue'));
    item.description = `${inProgress} active, ${pending} pending, ${completed} done`;
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

  private _createTaskTreeItem(task: TaskItem): TreeItem {
    const statusIcon = task.status === 'completed' ? 'pass-filled'
      : task.status === 'in_progress' ? 'sync~spin'
      : 'circle-outline';
    const statusColor = task.status === 'completed' ? 'charts.green'
      : task.status === 'in_progress' ? 'charts.blue'
      : 'charts.yellow';

    const item = new TreeItem(
      task.subject,
      vscode.TreeItemCollapsibleState.None
    );
    item.contextValue = 'taskItem';
    item.iconPath = new vscode.ThemeIcon(statusIcon, new vscode.ThemeColor(statusColor));
    item.description = task.owner ? `@${task.owner}` : task.teamName;

    const blockedByText = task.blockedBy?.length ? `\n\nBlocked by: ${task.blockedBy.join(', ')}` : '';
    const blocksText = task.blocks?.length ? `\n\nBlocks: ${task.blocks.join(', ')}` : '';

    item.tooltip = new vscode.MarkdownString(
      `**${task.subject}**\n\n` +
      (task.description ? `${task.description}\n\n` : '') +
      `Status: ${task.status}\n\n` +
      `Team: ${task.teamName}` +
      (task.owner ? `\n\nOwner: ${task.owner}` : '') +
      blockedByText + blocksText
    );

    if (task.filePath) {
      item.command = {
        command: 'claudeLens.openFile',
        title: 'Open Task',
        arguments: [vscode.Uri.file(task.filePath)],
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
  teamConfig?: TeamConfig;
  taskItems?: TaskItem[];
}
