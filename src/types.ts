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
}

export interface ClaudeStats {
  totalFiles: number;
  skills: number;
  commands: number;
  agents: number;
  hooks: number;
  configs: number;
}

export interface ScanResult {
  folders: ClaudeFolder[];
  stats: ClaudeStats;
}
