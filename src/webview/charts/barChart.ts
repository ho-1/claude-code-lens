/**
 * SVG Bar Chart - horizontal and vertical bar charts
 */

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartConfig {
  data: BarChartItem[];
  width?: number;
  barHeight?: number;
  maxBars?: number;
  showValues?: boolean;
  defaultColor?: string;
}

export function renderBarChartSvg(config: BarChartConfig): string {
  const width = config.width || 400;
  const barHeight = config.barHeight || 24;
  const showValues = config.showValues !== false;
  const defaultColor = config.defaultColor || '#26a641';
  const gap = 6;
  const labelWidth = 80;
  const valueWidth = showValues ? 50 : 0;
  const barAreaWidth = width - labelWidth - valueWidth - 20;

  let data = config.data;
  if (config.maxBars && data.length > config.maxBars) {
    data = data.slice(0, config.maxBars);
  }

  if (data.length === 0) {
    return '<div class="chart-empty">No data</div>';
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalHeight = data.length * (barHeight + gap) + 10;

  const bars = data.map((item, i) => {
    const y = i * (barHeight + gap) + 5;
    const barWidth = Math.max((item.value / maxValue) * barAreaWidth, 2);
    const color = item.color || defaultColor;
    const truncLabel = item.label.length > 12 ? item.label.slice(0, 11) + '…' : item.label;

    return `
      <text x="${labelWidth - 8}" y="${y + barHeight / 2 + 4}" text-anchor="end" fill="var(--vscode-foreground)" font-size="11">${truncLabel}</text>
      <rect x="${labelWidth}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" opacity="0.85" data-tooltip="${item.label}: ${item.value.toLocaleString()}"/>
      ${showValues ? `<text x="${labelWidth + barWidth + 6}" y="${y + barHeight / 2 + 4}" fill="var(--vscode-descriptionForeground)" font-size="11">${formatNumber(item.value)}</text>` : ''}
    `;
  }).join('');

  return `<svg viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width:${width}px">
    ${bars}
  </svg>`;
}

export function renderVerticalBarChartSvg(config: BarChartConfig): string {
  const width = config.width || 500;
  const maxHeight = 150;
  const defaultColor = config.defaultColor || '#26a641';
  const gap = 2;

  let data = config.data;
  if (config.maxBars && data.length > config.maxBars) {
    data = data.slice(0, config.maxBars);
  }

  if (data.length === 0) {
    return '<div class="chart-empty">No data</div>';
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(Math.floor((width - 40) / data.length) - gap, 4);
  const totalHeight = maxHeight + 30;

  const bars = data.map((item, i) => {
    const x = 20 + i * (barWidth + gap);
    const barH = Math.max((item.value / maxValue) * maxHeight, 1);
    const y = maxHeight - barH;
    const color = item.color || defaultColor;

    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="2" fill="${color}" opacity="0.85" data-tooltip="${item.label}: ${item.value.toLocaleString()}"/>
      ${i % Math.ceil(data.length / 6) === 0 ? `<text x="${x + barWidth / 2}" y="${maxHeight + 14}" text-anchor="middle" fill="var(--vscode-descriptionForeground)" font-size="9">${item.label}</text>` : ''}
    `;
  }).join('');

  return `<svg viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width:${width}px">
    ${bars}
  </svg>`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
