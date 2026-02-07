import * as vscode from 'vscode'
import { DEFAULT_COMMIT_PROMPT, type ModelType, MODELS } from './constants'

export interface CommitSettings {
  model: ModelType
  prompt: string
}

export function getCommitSettings(): CommitSettings {
  const config = vscode.workspace.getConfiguration('claudeLens.commit')
  const model = config.get<string>('model', 'haiku') as ModelType
  const customPrompt = config.get<string>('prompt', '')

  return {
    model:
      model === MODELS.OPUS ? MODELS.OPUS : model === MODELS.SONNET ? MODELS.SONNET : MODELS.HAIKU,
    prompt: customPrompt.trim() || DEFAULT_COMMIT_PROMPT,
  }
}
