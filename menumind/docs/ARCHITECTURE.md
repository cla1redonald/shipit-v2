# Architecture: MenuMind

> **Status:** Ready for Implementation
> **Created:** February 6, 2026
> **Architect:** @architect

---

## System Overview

MenuMind is an iPhone app that photographs restaurant menus and uses Claude Vision AI to classify dishes as safe, caution, or avoid based on a user's dietary profile. The system is a three-tier mobile architecture:

1. **Client tier** -- React Native + Expo app running on iOS. Handles camera capture, image compression, local state, and result display.
2. **API tier** -- Supabase Edge Functions running Deno on Supabase's edge network. Proxies Claude API calls (keeping the API key server-side), assembles prompts, and validates responses.
3. **Data tier** -- Supabase PostgreSQL database with Row-Level Security, plus Supabase Storage for menu photo blobs.

The app is online-only for v1. All AI analysis requires a round-trip through the Edge Function to Claude's API.

---

## Component Diagram

```
+------------------------------------------------------------------+
|                        iOS Device                                 |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                   React Native + Expo                       |  |
|  |                                                             |  |
|  |  +------------------+  +---------------+  +-------------+   |  |
|  |  |   Expo Router    |  |  Zustand      |  | expo-secure |   |  |
|  |  |   (Navigation)   |  |  (State)      |  | -store      |   |  |
|  |  +------------------+  +---------------+  | (Auth token)|   |  |
|  |                                           +-------------+   |  |
|  |  +------------------+  +---------------+                    |  |
|  |  |  expo-camera     |  | Image         |                    |  |
|  |  |  expo-image-     |  | Compression   |                    |  |
|  |  |  picker           |  | (on-device)   |                    |  |
|  |  +------------------+  +---------------+                    |  |
|  |                                                             |  |
|  |  +------------------------------------------------------+  |  |
|  |  |              Supabase Client SDK                      |  |  |
|  |  |  (Auth | Database | Storage | Edge Function calls)    |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
         |                    |                    |
         | HTTPS              | HTTPS              | HTTPS
         v                    v                    v
+------------------+  +------------------+  +------------------+
| Supabase Auth    |  | Supabase DB      |  | Supabase Storage |
| (email + Apple   |  | (PostgreSQL +    |  | (menu photos)    |
|  Sign-In)        |  |  RLS)            |  |                  |
+------------------+  +------------------+  +------------------+
                              |
                              |  (DB triggers / direct calls)
                              v
                    +--------------------+
                    | Supabase Edge      |
                    | Function           |
                    | "analyze-menu"     |
                    |                    |
                    | - Receives image   |
                    |   URL + profile    |
                    | - Fetches image    |
                    | - Builds prompt    |
                    | - Calls Claude API |
                    | - Validates JSON   |
                    | - Returns results  |
                    +--------------------+
                              |
                              | HTTPS
                              v
                    +--------------------+
                    | Anthropic Claude   |
                    | API (Vision)       |
                    |                    |
                    | claude-sonnet-4-20250514  |
                    +--------------------+
```

---

## Data Flow: Core Scan Operation

This is the critical path -- the sequence from the user pressing the shutter button to seeing classified results.

```
Step 1: CAPTURE
  User takes photo via expo-camera (or selects from gallery via expo-image-picker)
  Photo stored in memory as a local URI

Step 2: COMPRESS
  On-device image compression/resize
  Target: < 1.5MB, max 2048px on longest edge
  Format: JPEG at 80% quality
  Purpose: reduce upload time and API token cost

Step 3: UPLOAD
  Compressed image uploaded to Supabase Storage
  Path: menu-photos/{user_id}/{scan_id}.jpg
  Returns a signed URL (valid 1 hour)
  Simultaneously: create a `scans` row with status='uploading'

Step 4: INVOKE EDGE FUNCTION
  Client calls Supabase Edge Function "analyze-menu" via supabase.functions.invoke()
  Payload: { scan_id, image_url (signed), dietary_profile }
  The Edge Function:
    a) Fetches the image from Storage (server-to-server, fast)
    b) Converts to base64 for Claude API
    c) Assembles the prompt (system prompt + dietary profile + image)
    d) Calls Claude API with structured JSON output schema
    e) Validates the response against the expected schema
    f) Writes parsed results to `scans` (raw_api_response) and `scan_items` (per dish)
    g) Returns the parsed results to the client

Step 5: DISPLAY
  Client receives structured JSON with dish classifications
  Updates Zustand scan store with results
  Navigates to results screen
  Renders dish cards with safe/caution/avoid color coding

Step 6: PERSIST
  Results are already persisted by the Edge Function (Step 4f)
  Client state is the display copy; database is the source of truth
  Scan appears in history immediately
```

