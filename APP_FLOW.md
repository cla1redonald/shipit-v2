# APP_FLOW.md — MenuMind

> Complete screen inventory, route map, and navigation flows for the MenuMind iOS app.
> This document is the source of truth for @architect (API design) and @engineer (screen implementation).

---

## Navigation Architecture

MenuMind uses **Expo Router** (file-based routing) with the following navigation structure:

- **Root Layout** (`app/_layout.tsx`) -- Auth gate. Routes unauthenticated users to auth flow, authenticated users to main tabs.
- **Auth Stack** (`app/(auth)/`) -- Sign-in, sign-up, forgot password. No tab bar.
- **Onboarding Stack** (`app/(onboarding)/`) -- First-launch only. No tab bar. Sequential flow.
- **Main Tabs** (`app/(tabs)/`) -- Three tabs: Scan, History, Profile. Bottom tab navigator.
- **Modal Stack** -- Camera, results detail, and other full-screen overlays presented modally.

---

## Route Map

```
app/
├── _layout.tsx                      # Root layout (auth gate + font loading)
├── index.tsx                        # Redirect: auth check → (auth) or (tabs)
│
├── (auth)/
│   ├── _layout.tsx                  # Auth stack layout (no tabs)
│   ├── welcome.tsx                  # Welcome / landing screen
│   ├── sign-in.tsx                  # Email + password sign-in
│   ├── sign-up.tsx                  # Email + password sign-up
│   ├── forgot-password.tsx          # Password reset request
│   └── apple-sign-in.tsx            # Apple Sign-In handler (if separate)
│
├── (onboarding)/
│   ├── _layout.tsx                  # Onboarding stack layout (no tabs, no back)
│   ├── disclaimer.tsx               # Health/safety disclaimer (must accept)
│   ├── allergies.tsx                # Allergy selection (multi-select)
│   ├── diet-type.tsx                # Diet type selection (single-select)
│   ├── severity.tsx                 # Severity per allergen
│   ├── custom-restrictions.tsx      # Free-text additional restrictions
│   └── confirm.tsx                  # Profile summary + "Save & Start"
│
├── (tabs)/
│   ├── _layout.tsx                  # Tab navigator layout (3 tabs)
│   │
│   ├── scan/
│   │   ├── _layout.tsx              # Scan stack layout
│   │   ├── index.tsx                # Scan home (big "Scan Menu" button)
│   │   ├── camera.tsx               # Camera viewfinder with overlay
│   │   ├── preview.tsx              # Photo preview (confirm / retake)
│   │   ├── analyzing.tsx            # Loading state during AI analysis
│   │   └── results.tsx              # Results list (safe/caution/avoid)
│   │
│   ├── history/
│   │   ├── _layout.tsx              # History stack layout
│   │   ├── index.tsx                # History list (past scans)
│   │   └── [scanId].tsx             # Past scan detail (reuses results UI)
│   │
│   └── profile/
│       ├── _layout.tsx              # Profile stack layout
│       ├── index.tsx                # Profile home (summary + settings)
│       ├── edit-allergies.tsx        # Edit allergy selections
│       ├── edit-diet.tsx             # Edit diet type
│       ├── edit-severity.tsx         # Edit severity levels
│       ├── about.tsx                # About screen (version, disclaimer, links)
│       ├── privacy-policy.tsx        # Privacy policy (full text)
│       ├── terms.tsx                 # Terms of service (full text)
│       └── delete-account.tsx        # Account deletion confirmation
│
└── dish-detail.tsx                   # Dish detail modal (shared across scan + history)
```

---

## Screen Inventory

### Auth Screens

#### S01: Welcome (`(auth)/welcome`)
**Purpose:** First screen for unauthenticated users. Introduces MenuMind.

| Element | Details |
|---------|---------|
| App logo | MenuMind logo, centered |
| Tagline | "Snap a menu. Know what's safe." |
| Sign In button | Primary button, navigates to `sign-in` |
| Sign Up button | Secondary button, navigates to `sign-up` |
| Apple Sign-In button | Apple-styled button (required by Apple HIG) |
| Background | Subtle gradient or illustration (calming, food-related) |

