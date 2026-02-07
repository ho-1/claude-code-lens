/**
 * SVG Sparkline - compact inline mini chart
 */

export interface SparklineConfig {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
}

export function renderSparklineSvg(config: SparklineConfig): string {
  const width = config.width || 120
  const height = config.height || 32
  const color = config.color || '#26a641'
  const fillOpacity = config.fillOpacity || 0.2
  const data = config.data

  if (data.length < 2) {
    return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"></svg>`
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pad = 2

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (val - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const linePath = `M${points.join('L')}`
  const areaPath = `${linePath}L${width - pad},${height - pad}L${pad},${height - pad}Z`

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <path d="${areaPath}" fill="${color}" opacity="${fillOpacity}"/>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.5"/>
  </svg>`
}
