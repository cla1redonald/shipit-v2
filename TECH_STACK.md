# Tech Stack: MenuMind

> **Status:** Locked
> **Created:** February 6, 2026
> **Architect:** @architect
>
> This is a locked dependency manifest. @engineer must not introduce packages outside this list without flagging to @architect for review. All versions are pinned.

---

## Core

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~52.0.3 | Expo SDK — managed workflow for React Native |
| `expo-router` | ~4.0.17 | File-based routing for React Native (like Next.js App Router) |
| `react` | 18.3.1 | UI library |
| `react-native` | 0.76.7 | Mobile framework (bundled with Expo SDK 52) |
| `typescript` | ~5.3.3 | Language (strict mode) |

## Navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | ~4.0.17 | File-based routing (listed above, repeated for clarity) |
| `react-native-screens` | ~4.4.0 | Native screen containers (Expo SDK 52 compatible) |
| `react-native-safe-area-context` | 4.12.0 | Safe area insets for all iPhone models |
| `@react-navigation/bottom-tabs` | ^7.2.0 | Tab navigator (used by expo-router tabs layout) |

## Camera & Image

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-camera` | ~16.0.13 | Native camera access for menu photo capture |
| `expo-image-picker` | ~16.0.6 | Gallery photo selection |
| `expo-image-manipulator` | ~13.0.6 | On-device image compression/resize before upload |

## Backend & Auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.49.1 | Supabase client (Database, Auth, Storage, Functions) |
| `expo-secure-store` | ~14.0.1 | iOS Keychain-backed secure storage for auth tokens |
| `expo-apple-authentication` | ~7.1.3 | Apple Sign-In native module |

## State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.3 | Client state management (3 stores: auth, profile, scan) |

## Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `nativewind` | ^4.1.23 | Tailwind CSS for React Native (compiled to StyleSheet) |
| `tailwindcss` | ^3.4.17 | Tailwind CSS engine (build-time, used by NativeWind) |
| `react-native-reanimated` | ~3.16.7 | Smooth animations, shared element transitions |
| `expo-haptics` | ~14.0.1 | Haptic feedback on key interactions |
| `expo-linear-gradient` | ~14.0.2 | Gradient backgrounds for onboarding/welcome screens |

## Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3.24.1 | Runtime schema validation (forms, API responses, Edge Function payloads) |

## Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-constants` | ~17.0.5 | Access app config values (environment variables) |
| `expo-linking` | ~7.0.5 | Deep linking support (future) |
| `expo-splash-screen` | ~0.29.22 | Splash screen management during app load |
| `expo-status-bar` | ~2.0.1 | Status bar appearance control |
| `expo-font` | ~13.0.4 | Custom font loading (if needed beyond SF Pro) |
| `react-native-gesture-handler` | ~2.20.2 | Touch gesture handling (bottom sheets, swipe) |
| `date-fns` | ^4.1.0 | Date formatting for scan history timestamps |

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^29.7.0 | Test runner |
| `jest-expo` | ~52.0.3 | Expo-specific Jest preset |
| `@testing-library/react-native` | ^12.9.0 | Component testing utilities |
| `@testing-library/jest-native` | ^5.4.3 | Custom Jest matchers for React Native |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~5.3.3 | TypeScript compiler |
| `@types/react` | ~18.3.18 | React type definitions |
| `eslint` | ^9.18.0 | Linting |
| `eslint-config-expo` | ~8.0.1 | Expo ESLint preset |
| `prettier` | ^3.4.2 | Code formatting |
| `@babel/core` | ^7.26.0 | Babel compiler (required by Expo) |

## Edge Function (Supabase Deno Runtime)

These dependencies are used in the Supabase Edge Function, NOT in the client bundle.

| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | (Deno import) | Claude API client (Deno-compatible) |
| `zod` | (Deno import) | Response validation in Edge Function |

Edge Functions run on Deno. Dependencies are imported via URL (e.g., `https://esm.sh/`), not npm.

---

## Build & Distribution

