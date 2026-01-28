/**
 * HTML rendering functions for the dashboard webview
 */

import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { FOLDER_CATEGORIES } from '../constants/folderCategories';
import { getSvgIcon, getSvgFolderIcon } from '../utils/iconUtils';
import { DASHBOARD_STYLES } from './styles';

/**
 * Generate the complete HTML content for the dashboard
 */
export function getHtmlContent(result: ScanResult): string {
  const { folders, stats } = result;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Dashboard</title>
  <style>
    ${DASHBOARD_STYLES}
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Claude Code Dashboard</div>
    <div class="subtitle">View and manage your .claude configuration files</div>
    <div class="guide-links">
      <span class="guide-label">Docs:</span>
      <a href="https://docs.anthropic.com/en/docs/claude-code/skills" class="guide-link">Skills</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/hooks" class="guide-link">Hooks</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" class="guide-link">MCP</a>
      <a href="https://docs.anthropic.com/en/docs/claude-code/sub-agents" class="guide-link">Agents</a>
    </div>
  </div>

  ${renderStatsBar(stats)}

  ${folders.length === 0 ? renderEmptyState() : folders.map((f, i) => renderFolder(f, i)).join('')}

  <script>
    const vscode = acquireVsCodeApi();

    // Card click handler
    document.querySelectorAll('.card[data-path]').forEach(card => {
      card.addEventListener('click', () => {
        vscode.postMessage({
          type: 'openFile',
          path: card.dataset.path
        });
      });
    });

    // Folder toggle handler
    document.querySelectorAll('.folder-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.folder-section');
        const content = section.querySelector('.folder-content');
        const chevron = header.querySelector('.folder-chevron');

        content.classList.toggle('collapsed');
        chevron.classList.toggle('collapsed');
      });
    });

    // Subfolder toggle handler
    document.querySelectorAll('.subfolder-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.subfolder-section');
        const content = section.querySelector('.subfolder-content');
        const chevron = header.querySelector('.subfolder-chevron');

        content.classList.toggle('collapsed');
        chevron.classList.toggle('collapsed');
      });
    });

    // Folder action button handler
    document.querySelectorAll('.folder-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.disabled) return;
        vscode.postMessage({
          type: 'folderAction',
          action: btn.dataset.action,
          path: btn.dataset.path
        });
      });
    });

    // Banner click handler (entire banner is clickable)
    document.querySelectorAll('.action-banner[data-action]').forEach(banner => {
      banner.addEventListener('click', () => {
        vscode.postMessage({
          type: 'folderAction',
          action: banner.dataset.action,
          path: banner.dataset.path,
          folderName: banner.dataset.folderName
        });
      });
    });

    // Stats dropdown handler
    document.querySelectorAll('.stat-item.clickable').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = item.querySelector('.stat-dropdown');
        const isOpen = dropdown.classList.contains('show');

        // Close all dropdowns
        document.querySelectorAll('.stat-dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.stat-item.active').forEach(i => i.classList.remove('active'));

        // Toggle current dropdown
        if (!isOpen) {
          dropdown.classList.add('show');
          item.classList.add('active');
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.stat-item.clickable')) {
        document.querySelectorAll('.stat-dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.stat-item.active').forEach(i => i.classList.remove('active'));
      }
    });

  </script>
