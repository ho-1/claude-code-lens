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
  skillItems: string[];
  commandItems: string[];
  agentItems: string[];
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
}
