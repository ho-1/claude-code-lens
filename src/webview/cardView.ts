/**
 * Card view rendering for the dashboard - Project-based list view
 */

import * as path from 'path';
import { ClaudeFolder, ClaudeConfigItem, ScanResult } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { getSvgIcon, getSvgFolderIcon } from '../utils/iconUtils';

// Category accent colors
const CATEGORY_COLORS = {
  skills: '#EF4444',    // red
  commands: '#3B82F6',  // blue
  agents: '#8B5CF6',    // purple
} as const;

type CategoryType = keyof typeof CATEGORY_COLORS;

/**
 * Render the card view content - project-based layout
 */
export function renderCardView(result: ScanResult): string {
  const { folders } = result;

  if (folders.length === 0) {
    return renderEmptyState();
  }

  return folders.map((f, i) => renderProjectCard(f, i)).join('');
}

/**
 * Get category items from a folder
 */
function getCategoryItems(folder: ClaudeFolder, category: CategoryType): ClaudeConfigItem[] {
  const categoryFolder = folder.items.find(
    item => item.type === 'folder' && item.name.toLowerCase() === category
  );
  return categoryFolder?.children || [];
}

/**
 * Get root-level config files (CLAUDE.md, settings.json, mcp.json, etc.)
 */
function getRootFiles(folder: ClaudeFolder): ClaudeConfigItem[] {
  const categoryFolders = ['skills', 'commands', 'agents'];
  const files = folder.items.filter(
    item => item.type === 'file' ||
    (item.type === 'folder' && !categoryFolders.includes(item.name.toLowerCase()))
  );
  // Include mcpConfig if exists
  if (folder.mcpConfig) {
    files.push(folder.mcpConfig);
  }
  return files;
}

/**
 * Get display path for a folder
 */
function getDisplayPath(folder: ClaudeFolder): string {
  const relativePath = path.relative(
    folder.workspaceFolder.uri.fsPath,
    folder.claudePath.fsPath
  );
  const isRoot = !relativePath || relativePath === '.claude';
  return isRoot ? 'root' : relativePath.replace(/\/?\.claude$/, '');
}

/**
 * Render a project card
 */
function renderProjectCard(folder: ClaudeFolder, index: number): string {
  const displayPath = getDisplayPath(folder);
  const folderIcon = SVG_ICONS.folder(COLORS.folder);

  const rootFiles = getRootFiles(folder);
  const skillItems = getCategoryItems(folder, 'skills');
  const commandItems = getCategoryItems(folder, 'commands');
  const agentItems = getCategoryItems(folder, 'agents');

  return `
  <div class="project-card" data-project="${index}">
    <div class="project-header">
      <span class="project-icon">${folderIcon}</span>
      <span class="project-title">${escapeHtml(displayPath)}</span>
    </div>
    <div class="project-content">
      ${renderRootFiles(rootFiles)}
      ${renderCategorySection('skills', skillItems)}
      ${renderCategorySection('commands', commandItems)}
      ${renderCategorySection('agents', agentItems)}
    </div>
  </div>`;
}

/**
 * Render root-level config files
 */
function renderRootFiles(items: ClaudeConfigItem[]): string {
  if (items.length === 0) return '';

  return `
  <div class="root-files">
    ${items.map(item => renderRootFileItem(item)).join('')}
  </div>`;
}

/**
 * Render a root file item (CLAUDE.md, settings.json, etc.)
 */
function renderRootFileItem(item: ClaudeConfigItem): string {
  const icon = item.type === 'folder'
    ? getSvgFolderIcon(item.name, false)
    : getSvgIcon(item.name);
  const displayName = item.name;

  return `
  <div class="root-file-item" data-path="${escapeHtml(item.uri.fsPath)}">
    <span class="root-file-icon">${icon}</span>
    <span class="root-file-name">${escapeHtml(displayName)}</span>
  </div>`;
}

/**
 * Render a category section (Skills, Commands, Agents)
 */
function renderCategorySection(category: CategoryType, items: ClaudeConfigItem[]): string {
  if (items.length === 0) return '';

  const accentColor = CATEGORY_COLORS[category];
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return `
  <div class="category-section" data-category="${category}" style="--accent-color: ${accentColor}">
    <div class="category-header">
      <span class="category-name">${displayName}</span>
      <span class="category-count">${items.length}</span>
    </div>
    <div class="category-items">
      ${items.map(item => renderCategoryItem(item, category)).join('')}
    </div>
  </div>`;
}

/**
 * Render a category item (skill/command/agent)
 */
function renderCategoryItem(item: ClaudeConfigItem, category: CategoryType): string {
  const isExpandable = item.type === 'folder' && item.children && item.children.length > 0;
  const displayName = item.type === 'folder' ? item.name : item.name.replace(/\.md$/i, '');
  const frontmatter = item.parsed?.frontmatter || {};
  const description = frontmatter.description || item.parsed?.preview || '';
  const icon = item.type === 'folder'
    ? getSvgFolderIcon(item.name, true)
    : getSvgIcon(item.name, category);

  return `
  <div class="category-item ${isExpandable ? 'expandable' : ''}"
       data-path="${escapeHtml(item.uri.fsPath)}"
       data-expandable="${isExpandable}">
    <div class="item-main">
      <div class="item-header">
        ${isExpandable ? '<span class="item-chevron collapsed">▶</span>' : ''}
        <span class="item-icon">${icon}</span>
        <span class="item-name">${escapeHtml(displayName)}</span>
        ${item.type === 'folder' ? `<span class="item-badge">${item.children?.length || 0} files</span>` : ''}
      </div>
      ${description ? `<div class="item-description">${escapeHtml(description)}</div>` : ''}
    </div>
    ${isExpandable ? renderExpandedContent(item.children!) : ''}
  </div>`;
}

/**
 * Render expanded content (subfiles)
 */
function renderExpandedContent(children: ClaudeConfigItem[]): string {
  return `
  <div class="item-expanded collapsed">
    ${children.map(child => `
      <div class="subfile" data-path="${escapeHtml(child.uri.fsPath)}">
        <span class="subfile-icon">${getSvgIcon(child.name)}</span>
        <span class="subfile-name">${escapeHtml(child.name)}</span>
      </div>
    `).join('')}
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

/**
 * Get card view specific scripts
 */
export function getCardViewScripts(): string {
  return `
    // Root file item click - opens file
    document.querySelectorAll('.root-file-item').forEach(item => {
      item.addEventListener('click', () => {
        vscode.postMessage({
          type: 'openFile',
          path: item.dataset.path
        });
      });
    });

    // Category item click - opens file if not expandable
    document.querySelectorAll('.category-item:not(.expandable)').forEach(item => {
      item.addEventListener('click', () => {
        vscode.postMessage({
          type: 'openFile',
          path: item.dataset.path
        });
      });
    });

    // Expandable item - click on main area to toggle
    document.querySelectorAll('.category-item.expandable .item-main').forEach(main => {
      main.addEventListener('click', () => {
        const item = main.closest('.category-item');
        const expanded = item.querySelector('.item-expanded');
        const chevron = main.querySelector('.item-chevron');

        expanded.classList.toggle('collapsed');
        chevron.classList.toggle('collapsed');
      });
    });

    // Subfile click handler
    document.querySelectorAll('.subfile').forEach(subfile => {
      subfile.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({
          type: 'openFile',
          path: subfile.dataset.path
        });
      });
    });
  `;
}
