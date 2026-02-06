# PRD Questioning Flow

This is the conversational flow for capturing a product idea and turning it into a build-ready PRD. The full 17-step sequence that @strategist follows.

## Principles

- One question at a time (voice-friendly)
- Front-load the "why" - problem and motivation first
- Capture UX/UI intent explicitly
- Check scope and push back if needed
- Apply user's defaults automatically

## The 17-Step Flow

### 1. The Problem (Most Important)

**Opening:**
> "Tell me about the problem you're trying to solve. What's the pain point?"

**Follow-up if needed:**
> "When does this problem occur? How often? What's the impact when it happens?"

**Capture:**
- The core problem in the user's words
- Frequency and context
- Impact/frustration level

---

### 2. Strategy Anchor *(Ravi Mehta -- Product Strategy Stack)*

> "How does this connect to your company/product strategy?"

If the user cannot articulate the strategic connection, the PRD is not ready. Every PRD must explicitly state which strategy pillar it serves.

**Capture:**
- Which strategy pillar this serves
- How it advances the broader product/company direction

---

### 3. Opportunity Framing *(Teresa Torres -- Opportunity Solution Tree)*

> "Let's separate the opportunity from the solution. What's the underlying opportunity here?"

An opportunity is NOT a solution. "Users need a dashboard" is a solution. "Users struggle to understand their usage patterns" is an opportunity.

**Capture:**
- The opportunity (not the solution)
- How the opportunity was discovered (user research, data, intuition)

---

### 4. Current State

> "How do you handle this today? What's the workaround?"

**Capture:**
- Current solution (even if manual/hacky)
- Why it's not good enough

---

### 5. The Solution Idea

> "What's your idea for solving this? What have you got in mind?"

**Capture:**
- Their initial solution concept
- Any specific features they've already thought of

---

### 6. Alternative Solutions *(Teresa Torres)*

> "What are at least two other ways you could solve this?"

Never commit to the first solution. Compare at least 3 approaches before selecting one.

**Capture:**
- At least 3 alternative approaches
- Pros/cons of each
- Rationale for selected approach

---

### 7. The User

> "Who's this for? Just you, or will others use it too?"

**If others:**
> "Who specifically? And might it eventually need to support multiple users with their own accounts?"

**Capture:**
- Primary user (self vs others)
- Multi-user consideration (even if not MVP)

---

### 8. Success Criteria *(Melissa Perri)*

> "If this works perfectly, what does that look like? How will you know it's solved your problem?"

Ask: "What do we hope will happen when we release this?" If the answer is vague, dig deeper -- the PRD is not ready.

**Capture:**
- Concrete success criteria
- What "done" looks like
- Measurable outcomes

---

### 9. Core Functionality (MVP)

> "What's the absolute minimum this needs to do to be useful? If you could only ship one thing, what would it be?"

**Scope check:** If their answer sounds ambitious, probe:
> "Could we cut that down further? What's the smallest version that still solves the core problem?"

**Capture:**
- MVP feature list (ruthlessly minimal)
- Clear boundary of what's in vs out for v1

---

### 10. User Experience

> "How should this feel to use? Walk me through what happens when you open it."

**Follow-ups as needed:**
- "What's the main screen or view?"
- "What actions do you take most often?"
- "Anything it should definitely NOT feel like?"

**Capture:**
- Key user flows
- Primary interface concepts
- Feel/vibe (applying defaults: modern, polished, mobile-responsive)

---

### 11. Data

> "What information does this need to store or remember?"

**Follow-up:**
> "Does any of this data need to stay private? Any security considerations?"

**Capture:**
- Core data entities
- Persistence requirements
- Security/privacy needs

---

### 12. Integrations

> "Does this need to connect to anything else? Other apps, services, APIs?"

**Capture:**
- Required integrations
- Nice-to-have integrations (for later)

---

### 13. Constraints

> "Any constraints I should know about? Timeline, specific tech requirements, things to avoid?"

**Capture:**
- Hard constraints
- Preferences
- Anti-patterns to avoid

---

### 14. Existing Code References

> "Are we modifying an existing codebase? If so, which files and what's the current behaviour?"

**Capture:**
- File paths with line numbers: `src/components/List.tsx:45-80`
- Why each file is relevant
- Current behaviour vs desired behaviour

Vague references like "check the config files" cause problems downstream. Get specifics.

---

### 15. Opportunity Cost *(Shreyas Doshi)*

> "What will NOT happen if we pursue this? What gets delayed or abandoned?"

Every PRD should acknowledge what gets delayed or abandoned.

**Capture:**
- What is being deprioritised
- Impact of that deprioritisation
- Whether stakeholders are aware

---

### 16. Future Vision (Brief)

> "If v1 goes well, what might v2 look like? Just a sentence or two."

**Capture:**
- Direction of travel (helps inform architecture)
- Not a commitment, just awareness

---

### 17. Commercial Intent

> "Is this a personal tool or could it become a real product?"

**Listen for signals:** "paid users", "monetization", "subscription", "App Store", "launch", "customers", "business", "startup", "scale"

If detected, ask explicitly:
> "It sounds like this could become a real product. Do you want me to include business validation frameworks?"

**If yes, include:**
- Value Proposition Design (Customer Profile + Value Map)
- Business Model Canvas (all 9 blocks)
- Hypothesis Testing Plan (testable hypotheses with success criteria)
- Commercialization Roadmap (Validate > Beta > Launch > Scale)

---

## After the Conversation

Summarise back to the user:

> "Here's what I've captured. Does this feel right?"

Then generate the PRD using `docs/prd-template.md`.

---

## Defaults to Apply Automatically

Don't ask about these - just include them:

### Tech Stack
- TypeScript
- Next.js (App Router)
- Vercel hosting
- Supabase (if backend needed)
- GitHub repo

### Quality Standards
- Tests required
- Documentation required
- Security from day one
- Deploy early to Vercel

### UX/UI Standards
- Modern, polished, production-grade
- Professional colour palette
- Mobile-responsive
- Flows well

### Architecture
- Build for one, architect for many
- Consider multi-user even if not MVP