### Timing Budget (Target: < 5 seconds total)

| Step | Target | Notes |
|------|--------|-------|
| Compress | 200ms | On-device, CPU-bound |
| Upload | 800ms | 1.5MB over LTE (~2 Mbps up) |
| Edge Function overhead | 100ms | Cold start ~200ms, warm ~50ms |
| Claude API call | 2500ms | Vision model, structured output |
| Response parsing + DB write | 200ms | Edge Function server-side |
| Client render | 200ms | React Native list render |
| **Total** | **~4000ms** | P50 target; P95 ~7s |

---

## Three-Layer AI Architecture

### Layer 1: Model / Intelligence Layer

**Model:** Claude claude-sonnet-4-20250514 (vision-capable, fast, cost-effective for structured extraction)

**Capabilities:**
- Read printed, handwritten, and photographed menus in any language
- Identify dish names, descriptions, and likely ingredients
- Cross-reference ingredients against a user's allergen/diet profile
- Provide confidence levels based on available information
- Translate foreign-language menus to English
- Generate modification suggestions and server prompts

**Limitations:**
- Cannot see behind the menu -- hidden ingredients in sauces, oils, shared fryers are inferred, not confirmed
- Handwritten menus with poor penmanship may produce lower accuracy
- Blurry, dark, or partial photos degrade output quality
- No knowledge of a specific restaurant's actual recipes -- works from menu text only
- Cannot guarantee accuracy -- this is probabilistic, not deterministic

**Failure modes:**
- Hallucinated ingredients (model invents ingredients not implied by menu text)
- Missed allergens (model fails to flag an ingredient that contains an allergen)
- Over-classification (marks safe dishes as caution/avoid due to conservative reasoning)
- Under-classification (marks risky dishes as safe -- the most dangerous failure)
- Unreadable image (cannot extract text from photo)

### Layer 2: API / Service Layer (Supabase Edge Function)

**Responsibilities:**
- Prompt assembly: combines system prompt template + user dietary profile + image
- Structured output enforcement: requests JSON output matching a strict schema
- Response validation: verifies the response matches expected types and fields
- Retry logic: up to 2 retries on transient failures (5xx, timeout)
- Timeout enforcement: 15-second hard timeout on Claude API call
- Error classification: distinguishes between unreadable image, API failure, and rate limiting
- Result persistence: writes raw and parsed results to database
- Cost tracking: logs token usage per call for monitoring

**Prompt structure:**

```
System prompt:
  "You are a food safety analyst. Analyze the restaurant menu in the
   provided image. For each dish, determine if it is safe, caution, or
   avoid based on the user's dietary profile. Return structured JSON."

User message:
  - Image: [base64-encoded menu photo]
  - Dietary profile: [JSON with allergies, severities, diet types, custom restrictions]
  - Instructions: [output schema, confidence definitions, translation rules]

Expected output:
  {
    "restaurant_name": string | null,
    "language_detected": string | null,
    "dishes": [
      {
        "dish_name": string,
        "original_name": string | null,
        "classification": "safe" | "caution" | "avoid",
        "confidence": "high" | "medium" | "low",
        "likely_ingredients": string[],
        "allergens_detected": string[],
        "modification_suggestions": string[],
        "server_prompts": string[],
        "reasoning": string
      }
    ],
    "menu_readable": boolean,
    "error_message": string | null
  }
```

