/**
 * Card view rendering for the dashboard - Clean card grid layout
 */

import * as path from 'path'
import { ClaudeFolder, ClaudeConfigItem, ScanResult } from '../types'
import { COLORS } from '../constants/colors'
import { SVG_ICONS } from '../constants/icons'
import { FOLDER_CATEGORIES } from '../constants/folderCategories'
import { getSvgIcon, getSvgFolderIcon } from '../utils/iconUtils'
import { escapeHtml } from '../utils/escapeHtml'

// Category icon/color/accent mapping
const CATEGORY_MAP = {
  skills: { icon: () => SVG_ICONS.sparkle('#EF4444'), label: 'Skills', accent: '#EF4444' },
  commands: { icon: () => SVG_ICONS.terminal('#3B82F6'), label: 'Commands', accent: '#3B82F6' },
  agents: { icon: () => SVG_ICONS.robot('#8B5CF6'), label: 'Agents', accent: '#8B5CF6' },
} as const

type CategoryType = keyof typeof CATEGORY_MAP

/**
 * Render the card view content - project-based card grid layout
 */
export function renderCardView(result: ScanResult): string {
  const { folders } = result

  if (folders.length === 0) {
    return renderEmptyState()
  }

  return folders.map((f) => renderProjectSection(f)).join('')
}

/**
 * Get category items from a folder
 */
function getCategoryItems(folder: ClaudeFolder, category: CategoryType): ClaudeConfigItem[] {
  const categoryFolder = folder.items.find(
    (item) => item.type === 'folder' && item.name.toLowerCase() === category,
  )
  return categoryFolder?.children || []
}

/**
 * Get root-level config files
 */
function getRootFiles(folder: ClaudeFolder): ClaudeConfigItem[] {
  const files = folder.items.filter(
    (item) =>
      item.type === 'file' ||
      (item.type === 'folder' &&
        !FOLDER_CATEGORIES.includes(item.name.toLowerCase() as (typeof FOLDER_CATEGORIES)[number])),
  )
  if (folder.mcpConfig) {
    files.push(folder.mcpConfig)
  }
  return files
}

/**
 * Get display path for a folder
 */
function getDisplayPath(folder: ClaudeFolder): string {
  const relativePath = path.relative(folder.workspaceFolder.uri.fsPath, folder.claudePath.fsPath)
  const isRoot = !relativePath || relativePath === '.claude'

  if (isRoot) {
    return folder.workspaceFolder.name
  }

  const subPath = relativePath.replace(/\/?\.claude$/, '')
  return `${folder.workspaceFolder.name}/${subPath}`
}

/**
 * Render a project section with header + card grid
 */
function renderProjectSection(folder: ClaudeFolder): string {
  const displayPath = getDisplayPath(folder)
  const folderIcon = SVG_ICONS.folder(COLORS.folder)

  const rootFiles = getRootFiles(folder)
  const skillItems = getCategoryItems(folder, 'skills')
  const commandItems = getCategoryItems(folder, 'commands')
  const agentItems = getCategoryItems(folder, 'agents')

  const totalItems = rootFiles.length + skillItems.length + commandItems.length + agentItems.length

  const cards: string[] = []

  // Always show all cards, even when empty
  cards.push(renderConfigCard(rootFiles))
  cards.push(renderCategoryCard('skills', skillItems))
  cards.push(renderCategoryCard('commands', commandItems))
  cards.push(renderCategoryCard('agents', agentItems))

  return `
  <div class="project-section">
    <div class="project-section-header">
      <span class="project-section-icon">${folderIcon}</span>
      <span class="project-section-title">${escapeHtml(displayPath)}</span>
      <span class="project-section-count">${totalItems}</span>
    </div>
    <div class="project-cards">
      ${cards.join('')}
    </div>
  </div>`
}

/**
 * Render Config card for root files
 */
function renderConfigCard(items: ClaudeConfigItem[]): string {
  return `
  <div class="project-card config-card">
    <div class="config-card-body">
      ${
        items.length > 0
          ? items.map((item) => renderConfigItem(item)).join('')
          : '<div class="card-empty">No config files</div>'
      }
    </div>
  </div>`
}

/**
 * Render a category card (Skills, Commands, Agents)
 */
function renderCategoryCard(category: CategoryType, items: ClaudeConfigItem[]): string {
  const { icon, label, accent } = CATEGORY_MAP[category]

  return `
  <div class="project-card" style="border-top: 3px solid ${accent}">
    <div class="project-card-header">
      <div class="project-card-title">
        ${icon()}
        <span>${label}</span>
      </div>
      <span class="project-card-badge">${items.length}</span>
    </div>
    <div class="project-card-body">
      ${
        items.length > 0
          ? items.map((item) => renderCategoryItem(item, category)).join('')
          : `<div class="card-empty">No ${label.toLowerCase()} yet</div>`
      }
    </div>
  </div>`
}

