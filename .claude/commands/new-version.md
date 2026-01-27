# New Version Release

Bump version and build vsix file. (No git commit/push)

## Arguments

- `$ARGUMENTS`: Version type (patch, minor, major). Default: patch

## Instructions

Run these commands in order:

```bash
npm version ${ARGUMENTS:-patch} --no-git-tag-version
pnpm dlx @vscode/vsce package
```

After completion, show:
- Generated vsix file path
- Upload URL: https://marketplace.visualstudio.com/manage/publishers/Byungho
