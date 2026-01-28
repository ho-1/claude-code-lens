/**
 * Check prompts for evaluating Claude Code configurations
 * Each folder type has a specific improvement-focused prompt
 */

export const CHECK_PROMPTS: Record<string, string> = {
  claudeFolder: `Analyze this .claude folder and suggest improvements:
- What essential files or folders are missing?
- How can the organization be improved?
- What configurations would enhance Claude Code's effectiveness for this project?`,

  agents: `Review these agent configurations and suggest improvements:
- Are the agent names clear and descriptive?
- Is the model selection optimal for each agent's purpose?
- How can the prompts be more effective?
- What tool permissions should be adjusted for better security or functionality?`,

  skills: `Review these skills and suggest improvements:
- How can the skill names be more discoverable?
- Are the descriptions clear enough for users to understand when to use them?
- What additional skills would benefit this project?
- How can existing skills be made more reusable?`,

  commands: `Review these commands and suggest improvements:
- Are the command names intuitive (e.g., /command-name format)?
- How can the documentation be clearer?
- What edge cases should be handled?
- Are there common workflows that should become commands?`,

  rules: `Review these rules and suggest improvements:
- Are the rules specific enough to be consistently applied?
- What important scenarios are not covered?
- Are there any conflicting or redundant rules?
- How can the rules better align with project conventions?`,
};
