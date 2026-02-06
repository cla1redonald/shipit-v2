# PRD: [Product Name]

> **Status:** Draft | Ready for Build | In Progress | Shipped
> **Created:** [Date]
> **Last Updated:** [Date]

---

## 1. Problem Statement

### The Pain Point
[What problem are we solving? In the user's words.]

### Why It Matters
[Impact, frequency, frustration level]

### Current State
[How is this handled today? Why isn't that good enough?]

### Existing Code References
[If modifying existing code, list relevant files with line numbers]

| File | Lines | Purpose |
|------|-------|---------|
| `src/example.ts` | 45-80 | Current implementation of X |
| `src/components/Example.tsx` | 120-150 | UI component to modify |

---

## 2. Solution Overview

### Core Idea
[One paragraph describing the solution]

### Success Looks Like
[Concrete criteria - how do we know this works?]

---

## 3. Users

### Primary User
[Who is this for?]

### Multi-User Consideration
[Even if MVP is single-user, what's the future state? Auth requirements?]

---

## 4. MVP Scope

### In Scope (v1)
[Ruthlessly minimal list of what we're building]

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Out of Scope (v1)
[Explicitly what we're NOT building yet]

- Feature X (v2)
- Feature Y (v2)

### Scope Boundary
[Clear statement of where MVP ends]

---

## 5. Sequential Thread Plan

> Break the build into discrete, self-contained threads. Each thread should be executable in a single conversation with all context included. See `docs/reasoning-levels.md` for level definitions.

### Thread 1: [Name]
**Purpose:** [Single sentence describing what this thread accomplishes]

**Actions:**
- [ ] Action 1
- [ ] Action 2

**Reference Material:**
- `path/to/file.ts:10-50` - [Why this file is relevant]
- `path/to/other.tsx:100-120` - [Context needed]

**Validation Targets:**
- [ ] [How to verify this thread is complete]

**Deliverables:**
- [What artifacts this thread produces]

**Reasoning Level:** [Minimal/Low/Medium/Medium-High/High] ([Model recommendation])

**Rationale:** [Why this complexity level]

**Dependencies:** [Prior threads required, or "None"]
**Parallelizable:** [Yes/No -- can this run alongside other threads via Agent Teams?]

---

### Thread 2: [Name]
[Repeat structure...]

---

### Thread Execution Guidance

1. **Execute ONE thread per conversation** - don't combine threads
2. **Read all reference material first** - understand context before coding
3. **Parallelizable threads can run simultaneously** via Agent Teams
4. **Identify blockers early** - flag issues before they compound

### Completion Log Template

After each thread, record:
```
**Thread [N] Completion Log:**
- Status: Complete / Partial / Blocked
- Files Modified:
  - `path/file.ts:XX-YY` - [what changed]
- Tests Added: [list test files]
- Issues Discovered: [any problems found]
- Notes for Next Thread: [context to carry forward]
```

---

## 6. User Experience

> **See also:** `APP_FLOW.md` for the full screen inventory, route map, and detailed navigation flows. The PRD captures intent; APP_FLOW.md captures every screen and path.

### Key User Flows

**Flow 1: [Name]**
1. User does X
2. System responds with Y
3. User sees Z

**Flow 2: [Name]**
1. ...

### Primary Interface
[Description of main screen/view]

### UX Requirements
- Modern, polished, production-grade feel
- Professional, consistent colour palette
- Mobile-responsive design
- Smooth, intuitive flow
- [Any product-specific UX requirements]

### UI References (if any)
[Any specific aesthetic references or anti-patterns to avoid]

---

## 7. Data Model

### Core Entities
[What data does this store?]

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| Example | id, name, created_at | ... |

### Security & Privacy
[What needs protection? Any sensitive data?]

---

## 8. Integrations

### Required (MVP)
[What must this connect to?]

### Future
[What might it connect to later?]

---

## 9. Technical Specification

### Stack
- **Frontend:** JavaScript (framework TBD by Technical Architect)
- **Hosting:** Vercel
- **Database:** Supabase (if needed)
- **Repo:** GitHub

### Non-Negotiables
- [ ] Tests required
- [ ] Documentation required
- [ ] Security considered from day one
- [ ] Deployed to Vercel from start (not just localhost)

### Architecture Principles
- Build for single user, architect for multi-user
- Consider auth even if not implementing yet
- Keep security tight from day one

---

## 10. Constraints

### Hard Constraints
[Things that must be true]

### Preferences
[Nice-to-haves, soft requirements]

### Anti-Patterns
[Things to explicitly avoid]

---

## 11. Future Vision

### v2 Direction
[Brief note on where this might go if v1 succeeds]

---

## 12. Value Proposition Design (If Commercial)

> *Include this section if the product has commercial intent (paid users, App Store, B2B)*

### Customer Profile

#### Jobs to Be Done
| Job Type | Job |
|----------|-----|
| **Functional** | [Job] |
| **Social** | [Job] |
| **Emotional** | [Job] |

#### Pains
| Pain | Severity (1-5) |
|------|----------------|
| [Pain] | [X] |

#### Gains
| Gain | Importance (1-5) |
|------|------------------|
| [Gain] | [X] |

### Value Map

#### Pain Relievers
| Pain | How We Relieve It |
|------|-------------------|
| [Pain] | [Reliever] |

#### Gain Creators
| Gain | How We Create It |
|------|------------------|
| [Gain] | [Creator] |

### Fit Assessment
[Does every major pain have a reliever? Riskiest assumptions?]

---

## 13. Business Model Canvas (If Commercial)

> *Include this section if the product has commercial intent*

| Block | Description |
|-------|-------------|
| Customer Segments | [Who] |
| Value Propositions | [What value] |
| Channels | [How we reach them] |
| Customer Relationships | [What relationship] |
| Revenue Streams | [How we make money] |
| Key Resources | [What we need] |
| Key Activities | [What we must do] |
| Key Partnerships | [Who we partner with] |
| Cost Structure | [Major costs] |

---

## 14. Hypothesis Testing Plan (If Commercial)

> *Include this section for POC/validation builds*

### Hypothesis 1: [Name]
**Hypothesis:** [Statement]
**Test:** [How to test]
**Success criteria:** [Threshold]
**Pivot if fails:** [Alternative]

[Repeat for 4-6 hypotheses]

### Testing Protocol
[Daily/weekly testing approach]

### Feedback Capture Template
```
[Template for capturing daily feedback]
```

---

## 15. Commercialization Strategy (If Commercial)

> *Include this section if the product has commercial intent*

### Phase 1: Validate
[Goals and success metrics]

### Phase 2: Beta
[Goals and success metrics]

### Phase 3: Launch
[Monetization model, pricing tiers]

### Phase 4: Scale
[Growth strategy, expansion opportunities]

### Key Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| [Risk] | [Mitigation] |

---

## 16. Definition of Done

MVP is complete when:
- [ ] Not embarrassing to show someone
- [ ] Core functionality works end-to-end
- [ ] Creator has used it themselves for [X days/tasks]
- [ ] Live on Vercel (not just localhost)
- [ ] Tests passing
- [ ] Basic documentation exists
- [ ] Security review complete

---

## 17. Open Questions

[Anything still to be resolved]

---

## Appendix: Agent Notes

*This section is populated by agents during the build process*

### Technical Architect
[Architecture decisions, rationale]

### UX/UI Designer
[Design decisions, component notes]

### DevSecOps
[Infrastructure notes, security considerations]

### Other Notes
[Anything else relevant]
