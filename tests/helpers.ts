import * as fs from 'fs';
import * as path from 'path';

export const ROOT = path.resolve(__dirname, '..');

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns null if no frontmatter is found.
 */
export function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: Record<string, string> = {};

  for (const line of yaml.split('\n')) {
    // Only parse simple key: value pairs (not nested YAML)
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (kv) {
      result[kv[1]] = kv[2].trim();
    }
  }

  return result;
}

/**
 * Read all .md files in a directory (non-recursive).
 */
export function listMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

/**
 * Read a file and return its content as a string.
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Check if a file exists.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Extract rows from a markdown table.
 * Returns an array of arrays (rows), where each inner array is the cell values.
 * Skips the header row and separator row.
 *
 * @param content - Markdown file content
 * @param headerHint - A string that must appear in the header row (e.g. "Agent | Model")
 *                     Use a multi-word hint for precision when a file has multiple tables.
 */
export function parseMarkdownTable(content: string, headerHint: string): string[][] {
  const lines = content.split('\n');
  const rows: string[][] = [];
  let inTable = false;
  let separatorSeen = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match header: line must contain '|' AND contain the full headerHint
    if (!inTable && trimmed.includes('|') && trimmed.includes(headerHint)) {
      inTable = true;
      separatorSeen = false;
      continue;
    }

    if (inTable && !separatorSeen && trimmed.match(/^\|[-| :]+\|$/)) {
      separatorSeen = true;
      continue;
    }

    if (inTable && separatorSeen) {
      if (!trimmed.startsWith('|')) {
        // Blank line or non-table line ends the table
        inTable = false;
        separatorSeen = false;
        continue;
      }
      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
  }

  return rows;
}
