/**
 * Session Quality Insights section
 * Feature 3: Outcome distribution, friction analysis, session types
 */

import { InsightsData, FacetData } from '../../insightsTypes';
import { renderDonutChartSvg } from '../charts/donutChart';
import { renderBarChartSvg } from '../charts/barChart';

const OUTCOME_COLORS: Record<string, string> = {
  'fully_achieved': '#10B981',
  'mostly_achieved': '#3B82F6',
  'partially_achieved': '#F59E0B',
  'not_achieved': '#EF4444',
  'unknown': '#6B7280',
};

const OUTCOME_LABELS: Record<string, string> = {
  'fully_achieved': 'Fully Achieved',
  'mostly_achieved': 'Mostly Achieved',
  'partially_achieved': 'Partially Achieved',
  'not_achieved': 'Not Achieved',
  'unknown': 'Unknown',
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  'single_task': '#3B82F6',
  'multi_task': '#8B5CF6',
  'iterative_refinement': '#F59E0B',
  'unknown': '#6B7280',
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  'single_task': 'Single Task',
  'multi_task': 'Multi Task',
  'iterative_refinement': 'Iterative',
  'unknown': 'Unknown',
};

const FRICTION_COLORS: Record<string, string> = {
  'wrong_approach': '#EF4444',
  'misunderstood_request': '#F59E0B',
  'buggy_code': '#F97316',
  'incomplete_output': '#8B5CF6',
  'slow_response': '#6B7280',
};

export function renderQualitySection(insights: InsightsData): string {
  const { facets } = insights;
  if (facets.length === 0) return '';

  // Outcome distribution
  const outcomeCounts = new Map<string, number>();
  for (const f of facets) {
    const outcome = f.outcome || 'unknown';
    outcomeCounts.set(outcome, (outcomeCounts.get(outcome) || 0) + 1);
  }

  const outcomeSegments = Array.from(outcomeCounts.entries()).map(([key, count]) => ({
    label: OUTCOME_LABELS[key] || key,
    value: count,
    color: OUTCOME_COLORS[key] || '#6B7280',
  }));

  const successRate = Math.round(
    ((outcomeCounts.get('fully_achieved') || 0) + (outcomeCounts.get('mostly_achieved') || 0)) / facets.length * 100
  );

  const outcomeDonut = renderDonutChartSvg({
    segments: outcomeSegments,
    size: 180,
    centerValue: `${successRate}%`,
    centerLabel: 'Success Rate',
  });

  // Session type distribution
  const typeCounts = new Map<string, number>();
  for (const f of facets) {
    const st = f.session_type || 'unknown';
    typeCounts.set(st, (typeCounts.get(st) || 0) + 1);
  }

  const typeSegments = Array.from(typeCounts.entries()).map(([key, count]) => ({
    label: SESSION_TYPE_LABELS[key] || key,
    value: count,
    color: SESSION_TYPE_COLORS[key] || '#6B7280',
  }));

  const typeDonut = renderDonutChartSvg({
    segments: typeSegments,
    size: 180,
    centerValue: `${facets.length}`,
    centerLabel: 'Sessions',
  });

  // Friction analysis
  const frictionCounts = new Map<string, number>();
  for (const f of facets) {
    for (const [type, count] of Object.entries(f.friction_counts)) {
      frictionCounts.set(type, (frictionCounts.get(type) || 0) + count);
    }
  }

  const frictionData = Array.from(frictionCounts.entries())
    .map(([type, count]) => ({
      label: formatFrictionType(type),
      value: count,
      color: FRICTION_COLORS[type] || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

  const totalFriction = frictionData.reduce((s, d) => s + d.value, 0);
  const avgFriction = facets.length > 0 ? (totalFriction / facets.length).toFixed(1) : '0';

  const frictionChart = frictionData.length > 0
    ? renderBarChartSvg({ data: frictionData, width: 400, maxBars: 8 })
    : '<div class="chart-empty">No friction recorded</div>';

  // KPI cards
  const kpiCards = `
  <div class="insights-kpi-row">
    <div class="insights-kpi-card">
      <div class="kpi-value">${facets.length}</div>
      <div class="kpi-label">Analyzed Sessions</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value" style="color: ${successRate >= 70 ? '#10B981' : '#F59E0B'}">${successRate}%</div>
      <div class="kpi-label">Success Rate</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${totalFriction}</div>
      <div class="kpi-label">Total Friction</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${avgFriction}</div>
      <div class="kpi-label">Avg Friction/Session</div>
    </div>
  </div>`;

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>Session Quality</span>
    </div>
    ${kpiCards}
    <div class="insights-chart-row">
      <div class="insights-chart-container">
        <div class="chart-subtitle">Outcome Distribution</div>
        ${outcomeDonut}
      </div>
      <div class="insights-chart-container">
        <div class="chart-subtitle">Session Types</div>
        ${typeDonut}
      </div>
    </div>
    <div class="insights-chart-container">
      <div class="chart-subtitle">Friction Analysis</div>
      ${frictionChart}
    </div>
  </div>`;
}

function formatFrictionType(type: string): string {
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