**Navigation:**
- "Sign In" → `(auth)/sign-in`
- "Sign Up" → `(auth)/sign-up`
- Apple Sign-In → Authenticates, then → `(onboarding)/disclaimer` (if new) or `(tabs)/scan` (if returning)

---

#### S02: Sign In (`(auth)/sign-in`)
**Purpose:** Email/password authentication for returning users.

| Element | Details |
|---------|---------|
| Email input | Text field, keyboard type: email |
| Password input | Secure text field with show/hide toggle |
| Sign In button | Primary, disabled until both fields filled |
| Forgot Password link | Text link below button |
| Back to Welcome | Navigation back arrow |
| Error message | Inline error for invalid credentials |

**Navigation:**
- Success → `(tabs)/scan` (returning user) or `(onboarding)/disclaimer` (if onboarding incomplete)
- "Forgot Password" → `(auth)/forgot-password`
- Back → `(auth)/welcome`

---

#### S03: Sign Up (`(auth)/sign-up`)
**Purpose:** New account creation.

| Element | Details |
|---------|---------|
| Email input | Text field, keyboard type: email |
| Password input | Secure text field with strength indicator |
| Confirm password input | Secure text field, must match |
| Sign Up button | Primary, disabled until valid |
| Terms acceptance | Checkbox: "I agree to the Terms of Service and Privacy Policy" |
| Error messages | Inline: email taken, password too weak, mismatch |

**Navigation:**
- Success → `(onboarding)/disclaimer`
- Back → `(auth)/welcome`

---

#### S04: Forgot Password (`(auth)/forgot-password`)
**Purpose:** Password reset via email.

| Element | Details |
|---------|---------|
| Email input | Text field |
| Send Reset Link button | Primary |
| Success message | "Check your email for a reset link" |
| Back link | Return to sign-in |

**Navigation:**
- Success → Shows confirmation message, "Back to Sign In" link
- Back → `(auth)/sign-in`

---

### Onboarding Screens

#### S05: Disclaimer (`(onboarding)/disclaimer`)
**Purpose:** Health/safety disclaimer. MUST be accepted before using the app. Required for App Store compliance.

| Element | Details |
|---------|---------|
| Title | "Important Health Information" |
| Disclaimer text | Full disclaimer: "MenuMind uses AI to analyze restaurant menus. It is an informational aid, NOT a medical device. AI analysis may contain errors. Always confirm ingredients with your server, especially for severe allergies. MenuMind cannot guarantee the accuracy of its analysis and is not liable for allergic reactions or adverse health events." |
| Checkbox | "I understand that MenuMind is an aid and not a substitute for confirming ingredients with restaurant staff" |
| Accept button | Primary, disabled until checkbox checked |
| Cannot go back | No back navigation -- must accept to proceed |

**Navigation:**
- Accept → `(onboarding)/allergies`
- No dismiss/skip option

---

#### S06: Allergy Selection (`(onboarding)/allergies`)
**Purpose:** Select food allergies from common list + custom input.

| Element | Details |
|---------|---------|
| Title | "What are you allergic to?" |
| Subtitle | "Select all that apply. You can change these later." |
| Common allergens grid | Multi-select chips: Peanuts, Tree Nuts, Shellfish, Fish, Dairy, Eggs, Wheat/Gluten, Soy, Sesame |
| Custom input | "Add another..." text input with add button |
| None option | "I don't have food allergies" (clears selections) |
| Next button | Primary, always enabled (zero selections = no allergies) |
| Progress indicator | Step 1 of 5, dots or progress bar |

**Navigation:**
- Next → `(onboarding)/diet-type`
- No back (sequential onboarding)

---

#### S07: Diet Type (`(onboarding)/diet-type`)
**Purpose:** Select dietary preferences/restrictions.

| Element | Details |
|---------|---------|
| Title | "Do you follow a specific diet?" |
| Subtitle | "Optional. Select one or more." |
| Diet options | Multi-select list: Keto, Vegan, Vegetarian, Halal, Kosher, Low-FODMAP, Paleo, None/No specific diet |
| Next button | Primary |
| Progress indicator | Step 2 of 5 |

**Navigation:**
- Next → `(onboarding)/severity` (if allergies were selected) or `(onboarding)/custom-restrictions` (if no allergies)
- Back → `(onboarding)/allergies`

