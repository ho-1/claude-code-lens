/**
 * Insights tab orchestrator - composes all insight sections into one tab view
 */

import { InsightsData } from '../insightsTypes'
import { renderActivitySection } from './insightsSections/activitySection'
import { renderTokenSection } from './insightsSections/tokenSection'
import { renderQualitySection } from './insightsSections/qualitySection'
import { renderToolUsageSection } from './insightsSections/toolUsageSection'
import { renderProjectFocusSection } from './insightsSections/projectFocusSection'

export function renderInsightsView(insights: InsightsData | null): string {
  if (
    !insights ||
    (!insights.statsCache && insights.facets.length === 0 && insights.projectFocus.length === 0)
  ) {
    return renderEmptyState()
  }

  const sections: string[] = []

  const hasStats = !!insights.statsCache

  // Stats banner at top
  if (hasStats) {
    sections.push(renderStatsBanner(insights.statsCache!.lastComputedDate))
  } else {
    sections.push(renderStatsBanner(null))
  }

  // 1. Activity Overview (heatmap + hour chart)
  if (hasStats) {
    sections.push(renderActivitySection(insights))
  }

  // 2. Token Economy
  if (hasStats && Object.keys(insights.statsCache!.modelUsage).length > 0) {
    sections.push(renderTokenSection(insights))
  }

  // 3. Session Quality (live — facets)
  if (insights.facets.length > 0) {
    sections.push(renderQualitySection(insights))
  }

  // 4. Tool Usage
  if (hasStats && insights.statsCache!.dailyActivity.length > 0) {
    sections.push(renderToolUsageSection(insights))
  }

  // 5. Project Focus (live — history.jsonl)
  if (insights.projectFocus.length > 0) {
    sections.push(renderProjectFocusSection(insights))
  }

  return `<div class="insights-view">${sections.join('')}</div>`
}

export function getInsightsViewScripts(): string {
  return ''
}

function renderStatsBanner(lastComputedDate: string | null): string {
  if (!lastComputedDate) {
    return `
    <div class="insights-stats-banner">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>Activity, Token, Tool Usage sections require <code>/stats</code> in Claude Code to generate data.</span>
    </div>`
  }

  return `
  <div class="insights-stats-banner">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
    <span>Activity · Token · Tool data last updated: <strong>${lastComputedDate}</strong> — Run <code>/stats</code> in Claude Code to refresh</span>
  </div>`
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
      Run <code>/stats</code> in Claude Code to generate activity data,
      or start using Claude Code to populate session and project insights.
    </div>
  </div>`
}
