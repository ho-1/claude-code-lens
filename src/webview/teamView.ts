/**
 * Team view rendering for the dashboard
 * Shows agent team overview cards
 */

import { ScanResult, TeamConfig, AgentTeamsSettings } from '../types';
import { COLORS } from '../constants/colors';
import { SVG_ICONS } from '../constants/icons';
import { escapeHtml } from '../utils/escapeHtml';

/**
 * Render the teams tab content
 */
export function renderTeamView(result: ScanResult): string {
  const { teamData, agentTeamsSettings } = result;

  return `
  <div class="team-view">
    ${renderSettingsBanner(agentTeamsSettings)}
    ${teamData.teams.length > 0
      ? renderTeamOverview(teamData.teams)
      : renderTeamEmptyState(agentTeamsSettings)
    }
  </div>`;
}

/**
 * Settings banner showing agent teams configuration
 */
function renderSettingsBanner(settings: AgentTeamsSettings): string {
  const statusColor = settings.enabled ? COLORS.allow : COLORS.deny;
  const statusText = settings.enabled ? 'Enabled' : 'Disabled';
  const statusIcon = settings.enabled
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  return `
  <div class="settings-banner">
    <div class="settings-banner-left">
      <span class="settings-status-icon">${statusIcon}</span>
      <span class="settings-status-text" style="color: ${statusColor}">Agent Teams: ${statusText}</span>
      ${settings.teammateMode ? `<span class="settings-badge">${escapeHtml(settings.teammateMode)}</span>` : ''}
      ${settings.dangerouslySkipPermissions ? '<span class="settings-badge settings-badge-warn">skip-permissions</span>' : ''}
    </div>
    <a href="https://code.claude.com/docs/en/agent-teams" class="settings-doc-link">Docs</a>
  </div>`;
}

/**
 * Render team overview cards
 */
function renderTeamOverview(teams: TeamConfig[]): string {
  if (teams.length === 0) return '';

  return `
  <div class="team-section">
    <div class="team-section-header">
      <span class="team-section-icon">${SVG_ICONS.team(COLORS.team)}</span>
      <span class="team-section-title">Teams</span>
      <span class="team-section-count">${teams.length}</span>
    </div>
    <div class="team-cards">
      ${teams.map(team => renderTeamCard(team)).join('')}
    </div>
  </div>`;
}

/**
 * Render a single team card
 */
function renderTeamCard(team: TeamConfig): string {
  const lead = team.members.find(m => m.agentType === 'lead');
  const teammates = team.members.filter(m => m.agentType === 'teammate');

  return `
  <div class="team-card" data-team="${escapeHtml(team.name)}">
    <div class="team-card-header">
      <div class="team-card-title">
        ${SVG_ICONS.team(COLORS.team)}
        <span>${escapeHtml(team.name)}</span>
      </div>
      <span class="team-card-badge">${team.members.length} members</span>
    </div>
    <div class="team-card-body">
      ${lead ? `
      <div class="team-member team-lead">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span class="member-name">${escapeHtml(lead.name)}</span>
        <span class="member-role role-lead">Lead</span>
      </div>
      ` : ''}
      ${teammates.map(m => `
      <div class="team-member">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${COLORS.team}" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span class="member-name">${escapeHtml(m.name)}</span>
        <span class="member-role">Teammate</span>
      </div>
      `).join('')}
    </div>
    ${team.configPath ? `<div class="team-card-footer" data-path="${escapeHtml(team.configPath)}">Open config.json</div>` : ''}
  </div>`;
}

/**
 * Render empty state for teams
 */
function renderTeamEmptyState(settings: AgentTeamsSettings): string {
  return `
  <div class="team-empty-state">
    <div class="team-empty-icon">
      ${SVG_ICONS.team('#6B7280')}
    </div>
    <div class="team-empty-title">No Agent Teams Found</div>
    <div class="team-empty-desc">
      ${settings.enabled
        ? 'Agent teams are enabled. Create a team in Claude Code by asking Claude to "create an agent team".'
        : 'Enable agent teams by adding <code>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS</code> to your settings.json'
      }
    </div>
    <div class="team-empty-hint">
      Teams are stored at <code>~/.claude/teams/</code>
    </div>
  </div>`;
}

/**
 * Get team view specific scripts
 */
export function getTeamViewScripts(): string {
  return `
    // Team card footer click - open config file
    document.querySelectorAll('.team-card-footer[data-path]').forEach(footer => {
      footer.addEventListener('click', () => {
        vscode.postMessage({ type: 'openFile', path: footer.dataset.path });
      });
    });

`;
}
