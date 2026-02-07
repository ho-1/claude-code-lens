import { execAsync } from '../utils/process'

export class GitService {
  constructor(private workspacePath: string) {}

  async getDiff(): Promise<{ diff: string; isStaged: boolean }> {
    const stagedDiff = await this.getStagedDiff()
    if (stagedDiff.trim()) {
      return { diff: stagedDiff, isStaged: true }
    }

    const unstagedDiff = await this.getUnstagedDiff()
    return { diff: unstagedDiff, isStaged: false }
  }

  async getStagedDiff(): Promise<string> {
    try {
      const result = await execAsync('git diff --cached', {
        cwd: this.workspacePath,
      })
      return result.stdout
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to get staged diff: ${message}`)
    }
  }

  async getUnstagedDiff(): Promise<string> {
    try {
      const result = await execAsync('git diff', {
        cwd: this.workspacePath,
      })
      return result.stdout
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to get unstaged diff: ${message}`)
    }
  }

  async getRecentCommits(count: number = 10): Promise<string> {
    const safeCount = Math.max(1, Math.min(Math.floor(Math.abs(count)), 50))
    try {
      const result = await execAsync(`git log --oneline -${safeCount} --no-merges --format="%s"`, {
        cwd: this.workspacePath,
      })
      return result.stdout.trim()
    } catch {
      return ''
    }
  }
}
