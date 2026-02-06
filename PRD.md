# PRD: MenuMind

> **Status:** Ready for Build
> **Created:** February 6, 2026
> **Last Updated:** February 6, 2026

---

## 1. Problem Statement

### The Pain Point
Dining out with dietary restrictions is stressful and potentially dangerous. People with food allergies, celiac disease, strict diets (keto, vegan, halal, kosher, low-FODMAP), or those traveling abroad must squint at menus, interrogate servers, and still cannot be certain a dish is safe. Hidden ingredients -- soy in sauces, dairy in bread, gluten in thickeners -- catch people off guard. For the ~32 million US adults with food allergies, a wrong order is not an inconvenience; it is a medical emergency.

### Why It Matters
- **Frequency:** Every meal out (2-5 times per week for average US adult)
- **Severity:** Ranges from discomfort (dietary preference violation) to life-threatening anaphylaxis (severe allergies)
- **Emotional toll:** Anxiety before dining, embarrassment asking detailed questions, fear of "being that person" at the table
- **Growing prevalence:** ~8% of US adults have food allergies, and the rate is rising

### Current State
People currently handle this through:
- **Manual menu scanning** -- Reading every item description, often missing hidden ingredients not listed
- **Interrogating servers** -- Awkward, unreliable (servers may not know kitchen practices), and impossible with a language barrier
- **Ingredient database apps** -- Searchable databases (e.g., Spokin, Fig) that require you to look up each dish or ingredient individually. None do real-time menu photo analysis.
- **Avoiding restaurants entirely** -- Some people limit dining out, which reduces quality of life and social participation

None of these solutions handle the real-world scenario: you are sitting at a table with a physical menu (possibly in another language, possibly handwritten on a chalkboard) and need to know what is safe *right now*.

### Existing Code References
This is a greenfield project. No existing codebase to modify.

---

## 2. Solution Overview

### Core Idea
MenuMind is an iPhone app that uses AI vision to instantly analyze restaurant menus from a photo. You set up your dietary profile once (allergies, diet type, severity), then whenever you dine out, you snap a photo of the menu. In under 5 seconds, the app highlights safe dishes in green, flags risky dishes in yellow with specific warnings, marks unsafe dishes in red, and suggests modifications you can ask your server about. It works on any menu -- printed, handwritten, chalkboard, or foreign language.

### Success Looks Like
- A user with a peanut allergy photographs a Thai restaurant menu and immediately sees which dishes contain peanuts, which might contain traces, and which are safe -- with specific modification suggestions like "ask for pad thai without crushed peanuts"
- A traveler in Japan photographs a Japanese-language menu and gets a fully translated, analyzed breakdown in English
- Results appear in under 5 seconds with clear confidence levels (high/medium/low)
- The app carries a strong disclaimer that it is an aid, not a medical device, and users should always confirm with their server

---

## 3. Users

### Primary User
Adults with food allergies (nut, shellfish, dairy, gluten) who dine out regularly. ~32 million adults in the US alone. These users have the highest severity need -- getting it wrong is a health risk.

### Secondary Users
- People on strict diets (keto, vegan, halal, kosher, low-FODMAP) who need to verify menu items
- Travelers eating abroad who cannot read the menu language

### Multi-User Consideration
MVP is single-user with Supabase auth. The data model should include `user_id` on all tables to support future multi-user features:
- **V2:** Share scan results with dining companions (link sharing or in-app groups)
- **V2:** Family profiles (parent manages profiles for children with allergies)
- **Future:** Restaurant-side features (restaurants upload menus, get allergy-aware formatting)

---

## 4. MVP Scope

### In Scope (v1)
- [ ] Onboarding flow with dietary profile setup (allergies, diet type, severity levels)
- [ ] Camera capture of menu photos (single photo and multi-page support)
- [ ] Photo gallery picker as alternative to camera
- [ ] AI analysis via Claude Vision API with safe/caution/avoid classification
- [ ] Dish detail view with likely ingredients, confidence level, and server prompts
- [ ] Modification suggestions ("ask for X without Y")
- [ ] Foreign language menu translation (automatic, pre-analysis)
- [ ] Scan history with past results
- [ ] Health/safety disclaimer screen (required for App Store)
- [ ] Profile editing (update allergies and preferences)
- [ ] Supabase auth (email + Apple Sign-In)
- [ ] Basic error handling (poor photo quality, API failures, no network)

### Out of Scope (v1)
- Share with dining companions (v2)
- Restaurant favorites / bookmarks (v2)
- Community-verified menus (v2)
- Push notifications for nearby scanned restaurants (v2)
- Apple Watch companion (v2+)
- Home screen widget for quick camera access (v2)
- Barcode scanning for packaged foods (v2+)
- Monetization / paywall (post-validation)
- Android version (post-validation)
- Offline mode (v2 -- requires on-device model)

### Scope Boundary
MVP ends at: a single user can create a dietary profile, photograph a menu, receive AI-powered analysis with safety classifications and modification suggestions, and view their scan history. No social features, no monetization, no offline support.

---

## 5. Sequential Thread Plan

### Thread 1: React Native + Expo Project Setup
**Purpose:** Initialize the Expo project with TypeScript, configure Expo Router, set up the development environment and build pipeline.

**Actions:**
- [ ] Create Expo project with TypeScript template (`npx create-expo-app`)
- [ ] Configure Expo Router (file-based routing)
- [ ] Set up `app.json` / `app.config.ts` with app metadata (bundle ID, app name, icons)
- [ ] Configure EAS Build and EAS Submit (`eas.json`)
- [ ] Set up Apple Developer provisioning (development profile)
- [ ] Install and configure core dependencies: `expo-camera`, `expo-image-picker`, `expo-secure-store`
- [ ] Set up Supabase client library (`@supabase/supabase-js`)
- [ ] Configure environment variables (`.env`, `expo-constants`)
- [ ] Set up test infrastructure (Jest + React Native Testing Library)
- [ ] Create GitHub repo, push initial commit
- [ ] Verify `npx expo start` works and blank app runs on iOS simulator
- [ ] Verify EAS Build produces a development build

