/**
 * SVG Heatmap chart - GitHub contribution-style activity grid
 */

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface HeatmapConfig {
  data: HeatmapDay[];
  cellSize?: number;
  cellGap?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  'rgba(255,255,255,0.06)', // level 0: no activity
  '#0e4429',               // level 1
  '#006d32',               // level 2
  '#26a641',               // level 3
  '#39d353',               // level 4
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function renderHeatmapSvg(config: HeatmapConfig): string {
  const cellSize = config.cellSize || 12;
  const cellGap = config.cellGap || 2;
  const colors = config.colors || DEFAULT_COLORS;
  const data = config.data;

  if (data.length === 0) {
    return '<div class="chart-empty">No activity data</div>';
  }

  // Build value map
  const valueMap = new Map<string, number>();
  let maxValue = 0;
  for (const d of data) {
    valueMap.set(d.date, d.value);
    if (d.value > maxValue) maxValue = d.value;
  }

  // Calculate quartile thresholds
  const values = data.map(d => d.value).filter(v => v > 0).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)] || 1;
  const q2 = values[Math.floor(values.length * 0.5)] || 2;
  const q3 = values[Math.floor(values.length * 0.75)] || 3;

  function getLevel(value: number): number {
    if (value === 0) return 0;
    if (value <= q1) return 1;
    if (value <= q2) return 2;
    if (value <= q3) return 3;
    return 4;
  }

  // Get date range
  const dates = data.map(d => d.date).sort();
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  // Align start to Sunday
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay());

  // Align end to Saturday
  const end = new Date(endDate);
  end.setDate(end.getDate() + (6 - end.getDay()));

  // Generate cells
  const cells: string[] = [];
  const monthLabels: string[] = [];
  const step = cellSize + cellGap;
  const labelWidth = 30;

  let currentDate = new Date(start);
  let col = 0;
  let lastMonth = -1;

  while (currentDate <= end) {
    const dow = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];
    const value = valueMap.get(dateStr) || 0;
    const level = getLevel(value);

    const x = labelWidth + col * step;
    const y = 20 + dow * step;

    cells.push(
      `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ` +
      `fill="${colors[level]}" data-tooltip="${dateStr}: ${value.toLocaleString()} messages"/>`
    );

    // Month labels (on first day of week row=0)
    const month = currentDate.getMonth();
    if (month !== lastMonth && dow === 0) {
      monthLabels.push(
        `<text x="${x}" y="12" fill="var(--vscode-descriptionForeground)" font-size="10">${MONTH_NAMES[month]}</text>`
      );
      lastMonth = month;
    }

    // Advance
    if (dow === 6) {
      col++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalWidth = labelWidth + (col + 1) * step + 10;
  const totalHeight = 20 + 7 * step + 10;

  // Day labels
  const dayLabels = DAY_LABELS.map((label, i) => {
    if (!label) return '';
    return `<text x="0" y="${20 + i * step + cellSize - 2}" fill="var(--vscode-descriptionForeground)" font-size="10">${label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width:${totalWidth}px">
    ${monthLabels.join('')}
    ${dayLabels}
    ${cells.join('')}
  </svg>`;
}