/**
 * Render a config item (root file)
 */
function renderConfigItem(item: ClaudeConfigItem): string {
  const icon = item.type === 'folder' ? getSvgFolderIcon(item.name, false) : getSvgIcon(item.name)

  return `
  <div class="config-pill" data-path="${escapeHtml(item.uri.fsPath)}">
    <span class="config-item-icon">${icon}</span>
    <span class="config-item-name">${escapeHtml(item.name)}</span>
  </div>`
}

/**
 * Render a category item (skill/command/agent)
 */
function renderCategoryItem(item: ClaudeConfigItem, category: CategoryType): string {
  const displayName = item.type === 'folder' ? item.name : item.name.replace(/\.md$/i, '')
  const frontmatter = item.parsed?.frontmatter || {}
  const description = frontmatter.description || item.parsed?.preview || ''
  const icon =
    item.type === 'folder' ? getSvgFolderIcon(item.name, true) : getSvgIcon(item.name, category)

  const copyText = `/${displayName}`
  const copyIcon = SVG_ICONS.clipboard('currentColor')

  const children =
    item.type === 'folder' && item.children && item.children.length > 0 ? item.children : []

  const isExpandable = children.length > 0

  return `
  <div class="config-item ${isExpandable ? 'expandable' : ''}" data-path="${escapeHtml(item.uri.fsPath)}">
    ${isExpandable ? '<span class="config-item-chevron collapsed">▶</span>' : ''}
    <span class="config-item-icon">${icon}</span>
    <div class="config-item-content">
      <div class="config-item-row">
        <span class="config-item-name">${escapeHtml(displayName)}</span>
        ${isExpandable ? `<span class="config-item-badge">${children.length} files</span>` : ''}
        <div class="config-item-actions">
          <button class="action-btn copy-btn"
                  data-copy-text="${escapeHtml(copyText)}"
                  title="Copy name">
            ${copyIcon}
          </button>
        </div>
      </div>
      ${description ? `<div class="config-item-desc">${escapeHtml(description)}</div>` : ''}
    </div>
  </div>
  ${isExpandable ? `<div class="config-subitems collapsed">${children.map((child) => renderSubitem(child)).join('')}</div>` : ''}`
}

/**
 * Render a subitem (child of folder item)
 */
function renderSubitem(child: ClaudeConfigItem): string {
  const icon =
    child.type === 'folder' ? getSvgFolderIcon(child.name, false) : getSvgIcon(child.name)

  return `
  <div class="config-subitem" data-path="${escapeHtml(child.uri.fsPath)}">
    <span class="config-item-icon">${icon}</span>
    <span class="config-item-name">${escapeHtml(child.name)}</span>
  </div>`
}

/**
 * Render empty state
 */
function renderEmptyState(): string {
  return `
  <div class="empty-state">
    <div class="empty-icon">${SVG_ICONS.folder('#6B7280')}</div>
    <div class="empty-title">No .claude folders found</div>
    <div class="empty-message">Create a .claude folder with config files to get started</div>
  </div>`
}

/**
 * Get card view specific scripts
 */
export function getCardViewScripts(): string {
  return `
    // Config pill click - opens file
    document.querySelectorAll('.config-pill[data-path]').forEach(item => {
      item.addEventListener('click', () => {
        vscode.postMessage({
          type: 'openFile',
          path: item.dataset.path
        });
      });
    });

    // Category item click - opens file (non-expandable only)
    document.querySelectorAll('.config-item[data-path]:not(.expandable)').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn')) return;
        vscode.postMessage({
          type: 'openFile',
          path: item.dataset.path
        });
      });
    });

    // Expandable item click - toggle children
    document.querySelectorAll('.config-item.expandable').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn')) return;
        const chevron = item.querySelector('.config-item-chevron');
        const subitems = item.nextElementSibling;
        if (subitems && subitems.classList.contains('config-subitems')) {
          subitems.classList.toggle('collapsed');
          chevron.classList.toggle('collapsed');
        }
      });
    });

    // Subitem click - opens file
    document.querySelectorAll('.config-subitem[data-path]').forEach(item => {
      item.addEventListener('click', () => {
        vscode.postMessage({
          type: 'openFile',
          path: item.dataset.path
        });
      });
    });

    // Copy button
    document.querySelectorAll('.config-item-actions .copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const copyText = btn.dataset.copyText;
        if (copyText) {
          try {
            await navigator.clipboard.writeText(copyText);
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1500);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        }
      });
    });
  `
}
