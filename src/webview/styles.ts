/**
 * CSS styles for the dashboard webview
 */

export const DASHBOARD_STYLES = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
  padding: 24px;
  min-height: 100vh;
}

/* Header */
.header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
}

.guide-links {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
}

.guide-links .guide-label {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.guide-links .guide-link {
  font-size: 11px;
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--vscode-input-background);
  transition: all 0.15s;
}

.guide-links .guide-link:hover {
  background: var(--vscode-list-hoverBackground);
  text-decoration: underline;
}

.guide-links .guide-separator {
  color: var(--vscode-descriptionForeground);
  opacity: 0.4;
  font-size: 11px;
}

.guide-links .guide-link.community {
  color: var(--vscode-charts-purple, #a855f7);
}

/* Stats Bar */
.stats-bar {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--vscode-input-background);
  border-radius: 8px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  transition: background 0.15s;
  position: relative;
}

.stat-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  background: var(--vscode-list-activeSelectionBackground);
}

.stat-item.active {
  background: var(--vscode-list-activeSelectionBackground);
}

/* Stat Dropdown */
.stat-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--vscode-dropdown-background, var(--vscode-editor-background));
  border: 1px solid var(--vscode-dropdown-border, var(--vscode-widget-border));
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 4px;
}

.stat-dropdown.show {
  display: block;
}

.stat-dropdown .dropdown-item {
  padding: 8px 12px;
  font-size: 12px;
  font-family: var(--vscode-editor-font-family, monospace);
  color: var(--vscode-foreground);
  cursor: default;
  transition: background 0.1s;
}

.stat-dropdown .dropdown-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.stat-dropdown .dropdown-empty {
  padding: 12px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  text-align: center;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 16px;
  height: 16px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
}

.stat-label {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

/* Folder Section - Gestalt: Proximity + Common Region */
.folder-section {
  margin-bottom: 24px;
  background: var(--vscode-sideBar-background);
  border-radius: 12px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--vscode-titleBar-activeBackground, var(--vscode-sideBar-background));
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.folder-header:hover {
  background: var(--vscode-list-hoverBackground);
}

.folder-chevron {
  font-size: 12px;
  transition: transform 0.2s;
  color: var(--vscode-descriptionForeground);
}

.folder-chevron.collapsed {
  transform: rotate(-90deg);
}

.folder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-icon svg {
  width: 18px;
  height: 18px;
}

.folder-title {
  font-weight: 500;
  font-size: 13px;
  flex: 1;
}

.folder-badge {
  font-size: 11px;
  color: #ffffff;
  background: var(--vscode-badge-background);
  padding: 2px 8px;
  border-radius: 10px;
}

.folder-path {
  color: var(--vscode-descriptionForeground);
  font-size: 11px;
}

.folder-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.folder-header:hover .folder-actions {
  opacity: 1;
}

.folder-action-btn {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid var(--vscode-button-border, rgba(255,255,255,0.1));
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  cursor: pointer;
  transition: background 0.15s;
}

.folder-action-btn:hover:not(:disabled) {
  background: var(--vscode-button-secondaryHoverBackground);
}

.folder-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.folder-content {
  padding: 16px 18px;
  border-top: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.folder-content.collapsed {
  display: none;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

/* Card - Gestalt: Common Region + Similarity */
.card {
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card:hover {
  border-color: var(--vscode-focusBorder);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vscode-input-background);
  border-radius: 6px;
  padding: 4px;
}

.card-icon svg {
  width: 20px;
  height: 20px;
}

.card-title {
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-metadata {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  font-family: var(--vscode-editor-font-family);
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-metadata-item {
  background: var(--vscode-input-background);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.card-metadata-item.model {
  color: #8B5CF6;
}

.card-metadata-item.tools {
  color: #3B82F6;
}

.card-metadata-item.permission {
  color: #F97316;
}

.card-metadata-item.hooks {
  color: #EF4444;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-metadata-item.hooks svg {
  width: 10px;
  height: 10px;
}

/* Permissions Tags */
.permissions-section {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.permissions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permissions-label {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  font-weight: 500;
  flex-shrink: 0;
  width: 32px;
}

.permissions-tags {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--vscode-scrollbarSlider-background) transparent;
}

.permissions-tags::-webkit-scrollbar {
  height: 4px;
}

.permissions-tags::-webkit-scrollbar-track {
  background: transparent;
}

.permissions-tags::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-background);
  border-radius: 2px;
}

.permissions-tags::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-hoverBackground);
}

.permission-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--vscode-editor-font-family);
}

