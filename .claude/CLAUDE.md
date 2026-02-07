---
icon: 📋
name: Project Guide
description: Claude Code Lens development guide
---

# Claude Code Lens

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
├── extension.ts              # Entry point, registers providers & watchers
├── claudeTreeProvider.ts     # TreeView provider (Activity Bar)
├── claudeScanner.ts          # .claude folder scanner
├── teamScanner.ts            # ~/.claude/teams/ & tasks/ scanner
├── insightsScanner.ts        # Usage analytics data scanner
├── statsViewProvider.ts      # Stats panel provider
├── productivityPulse.ts      # Status bar productivity indicator
├── frontmatterParser.ts      # YAML frontmatter parser
├── types.ts                  # TypeScript types
├── insightsTypes.ts          # Insights-specific types
├── taskScanner.ts            # Task file scanner
├── constants/
│   ├── colors.ts             # Color palette
│   ├── icons.ts              # SVG icons & ThemeIcon mappings
│   └── folderCategories.ts   # Folder category definitions
├── utils/
│   ├── iconUtils.ts          # Icon selection logic
│   ├── statsCalculator.ts    # Stats calculation
│   └── escapeHtml.ts         # XSS prevention
├── commit/
│   ├── generateCommit.ts     # AI commit message generation
│   ├── constants.ts          # Commit prompts
│   ├── settings.ts           # Model settings
│   ├── types.ts              # Commit types
│   ├── utils/                # Commit utilities
│   └── services/
│       ├── claude.ts         # Claude CLI integration
│       └── git.ts            # Git operations
└── webview/
    ├── dashboardPanel.ts     # Panel lifecycle
    ├── htmlRenderer.ts       # HTML generation & tab routing
    ├── styles.ts             # CSS styles
    ├── cardView.ts           # Config tab (card grid)
    ├── teamView.ts           # Teams tab
    ├── taskView.ts           # Tasks tab (kanban board)
    ├── insightsView.ts       # Insights tab
    ├── insightsStyles.ts     # Insights CSS
    ├── insightsSections/
    │   ├── activitySection.ts
    │   ├── tokenSection.ts
    │   ├── qualitySection.ts
    │   ├── toolUsageSection.ts
    │   ├── projectFocusSection.ts
    │   └── sessionExplorer.ts
    └── charts/
        ├── heatmap.ts
        ├── barChart.ts
        ├── lineChart.ts
        ├── donutChart.ts
        └── sparkline.ts
```

## Features

### Activity Bar Integration

- Custom icon in left Activity Bar
- TreeView panel with file browser
- Agent Teams group (teams + tasks by status)

### Auto Detection

- Discovers all `.claude` folders in workspace
- Supports nested `.claude` folders
- Excludes node_modules

### Dashboard Tabs

- **Config** — Card grid per project (Config, Skills, Commands, Agents)
- **Teams** — Agent team cards with member list
- **Tasks** — Kanban board (In Progress / Pending / Completed)
- **Sessions** — Session explorer filtered by workspace
- **Insights** — Usage analytics (activity heatmap, tokens, quality, tools, projects)

### AI Commit Message

- Generate conventional commit messages from git diff using Claude CLI
- Configurable model (haiku / sonnet / opus) and custom prompt

### Status Bar

- Productivity Pulse: today's session/message count

## Publishing

```bash
pnpm dlx @vscode/vsce package   # Create VSIX
pnpm dlx @vscode/vsce publish   # Publish to marketplace
```
