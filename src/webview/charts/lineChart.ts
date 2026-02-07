/**
 * SVG Line Chart - multi-series line/area chart
 */

export interface LineChartSeries {
  label: string;
  data: { x: string; y: number }[];
  color: string;
  fill?: boolean;
}

export interface LineChartConfig {
  series: LineChartSeries[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yAxisLabel?: string;
}

export function renderLineChartSvg(config: LineChartConfig): string {
  const width = config.width || 500;
  const height = config.height || 200;
  const showGrid = config.showGrid !== false;
  const showLegend = config.showLegend !== false;
  const padding = { top: 20, right: 20, bottom: 35, left: 50 };

  if (config.series.length === 0 || config.series.every(s => s.data.length === 0)) {
    return '<div class="chart-empty">No data</div>';
  }

  // Collect all dates and find y range
  const allDates = new Set<string>();
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const s of config.series) {
    for (const d of s.data) {
      allDates.add(d.x);
      if (d.y < yMin) yMin = d.y;
      if (d.y > yMax) yMax = d.y;
    }
  }

  const sortedDates = Array.from(allDates).sort();
  if (yMin === yMax) { yMax = yMin + 1; }
  const yRange = yMax - yMin;
  const yPad = yRange * 0.1;
  yMin = Math.max(0, yMin - yPad);
  yMax = yMax + yPad;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  function xScale(dateStr: string): number {
    const idx = sortedDates.indexOf(dateStr);
    return padding.left + (idx / Math.max(sortedDates.length - 1, 1)) * chartWidth;
  }

  function yScale(val: number): number {
    return padding.top + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
  }

  // Grid lines
  let gridLines = '';
  if (showGrid) {
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padding.top + (i / yTicks) * chartHeight;
      const val = yMax - (i / yTicks) * (yMax - yMin);
      gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--vscode-widget-border, rgba(255,255,255,0.08))" stroke-dasharray="4"/>`;
      gridLines += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="var(--vscode-descriptionForeground)" font-size="9">${formatCompact(val)}</text>`;
    }
  }

  // X axis labels
  const xLabelCount = Math.min(sortedDates.length, 6);
  const xLabels = [];
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.floor((i / Math.max(xLabelCount - 1, 1)) * (sortedDates.length - 1));
    const date = sortedDates[idx];
    const x = xScale(date);
    const shortDate = date.slice(5); // MM-DD
    xLabels.push(`<text x="${x}" y="${height - 5}" text-anchor="middle" fill="var(--vscode-descriptionForeground)" font-size="9">${shortDate}</text>`);
  }

  // Series paths
  const seriesPaths = config.series.map(s => {
    const dateMap = new Map(s.data.map(d => [d.x, d.y]));
    const points = sortedDates
      .filter(d => dateMap.has(d))
      .map(d => `${xScale(d)},${yScale(dateMap.get(d)!)}`);

    if (points.length === 0) return '';

    const linePath = `M${points.join('L')}`;

    let areaPath = '';
    if (s.fill) {
      const firstX = xScale(sortedDates.filter(d => dateMap.has(d))[0]);
      const lastX = xScale(sortedDates.filter(d => dateMap.has(d)).slice(-1)[0]);
      const baseY = yScale(yMin);
      areaPath = `<path d="${linePath}L${lastX},${baseY}L${firstX},${baseY}Z" fill="${s.color}" opacity="0.15"/>`;
    }

    // Data point dots
    const dots = sortedDates
      .filter(d => dateMap.has(d))
      .map(d => {
        const x = xScale(d);
        const y = yScale(dateMap.get(d)!);
        return `<circle cx="${x}" cy="${y}" r="2.5" fill="${s.color}" data-tooltip="${d}: ${dateMap.get(d)!.toLocaleString()}"/>`;
      }).join('');

    return `${areaPath}<path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="2"/>${dots}`;
  }).join('');

  // Legend
  let legend = '';
  if (showLegend && config.series.length > 1) {
    const legendItems = config.series.map((s, i) => {
      const x = padding.left + i * 120;
      return `<circle cx="${x}" cy="${height + 15}" r="4" fill="${s.color}"/>` +
        `<text x="${x + 8}" y="${height + 19}" fill="var(--vscode-foreground)" font-size="10">${s.label}</text>`;
    }).join('');
    legend = legendItems;
  }

  const totalHeight = height + (showLegend && config.series.length > 1 ? 30 : 0);

  return `<svg viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width:${width}px">
    ${gridLines}
    ${xLabels.join('')}
    ${seriesPaths}
    ${legend}
  </svg>`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return Math.round(n).toString();
}
