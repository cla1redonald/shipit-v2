# MenuMind — Concept Doc

> Snap a restaurant menu. Instantly know what's safe to eat.

## The Problem

Dining out with dietary restrictions is stressful. Whether it's a nut allergy, celiac disease, keto, or religious dietary laws — you're squinting at menus, interrogating servers, and still not 100% sure. Foreign language menus make it worse. Hidden ingredients (soy in sauces, dairy in bread, gluten in thickeners) catch people off guard.

This isn't a nice-to-have. For people with severe allergies, it's a safety issue.

## The Solution

**MenuMind** is an iPhone app. You photograph a restaurant menu, and AI instantly:

1. **Highlights safe dishes** based on your dietary profile
2. **Flags risks** with specific ingredient warnings ("likely contains gluten — pasta dishes typically use wheat flour")
3. **Suggests modifications** you can ask for ("ask for the salmon without the soy glaze")
4. **Translates** foreign language menus before analyzing them

Your dietary profile is set once and remembered. Open the app, snap, eat safely.

## Target Users

- **Primary:** People with food allergies (nut, shellfish, dairy, gluten) — ~32M adults in the US alone
- **Secondary:** People on strict diets (keto, vegan, halal, kosher, low-FODMAP)
- **Tertiary:** Travelers eating abroad who can't read the menu

## Why Now

- Vision AI (Claude) is finally good enough to read messy handwritten menus, chalkboards, and foreign scripts
- Food allergy prevalence is rising (~8% of US adults)
- Existing solutions are just searchable ingredient databases — nobody is doing real-time menu photo analysis

## Core User Flow

```
1. ONBOARDING (once)
   └─ Set dietary profile: allergies, diet type, preferences, severity level

2. SCAN (every meal)
   ├─ Open app → Camera
   ├─ Snap photo of menu (or multiple pages)
   └─ App sends to Claude Vision API

3. RESULTS (< 5 seconds)
   ├─ ✅ Safe dishes — highlighted green with brief explanation
   ├─ ⚠️  Caution dishes — yellow, with specific risk ("may contain tree nuts in pesto")
   ├─ ❌ Avoid dishes — red, with clear reason
   └─ 💬 Modification suggestions — "Ask for X without Y"

4. DETAILS (tap any dish)
   ├─ Likely ingredients breakdown
   ├─ Confidence level (high/medium/low)
   ├─ "Ask your server about..." prompts
   └─ Save to history

5. HISTORY
   ├─ Past menus with your results
   ├─ Favorite restaurants
   └─ Share with dining companions
```

## Tech Stack — First iPhone App!

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React Native + Expo | TypeScript + React knowledge transfers directly. Expo manages builds, signing, and App Store submission. |
| **Language** | TypeScript | What we know and love |
| **Camera** | expo-camera | Native camera access, photo capture, gallery picker |
| **AI** | Anthropic Claude API (Vision) | Best-in-class image understanding. Can read handwriting, foreign languages, chalkboards. |
| **Backend/Auth** | Supabase | Auth, user profiles, scan history, dietary profiles. Familiar stack. |
| **Storage** | Supabase Storage | Menu photos (signed URLs, direct upload — learned from ShipIt's 4.5MB lesson) |
| **State** | Zustand or React Context | Lightweight, TypeScript-friendly |
| **Navigation** | Expo Router | File-based routing, like Next.js App Router |
| **UI** | React Native Paper or Tamagui + custom | Polished, accessible, iOS-native feel |
| **Distribution** | EAS Build + EAS Submit | Expo's managed pipeline for TestFlight and App Store |
| **Analytics** | Expo Analytics or PostHog | Usage patterns, scan success rates |

### Why Expo?

- **Managed workflow** — No Xcode project to maintain manually
- **EAS Build** — Cloud builds, no Mac required for CI
- **EAS Submit** — Handles App Store submission
- **Over-the-air updates** — Push fixes without App Store review
- **expo-camera** — Battle-tested camera module
- **Expo Router** — File-based routing feels like Next.js

### New Skills to Learn

| Skill | Difficulty | Notes |
|-------|-----------|-------|
| React Native components | Low | Similar to React, just `View`/`Text` instead of `div`/`p` |
| Expo workflow | Low | Well-documented, managed approach hides complexity |
| Apple Developer Account | Medium | $99/year, provisioning profiles, App Store Connect |
| App Store Review Guidelines | Medium | Need to handle health/safety disclaimers carefully |
| Mobile UX patterns | Medium | Navigation stacks, gestures, haptics, safe areas |
| Push notifications | Low | Expo Push Notifications handles the hard parts |

## Monetization Ideas

| Model | Details |
|-------|---------|
| **Freemium** | 5 free scans/month, unlimited for $4.99/month |
| **One-time purchase** | $9.99 lifetime (simpler, good for v1) |
| **Free + tips** | Free forever, optional tip jar |

Recommendation: Start **free with a generous limit** (10 scans/month) to build an audience. Add paid tier later if retention is strong.

## Key Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **AI misidentifies an allergen** | Critical | Strong disclaimers: "MenuMind is an aid, not a medical device. Always confirm with your server." Confidence levels on every result. Never say "guaranteed safe." |
| **Poor photo quality** | Medium | Guide users with camera overlay ("hold steady, ensure menu is well-lit"). Allow retake. Retry with enhancement. |
| **Handwritten/stylized menus** | Medium | Claude Vision handles these well. Fall back to "low confidence" warnings. |
| **App Store rejection** | Medium | Follow health app guidelines. No medical claims. Include disclaimer screen. |
| **API costs at scale** | Low (for now) | Claude API costs are manageable at early scale. Cache common menu items. |

## Differentiators

- **Not a database lookup** — We actually read YOUR menu in real-time, including specials, seasonal items, and foreign menus
- **Modification suggestions** — Don't just say "avoid this," tell me what to ask for
- **Confidence levels** — Honest about what we're sure about vs. guessing
- **Multi-language** — Works on menus in any language (Claude's multilingual vision)
- **Fast** — Results in under 5 seconds, not a 30-second wait

## V1 Scope (Ship Fast)

### In
- [ ] Dietary profile setup (allergies, diet type)
- [ ] Camera capture of menu photos
- [ ] AI analysis with safe/caution/avoid classification
- [ ] Modification suggestions
- [ ] Scan history
- [ ] Health/safety disclaimers
- [ ] Basic onboarding flow

### Out (V2+)
- [ ] Share with dining companions
- [ ] Restaurant favorites / bookmarks
- [ ] Community-verified menus
- [ ] Push notifications ("you're near a restaurant you've scanned before")
- [ ] Apple Watch companion
- [ ] Widget for quick camera access
- [ ] Barcode scanning for packaged foods

## Name Options

| Name | Vibe | Domain/Handle Available? |
|------|------|-------------------------|
| **MenuMind** | Clear, memorable | TBD |
| **SafePlate** | Safety-first | TBD |
| **DineGuard** | Protective | TBD |
| **MenuLens** | Camera-focused | TBD |
| **AllergySnap** | Descriptive | TBD |

## Success Metrics

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| App Store rating | 4.5+ stars |
| Monthly active users | 1,000 |
| Scans per user per month | 4+ (once/week diner) |
| AI accuracy (user-reported) | 90%+ "helpful" rating |
| Retention (30-day) | 40%+ |

---

*Created: February 6, 2026*
*Author: Claire Donald*
*Status: Concept — ready for PRD*
