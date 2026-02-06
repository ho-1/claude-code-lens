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

/* Stats Bar Container */
.stats-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

/* Stats Bar */
.stats-bar {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--vscode-input-background);
  border-radius: 8px;
}

/* Settings Button */
.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--vscode-descriptionForeground);
}

.settings-btn:hover {
  background: var(--vscode-list-hoverBackground);
  color: var(--vscode-foreground);
}

.settings-btn svg {
  width: 16px;
  height: 16px;
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

/* Project Card */
.project-card {
  margin-bottom: 24px;
  background: var(--vscode-sideBar-background);
  border-radius: 12px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--vscode-titleBar-activeBackground, var(--vscode-sideBar-background));
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  cursor: pointer;
}

.project-chevron {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  transition: transform 0.2s;
}

.project-chevron:not(.collapsed) {
  transform: rotate(90deg);
}

.project-chevron.collapsed {
  transform: rotate(0deg);
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-icon svg {
  width: 18px;
  height: 18px;
}

.project-title {
  font-weight: 500;
  font-size: 13px;
}

.project-content {
  padding: 16px 18px;
}

.project-content.collapsed {
  display: none;
}

/* Root Files (CLAUDE.md, settings.json, etc.) */
.root-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.root-file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--vscode-editor-background);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.root-file-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.root-file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.root-file-icon svg {
  width: 16px;
  height: 16px;
}

.root-file-name {
  font-size: 12px;
  font-weight: 500;
}

/* Category Section */
.category-section {
  margin-bottom: 16px;
  border-left: 3px solid var(--accent-color);
  padding-left: 12px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 0;
  cursor: pointer;
}

.category-chevron {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  transition: transform 0.2s;
}

.category-chevron:not(.collapsed) {
  transform: rotate(90deg);
}

.category-chevron.collapsed {
  transform: rotate(0deg);
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-count {
  font-size: 10px;
  background: var(--vscode-badge-background, rgba(255,255,255,0.15));
  color: var(--vscode-badge-foreground, rgba(255,255,255,0.7));
  padding: 1px 6px;
  border-radius: 10px;
}

/* Category Items */
.category-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-items.collapsed {
  display: none;
}

.category-item {
  padding: 8px 12px;
  background: var(--vscode-editor-background);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.category-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.category-item.expandable {
  cursor: default;
}

.item-main {
  cursor: pointer;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-chevron {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  transition: transform 0.2s;
}

.item-chevron.collapsed {
  transform: rotate(0deg);
}

.item-chevron:not(.collapsed) {
  transform: rotate(90deg);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon svg {
  width: 16px;
  height: 16px;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
}

.item-badge {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
}

/* Item Actions Container */
.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;
}

.category-item:hover .item-actions {
  opacity: 1;
}

/* Action Button */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--vscode-descriptionForeground);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
  color: var(--vscode-foreground);
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

/* Copy success feedback */
.action-btn.copied {
  color: var(--vscode-charts-green, #4ade80);
}

.item-description {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-top: 4px;
  margin-left: 24px;
  line-height: 1.4;
}

/* Expanded Content */
.item-expanded {
  margin-top: 8px;
  margin-left: 24px;
  padding-left: 12px;
  border-left: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
}

.item-expanded.collapsed {
  display: none;
}

.subfile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.subfile:hover {
  background: var(--vscode-list-hoverBackground);
}

.subfile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.subfile-icon svg {
  width: 14px;
  height: 14px;
}

.subfile-name {
  font-size: 11px;
  color: var(--vscode-foreground);
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

/* Tab Badge */
.tab-badge {
  font-size: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ============ Team View Styles ============ */

.team-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Settings Banner */
.settings-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--vscode-sideBar-background);
  border-radius: 8px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
}

.settings-banner-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-status-icon {
  display: flex;
  align-items: center;
}

.settings-status-text {
  font-size: 12px;
  font-weight: 600;
}

.settings-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vscode-input-background);
  color: var(--vscode-descriptionForeground);
}

.settings-badge-warn {
  background: #EF444420;
  color: #EF4444;
}

.settings-doc-link {
  font-size: 11px;
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--vscode-input-background);
  transition: all 0.15s;
}

