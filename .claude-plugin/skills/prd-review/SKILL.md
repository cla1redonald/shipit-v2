---
name: prd-review
description: Review and improve a Product Requirements Document before starting development. Use when validating a PRD for completeness, clarity, and feasibility.
---

# PRD Review

Review and improve a Product Requirements Document.

## When to Use
Use `/shipit:prd-review` when you have a PRD that needs validation before starting development.

## What This Skill Does

1. **Checks completeness** - Are all required sections present?
2. **Validates clarity** - Is the problem clearly defined?
3. **Assesses scope** - Is this achievable for MVP?
4. **Identifies gaps** - What's missing or ambiguous?

## Review Checklist

### Problem Definition
- [ ] Problem is clearly stated
- [ ] Target user is identified
- [ ] Pain point is specific and relatable
- [ ] Current workaround is documented

### Solution
- [ ] Solution addresses the core problem
- [ ] MVP scope is ruthlessly minimal
- [ ] Success criteria are measurable
- [ ] Out of scope is explicitly stated

### Technical Feasibility
- [ ] Fits within standard stack (Next.js, Supabase, Vercel)
- [ ] No obvious technical blockers
- [ ] Data model is reasonable
- [ ] Security considerations noted

### UX/UI
- [ ] Main user flows are described (APP_FLOW.md referenced)
- [ ] Key screens are identified
- [ ] Mobile responsiveness mentioned
- [ ] Quality bar is clear

### Thread Plan
- [ ] Sequential Thread Plan section exists
- [ ] Threads are self-contained (all context included)
- [ ] Reasoning levels assigned to each thread
- [ ] File:line references provided where applicable
- [ ] Validation targets defined for each thread

## Output Format

```markdown
## PRD Review: [Project Name]

### Overall Assessment
[One sentence summary]

### Strengths
- [What's good about this PRD]

### Issues to Address
1. **[Issue]**: [Description and suggestion]

### Questions to Clarify
- [Question that needs answering before build]

### Verdict
[Ready to build / Needs revision / Major gaps]
```

## Reference Files
- `docs/prd-template.md` - Expected PRD format (includes thread structure)
- `docs/prd-questions.md` - Questions that should have been answered
- `docs/reasoning-levels.md` - Task complexity assessment guide
