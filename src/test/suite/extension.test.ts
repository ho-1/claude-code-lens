import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('byungho.claude-code-lens'));
  });

  test('Should register claudeLens.refresh command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('claudeLens.refresh'));
  });

  test('Should register claudeLens.openFile command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('claudeLens.openFile'));
  });
});
