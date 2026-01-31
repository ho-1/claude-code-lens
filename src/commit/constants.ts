const isWindows = process.platform === 'win32';

export const CLI = {
  COMMON_PATHS: isWindows
    ? [
        `${process.env.LOCALAPPDATA}\\Programs\\claude\\claude.exe`,
        `${process.env.APPDATA}\\npm\\claude.cmd`,
      ]
    : [
        '/usr/local/bin/claude',
        '/opt/homebrew/bin/claude',
        `${process.env.HOME}/.local/bin/claude`,
      ],

  SEARCH_COMMANDS: isWindows
    ? ['where claude']
    : [
        'which claude',
        '/bin/bash -l -c "which claude"',
        '/bin/zsh -l -c "which claude"',
      ],

  INSTALL_URL: 'https://docs.anthropic.com/en/docs/claude-code',
} as const;

export const TIMEOUTS = {
  CLI_SEARCH: 5000,
  PATH_CHECK: 1000,
  COMMIT_GENERATE: 60000,
} as const;

export const LIMITS = {
  MAX_DIFF_SIZE: 100_000, // ~100KB, prevents token limit issues
} as const;

export const MODELS = {
  HAIKU: "haiku",
  SONNET: "sonnet",
  OPUS: "opus",
} as const;

export type ModelType = (typeof MODELS)[keyof typeof MODELS];

export const DEFAULT_MODEL = MODELS.HAIKU;

export const DEFAULT_COMMIT_PROMPT = `Generate a conventional commit message for the following git diff.

Rules:
- Use format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
- Keep first line under 72 characters
- Be specific and concise
- Output plain text only, no markdown, no code blocks, no backticks

Diff:
`;
