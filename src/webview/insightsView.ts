/**
 * Insights tab orchestrator - composes all insight sections into one tab view
 */

import { InsightsData } from '../insightsTypes';
import { renderActivitySection } from './insightsSections/activitySection';
import { renderTokenSection } from './insightsSections/tokenSection';
import { renderQualitySection } from './insightsSections/qualitySection';
import { renderToolUsageSection } from './insightsSections/toolUsageSection';
import { renderProjectFocusSection } from './insightsSections/projectFocusSection';

export function renderInsightsView(insights: InsightsData | null): string {
  if (!insights || (!insights.statsCache && insights.facets.length === 0)) {
    return renderEmptyState();
  }

  const sections: string[] = [];

  // 1. Activity Overview (heatmap + hour chart)
  if (insights.statsCache) {
    sections.push(renderActivitySection(insights));
  }

  // 2. Token Economy
  if (insights.statsCache && Object.keys(insights.statsCache.modelUsage).length > 0) {
    sections.push(renderTokenSection(insights));
  }

  // 3. Session Quality
  if (insights.facets.length > 0) {
    sections.push(renderQualitySection(insights));
  }

  // 4. Tool Usage
  if (insights.statsCache && insights.statsCache.dailyActivity.length > 0) {
    sections.push(renderToolUsageSection(insights));
  }

  // 5. Project Focus
  if (insights.projectFocus.length > 0) {
    sections.push(renderProjectFocusSection(insights));
  }

  return `<div class="insights-view">${sections.join('')}</div>`;
}

export function getInsightsViewScripts(): string {
  return '';
}

function renderEmptyState(): string {
  return `
  <div class="insights-empty">
    <div class="insights-empty-icon">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    </div>
    <div class="insights-empty-title">No Insights Data Yet</div>
    <div class="insights-empty-message">
      Claude Code usage statistics will appear here after your first sessions.
      Data is read from ~/.claude/stats-cache.json and related files.
    </div>
  </div>`;
}
