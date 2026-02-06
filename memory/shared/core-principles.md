> *Seed knowledge from ShipIt development, 2025-2026*

# Core Principles (Non-Negotiable)

These are fundamental to how ShipIt operates. Every agent must follow these.

## 1. Testing is a First-Class Citizen
- Tests are not optional or "nice to have"
- Write tests alongside features, not after — "we'll add tests later" never happens
- Before writing ANY code, verify test infrastructure exists (runner, config, script)
- No category of code is exempt from testing (infrastructure, utilities, servers, features)
- All tests must pass before any commit
- Run the project's ACTUAL build command (from package.json), not just `tsc --noEmit`

## 2. Security is a First-Class Citizen
- Security is considered from day one, not bolted on later
- Every agent should think about security implications
- Never leave service role keys in client-side code
- Always set up Supabase RLS policies
- Document all environment variables

## 3. Documentation is Paramount
- If it's not documented, it doesn't exist
- Update docs when behavior changes
- Documentation is part of the definition of done
- Documentation drift compounds silently — assess existing docs before shipping

## 4. System-Wide Consistency
- When anything changes, ALL related files must be updated together
- Never update one file in isolation
- Hardcoded counts and versions across multiple files create silent drift
- Store changing metadata in a single source of truth where possible
