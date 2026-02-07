/**
 * Project Focus Tracker section
 * Feature 6: Project time distribution + session comparison
 */

import { InsightsData } from '../../insightsTypes'
import { renderDonutChartSvg } from '../charts/donutChart'
import { renderBarChartSvg } from '../charts/barChart'

const PROJECT_COLORS = [
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#84CC16',
]

export function renderProjectFocusSection(insights: InsightsData): string {
  const { projectFocus } = insights
  if (projectFocus.length === 0) return ''

  const totalMessages = projectFocus.reduce((s, p) => s + p.messageCount, 0)
  const totalSessions = projectFocus.reduce((s, p) => s + p.sessionCount, 0)

  // Top projects (limit to 10)
  const topProjects = projectFocus.slice(0, 10)

  // Donut chart - message distribution
  const donutSegments = topProjects.map((p, i) => ({
    label: p.displayName,
    value: p.messageCount,
    color: PROJECT_COLORS[i % PROJECT_COLORS.length],
  }))

  const donut = renderDonutChartSvg({
    segments: donutSegments,
    size: 200,
    centerValue: `${topProjects.length}`,
    centerLabel: 'Projects',
  })

  // Bar chart - session count
  const barData = topProjects.map((p, i) => ({
    label: p.displayName,
    value: p.sessionCount,
    color: PROJECT_COLORS[i % PROJECT_COLORS.length],
  }))

  const barChart = renderBarChartSvg({
    data: barData,
    width: 400,
    maxBars: 10,
  })

  // Project table
  const tableRows = topProjects
    .map((p, i) => {
      const pct = totalMessages > 0 ? Math.round((p.messageCount / totalMessages) * 100) : 0
      const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
      return `
    <tr>
      <td><span class="project-dot" style="background:${color}"></span>${escapeHtml(p.displayName)}</td>
      <td>${p.sessionCount}</td>
      <td>${p.messageCount.toLocaleString()}</td>
      <td>
        <div class="mini-bar-container">
          <div class="mini-bar" style="width:${pct}%;background:${color}"></div>
          <span>${pct}%</span>
        </div>
      </td>
    </tr>`
    })
    .join('')

  const kpiCards = `
  <div class="insights-kpi-row">
    <div class="insights-kpi-card">
      <div class="kpi-value">${projectFocus.length}</div>
      <div class="kpi-label">Projects</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalSessions.toLocaleString()}</div>
      <div class="kpi-label">Total Sessions</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalMessages.toLocaleString()}</div>
      <div class="kpi-label">Total Messages</div>
    </div>
  </div>`

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <span>Project Focus</span>
    </div>
    ${kpiCards}
    <div class="insights-chart-row">
      <div class="insights-chart-container">
        <div class="chart-subtitle">Message Distribution</div>
        ${donut}
      </div>
      <div class="insights-chart-container">
        <div class="chart-subtitle">Sessions by Project</div>
        ${barChart}
      </div>
    </div>
    <div class="insights-chart-container">
      <div class="chart-subtitle">Project Details</div>
      <table class="insights-table">
        <thead>
          <tr><th>Project</th><th>Sessions</th><th>Messages</th><th>Share</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
