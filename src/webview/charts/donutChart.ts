/**
 * SVG Donut Chart - ring chart with center label
 */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartConfig {
  segments: DonutSegment[];
  size?: number;
  innerRadiusRatio?: number;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
}

export function renderDonutChartSvg(config: DonutChartConfig): string {
  const size = config.size || 180;
  const innerRatio = config.innerRadiusRatio || 0.62;
  const showLegend = config.showLegend !== false;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * innerRatio;

  const segments = config.segments.filter(s => s.value > 0);
  if (segments.length === 0) {
    return '<div class="chart-empty">No data</div>';
  }

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Build arc paths
  let currentAngle = -Math.PI / 2; // Start from top
  const paths = segments.map(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const largeArc = angle > Math.PI ? 1 : 0;

    const x1Outer = cx + outerR * Math.cos(startAngle);
    const y1Outer = cy + outerR * Math.sin(startAngle);
    const x2Outer = cx + outerR * Math.cos(endAngle);
    const y2Outer = cy + outerR * Math.sin(endAngle);

    const x1Inner = cx + innerR * Math.cos(endAngle);
    const y1Inner = cy + innerR * Math.sin(endAngle);
    const x2Inner = cx + innerR * Math.cos(startAngle);
    const y2Inner = cy + innerR * Math.sin(startAngle);

    const pct = Math.round((seg.value / total) * 100);

    return `<path d="M${x1Outer},${y1Outer} A${outerR},${outerR} 0 ${largeArc},1 ${x2Outer},${y2Outer} L${x1Inner},${y1Inner} A${innerR},${innerR} 0 ${largeArc},0 ${x2Inner},${y2Inner}Z" fill="${seg.color}" opacity="0.9" stroke="var(--vscode-editor-background)" stroke-width="1.5" data-tooltip="${seg.label}: ${seg.value.toLocaleString()} (${pct}%)"/>`;
  }).join('');

  // Center text
  const centerText = config.centerValue
    ? `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--vscode-foreground)" font-size="18" font-weight="600">${config.centerValue}</text>
       <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="var(--vscode-descriptionForeground)" font-size="10">${config.centerLabel || ''}</text>`
    : '';

  // Legend
  let legend = '';
  let legendHeight = 0;
  if (showLegend) {
    const legendY = size + 8;
    const itemHeight = 18;
    legendHeight = segments.length * itemHeight + 8;
    legend = segments.map((seg, i) => {
      const y = legendY + i * itemHeight;
      const pct = Math.round((seg.value / total) * 100);
      return `<rect x="10" y="${y}" width="10" height="10" rx="2" fill="${seg.color}"/>` +
        `<text x="26" y="${y + 9}" fill="var(--vscode-foreground)" font-size="11">${seg.label}</text>` +
        `<text x="${size - 10}" y="${y + 9}" text-anchor="end" fill="var(--vscode-descriptionForeground)" font-size="11">${pct}%</text>`;
    }).join('');
  }

  const totalHeight = size + legendHeight;

  return `<svg viewBox="0 0 ${size} ${totalHeight}" width="${size}" height="${totalHeight}">
    ${paths}
    ${centerText}
    ${legend}
  </svg>`;
}