### Layer 3: Product Harness Layer (Client App)

**Responsibilities:**
- Pre-capture guidance: camera overlay with tips for better photos
- Loading state management: cycling status messages to manage perceived wait time
- Result presentation: color-coded cards with icons (not just colors) for accessibility
- Confidence communication: prominent display of confidence levels, especially low confidence
- Disclaimer enforcement: persistent footer on all result screens
- Error recovery: clear error states with retry options, never silent failures
- Feedback hooks (future): accuracy rating per scan for prompt improvement
- Safety rails: "Always confirm with your server" on every dish detail view

**Product-level safety rules:**
1. Never display results without a visible disclaimer
2. Low-confidence results get a distinct visual treatment and an explicit "Ask your server" prompt
3. "Avoid" classification always shows the specific allergen(s) detected
4. Modification suggestions are framed as questions to ask, not guarantees
5. The word "safe" is always qualified: "likely safe" or "appears safe based on menu description"

---

## Security Model

### Authentication

| Concern | Approach |
|---------|----------|
| Auth provider | Supabase Auth (email/password + Apple Sign-In) |
| Token storage | `expo-secure-store` (iOS Keychain-backed, encrypted at rest) |
| Session persistence | Supabase `auth.onAuthStateChange()` listener + secure store for refresh token |
| Apple Sign-In | Required by App Store policy. Uses `expo-apple-authentication`. Stores only the identity token, not Apple credentials. |
| Password policy | Minimum 8 characters. Supabase default policy. |

### Data Access Control (RLS)

All tables have Row-Level Security enabled. Every policy checks `auth.uid() = user_id`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own row only | Own row only | Own row only | Own row only |
| `scans` | Own rows only | Own rows only | Own rows only | Own rows only |
| `scan_items` | Items from own scans | Items for own scans | Items for own scans | Items for own scans |

`scan_items` RLS is enforced via a join check: the parent `scans` row must belong to the requesting user.

### API Key Security

| Key | Location | Access |
|-----|----------|--------|
| `SUPABASE_URL` | Client `.env` (public) | Identifies the Supabase project |
| `SUPABASE_ANON_KEY` | Client `.env` (public) | Public key, gated by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function env only | Bypasses RLS, never on client |
| `ANTHROPIC_API_KEY` | Edge Function env only | Never on client, never in logs |

The Claude API key NEVER leaves the server. The client cannot call Claude directly. All analysis goes through the `analyze-menu` Edge Function.

### Storage Security

- Menu photos stored at path: `menu-photos/{user_id}/{scan_id}.jpg`
- Storage policies enforce that users can only upload to their own directory
- Storage policies enforce that users can only read their own files
- Signed URLs used for temporary access (1-hour expiry)
- Photos are private by default (no public bucket)

### Input Validation

| Layer | Validation |
|-------|-----------|
| Client | Zod schemas validate profile data before sending to Supabase |
| Edge Function | Zod validates incoming request payload (scan_id, image_url, dietary_profile) |
| Edge Function | Validates Claude API response against expected JSON schema before persisting |
| Database | PostgreSQL constraints (NOT NULL, CHECK, foreign keys) as final guard |

### Sensitive Data Handling

- Dietary profiles are sensitive health data
- Encrypted at rest by Supabase (AES-256)
- Never logged in plain text
- Account deletion removes all data (profiles, scans, scan_items, storage objects)
- No analytics on individual dietary data (only aggregate, anonymized metrics in future)

---

## State Management Design

MenuMind uses **Zustand** for client-side state. Three stores, each with a single responsibility.

### Store 1: `useAuthStore`

Manages authentication state. Thin wrapper around Supabase Auth.

```typescript
interface AuthStore {
  // State
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;        // Check stored session on app launch
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
```

**Where it lives:** Client only. Session token persisted in `expo-secure-store`. User object from Supabase Auth.

### Store 2: `useProfileStore`

Manages the user's dietary profile. Source of truth is the database; this is a client-side cache.