.settings-doc-link:hover {
  background: var(--vscode-list-hoverBackground);
  text-decoration: underline;
}

/* Team Section */
.team-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.team-section-icon {
  display: flex;
  align-items: center;
}

.team-section-icon svg {
  width: 18px;
  height: 18px;
}

.team-section-title {
  font-size: 14px;
  font-weight: 600;
}

.team-section-count {
  font-size: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  padding: 1px 6px;
  border-radius: 10px;
}

/* Team Cards */
.team-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.team-card {
  background: var(--vscode-sideBar-background);
  border-radius: 10px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

.team-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.team-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
}

.team-card-title svg {
  width: 16px;
  height: 16px;
}

.team-card-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
}

.team-card-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
}

.team-member:hover {
  background: var(--vscode-list-hoverBackground);
}

.team-lead {
  background: rgba(245, 158, 11, 0.08);
}

.member-name {
  font-size: 12px;
  font-weight: 500;
}

.member-role {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  margin-left: auto;
}

.member-role.role-lead {
  color: #F59E0B;
  font-weight: 600;
}

.team-card-footer {
  padding: 8px 16px;
  font-size: 11px;
  color: var(--vscode-textLink-foreground);
  cursor: pointer;
  border-top: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  transition: background 0.15s;
}

.team-card-footer:hover {
  background: var(--vscode-list-hoverBackground);
}

/* Task Board */
.task-progress-bar {
  position: relative;
  height: 24px;
  background: var(--vscode-input-background);
  border-radius: 12px;
  overflow: hidden;
}

.task-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #10B981, #14B8A6);
  border-radius: 12px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.task-progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--vscode-foreground);
  text-shadow: 0 0 4px var(--vscode-editor-background);
}

.task-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  min-height: 200px;
}

.task-column {
  display: flex;
  flex-direction: column;
  background: var(--vscode-sideBar-background);
  border-radius: 10px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

.task-column-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 2px solid;
}

.task-column-icon {
  display: flex;
  align-items: center;
}

.task-column-title {
  font-size: 12px;
  font-weight: 600;
}

.task-column-count {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: auto;
}

.task-column-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.task-card {
  padding: 10px 12px;
  background: var(--vscode-editor-background);
  border-radius: 6px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  cursor: pointer;
  transition: all 0.15s;
}

.task-card:hover {
  background: var(--vscode-list-hoverBackground);
  border-color: var(--vscode-focusBorder);
}

.task-card.task-blocked {
  opacity: 0.7;
  border-left: 3px solid #EF4444;
}

.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.task-card-id {
  font-size: 10px;
  font-weight: 600;
}

.task-card-owner {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  background: var(--vscode-input-background);
  padding: 1px 6px;
  border-radius: 3px;
}

.task-card-subject {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
}

.task-card-desc {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.3;
  margin-bottom: 6px;
}

.task-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.task-card-team {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
}

.task-dep {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
}

.task-dep-blocked {
  background: #EF444420;
  color: #EF4444;
}

.task-dep-blocks {
  background: #F59E0B20;
  color: #F59E0B;
}

.task-empty {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  text-align: center;
  padding: 24px 12px;
  font-style: italic;
}

/* Team Empty State */
.team-empty-state {
  text-align: center;
  padding: 48px 32px;
}

.team-empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.team-empty-icon svg {
  width: 48px;
  height: 48px;
}

.team-empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.team-empty-desc {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 12px;
  line-height: 1.5;
}

.team-empty-desc code {
  background: var(--vscode-input-background);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.team-empty-hint {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  opacity: 0.7;
}

.team-empty-hint code {
  background: var(--vscode-input-background);
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
}

`;

