/**
 * Plugin Configuration Tests
 *
 * Validates that plugin.json, marketplace.json, and hooks.json are valid JSON
 * with required fields, and that all hook scripts referenced in hooks.json exist.
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { ROOT, fileExists } from './helpers';

const PLUGIN_JSON = path.join(ROOT, '.claude-plugin', 'plugin.json');
const MARKETPLACE_JSON = path.join(ROOT, '.claude-plugin', 'marketplace.json');
const HOOKS_JSON = path.join(ROOT, 'hooks', 'hooks.json');
const HOOKS_DIR = path.join(ROOT, 'hooks');

describe('plugin.json', () => {
  it('file exists', () => {
    expect(fileExists(PLUGIN_JSON), '.claude-plugin/plugin.json does not exist').toBe(true);
  });

  it('is valid JSON', () => {
    const raw = fs.readFileSync(PLUGIN_JSON, 'utf-8');
    expect(() => JSON.parse(raw), '.claude-plugin/plugin.json is not valid JSON').not.toThrow();
  });

  it('has required field: name', () => {
    const data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    expect(data.name, 'plugin.json is missing "name" field').toBeTruthy();
  });

  it('has required field: commands', () => {
    const data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    expect(data.commands, 'plugin.json is missing "commands" field').toBeTruthy();
  });

  it('has required field: agents', () => {
    const data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    expect(data.agents, 'plugin.json is missing "agents" field').toBeTruthy();
  });

  it('commands path resolves to an existing directory', () => {
    const data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    // plugin.json paths are relative to the plugin root (repo root), not to .claude-plugin/
    const commandsDir = path.resolve(ROOT, data.commands);
    expect(
      fileExists(commandsDir),
      `plugin.json commands path "${data.commands}" does not resolve to an existing directory (resolved: ${commandsDir})`
    ).toBe(true);
  });

  it('agents path resolves to an existing directory', () => {
    const data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    // plugin.json paths are relative to the plugin root (repo root), not to .claude-plugin/
    const agentsDir = path.resolve(ROOT, data.agents);
    expect(
      fileExists(agentsDir),
      `plugin.json agents path "${data.agents}" does not resolve to an existing directory (resolved: ${agentsDir})`
    ).toBe(true);
  });
});

describe('marketplace.json', () => {
  it('file exists', () => {
    expect(fileExists(MARKETPLACE_JSON), '.claude-plugin/marketplace.json does not exist').toBe(
      true
    );
  });

  it('is valid JSON', () => {
    const raw = fs.readFileSync(MARKETPLACE_JSON, 'utf-8');
    expect(
      () => JSON.parse(raw),
      '.claude-plugin/marketplace.json is not valid JSON'
    ).not.toThrow();
  });

  it('has required field: name', () => {
    const data = JSON.parse(fs.readFileSync(MARKETPLACE_JSON, 'utf-8'));
    expect(data.name, 'marketplace.json is missing "name" field').toBeTruthy();
  });
});

describe('hooks/hooks.json', () => {
  it('file exists', () => {
    expect(fileExists(HOOKS_JSON), 'hooks/hooks.json does not exist').toBe(true);
  });

  it('is valid JSON', () => {
    const raw = fs.readFileSync(HOOKS_JSON, 'utf-8');
    expect(() => JSON.parse(raw), 'hooks/hooks.json is not valid JSON').not.toThrow();
  });

  it('has a "hooks" top-level key', () => {
    const data = JSON.parse(fs.readFileSync(HOOKS_JSON, 'utf-8'));
    expect(data.hooks, 'hooks.json is missing "hooks" top-level key').toBeTruthy();
  });

  it('all hook script files referenced in hooks.json exist', () => {
    const raw = fs.readFileSync(HOOKS_JSON, 'utf-8');
    const hooksJson = JSON.parse(raw);

    // Find all command strings that reference hook files
    // Pattern: "node ${CLAUDE_PLUGIN_ROOT}/hooks/filename.js"
    const jsonText = JSON.stringify(hooksJson);
    const hookFileRefs = [...jsonText.matchAll(/hooks\/([\w-]+\.js)/g)].map((m) => m[1]);

    expect(hookFileRefs.length, 'No hook script references found in hooks.json').toBeGreaterThan(
      0
    );

    for (const hookFile of [...new Set(hookFileRefs)]) {
      const fullPath = path.join(HOOKS_DIR, hookFile);
      expect(
        fileExists(fullPath),
        `hooks.json references "${hookFile}" but hooks/${hookFile} does not exist`
      ).toBe(true);
    }
  });
});