---

#### S08: Severity Levels (`(onboarding)/severity`)
**Purpose:** Set severity level per selected allergen. Only shown if at least one allergy was selected.

| Element | Details |
|---------|---------|
| Title | "How severe are your allergies?" |
| Subtitle | "This helps us calibrate our warnings." |
| Per-allergen row | Allergen name + severity selector (Mild intolerance / Moderate sensitivity / Severe - anaphylaxis risk) |
| Default | Moderate sensitivity |
| Next button | Primary |
| Progress indicator | Step 3 of 5 |

**Navigation:**
- Next → `(onboarding)/custom-restrictions`
- Back → `(onboarding)/diet-type`

---

#### S09: Custom Restrictions (`(onboarding)/custom-restrictions`)
**Purpose:** Free-text input for additional dietary restrictions not covered by the standard selections.

| Element | Details |
|---------|---------|
| Title | "Anything else we should know?" |
| Subtitle | "Add any other dietary needs or preferences." |
| Text area | Multi-line free text input. Placeholder: "e.g., No cilantro, avoid spicy food, no raw fish..." |
| Skip button | "Skip" text link |
| Next button | Primary |
| Progress indicator | Step 4 of 5 |

**Navigation:**
- Next / Skip → `(onboarding)/confirm`
- Back → `(onboarding)/severity` or `(onboarding)/diet-type`

---

#### S10: Profile Confirmation (`(onboarding)/confirm`)
**Purpose:** Summary of the dietary profile for review before saving.

| Element | Details |
|---------|---------|
| Title | "Your Dietary Profile" |
| Allergies section | List of selected allergies with severity badges |
| Diet section | Selected diet types |
| Custom section | Any custom restrictions entered |
| Edit links | "Edit" next to each section (navigates back to relevant screen) |
| Save button | Primary: "Save & Start Scanning" |
| Progress indicator | Step 5 of 5 |

**Navigation:**
- "Save & Start Scanning" → Saves profile to Supabase → `(tabs)/scan`
- Edit links → Back to respective onboarding screen

---

### Main Tab Screens

#### S11: Scan Home (`(tabs)/scan/index`)
**Purpose:** Primary landing screen. Single prominent action: scan a menu.

| Element | Details |
|---------|---------|
| Greeting | "Ready to scan" or "Hi [name], ready to eat?" |
| Scan button | Large, prominent, centered: "Scan Menu" with camera icon |
| Gallery option | Smaller link below: "or choose from photos" |
| Recent scan | Card showing most recent scan (if any) -- quick access |
| Disclaimer footer | Small text: "MenuMind is an aid. Always confirm with your server." |

**Navigation:**
- "Scan Menu" → `(tabs)/scan/camera`
- "Choose from photos" → Opens `expo-image-picker` → `(tabs)/scan/preview`
- Recent scan card → `(tabs)/history/[scanId]`

---

#### S12: Camera (`(tabs)/scan/camera`)
**Purpose:** Camera viewfinder with guidance overlay for capturing menu photos.

| Element | Details |
|---------|---------|
| Camera viewfinder | Full-screen camera feed |
| Guide overlay | Semi-transparent frame: "Center the menu in the frame" |
| Capture button | Large circular shutter button (bottom center) |
| Gallery button | Small icon (bottom left) to switch to gallery picker |
| Flash toggle | Top right: auto/on/off |
| Close button | Top left: X to dismiss camera |
| Tips text | Top: "Hold steady. Ensure good lighting." |

**Navigation:**
- Capture → `(tabs)/scan/preview`
- Gallery → Opens `expo-image-picker` → `(tabs)/scan/preview`
- Close → Back to `(tabs)/scan/index`

---

#### S13: Photo Preview (`(tabs)/scan/preview`)
**Purpose:** Show captured/selected photo for confirmation before analysis.

| Element | Details |
|---------|---------|
| Photo display | Full-width photo with zoom/pan |
| Analyze button | Primary: "Analyze This Menu" |
| Retake button | Secondary: "Retake" (returns to camera) |
| Choose Another | Text link: "Choose a different photo" |

