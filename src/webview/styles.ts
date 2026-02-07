/**
 * CSS styles for the dashboard webview
 */

import { INSIGHTS_STYLES } from './insightsStyles'

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

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-top .settings-btn {
  background: none;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: var(--vscode-descriptionForeground);
  display: flex;
  align-items: center;
  transition: color 0.15s, border-color 0.15s;
}

.header-top .settings-btn:hover {
  color: var(--vscode-foreground);
  border-color: var(--vscode-focusBorder);
}

.header-top .settings-btn svg {
  width: 16px;
  height: 16px;
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

/* Project Section */
.project-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.project-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
  min-width: 0;
}

.project-section-icon {
  display: flex;
  align-items: center;
}

.project-section-icon svg {
  width: 18px;
  height: 18px;
}

.project-section-title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.project-section-count {
  font-size: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  padding: 1px 6px;
  border-radius: 10px;
}

/* Project Cards Grid */
.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.project-card {
  background: var(--vscode-sideBar-background);
  border-radius: 10px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.project-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
}

.project-card-title svg {
  width: 16px;
  height: 16px;
}

.project-card-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
}

.project-card-body {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Config Card (compact) */
.config-card-body {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.config-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--vscode-editor-background);
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.15s;
}

.config-pill:hover {
  background: var(--vscode-list-hoverBackground);
}

.config-pill .config-item-icon svg {
  width: 14px;
  height: 14px;
}

.config-pill .config-item-name {
  font-size: 11px;
}

/* Config Item */
.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.config-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.config-item-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.config-item-icon svg {
  width: 16px;
  height: 16px;
}

.config-item-content {
  flex: 1;
  min-width: 0;
}

.config-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-item-name {
  font-size: 12px;
  font-weight: 500;
}

.config-item-badge {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
}

.config-item-desc {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-top: 2px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Config Item Actions */
.config-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;
}

.config-item:hover .config-item-actions {
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

/* Expandable item chevron */
.config-item-chevron {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.config-item-chevron:not(.collapsed) {
  transform: rotate(90deg);
}

.config-item.expandable {
  cursor: pointer;
}

/* Subitems container */
.config-subitems {
  padding-left: 12px;
  border-left: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  margin-left: 20px;
}

.config-subitems.collapsed {
  display: none;
}

/* Config Subitem (folder children) */
.config-subitem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  margin-left: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.config-subitem:hover {
  background: var(--vscode-list-hoverBackground);
}

.config-subitem .config-item-icon svg {
  width: 14px;
  height: 14px;
}

.config-subitem .config-item-name {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

/* Empty card body */
.card-empty {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  text-align: center;
  padding: 16px 8px;
  font-style: italic;
  opacity: 0.7;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--vscode-descriptionForeground);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
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

/* Task Scope Toggle */
.task-scope-toggle {
  display: flex;
  margin-left: auto;
  background: var(--vscode-input-background);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.task-scope-btn {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--vscode-descriptionForeground);
  background: transparent;
  transition: all 0.15s;
}

.task-scope-btn:hover {
  color: var(--vscode-foreground);
}

.task-scope-btn.active {
  background: var(--vscode-button-secondaryBackground, rgba(255,255,255,0.1));
  color: var(--vscode-foreground);
  font-weight: 600;
}

/* Task Board */
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

${INSIGHTS_STYLES}
`
