/**
 * Skill/Command Integrity Tests
 *
 * Validates that every command file has YAML frontmatter with a description,
 * and that CLAUDE.md skills table and commands/ directory are in sync.
 */

import * as path from 'path';
import { describe, it, expect } from 'vitest';
import {
  ROOT,
  parseFrontmatter,
  listMdFiles,
  readFile,
  parseMarkdownTable,
} from './helpers';

const COMMANDS_DIR = path.join(ROOT, 'commands');
const CLAUDE_MD = path.join(ROOT, 'CLAUDE.md');

// Skills listed in CLAUDE.md (without the leading slash)
const EXPECTED_COMMANDS = [
  'orchestrate',
  'shipit',
  'prd-review',
  'code-review',
  'prd-threads',
  'tdd-build',
];

describe('Command File Integrity', () => {
  const commandFiles = listMdFiles(COMMANDS_DIR);

  it('finds command files in commands/ directory', () => {
    expect(commandFiles.length).toBeGreaterThan(0);
  });

  it('has all expected command files', () => {
    const commandNames = commandFiles.map((f) => path.basename(f, '.md'));
    for (const expected of EXPECTED_COMMANDS) {
      expect(
        commandNames,
        `Missing command file: commands/${expected}.md`
      ).toContain(expected);
    }
  });

  describe.each(commandFiles.map((f) => [path.basename(f, '.md'), f]))(
    'commands/%s.md frontmatter',
    (name, filePath) => {
      let frontmatter: Record<string, string> | null;

      beforeEach(() => {
        const content = readFile(filePath);
        frontmatter = parseFrontmatter(content);
      });

      it('has YAML frontmatter', () => {
        expect(frontmatter, `${name}.md is missing YAML frontmatter`).not.toBeNull();
      });

      it('has required field: description', () => {
        expect(
          frontmatter?.description,
          `${name}.md is missing "description" field in frontmatter`
        ).toBeTruthy();
      });
    }
  );
});

describe('Cross-Reference: CLAUDE.md skills table vs commands/ files', () => {
  const claudeContent = readFile(CLAUDE_MD);
  const commandFiles = listMdFiles(COMMANDS_DIR);
  const commandFileNames = commandFiles.map((f) => path.basename(f, '.md'));

  // Parse CLAUDE.md skills table — header is "Skill | Use For"
  // Use multi-word hint to avoid matching other tables in CLAUDE.md
  const skillRows = parseMarkdownTable(claudeContent, 'Skill | Use For');

  it('CLAUDE.md skills table has rows', () => {
    expect(skillRows.length).toBeGreaterThan(0);
  });

  it('every skill in CLAUDE.md has a corresponding command file', () => {
    for (const [rawSkill] of skillRows) {
      // Cell may be like "`/orchestrate`" or "`/shipit`"
      const skillName = rawSkill.replace(/[`/]/g, '').trim();
      if (!skillName) continue;
      expect(
        commandFileNames,
        `CLAUDE.md references /${skillName} but commands/${skillName}.md does not exist`
      ).toContain(skillName);
    }
  });

  it('every command file is referenced in CLAUDE.md skills table', () => {
    const skillNames = skillRows
      .map(([rawSkill]) => rawSkill.replace(/[`/]/g, '').trim())
      .filter(Boolean);

    for (const fileName of commandFileNames) {
      expect(
        skillNames,
        `commands/${fileName}.md exists but is not listed in CLAUDE.md skills table`
      ).toContain(fileName);
    }
  });
});

describe('Shipit workflow step numbering', () => {
  const shipitContent = readFile(path.join(COMMANDS_DIR, 'shipit.md'));

  it('workflow steps are numbered sequentially starting at 1', () => {
    // Find all "### Step N" headers
    const stepMatches = [...shipitContent.matchAll(/^### Step (\d+):/gm)];
    const stepNumbers = stepMatches.map((m) => parseInt(m[1], 10));

    expect(stepNumbers.length, 'No steps found in shipit.md').toBeGreaterThan(0);

    // Check starts at 1
    expect(stepNumbers[0], 'Steps should start at 1').toBe(1);

    // Check sequential (no gaps)
    for (let i = 1; i < stepNumbers.length; i++) {
      expect(
        stepNumbers[i],
        `Step numbering gap: found Step ${stepNumbers[i - 1]} then Step ${stepNumbers[i]} (expected ${stepNumbers[i - 1] + 1})`
      ).toBe(stepNumbers[i - 1] + 1);
    }
  });
});

describe('Orchestrate skill pre-flight and memory references', () => {
  const orchestrateContent = readFile(path.join(COMMANDS_DIR, 'orchestrate.md'));

  it('contains a Pre-Flight Check section', () => {
    expect(orchestrateContent).toContain('Pre-Flight Check');
  });

  it('references agents/orchestrator.md', () => {
    expect(orchestrateContent).toContain('agents/orchestrator.md');
  });

  it('references memory/agent/orchestrator.md', () => {
    expect(orchestrateContent).toContain('memory/agent/orchestrator.md');
  });

  it('references shared memory files', () => {
    expect(orchestrateContent).toContain('memory/shared/');
  });
});
