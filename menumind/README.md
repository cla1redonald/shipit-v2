# MenuMind

> Snap a menu. Know what's safe.

AI-powered iPhone app that photographs restaurant menus and uses Claude Vision to classify dishes as safe/caution/avoid based on your dietary profile.

## Features

- **Dietary Profile Setup** — Onboarding flow for allergies, diet types, severity levels
- **Menu Scanning** — Camera capture or photo gallery selection
- **AI Analysis** — Claude Vision classifies every dish with confidence levels
- **Color-Coded Results** — Green (safe), yellow (caution), red (avoid)
- **Dish Details** — Ingredients, allergen warnings, modification suggestions, server prompts
- **Multi-Language** — Works on menus in any language
- **Scan History** — Review past analyses
- **Safety Disclaimers** — Health disclaimers on every results screen

## Tech Stack

- **Framework:** React Native + Expo SDK
- **Language:** TypeScript (strict)
- **Routing:** Expo Router (file-based)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **AI:** Claude Vision API (via Supabase Edge Function)
- **State:** Zustand
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Testing:** Jest + ts-jest

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Apply database schema
# Run schema.sql in your Supabase SQL editor

# Start development server
npx expo start
```

## Project Structure

```
app/              # Expo Router screens (file-based routing)
├── (auth)/       # Authentication screens
├── (onboarding)/ # First-launch onboarding flow
├── (tabs)/       # Main app with tab navigation
│   ├── scan/     # Camera capture + results
│   ├── history/  # Past scan history
│   └── profile/  # Settings + profile editing
└── dish-detail   # Dish detail modal

src/
├── components/ui/  # Reusable UI components
├── constants/      # Allergen + diet type data
├── services/       # Supabase client + API services
├── stores/         # Zustand state management
├── types/          # TypeScript type definitions
└── utils/          # Image compression utilities

supabase/
└── functions/
    └── analyze-menu/  # Edge Function for Claude API proxy
```

## Architecture

Three-tier mobile architecture:
1. **Client** — React Native + Expo (camera, UI, local state)
2. **API** — Supabase Edge Functions (Claude API proxy, keeping API key server-side)
3. **Data** — Supabase PostgreSQL + Storage (profiles, scans, menu photos)

The Claude API key never leaves the server. All analysis goes through the Edge Function.