**Navigation:**
- "Analyze This Menu" → Upload photo → `(tabs)/scan/analyzing`
- "Retake" → `(tabs)/scan/camera`
- "Choose a different photo" → Opens `expo-image-picker`

---

#### S14: Analyzing (`(tabs)/scan/analyzing`)
**Purpose:** Loading state while the AI processes the menu photo. Must feel fast and reassuring.

| Element | Details |
|---------|---------|
| Animation | Subtle loading animation (scanning effect over the photo, or pulsing icon) |
| Status text | Cycling messages: "Reading your menu..." → "Identifying dishes..." → "Checking ingredients..." → "Almost ready..." |
| Progress indicator | Indeterminate progress bar or animated dots |
| Cancel button | "Cancel" text link (returns to scan home, aborts API call) |
| Time estimate | "Usually takes 3-5 seconds" |

**Navigation:**
- Analysis complete → `(tabs)/scan/results`
- Analysis error → Error state on this screen with "Try Again" button
- Cancel → `(tabs)/scan/index`

---

#### S15: Results (`(tabs)/scan/results`)
**Purpose:** The core value screen. Displays AI analysis results organized by safety classification.

| Element | Details |
|---------|---------|
| Header | Restaurant name (if detected) + scan date |
| Filter pills | "All", "Safe", "Caution", "Avoid" -- horizontal scroll, tap to filter |
| Summary bar | "X safe, Y caution, Z avoid" counts |
| Results list | Scrollable list of dish cards |
| Dish card (safe) | Green left border, checkmark icon, dish name, brief reason ("No allergens detected") |
| Dish card (caution) | Yellow/amber left border, warning icon, dish name, specific risk ("May contain tree nuts in pesto") |
| Dish card (avoid) | Red left border, X icon, dish name, clear reason ("Contains peanuts") |
| Confidence badge | On each card: "High confidence" / "Medium" / "Low -- ask server" |
| Disclaimer footer | "AI analysis may contain errors. Always confirm with your server." |
| New scan button | "Scan Another Menu" (top right or floating) |

**Navigation:**
- Tap dish card → `dish-detail` modal (with scan_item_id)
- "Scan Another Menu" → `(tabs)/scan/camera`
- Back → `(tabs)/scan/index`
- System back/swipe → `(tabs)/scan/index`

---

#### S16: Dish Detail (`dish-detail` -- Modal)
**Purpose:** Deep dive into a single dish's analysis. Presented as a bottom sheet or full modal.

| Element | Details |
|---------|---------|
| Dish name | Large title, with original name if translated (e.g., "Pad Thai (ผัดไทย)") |
| Classification badge | Large colored badge: Safe / Caution / Avoid |
| Confidence level | "High confidence", "Medium confidence", "Low confidence -- verify with server" |
| Likely ingredients | Bulleted list of identified ingredients with allergen highlights |
| Allergens detected | Red-highlighted list of specific allergens found |
| Why this classification | Brief AI explanation ("This dish likely contains peanuts based on the ingredient 'crushed peanuts' in the description") |
| Modification suggestions | Section: "You could ask for..." with specific modifications (e.g., "Ask for pad thai without crushed peanuts and peanut sauce") |
| Server prompts | Section: "Ask your server..." with specific questions (e.g., "Does the curry paste contain shrimp paste?") |
| Disclaimer | "This analysis is AI-generated. Accuracy is not guaranteed. Always confirm with restaurant staff." |
| Close button | X or swipe down to dismiss |

**Navigation:**
- Close → Returns to results list or history detail (wherever it was opened from)

---

#### S17: History List (`(tabs)/history/index`)
**Purpose:** List of all past menu scans in reverse chronological order.

| Element | Details |
|---------|---------|
| Title | "Scan History" |
| Scan cards | Each card: menu photo thumbnail, restaurant name (or "Unknown Restaurant"), date + time, dish count ("12 dishes analyzed"), classification summary ("8 safe, 3 caution, 1 avoid") |
| Empty state | "No scans yet. Scan your first menu!" with arrow pointing to Scan tab |
| Pull to refresh | Refreshes list from Supabase |
| Search bar | Optional: search by restaurant name or date |

**Navigation:**
- Tap scan card → `(tabs)/history/[scanId]`

---

