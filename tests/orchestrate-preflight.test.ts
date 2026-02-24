/**
 * Orchestrator Pre-Flight Tests
 *
 * Validates that the orchestrate skill contains all required sections
 * and references that the pre-flight check depends on.
 */

import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { ROOT, readFile, fileExists } from './helpers';

const ORCHESTRATE_MD = path.join(ROOT, 'commands', 'orchestrate.md');
const ORCHESTRATOR_AGENT_MD = path.join(ROOT, 'agents', 'orchestrator.md');

describe('Orchestrate skill — Pre-Flight Check', () => {
  const content = readFile(ORCHESTRATE_MD);

  it('contains a "Pre-Flight Check" section (labeled as MANDATORY)', () => {
    expect(content).toMatch(/Pre-Flight Check.*MANDATORY/i);
  });

  it('warns about running on non-Opus model', () => {
    expect(content).toMatch(/opus/i);
    expect(content).toMatch(/WARNING|warn/i);
  });

  it('checks for CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS setting', () => {
    expect(content).toContain('CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS');
  });
});

describe('Orchestrate skill — Step references', () => {
  const content = readFile(ORCHESTRATE_MD);

  it('Step 1 instructs reading agents/orchestrator.md', () => {
    // Step 1 should reference orchestrator.md
    expect(content).toContain('agents/orchestrator.md');
  });

  it('Step 2 instructs reading memory/agent/orchestrator.md', () => {
    expect(content).toContain('memory/agent/orchestrator.md');
  });

  it('Step 3 instructs reading shared memory files', () => {
    expect(content).toContain('memory/shared/core-principles.md');
    expect(content).toContain('memory/shared/tech-stack-defaults.md');
  });

  it('process steps are numbered sequentially', () => {
    const stepMatches = [...content.matchAll(/\*\*Step (\d+):/g)];
    const stepNumbers = stepMatches.map((m) => parseInt(m[1], 10));

    expect(stepNumbers.length, 'No process steps found in orchestrate.md').toBeGreaterThan(0);

    // Check starts at 1
    expect(stepNumbers[0], 'Steps should start at 1').toBe(1);

    // Check sequential
    for (let i = 1; i < stepNumbers.length; i++) {
      expect(
        stepNumbers[i],
        `Step gap: found Step ${stepNumbers[i - 1]} then Step ${stepNumbers[i]}`
      ).toBe(stepNumbers[i - 1] + 1);
    }
  });
});

describe('Orchestrator agent — SUBPROCESS FAIL-SAFE', () => {
  const content = readFile(ORCHESTRATOR_AGENT_MD);

  it('contains subprocess fail-safe section', () => {
    expect(content).toMatch(/SUBPROCESS FAIL-SAFE/i);
  });

  it('explicitly states orchestrator cannot delegate as subprocess', () => {
    expect(content).toContain('cannot delegate');
  });

  it('instructs to use /orchestrate skill instead of Task tool spawn', () => {
    expect(content).toContain('/orchestrate');
  });
});

describe('Orchestrator agent — model passthrough requirement', () => {
  const content = readFile(ORCHESTRATOR_AGENT_MD);

  it('documents model passthrough as MANDATORY', () => {
    expect(content).toMatch(/Model Passthrough.*MANDATORY/i);
  });

  it('shows example with model: "opus" for architect', () => {
    expect(content).toContain('model: "opus"');
  });

  it('shows example with model: "sonnet" for engineer', () => {
    expect(content).toContain('model: "sonnet"');
  });

  it('shows example with model: "haiku" for researcher', () => {
    expect(content).toContain('model: "haiku"');
  });
});
