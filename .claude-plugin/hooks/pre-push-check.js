#!/usr/bin/env node

/**
 * ShipIt v2 — Gate 4: Pre-Push Check Hook
 *
 * Runs before Bash commands. Only activates on `git push` commands.
 * Checks:
 *   1. No conflict markers in source files
 *   2. Tests pass (npm test)
 *   3. Build succeeds (npm run build)
 *
 * Exit 0 = allow, Exit 2 = block with message
 */

const { execSync } = require('child_process');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const command = data.tool_input?.command || '';

  // Only check on git push commands
  if (!command.match(/\bgit\s+push\b/)) {
    process.exit(0);
  }

  const errors = [];

  // Check 1: No conflict markers in source files
  try {
    const result = execSync(
      'grep -rn "^<<<<<<<\\|^=======\\|^>>>>>>>" src/ app/ components/ lib/ 2>/dev/null || true',
      { encoding: 'utf8', timeout: 5000 }
    );
    if (result.trim()) {
      errors.push(`Conflict markers found in source files:\n${result.trim()}`);
    }
  } catch (e) {
    // grep found nothing or directories don't exist — that's fine
  }

  // Check 2: Tests pass
  try {
    execSync('npm test -- --run 2>/dev/null || npm test 2>/dev/null', {
      encoding: 'utf8',
      timeout: 30000,
      stdio: 'pipe'
    });
  } catch (e) {
    // Only block if there IS a test script but it failed
    try {
      const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
      if (pkg.scripts?.test) {
        errors.push('Tests are failing. Run `npm test` and fix before pushing.');
      }
    } catch (_) {
      // No package.json — skip test check
    }
  }

  // Check 3: Build succeeds
  try {
    const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
    if (pkg.scripts?.build) {
      execSync('npm run build', {
        encoding: 'utf8',
        timeout: 60000,
        stdio: 'pipe'
      });
    }
  } catch (e) {
    errors.push('Build is failing. Run `npm run build` and fix before pushing.');
  }

  if (errors.length > 0) {
    process.stderr.write(`[ShipIt Gate 4] Push blocked:\n\n${errors.join('\n\n')}\n`);
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