#### S18: History Detail (`(tabs)/history/[scanId]`)
**Purpose:** View results from a past scan. Reuses the same results UI as S15.

| Element | Details |
|---------|---------|
| Same as Results (S15) | Identical layout with all dish cards, filters, etc. |
| Date header | Shows when this scan was taken |
| "Rescan" option | "Your profile has changed since this scan. Rescan?" (if profile was updated after scan date) |

**Navigation:**
- Tap dish card → `dish-detail` modal
- Back → `(tabs)/history/index`

---

#### S19: Profile Home (`(tabs)/profile/index`)
**Purpose:** View dietary profile summary and access settings.

| Element | Details |
|---------|---------|
| Title | "Profile" |
| User info | Email, account creation date |
| Dietary profile card | Summary of allergies (with severity badges), diet types, custom restrictions |
| Edit Profile button | "Edit Profile" → navigates to edit screens |
| Stats section | Total scans, most common cuisine scanned, member since date |
| Settings section | List items: About, Privacy Policy, Terms of Service, Delete Account, Sign Out |
| App version | Small text at bottom: "MenuMind v1.0.0" |

**Navigation:**
- "Edit Profile" → `(tabs)/profile/edit-allergies`
- About → `(tabs)/profile/about`
- Privacy Policy → `(tabs)/profile/privacy-policy`
- Terms of Service → `(tabs)/profile/terms`
- Delete Account → `(tabs)/profile/delete-account`
- Sign Out → Confirms → Clears session → `(auth)/welcome`

---

#### S20: Edit Allergies (`(tabs)/profile/edit-allergies`)
**Purpose:** Modify allergy selections. Same UI as onboarding allergy screen (S06) but with current selections pre-filled.

| Element | Details |
|---------|---------|
| Same as S06 | Pre-filled with current selections |
| Save button | "Save Changes" (replaces "Next") |
| Cancel | Back navigation cancels without saving |

**Navigation:**
- Save → Updates Supabase → Back to `(tabs)/profile/index`
- Cancel/Back → `(tabs)/profile/index` (no changes)

---

#### S21: Edit Diet Type (`(tabs)/profile/edit-diet`)
**Purpose:** Modify diet type selections. Same UI as onboarding diet screen (S07) but pre-filled.

| Element | Details |
|---------|---------|
| Same as S07 | Pre-filled with current selections |
| Save button | "Save Changes" |

**Navigation:**
- Save → Updates Supabase → Back to `(tabs)/profile/index`
- Cancel/Back → `(tabs)/profile/index`

---

#### S22: Edit Severity (`(tabs)/profile/edit-severity`)
**Purpose:** Modify severity levels per allergen. Same UI as onboarding severity screen (S08) but pre-filled.

| Element | Details |
|---------|---------|
| Same as S08 | Pre-filled with current severity levels |
| Save button | "Save Changes" |

**Navigation:**
- Save → Updates Supabase → Back to `(tabs)/profile/index`
- Cancel/Back → `(tabs)/profile/index`

---

#### S23: About (`(tabs)/profile/about`)
**Purpose:** App information, health disclaimer, legal links.

| Element | Details |
|---------|---------|
| App name + version | "MenuMind v1.0.0" |
| Description | Brief app description |
| Health disclaimer | Full disclaimer text (same as S05) |
| Links | Privacy Policy, Terms of Service, Contact/Support email |
| Credits | "Powered by Claude AI" |

**Navigation:**
- Back → `(tabs)/profile/index`

---

#### S24: Privacy Policy (`(tabs)/profile/privacy-policy`)
**Purpose:** Full privacy policy text. Scrollable.

| Element | Details |
|---------|---------|
| Title | "Privacy Policy" |
| Content | Full legal text (scrollable) |
| Last updated date | Shown at top |

**Navigation:**
- Back → `(tabs)/profile/index`

---

#### S25: Terms of Service (`(tabs)/profile/terms`)
**Purpose:** Full terms of service text. Scrollable.

| Element | Details |
|---------|---------|
| Title | "Terms of Service" |
| Content | Full legal text (scrollable) |
| Last updated date | Shown at top |

**Navigation:**
- Back → `(tabs)/profile/index`

---

