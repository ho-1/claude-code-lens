import * as vscode from 'vscode'

export interface ClaudeConfig {
  timeout: number
}

export interface GitRepository {
  rootUri: vscode.Uri
  inputBox: { value: string }
}

export interface GitExtension {
  getAPI(version: number): GitAPI
}

export interface GitAPI {
  repositories: GitRepository[]
}

export interface CommandResult {
  stdout: string
  stderr: string
}
