# Common Mistakes to Avoid

Patterns from past projects. Every agent should be aware of these.

## Testing Failures

### Shipping Without Tests
PowderPost shipped without any tests despite "tests required" being in docs. Root cause: no hard enforcement. Now enforced with blocking hooks.

### "We'll Add Tests Later"
This never happens. Write tests WITH each feature.

### No Test Infrastructure
Four consecutive commits shipped without tests because the project had no test runner, no test script, no test config. The project was structurally incapable of running tests. **Before writing ANY code, verify test infrastructure exists.**

### Running Wrong Build Command
`tsc --noEmit` and `tsc -b` can produce different results. Always run the project's ACTUAL build command from package.json. The command CI/Vercel runs is the one that matters.

## Infrastructure Failures

### Vercel 4.5MB Body Size Limit
Serverless functions reject requests > 4.5MB (HTTP 413). For file uploads, use direct-to-storage uploads with signed URLs.

### Supabase Client at Module Level
Creating Supabase client at module level crashes the build if env vars are missing. Always lazy-load.

### Supabase RLS Policies
Forgetting to enable RLS is a security hole. Always enable RLS and create policies for SELECT/INSERT/UPDATE/DELETE.

### Environment Variables Not Documented
Causes setup friction. Always maintain .env.example.

### Service Role Keys in Client Code
Security risk. Never expose service role keys client-side.

## Code Failures

### Type Propagation Rule
When adding a required field to a TypeScript type, grep the ENTIRE codebase for every construction site. The places that get missed: migration functions, test fixtures, factory functions, mock data, seed scripts, default objects.

### Merge Conflict Markers Left in Code
After rebase/merge, always: (1) grep for conflict markers, (2) run actual build command, (3) run full test suite. A partial conflict resolution is worse than none.

### Silent API Failures
`setPosts(data.posts || [])` silently swallows API errors. Always show errors to users during development.

### Hardcoded Counts Across Files
When numeric metadata (test counts, version numbers) are hardcoded in multiple files, they drift silently. Store in single source of truth.

## Process Failures

### @retro Skipped at End
The orchestrator's summary feels like a "done" state — it forgets to invoke @retro after. Fix: @retro runs BEFORE the summary.

### Skipped Agents Without Justification
There's a difference between "not needed" and "forgot." All agents must be explicitly listed as Invoke or Skip (with reason).

### Documentation Drift
When @docs is skipped, no one checks if existing docs are still accurate. Always assess documentation impact before shipping.

### Background Agents Can't Run Bash
Agents spawned in background mode have bash auto-denied. Agents needing bash (@engineer, @devsecops, @qa) must run in foreground.

### Documenting Before Testing
We documented "agents can invoke each other via Task tool" without testing it. They can't — only the parent has Task tool. Always test capabilities before documenting them.

## UX/UI Failures

### Generic Styling
Default Bootstrap/generic styling looks amateur. Use professional color palettes with proper contrast ratios.

### Desktop-Only Testing
Always test on mobile. Mobile-first responsive design saves rework.

### Dashed Borders
Look "wireframey." Use solid subtle borders or card shadows for polish.

### Low Contrast Text
Always test text colors visually. `text-slate-800` on `bg-slate-100` can be hard to read despite looking fine in code.