#### S26: Delete Account (`(tabs)/profile/delete-account`)
**Purpose:** Account deletion with confirmation. Required by App Store and GDPR.

| Element | Details |
|---------|---------|
| Warning title | "Delete Your Account" |
| Warning text | "This will permanently delete your account and all data, including your dietary profile, scan history, and saved photos. This action cannot be undone." |
| Confirmation input | "Type DELETE to confirm" text input |
| Delete button | Destructive style (red), disabled until "DELETE" typed |
| Cancel button | Secondary: "Keep My Account" |

**Navigation:**
- Delete confirmed → Deletes all user data → `(auth)/welcome`
- Cancel → `(tabs)/profile/index`

---

## Error Screens & States

### E01: No Network
**Displayed when:** Device has no internet connection.
| Element | Details |
|---------|---------|
| Icon | Wi-Fi off icon |
| Title | "No Internet Connection" |
| Message | "MenuMind needs an internet connection to analyze menus. Check your connection and try again." |
| Retry button | "Try Again" |

### E02: Camera Permission Denied
**Displayed when:** User denied camera permission.
| Element | Details |
|---------|---------|
| Icon | Camera with lock icon |
| Title | "Camera Access Needed" |
| Message | "MenuMind needs camera access to scan menus. You can enable it in Settings." |
| Open Settings button | Opens iOS Settings app to MenuMind permissions |
| Use Gallery button | "Choose from Photos Instead" |

### E03: Analysis Failed
**Displayed when:** Claude API call fails or times out.
| Element | Details |
|---------|---------|
| Icon | Warning icon |
| Title | "Analysis Failed" |
| Message | "We couldn't analyze this menu. This might be due to a poor photo or a temporary issue." |
| Retry button | "Try Again" (re-sends same photo) |
| Retake button | "Take a New Photo" |

### E04: Unreadable Photo
**Displayed when:** AI reports the image is not a menu or is too blurry.
| Element | Details |
|---------|---------|
| Icon | Image warning icon |
| Title | "Couldn't Read This Menu" |
| Message | "The photo may be too blurry, too dark, or not a menu. Try again with better lighting and a steady hand." |
| Tips | Bulleted tips: "Hold your phone steady", "Ensure good lighting", "Capture the full menu page" |
| Retake button | "Take a New Photo" |

---

## User Flow Diagrams

### Flow A: First-Time User (Cold Start)

```
App Launch
    |
    v
[S01] Welcome
    |
    +--> [S02] Sign In -----> (returning user) ---> [S11] Scan Home
    |                              |
    +--> [S03] Sign Up             +--> [S04] Forgot Password
    |         |
    |         v
    |    (account created)
    |         |
    +--> Apple Sign-In
              |
              v
    [S05] Disclaimer (must accept)
              |
              v
    [S06] Allergies
              |
              v
    [S07] Diet Type
              |
              v
    [S08] Severity (if allergies selected)
              |
              v
    [S09] Custom Restrictions
              |
              v
    [S10] Confirm Profile
              |
              v
    [S11] Scan Home (onboarding complete, never shown again)
```

### Flow B: Core Scan Flow (Returning User)

```
App Launch
    |
    v
[S11] Scan Home
    |
    +--> "Scan Menu" ---------> [S12] Camera
    |                                |
    +--> "Choose from photos"        +--> Capture photo
    |         |                      |         |
    |         v                      |         v
    |    expo-image-picker           |    [S13] Preview
    |         |                      |         |
    |         +----------+-----------+    +--> "Retake" --> [S12]
    |                    |                |
    |                    v                +--> "Analyze"
    |              [S13] Preview                  |
    |                    |                        v
    |                    v                  (upload photo)
    |              [S14] Analyzing                |
    |                    |                        v
    |              +-----+-----+           [S14] Analyzing
    |              |           |                  |
    |              v           v             +----+----+
    |         [S15] Results   [E03/E04]      |         |
    |              |          Error           v         v
    |              |                    [S15] Results  Error
    |              v
    |         Tap dish card
    |              |
    |              v
    |         [S16] Dish Detail (modal)
    |              |
    |              v
    |         Close modal --> back to [S15]
    |
    v
"Scan Another Menu" --> [S12] Camera
```

### Flow C: History Review

