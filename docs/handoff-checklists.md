# Handoff Checklists

Distilled phase transition checklists for agent handoffs. In v2, agents communicate through native messaging and the shared task list. These checklists define what deliverables are expected at each transition.

---

## Completion Log Template

After completing any thread or phase, agents should record what was done. This provides precise context for the next agent.

```markdown
## Completion Log: [Thread/Phase Name]
**Date:** [timestamp]
**Agent:** @[agent]
**Status:** Complete | Partial | Blocked

### Files Modified
- `src/path/to/file.ts:45-80` - [what changed]
- `src/components/Example.tsx:120-150` - [what changed]

### Files Created
- `src/new/file.ts` - [purpose]

### Tests Added/Modified
- `__tests__/feature.test.ts` - [what's tested]

### Database Changes
- Added column `X` to table `Y`
- Created migration: `migrations/001_add_feature.sql`

### Issues Discovered
- [Problem found that wasn't in scope]
- [Technical debt noted]

### Deferred Items
- [Thing that should be done but wasn't in this thread]

### Notes for Next Agent
- [Context that would be helpful]
- [Gotchas or surprises encountered]
```

---

## Phase Transition Checklists

The phases below reflect v2's workflow, including parallel Agent Teams phases.

### Phase 1: Define (PRD) -> Phase 2: Plan
**From:** @strategist (subagent)
**To:** @orchestrator (plans next phase)

**Checklist:**
- [ ] Problem statement is clear
- [ ] Success criteria defined
- [ ] MVP scope agreed (not creeping)
- [ ] User flows documented
- [ ] Data requirements identified
- [ ] PRD saved as `PRD.md`

**Deliverables:**
- `PRD.md` - complete PRD document
- `APP_FLOW.md` - screen inventory, routes, and user navigation flows

---

### Phase 3: Design (PARALLEL — Agent Team)
**Team:** @architect + @designer (simultaneous)
**Coordinated by:** @orchestrator

**@architect checklist:**
- [ ] Data model defined
- [ ] API structure documented
- [ ] Tech decisions made with rationale
- [ ] Security considerations noted
- [ ] Multi-user readiness considered

**@architect deliverables:**
- `ARCHITECTURE.md` - system design
- `TECH_STACK.md` - locked dependency manifest with exact versions
- `schema.sql` - database schema (if applicable)

**@designer checklist:**
- [ ] Colour palette and design tokens defined
- [ ] Key user flows specified
- [ ] Component patterns identified
- [ ] Responsive breakpoints documented
- [ ] Accessibility baseline set

**@designer deliverables:**
- `FRONTEND_GUIDELINES.md` - locked design system
- User flow diagrams
- Screen/component specifications

**Coordination point:** @architect and @designer must align on data shapes that components will consume. Direct messaging during parallel work.

---

### Phase 4: Setup -> Phase 5: Build
**From:** @devsecops (subagent)
**To:** @engineer Agent Team

**Checklist:**
- [ ] GitHub repo created and pushed
- [ ] Vercel project linked and deploying
- [ ] Supabase project created (if needed)
- [ ] Environment variables configured
- [ ] CI pipeline created
- [ ] Empty deployment working
- [ ] `FRONTEND_GUIDELINES.md` exists (from Phase 3)
- [ ] `TECH_STACK.md` exists (from Phase 3)
- [ ] Test infrastructure ready (runner, config, script)

**Deliverables:**
- Working deployment URL
- `.env.example` documented
- `README.md` with setup instructions

---

### Phase 5: Build (PARALLEL — Agent Team)
**Team:** Multiple @engineer teammates + @qa (simultaneous)
**Coordinated by:** @orchestrator

**@engineer checklist (per feature thread):**
- [ ] Feature implemented per PRD spec
- [ ] Tests written and passing
- [ ] Error handling in place
- [ ] Loading/empty states handled
- [ ] Mobile responsive

**@qa checklist:**
- [ ] Test strategy defined
- [ ] Integration tests written
- [ ] Edge cases covered

**Deliverables:**
- Working code with tests
- Completion logs per thread

---

### Phase 6: Polish (PARALLEL — Agent Team)
**Team:** @reviewer + @docs + @designer (simultaneous)
**Coordinated by:** @orchestrator

**@reviewer checklist:**
- [ ] Code review complete
- [ ] Security issues addressed
- [ ] Quality issues flagged with severity
- [ ] No must-fix items remaining

**@docs checklist:**
- [ ] README complete
- [ ] Setup instructions work
- [ ] API documented (if applicable)
- [ ] Environment variables documented

**@designer checklist (UI audit):**
- [ ] Implemented UI matches specifications
- [ ] No visual drift from FRONTEND_GUIDELINES.md
- [ ] All states handled (empty, loading, error, success)
- [ ] Responsive behaviour verified

**Deliverables:**
- Review summary
- `README.md`
- UI audit findings (if any)

---

### Phase 7: Ship
**From:** @orchestrator
**Requires:** @retro invocation before final summary

**Ship Checklist (Final Gate):**

- [ ] **Not embarrassing** - would show this to someone
- [ ] **Works end-to-end** - core flow completes successfully
- [ ] **Deployed** - live on Vercel, not just localhost
- [ ] **Tested** - test suite passing
- [ ] **Documented** - README exists with setup instructions
- [ ] **Secure** - RLS enabled, no exposed secrets, inputs validated
- [ ] **Dogfooded** - creator has used it themselves
- [ ] **Retro complete** - @retro invoked, learnings captured
