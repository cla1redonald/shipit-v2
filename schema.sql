-- =============================================================================
-- MenuMind Database Schema
-- =============================================================================
-- Supabase PostgreSQL schema for MenuMind iOS app.
-- Includes tables, indexes, RLS policies, storage bucket, and storage policies.
--
-- Apply via: supabase db push (or copy into Supabase SQL Editor)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
-- uuid-ossp is enabled by default in Supabase, but ensure it's available.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Custom Types
-- ---------------------------------------------------------------------------

-- Classification enum for scan items
CREATE TYPE dish_classification AS ENUM ('safe', 'caution', 'avoid');

-- Confidence enum for scan items
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- Severity enum for allergen severity levels
CREATE TYPE severity_level AS ENUM ('mild', 'moderate', 'severe');

-- Scan status enum
CREATE TYPE scan_status AS ENUM ('uploading', 'analyzing', 'complete', 'error');

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- ---- profiles ----
-- One row per user. Stores dietary preferences and onboarding state.
-- Allergies and severity levels are stored as structured JSONB for flexibility
-- (new allergens can be added without schema migration).
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    allergies       JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- Array of allergen strings, e.g. ["peanuts", "dairy", "shellfish"]
    diet_types      JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- Array of diet type strings, e.g. ["vegan", "low_fodmap"]
    severity_levels JSONB NOT NULL DEFAULT '{}'::jsonb,
        -- Map of allergen -> severity, e.g. {"peanuts": "severe", "dairy": "mild"}
    custom_restrictions TEXT[] NOT NULL DEFAULT '{}',
        -- Free-text restrictions, e.g. {"No cilantro", "Avoid spicy food"}
    disclaimer_accepted_at TIMESTAMPTZ,
        -- NULL = disclaimer not yet accepted. Must be non-null to use the app.
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
        -- True after user completes the full onboarding flow.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profiles IS 'User dietary profiles. One row per user. Stores allergies, diet types, severity levels, and onboarding state.';

-- ---- scans ----
-- One row per menu scan. Stores the photo reference, AI response, and metadata.
CREATE TABLE scans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url           TEXT,
        -- Supabase Storage path (not the signed URL). e.g. "menu-photos/{user_id}/{id}.jpg"
    status              scan_status NOT NULL DEFAULT 'uploading',
    restaurant_name     TEXT,
        -- AI-detected from menu content. NULL if not detected.
    language_detected   TEXT,
        -- ISO 639-1 code (e.g. "en", "ja", "zh"). NULL if not detected.
    raw_api_response    JSONB,
        -- Full Claude API response stored for debugging and prompt improvement.
    error_code          TEXT,
        -- Error code if status = 'error'. e.g. 'UNREADABLE_IMAGE', 'API_ERROR'
    error_message       TEXT,
        -- Human-readable error message if status = 'error'.
    item_count          INTEGER NOT NULL DEFAULT 0,
        -- Denormalized count of scan_items for history list display.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER scans_updated_at
    BEFORE UPDATE ON scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE scans IS 'Menu scans. One row per photo analyzed. Stores image reference, AI response, and scan metadata.';

-- ---- scan_items ----
-- One row per dish identified in a scan. Core analysis output.
CREATE TABLE scan_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id                 UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    dish_name               TEXT NOT NULL,
        -- Translated name (English) if menu was in another language.
    original_name           TEXT,
        -- Original name from menu if translated. NULL if menu was in English.
    classification          dish_classification NOT NULL,
        -- safe, caution, or avoid
    confidence              confidence_level NOT NULL,
        -- high, medium, or low
    likely_ingredients      JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- Array of ingredient strings identified by AI.
    allergens_detected      TEXT[] NOT NULL DEFAULT '{}',
        -- Array of allergen names detected in this dish.
    modification_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
        -- Array of modification strings, e.g. ["Ask for pad thai without crushed peanuts"]
    server_prompts          TEXT[] NOT NULL DEFAULT '{}',
        -- Array of questions to ask the server, e.g. ["Does the curry paste contain shrimp paste?"]
    reasoning               TEXT,
        -- AI explanation for the classification decision.
    sort_order              INTEGER NOT NULL DEFAULT 0,
        -- Order of dish as it appeared on the menu (for display consistency).
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE scan_items IS 'Individual dish analysis results. One row per dish in a scan. Contains classification, ingredients, and recommendations.';

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

