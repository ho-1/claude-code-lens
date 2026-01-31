import * as fs from 'fs';
import { execAsync, spawnWithStdin } from '../utils/process';
import {
  CLI,
  TIMEOUTS,
  DEFAULT_COMMIT_PROMPT,
  DEFAULT_MODEL,
  type ModelType,
} from '../constants';

// Module-level cache for CLI path (persists across ClaudeService instances)
let cachedClaudePath: string | null = null;

export class ClaudeService {
  async findCli(): Promise<string> {
    if (cachedClaudePath) {
      return cachedClaudePath;
    }

    for (const command of CLI.SEARCH_COMMANDS) {
      const path = await this.tryCommand(command);
      if (path) {
        cachedClaudePath = path;
        return path;
      }
    }

    const path = await this.checkCommonPaths();
    if (path) {
      cachedClaudePath = path;
      return path;
    }

    throw new Error(`Claude CLI not found. Please install it from ${CLI.INSTALL_URL}`);
  }

  private async tryCommand(command: string): Promise<string | null> {
    try {
      const result = await execAsync(command, { timeout: TIMEOUTS.CLI_SEARCH });
      const path = result.stdout.trim().split('\n')[0]; // Take first line only (Windows 'where' can return multiple)
      if (path && !path.includes('not found')) {
        return path;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async checkCommonPaths(): Promise<string | null> {
    for (const path of CLI.COMMON_PATHS) {
      try {
        await fs.promises.access(path, fs.constants.X_OK);
        return path;
      } catch {
        continue;
      }
    }
    return null;
  }

  async generate(
    diff: string,
    model: ModelType = DEFAULT_MODEL,
    customPrompt?: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const claudePath = await this.findCli();
    const basePrompt = customPrompt || DEFAULT_COMMIT_PROMPT;
    const prompt = basePrompt + diff;

    const args = ['--print', '--model', model, '--output-format', 'text'];

    try {
      // Use spawnWithStdin to avoid shell injection vulnerabilities
      // Prompt is passed via stdin, not as a shell argument
      const result = await spawnWithStdin(claudePath, args, prompt, {
        timeout: TIMEOUTS.COMMIT_GENERATE,
        signal,
      });

      if (result.stderr && result.stderr.includes('not logged in')) {
        throw new Error('Please run "claude login" in your terminal to authenticate.');
      }

      const message = result.stdout.trim();
      if (!message) {
        throw new Error('Claude returned an empty response');
      }

      return message;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Aborted') {
          throw error;
        }
        if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
      throw new Error('Failed to generate commit message');
    }
  }
}
