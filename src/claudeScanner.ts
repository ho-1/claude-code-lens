import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult, HooksConfig } from './types';
import { parseFrontmatter } from './frontmatterParser';
import { calculateStats } from './utils/statsCalculator';

// Maximum file size for JSON parsing (1MB) - prevents memory exhaustion attacks
const MAX_JSON_FILE_SIZE = 1024 * 1024;

export async function scanWorkspace(): Promise<ScanResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return { folders: [], stats: { totalFiles: 0, skills: 0, commands: 0, agents: 0, hooks: 0, configs: 0, skillItems: [], commandItems: [], agentItems: [] } };
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
    const existingFolders = items
      .filter(item => item.type === 'folder')
      .map(item => item.name.toLowerCase());

    // Check for .mcp.json in the parent directory of .claude folder
    const parentDir = vscode.Uri.file(path.dirname(folderPath));
    const mcpJsonPath = vscode.Uri.joinPath(parentDir, '.mcp.json');
    let mcpConfig: ClaudeConfigItem | undefined;
    if (await checkFileExists(mcpJsonPath)) {
      const parsed = await parseFile(mcpJsonPath);
      mcpConfig = {
        uri: mcpJsonPath,
        type: 'file',
        name: '.mcp.json',
        relativePath: path.relative(workspaceFolder.uri.fsPath, mcpJsonPath.fsPath),
        parsed,
      };
    }

    // Count hooks from settings.json files
    const hooksCount = await countHooksInFolder(items);

    claudeFolders.push({
      workspaceFolder,
      claudePath: claudeUri,
      items,
      hasClaudeMd,
      existingFolders,
      mcpConfig,
      hooksCount,
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

/**
 * Count hooks from settings.json files in a .claude folder
 */
async function countHooksInFolder(items: ClaudeConfigItem[]): Promise<number> {
  let count = 0;

  for (const item of items) {
    if (item.type === 'file' && item.name.toLowerCase().startsWith('settings') && item.name.endsWith('.json')) {
      try {
        const content = await vscode.workspace.fs.readFile(item.uri);

        // Skip files that are too large
        if (content.byteLength > MAX_JSON_FILE_SIZE) {
          continue;
        }

        const text = Buffer.from(content).toString('utf8');
        const json = JSON.parse(text);

        if (json.hooks && typeof json.hooks === 'object') {
          const hooksConfig = json.hooks as HooksConfig;
          // Count total hook matchers across all events
          for (const event of Object.keys(hooksConfig)) {
            const matchers = hooksConfig[event];
            if (Array.isArray(matchers)) {
              count += matchers.length;
            }
          }
        }
      } catch {
        // Failed to parse settings.json
      }
    }
  }

  return count;
}