```typescript
interface ProfileStore {
  // State
  profile: DietaryProfile | null;
  isLoading: boolean;
  onboardingCompleted: boolean;

  // Actions
  fetchProfile: () => Promise<void>;       // Load from Supabase
  saveProfile: (profile: DietaryProfile) => Promise<void>;  // Save to Supabase
  updateAllergies: (allergies: Allergen[]) => Promise<void>;
  updateDietTypes: (dietTypes: DietType[]) => Promise<void>;
  updateSeverities: (severities: SeverityMap) => Promise<void>;
  updateCustomRestrictions: (restrictions: string[]) => Promise<void>;
  clearProfile: () => void;                // On sign out
}

interface DietaryProfile {
  allergies: Allergen[];
  dietTypes: DietType[];
  severityLevels: Record<Allergen, SeverityLevel>;
  customRestrictions: string[];
  disclaimerAcceptedAt: string | null;
  onboardingCompleted: boolean;
}

type Allergen = 'peanuts' | 'tree_nuts' | 'shellfish' | 'fish'
  | 'dairy' | 'eggs' | 'wheat_gluten' | 'soy' | 'sesame' | string;

type DietType = 'keto' | 'vegan' | 'vegetarian' | 'halal'
  | 'kosher' | 'low_fodmap' | 'paleo';

type SeverityLevel = 'mild' | 'moderate' | 'severe';
```

### Store 3: `useScanStore`

Manages the current scan flow and scan history. The most complex store.

```typescript
interface ScanStore {
  // Current scan state
  currentScan: {
    imageUri: string | null;        // Local URI of captured/selected photo
    compressedUri: string | null;   // Local URI after compression
    uploadProgress: number;          // 0-100
    status: ScanStatus;
    scanId: string | null;
    results: ScanResults | null;
    error: ScanError | null;
  };

  // History
  history: ScanSummary[];
  historyLoading: boolean;

  // Current scan actions
  setImage: (uri: string) => void;
  compressImage: () => Promise<void>;
  uploadAndAnalyze: () => Promise<void>;
  cancelScan: () => void;
  resetCurrentScan: () => void;

  // History actions
  fetchHistory: () => Promise<void>;
  fetchScanDetail: (scanId: string) => Promise<ScanResults>;
}

type ScanStatus = 'idle' | 'compressing' | 'uploading' | 'analyzing'
  | 'complete' | 'error';

interface ScanResults {
  scanId: string;
  restaurantName: string | null;
  languageDetected: string | null;
  items: ScanItem[];
  createdAt: string;
}

interface ScanItem {
  id: string;
  dishName: string;
  originalName: string | null;
  classification: 'safe' | 'caution' | 'avoid';
  confidence: 'high' | 'medium' | 'low';
  likelyIngredients: string[];
  allergensDetected: string[];
  modificationSuggestions: string[];
  serverPrompts: string[];
  reasoning: string;
}
```

### What Lives Where

| Data | Location | Rationale |
|------|----------|-----------|
| Auth session | `expo-secure-store` + Zustand | Keychain-backed persistence, Zustand for reactive UI |
| Dietary profile | Supabase DB + Zustand cache | DB is source of truth, Zustand for fast local reads |
| Current scan image | Local filesystem (temp) | Large blob, no need to keep in memory store |
| Scan results | Supabase DB + Zustand cache | DB is source of truth, Zustand for display |
| Scan history list | Supabase DB + Zustand cache | Fetched on tab focus, cached for smooth scrolling |
| Camera state | Local component state | Ephemeral, no need for global store |
| Form state (onboarding) | Local component state | Ephemeral until "Save" is pressed |
| UI state (filters, modals) | Local component state | Per-screen, no need for global store |

---

## Folder Structure

