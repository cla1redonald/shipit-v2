/**
 * Eliminated Concepts Tests
 *
 * Validates that no ShipIt files reference concepts that were deliberately
 * removed. These concepts appearing in files is a bug.
 *
 * Source: "Eliminated Concepts" table in CLAUDE.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { ROOT, listMdFiles } from './helpers';

/**
 * Directories to scan for eliminated concepts.
 * We check agents/, commands/, memory/, docs/, and root md files.
 */
function getAllShipItMdFiles(): string[] {
  const files: string[] = [];

  const dirsToScan = [
    path.join(ROOT, 'agents'),
    path.join(ROOT, 'commands'),
    path.join(ROOT, 'memory', 'agent'),
    path.join(ROOT, 'memory', 'shared'),
    path.join(ROOT, 'docs'),
  ];

  for (const dir of dirsToScan) {
    files.push(...listMdFiles(dir));
  }

  // Root .md files
  const rootMdFiles = ['CLAUDE.md', 'SOUL.md', 'README.md']
    .map((f) => path.join(ROOT, f))
    .filter((f) => fs.existsSync(f));
  files.push(...rootMdFiles);

  return files;
}

/**
 * Eliminated concepts with their exact search strings and context about
 * where they're allowed (e.g., the CLAUDE.md table defining them is fine).
 */
const ELIMINATED_CONCEPTS: Array<{
  name: string;
  patterns: string[];
  // Files where these patterns are legitimately found (e.g., the definition table)
  allowedFiles: string[];
  // Content that makes the occurrence "legitimate" (i.e., it's being documented as eliminated)
  legitimateContext?: string;
}> = [
  {
    name: 'HANDOFF.md reference',
    patterns: ['HANDOFF.md'],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
  {
    name: '.shipit/ state directory',
    patterns: ['.shipit/'],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
  {
    name: 'shipit-sdk/ TypeScript SDK',
    patterns: ['shipit-sdk/'],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
  {
    name: 'Eliminated skill commands',
    patterns: [
      '/shipit-init',
      '/shipit-resume',
      '/shipit-handoff',
      '/shipit-status',
      '/shipit-mail',
    ],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
  {
    name: '.claude/commands/ bridge files',
    patterns: ['.claude/commands/'],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
  {
    name: 'lessons-learned.md (single file pattern)',
    patterns: ['lessons-learned.md'],
    allowedFiles: ['CLAUDE.md'],
    legitimateContext: 'Eliminated Concept',
  },
];

describe('Eliminated Concepts — not referenced in ShipIt files', () => {
  const allFiles = getAllShipItMdFiles();

  for (const concept of ELIMINATED_CONCEPTS) {
    describe(`"${concept.name}" does not appear in ShipIt files`, () => {
      it.each(concept.patterns)('pattern "%s" is not present outside allowed files', (pattern) => {
        const violations: string[] = [];

        for (const filePath of allFiles) {
          const fileName = path.basename(filePath);
          const isAllowedFile = concept.allowedFiles.some((allowed) =>
            filePath.endsWith(allowed)
          );

          if (!fs.existsSync(filePath)) continue;

          const content = fs.readFileSync(filePath, 'utf-8');
          if (!content.includes(pattern)) continue;

          // If this is an allowed file, check whether the occurrence is in a
          // legitimate context (the definition/elimination table).
          if (isAllowedFile && concept.legitimateContext) {
            // Find lines containing the pattern and check if they're near the legitimate context
            const lines = content.split('\n');
            let inLegitimateSection = false;

            for (const line of lines) {
              if (line.includes(concept.legitimateContext)) {
                inLegitimateSection = true;
              }
              if (inLegitimateSection && line.includes(pattern)) {
                // This is a legitimate occurrence (in the "Eliminated Concepts" table)
                break;
              }
              // If we hit the pattern before the legitimate context section, it's a violation
              if (!inLegitimateSection && line.includes(pattern)) {
                violations.push(
                  `${path.relative(ROOT, filePath)}: "${pattern}" found outside legitimate context`
                );
                break;
              }
            }
          } else if (!isAllowedFile) {
            violations.push(`${path.relative(ROOT, filePath)}: "${pattern}" found`);
          }
        }

        expect(
          violations,
          `Eliminated concept "${pattern}" found in:\n${violations.join('\n')}`
        ).toHaveLength(0);
      });
    });
  }
});

describe('Quality gates are numbered sequentially', () => {
  it('quality-gates.md primary gates (Gate 1 through N) are sequential with no gaps', () => {
    const qualityGatesPath = path.join(ROOT, 'docs', 'quality-gates.md');
    if (!fs.existsSync(qualityGatesPath)) {
      return;
    }

    const content = fs.readFileSync(qualityGatesPath, 'utf-8');

    // Find all "## Gate N:" headings (any number including 0)
    const gateMatches = [...content.matchAll(/^## Gate (\d+):/gm)];
    const gateNumbers = gateMatches.map((m) => parseInt(m[1], 10)).sort((a, b) => a - b);

    expect(gateNumbers.length, 'No gates found in quality-gates.md').toBeGreaterThan(0);

    // Primary gates start at 1. Gate 0 is a special "Platform Feature Verification"
    // gate for ShipIt development — it is allowed to exist and does not need to be first.
    const primaryGates = gateNumbers.filter((n) => n >= 1).sort((a, b) => a - b);

    expect(primaryGates.length, 'No primary gates (Gate 1+) found in quality-gates.md').toBeGreaterThan(0);
    expect(primaryGates[0], 'Primary gates should start at 1').toBe(1);

    // Check sequential (no gaps) within primary gates
    for (let i = 1; i < primaryGates.length; i++) {
      expect(
        primaryGates[i],
        `Gate numbering gap after Gate ${primaryGates[i - 1]}: found Gate ${primaryGates[i]}`
      ).toBe(primaryGates[i - 1] + 1);
    }
  });

  it('quality-gates.md has Gates 1 through 6', () => {
    const qualityGatesPath = path.join(ROOT, 'docs', 'quality-gates.md');
    if (!fs.existsSync(qualityGatesPath)) {
      return;
    }

    const content = fs.readFileSync(qualityGatesPath, 'utf-8');
    const gateMatches = [...content.matchAll(/^## Gate (\d+):/gm)];
    const gateNumbers = gateMatches.map((m) => parseInt(m[1], 10));

    for (let gate = 1; gate <= 6; gate++) {
      expect(
        gateNumbers,
        `quality-gates.md is missing Gate ${gate}`
      ).toContain(gate);
    }
  });
});
