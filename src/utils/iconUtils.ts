/**
 * Icon utility functions for Claude config viewer
 * Provides unified icon selection logic for both webview and tree view
 */

import * as vscode from 'vscode';
import { COLORS, THEME_COLORS } from '../constants/colors';
import { SVG_ICONS, THEME_ICON_NAMES } from '../constants/icons';
import { getFolderCategory, FolderCategory } from '../constants/folderCategories';

/**
 * Get SVG icon for a file based on filename and parent folder
 * Used in webview rendering
 */
export function getSvgIcon(filename: string, parentFolder?: string): string {
  const lowerName = filename.toLowerCase();
  const category = parentFolder ? getFolderCategory(parentFolder) : null;

  // Check parent folder category first
  if (category) {
    return getSvgIconForCategory(category);
  }

  // Check filename
  if (lowerName === 'claude.md') {
    return SVG_ICONS.document(COLORS.document);
  }
  if (lowerName.startsWith('settings') && lowerName.endsWith('.json')) {
    return SVG_ICONS.gear(COLORS.gear);
  }
  if (lowerName.endsWith('.md')) {
    return SVG_ICONS.file(COLORS.file);
  }
  if (lowerName.endsWith('.json')) {
    return SVG_ICONS.gear(COLORS.gear);
  }

  return SVG_ICONS.file(COLORS.file);
}

/**
 * Get SVG icon for a folder category
 */
function getSvgIconForCategory(category: FolderCategory): string {
  switch (category) {
    case 'agents':
      return SVG_ICONS.robot(COLORS.robot);
    case 'skills':
      return SVG_ICONS.target(COLORS.target);
    case 'commands':
      return SVG_ICONS.terminal(COLORS.terminal);
    case 'hooks':
      return SVG_ICONS.bolt(COLORS.bolt);
    case 'rules':
      return SVG_ICONS.book(COLORS.book);
    default:
      return SVG_ICONS.file(COLORS.file);
  }
}

/**
 * Get SVG folder icon with appropriate color
 * Used in webview rendering
 */
export function getSvgFolderIcon(folderName: string, isOpen: boolean = false): string {
  const category = getFolderCategory(folderName);
  const iconFn = isOpen ? SVG_ICONS.folderOpen : SVG_ICONS.folder;

  if (category) {
    return iconFn(getCategoryColor(category));
  }

  return iconFn(COLORS.folder);
}

/**
 * Get color for a folder category
 */
function getCategoryColor(category: FolderCategory): string {
  switch (category) {
    case 'agents':
      return COLORS.robot;
    case 'skills':
      return COLORS.target;
    case 'commands':
      return COLORS.terminal;
    case 'hooks':
      return COLORS.bolt;
    case 'rules':
      return COLORS.book;
    default:
      return COLORS.file;
  }
}

/**
 * Get ThemeIcon for a file based on filename and parent folder
 * Used in tree view rendering
 */
export function getThemeIcon(filename: string, parentFolder?: string): vscode.ThemeIcon {
  const lowerName = filename.toLowerCase();
  const category = parentFolder ? getFolderCategory(parentFolder) : null;

  // Check parent folder category first
  if (category) {
    return getThemeIconForCategory(category);
  }

  // Check filename
  if (lowerName === 'claude.md') {
    return new vscode.ThemeIcon(
      THEME_ICON_NAMES.document,
      new vscode.ThemeColor(THEME_COLORS.document)
    );
  }
  if (lowerName.startsWith('settings') && lowerName.endsWith('.json')) {
    return new vscode.ThemeIcon(
      THEME_ICON_NAMES.gear,
      new vscode.ThemeColor(THEME_COLORS.gear)
    );
  }
  if (lowerName.endsWith('.md')) {
    return new vscode.ThemeIcon(THEME_ICON_NAMES.fileText);
  }
  if (lowerName.endsWith('.json')) {
    return new vscode.ThemeIcon(THEME_ICON_NAMES.json);
  }

  return new vscode.ThemeIcon(THEME_ICON_NAMES.file);
}

/**
 * Get ThemeIcon for a folder category
 */
function getThemeIconForCategory(category: FolderCategory): vscode.ThemeIcon {
  switch (category) {
    case 'agents':
      return new vscode.ThemeIcon(
        THEME_ICON_NAMES.robot,
        new vscode.ThemeColor(THEME_COLORS.robot)
      );
    case 'skills':
      return new vscode.ThemeIcon(
        THEME_ICON_NAMES.target,
        new vscode.ThemeColor(THEME_COLORS.target)
      );
    case 'commands':
      return new vscode.ThemeIcon(
        THEME_ICON_NAMES.terminal,
        new vscode.ThemeColor(THEME_COLORS.terminal)
      );
    case 'hooks':
      return new vscode.ThemeIcon(
        THEME_ICON_NAMES.bolt,
        new vscode.ThemeColor(THEME_COLORS.bolt)
      );
    case 'rules':
      return new vscode.ThemeIcon(
        THEME_ICON_NAMES.book,
        new vscode.ThemeColor(THEME_COLORS.book)
      );
    default:
      return new vscode.ThemeIcon(THEME_ICON_NAMES.file);
  }
}

/**
 * Get ThemeIcon for a folder
 * Used in tree view rendering
 */
export function getThemeFolderIcon(folderName: string): vscode.ThemeIcon {
  const category = getFolderCategory(folderName);

  if (category) {
    return new vscode.ThemeIcon(
      THEME_ICON_NAMES.folder,
      new vscode.ThemeColor(getThemeColorForCategory(category))
    );
  }

  return new vscode.ThemeIcon(
    THEME_ICON_NAMES.folder,
    new vscode.ThemeColor('descriptionForeground')
  );
}

/**
 * Get theme color ID for a folder category
 */
function getThemeColorForCategory(category: FolderCategory): string {
  switch (category) {
    case 'agents':
      return THEME_COLORS.robot;
    case 'skills':
      return THEME_COLORS.target;
    case 'commands':
      return THEME_COLORS.terminal;
    case 'hooks':
      return THEME_COLORS.bolt;
    case 'rules':
      return THEME_COLORS.book;
    default:
      return THEME_COLORS.gear;
  }
}
