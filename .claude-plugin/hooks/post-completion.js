#!/usr/bin/env node

/**
 * ShipIt v2 — Gate 6: Post-Completion Verification Hook
 *
 * Runs on subagent Stop events (particularly @engineer).
 * Verifies that the agent's work meets minimum quality bar:
 *   1. Modified source files have corresponding test files
 *   2. Tests pass
 *   3. Build succeeds
 *
 * This is a SOFT gate for individual agents, HARD gate for ship-ready.
 * Exit 0 = allow, Exit 2 = block with message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  // This hook runs on Stop events — no tool_input to parse
  // Just verify the current state of the project

  const warnings = [];
  const errors = [];

  // Check 1: Do tests exist?
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.scripts?.test) {
      warnings.push('No test script in package.json — tests may not be configured');
    }
  } catch (e) {
    // No package.json — might not be in project root, skip
    process.exit(0);
  }

  // Check 2: Do tests pass?
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts?.test) {
      execSync('npm test -- --run 2>/dev/null || npm test 2>/dev/null', {
        encoding: 'utf8',
        timeout: 30000,
        stdio: 'pipe'
      });
    }
  } catch (e) {
    errors.push('Tests are failing. Fix before marking task as complete.');
  }

  // Check 3: Does the build pass?
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts?.build) {
      execSync('npm run build', {
        encoding: 'utf8',
        timeout: 60000,
        stdio: 'pipe'
      });
    }
  } catch (e) {
    errors.push('Build is failing. Fix before marking task as complete.');
  }

  // Check 4: Recently modified .ts/.tsx files have test files
  try {
    const modified = execSync('git diff --name-only HEAD~1 2>/dev/null || git diff --name-only --cached 2>/dev/null || true', {
      encoding: 'utf8',
      timeout: 5000
    });

    const sourceFiles = modified.split('\n')
      .filter(f => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('.test.') && !f.includes('.spec.') && !f.includes('__tests__'))
      .filter(f => f.startsWith('src/') || f.startsWith('app/') || f.startsWith('components/') || f.startsWith('lib/'));

    for (const file of sourceFiles) {
      const testFile = file.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
      const specFile = file.replace(/\.(ts|tsx|js|jsx)$/, '.spec.$1');
      const dir = path.dirname(file);
      const testDir = path.join(dir, '__tests__', path.basename(file));

      if (!fs.existsSync(testFile) && !fs.existsSync(specFile) && !fs.existsSync(testDir)) {
        warnings.push(`No test file for: ${file}`);
      }
    }
  } catch (e) {
    // Not in git or no commits — skip
  }

  // Output results
  if (errors.length > 0) {
    process.stderr.write(`[ShipIt Gate 6] Completion blocked:\n\n${errors.join('\n\n')}\n`);
    if (warnings.length > 0) {
      process.stderr.write(`\nWarnings:\n${warnings.join('\n')}\n`);
    }
    process.exit(2);
  }

  if (warnings.length > 0) {
    // Warnings don't block, but are surfaced
    process.stderr.write(`[ShipIt] Completion warnings:\n${warnings.join('\n')}\n`);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