</body>
</html>`;
}

/**
 * Render the stats bar
 */
function renderStatsBar(stats: ScanResult['stats']): string {
  const skillsFormatted = stats.skillItems.map(s => `/${s}`);
  const commandsFormatted = stats.commandItems.map(c => `/${c}`);
  const agentsFormatted = stats.agentItems;

  return `
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-icon">${SVG_ICONS.file(COLORS.file)}</span>
      <span class="stat-value">${stats.totalFiles}</span>
      <span class="stat-label">Files</span>
    </div>
    <div class="stat-item clickable" data-dropdown="skills">
      <span class="stat-icon">${SVG_ICONS.target(COLORS.target)}</span>
      <span class="stat-value">${stats.skills}</span>
      <span class="stat-label">Skills</span>
      <div class="stat-dropdown" id="dropdown-skills">
        ${skillsFormatted.length > 0
          ? skillsFormatted.map(s => `<div class="dropdown-item">${escapeHtml(s)}</div>`).join('')
          : '<div class="dropdown-empty">No skills found</div>'
        }
      </div>
    </div>
    <div class="stat-item clickable" data-dropdown="commands">
      <span class="stat-icon">${SVG_ICONS.terminal(COLORS.terminal)}</span>
      <span class="stat-value">${stats.commands}</span>
      <span class="stat-label">Commands</span>
      <div class="stat-dropdown" id="dropdown-commands">
        ${commandsFormatted.length > 0
          ? commandsFormatted.map(c => `<div class="dropdown-item">${escapeHtml(c)}</div>`).join('')
          : '<div class="dropdown-empty">No commands found</div>'
        }
      </div>
    </div>
    <div class="stat-item clickable" data-dropdown="agents">
      <span class="stat-icon">${SVG_ICONS.robot(COLORS.robot)}</span>
      <span class="stat-value">${stats.agents}</span>
      <span class="stat-label">Agents</span>
      <div class="stat-dropdown" id="dropdown-agents">
        ${agentsFormatted.length > 0
          ? agentsFormatted.map(a => `<div class="dropdown-item">${escapeHtml(a)}</div>`).join('')
          : '<div class="dropdown-empty">No agents found</div>'
        }
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-icon">${SVG_ICONS.bolt(COLORS.bolt)}</span>
      <span class="stat-value">${stats.hooks}</span>
      <span class="stat-label">Hooks</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon">${SVG_ICONS.gear(COLORS.gear)}</span>
      <span class="stat-value">${stats.configs}</span>
      <span class="stat-label">Configs</span>
    </div>
  </div>`;
}

/**
 * Render a folder section
 */
function renderFolder(folder: ClaudeFolder, index: number): string {
  const relativePath = path.relative(
    folder.workspaceFolder.uri.fsPath,
    folder.claudePath.fsPath
  );
  const displayPath = relativePath || '.claude';
  const isRoot = !relativePath || relativePath === '.claude';
  const fileCount = countFiles(folder.items) + (folder.mcpConfig ? 1 : 0);
  const folderIcon = SVG_ICONS.folder(COLORS.folder);
  const claudePath = folder.claudePath.fsPath;

  // Find missing folders (only suggest agents, skills, commands)
  const SUGGESTABLE_FOLDERS = ['agents', 'skills', 'commands'] as const;
  const missingFolders = SUGGESTABLE_FOLDERS.filter(
    cat => !folder.existingFolders.includes(cat)
  );

  return `
  <div class="folder-section" data-folder="${index}">
    <div class="folder-header">
      <span class="folder-chevron collapsed">▼</span>
      <span class="folder-icon">${folderIcon}</span>
      <span class="folder-title">${isRoot ? '.claude (root)' : escapeHtml(displayPath)}</span>
      <span class="folder-badge">${fileCount} files</span>
    </div>
    <div class="folder-content collapsed">
      ${!folder.hasClaudeMd ? `
      <div class="action-banner add-claude-md-banner" data-action="addClaudeMd" data-path="${escapeHtml(claudePath)}">
        <span class="banner-icon">${SVG_ICONS.document(COLORS.document)}</span>
        <span class="banner-text">No CLAUDE.md in this folder</span>
        <span class="banner-action">+ Add CLAUDE.md</span>
      </div>` : ''}
      ${missingFolders.length > 0 ? `
      <div class="missing-folders-guide">
        <span class="guide-label">Add folders:</span>
        <div class="guide-buttons">
          ${missingFolders.map(folderName => `
          <div class="action-banner add-folder-banner" data-action="addFolder" data-path="${escapeHtml(claudePath)}" data-folder-name="${folderName}">
            <span class="banner-icon">${getSvgFolderIcon(folderName, true)}</span>
            <span class="banner-text">${folderName}/</span>
            <span class="banner-action">+</span>
          </div>`).join('')}
        </div>
      </div>` : ''}
      ${renderItems(folder.items, undefined, folder.mcpConfig ? [folder.mcpConfig] : undefined)}
    </div>
  </div>`;
}

/**
 * Count files recursively
 */
function countFiles(items: ClaudeConfigItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.type === 'file') {
      count++;
    } else if (item.children) {
      count += countFiles(item.children);
    }
  }
  return count;
}

/**
 * Render items (files and subfolders)
 */
function renderItems(items: ClaudeConfigItem[], parentFolder?: string, extraFiles?: ClaudeConfigItem[]): string {
  let files = items.filter(i => i.type === 'file');
  if (extraFiles) {
    files = [...files, ...extraFiles];
  }
  const folders = items.filter(i => i.type === 'folder');

  let html = '';

  // Render files first in a grid
  if (files.length > 0) {
    html += `<div class="cards-grid">${files.map(f => renderCard(f, parentFolder)).join('')}</div>`;
  }

  // Render subfolders
  for (const folder of folders) {
    html += renderSubfolder(folder);
  }

  return html;
}

/**
 * Render a subfolder section
 */
function renderSubfolder(item: ClaudeConfigItem): string {
  if (!item.children || item.children.length === 0) {
    return '';
  }

  const fileCount = countFiles(item.children);
  const folderIcon = getSvgFolderIcon(item.name, true);

  return `
  <div class="subfolder-section">
    <div class="subfolder-header">
      <span class="subfolder-chevron collapsed">▼</span>
      <span class="subfolder-icon">${folderIcon}</span>
      <span class="subfolder-name">${escapeHtml(item.name)}/ (${fileCount})</span>
    </div>
    <div class="subfolder-content collapsed">
      ${renderItems(item.children, item.name)}
    </div>
  </div>`;
}

/**
 * Render a file card
 */
function renderCard(item: ClaudeConfigItem, parentFolder?: string): string {
  const frontmatter = item.parsed?.frontmatter || {};
  const title = frontmatter.name || item.name;
  const description = frontmatter.description || item.parsed?.preview || '';
  const icon = getSvgIcon(item.name, parentFolder);

  // Build metadata items
  const metadataItems: string[] = [];
  if (frontmatter.model) {
    metadataItems.push(`<span class="card-metadata-item model">model: ${escapeHtml(frontmatter.model)}</span>`);
  }
  if (frontmatter.tools && frontmatter.tools.length > 0) {
    const toolsStr = frontmatter.tools.length > 3
      ? frontmatter.tools.slice(0, 3).join(', ') + '...'
      : frontmatter.tools.join(', ');
    metadataItems.push(`<span class="card-metadata-item tools">tools: ${escapeHtml(toolsStr)}</span>`);
  }
  if (frontmatter.permissionMode) {
    metadataItems.push(`<span class="card-metadata-item permission">${escapeHtml(frontmatter.permissionMode)}</span>`);
  }
  if (frontmatter.hooksCount) {
    metadataItems.push(`<span class="card-metadata-item hooks">${SVG_ICONS.bolt(COLORS.bolt)} ${frontmatter.hooksCount} hooks</span>`);
  }

  // Build allowed-tools section (for skills)
  let allowedToolsHtml = '';
  if (frontmatter.allowedTools && frontmatter.allowedTools.length > 0) {
    const toolTags = frontmatter.allowedTools.map(t => `<span class="permission-tag allow">${escapeHtml(t)}</span>`).join('');
    allowedToolsHtml = `<div class="permissions-section"><div class="permissions-row"><span class="permissions-label">tools</span><div class="permissions-tags">${toolTags}</div></div></div>`;
  }

  // Build permissions section
  let permissionsHtml = '';
  if (frontmatter.permissions) {
    const { allow, deny } = frontmatter.permissions;
    const hasPermissions = (allow && allow.length > 0) || (deny && deny.length > 0);

    if (hasPermissions) {
      let rowsHtml = '';
      if (allow && allow.length > 0) {
        const allowTags = allow.map(p => `<span class="permission-tag allow">${escapeHtml(p)}</span>`).join('');
        rowsHtml += `<div class="permissions-row"><span class="permissions-label">allow</span><div class="permissions-tags">${allowTags}</div></div>`;
      }
      if (deny && deny.length > 0) {
        const denyTags = deny.map(p => `<span class="permission-tag deny">${escapeHtml(p)}</span>`).join('');
        rowsHtml += `<div class="permissions-row"><span class="permissions-label">deny</span><div class="permissions-tags">${denyTags}</div></div>`;
      }
      permissionsHtml = `<div class="permissions-section">${rowsHtml}</div>`;
    }
  }

  return `
  <div class="card" data-path="${escapeHtml(item.uri.fsPath)}">
    <div class="card-header">
      <span class="card-icon">${icon}</span>
      <span class="card-title">${escapeHtml(title)}</span>
    </div>
    ${description ? `<div class="card-description">${escapeHtml(description)}</div>` : ''}
    ${metadataItems.length > 0 ? `<div class="card-metadata">${metadataItems.join('')}</div>` : ''}
    ${allowedToolsHtml}
    ${permissionsHtml}
  </div>`;
}

/**
 * Render empty state
 */
function renderEmptyState(): string {
  return `
  <div class="empty-state">
    <div class="empty-icon">📭</div>
    <div class="empty-title">No .claude folders found</div>
    <div class="empty-message">Create a .claude folder with config files to get started</div>
  </div>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
