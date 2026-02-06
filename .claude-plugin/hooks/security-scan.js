#!/usr/bin/env node

/**
 * ShipIt v2 — Gate 5: Security Scan Hook
 *
 * Runs before Bash commands. Only activates on production deploy commands.
 * Checks:
 *   1. No secrets in tracked files (.env, API keys, tokens)
 *   2. No hardcoded credentials in source code
 *   3. .env is in .gitignore
 *
 * Exit 0 = allow, Exit 2 = block with message
 * This is a HARD gate — blocks deploy on failure.
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const command = data.tool_input?.command || '';

  // Only check on production deploy commands
  const isProductionDeploy = command.match(/vercel\s+--prod/) ||
    command.match(/vercel\s+deploy\s+--prod/) ||
    command.match(/npm\s+run\s+deploy:prod/);

  if (!isProductionDeploy) {
    process.exit(0);
  }

  const errors = [];

  // Check 1: .env is in .gitignore
  try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
      errors.push('.env is NOT in .gitignore — secrets may be committed');
    }
  } catch (e) {
    errors.push('No .gitignore file found — create one with .env excluded');
  }

  // Check 2: No .env files tracked in git
  try {
    const tracked = execSync('git ls-files "*.env" ".env*" 2>/dev/null || true', {
      encoding: 'utf8',
      timeout: 5000
    });
    if (tracked.trim()) {
      errors.push(`Environment files tracked in git:\n${tracked.trim()}\nRemove with: git rm --cached <file>`);
    }
  } catch (e) {
    // Not a git repo or git not available — skip
  }

  // Check 3: No hardcoded secrets in source files
  try {
    const secretPatterns = [
      'sk-[a-zA-Z0-9]{20,}',           // OpenAI/Anthropic API keys
      'sk_live_[a-zA-Z0-9]{20,}',       // Stripe live keys
      'SUPABASE_SERVICE_ROLE_KEY\\s*=',  // Hardcoded Supabase service key
      'password\\s*=\\s*["\'][^"\']{8,}' // Hardcoded passwords
    ];
    const pattern = secretPatterns.join('\\|');
    const result = execSync(
      `grep -rn "${pattern}" src/ app/ components/ lib/ 2>/dev/null || true`,
      { encoding: 'utf8', timeout: 5000 }
    );
    if (result.trim()) {
      errors.push(`Possible hardcoded secrets in source code:\n${result.trim()}`);
    }
  } catch (e) {
    // Directories don't exist — skip
  }

  if (errors.length > 0) {
    process.stderr.write(`[ShipIt Gate 5] SECURITY — Deploy blocked:\n\n${errors.join('\n\n')}\n`);
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
