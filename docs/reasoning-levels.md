# Reasoning Levels Framework

> **Source:** Inspired by `jmichaelschmidt/skills-public` prd-planner skill. Adapted for ShipIt's multi-agent workflow.

This guide maps task complexity to appropriate AI model selection, balancing capability needs against token costs.

## The Five Reasoning Levels

### Minimal (Haiku)

**Characteristics:**
- Procedural tasks following clear patterns
- Single file modifications
- No architectural decisions needed
- Copy-paste with minor adjustments

**Examples:**
- Adding a column to an existing table
- Updating config values
- Documentation tweaks
- Renaming variables
- Adding a field to an existing form

**Guidance:** Batch multiple minimal tasks together in one thread.

---

### Low (Haiku/Sonnet)

**Characteristics:**
- Established patterns to follow
- 2-3 files involved
- Straightforward validation
- Clear input -> output

**Examples:**
- Adding a filter to an existing list page
- Creating a database index
- Adding a new route following existing patterns
- Implementing a simple CRUD endpoint
- Adding form validation (standard rules)

**Guidance:** Can often be combined with related minimal tasks.

---

### Medium (Sonnet)

**Characteristics:**
- Requires code comprehension
- Cross-component integration
- Refactoring existing logic
- Needs test coverage
- Business logic implementation

**Examples:**
- Service layer updates
- New API endpoints with business logic
- Component refactoring
- State management changes
- Integration with external APIs (well-documented)

**Guidance:** Isolate into dedicated threads. Include test requirements.

---

### Medium-High (Sonnet/Opus)

**Characteristics:**
- Architecture decisions required
- Test orchestration across components
- Policy implementation
- CI/CD integration
- Multiple concerns intersecting

**Examples:**
- Authentication/authorization flows
- Multi-step workflows
- Database migrations with data transformation
- Performance optimization requiring profiling
- Error handling strategy implementation

**Guidance:** Front-load research before implementation. Document decisions.

---

### High (Opus)

**Characteristics:**
- Novel problems requiring system design
- Complex debugging across multiple systems
- Security-sensitive implementations
- Production incident investigation
- Significant architectural changes

**Examples:**
- Designing a new subsystem from scratch
- Complex data migrations
- Security vulnerability remediation
- Performance debugging (unknown cause)
- Integration with poorly-documented external systems
- Real-time/WebSocket implementations

**Guidance:** Isolate completely. Allow for exploration and iteration.

---

## Decision Flowchart

```
Start
  |
  v
Is it a single-file, procedural change?
  |
  +-- Yes -> MINIMAL (Haiku)
  |
  +-- No
      |
      v
  Are there established patterns to follow?
      |
      +-- Yes, and <=3 files -> LOW (Haiku/Sonnet)
      |
      +-- No, or >3 files
          |
          v
      Does it require cross-file comprehension?
          |
          +-- Yes, but no arch decisions -> MEDIUM (Sonnet)
          |
          +-- Yes, with arch decisions
              |
              v
          Is it a novel problem or security-sensitive?
              |
              +-- No -> MEDIUM-HIGH (Sonnet/Opus)
              |
              +-- Yes -> HIGH (Opus)
```

---

## Cost Optimization Strategies

### 1. Batch Minimal Tasks
Group procedural changes together. One thread can handle multiple minimal tasks.

### 2. Isolate High-Reasoning Work
Don't mix complex work with simple changes. Keep high-reasoning threads focused.

### 3. Front-Load Research
Before implementing complex features, create a dedicated research thread (Medium level) to:
- Understand existing code
- Identify integration points
- Document approach

Then implementation threads can be lighter (Low/Medium).

### 4. Progressive Refinement
Start with higher-capability model, then hand off to lower for iteration:
- Opus: Design the approach
- Sonnet: Implement core logic
- Haiku: Polish and fix small issues

### 5. Parallelise with Agent Teams
Threads marked as "Parallelizable: Yes" in the PRD can be executed simultaneously using Agent Teams, reducing total wall-clock time without increasing per-thread cost.

---

## Model Recommendations by Level

| Level | Primary Model | Notes |
|-------|---------------|-------|
| Minimal | Haiku | Fast, cheap, reliable for patterns |
| Low | Haiku or Sonnet | Sonnet if unfamiliar codebase |
| Medium | Sonnet | Good balance of capability and cost |
| Medium-High | Sonnet or Opus | Opus for critical paths |
| High | Opus | Worth the cost for novel problems |

---

## Using Reasoning Levels in PRDs

When creating threads in a PRD, always specify the reasoning level:

```markdown
### Thread 4: Add Export Functionality
**Purpose:** Allow users to export data as CSV
**Reasoning Level:** Low (Haiku/Sonnet)
**Rationale:** Follows existing export pattern in `src/utils/export.ts`
**Parallelizable:** Yes
```

This helps:
- Estimate effort accurately
- Select appropriate model
- Identify which threads can be batched
- Flag complex work that needs careful review
- Identify parallelisable work for Agent Teams

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Assign everything as "Medium" | Actually assess complexity |
| Mix High and Minimal in one thread | Separate by complexity |
| Skip level assignment | Every thread needs a level |
| Ignore the rationale | Explain WHY it's that level |
| Over-engineer Minimal tasks | Keep simple things simple |
| Forget parallelisation | Mark threads that can run concurrently |