-- profiles: lookup by user_id (unique constraint already creates this)
-- No additional index needed since user_id has UNIQUE constraint.

-- scans: list scans for a user, ordered by most recent first (history screen)
CREATE INDEX idx_scans_user_id_created_at
    ON scans (user_id, created_at DESC);

-- scans: filter by status (for admin/monitoring queries)
CREATE INDEX idx_scans_status
    ON scans (status)
    WHERE status != 'complete';

-- scan_items: list items for a scan, in display order
CREATE INDEX idx_scan_items_scan_id_sort_order
    ON scan_items (scan_id, sort_order);

-- scan_items: filter by classification (for results screen filtering)
CREATE INDEX idx_scan_items_scan_id_classification
    ON scan_items (scan_id, classification);

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security (RLS)
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_items ENABLE ROW LEVEL SECURITY;

-- ---- profiles RLS ----

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ---- scans RLS ----

CREATE POLICY "Users can view own scans"
    ON scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
    ON scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
    ON scans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
    ON scans FOR DELETE
    USING (auth.uid() = user_id);

-- ---- scan_items RLS ----
-- scan_items uses a join check: the parent scan must belong to the requesting user.

CREATE POLICY "Users can view own scan items"
    ON scan_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = scan_items.scan_id
            AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own scan items"
    ON scan_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = scan_items.scan_id
            AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own scan items"
    ON scan_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = scan_items.scan_id
            AND scans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = scan_items.scan_id
            AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own scan items"
    ON scan_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = scan_items.scan_id
            AND scans.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- 5. Service Role Policies for Edge Function
-- ---------------------------------------------------------------------------
-- The Edge Function uses the service role key to bypass RLS when writing
-- scan results. This is necessary because the Edge Function writes on behalf
-- of the user after analyzing the menu photo.
--
-- The service role key automatically bypasses RLS in Supabase, so no
-- additional policies are needed for the Edge Function.
--
-- IMPORTANT: The Edge Function MUST validate that the scan belongs to the
-- authenticated user before writing results (defense in depth).

-- ---------------------------------------------------------------------------
-- 6. Storage Bucket
-- ---------------------------------------------------------------------------

