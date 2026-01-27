import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult } from './types';
import { parseFrontmatter } from './frontmatterParser';
import { calculateStats } from './utils/statsCalculator';

export async function scanWorkspace(): Promise<ScanResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return { folders: [], stats: { totalFiles: 0, skills: 0, commands: 0, agents: 0, hooks: 0, configs: 0 } };
  }

  const folders: ClaudeFolder[] = [];

  for (const folder of workspaceFolders) {
    const claudeFolders = await findClaudeFolders(folder);
    folders.push(...claudeFolders);
  }

  const stats = calculateStats(folders);

  return { folders, stats };
}

async function findClaudeFolders(workspaceFolder: vscode.WorkspaceFolder): Promise<ClaudeFolder[]> {
  // Find files inside .claude folders to detect all .claude directories
  const pattern = new vscode.RelativePattern(workspaceFolder, '**/.claude/**/*');
  const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');

  // Extract unique .claude folder paths
  const claudeFolderPaths = new Set<string>();

  for (const fileUri of files) {
    const claudePath = extractClaudeFolderPath(fileUri.fsPath);
    if (claudePath) {
      claudeFolderPaths.add(claudePath);
    }
  }

  // Also directly check the root .claude folder
  const rootClaudePath = vscode.Uri.joinPath(workspaceFolder.uri, '.claude');
  try {
    const stat = await vscode.workspace.fs.stat(rootClaudePath);
    if (stat.type === vscode.FileType.Directory) {
      claudeFolderPaths.add(rootClaudePath.fsPath);
    }
  } catch {
    // Root .claude doesn't exist
  }

  // Build ClaudeFolder objects
  const claudeFolders: ClaudeFolder[] = [];

  for (const folderPath of claudeFolderPaths) {
    const claudeUri = vscode.Uri.file(folderPath);
    const items = await scanClaudeFolder(claudeUri, workspaceFolder);
    const hasClaudeMd = await checkFileExists(vscode.Uri.joinPath(claudeUri, 'CLAUDE.md'));
    claudeFolders.push({
      workspaceFolder,
      claudePath: claudeUri,
      items,
      hasClaudeMd,
    });
  }

  // Sort by path depth (root first), then by name
  claudeFolders.sort((a, b) => {
    const depthA = a.claudePath.fsPath.split(path.sep).length;
    const depthB = b.claudePath.fsPath.split(path.sep).length;
    if (depthA !== depthB) return depthA - depthB;
    return a.claudePath.fsPath.localeCompare(b.claudePath.fsPath);
  });

  return claudeFolders;
}

function extractClaudeFolderPath(filePath: string): string | null {
  const parts = filePath.split(path.sep);
  const claudeIndex = parts.lastIndexOf('.claude');

  if (claudeIndex === -1) return null;

  return parts.slice(0, claudeIndex + 1).join(path.sep);
}

async function checkFileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function scanClaudeFolder(
  claudePath: vscode.Uri,
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ClaudeConfigItem[]> {
  const items: ClaudeConfigItem[] = [];

  try {
    const entries = await vscode.workspace.fs.readDirectory(claudePath);

    for (const [name, type] of entries) {
      const uri = vscode.Uri.joinPath(claudePath, name);
      const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);

      if (type & vscode.FileType.Directory) {
        const children = await scanDirectory(uri, workspaceFolder);
        items.push({
          uri,
          type: 'folder',
          name,
          relativePath,
          children,
        });
      } else if (type & vscode.FileType.File) {
        const parsed = await parseFile(uri);
        items.push({
          uri,
          type: 'file',
          name,
          relativePath,
          parsed,
        });
      }
    }
  } catch {
    // Failed to read directory
  }

  // Sort: folders first, then files, alphabetically
  items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  return items;
}

async function scanDirectory(
  dirPath: vscode.Uri,
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ClaudeConfigItem[]> {
  const items: ClaudeConfigItem[] = [];

  try {
    const entries = await vscode.workspace.fs.readDirectory(dirPath);

    for (const [name, type] of entries) {
      const uri = vscode.Uri.joinPath(dirPath, name);
      const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);

      if (type & vscode.FileType.Directory) {
        const children = await scanDirectory(uri, workspaceFolder);
        items.push({
          uri,
          type: 'folder',
          name,
          relativePath,
          children,
        });
      } else if (type & vscode.FileType.File) {
        const parsed = await parseFile(uri);
        items.push({
          uri,
          type: 'file',
          name,
          relativePath,
          parsed,
        });
      }
    }
  } catch {
    // Failed to read directory
  }

  items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  return items;
}

async function parseFile(uri: vscode.Uri): Promise<ClaudeConfigItem['parsed']> {
  try {
    const content = await vscode.workspace.fs.readFile(uri);
    const text = Buffer.from(content).toString('utf8');
    const filename = path.basename(uri.fsPath);
    return parseFrontmatter(text, filename);
  } catch {
    return {
      frontmatter: {},
      content: '',
      preview: '',
    };
  }
}

