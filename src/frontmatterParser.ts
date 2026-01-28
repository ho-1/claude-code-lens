import { Frontmatter, ParsedFile, Permissions } from './types';

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

export function parseFrontmatter(content: string, filename?: string): ParsedFile {
  // Handle JSON files (settings.json, settings.local.json)
  if (filename && filename.toLowerCase().endsWith('.json')) {
    return parseJsonFile(content);
  }
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    return {
      frontmatter: {},
      content: content,
      preview: getPreview(content),
    };
  }

  const [, yamlContent, bodyContent] = match;
  const frontmatter = parseYaml(yamlContent);

  return {
    frontmatter,
    content: bodyContent,
    preview: getPreview(bodyContent),
  };
}

function parseYaml(yaml: string): Frontmatter {
  const result: Frontmatter = {};
  const lines = yaml.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove YAML comments (# ...) - but be careful with quoted strings
    value = stripYamlComment(value);

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key === 'icon' || key === 'name' || key === 'description') {
      result[key] = value;
    } else if (key === 'model' || key === 'permissionMode') {
      result[key] = value;
    } else if (key === 'tools' || key === 'allowed-tools') {
      // Handle tools as array (inline or multi-line)
      const targetKey = key === 'allowed-tools' ? 'allowedTools' : 'tools';
      if (value.startsWith('[')) {
        // Inline array: tools: [Bash, Read, Write]
        const arrayContent = value.slice(1, -1);
        result[targetKey] = arrayContent.split(',').map(t => stripYamlComment(t.trim()).replace(/['"]/g, '')).filter(t => t);
      } else if (value === '') {
        // Multi-line array format
        const items: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].match(/^\s+-\s+/)) {
          let itemValue = lines[j].replace(/^\s+-\s+/, '').trim();
          itemValue = stripYamlComment(itemValue).replace(/['"]/g, '');
          if (itemValue) items.push(itemValue);
          j++;
        }
        result[targetKey] = items;
      }
    }
  }

  return result;
}

function stripYamlComment(value: string): string {
  // If value is quoted, don't strip anything
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value;
  }

  // Find # that's not inside quotes
  let inQuote: string | null = null;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      }
    } else {
      if (char === '"' || char === "'") {
        inQuote = char;
      } else if (char === '#') {
        // Found comment marker outside quotes
        return value.slice(0, i).trim();
      }
    }
  }

  return value.trim();
}

function getPreview(content: string): string {
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 2);

  return lines.join(' ').slice(0, 100);
}

function parseJsonFile(content: string): ParsedFile {
  try {
    const json = JSON.parse(content);
    const frontmatter: Frontmatter = {};

    // Extract permissions
    if (json.permissions) {
      const permissions: Permissions = {};
      if (Array.isArray(json.permissions.allow)) {
        permissions.allow = json.permissions.allow;
      }
      if (Array.isArray(json.permissions.deny)) {
        permissions.deny = json.permissions.deny;
      }
      if (permissions.allow || permissions.deny) {
        frontmatter.permissions = permissions;
      }
    }

    // Extract model if present
    if (json.model) {
      frontmatter.model = json.model;
    }

    // Count hooks
    if (json.hooks && typeof json.hooks === 'object') {
      let hooksCount = 0;
      for (const event of Object.keys(json.hooks)) {
        const matchers = json.hooks[event];
        if (Array.isArray(matchers)) {
          hooksCount += matchers.length;
        }
      }
      if (hooksCount > 0) {
        frontmatter.hooksCount = hooksCount;
      }
    }

    return {
      frontmatter,
      content: '',
      preview: '',
    };
  } catch {
    return {
      frontmatter: {},
      content,
      preview: '',
    };
  }
}

export function getDefaultIcon(filename: string): string {
  const lowerName = filename.toLowerCase();

  if (lowerName === 'claude.md') return '📋';
  if (lowerName === 'spec.md') return '📝';
  if (lowerName.endsWith('.md')) return '📄';
  if (lowerName === 'settings.json') return '⚙️';
  if (lowerName.endsWith('.json')) return '📦';
  if (lowerName.includes('skill')) return '🎯';

  return '📁';
}
