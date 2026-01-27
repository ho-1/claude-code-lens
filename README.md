<h1 align="center">
  Claude Code Explorer
</h1>

<p align="center">
  <strong>Visualize and manage <code>.claude</code> configuration folders directly in VS Code</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ho-1.claude-code-explorer">
    <img src="https://img.shields.io/visual-studio-marketplace/v/ho-1.claude-code-explorer?style=flat-square&label=VS%20Code%20Marketplace" alt="VS Code Marketplace">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ho-1.claude-code-explorer">
    <img src="https://img.shields.io/visual-studio-marketplace/i/ho-1.claude-code-explorer?style=flat-square" alt="Installs">
  </a>
  <img src="https://img.shields.io/github/license/ho-1/claude-code-explorer?style=flat-square" alt="License">
</p>

---

![Claude Code Explorer](resources/claude-code-explorer.png)

---

## Features

- **Activity Bar Integration** — Dedicated sidebar icon for instant access
- **Auto-detect** — Automatically discovers all `.claude` folders in your workspace
- **Frontmatter Support** — Customize display with icons, names, and descriptions
- **Live Updates** — Changes reflected immediately without refresh
- **Quick Navigation** — Single-click to open any config file
- **Dashboard View** — Overview statistics of your configurations
- **File Management** — Create, rename, and delete files directly from the tree view

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install byungho.claude-code-explorer`
4. Press Enter

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/byungho/claude-code-explorer.git

# Install dependencies
cd claude-code-explorer
pnpm install

# Build and install
pnpm run compile
code --install-extension claude-code-explorer-*.vsix
```

## Usage

1. Open a workspace containing `.claude` folders
2. Click the **Claude Config** icon in the Activity Bar (left sidebar)
3. Browse your configuration files in the tree view
4. Click any file to open it in the editor

### Context Menu Actions

Right-click on folders or files to:

- Create new files or folders
- Rename items
- Delete items

## Frontmatter Format

Customize how your files appear in the tree view by adding YAML frontmatter:

```yaml
---
icon: 🚀
name: Deploy Script
description: Production deployment automation
---
Your content here...
```

| Property      | Description                   |
| ------------- | ----------------------------- |
| `icon`        | Emoji or character to display |
| `name`        | Custom display name           |
| `description` | Tooltip description           |

## Default Icons

Files are automatically assigned icons based on their names:

| Pattern         | Icon | Description               |
| --------------- | ---- | ------------------------- |
| `CLAUDE.md`     | 📋   | Main Claude configuration |
| `SPEC.md`       | 📝   | Specification files       |
| `*.md`          | 📄   | Markdown files            |
| `settings.json` | ⚙️   | Settings files            |
| `*.json`        | 📦   | JSON files                |
| `*skill*`       | 🎯   | Skill-related files       |

## Requirements

- VS Code 1.85.0 or higher

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ for Claude Code users
</p>
