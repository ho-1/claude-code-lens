import * as vscode from 'vscode';

export interface Permissions {
  allow?: string[];
  deny?: string[];
}

export interface Frontmatter {
  icon?: string;
  name?: string;
  description?: string;
  tools?: string[];
  allowedTools?: string[];
  model?: string;
  permissionMode?: string;
  permissions?: Permissions;
  hooksCount?: number;  // For settings.json files
}

export interface ParsedFile {
  frontmatter: Frontmatter;
  content: string;
  preview: string;
}

export interface ClaudeConfigItem {
  uri: vscode.Uri;
  type: 'folder' | 'file';
  name: string;
  relativePath: string;
  parsed?: ParsedFile;
  children?: ClaudeConfigItem[];
}

export interface ClaudeFolder {
  workspaceFolder: vscode.WorkspaceFolder;
  claudePath: vscode.Uri;
  items: ClaudeConfigItem[];
  hasClaudeMd: boolean;
  existingFolders: string[];
  mcpConfig?: ClaudeConfigItem;
  hooksCount: number;
}

export interface ClaudeStats {
  totalFiles: number;
  skills: number;
  commands: number;
  agents: number;
  hooks: number;
  configs: number;
  teams: number;
  tasks: number;
  teammates: number;
  skillItems: string[];
  commandItems: string[];
  agentItems: string[];
  teamItems: string[];
}

// Agent Teams types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TeamMember {
  name: string;
  agentId: string;
  agentType: 'lead' | 'teammate';
}

export interface TeamConfig {
  name: string;
  configPath: string;
  members: TeamMember[];
  createdAt?: string;
}

export interface TaskItem {
  id: string;
  subject: string;
  description?: string;
  status: TaskStatus;
  owner?: string;
  blockedBy?: string[];
  blocks?: string[];
  teamName: string;
  filePath: string;
}

export interface TeamData {
  teams: TeamConfig[];
  tasks: TaskItem[];
}

export interface AgentTeamsSettings {
  enabled: boolean;
  teammateMode?: 'in-process' | 'tmux' | 'auto';
  dangerouslySkipPermissions?: boolean;
}

// Hooks configuration structure from settings.json
export interface HookMatcher {
  matcher: string;
  hooks: Array<{ type: string; command: string }>;
}

export interface HooksConfig {
  [event: string]: HookMatcher[];
}

export interface ScanResult {
  folders: ClaudeFolder[];
  stats: ClaudeStats;
  teamData: TeamData;
  agentTeamsSettings: AgentTeamsSettings;
}
