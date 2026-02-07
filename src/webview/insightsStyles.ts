/**
 * CSS styles for the Insights analytics tab
 */

export const INSIGHTS_STYLES = `
/* ===== Insights Tab Layout ===== */

.insights-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 32px;
}

.insights-section-block {
  background: var(--vscode-sideBar-background);
  border-radius: 12px;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  padding: 20px;
}

.insights-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--vscode-foreground);
}

.insights-section-header svg {
  opacity: 0.7;
}

.insights-since {
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: var(--vscode-descriptionForeground);
}

/* ===== KPI Cards ===== */

.insights-kpi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.insights-kpi-card {
  flex: 1 1 100px;
  min-width: 100px;
  background: var(--vscode-editor-background);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.06));
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--vscode-foreground);
  line-height: 1.2;
}

.kpi-label {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-sparkline {
  margin-top: 6px;
  display: flex;
  justify-content: center;
}

/* ===== Chart Tooltip ===== */

#chart-tooltip {
  display: none;
  position: absolute;
  z-index: 100;
  background: var(--vscode-editorHoverWidget-background, #1e1e1e);
  color: var(--vscode-editorHoverWidget-foreground, #ccc);
  border: 1px solid var(--vscode-editorHoverWidget-border, rgba(255,255,255,0.15));
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* ===== Chart Containers ===== */

.insights-chart-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.insights-chart-row > .insights-chart-container {
  flex: 1 1 200px;
  min-width: 200px;
}

.insights-chart-container {
  margin-bottom: 12px;
}

.chart-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: var(--vscode-descriptionForeground);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}

.chart-empty {
  text-align: center;
  padding: 24px;
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
}

/* ===== Insights Table ===== */

.insights-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.insights-table th {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  color: var(--vscode-descriptionForeground);
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.insights-table td {
  padding: 6px 12px;
  border-bottom: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.04));
  color: var(--vscode-foreground);
}

.project-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.mini-bar-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-bar {
  height: 6px;
  border-radius: 3px;
  min-width: 2px;
}

.mini-bar-container span {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  min-width: 30px;
}

/* ===== Session Explorer ===== */

.session-project-group {
  margin-bottom: 12px;
}

.session-project-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.session-project-header:hover {
  background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.05));
}

.session-chevron {
  transition: transform 0.2s;
  opacity: 0.5;
}

.session-chevron.rotated {
  transform: rotate(90deg);
}

.session-project-name {
  font-weight: 600;
  font-size: 13px;
}

.session-project-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.session-project-body {
  padding-left: 24px;
}

.session-project-body.collapsed {
  display: none;
}

.session-item {
  padding: 8px 12px;
  border-left: 2px solid var(--vscode-widget-border, rgba(255,255,255,0.08));
  margin-bottom: 4px;
}

.session-item:hover {
  border-left-color: var(--vscode-focusBorder);
  background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.03));
}

.session-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.session-summary {
  font-size: 12px;
  color: var(--vscode-foreground);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  white-space: nowrap;
}

.session-item-footer {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.session-date {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
}

.session-branch {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  background: var(--vscode-badge-background, rgba(255,255,255,0.1));
  padding: 0 4px;
  border-radius: 3px;
}

.session-more-btn {
  background: none;
  border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
  color: var(--vscode-textLink-foreground);
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 4px;
}

.session-more-btn:hover {
  background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.05));
}

/* ===== Empty State ===== */

.insights-empty {
  text-align: center;
  padding: 64px 32px;
}

.insights-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.insights-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vscode-foreground);
  margin-bottom: 8px;
}

.insights-empty-message {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.5;
}
`;
