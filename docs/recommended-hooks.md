# Recommended Project Hooks

Hooks that projects built with ShipIt should configure in their own `.claude/settings.json`. These are for the **project** being built, not the ShipIt plugin itself.

ShipIt's plugin-level hooks (pre-push-check, security-scan, post-completion) handle quality gates. These project-level hooks handle development workflow improvements.

---

## How Hooks Work

Hooks are configured in the project's `.claude/settings.json` under the `"hooks"` key. Each hook:
- Receives input as **JSON via stdin** (parsed with `jq`)
- Returns exit code `0` to allow the action
- Returns exit code `2` to block the action (with stderr message shown to user)

**Important:** Hook input comes via stdin as JSON. Do NOT reference environment variables like `$CLAUDE_TOOL_INPUT_FILE_PATH` — that does not exist. Always parse stdin with `jq`.

---

## Hook 1: TypeScript Check After Edit/Write (Advisory)

Runs `tsc --noEmit` after any `.ts` or `.tsx` file is edited. Advisory only — does not block the edit.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | grep -qE '\\.(ts|tsx)$' && npx tsc --noEmit 2>&1 | head -20; exit 0"
          }
        ]
      }
    ]
  }
}
```

**What it does:** After any Edit or Write tool call, checks if the file is TypeScript. If so, runs the type checker and shows the first 20 lines of output. Always exits 0 (advisory).

---

## Hook 2: Auto-Format with Prettier (Advisory)

Runs Prettier on files after edits. Advisory only.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

**What it does:** After any Edit or Write, formats the file with Prettier. Always exits 0 (advisory). Fails silently if Prettier is not installed.

---

## Hook 3: Type Check Before Commit (Blocking)

Blocks `git commit` if TypeScript has errors. This catches type errors before they enter git history.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | grep -q 'git commit' && npx tsc --noEmit || exit 0; if [ $? -ne 0 ]; then echo 'TypeScript errors found. Fix before committing.' >&2; exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

**What it does:** Before any Bash tool call, checks if the command is `git commit`. If so, runs the type checker. If types fail, blocks the commit (exit 2). If the command is not a git commit, allows it (exit 0).

---

## Combined Configuration

To use all three hooks together in a project's `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | grep -qE '\\.(ts|tsx)$' && npx tsc --noEmit 2>&1 | head -20; exit 0"
          },
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null; exit 0"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | grep -q 'git commit' && npx tsc --noEmit || exit 0; if [ $? -ne 0 ]; then echo 'TypeScript errors found. Fix before committing.' >&2; exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

---

## Setup Instructions

@devsecops should configure these hooks during Phase 4 (Setup) as part of the project's development environment. Steps:

1. Check if the project has a `.claude/settings.json`
2. If not, create one with the hooks above
3. If it exists, merge the `hooks` key into the existing config
4. Verify hooks fire correctly by editing a `.ts` file and checking for type-check output

---

## Notes

- These hooks require `jq` to be installed (standard on macOS, install via `apt-get install jq` on Linux)
- Prettier must be in the project's `devDependencies` for Hook 2 to work
- TypeScript must be in the project's `devDependencies` for Hooks 1 and 3 to work
- All hooks parse stdin JSON — this is the official Claude Code hook input mechanism
