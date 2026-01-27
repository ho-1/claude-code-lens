---
icon: 📋
name: Project Guide
description: Claude Code Explorer development guide
---

# Claude Code Explorer

VS Code extension that visualizes `.claude` folder configuration files in the Activity Bar.

## Tech Stack

- **Language**: TypeScript
- **Bundler**: esbuild
- **Package Manager**: pnpm
- **Testing**: Mocha + @vscode/test-electron

## Commands

```bash
pnpm install        # Install dependencies
pnpm run compile    # Build
pnpm run watch      # Watch mode
pnpm test           # Run tests
```

## Debugging

1. Open project in VS Code
2. Press F5 to launch Extension Development Host
3. Open a project with `.claude` folder
4. Click extension icon in Activity Bar

## File Structure

```
src/
├── extension.ts           # Entry point
├── claudeTreeProvider.ts  # Tree view provider
├── claudeScanner.ts       # .claude folder scanner
├── statsViewProvider.ts   # Stats panel provider
├── frontmatterParser.ts   # YAML frontmatter parser
├── types.ts               # TypeScript types
├── constants/
│   ├── colors.ts          # Color palette
│   ├── icons.ts           # SVG icons
│   └── folderCategories.ts
├── utils/
│   ├── iconUtils.ts       # Icon selection logic
│   └── statsCalculator.ts # Stats calculation
└── webview/
    ├── dashboardPanel.ts  # Panel lifecycle
    ├── htmlRenderer.ts    # HTML generation
    ├── styles.ts          # CSS styles
    └── actions.ts         # File creation actions
```

## Features

### Activity Bar Integration

- Custom icon in left Activity Bar
- TreeView panel with file browser

### Auto Detection

- Discovers all `.claude` folders in workspace
- Supports nested `.claude` folders
- Excludes node_modules

### TreeView Display

```
📂 .claude (root)
├── 📋 CLAUDE.md
├── ⚙️ settings.json
├── 🤖 agents/
├── 🎯 skills/
├── 💻 commands/
└── ⚡ hooks/
```

### Dashboard View

- Card-based layout for all config files
- Stats overview (files, skills, commands, agents, hooks, configs)
- Permission tags display

## Publishing

```bash
pnpm dlx @vscode/vsce package   # Create VSIX
pnpm dlx @vscode/vsce publish   # Publish to marketplace
```