```
/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout (auth gate, font loading, providers)
│   ├── index.tsx                     # Redirect: auth check
│   │
│   ├── (auth)/                       # Unauthenticated screens
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (onboarding)/                 # First-launch onboarding
│   │   ├── _layout.tsx
│   │   ├── disclaimer.tsx
│   │   ├── allergies.tsx
│   │   ├── diet-type.tsx
│   │   ├── severity.tsx
│   │   ├── custom-restrictions.tsx
│   │   └── confirm.tsx
│   │
│   ├── (tabs)/                       # Main app (tab navigator)
│   │   ├── _layout.tsx               # Tab bar config
│   │   │
│   │   ├── scan/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Scan home
│   │   │   ├── camera.tsx
│   │   │   ├── preview.tsx
│   │   │   ├── analyzing.tsx
│   │   │   └── results.tsx
│   │   │
│   │   ├── history/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # History list
│   │   │   └── [scanId].tsx          # History detail
│   │   │
│   │   └── profile/
│   │       ├── _layout.tsx
│   │       ├── index.tsx             # Profile home
│   │       ├── edit-allergies.tsx
│   │       ├── edit-diet.tsx
│   │       ├── edit-severity.tsx
│   │       ├── about.tsx
│   │       ├── privacy-policy.tsx
│   │       ├── terms.tsx
│   │       └── delete-account.tsx
│   │
│   └── dish-detail.tsx               # Modal: dish detail (shared)
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ChipSelector.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── scan/                     # Scan feature components
│   │   │   ├── DishCard.tsx
│   │   │   ├── ClassificationBadge.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── FilterPills.tsx
│   │   │   ├── ResultsSummaryBar.tsx
│   │   │   ├── CameraOverlay.tsx
│   │   │   └── AnalyzingAnimation.tsx
│   │   │
│   │   ├── profile/                  # Profile feature components
│   │   │   ├── AllergenGrid.tsx
│   │   │   ├── DietTypeList.tsx
│   │   │   ├── SeveritySelector.tsx
│   │   │   └── ProfileSummary.tsx
│   │   │
│   │   └── shared/                   # Cross-feature components
│   │       ├── DisclaimerFooter.tsx
│   │       ├── ErrorState.tsx
│   │       ├── EmptyState.tsx
│   │       └── SafeAreaWrapper.tsx
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── profileStore.ts
│   │   └── scanStore.ts
│   │
│   ├── services/                     # API and external service layers
│   │   ├── supabase.ts               # Supabase client init
│   │   ├── auth.ts                   # Auth helper functions
│   │   ├── profile.ts                # Profile CRUD operations
│   │   ├── scan.ts                   # Scan operations (upload, analyze, history)
│   │   ├── storage.ts                # Supabase Storage upload/download
│   │   └── imageCompression.ts       # On-device image compression
│   │
│   ├── lib/                          # Utilities
│   │   ├── constants.ts              # App-wide constants
│   │   ├── validators.ts             # Zod schemas
│   │   └── formatters.ts             # Date, text formatting helpers
│   │
│   └── types/                        # TypeScript types
│       ├── database.types.ts         # Supabase generated types (with Relationships)
│       ├── scan.ts                   # Scan-related types
│       ├── profile.ts                # Profile-related types
│       └── navigation.ts             # Route parameter types
│
├── supabase/
│   ├── functions/
│   │   └── analyze-menu/
│   │       ├── index.ts              # Edge Function entry point
│   │       └── prompt.ts             # Prompt template and assembly
│   │
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Database migration
│   │
│   └── config.toml                   # Supabase local config
│
├── __tests__/                        # Test files (mirrors src/ structure)
│   ├── services/
│   ├── stores/
│   └── components/
│
├── assets/                           # Static assets (icons, images, fonts)
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── tsconfig.json
├── .env.example
├── schema.sql                        # Full schema (source of truth)
└── package.json
```

---

## API Design: Edge Function

MenuMind has a single Edge Function: `analyze-menu`. All Claude API interaction is channeled through this one function.

### `POST /functions/v1/analyze-menu`

**Request:**

```typescript
{
  scan_id: string;          // UUID, pre-created by client
  image_url: string;        // Signed URL from Supabase Storage
  dietary_profile: {
    allergies: string[];
    diet_types: string[];
    severity_levels: Record<string, string>;
    custom_restrictions: string[];
  };
}
```

