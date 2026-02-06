/**
 * Scanner for ~/.claude/teams/ and ~/.claude/tasks/ directories
 * Discovers agent team configurations and task lists
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TeamData, TeamConfig, TeamMember, TaskItem, TaskStatus, AgentTeamsSettings } from './types';

const MAX_JSON_SIZE = 1024 * 1024; // 1MB

/**
 * Scan ~/.claude/teams/ and ~/.claude/tasks/ for agent team data
 */
export async function scanTeamData(): Promise<TeamData> {
  const homeDir = os.homedir();
  const teamsDir = path.join(homeDir, '.claude', 'teams');
  const tasksDir = path.join(homeDir, '.claude', 'tasks');

  const [teams, tasks] = await Promise.all([
    scanTeams(teamsDir),
    scanTasks(tasksDir),
  ]);

  return { teams, tasks };
}

/**
 * Scan agent teams settings from ~/.claude/settings.json
 */
export async function scanAgentTeamsSettings(): Promise<AgentTeamsSettings> {
  const homeDir = os.homedir();
  const settingsPath = path.join(homeDir, '.claude', 'settings.json');

  const defaults: AgentTeamsSettings = {
    enabled: false,
    teammateMode: 'auto',
    dangerouslySkipPermissions: false,
  };

  try {
    if (!fs.existsSync(settingsPath)) {
      return defaults;
    }

    const stat = fs.statSync(settingsPath);
    if (stat.size > MAX_JSON_SIZE) {
      return defaults;
    }

    const content = fs.readFileSync(settingsPath, 'utf8');
    const json = JSON.parse(content);

    return {
      enabled: !!(json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1' ||
                  json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === 1 ||
                  json.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === true),
      teammateMode: json.teammateMode || 'auto',
      dangerouslySkipPermissions: !!json.dangerouslySkipPermissions,
    };
  } catch {
    return defaults;
  }
}

/**
 * Scan ~/.claude/teams/ for team configurations
 */
async function scanTeams(teamsDir: string): Promise<TeamConfig[]> {
  const teams: TeamConfig[] = [];

  try {
    if (!fs.existsSync(teamsDir)) {
      return teams;
    }

    const entries = fs.readdirSync(teamsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const configPath = path.join(teamsDir, entry.name, 'config.json');
      try {
        if (!fs.existsSync(configPath)) continue;

        const stat = fs.statSync(configPath);
        if (stat.size > MAX_JSON_SIZE) continue;

        const content = fs.readFileSync(configPath, 'utf8');
        const json = JSON.parse(content);

        const members: TeamMember[] = [];
        if (Array.isArray(json.members)) {
          for (const m of json.members) {
            if (m && typeof m.name === 'string') {
              members.push({
                name: m.name,
                agentId: String(m.agentId || ''),
                agentType: m.agentType === 'lead' ? 'lead' : 'teammate',
              });
            }
          }
        }

        teams.push({
          name: entry.name,
          configPath,
          members,
          createdAt: json.createdAt,
        });
      } catch {
        // Skip invalid config
      }
    }
  } catch {
    // Teams directory not accessible
  }

  return teams;
}

/**
 * Scan ~/.claude/tasks/ for task items
 */
async function scanTasks(tasksDir: string): Promise<TaskItem[]> {
  const tasks: TaskItem[] = [];

  try {
    if (!fs.existsSync(tasksDir)) {
      return tasks;
    }

    const teamEntries = fs.readdirSync(tasksDir, { withFileTypes: true });

    for (const teamEntry of teamEntries) {
      if (!teamEntry.isDirectory()) continue;

      const teamTaskDir = path.join(tasksDir, teamEntry.name);
      const taskFiles = fs.readdirSync(teamTaskDir, { withFileTypes: true });

      for (const taskFile of taskFiles) {
        if (!taskFile.isFile() || !taskFile.name.endsWith('.json')) continue;

        const taskPath = path.join(teamTaskDir, taskFile.name);
        try {
          const stat = fs.statSync(taskPath);
          if (stat.size > MAX_JSON_SIZE) continue;

          const content = fs.readFileSync(taskPath, 'utf8');
          const json = JSON.parse(content);

          // Handle both single task and array of tasks
          const taskEntries = Array.isArray(json) ? json : [json];

          for (const t of taskEntries) {
            if (!t || typeof t !== 'object') continue;

            const status = validateStatus(t.status);
            tasks.push({
              id: String(t.id || t.taskId || taskFile.name.replace('.json', '')),
              subject: String(t.subject || t.title || t.name || 'Untitled'),
              description: t.description || undefined,
              status,
              owner: t.owner || undefined,
              blockedBy: Array.isArray(t.blockedBy) ? t.blockedBy.map(String) : undefined,
              blocks: Array.isArray(t.blocks) ? t.blocks.map(String) : undefined,
              teamName: teamEntry.name,
              filePath: taskPath,
            });
          }
        } catch {
          // Skip invalid task file
        }
      }
    }
  } catch {
    // Tasks directory not accessible
  }

  return tasks;
}

function validateStatus(status: unknown): TaskStatus {
  if (status === 'pending' || status === 'in_progress' || status === 'completed') {
    return status;
  }
  return 'pending';
}
