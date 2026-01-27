/**
 * File creation actions for the dashboard
 */

import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Create a new CLAUDE.md file with template content
 */
export async function createClaudeMd(claudePath: string): Promise<void> {
  const filePath = path.join(claudePath, 'CLAUDE.md');
  const template = `# Project Instructions

## Overview
[Project description]

## Tech Stack
- Language: TypeScript

## Commands
\`\`\`bash
pnpm install
pnpm run dev
\`\`\`
`;

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(filePath),
    Buffer.from(template, 'utf8')
  );

  // Open the created file
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
  await vscode.window.showTextDocument(doc);
}
