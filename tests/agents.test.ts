/**
 * Agent Definition Integrity Tests
 *
 * Validates that every agent file has correct YAML frontmatter,
 * uses valid model identifiers, and is consistently referenced
 * across CLAUDE.md and the orchestrator.
 */

import * as path from 'path';
import { describe, it, expect } from 'vitest';
import {
  ROOT,
  parseFrontmatter,
  listMdFiles,
  readFile,
  fileExists,
  parseMarkdownTable,
} from './helpers';

const AGENTS_DIR = path.join(ROOT, 'agents');
const CLAUDE_MD = path.join(ROOT, 'CLAUDE.md');
const ORCHESTRATOR_MD = path.join(AGENTS_DIR, 'orchestrator.md');

const VALID_MODELS = ['opus', 'sonnet', 'haiku'] as const;

// The 12 agents that CLAUDE.md documents
const EXPECTED_AGENTS = [
  'orchestrator',
  'researcher',
  'strategist',
  'pm',
  'architect',
  'designer',
  'engineer',
  'devsecops',
  'reviewer',
  'qa',
  'docs',
  'retro',
];

describe('Agent Definition Integrity', () => {
  const agentFiles = listMdFiles(AGENTS_DIR);

  it('finds agent files in agents/ directory', () => {
    expect(agentFiles.length).toBeGreaterThan(0);
  });

  it('has all 12 expected agent files', () => {
    const agentNames = agentFiles.map((f) => path.basename(f, '.md'));
    for (const expected of EXPECTED_AGENTS) {
      expect(agentNames, `Missing agent file: agents/${expected}.md`).toContain(expected);
    }
  });

  describe.each(agentFiles.map((f) => [path.basename(f, '.md'), f]))(
    'agents/%s.md frontmatter',
    (name, filePath) => {
      let content: string;
      let frontmatter: Record<string, string> | null;

      beforeEach(() => {
        content = readFile(filePath);
        frontmatter = parseFrontmatter(content);
      });

      it('has YAML frontmatter', () => {
        expect(frontmatter, `${name}.md is missing YAML frontmatter`).not.toBeNull();
      });

      it('has required field: name', () => {
        expect(frontmatter?.name, `${name}.md is missing "name" field`).toBeTruthy();
      });

      it('has required field: model', () => {
        expect(frontmatter?.model, `${name}.md is missing "model" field`).toBeTruthy();
      });

      it('has required field: tools', () => {
        expect(frontmatter?.tools, `${name}.md is missing "tools" field`).toBeTruthy();
      });

      it('has a valid model value', () => {
        const model = frontmatter?.model as string;
        expect(
          VALID_MODELS,
          `${name}.md has invalid model "${model}" — must be one of: ${VALID_MODELS.join(', ')}`
        ).toContain(model);
      });

      it('name field matches filename', () => {
        expect(
          frontmatter?.name,
          `${name}.md name field "${frontmatter?.name}" does not match filename "${name}"`
        ).toBe(name);
      });
    }
  );
});

