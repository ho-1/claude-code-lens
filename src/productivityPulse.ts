/**
 * Productivity Pulse - Status bar item showing today's Claude Code activity
 */

import * as vscode from 'vscode';
import { InsightsData } from './insightsTypes';

let statusBarItem: vscode.StatusBarItem | undefined;

export function createProductivityPulse(context: vscode.ExtensionContext): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'claudeLens.openDashboard';
  statusBarItem.tooltip = 'Claude Code Lens - Click to open dashboard';
  statusBarItem.text = '$(pulse) Claude: --';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  return statusBarItem;
}

export function updateProductivityPulse(insights: InsightsData | null): void {
  if (!statusBarItem) return;

  if (!insights?.statsCache) {
    statusBarItem.text = '$(pulse) Claude: --';
    statusBarItem.tooltip = 'Claude Code Lens - No usage data';
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const todayActivity = insights.statsCache.dailyActivity.find(d => d.date === today);
  const sessions = todayActivity?.sessionCount || 0;
  const messages = todayActivity?.messageCount || 0;
  const toolCalls = todayActivity?.toolCallCount || 0;

  statusBarItem.text = `$(pulse) ${sessions}s ${messages}m`;

  const tooltip = new vscode.MarkdownString();
  tooltip.appendMarkdown(`**Claude Code Today**\n\n`);
  tooltip.appendMarkdown(`Sessions: **${sessions}**\n\n`);
  tooltip.appendMarkdown(`Messages: **${messages}**\n\n`);
  tooltip.appendMarkdown(`Tool Calls: **${toolCalls}**\n\n`);
  tooltip.appendMarkdown(`---\n\n`);
  tooltip.appendMarkdown(`Total: **${insights.statsCache.totalSessions}** sessions, **${insights.statsCache.totalMessages.toLocaleString()}** messages\n\n`);
  tooltip.appendMarkdown(`_Click to open Dashboard_`);
  statusBarItem.tooltip = tooltip;
}