**Validation Targets:**
- [ ] App runs on iOS simulator with Expo Router navigation working
- [ ] EAS Build completes successfully
- [ ] Test runner executes with a placeholder test
- [ ] GitHub repo has CI workflow for linting and tests

**Deliverables:**
- Working Expo project skeleton
- `eas.json` with build profiles (development, preview, production)
- `.env.example` with required variables documented
- `README.md` with setup instructions

**Reasoning Level:** Medium (Sonnet)

**Rationale:** React Native + Expo setup is well-documented but involves multiple configuration files, build profiles, and platform-specific concerns (provisioning, permissions). Claire is new to React Native so the setup must be clean and well-documented.

**Dependencies:** None
**Parallelizable:** No -- all other threads depend on this.

---

### Thread 2: Supabase Backend + Auth
**Purpose:** Set up Supabase project, define the database schema, implement authentication (email + Apple Sign-In), and create the user profile storage layer.

**Actions:**
- [ ] Create Supabase project
- [ ] Define and apply database schema:
  - `profiles` table (user_id, dietary data as JSONB, created_at, updated_at)
  - `scans` table (id, user_id, image_url, raw_response, parsed_results JSONB, restaurant_name, created_at)
  - `scan_items` table (id, scan_id, dish_name, classification, confidence, ingredients JSONB, modifications JSONB, notes)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Write RLS policies (users can only access their own data)
- [ ] Configure Supabase Auth (email/password + Apple Sign-In provider)
- [ ] Set up Supabase Storage bucket for menu photos (with signed URL access)
- [ ] Create storage policies (users can only access their own uploads)
- [ ] Write database migration file
- [ ] Test auth flow from React Native (sign up, sign in, sign out, session persistence)
- [ ] Implement auth context/provider in the app

**Validation Targets:**
- [ ] User can sign up, sign in, and sign out from the app
- [ ] Apple Sign-In flow works on device/simulator
- [ ] RLS prevents cross-user data access
- [ ] Photo upload to Supabase Storage works with signed URLs
- [ ] Session persists across app restarts (using `expo-secure-store`)

**Deliverables:**
- `schema.sql` migration file
- Auth context provider component
- Supabase client configuration
- Storage upload utility

**Reasoning Level:** Medium-High (Sonnet/Opus)

**Rationale:** Auth + RLS + Apple Sign-In + storage policies involve multiple interacting concerns and security-sensitive configuration. Apple Sign-In on React Native has specific requirements.

**Dependencies:** Thread 1
**Parallelizable:** No -- auth is foundational for all user-facing features.

---

### Thread 3: Onboarding + Dietary Profile
**Purpose:** Build the onboarding flow that captures the user's dietary restrictions, allergies, and severity levels, storing them in Supabase.