describe('Model Consistency — CLAUDE.md vs agent YAML', () => {
  const claudeContent = readFile(CLAUDE_MD);

  // Parse the agent table from CLAUDE.md
  // Table header is "| Agent | Model | Use For |" — use multi-word hint for precision
  const claudeAgentRows = parseMarkdownTable(claudeContent, 'Agent | Model | Use For');

  it('CLAUDE.md agent table has rows', () => {
    expect(claudeAgentRows.length).toBeGreaterThan(0);
  });

  it.each(claudeAgentRows)(
    'CLAUDE.md model for @%s matches agent YAML',
    (rawAgent, claudeModel) => {
      // Cell may be like "`@orchestrator`" or "`@researcher`"
      const agentName = rawAgent.replace(/[`@]/g, '').trim();
      const agentFile = path.join(AGENTS_DIR, `${agentName}.md`);

      // Skip rows that don't correspond to agent files (e.g., header artifacts)
      if (!fileExists(agentFile)) return;

      const agentContent = readFile(agentFile);
      const frontmatter = parseFrontmatter(agentContent);

      expect(
        frontmatter?.model,
        `Model mismatch for @${agentName}: CLAUDE.md says "${claudeModel}", ${agentName}.md YAML says "${frontmatter?.model}"`
      ).toBe(claudeModel);
    }
  );
});

describe('Model Consistency — orchestrator.md agent table vs agent YAML', () => {
  const orchestratorContent = readFile(ORCHESTRATOR_MD);

  // The orchestrator lists agents in a table with header "Agent | Model | Best For"
  const orchestratorAgentRows = parseMarkdownTable(orchestratorContent, 'Agent');

  it('orchestrator.md agent table has rows', () => {
    expect(orchestratorAgentRows.length).toBeGreaterThan(0);
  });

  it.each(orchestratorAgentRows)(
    'orchestrator.md model for @%s matches agent YAML',
    (rawAgent, orchModel) => {
      const agentName = rawAgent.replace(/[`@]/g, '').trim();
      const agentFile = path.join(AGENTS_DIR, `${agentName}.md`);

      if (!fileExists(agentFile)) return;

      const agentContent = readFile(agentFile);
      const frontmatter = parseFrontmatter(agentContent);

      expect(
        frontmatter?.model,
        `Model mismatch for @${agentName}: orchestrator.md says "${orchModel}", ${agentName}.md YAML says "${frontmatter?.model}"`
      ).toBe(orchModel);
    }
  );
});

describe('Model Consistency — CLAUDE.md vs orchestrator.md', () => {
  const claudeContent = readFile(CLAUDE_MD);
  const orchestratorContent = readFile(ORCHESTRATOR_MD);

  const claudeRows = parseMarkdownTable(claudeContent, 'Agent | Model | Use For');
  const orchRows = parseMarkdownTable(orchestratorContent, 'Agent | Model | Best For');

  // Build maps for comparison: agentName -> model
  const claudeMap: Record<string, string> = {};
  for (const [rawAgent, model] of claudeRows) {
    const name = rawAgent.replace(/[`@]/g, '').trim();
    if (name) claudeMap[name] = model;
  }

  const orchMap: Record<string, string> = {};
  for (const [rawAgent, model] of orchRows) {
    const name = rawAgent.replace(/[`@]/g, '').trim();
    if (name) orchMap[name] = model;
  }

  it('every agent in orchestrator.md matches CLAUDE.md model', () => {
    for (const [agentName, orchModel] of Object.entries(orchMap)) {
      if (claudeMap[agentName]) {
        expect(
          orchModel,
          `Model mismatch for @${agentName}: CLAUDE.md="${claudeMap[agentName]}", orchestrator.md="${orchModel}"`
        ).toBe(claudeMap[agentName]);
      }
    }
  });
});

describe('Cross-Reference: CLAUDE.md agent table vs agents/ files', () => {
  const claudeContent = readFile(CLAUDE_MD);
  // Use multi-word hint to avoid matching other tables in CLAUDE.md
  const claudeRows = parseMarkdownTable(claudeContent, 'Agent | Model | Use For');
  const agentFiles = listMdFiles(AGENTS_DIR);
  const agentFileNames = agentFiles.map((f) => path.basename(f, '.md'));

  it('every agent in CLAUDE.md table has a file in agents/', () => {
    for (const [rawAgent] of claudeRows) {
      const agentName = rawAgent.replace(/[`@]/g, '').trim();
      if (!agentName) continue;
      expect(
        agentFileNames,
        `CLAUDE.md references @${agentName} but agents/${agentName}.md does not exist`
      ).toContain(agentName);
    }
  });

  it('every agent file in agents/ is referenced in CLAUDE.md', () => {
    const agentNamesInClaude = claudeRows
      .map(([rawAgent]) => rawAgent.replace(/[`@]/g, '').trim())
      .filter(Boolean);

    for (const fileName of agentFileNames) {
      expect(
        agentNamesInClaude,
        `agents/${fileName}.md exists but is not listed in CLAUDE.md agent table`
      ).toContain(fileName);
    }
  });
});
