/**
 * Token Economy Dashboard section
 * Feature 5: Model distribution + daily token chart + cache efficiency
 */

import { InsightsData } from '../../insightsTypes';
import { renderDonutChartSvg } from '../charts/donutChart';
import { renderLineChartSvg } from '../charts/lineChart';

const MODEL_COLORS: Record<string, string> = {
  'opus': '#8B5CF6',
  'sonnet': '#3B82F6',
  'haiku': '#10B981',
  'default': '#6B7280',
};

function getModelColor(modelId: string): string {
  if (modelId.includes('opus')) return MODEL_COLORS.opus;
  if (modelId.includes('sonnet')) return MODEL_COLORS.sonnet;
  if (modelId.includes('haiku')) return MODEL_COLORS.haiku;
  return MODEL_COLORS.default;
}

function shortModelName(modelId: string): string {
  if (modelId.includes('opus-4-6')) return 'Opus 4.6';
  if (modelId.includes('opus-4-5')) return 'Opus 4.5';
  if (modelId.includes('sonnet-4-5')) return 'Sonnet 4.5';
  if (modelId.includes('haiku-4-5')) return 'Haiku 4.5';
  if (modelId.includes('opus')) return 'Opus';
  if (modelId.includes('sonnet')) return 'Sonnet';
  if (modelId.includes('haiku')) return 'Haiku';
  return modelId.split('-').slice(1, 3).join(' ');
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

export function renderTokenSection(insights: InsightsData): string {
  const stats = insights.statsCache;
  if (!stats) return '';

  const { modelUsage, dailyModelTokens } = stats;
  const models = Object.keys(modelUsage);

  if (models.length === 0) return '';

  // Calculate totals
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheCreation = 0;

  for (const model of models) {
    const usage = modelUsage[model];
    totalInput += usage.inputTokens;
    totalOutput += usage.outputTokens;
    totalCacheRead += usage.cacheReadInputTokens;
    totalCacheCreation += usage.cacheCreationInputTokens;
  }

  const totalAll = totalInput + totalOutput + totalCacheRead + totalCacheCreation;
  const cacheHitRatio = totalAll > 0 ? Math.round((totalCacheRead / totalAll) * 100) : 0;

  // KPI cards
  const kpiCards = `
  <div class="insights-kpi-row">
    <div class="insights-kpi-card">
      <div class="kpi-value">${formatTokens(totalInput + totalOutput)}</div>
      <div class="kpi-label">Direct Tokens</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${formatTokens(totalCacheRead)}</div>
      <div class="kpi-label">Cache Read</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${cacheHitRatio}%</div>
      <div class="kpi-label">Cache Hit Ratio</div>
    </div>
    <div class="insights-kpi-card">
      <div class="kpi-value">${models.length}</div>
      <div class="kpi-label">Models Used</div>
    </div>
  </div>`;

  // Model usage donut
  const modelSegments = models.map(m => ({
    label: shortModelName(m),
    value: modelUsage[m].inputTokens + modelUsage[m].outputTokens,
    color: getModelColor(m),
  })).filter(s => s.value > 0);

  const modelDonut = renderDonutChartSvg({
    segments: modelSegments,
    size: 180,
    centerValue: formatTokens(totalInput + totalOutput),
    centerLabel: 'Direct Tokens',
  });

  // Cache donut
  const cacheDonut = renderDonutChartSvg({
    segments: [
      { label: 'Cache Read', value: totalCacheRead, color: '#10B981' },
      { label: 'Cache Creation', value: totalCacheCreation, color: '#F59E0B' },
      { label: 'Direct Input', value: totalInput, color: '#3B82F6' },
      { label: 'Output', value: totalOutput, color: '#8B5CF6' },
    ],
    size: 180,
    centerValue: `${cacheHitRatio}%`,
    centerLabel: 'Cache Hit',
  });

  // Daily token line chart
  const seriesMap = new Map<string, { x: string; y: number }[]>();
  for (const day of dailyModelTokens) {
    for (const [model, tokens] of Object.entries(day.tokensByModel)) {
      const name = shortModelName(model);
      if (!seriesMap.has(name)) seriesMap.set(name, []);
      seriesMap.get(name)!.push({ x: day.date, y: tokens });
    }
  }

  const lineSeries = Array.from(seriesMap.entries()).map(([label, data]) => ({
    label,
    data,
    color: getModelColor(
      models.find(m => shortModelName(m) === label) || ''
    ),
    fill: true,
  }));

  const lineChart = renderLineChartSvg({
    series: lineSeries,
    width: 500,
    height: 200,
    showLegend: true,
  });

  return `
  <div class="insights-section-block">
    <div class="insights-section-header">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>Token Economy</span>
    </div>
    ${kpiCards}
    <div class="insights-chart-row">
      <div class="insights-chart-container">
        <div class="chart-subtitle">Model Distribution (Direct Tokens)</div>
        ${modelDonut}
      </div>
      <div class="insights-chart-container">
        <div class="chart-subtitle">Cache Efficiency</div>
        ${cacheDonut}
      </div>
    </div>
    <div class="insights-chart-container">
      <div class="chart-subtitle">Daily Token Usage by Model</div>
      ${lineChart}
    </div>
  </div>`;
}
