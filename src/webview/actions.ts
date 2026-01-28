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

/**
 * Template content for each folder type
 */
const FOLDER_TEMPLATES: Record<string, { filename: string; content: string }> = {
  agents: {
    filename: 'example.md',
    content: `---
name: Example Agent
description: An example agent configuration
model: sonnet
---

# Example Agent

This is an example agent. Customize this file or create new ones.
`,
  },
  skills: {
    filename: 'example.md',
    content: `---
name: example
description: An example skill
---

# Example Skill

This is an example skill. Customize this file or create new ones.
`,
  },
  commands: {
    filename: 'example.md',
    content: `---
name: example
description: An example command
---

# Example Command

This is an example command. Customize this file or create new ones.
`,
  },
  rules: {
    filename: 'example.md',
    content: `---
name: example
description: An example rule
---

# Example Rule

This is an example rule. Customize this file or create new ones.
`,
  },
};

/**
 * Create a new folder with an example file
 */
export async function createFolder(claudePath: string, folderName: string): Promise<void> {
  const folderPath = path.join(claudePath, folderName);
  const folderUri = vscode.Uri.file(folderPath);

  // Create the folder
  await vscode.workspace.fs.createDirectory(folderUri);

  // Create example file if template exists
  const template = FOLDER_TEMPLATES[folderName];
  if (template) {
    const filePath = path.join(folderPath, template.filename);
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(filePath),
      Buffer.from(template.content, 'utf8')
    );

    // Open the created file
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
    await vscode.window.showTextDocument(doc);
  }
}