-- Create the menu-photos storage bucket (private, not public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'menu-photos',
    'menu-photos',
    false,                          -- Private bucket (requires signed URLs)
    5242880,                        -- 5MB max file size (compressed images should be <2MB)
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ---------------------------------------------------------------------------
-- 7. Storage Policies
-- ---------------------------------------------------------------------------
-- Storage policies use the path convention: menu-photos/{user_id}/{filename}

-- Users can upload photos to their own directory
CREATE POLICY "Users can upload own menu photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can view their own photos (for signed URL access)
CREATE POLICY "Users can view own menu photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'menu-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own photos (for account deletion)
CREATE POLICY "Users can delete own menu photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'menu-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role (Edge Function) can read any photo in the bucket
-- (needed to fetch the image for Claude API analysis)
-- Note: Service role bypasses RLS by default, so this is implicit.

-- ---------------------------------------------------------------------------
-- 8. Helper Functions
-- ---------------------------------------------------------------------------

-- Function to delete all data for a user (account deletion).
-- Called from the client via RPC or from an Edge Function.
-- Uses SECURITY DEFINER to bypass RLS for cross-table cleanup.
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Verify the caller is deleting their own data
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: cannot delete another user''s data';
    END IF;

    -- Delete storage objects (menu photos)
    DELETE FROM storage.objects
    WHERE bucket_id = 'menu-photos'
    AND (storage.foldername(name))[1] = target_user_id::text;

    -- Delete scan items (cascade from scans handles this, but explicit for clarity)
    DELETE FROM scan_items
    WHERE scan_id IN (
        SELECT id FROM scans WHERE user_id = target_user_id
    );

    -- Delete scans
    DELETE FROM scans WHERE user_id = target_user_id;

    -- Delete profile
    DELETE FROM profiles WHERE user_id = target_user_id;

    -- Note: The auth.users row should be deleted via Supabase Auth API
    -- (supabase.auth.admin.deleteUser()) from the client or Edge Function,
    -- which triggers the ON DELETE CASCADE on foreign keys.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_user_data IS 'Deletes all user data (profile, scans, scan items, storage objects) for account deletion. GDPR and App Store compliance.';

-- ---------------------------------------------------------------------------
-- 9. Edge Function Specification: analyze-menu
-- ---------------------------------------------------------------------------
--
-- This section documents the Edge Function contract. The actual function
-- code lives in supabase/functions/analyze-menu/index.ts.
--
-- Endpoint: POST /functions/v1/analyze-menu
-- Auth: Required (Bearer token from Supabase Auth)
--
-- Request body:
-- {
--   "scan_id": "uuid",           -- Pre-created scan row ID
--   "image_url": "string",       -- Signed URL from Supabase Storage
--   "dietary_profile": {
--     "allergies": ["string"],
--     "diet_types": ["string"],
--     "severity_levels": {"allergen": "severity"},
--     "custom_restrictions": ["string"]
--   }
-- }
--
-- Success response:
-- {
--   "success": true,
--   "data": {
--     "scan_id": "uuid",
--     "restaurant_name": "string | null",
--     "language_detected": "string | null",
--     "dishes": [
--       {
--         "dish_name": "string",
--         "original_name": "string | null",
--         "classification": "safe | caution | avoid",
--         "confidence": "high | medium | low",
--         "likely_ingredients": ["string"],
--         "allergens_detected": ["string"],
--         "modification_suggestions": ["string"],
--         "server_prompts": ["string"],
--         "reasoning": "string"
--       }
--     ]
--   }
-- }
--
-- Error response:
-- {
--   "success": false,
--   "error": {
--     "code": "UNREADABLE_IMAGE | API_ERROR | RATE_LIMITED | TIMEOUT | INVALID_REQUEST | NOT_A_MENU",
--     "message": "string",
--     "retryable": boolean
--   }
-- }
--
-- Behavior:
-- 1. Validates request payload (Zod)
-- 2. Verifies scan_id belongs to the authenticated user
-- 3. Updates scan status to 'analyzing'
-- 4. Fetches image from signed URL
-- 5. Converts image to base64
-- 6. Assembles Claude API prompt with dietary profile
-- 7. Calls Claude API (claude-sonnet-4-20250514, temperature=0, max_tokens=4096)
-- 8. Validates response against expected schema
-- 9. Writes to scans (raw_api_response, restaurant_name, language_detected, status='complete')
-- 10. Inserts scan_items rows (one per dish)
-- 11. Updates scans.item_count
-- 12. Returns parsed results to client
--
-- On error:
-- 1. Updates scan status to 'error' with error_code and error_message
-- 2. Returns error response to client
--
-- Retry policy:
-- - Up to 2 retries on Claude API 5xx or timeout
-- - Exponential backoff: 1s, 3s
-- - No retry on 4xx, rate limit, or auth errors
--
-- Environment variables (set in Supabase dashboard):
-- - ANTHROPIC_API_KEY: Claude API key (required)
-- - SUPABASE_URL: Auto-injected by Supabase
-- - SUPABASE_SERVICE_ROLE_KEY: Auto-injected by Supabase
--
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 10. Seed Data (Development Only)
-- ---------------------------------------------------------------------------
-- Uncomment for local development with Supabase CLI.
--
-- INSERT INTO auth.users (id, email) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'test@menumind.dev');
--
-- INSERT INTO profiles (user_id, allergies, diet_types, severity_levels, custom_restrictions, disclaimer_accepted_at, onboarding_completed)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   '["peanuts", "shellfish"]'::jsonb,
--   '["vegetarian"]'::jsonb,
--   '{"peanuts": "severe", "shellfish": "moderate"}'::jsonb,
--   ARRAY['No cilantro'],
--   now(),
--   true
-- );
