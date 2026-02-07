/**
 * Activity Heatmap section - GitHub-style activity overview
 * Feature 1: Heatmap + hour-of-day chart + KPI cards
 */

import { InsightsData } from '../../insightsTypes'
import { renderHeatmapSvg, HeatmapDay } from '../charts/heatmap'
import { renderVerticalBarChartSvg } from '../charts/barChart'

export function renderActivitySection(insights: InsightsData): string {
  const stats = insights.statsCache
  if (!stats) return ''

  const { dailyActivity, hourCounts, totalSessions, totalMessages, firstSessionDate } = stats

  // KPI cards
  const totalDays = dailyActivity.length
  const avgMsgPerDay = totalDays > 0 ? Math.round(totalMessages / totalDays) : 0
  const avgSessionsPerDay = totalDays > 0 ? Math.round(totalSessions / totalDays) : 0
  const totalToolCalls = dailyActivity.reduce((s, d) => s + d.toolCallCount, 0)
  const startDate = firstSessionDate ? new Date(firstSessionDate).toLocaleDateString() : 'N/A'

  const kpiCards = `
  <div class="insights-kpi-row">
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalSessions.toLocaleString()}</div>
      <div class="kpi-label">Total Sessions</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalMessages.toLocaleString()}</div>
      <div class="kpi-label">Total Messages</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalToolCalls.toLocaleString()}</div>
      <div class="kpi-label">Tool Calls</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalDays}</div>
      <div class="kpi-label">Active Days</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${avgMsgPerDay.toLocaleString()}</div>
      <div class="kpi-label">Avg Msgs/Day</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${avgSessionsPerDay}</div>
      <div class="kpi-label">Avg Sessions/Day</div>
    </div>
  </div>`

  // Activity heatmap
  const heatmapData: HeatmapDay[] = dailyActivity.map((d) => ({
    date: d.date,
    value: d.messageCount,
  }))

  const heatmap = `
  <div class="insights-chart-container">
    <div class="chart-subtitle">Message Activity</div>
    <div class="chart-scroll">${renderHeatmapSvg({ data: heatmapData })}</div>
  </div>`

  // Hour of day chart
  const hourData = []
  for (let h = 0; h < 24; h++) {
    const count = hourCounts[String(h)] || 0
    const label = `${h}`
    hourData.push({ label, value: count, color: getHourColor(h) })
  }

  const hourChart = `
  <div class="insights-chart-container">
    <div class="chart-subtitle">Activity by Hour (Sessions)</div>
    ${renderVerticalBarChartSvg({ data: hourData, width: 500 })}
  </div>`

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span>Activity Overview</span>
      <span class="insights-since">Since ${startDate}</span>
    </div>
    ${kpiCards}
    ${heatmap}
    ${hourChart}
  </div>`
}

function getHourColor(hour: number): string {
  // Night: dark blue, Morning: green, Afternoon: yellow, Evening: orange
  if (hour >= 0 && hour < 6) return '#4A5568'
  if (hour >= 6 && hour < 12) return '#26a641'
  if (hour >= 12 && hour < 18) return '#F6AD55'
  return '#FC8181'
}
