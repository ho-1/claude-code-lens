import * as assert from 'assert';
import { parseFrontmatter, getDefaultIcon } from '../../frontmatterParser';

suite('Frontmatter Parser Test Suite', () => {
  suite('parseFrontmatter', () => {
    test('should parse valid frontmatter', () => {
      const content = `---
icon: 🚀
name: Test File
description: A test description
---
This is the content.
Second line.`;

      const result = parseFrontmatter(content);

      assert.strictEqual(result.frontmatter.icon, '🚀');
      assert.strictEqual(result.frontmatter.name, 'Test File');
      assert.strictEqual(result.frontmatter.description, 'A test description');
      assert.ok(result.content.includes('This is the content'));
      assert.ok(result.preview.includes('This is the content'));
    });

    test('should handle content without frontmatter', () => {
      const content = `Just regular content
without any frontmatter.`;

      const result = parseFrontmatter(content);

      assert.strictEqual(result.frontmatter.icon, undefined);
      assert.strictEqual(result.frontmatter.name, undefined);
      assert.strictEqual(result.frontmatter.description, undefined);
      assert.ok(result.content.includes('Just regular content'));
    });

    test('should handle quoted values', () => {
      const content = `---
name: "Quoted Name"
description: 'Single quoted'
---
Content here.`;

      const result = parseFrontmatter(content);

      assert.strictEqual(result.frontmatter.name, 'Quoted Name');
      assert.strictEqual(result.frontmatter.description, 'Single quoted');
    });

    test('should handle empty frontmatter', () => {
      const content = `---
---
Content after empty frontmatter.`;

      const result = parseFrontmatter(content);

      assert.strictEqual(result.frontmatter.icon, undefined);
      assert.ok(result.content.includes('Content after empty frontmatter'));
    });

    test('should generate preview from first two lines', () => {
      const content = `---
name: Test
---
First line of content.
Second line of content.
Third line should not be in preview.`;

      const result = parseFrontmatter(content);

      assert.ok(result.preview.includes('First line'));
      assert.ok(result.preview.includes('Second line'));
    });
  });

  suite('getDefaultIcon', () => {
    test('should return correct icon for CLAUDE.md', () => {
      assert.strictEqual(getDefaultIcon('CLAUDE.md'), '📋');
      assert.strictEqual(getDefaultIcon('claude.md'), '📋');
    });

    test('should return correct icon for SPEC.md', () => {
      assert.strictEqual(getDefaultIcon('SPEC.md'), '📝');
      assert.strictEqual(getDefaultIcon('spec.md'), '📝');
    });

    test('should return correct icon for other .md files', () => {
      assert.strictEqual(getDefaultIcon('README.md'), '📄');
      assert.strictEqual(getDefaultIcon('notes.md'), '📄');
    });

    test('should return correct icon for settings.json', () => {
      assert.strictEqual(getDefaultIcon('settings.json'), '⚙️');
    });

    test('should return correct icon for other .json files', () => {
      assert.strictEqual(getDefaultIcon('config.json'), '📦');
      assert.strictEqual(getDefaultIcon('package.json'), '📦');
    });

    test('should return correct icon for skill files', () => {
      assert.strictEqual(getDefaultIcon('deploy-skill.md'), '🎯');
      assert.strictEqual(getDefaultIcon('SKILL.md'), '🎯');
    });

    test('should return default folder icon for unknown files', () => {
      assert.strictEqual(getDefaultIcon('unknown.txt'), '📁');
    });
  });
});
