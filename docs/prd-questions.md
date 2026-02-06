# PRD Questioning Flow

This is the conversational flow for capturing a product idea and turning it into a build-ready PRD.

## Principles

- One question at a time (voice-friendly)
- Front-load the "why" - problem and motivation first
- Capture UX/UI intent explicitly
- Check scope and push back if needed
- Apply user's defaults automatically

## The Flow

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

### 2. Current State

> "How do you handle this today? What's the workaround?"

**Capture:**
- Current solution (even if manual/hacky)
- Why it's not good enough

---

### 3. The Solution Idea

> "What's your idea for solving this? What have you got in mind?"

**Capture:**
- Their initial solution concept
- Any specific features they've already thought of

---

### 4. The User

> "Who's this for? Just you, or will others use it too?"

**If others:**
> "Who specifically? And might it eventually need to support multiple users with their own accounts?"

**Capture:**
- Primary user (self vs others)
- Multi-user consideration (even if not MVP)

---

### 5. Success Criteria

> "If this works perfectly, what does that look like? How will you know it's solved your problem?"

**Capture:**
- Concrete success criteria
- What "done" looks like

---

### 6. Core Functionality (MVP)

> "What's the absolute minimum this needs to do to be useful? If you could only ship one thing, what would it be?"

**Scope check:** If their answer sounds ambitious, probe:
> "Could we cut that down further? What's the smallest version that still solves the core problem?"

**Capture:**
- MVP feature list (ruthlessly minimal)
- Clear boundary of what's in vs out for v1

---

### 7. User Experience

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

### 8. Data

> "What information does this need to store or remember?"

**Follow-up:**
> "Does any of this data need to stay private? Any security considerations?"

**Capture:**
- Core data entities
- Persistence requirements
- Security/privacy needs

---

### 9. Integrations

> "Does this need to connect to anything else? Other apps, services, APIs?"

**Capture:**
- Required integrations
- Nice-to-have integrations (for later)

---

### 10. Constraints

> "Any constraints I should know about? Timeline, specific tech requirements, things to avoid?"

**Capture:**
- Hard constraints
- Preferences
- Anti-patterns to avoid

---

### 11. Future Vision (Brief)

> "If v1 goes well, what might v2 look like? Just a sentence or two."

**Capture:**
- Direction of travel (helps inform architecture)
- Not a commitment, just awareness

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
