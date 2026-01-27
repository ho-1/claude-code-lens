/**
 * Folder category constants for Claude config viewer
 */

export const FOLDER_CATEGORIES = ['agents', 'skills', 'commands', 'hooks'] as const;
export type FolderCategory = (typeof FOLDER_CATEGORIES)[number];

/**
 * Get the folder category from a folder name
 * @param name - The folder name to check
 * @returns The folder category or null if not a known category
 */
export function getFolderCategory(name: string): FolderCategory | null {
  const lowerName = name.toLowerCase();
  if (FOLDER_CATEGORIES.includes(lowerName as FolderCategory)) {
    return lowerName as FolderCategory;
  }
  return null;
}

/**
 * Check if a folder name is a known category
 */
export function isFolderCategory(name: string): boolean {
  return getFolderCategory(name) !== null;
}
