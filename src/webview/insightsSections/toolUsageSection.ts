/**
 * Tool Usage Analytics section
 * Feature 4: Tool call trends + KPI cards
 */

import { InsightsData } from '../../insightsTypes'
import { renderLineChartSvg } from '../charts/lineChart'
import { renderSparklineSvg } from '../charts/sparkline'

export function renderToolUsageSection(insights: InsightsData): string {
  const stats = insights.statsCache
  if (!stats) return ''

  const { dailyActivity } = stats
  if (dailyActivity.length === 0) return ''

  const totalToolCalls = dailyActivity.reduce((s, d) => s + d.toolCallCount, 0)
  const totalMessages = dailyActivity.reduce((s, d) => s + d.messageCount, 0)
  const totalSessions = dailyActivity.reduce((s, d) => s + d.sessionCount, 0)
  const avgToolsPerSession = totalSessions > 0 ? (totalToolCalls / totalSessions).toFixed(1) : '0'
  const avgToolsPerDay =
    dailyActivity.length > 0 ? Math.round(totalToolCalls / dailyActivity.length) : 0
  const toolToMsgRatio = totalMessages > 0 ? (totalToolCalls / totalMessages).toFixed(2) : '0'

  // Peak day
  const peakDay = dailyActivity.reduce(
    (max, d) => (d.toolCallCount > max.toolCallCount ? d : max),
    dailyActivity[0],
  )

  // KPI cards with sparklines
  const toolCallValues = dailyActivity.map((d) => d.toolCallCount)
  const sessionValues = dailyActivity.map((d) => d.sessionCount)

  const kpiCards = `
  <div class="insights-kpi-row">
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalToolCalls.toLocaleString()}</div>
      <div class="kpi-label">Total Tool Calls</div>
      <div class="kpi-sparkline">${renderSparklineSvg({ data: toolCallValues, color: '#3B82F6' })}</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${avgToolsPerSession}</div>
      <div class="kpi-label">Avg Tools/Session</div>
      <div class="kpi-sparkline">${renderSparklineSvg({ data: sessionValues, color: '#10B981' })}</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${avgToolsPerDay.toLocaleString()}</div>
      <div class="kpi-label">Avg Tools/Day</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${toolToMsgRatio}</div>
      <div class="kpi-label">Tools/Message Ratio</div>
    </div>
  </div>`

  // Tool calls trend line chart
  const lineChart = renderLineChartSvg({
    series: [
      {
        label: 'Tool Calls',
        data: dailyActivity.map((d) => ({ x: d.date, y: d.toolCallCount })),
        color: '#3B82F6',
        fill: true,
      },
      {
        label: 'Sessions',
        data: dailyActivity.map((d) => ({ x: d.date, y: d.sessionCount * 10 })),
        color: '#10B981',
        fill: false,
      },
    ],
    width: 500,
    height: 200,
    showLegend: true,
  })

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
      <span>Tool Usage</span>
      <span class="insights-since">Peak: ${peakDay.date} (${peakDay.toolCallCount.toLocaleString()} calls)</span>
    </div>
    ${kpiCards}
    <div class="insights-chart-container">
      <div class="chart-subtitle">Daily Tool Calls & Sessions (×10)</div>
      ${lineChart}
    </div>
  </div>`
}
