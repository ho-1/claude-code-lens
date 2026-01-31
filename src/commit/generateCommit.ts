import * as vscode from 'vscode';
import { GitService } from './services/git';
import { ClaudeService } from './services/claude';
import { getCommitSettings } from './settings';
import { LIMITS } from './constants';
import type { GitRepository, GitExtension, GitAPI } from './types';

let currentAbortController: AbortController | null = null;

export function stopGeneration(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

export async function generateCommitCommand(
  sourceControlOrUri?: vscode.SourceControl | vscode.Uri,
): Promise<void> {
  // Toggle: if already generating, stop instead
  if (currentAbortController) {
    stopGeneration();
    return;
  }

  try {
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
    if (!gitExtension) {
      vscode.window.showErrorMessage(
        'Git extension not found. Please ensure Git is installed.',
      );
      return;
    }

    const git: GitAPI = gitExtension.isActive
      ? gitExtension.exports.getAPI(1)
      : (await gitExtension.activate()).getAPI(1);

    if (!git.repositories.length) {
      vscode.window.showErrorMessage(
        'No Git repository found in the current workspace.',
      );
      return;
    }

    let repository: GitRepository | undefined;

    if (sourceControlOrUri) {
      const targetUri =
        sourceControlOrUri instanceof vscode.Uri
          ? sourceControlOrUri
          : sourceControlOrUri.rootUri;

      if (targetUri) {
        repository = git.repositories.find(
          (repo) => repo.rootUri.fsPath === targetUri.fsPath,
        );
      }
    }

    if (!repository) {
      if (git.repositories.length === 1) {
        repository = git.repositories[0];
      } else {
        const selected = await vscode.window.showQuickPick(
          git.repositories.map((repo) => ({
            label: repo.rootUri.fsPath,
            repository: repo,
          })),
          { placeHolder: 'Select a repository' },
        );
        if (!selected) {
          return;
        }
        repository = selected.repository;
      }
    }

    const workspacePath = repository.rootUri.fsPath;
    const gitService = new GitService(workspacePath);
    const claudeService = new ClaudeService();

    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    await vscode.commands.executeCommand(
      'setContext',
      'claudeLens.isGenerating',
      true,
    );

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating commit message...',
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            currentAbortController?.abort();
          });

          if (token.isCancellationRequested || signal.aborted) {
            return;
          }

          progress.report({ increment: 10, message: 'Getting diff...' });
          let { diff, isStaged } = await gitService.getDiff();

          if (signal.aborted) {
            return;
          }

          if (!diff.trim()) {
            vscode.window.showInformationMessage(
              'No changes detected. Stage some changes first.',
            );
            return;
          }

          // Truncate large diffs to prevent token limit issues
          let wasTruncated = false;
          if (diff.length > LIMITS.MAX_DIFF_SIZE) {
            diff = diff.slice(0, LIMITS.MAX_DIFF_SIZE);
            wasTruncated = true;
          }

          if (!isStaged) {
            const action = await vscode.window.showWarningMessage(
              'No staged changes found. Using unstaged changes.',
              'Continue',
              'Cancel',
            );
            if (action !== 'Continue' || signal.aborted) {
              return;
            }
          }

          if (wasTruncated) {
            vscode.window.showWarningMessage(
              'Diff was truncated due to size. Commit message may be incomplete.',
            );
          }

          progress.report({ increment: 30, message: 'Calling Claude...' });

          const settings = getCommitSettings();

          try {
            const message = await claudeService.generate(
              diff,
              settings.model,
              settings.prompt,
              signal,
            );

            if (signal.aborted) {
              return;
            }

            repository!.inputBox.value = message;
            vscode.window.showInformationMessage('Commit message generated!');
          } catch (error) {
            if (signal.aborted) {
              vscode.window.showInformationMessage('Generation stopped.');
              return;
            }
            if (error instanceof Error) {
              vscode.window.showErrorMessage(error.message);
            }
          }
        },
      );
    } finally {
      currentAbortController = null;
      await vscode.commands.executeCommand(
        'setContext',
        'claudeLens.isGenerating',
        false,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  }
}