```
[S17] History List
    |
    +--> (empty) --> Empty state with CTA to scan
    |
    +--> Tap scan card
              |
              v
         [S18] History Detail
              |
              +--> Tap dish card --> [S16] Dish Detail (modal)
              |
              +--> Back --> [S17]
```

### Flow D: Profile Edit

```
[S19] Profile Home
    |
    +--> "Edit Profile"
    |         |
    |         +--> [S20] Edit Allergies --> Save --> [S19]
    |         +--> [S21] Edit Diet --> Save --> [S19]
    |         +--> [S22] Edit Severity --> Save --> [S19]
    |
    +--> About --> [S23] --> Back --> [S19]
    +--> Privacy Policy --> [S24] --> Back --> [S19]
    +--> Terms --> [S25] --> Back --> [S19]
    +--> Delete Account --> [S26] --> Confirm --> [S01] Welcome
    +--> Sign Out --> Confirm --> [S01] Welcome
```

---

## Tab Bar Configuration

| Tab | Label | Icon | Route | Badge |
|-----|-------|------|-------|-------|
| 1 (Left) | History | `clock` or `clock.arrow.circlepath` (SF Symbol) | `(tabs)/history` | None |
| 2 (Center) | Scan | `camera.viewfinder` (SF Symbol) | `(tabs)/scan` | None |
| 3 (Right) | Profile | `person.crop.circle` (SF Symbol) | `(tabs)/profile` | None |

**Notes:**
- Scan tab is the center tab and the default selected tab on launch
- Tab bar uses iOS-standard styling (translucent background, thin top border)
- Tab bar hides during camera screen (full-screen experience)
- Active tab uses the app's primary color; inactive tabs use system gray

---

## Deep Links & Universal Links (Future)

Not in MVP scope, but the route structure supports future deep linking:

| Link Pattern | Route | Use Case |
|-------------|-------|----------|
| `menumind://scan` | `(tabs)/scan/index` | Widget / notification → open scan |
| `menumind://history/{scanId}` | `(tabs)/history/[scanId]` | Share a past scan result |
| `menumind://profile` | `(tabs)/profile/index` | Settings notification |

---

## Screen Count Summary

| Category | Count | Screens |
|----------|-------|---------|
| Auth | 4 | Welcome, Sign In, Sign Up, Forgot Password |
| Onboarding | 6 | Disclaimer, Allergies, Diet Type, Severity, Custom Restrictions, Confirm |
| Scan | 5 | Scan Home, Camera, Preview, Analyzing, Results |
| History | 2 | History List, History Detail |
| Profile | 8 | Profile Home, Edit Allergies, Edit Diet, Edit Severity, About, Privacy Policy, Terms, Delete Account |
| Shared | 1 | Dish Detail (modal) |
| Error States | 4 | No Network, Camera Denied, Analysis Failed, Unreadable Photo |
| **Total** | **30** | |

---

## Accessibility Notes

- All screens must support Dynamic Type (iOS text scaling)
- Color-coded classifications (green/yellow/red) must also use icons and text labels
- Minimum touch target: 44x44 points (Apple HIG)
- VoiceOver labels on all interactive elements
- Reduced Motion: respect `UIAccessibilityIsReduceMotionEnabled` for animations
- Camera overlay text must have sufficient contrast against the viewfinder

---

## Platform-Specific Considerations

### iOS Permissions
| Permission | `app.json` Key | Usage Description | When Requested |
|-----------|----------------|-------------------|----------------|
| Camera | `NSCameraUsageDescription` | "MenuMind uses your camera to photograph restaurant menus for dietary analysis." | First tap on "Scan Menu" |
| Photo Library | `NSPhotoLibraryUsageDescription` | "MenuMind accesses your photos so you can select menu images for dietary analysis." | First tap on "Choose from Photos" |

### Safe Areas
- All screens respect safe area insets (notch, Dynamic Island, home indicator)
- Camera screen uses full screen (ignores safe areas) except for overlay controls
- Tab bar sits above the home indicator

### Keyboard Handling
- Auth and onboarding screens handle keyboard avoidance (input fields scroll into view)
- "Done" or "Next" keyboard accessory button on form screens
- Keyboard dismisses on tap outside input fields