**Response (success):**

```typescript
{
  success: true;
  data: {
    scan_id: string;
    restaurant_name: string | null;
    language_detected: string | null;
    dishes: Array<{
      dish_name: string;
      original_name: string | null;
      classification: 'safe' | 'caution' | 'avoid';
      confidence: 'high' | 'medium' | 'low';
      likely_ingredients: string[];
      allergens_detected: string[];
      modification_suggestions: string[];
      server_prompts: string[];
      reasoning: string;
    }>;
  };
}
```

**Response (error):**

```typescript
{
  success: false;
  error: {
    code: 'UNREADABLE_IMAGE' | 'API_ERROR' | 'RATE_LIMITED' | 'TIMEOUT'
         | 'INVALID_REQUEST' | 'NOT_A_MENU';
    message: string;
    retryable: boolean;
  };
}
```

### Edge Function Internal Flow

```
1. Validate request (Zod schema)
2. Verify user auth (from Authorization header, forwarded by Supabase client)
3. Verify scan_id belongs to requesting user (RLS handles this)
4. Fetch image from Storage URL
5. Convert image to base64
6. Assemble prompt:
   - System prompt (food safety analyst role, output schema)
   - User dietary profile (formatted as structured text)
   - Image (base64 in user message)
7. Call Claude API:
   - Model: claude-sonnet-4-20250514
   - Max tokens: 4096
   - Temperature: 0 (deterministic for safety-critical output)
   - Structured output via tool_use or JSON mode
8. Validate response against Zod schema
9. Write to database:
   - Update scans row with raw_api_response, restaurant_name, language_detected
   - Insert scan_items rows for each dish
10. Return parsed results to client
```

---

## Error Handling Strategy

### Error Categories

| Category | Example | Client Response | Retry? |
|----------|---------|-----------------|--------|
| **Network** | No internet, timeout | E01: No Network screen | Auto-retry when reconnected |
| **Upload** | Storage upload fails | Toast error, retry button | Yes (same photo) |
| **API Transient** | Claude 5xx, rate limit | E03: Analysis Failed | Yes (auto-retry 2x, then manual) |
| **Unreadable** | Blurry photo, not a menu | E04: Unreadable Photo | No (retake required) |
| **Auth** | Expired session | Redirect to sign-in | No (re-auth required) |
| **Validation** | Malformed API response | E03: Analysis Failed | Yes (retry may get valid response) |

### Retry Policy

```
Edge Function retry logic:
  - Max retries: 2
  - Backoff: 1s, then 3s (exponential)
  - Retry on: 5xx responses, timeouts, network errors
  - Do NOT retry on: 4xx responses, rate limits (return to client), auth errors

Client retry logic:
  - Automatic: none (user controls retry via button)
  - Manual: "Try Again" button on error screens re-invokes the Edge Function
  - Retake: "Take a New Photo" starts the scan flow from the camera
```

### Error Reporting

- All Edge Function errors logged with scan_id, error code, and timestamp
- Client-side errors captured (future: Sentry integration in v1.1)
- Failed scans update the `scans` row with status='error' and error details
- Users never see raw error messages -- all errors mapped to friendly copy

---

## System Accuracy Profile

### Expected Accuracy

| Metric | Target | Basis |
|--------|--------|-------|
| Dish extraction rate | 90%+ | Claude Vision reads printed menus well; handwritten may miss some |
| Classification accuracy (overall) | 85%+ | Based on allergen inference from menu descriptions |
| Severe allergen detection (recall) | 95%+ | Must err on the side of caution for severe allergens |
| False positive rate (safe marked as avoid) | ~15% | Acceptable -- conservative is safer than permissive |
| False negative rate (avoid marked as safe) | < 3% | Critical -- this is the dangerous failure mode |

### Why 100% Accuracy Is Impossible

