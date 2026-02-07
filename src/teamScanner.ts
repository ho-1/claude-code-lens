/**
 * Scanner for ~/.claude/teams/ directory
 * Discovers agent team configurations
 */

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { TeamConfig, TeamMember, AgentTeamsSettings } from './types'

const MAX_JSON_SIZE = 1024 * 1024 // 1MB

/**
 * Scan ~/.claude/teams/ for agent team configurations
 */
export async function scanTeams(): Promise<TeamConfig[]> {
  const homeDir = os.homedir()
  const teamsDir = path.join(homeDir, '.claude', 'teams')
  const teams: TeamConfig[] = []

  try {
    if (!fs.existsSync(teamsDir)) {
      return teams
    }

    const entries = fs.readdirSync(teamsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const configPath = path.join(teamsDir, entry.name, 'config.json')
      try {
        if (!fs.existsSync(configPath)) continue

        const stat = fs.statSync(configPath)
        if (stat.size > MAX_JSON_SIZE) continue

        const content = fs.readFileSync(configPath, 'utf8')
        const json = JSON.parse(content)

        const members: TeamMember[] = []
        if (Array.isArray(json.members)) {
          for (const m of json.members) {
            if (m && typeof m.name === 'string') {
              members.push({
                name: m.name,
                agentId: String(m.agentId || ''),
                agentType: m.agentType === 'lead' ? 'lead' : 'teammate',
              })
            }
          }
        }

        teams.push({
          name: entry.name,
          configPath,
          members,
          createdAt: json.createdAt,
        })
      } catch {
        // Skip invalid config
      }
    }
  } catch {
    // Teams directory not accessible
  }

  return teams
}

/**
 * Scan agent teams settings from ~/.claude/settings.json
 */
export async function scanAgentTeamsSettings(): Promise<AgentTeamsSettings> {
  const homeDir = os.homedir()
  const settingsPath = path.join(homeDir, '.claude', 'settings.json')

  const defaults: AgentTeamsSettings = {
    enabled: false,
    teammateMode: 'auto',
    dangerouslySkipPermissions: false,
  }

  try {
    if (!fs.existsSync(settingsPath)) {
      return defaults
    }

    const stat = fs.statSync(settingsPath)
    if (stat.size > MAX_JSON_SIZE) {
      return defaults
    }

    const content = fs.readFileSync(settingsPath, 'utf8')
    const json = JSON.parse(content)

    return {
      enabled: !!(
        json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1' ||
        json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === 1 ||
        json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === true
      ),
      teammateMode: json.teammateMode || 'auto',
      dangerouslySkipPermissions: !!json.dangerouslySkipPermissions,
    }
  } catch {
    return defaults
  }
}