.permission-tag.allow {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.permission-tag.deny {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Subfolder Section - Gestalt: Hierarchy */
.subfolder-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  margin-left: 20px;
}

.subfolder-section .subfolder-section {
  margin-left: 20px;
}

.subfolder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
}

.subfolder-chevron {
  font-size: 10px;
  transition: transform 0.2s;
  color: var(--vscode-descriptionForeground);
}

.subfolder-chevron.collapsed {
  transform: rotate(-90deg);
}

.subfolder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 20px;
  width: 20px;
  height: 20px;
  overflow: visible;
}

.subfolder-icon svg {
  width: 18px;
  height: 18px;
}

.subfolder-name {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  font-weight: 500;
}

.copy-prompt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}

.subfolder-header:hover .copy-prompt-btn {
  opacity: 0.6;
}

.copy-prompt-btn:hover {
  opacity: 1 !important;
  background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.1));
}

.copy-prompt-btn svg {
  width: 14px;
  height: 14px;
}

.subfolder-content.collapsed {
  display: none;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--vscode-descriptionForeground);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--vscode-foreground);
}

.empty-message {
  font-size: 12px;
}

/* Action Banner (clickable) */
.action-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-banner .banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.action-banner .banner-icon svg {
  width: 18px;
  height: 18px;
}

.action-banner .banner-text {
  flex: 1;
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
}

.action-banner .banner-action {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.action-banner:hover .banner-action {
  opacity: 1;
}

/* Add CLAUDE.md Banner */
.add-claude-md-banner {
  margin-bottom: 16px;
  background: rgba(249, 115, 22, 0.08);
  border: 1px dashed rgba(249, 115, 22, 0.3);
}

.add-claude-md-banner:hover {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.5);
}

.add-claude-md-banner .banner-action {
  color: #F97316;
}

/* Missing Folders Guide */
.missing-folders-guide {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--vscode-input-background);
  border-radius: 8px;
}

.missing-folders-guide .guide-label {
  display: block;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 8px;
}

.missing-folders-guide .guide-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Add Folder Banner */
.add-folder-banner {
  padding: 8px 12px;
  background: var(--vscode-editor-background);
  border: 1px dashed var(--vscode-widget-border, rgba(255,255,255,0.15));
  border-radius: 6px;
  flex: 0 0 auto;
}

.add-folder-banner:hover {
  background: var(--vscode-list-hoverBackground);
  border-color: var(--vscode-focusBorder);
}

.add-folder-banner .banner-icon svg {
  width: 16px;
  height: 16px;
}

.add-folder-banner .banner-text {
  font-size: 11px;
  font-family: var(--vscode-editor-font-family);
}

.add-folder-banner .banner-action {
  color: var(--vscode-textLink-foreground);
  font-size: 14px;
  font-weight: 600;
}

/* Tab Bar */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: var(--vscode-input-background);
  border-radius: 8px;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
  font-family: var(--vscode-font-family);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: var(--vscode-list-hoverBackground);
  color: var(--vscode-foreground);
}

.tab-btn.active {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.tab-btn svg {
  width: 14px;
  height: 14px;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Graph View Placeholder */
.graph-view-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.graph-placeholder {
  text-align: center;
  padding: 48px;
  background: var(--vscode-sideBar-background);
  border-radius: 12px;
  border: 1px dashed var(--vscode-widget-border, rgba(255,255,255,0.15));
}

.graph-placeholder-icon {
  color: var(--vscode-descriptionForeground);
  opacity: 0.5;
  margin-bottom: 16px;
}

.graph-placeholder-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--vscode-foreground);
}

.graph-placeholder-desc {
  font-size: 13px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 20px;
}

.graph-placeholder-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.graph-stat {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  background: var(--vscode-input-background);
  padding: 4px 10px;
  border-radius: 4px;
}
`;
