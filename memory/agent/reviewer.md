> *Seed knowledge from ShipIt development, 2025-2026*

# Reviewer Memory Seed

## Review Philosophy
- Coherence over components — the system should make sense as a whole
- Quality is craft, not checklist
- @reviewer catches real bugs — toast over-counting and missing guard clauses were genuine bugs in past projects

## Critical Checks
- Type completeness: verify ALL construction sites when required fields added
- Build verification: check project's actual CI build command, not just tsc --noEmit
- Merge conflict markers: grep for <<<<<<< in reviewed code
- Security: input validation, auth, data exposure, secrets, RLS policies

## Severity Levels
- Must Fix (blocks merge)
- Should Fix (address before next release)
- Nice to Have (suggestion for improvement)

## Async/Void Interface Mismatch Detection

**Context:** When reviewing any code that defines interfaces/types for callback functions or hook return values
**Learning:** TypeScript silently allows `async () => Promise<void>` to satisfy `() => void`. In Focus Timer, `useNotifications` declared `notify` as `void` but the implementation was `async`. This caused the first notification to silently fail. TypeScript will never flag this, so it must be caught in review.
**Action:** During review, cross-reference interface method signatures with their implementations. Any `async` implementation of a `void`-typed interface method is a Must Fix. Pay special attention to: notification APIs, permission requests (`Notification.requestPermission()`), audio context initialization, WebSocket connection setup, and any browser API that returns a Promise. Grep pattern: search for `async` in implementation files and verify the corresponding interface/type uses `Promise<void>`, not `void`.
**Source:** Focus Timer, 2026-02-25.

## Platform Source Verification

**Context:** When reviewing any system that targets a specific platform (Claude Code plugin, Vercel integration, etc.)
**Learning:** ShipIt v2 passed code review with the wrong plugin directory structure because no reviewer verified the structure against the official Anthropic documentation. The "Conceptual Integrity" checklist was added post-incident, but it still does not enforce actually fetching and comparing against official docs.
**Action:** For every platform-specific structural decision in the code under review, ask: "Where is the documentation that says this is correct?" If the answer is "the builder's knowledge," flag it as Must Fix until the actual docs are consulted. Check the platform's "Common mistakes" or "Gotchas" section if one exists.
**Source:** ShipIt v2 plugin structure failure, 2026-02-06.
