/**
 * Plugin Configuration Tests
 *
 * Validates that plugin.json, marketplace.json, and hooks.json are valid JSON
 * with required fields, and that all hook scripts referenced in hooks.json exist.
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import { ROOT, fileExists } from './helpers';

const PLUGIN_JSON = path.join(ROOT, '.claude-plugin', 'plugin.json');
const MARKETPLACE_JSON = path.join(ROOT, '.claude-plugin', 'marketplace.json');
const HOOKS_JSON = path.join(ROOT, 'hooks', 'hooks.json');
const HOOKS_DIR = path.join(ROOT, 'hooks');

describe('plugin.json', () => {
  let data: Record<string, unknown>;

  beforeAll(() => {
    data = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
  });

  it('file exists', () => {
    expect(fileExists(PLUGIN_JSON), '.claude-plugin/plugin.json does not exist').toBe(true);
  });

  it('is valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'))).not.toThrow();
  });

  it('has required field: name', () => {
    expect(data.name, 'plugin.json is missing "name" field').toBeTruthy();
  });

  it('has required field: commands', () => {
    expect(data.commands, 'plugin.json is missing "commands" field').toBeTruthy();
  });

  it('has required field: agents', () => {
    expect(data.agents, 'plugin.json is missing "agents" field').toBeTruthy();
  });

  it('commands path resolves to an existing directory', () => {
    const commandsDir = path.resolve(ROOT, data.commands as string);
    expect(
      fileExists(commandsDir),
      `plugin.json commands path "${data.commands}" does not resolve to an existing directory`
    ).toBe(true);
  });

  it('agents path resolves to an existing directory', () => {
    const agentsDir = path.resolve(ROOT, data.agents as string);
    expect(
      fileExists(agentsDir),
      `plugin.json agents path "${data.agents}" does not resolve to an existing directory`
    ).toBe(true);
  });
});

describe('marketplace.json', () => {
  let data: Record<string, unknown>;

  beforeAll(() => {
    data = JSON.parse(fs.readFileSync(MARKETPLACE_JSON, 'utf-8'));
  });

  it('file exists', () => {
    expect(fileExists(MARKETPLACE_JSON), '.claude-plugin/marketplace.json does not exist').toBe(
      true
    );
  });

  it('is valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(MARKETPLACE_JSON, 'utf-8'))).not.toThrow();
  });

  it('has required field: name', () => {
    expect(data.name, 'marketplace.json is missing "name" field').toBeTruthy();
  });

  it('has plugins array with at least one entry', () => {
    const plugins = data.plugins as Array<Record<string, unknown>>;
    expect(plugins?.length, 'marketplace.json plugins array is empty').toBeGreaterThan(0);
  });

  it('first plugin has a source field', () => {
    const plugins = data.plugins as Array<Record<string, unknown>>;
    expect(plugins?.[0]?.source, 'marketplace.json first plugin is missing "source" field').toBeTruthy();
  });
});

describe('hooks/hooks.json', () => {
  let hooksJson: Record<string, unknown>;

  beforeAll(() => {
    hooksJson = JSON.parse(fs.readFileSync(HOOKS_JSON, 'utf-8'));
  });

  it('file exists', () => {
    expect(fileExists(HOOKS_JSON), 'hooks/hooks.json does not exist').toBe(true);
  });

  it('is valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(HOOKS_JSON, 'utf-8'))).not.toThrow();
  });

  it('has a "hooks" top-level key', () => {
    expect(hooksJson.hooks, 'hooks.json is missing "hooks" top-level key').toBeTruthy();
  });

  it('all hook script files referenced in hooks.json exist', () => {
    const jsonText = JSON.stringify(hooksJson);
    const hookFileRefs = [...jsonText.matchAll(/hooks\/([\w-]+\.js)/g)].map((m) => m[1]);

    expect(hookFileRefs.length, 'No hook script references found in hooks.json').toBeGreaterThan(0);

    for (const hookFile of [...new Set(hookFileRefs)]) {
      const fullPath = path.join(HOOKS_DIR, hookFile);
      expect(
        fileExists(fullPath),
        `hooks.json references "${hookFile}" but hooks/${hookFile} does not exist`
      ).toBe(true);
    }
  });
});
