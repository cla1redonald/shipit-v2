# Handoff Checklists

Distilled phase transition checklists for agent handoffs. In v2, agents communicate through native messaging and the shared task list rather than a HANDOFF.md file, but the deliverables and verification at each transition remain the same.

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

### PRD Complete -> Architecture
**From:** @strategist
**To:** @architect

**Checklist before handoff:**
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

### Architecture Complete -> Setup
**From:** @architect
**To:** @devsecops

**Checklist before handoff:**
- [ ] Data model defined
- [ ] API structure documented
- [ ] Tech decisions made with rationale
- [ ] Security considerations noted
- [ ] Multi-user readiness considered

**Deliverables:**
- `ARCHITECTURE.md` - system design
- `TECH_STACK.md` - locked dependency manifest with exact versions
- `schema.sql` - database schema (if applicable)

---

### Setup Complete -> Build
**From:** @devsecops
**To:** @engineer (or Agent Team of engineers)

**Checklist before handoff:**
- [ ] GitHub repo created and pushed
- [ ] Vercel project linked and deploying
- [ ] Supabase project created (if needed)
- [ ] Environment variables configured
- [ ] CI pipeline created
- [ ] Empty deployment working
- [ ] `FRONTEND_GUIDELINES.md` exists (produced by @designer in Design phase)
- [ ] `TECH_STACK.md` exists (produced by @architect in Design phase)

**Deliverables:**
- Working deployment URL
- `.env.example` documented
- `README.md` with setup instructions

---

### Build Complete -> Review
**From:** @engineer (or Agent Team)
**To:** @reviewer

**Checklist before handoff:**
- [ ] Core features implemented
- [ ] Tests written and passing
- [ ] Error handling in place
- [ ] Loading/empty states handled
- [ ] Mobile responsive

**Deliverables:**
- Working code
- Test suite
- List of files changed

---

### Review Complete -> QA
**From:** @reviewer
**To:** @qa

**Checklist before handoff:**
- [ ] Code review complete
- [ ] Security issues addressed
- [ ] Quality issues fixed
- [ ] No must-fix items remaining

**Deliverables:**
- Review summary
- List of any deferred items

---

### QA Complete -> Docs
**From:** @qa
**To:** @docs

**Checklist before handoff:**
- [ ] All tests passing
- [ ] Core flows verified
- [ ] Edge cases tested
- [ ] No blocking bugs

**Deliverables:**
- Test results summary
- Known issues list (if any)

---

### Docs Complete -> Ship
**From:** @docs
**To:** @orchestrator

**Checklist before handoff:**
- [ ] README complete
- [ ] Setup instructions work
- [ ] API documented (if applicable)
- [ ] Environment variables documented

**Deliverables:**
- `README.md`
- Any additional docs

---

## Ship Checklist (Final Gate)

**@orchestrator verifies before declaring done:**

- [ ] **Not embarrassing** - would show this to someone
- [ ] **Works end-to-end** - core flow completes successfully
- [ ] **Deployed** - live on Vercel, not just localhost
- [ ] **Tested** - test suite passing
- [ ] **Documented** - README exists with setup instructions
- [ ] **Secure** - RLS enabled, no exposed secrets, inputs validated
- [ ] **Dogfooded** - creator has used it themselves

---

## Agent Teams Note

In v2, some of these phases run in parallel via Agent Teams:

- **Design phase:** @architect + @designer run simultaneously (produces ARCHITECTURE.md, TECH_STACK.md, schema.sql, FRONTEND_GUIDELINES.md, APP_FLOW.md concurrently)
- **Build phase:** Multiple @engineer teammates can work on independent features in parallel, with @qa
- **Polish phase:** @reviewer + @docs + @designer run simultaneously for review, documentation, and UI audit

The checklists above still apply -- each agent must meet their deliverables before the phase is considered complete, regardless of whether they ran sequentially or in parallel.
