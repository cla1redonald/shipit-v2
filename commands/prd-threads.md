---
description: Convert a PRD into discrete, executable threads optimized for AI pair programming and parallel agent execution. Use when breaking down a PRD into implementable work units.
argument-hint: Path to PRD file
---

# PRD Threads

Convert a PRD into discrete, executable threads optimized for AI pair programming.

## When to Use

Use `/prd-threads` when:
- You have a completed PRD and want to break it into executable work units
- You want to optimize by assigning reasoning levels and models
- You need self-contained threads that can be done in single conversations
- You're preparing work for Agent Teams parallel execution

## What This Skill Does

1. **Analyzes the PRD** - Understands the full scope and dependencies
2. **Identifies natural boundaries** - Finds logical breakpoints between work units
3. **Creates threads** - Generates self-contained, executable threads
4. **Assigns reasoning levels** - Maps each thread to appropriate model capability
5. **Establishes sequence** - Orders threads, identifies parallelizable work

## Thread Structure

Each generated thread follows this format:

```markdown
### Thread [N]: [Name]
**Purpose:** [Single sentence describing what this accomplishes]

**Actions:**
- [ ] Specific action 1
- [ ] Specific action 2

**Reference Material:**
- `path/to/file.ts:10-50` - [Why relevant]
- `path/to/other.tsx` - [Context needed]

**Validation Targets:**
- [ ] [How to verify completion]

**Deliverables:**
- [What this thread produces]

**Reasoning Level:** [Level] ([Model])
**Rationale:** [Why this complexity level]

**Dependencies:** [Prior threads required, or "None"]
**Parallelizable:** [Yes/No — can this run alongside other threads?]
```

## Reasoning Level Assignment

Reference: `docs/reasoning-levels.md`

| Level | Model | Characteristics |
|-------|-------|-----------------|
| Minimal | Haiku | Single file, procedural, no decisions |
| Low | Haiku/Sonnet | 2-3 files, established patterns |
| Medium | Sonnet | Cross-component, refactoring, business logic |
| Medium-High | Sonnet/Opus | Architecture decisions, policy implementation |
| High | Opus | Novel problems, security-sensitive |

## Process

1. **Read the PRD** - Understand scope, requirements, and constraints
2. **Identify features/components** - List all work items
3. **Group related work** - Combine minimal tasks, isolate complex ones
4. **Determine dependencies** - What must happen before what?
5. **Identify parallel opportunities** - Which threads can run simultaneously in Agent Teams?
6. **Assign reasoning levels** - Use the framework above
7. **Generate threads** - Create self-contained units with all context
8. **Validate coverage** - Ensure all PRD requirements are covered

## Guidelines

### Do
- Make threads independent where possible
- Include ALL context needed in each thread
- Use specific file:line references, not vague pointers
- Batch minimal tasks together
- Isolate high-reasoning work into dedicated threads
- Mark parallelizable threads for Agent Teams execution
- Order threads to minimize blocking

### Don't
- Create threads that are too large ("build the frontend")
- Create threads that are too small ("add a button")
- Mix complexity levels in one thread
- Assume context carries between threads
- Skip reasoning level assignment
- Forget to specify deliverables

## Output Format

```markdown
## Thread Plan: [Project Name]

**Total Threads:** [N]
**Parallelizable:** [N] threads can run simultaneously
**Estimated Breakdown:**
- Minimal/Low: [count] threads
- Medium: [count] threads
- Medium-High/High: [count] threads

### Execution Order
1. Thread 1 (no dependencies)
2. Thread 2 (depends on 1)
3. Thread 3 (no dependencies - can parallel with 2)
...

---

### Thread 1: [Name]
[Full thread structure...]

### Thread 2: [Name]
[Full thread structure...]

---

## Validation Checklist
- [ ] All PRD requirements covered
- [ ] No thread exceeds single-conversation scope
- [ ] Dependencies are explicit
- [ ] Reasoning levels assigned to all threads
- [ ] Parallel opportunities identified
- [ ] File references are specific
```

## Reference Files

- `docs/prd-template.md` - Source PRD format
- `docs/reasoning-levels.md` - Complexity assessment guide