| Tool | Version | Purpose |
|------|---------|---------|
| EAS CLI | ^13.4.0 | Expo Application Services (build + submit) |
| EAS Build | cloud | Cloud builds for iOS (no local Xcode required) |
| EAS Submit | cloud | Submit to TestFlight and App Store |

## CI/CD

| Tool | Purpose |
|------|---------|
| GitHub Actions | Lint, type-check, test on PR |
| EAS Build (CI) | Triggered on merge to main for preview builds |

## Deployment

- **App Distribution:** Apple App Store (via EAS Submit)
- **Beta Testing:** TestFlight (via EAS Submit)
- **Backend:** Supabase (hosted, managed)
- **Edge Functions:** Supabase Edge Functions (Deno runtime, deployed via Supabase CLI)
- **Storage:** Supabase Storage (S3-compatible, managed)
- **Database:** Supabase PostgreSQL (managed, with automatic backups)

---

## Explicitly Excluded

| Package | Reason |
|---------|--------|
| `next` / `next.js` | This is a React Native mobile app, not a web app. Expo Router replaces Next.js App Router. |
| `redux` / `@reduxjs/toolkit` | Overkill for 3 stores. Zustand is lighter, less boilerplate, TypeScript-native. |
| `react-native-paper` | Material Design aesthetic; we want iOS-native feel. NativeWind + custom components instead. |
| `tamagui` | Heavy, complex setup, overkill for this scope. NativeWind is simpler and sufficient. |
| `styled-components` / `emotion` | Unnecessary with NativeWind providing Tailwind utilities. |
| `axios` | `fetch` is built into React Native and Supabase client handles API calls. |
| `react-query` / `@tanstack/react-query` | Adds complexity. Zustand stores + direct Supabase calls are sufficient for v1. Reconsider for v2 if caching needs grow. |
| `firebase` | Supabase is the chosen backend. No dual backend. |
| `expo-notifications` | Out of scope for v1. No push notifications. |
| `react-native-maps` | Out of scope for v1. No location/map features. |
| `sentry-expo` | Deferred to v1.1. Use console logging + Supabase logs for v1. |
| `posthog-react-native` | Deferred to v1.1. No analytics in v1. |
| `react-native-purchases` (RevenueCat) | Deferred to post-validation. No monetization in v1. |
| `@react-native-async-storage/async-storage` | Use `expo-secure-store` for auth tokens. Zustand handles in-memory state. No general async storage needed. |
| `expo-file-system` | `expo-image-manipulator` handles image processing. No direct file system access needed. |
| `react-native-webview` | No web views needed. Privacy policy and terms are native ScrollViews with text. |

---

## Version Compatibility Notes

- **Expo SDK 52** requires React Native 0.76.x and React 18.3.x. Do not upgrade React to 19.x until Expo SDK supports it.
- **NativeWind v4** requires Tailwind CSS 3.4.x. NativeWind v4 does not yet support Tailwind v4.
- **expo-camera v16** uses the new Camera API (replaces deprecated `Camera` component). Use `CameraView` component.
- **Zustand v5** has a slightly different API from v4 (no `create` default export). Import `{ create }` from `zustand`.
- **Jest + jest-expo** must match the Expo SDK version. Use `jest-expo@~52.0.x` with SDK 52.

---

## Environment Variables

```bash
# .env.example — client-side (committed to repo)

# Supabase (public, embedded in client bundle)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App metadata
EXPO_PUBLIC_APP_NAME=MenuMind
EXPO_PUBLIC_APP_VERSION=1.0.0
```

```bash
# Edge Function env — set via Supabase dashboard (NEVER in client .env)

ANTHROPIC_API_KEY=sk-ant-api03-...
# Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected
# into Edge Functions by Supabase. Do not set manually.
```

---

## Minimum Platform Requirements

| Requirement | Value |
|-------------|-------|
| iOS minimum version | 16.0 |
| iPhone models supported | iPhone 12 and later |
| Xcode (for EAS Build) | 15.0+ (cloud build handles this) |
| Node.js (development) | 20.x LTS |
| npm (development) | 10.x |
