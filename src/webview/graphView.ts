/**
 * Graph view rendering for the dashboard
 * Shows relationships between config files visually
 */

import { ScanResult } from '../types';

/**
 * Render the graph view content (placeholder)
 */
export function renderGraphView(result: ScanResult): string {
  const { stats } = result;

  return `
  <div class="graph-view-container">
    <div class="graph-placeholder">
      <div class="graph-placeholder-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="5" r="2"/>
          <circle cx="19" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
          <path d="M7 12h4M12 7v4M12 15v2M15 12h2"/>
        </svg>
      </div>
      <div class="graph-placeholder-title">Graph View</div>
      <div class="graph-placeholder-desc">Coming Soon</div>
      <div class="graph-placeholder-stats">
        <span class="graph-stat">${stats.skills} skills</span>
        <span class="graph-stat">${stats.agents} agents</span>
        <span class="graph-stat">${stats.hooks} hooks</span>
      </div>
    </div>
  </div>`;
}

/**
 * Get graph view specific scripts (placeholder)
 */
export function getGraphViewScripts(): string {
  return `
    // Graph view scripts will be added here
    console.log('Graph view loaded');
  `;
}