1. **Menus do not list all ingredients.** "Pad Thai" does not say "contains peanuts" -- the AI infers it from culinary knowledge.
2. **Cross-contamination is invisible.** A dish may be ingredient-safe but prepared in a shared fryer.
3. **Restaurant variations.** The same dish name can have different recipes at different restaurants.
4. **Photo quality varies.** Dim lighting, angles, and glare reduce text extraction accuracy.

### Graceful Degradation

| Situation | Behavior |
|-----------|----------|
| Low photo quality | Classify more dishes as "low confidence" rather than guessing |
| Unknown dish | Classify as "caution" with "Ask your server about ingredients" |
| Foreign language, partial translation | Show original + translation, flag confidence as "medium" |
| AI uncertainty | Never round up confidence. If uncertain, show "low" and recommend server confirmation |

### Feedback Loops (Future)

1. **Per-scan accuracy rating** (v1.1): "Was this analysis helpful?" thumbs up/down after each scan
2. **Per-dish correction** (v2): Users can mark individual dishes as "AI got this wrong"
3. **Prompt improvement cycle**: Aggregate feedback to refine system prompt monthly
4. **Accuracy dashboard**: Track accuracy ratings over time, by cuisine type, by menu language

### Safety-Critical Design Rules

1. **Severity amplification**: For allergens marked "severe / anaphylaxis risk," the classification threshold is lower. Even a small probability of that allergen triggers "avoid."
2. **Never say "guaranteed safe"**: All UI copy uses "likely safe" or "appears safe based on available information."
3. **Confidence is prominent, not hidden**: Confidence level is visible on every dish card, not buried in a detail view.
4. **Disclaimer is persistent**: Every results screen has a disclaimer footer. Every dish detail has a disclaimer. The user accepted a disclaimer at onboarding.

---

## Key Technical Decisions

### Decision 1: Claude Sonnet vs Opus for Menu Analysis

**Context:** Choose which Claude model powers the menu analysis Edge Function.
**Options:**
  A) Claude Opus -- Higher reasoning, more expensive ($15/M input tokens), slower (~5-8s)
  B) Claude Sonnet -- Strong vision, cheaper ($3/M input tokens), faster (~2-4s)
**Recommendation:** Sonnet (claude-sonnet-4-20250514)
**Rationale:** Menu analysis is a structured extraction task, not a complex reasoning problem. Sonnet's vision capabilities are sufficient for reading menu text and cross-referencing allergens. The 2-3x speed advantage matters for the 5-second latency target. Cost per scan drops from ~$0.05 to ~$0.01, which matters at scale.
**Reversibility:** Easy -- change one constant in the Edge Function. No schema or client changes needed.

### Decision 2: Edge Function vs Direct Claude API Call

**Context:** How does the client talk to Claude?
**Options:**
  A) Client calls Claude API directly (API key in app bundle)
  B) Client calls a Supabase Edge Function which proxies to Claude
**Recommendation:** Edge Function proxy
**Rationale:** Non-negotiable for security. API keys in mobile app bundles can be extracted trivially. The Edge Function also gives us prompt assembly on the server (users cannot see or modify the prompt), response validation before persistence, and a single place to add rate limiting, logging, and caching.
**Reversibility:** Hard to reverse (would require shipping API key to device).

### Decision 3: Zustand vs React Context for State

**Context:** Client state management approach for a React Native app.
**Options:**
  A) React Context + useReducer (built-in, no dependencies)
  B) Zustand (lightweight, TypeScript-native, no boilerplate)
  C) Redux Toolkit (full-featured, more boilerplate)
**Recommendation:** Zustand
**Rationale:** Three stores with moderate complexity. Zustand provides: no Provider wrapper needed (less nesting in the component tree), built-in devtools support, TypeScript-first API, persist middleware for local storage, and it is ~2KB (negligible bundle impact). React Context re-renders all consumers on any state change; Zustand only re-renders subscribers of changed slices.
**Reversibility:** Medium -- store interfaces can be preserved, but consumer hooks would change.

### Decision 4: NativeWind vs React Native Paper for Styling

