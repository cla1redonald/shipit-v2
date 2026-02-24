/**
 * Memory File Integrity Tests
 *
 * Validates that every agent has a memory file, that shared memory files
 * exist, and that files referenced in skills actually exist on disk.
 */

import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { ROOT, listMdFiles, readFile, fileExists } from './helpers';

const AGENTS_DIR = path.join(ROOT, 'agents');
const MEMORY_AGENT_DIR = path.join(ROOT, 'memory', 'agent');
const MEMORY_SHARED_DIR = path.join(ROOT, 'memory', 'shared');
const COMMANDS_DIR = path.join(ROOT, 'commands');

// Shared memory files expected to exist (referenced throughout the framework)
const EXPECTED_SHARED_MEMORY = [
  'core-principles.md',
  'common-mistakes.md',
  'expert-frameworks.md',
  'memory-protocol.md',
  'tech-stack-defaults.md',
];

describe('Agent memory files', () => {
  const agentFiles = listMdFiles(AGENTS_DIR);
  const agentNames = agentFiles.map((f) => path.basename(f, '.md'));

  it('memory/agent/ directory exists', () => {
    expect(fileExists(MEMORY_AGENT_DIR), 'memory/agent/ directory does not exist').toBe(true);
  });

  it.each(agentNames)(
    'agents/%s.md has a corresponding memory/agent/%s.md with content',
    (agentName) => {
      const memoryFile = path.join(MEMORY_AGENT_DIR, `${agentName}.md`);
      expect(
        fileExists(memoryFile),
        `memory/agent/${agentName}.md does not exist (every agent needs a memory file)`
      ).toBe(true);

      const content = readFile(memoryFile);
      // Memory files must have real content, not just a placeholder
      expect(
        content.length,
        `memory/agent/${agentName}.md exists but is empty or too short (${content.length} bytes)`
      ).toBeGreaterThan(100);
      expect(
        content,
        `memory/agent/${agentName}.md has no section headings (## ) — likely a placeholder`
      ).toMatch(/^## /m);
    }
  );
});

describe('Shared memory files', () => {
  it('memory/shared/ directory exists', () => {
    expect(fileExists(MEMORY_SHARED_DIR), 'memory/shared/ directory does not exist').toBe(true);
  });

  it.each(EXPECTED_SHARED_MEMORY)(
    'memory/shared/%s exists',
    (fileName) => {
      const filePath = path.join(MEMORY_SHARED_DIR, fileName);
      expect(
        fileExists(filePath),
        `memory/shared/${fileName} does not exist`
      ).toBe(true);
    }
  );
});

describe('Memory files referenced in orchestrate.md exist', () => {
  const orchestrateContent = readFile(path.join(COMMANDS_DIR, 'orchestrate.md'));

  // Extract all memory/shared/*.md references
  const memoryRefs = [...orchestrateContent.matchAll(/memory\/shared\/([\w-]+\.md)/g)].map(
    (m) => m[1]
  );

  it('orchestrate.md references at least one shared memory file', () => {
    expect(memoryRefs.length).toBeGreaterThan(0);
  });

  it.each([...new Set(memoryRefs)])(
    'memory/shared/%s (referenced in orchestrate.md) exists',
    (fileName) => {
      const filePath = path.join(MEMORY_SHARED_DIR, fileName);
      expect(
        fileExists(filePath),
        `memory/shared/${fileName} is referenced in orchestrate.md but does not exist`
      ).toBe(true);
    }
  );
});