**Actions:**
- [ ] Create onboarding screen sequence (welcome, allergy selection, diet type, severity, confirmation)
- [ ] Build allergy selector component (multi-select with common allergens: peanuts, tree nuts, shellfish, fish, dairy, eggs, wheat/gluten, soy, sesame)
- [ ] Build diet type selector (none, keto, vegan, vegetarian, halal, kosher, low-FODMAP, paleo)
- [ ] Build severity level selector per allergen (mild intolerance, moderate sensitivity, severe allergy / anaphylaxis risk)
- [ ] Build custom restriction text input (free-text for uncommon restrictions)
- [ ] Build confirmation/summary screen
- [ ] Implement disclaimer acceptance screen (health/safety disclaimer, required before first use)
- [ ] Save profile to Supabase `profiles` table
- [ ] Implement "skip for now" with reminder to complete later
- [ ] Add onboarding completion flag (don't show again)
- [ ] Write tests for onboarding flow

**Validation Targets:**
- [ ] New user sees onboarding on first launch
- [ ] Returning user skips onboarding
- [ ] Profile data persists in Supabase
- [ ] All allergen and diet combinations save correctly
- [ ] Disclaimer screen cannot be bypassed

**Deliverables:**
- Onboarding screen components
- Dietary profile data model and Zustand/Context state
- Profile API layer (save/load from Supabase)

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Multi-step form with state management, but follows standard patterns. The allergen/diet data model needs to be well-structured for downstream AI analysis.

**Dependencies:** Thread 1, Thread 2
**Parallelizable:** Yes -- can run alongside Thread 4 (both depend on Thread 2).

---

### Thread 4: Camera Capture + Photo Upload
**Purpose:** Implement camera access, photo capture, gallery picking, and upload to Supabase Storage.

**Actions:**
- [ ] Implement `expo-camera` integration with viewfinder UI
- [ ] Add camera overlay guide ("hold steady, ensure menu is well-lit, capture full menu")
- [ ] Implement photo capture with preview and retake option
- [ ] Implement `expo-image-picker` for gallery selection
- [ ] Handle camera permissions request with graceful denial messaging
- [ ] Add `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` to `app.json`
- [ ] Implement image compression/resizing before upload (target < 2MB for API efficiency)
- [ ] Upload photo to Supabase Storage with signed URL
- [ ] Handle upload progress indicator
- [ ] Handle network errors during upload
- [ ] Write tests for capture and upload flow

**Validation Targets:**
- [ ] Camera opens and captures photo on device
- [ ] Gallery picker selects and loads photo
- [ ] Permission denial shows helpful message (not a crash)
- [ ] Photo uploads to Supabase Storage successfully
- [ ] Compressed photo is under 2MB
- [ ] Upload works on cellular network

**Deliverables:**
- Camera screen component
- Image compression utility
- Upload service module
- Permission handling utilities

**Reasoning Level:** Medium (Sonnet)

**Rationale:** `expo-camera` is well-documented, but permission handling, image compression, and upload reliability require careful error handling. Camera UI overlay needs design attention.

**Dependencies:** Thread 1, Thread 2
**Parallelizable:** Yes -- can run alongside Thread 3.

---

### Thread 5: AI Analysis Engine
**Purpose:** Build the core analysis pipeline: send menu photo + dietary profile to Claude Vision API, parse the structured response, and store results.

**Actions:**
- [ ] Design Claude Vision API prompt (system prompt + user dietary profile + menu image)
- [ ] Implement structured output format (JSON schema for safe/caution/avoid classification per dish)
- [ ] Build API service layer (send image, receive structured analysis)
- [ ] Implement response parsing and validation
- [ ] Handle multi-language menus (translation step embedded in prompt)
- [ ] Implement confidence scoring (high/medium/low per dish)
- [ ] Generate modification suggestions per dish
- [ ] Generate "ask your server" prompts per dish
- [ ] Store raw API response + parsed results in Supabase `scans` and `scan_items` tables
- [ ] Implement retry logic for API failures
- [ ] Implement timeout handling (10 second max)
- [ ] Handle edge cases: blurry photos, partial menus, non-menu images
- [ ] Write tests with mocked API responses

**Validation Targets:**
- [ ] API call succeeds with a real menu photo and returns structured results
- [ ] Every dish in the menu gets a classification (safe/caution/avoid)
- [ ] Confidence levels are assigned per dish
- [ ] Foreign language menu is translated and analyzed correctly
- [ ] Modification suggestions are relevant and actionable
- [ ] Results persist in database after analysis
- [ ] Timeout and retry logic works correctly

**Deliverables:**
- Claude Vision API service module
- Prompt template with dietary profile injection
- Response parser and validator
- Type definitions for analysis results

**Reasoning Level:** High (Opus)

**Rationale:** This is the core intelligence of the app. Prompt engineering for reliable structured output from a vision model, handling edge cases, and ensuring safety-critical accuracy requires the highest reasoning level. Getting this wrong has health consequences.

**Dependencies:** Thread 2, Thread 4
**Parallelizable:** No -- this is the critical path. Must be solid before results UI.

---

### Thread 6: Results UI + Dish Details
**Purpose:** Build the results screen that displays the AI analysis with safe/caution/avoid color coding, and the dish detail view with ingredients and modification suggestions.

**Actions:**
- [ ] Build results list screen with color-coded cards (green=safe, yellow=caution, red=avoid)
- [ ] Implement category filters (show all, safe only, caution only, avoid only)
- [ ] Build dish detail bottom sheet or modal (ingredients, confidence, modifications, server prompts)
- [ ] Add confidence indicator (high/medium/low with visual treatment)
- [ ] Display "ask your server about..." prompts
- [ ] Build loading state with progress indication ("Analyzing menu...")
- [ ] Build error state (API failure, unreadable photo) with retry option
- [ ] Build empty state (no dishes found)
- [ ] Add haptic feedback on classification reveal
- [ ] Implement pull-to-refresh for re-analysis
- [ ] Write component tests

**Validation Targets:**
- [ ] Results display within 5 seconds of photo capture
- [ ] Color coding is clear and accessible (not just color -- icons too)
- [ ] Dish detail shows all relevant information
- [ ] Loading, error, and empty states all render correctly
- [ ] Scrolling is smooth with 20+ dish items

**Deliverables:**
- Results list screen
- Dish detail component
- Classification badge/pill components
- Loading/error/empty state components

**Reasoning Level:** Medium (Sonnet)

**Rationale:** UI implementation following clear specifications. The data structure is defined by Thread 5. Main challenge is making the classification system visually clear and accessible.

**Dependencies:** Thread 5
**Parallelizable:** Yes -- can run alongside Thread 7 once Thread 5 is complete.

---

### Thread 7: Scan History + Profile Management
**Purpose:** Build the history tab showing past scans and the profile/settings screen for editing dietary preferences.

**Actions:**
- [ ] Build history list screen (reverse chronological, showing restaurant name, date, dish count, photo thumbnail)
- [ ] Implement tap-to-view past scan results (reuses results UI from Thread 6)
- [ ] Build profile/settings screen (view and edit dietary profile)
- [ ] Implement profile update flow (edit allergies, diet type, severity)
- [ ] Add sign-out functionality
- [ ] Add "About" section with app version, disclaimer link, privacy policy link
- [ ] Implement delete account functionality (GDPR / App Store requirement)
- [ ] Build tab navigation layout (Scan, History, Profile)
- [ ] Write tests for history loading and profile editing

**Validation Targets:**
- [ ] History loads and displays past scans correctly
- [ ] Tapping a history item shows the full results
- [ ] Profile edits persist to Supabase
- [ ] Sign out clears local state and navigates to auth screen
- [ ] Delete account removes all user data
- [ ] Tab navigation works smoothly

**Deliverables:**
- History list screen
- Profile/settings screen
- Tab navigation layout
- Account deletion service

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Standard CRUD UI and navigation patterns. The complexity is moderate due to tab navigation setup and account deletion requirements.

**Dependencies:** Thread 2, Thread 6
**Parallelizable:** Yes -- can run alongside Thread 6 once Thread 5 is complete.

---

### Thread 8: Polish, Disclaimers, and App Store Prep
**Purpose:** Final polish pass -- animations, App Store metadata, health disclaimers, privacy policy, and submission preparation.

**Actions:**
- [ ] Add screen transition animations (shared element transitions for scan flow)
- [ ] Add micro-interactions (button feedback, card animations, loading shimmer)
- [ ] Write health/safety disclaimer copy (legally reviewed language)
- [ ] Create "About MenuMind" screen with full disclaimer text
- [ ] Add disclaimer footer on every results screen ("MenuMind is an aid, not a medical device")
- [ ] Create privacy policy (required for App Store)
- [ ] Create terms of service
- [ ] Generate app icons (all required sizes)
- [ ] Create App Store screenshots (6.7" and 6.1" sizes)
- [ ] Write App Store description and keywords
- [ ] Configure `app.json` with production metadata
- [ ] Run full test suite and fix any failures
- [ ] Test on physical iPhone device
- [ ] Build production binary via EAS Build
- [ ] Submit to TestFlight for beta testing
- [ ] Address any TestFlight feedback

**Validation Targets:**
- [ ] App runs smoothly on physical iPhone (no crashes, no memory leaks)
- [ ] All disclaimers are visible and cannot be bypassed
- [ ] Privacy policy is accessible from app and App Store listing
- [ ] App icons display correctly at all sizes
- [ ] TestFlight build installs and runs correctly
- [ ] Camera permission prompt shows custom description text

**Deliverables:**
- Production-ready app binary
- TestFlight build
- App Store metadata (description, screenshots, keywords)
- Privacy policy and terms of service
- Legal disclaimer copy

**Reasoning Level:** Medium (Sonnet)

**Rationale:** Mix of design polish and App Store compliance. No novel technical challenges, but requires attention to detail on Apple's specific requirements. Camera permission descriptions must be carefully worded for App Store review.

**Dependencies:** All prior threads
**Parallelizable:** No -- this is the final sequential pass.

---

### Thread Execution Guidance

1. **Execute ONE thread per conversation** -- do not combine threads
2. **Read all reference material first** -- understand context before coding
3. **Parallelizable threads can run simultaneously** via Agent Teams:
   - Threads 3 + 4 can run in parallel (after Thread 2)
   - Threads 6 + 7 can run in parallel (after Thread 5)
4. **Thread 5 is the critical path** -- it is the core AI engine and blocks the results UI
5. **Thread 1 must complete first** -- all other threads depend on the project skeleton
6. **Claire is new to React Native** -- add extra inline comments and document any React Native-specific patterns

### Thread Dependency Graph

```
Thread 1 (Expo Setup)
  |
  v
Thread 2 (Supabase + Auth)
  |
  +------+------+
  |             |
  v             v
Thread 3      Thread 4
(Onboarding)  (Camera)
  |             |
  +------+------+
         |
         v
  Thread 5 (AI Engine)
         |
  +------+------+
  |             |
  v             v
Thread 6      Thread 7
(Results UI)  (History + Profile)
  |             |
  +------+------+
         |
         v
  Thread 8 (Polish + App Store)
```

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

**Flow 1: First Launch (Onboarding)**
1. User opens app for the first time
2. Welcome screen explains what MenuMind does (one screen, not a carousel)
3. User taps "Get Started"
4. Disclaimer screen: "MenuMind is an aid, not a medical device. Always confirm with your server."
5. User accepts disclaimer
6. Allergy selection screen (multi-select common allergens + custom input)
7. Diet type selection screen (optional)
8. Severity level per allergen
9. Confirmation screen showing full profile summary
10. User taps "Save and Start Scanning"
11. App navigates to main scan screen

**Flow 2: Scan a Menu (Core Loop)**
1. User opens app (lands on scan tab)
2. Taps "Scan Menu" button (large, prominent)
3. Camera opens with overlay guide ("Center the menu in the frame")
4. User captures photo (or selects from gallery via secondary button)
5. Preview screen: user confirms or retakes
6. Loading screen: "Analyzing your menu..." with progress animation
7. Results screen appears (< 5 seconds):
   - Green cards: safe dishes with brief explanation
   - Yellow cards: caution dishes with specific warnings
   - Red cards: avoid dishes with clear reasons
8. User taps a dish card for details
9. Detail view shows: likely ingredients, confidence level, modification suggestions, "ask your server" prompts
10. User can go back to results list or start a new scan

**Flow 3: View Scan History**
1. User taps History tab
2. Sees list of past scans (photo thumbnail, restaurant name if detected, date, dish count)
3. Taps a past scan
4. Full results screen loads (same UI as fresh scan)
5. User can review any dish details

**Flow 4: Edit Profile**
1. User taps Profile tab
2. Sees current dietary profile summary
3. Taps "Edit Profile"
4. Modifies allergies, diet type, or severity levels
5. Saves changes
6. Future scans use updated profile

### Primary Interface
The app uses a bottom tab navigator with three tabs:
1. **Scan** (center, primary) -- Camera icon, launches the scan flow
2. **History** (left) -- Clock icon, shows past scans
3. **Profile** (right) -- Person icon, shows dietary profile and settings

The scan tab is the default landing screen. The large "Scan Menu" button is the single most prominent UI element.

### UX Requirements
- iOS-native feel with smooth animations and haptic feedback
- High-contrast color coding for classifications (green/yellow/red with accompanying icons for accessibility)
- Results must appear in under 5 seconds from photo capture
- Camera overlay should guide the user to capture a good photo
- Disclaimer must be visible on every results screen (small footer text)
- Confidence levels must be clearly communicated (not buried)
- "Low confidence" results should be visually distinct and encourage server confirmation
- Dark mode support (follows iOS system setting)
- Safe area handling for all iPhone models (notch, Dynamic Island)
- Minimum touch target: 44x44 points (Apple HIG)

### UI References
- **Aesthetic:** Clean, medical-adjacent but not clinical. Think Headspace meets Apple Health -- calming, trustworthy, clear.
- **Anti-patterns:** Do not use aggressive red/danger styling that creates anxiety. The app should reduce stress, not add to it. Use warm, muted tones for the avoid/caution states.
- **Typography:** SF Pro (system font). Clear hierarchy. Dish names prominent, classifications as colored pills/badges.

---

## 7. Data Model

### Core Entities

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `profiles` | id, user_id (FK to auth.users), allergies (JSONB), diet_type, custom_restrictions (text[]), severity_levels (JSONB), disclaimer_accepted_at, onboarding_completed, created_at, updated_at | One profile per user. Allergies stored as structured JSON with severity per allergen. |
| `scans` | id, user_id (FK), image_url, restaurant_name (nullable, AI-detected), language_detected (nullable), raw_api_response (JSONB), created_at | One row per menu scan. Stores the full API response for debugging. |
| `scan_items` | id, scan_id (FK), dish_name, original_name (nullable, for translated menus), classification (enum: safe/caution/avoid), confidence (enum: high/medium/low), likely_ingredients (JSONB), allergens_detected (text[]), modification_suggestions (JSONB), server_prompts (text[]), notes (text) | One row per dish in a scan. Core analysis output. |

### Relationships
```
auth.users (1) --> (1) profiles
auth.users (1) --> (N) scans
scans (1) --> (N) scan_items
```

### Security & Privacy
- **RLS on all tables** -- users can only read/write their own data
- **Menu photos** stored in Supabase Storage with per-user path isolation (`{user_id}/{scan_id}.jpg`)
- **Dietary profile is sensitive health data** -- encrypted at rest (Supabase default), never exposed in logs
- **API keys** stored in environment variables, never in client bundle. Claude API calls go through a Supabase Edge Function (server-side) to keep the API key off the device.
- **Apple Sign-In** stores only the identity token, not Apple credentials
- **Account deletion** must remove all data (profiles, scans, scan_items, storage objects) per GDPR and App Store requirements

---

## 8. Integrations

### Required (MVP)
| Integration | Purpose | Notes |
|-------------|---------|-------|
| **Anthropic Claude API (Vision)** | Menu photo analysis, translation, ingredient identification | Called via Supabase Edge Function to keep API key server-side. Claude model with vision capability. |
| **Supabase Auth** | User authentication | Email/password + Apple Sign-In. Apple Sign-In is required for App Store if any third-party sign-in is offered. |
| **Supabase Database** | Data persistence | PostgreSQL with RLS |
| **Supabase Storage** | Menu photo storage | Signed URLs, per-user isolation |
| **Supabase Edge Functions** | Server-side API proxy | Keeps Claude API key off client. Handles prompt assembly. |
| **expo-camera** | Native camera access | Requires `NSCameraUsageDescription` |
| **expo-image-picker** | Gallery photo selection | Requires `NSPhotoLibraryUsageDescription` |

### Future
| Integration | Purpose | Timeline |
|-------------|---------|----------|
| Apple HealthKit | Sync dietary restrictions from Health app | v2 |
| RevenueCat | In-app purchases and subscription management | Post-validation |
| PostHog / Expo Analytics | Usage analytics and scan success tracking | v1.1 |
| Sentry / Bugsnag | Crash reporting | v1.1 |
| Apple Maps | Restaurant location detection from photo metadata | v2 |

---

## 9. Technical Specification

### Stack
- **Framework:** React Native + Expo (managed workflow)
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **AI:** Anthropic Claude API with Vision (via Supabase Edge Function)
- **State Management:** Zustand (lightweight, TypeScript-native)
- **UI Components:** React Native Paper or Tamagui + custom components
- **Camera:** expo-camera + expo-image-picker
- **Secure Storage:** expo-secure-store (for auth tokens)
- **Build:** EAS Build (cloud builds)
- **Distribution:** EAS Submit (TestFlight + App Store)
- **Testing:** Jest + React Native Testing Library
- **CI:** GitHub Actions (lint, test, type-check on PR)
- **Repo:** GitHub

### Non-Negotiables
- [ ] Tests required for all business logic and core user flows
- [ ] Documentation required (README, inline comments for React Native patterns)
- [ ] Security considered from day one (RLS, server-side API keys, input validation)
- [ ] Available on TestFlight from Thread 1 onward (not just simulator)
- [ ] Health/safety disclaimers on all analysis results
- [ ] Camera permission descriptions comply with App Store guidelines

### Architecture Principles
- All API keys stay server-side (Supabase Edge Functions)
- Build for single user, architect for multi-user (`user_id` on all tables)
- Claude API calls are proxied through Edge Functions -- the device never talks to Anthropic directly
- Image compression happens on-device before upload (save bandwidth and API costs)
- Structured JSON output from Claude API (not free-text parsing)
- Graceful degradation: if AI analysis fails, show clear error with retry, never show wrong results silently

---

## 10. Constraints

### Hard Constraints
- **iPhone only** for v1 (no Android)
- **Requires internet** -- no offline analysis capability in v1
- **Apple Developer Account required** ($99/year) -- Claire needs to set this up before Thread 1
- **Camera permission required** -- app is nearly useless without it, must handle denial gracefully
- **Health disclaimer required** -- cannot make medical claims, must include disclaimer on every results screen
- **Apple Sign-In required** -- App Store policy requires Apple Sign-In if any other social sign-in is offered
- **Under 200MB app size** -- Expo managed workflow keeps this manageable
- **Claude API rate limits** -- must handle rate limiting gracefully

### Preferences
- Results in under 5 seconds (including network round-trip)
- Smooth 60fps animations
- Support all iPhone models from iPhone 12 onward (iOS 16+)
- Dark mode support from day one
- Haptic feedback on key interactions

### Anti-Patterns
- **Never say "guaranteed safe"** -- always frame as "likely safe based on AI analysis"
- **Never cache AI results across different dietary profiles** -- a dish safe for one user may be dangerous for another
- **Never store the Claude API key on the device** -- always proxy through Edge Functions
- **Never auto-submit to App Store without TestFlight testing** -- always beta test first
- **Never dismiss low-confidence results** -- surface them prominently with "ask your server" prompts
- **Never use only color to indicate safety** -- always pair with icons and text for accessibility

---

## 11. Future Vision

### v2 Direction
If v1 validates (1,000 MAU, 4.5+ star rating, 40% 30-day retention):
- **Social dining:** Share scan results with dining companions via link or in-app
- **Restaurant bookmarks:** Save favorite restaurants and get instant results on return visits
- **Community menus:** Crowdsourced menu verification where users confirm AI results
- **Monetization:** Freemium model -- 10 free scans/month, unlimited for $4.99/month (via RevenueCat)
- **Widgets:** Home screen widget for instant camera access
- **Apple Watch:** Quick glance at current scan results from your wrist
- **Barcode scanning:** Packaged food analysis
- **Android:** Expand to Android once iOS model is proven

---

## 12. Value Proposition Design

### Customer Profile

#### Jobs to Be Done
| Job Type | Job |
|----------|-----|
| **Functional** | Determine which dishes on a restaurant menu are safe given my dietary restrictions |
| **Functional** | Understand what hidden ingredients might be in a dish |
| **Functional** | Know what modifications to request from the server |
| **Functional** | Read and analyze a foreign-language menu |
| **Social** | Dine out with friends/family without being "the difficult one" who holds up ordering |
| **Social** | Appear confident and informed when ordering at restaurants |
| **Emotional** | Feel safe and relaxed while dining out instead of anxious |
| **Emotional** | Trust that I can eat at new restaurants without fear |

#### Pains
| Pain | Severity (1-5) |
|------|----------------|
| Anxiety before and during meals at unfamiliar restaurants | 5 |
| Risk of allergic reaction from hidden ingredients | 5 |
| Embarrassment from extensive questioning of servers | 4 |
| Inability to read foreign-language menus while traveling | 4 |
| Time spent manually researching every dish before ordering | 3 |
| Limited restaurant choices due to uncertainty about safe options | 4 |
| Servers who do not know or cannot communicate ingredient details | 4 |
| Missing out on social dining experiences | 3 |

#### Gains
| Gain | Importance (1-5) |
|------|------------------|
| Instant knowledge of which dishes are safe for me | 5 |
| Confidence to try new restaurants | 5 |
| Specific modification requests I can make (actionable advice) | 4 |
| Ability to eat at foreign-language restaurants | 4 |
| Reduced mental load when dining out | 4 |
| History of safe restaurants and dishes for future visits | 3 |
| Peace of mind for parents of children with allergies | 5 |

### Value Map

#### Pain Relievers
| Pain | How We Relieve It |
|------|-------------------|
| Anxiety about unknown ingredients | Instant AI analysis with confidence levels -- know before you order |
| Risk of allergic reaction | Color-coded safety classification with specific allergen warnings |
| Embarrassment asking servers | App provides the questions to ask -- user just reads them |
| Cannot read foreign menus | Automatic translation before analysis -- works on any language |
| Time researching dishes | Results in under 5 seconds from photo -- faster than a Google search |
| Limited restaurant choices | Works at any restaurant with any menu -- expands options |
| Uninformed servers | Generates specific ingredient questions the server can check with the kitchen |

#### Gain Creators
| Gain | How We Create It |
|------|------------------|
| Instant safety knowledge | Claude Vision AI analyzes entire menu in one shot, under 5 seconds |
| Confidence at new restaurants | Clear green/yellow/red system -- know at a glance what is safe |
| Actionable modification suggestions | AI generates specific, realistic modifications per dish |
| Foreign-language dining | Multilingual vision model translates and analyzes simultaneously |
| Reduced mental load | One photo replaces 15 minutes of manual research and server interrogation |
| Restaurant history | Scan history lets you revisit past results when returning to a restaurant |

### Fit Assessment
Every major pain has a direct reliever. The highest-severity pains (anxiety, allergic reaction risk) are addressed by the core feature (AI analysis with safety classification).

**Riskiest assumptions:**
1. Claude Vision can reliably identify likely ingredients from a menu photo (accuracy hypothesis)
2. Users trust AI-generated dietary advice enough to use it (trust hypothesis)
3. Results are fast enough (< 5 seconds) to be useful in a real dining scenario (speed hypothesis)
4. The app adds enough value over asking the server directly to justify installing and using it (utility hypothesis)

---

## 13. Business Model Canvas

| Block | Description |
|-------|-------------|
| **Customer Segments** | Adults with food allergies (32M in US), strict dieters (keto, vegan, halal, kosher), international travelers. Primary segment: allergy sufferers who dine out 2+ times per week. |
| **Value Propositions** | Instant AI-powered menu safety analysis from a photo. Works on any menu, any language. Specific modification suggestions and server prompts. Confidence levels for transparent AI. |
| **Channels** | Apple App Store (primary), food allergy communities (Reddit r/FoodAllergies, Facebook groups, allergy advocacy organizations), food/travel bloggers, App Store search (ASO), Instagram/TikTok (demo videos). |
| **Customer Relationships** | Self-service app with built-in onboarding. In-app feedback mechanism. Community engagement via social media. Email updates for major features. |
| **Revenue Streams** | Phase 1: Free (validate product-market fit). Phase 2: Freemium -- 10 free scans/month, unlimited for $4.99/month or $39.99/year. Phase 3: Potential B2B (restaurant partnerships for allergy-aware menu formatting). |
| **Key Resources** | Claude Vision API access, Supabase backend, Expo/React Native codebase, Apple Developer account, food safety/allergen knowledge base (embedded in prompts). |
| **Key Activities** | Prompt engineering and accuracy improvement, app development and maintenance, App Store optimization, user community engagement, allergy/diet data validation. |
| **Key Partnerships** | Anthropic (Claude API), Apple (App Store distribution), Supabase (backend), food allergy advocacy organizations (FARE, Allergy UK) for credibility and distribution. |
| **Cost Structure** | Claude API usage ($0.01-0.05 per scan estimated), Supabase (free tier initially, ~$25/month at scale), Apple Developer Program ($99/year), EAS Build (free tier for small volume). Primary variable cost is Claude API per scan. |

---

## 14. Hypothesis Testing Plan

### Hypothesis 1: Accuracy
**Hypothesis:** Claude Vision can correctly identify likely ingredients and allergens from a restaurant menu photo with 85%+ accuracy (as rated by users).
**Test:** Beta users rate each scan as "helpful/accurate" or "not helpful/inaccurate." Track across 200+ scans.
**Success criteria:** 85%+ "helpful/accurate" ratings.
**Pivot if fails:** Try multi-model approach (Claude for vision + specialized food database for verification). If still insufficient, pivot to manual menu upload + AI, or partner with restaurant chains who provide structured menu data.

### Hypothesis 2: Speed
**Hypothesis:** End-to-end analysis (capture to results) completes in under 5 seconds on a typical cellular connection.
**Test:** Instrument timing from photo capture to results render. Measure P50 and P95 latency across 100+ real scans.
**Success criteria:** P50 < 4 seconds, P95 < 7 seconds.
**Pivot if fails:** Optimize image compression, implement streaming results (show dishes as they are analyzed), or pre-process common menu layouts.

### Hypothesis 3: Trust
**Hypothesis:** Users with food allergies trust the app enough to use it as a primary decision-making aid (alongside server confirmation).
**Test:** Post-scan survey: "Did you use these results to make your ordering decision?" Track weekly.
**Success criteria:** 60%+ of users report using results to inform their order within 4 weeks of onboarding.
**Pivot if fails:** Add "community verified" badges, partner with dietitians for human review of common menus, increase prominence of confidence levels.

### Hypothesis 4: Retention
**Hypothesis:** Users who complete onboarding will use the app at least 4 times per month (once per week dining out).
**Test:** Track scan frequency per user over 8 weeks post-onboarding.
**Success criteria:** 40%+ of onboarded users scan 4+ times in month 2.
**Pivot if fails:** Add reminders, restaurant bookmarking, or social features to increase engagement hooks.

### Hypothesis 5: Distribution
**Hypothesis:** Food allergy communities are an effective organic distribution channel, achieving 500 downloads in the first month through community posts and word-of-mouth.
**Test:** Seed the app in 5 food allergy communities (Reddit, Facebook groups, FARE community). Track download attribution.
**Success criteria:** 500 downloads in month 1 with 30%+ coming from community referrals.
**Pivot if fails:** Invest in App Store Optimization (ASO), try paid acquisition via Instagram/TikTok ads with demo videos, or partner with allergy advocacy organizations.

### Hypothesis 6: Willingness to Pay
**Hypothesis:** Users who hit the free scan limit (10/month) will convert to paid at a 5%+ rate at $4.99/month.
**Test:** Implement soft paywall after free limit. Track conversion rate over 3 months.
**Success criteria:** 5%+ conversion rate from free to paid.
**Pivot if fails:** Try annual pricing ($39.99/year = $3.33/month), one-time purchase ($14.99 lifetime), or ad-supported free tier.

### Testing Protocol
- **Week 1-2:** Internal testing (Claire + 5-10 friends/family with dietary restrictions)
- **Week 3-4:** Closed beta via TestFlight (50 users from allergy communities)
- **Week 5-8:** Open beta via TestFlight (200+ users), begin measuring all hypotheses
- **Week 9+:** App Store launch if hypotheses are trending positive
- **Daily:** Check crash reports, API error rates, user feedback
- **Weekly:** Review accuracy ratings, scan counts, retention metrics

### Feedback Capture Template
```
Date: [date]
User: [anonymous ID]
Scan ID: [ID]
Restaurant type: [cuisine]
Menu language: [language]
Accuracy rating: [helpful / not helpful]
Specific issue: [free text]
Did you use the results to order? [yes / no / partially]
Would you recommend MenuMind? [1-10]
```

---

## 15. Commercialization Strategy

### Phase 1: Validate (Weeks 1-8)
**Goals:**
- Ship to TestFlight with core scan flow working end-to-end
- Recruit 50-200 beta testers from food allergy communities
- Validate accuracy hypothesis (85%+ helpful rating)
- Validate speed hypothesis (< 5 second P50)

**Success metrics:**
- 200+ beta scans completed
- 85%+ accuracy rating
- 60%+ of testers use results to inform ordering
- Zero critical safety incidents

**Cost:** ~$50/month (Supabase free tier, Claude API usage minimal at beta scale, Apple Developer $99/year)

### Phase 2: Beta (Weeks 9-16)
**Goals:**
- Submit to App Store
- Grow to 1,000 monthly active users
- Begin measuring retention and organic growth
- Refine AI prompts based on accuracy feedback

**Success metrics:**
- App Store approval (no rejection for health claims)
- 1,000 MAU
- 4.0+ star rating
- 40%+ 30-day retention

**Cost:** ~$100/month (increased API usage, potential Supabase Pro plan)

### Phase 3: Launch (Weeks 17-24)
**Goals:**
- Implement freemium monetization (10 free scans/month, $4.99/month unlimited)
- Achieve sustainable unit economics (LTV > CAC)
- Grow to 5,000 MAU

**Monetization model:**
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 10 scans/month, full analysis, history |
| Pro | $4.99/month or $39.99/year | Unlimited scans, priority analysis, export results |

**Success metrics:**
- 5%+ free-to-paid conversion
- $500+ MRR
- Positive App Store reviews mentioning accuracy

**Cost:** ~$200-500/month (API costs scale with usage, RevenueCat integration)

### Phase 4: Scale (Month 6+)
**Goals:**
- Expand to Android
- Explore B2B partnerships (restaurants, hotel chains)
- Community features (verified menus, user corrections)
- International expansion (localized onboarding, regional allergen databases)

**Growth strategy:**
- ASO optimization for "food allergy app", "menu scanner", "dietary restriction app"
- Partnerships with FARE (Food Allergy Research & Education), Celiac Disease Foundation
- Influencer partnerships (food allergy bloggers, travel content creators)
- Referral program (share MenuMind, both get 5 free scans)

### Key Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| AI misidentifies an allergen causing a reaction | Strong disclaimers everywhere. Confidence levels. "Always confirm with server." Liability disclaimer in ToS. Consider product liability insurance. |
| App Store rejects for health claims | Use careful language: "dietary aid" not "medical device." Include disclaimers. Follow Apple Health app guidelines. No claims of guaranteed accuracy. |
| Claude API cost spikes at scale | Implement caching for identical menu photos. Optimize image size. Negotiate volume pricing with Anthropic. Budget alerts. |
| Low retention after initial novelty | Scan history makes app stickier. Restaurant bookmarks in v2. Weekly "dining summary" engagement feature. |
| Competitor launches similar product | First-mover advantage in AI menu scanning. Focus on accuracy and trust (most defensible moat). Community-verified results as network effect. |
| Apple changes App Store policies for AI apps | Monitor App Store guidelines updates. Maintain compliance buffer. Diversify to Android to reduce platform risk. |

---

## 16. Pre-Mortem

### Tigers (Real, Serious Risks)
| Tiger | Impact | Likelihood | Mitigation |
|-------|--------|------------|------------|
| Claude Vision misreads a menu and a user has an allergic reaction | Critical -- potential lawsuit, app removal, user harm | Medium | Disclaimers on every screen. Confidence levels. "Always confirm with server" prompts. Never use language suggesting certainty. Product liability insurance. |
| App Store rejection for health/medical claims | High -- blocks entire launch | Medium | Pre-review Apple's Health App guidelines. Use "dietary aid" framing. Include proper disclaimers. Submit with detailed App Review notes explaining the app is informational only. |
| Claude API latency exceeds 5 seconds consistently | High -- makes app feel broken, kills retention | Low-Medium | Image compression to reduce upload time. Streaming results if available. Timeout with graceful error. Loading animation that manages perception. |
| Camera permission denied by user | High -- app is unusable without camera | Low | Clear explanation of why camera is needed before permission prompt. Graceful fallback to gallery picker. Re-request permission from settings screen. |

### Paper Tigers (Seem Scary but Manageable)
| Paper Tiger | Why It Seems Scary | Why It Is Manageable |
|-------------|-------------------|---------------------|
| "React Native is new to Claire" | First iOS app, unfamiliar framework | Expo abstracts most complexity. TypeScript/React knowledge transfers directly. Excellent documentation and community. |
| "Claude API costs will be expensive" | Per-scan API calls seem costly | At beta/early scale (1K scans/month), cost is ~$10-50/month. Optimize images to reduce token count. Only an issue at 100K+ scans. |
| "Handwritten menus won't work" | Messy handwriting seems hard for OCR | Claude Vision handles handwriting well. Fall back to "low confidence" warnings. Most restaurant menus are printed. |
| "Foreign language support is complex" | Multilingual analysis sounds hard | Claude is natively multilingual. Translation is part of the single API call, not a separate system. |

### Elephants (Uncomfortable Truths We Must Face)
| Elephant | The Uncomfortable Truth | How We Face It |
|----------|------------------------|----------------|
| AI dietary advice carries liability | If someone trusts MenuMind and gets sick, there could be legal consequences regardless of disclaimers | Accept this risk with eyes open. Disclaimers reduce but do not eliminate liability. Consider product liability insurance before public launch. Frame app as "informational aid" not "medical device." |
| The app may not be accurate enough to justify the trust users place in it | Users with severe allergies need near-100% accuracy; AI cannot guarantee this | Be radically honest about confidence levels. Never hide uncertainty. Train users to always confirm with servers. If accuracy hypothesis fails, pivot to a less safety-critical use case (dietary preference tracking, not allergy management). |
| App Store discovery is brutal for new apps | Even a great app may get zero organic downloads without marketing investment | Plan for paid acquisition budget. Seed in communities before launch. ASO from day one. Do not assume "build it and they will come." |

---

## 17. Opportunity Cost

### What Gets Delayed
By pursuing MenuMind, Claire is choosing NOT to spend this time on:
- Other side project ideas
- Contributing to open-source projects
- Deepening existing TypeScript/React web development skills
- Freelance/consulting work

### Impact Assessment
- **Learning investment:** React Native / Expo knowledge gained is transferable to future mobile projects and increases Claire's market value
- **Time commitment:** Estimated 6-8 weeks from concept to TestFlight beta, 12-16 weeks to App Store launch
- **Financial commitment:** ~$150 first year (Apple Developer $99 + Supabase/API costs). Low downside.
- **Reversibility:** High. If the app does not validate, the skills learned (React Native, Expo, App Store process) retain value. The codebase can be abandoned without ongoing costs.

### Stakeholder Awareness
Claire is the sole stakeholder and is aware of the trade-offs. This is a deliberate investment in learning mobile development while solving a real problem she cares about.

---

## 18. Open Questions

1. **Apple Developer Account:** Has Claire enrolled in the Apple Developer Program ($99/year)? This is required before Thread 1 can complete EAS Build configuration.
2. **Claude API pricing tier:** Which Anthropic plan will be used? Are there rate limits that affect the MVP? Need to confirm volume pricing for scale.
3. **Legal review of disclaimers:** Should the health/safety disclaimer language be reviewed by a lawyer before App Store submission?
4. **Analytics provider:** Should we integrate PostHog or Expo Analytics in v1, or defer to v1.1?
5. **Image caching strategy:** Should we cache AI results for the same menu photo (same restaurant, same user) to reduce API costs on repeat visits?
6. **App name trademark:** Is "MenuMind" available as a trademark? Check before investing in branding.
7. **Beta tester recruitment:** Which specific food allergy communities should we seed the TestFlight beta in?

---

## 19. Definition of Done

MVP is complete when:
- [ ] Not embarrassing to show someone
- [ ] Core scan flow works end-to-end (photo to classified results in < 5 seconds)
- [ ] Dietary profile setup works and persists
- [ ] Health/safety disclaimer is visible and accepted before first use
- [ ] Scan history displays past results correctly
- [ ] Available on TestFlight for beta testing
- [ ] Tests passing (unit tests for AI service, integration tests for core flows)
- [ ] Basic documentation exists (README with setup instructions)
- [ ] Security review complete (RLS enabled, API keys server-side, no exposed secrets)
- [ ] Camera permission handling is graceful (not a crash on denial)
- [ ] Works on physical iPhone device (not just simulator)
- [ ] Claire has used it herself at a real restaurant

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