**Context:** Choose a styling/component approach for the React Native app.
**Options:**
  A) React Native Paper -- Material Design components, ready-made, opinionated
  B) NativeWind -- Tailwind CSS compiled to React Native StyleSheet, flexible, familiar
**Recommendation:** NativeWind (v4)
**Rationale:** The PRD calls for an iOS-native feel ("Headspace meets Apple Health"), not Material Design. NativeWind gives us Tailwind utility classes (familiar to web developers, matches ShipIt default stack), full customization for an iOS-native aesthetic, smaller bundle than Paper (no pre-built components we will not use), and dark mode support via Tailwind's `dark:` variant. We build our own component library (Button, Card, Badge, etc.) on top of NativeWind + React Native core.
**Reversibility:** Medium -- styling approach is pervasive but the component API layer isolates it.

### Decision 5: Image Compression Strategy

**Context:** Menu photos from iPhone cameras are 3-8MB. Claude API charges per token (images cost tokens). Upload speed matters for the 5-second target.
**Options:**
  A) Upload raw photos, let the Edge Function resize
  B) Compress on-device before upload
**Recommendation:** Compress on-device
**Rationale:** Reduces upload time (800ms vs 3s+ on LTE), reduces storage costs, reduces Claude API token usage (smaller base64 payload). Target: JPEG at 80% quality, max 2048px longest edge, resulting in ~1-1.5MB. Use `expo-image-manipulator` for on-device resize/compress.
**Reversibility:** Easy -- can always upload larger images later if needed.

### Decision 6: Structured JSON Output from Claude

**Context:** How do we get machine-readable output from Claude?
**Options:**
  A) Free-text response, parse with regex/heuristics
  B) Structured JSON output via tool_use or JSON mode
**Recommendation:** Structured JSON via tool_use
**Rationale:** Free-text parsing is fragile and error-prone. Claude's tool_use feature enforces a JSON schema on the output, giving us type-safe, predictable responses. The Edge Function validates the response with Zod as a second layer of defense.
**Reversibility:** Easy -- the prompt and parsing logic are in one file.

### Decision 7: Single Edge Function vs Multiple

**Context:** Should we have one Edge Function for all operations or separate functions?
**Options:**
  A) Single `analyze-menu` function
  B) Multiple functions: `analyze-menu`, `delete-account`, `get-scan-history`, etc.
**Recommendation:** Single function for v1, split later if needed
**Rationale:** The only operation that requires server-side secrets is the Claude API call. Profile CRUD and history queries work fine via the Supabase client SDK with RLS. Account deletion can be handled client-side (Supabase client can delete own data via RLS policies). Keep it simple: one function, one purpose.
**Reversibility:** Easy -- adding new Edge Functions is additive.

---

## Environment Variables

```bash
# .env.example

# Supabase (public, safe for client bundle)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase Edge Function env (set via Supabase dashboard, NOT in client .env)
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# ANTHROPIC_API_KEY=sk-ant-...

# App config
EXPO_PUBLIC_APP_NAME=MenuMind
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Note:** `EXPO_PUBLIC_` prefixed variables are embedded in the client bundle. Only Supabase URL and anon key should be public. The service role key and Anthropic API key are set exclusively in the Supabase dashboard for the Edge Function runtime.

---

## Dependency Graph for Implementation Threads

```
Thread 1: Expo Setup (project skeleton, routing, build pipeline)
    |
    v
Thread 2: Supabase + Auth (schema, RLS, auth flow, Edge Function scaffold)
    |
    +------+------+
    |             |
    v             v
Thread 3:       Thread 4:
Onboarding      Camera + Upload
(profile)       (capture, compress, storage)
    |             |
    +------+------+
           |
           v
Thread 5: AI Engine (Edge Function, prompt, Claude API, response parsing)
           |
    +------+------+
    |             |
    v             v
Thread 6:       Thread 7:
Results UI      History + Profile
    |             |
    +------+------+
           |
           v
Thread 8: Polish + App Store
```

This matches the PRD's thread dependency graph exactly. Architecture deliverables (this document, TECH_STACK.md, schema.sql) unblock all threads.
