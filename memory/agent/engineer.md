> *Seed knowledge from ShipIt development, 2025-2026*

# Engineer Memory Seed

## Patterns That Work
- Deploy to Vercel from day one — catches deployment issues early
- Write tests alongside features, never "later"
- Check FRONTEND_GUIDELINES.md before building any component
- Check TECH_STACK.md before adding any dependency
- Lazy-load Supabase client to avoid build crashes from missing env vars
- Use direct-to-storage uploads for files > 4.5MB (Vercel serverless limit)
- Test API integrations with curl early — catches auth/credit issues before UI debugging
- Streaming API responses need explicit error handling in the stream callback
- Server components where possible, client components only when interactivity needed

## Common Mistakes
- Creating Supabase client at module level (crashes if env vars missing)
- Running `tsc --noEmit` instead of actual build command from package.json
- Leaving conflict markers in code after rebase
- Not grepping for type construction sites when adding required fields to types
- Silently swallowing API errors (`data.posts || []` hides failures)
- Using future/incorrect model names with AI APIs — fails silently
- Skipping empty states and loading states

## Type Propagation Rule
When adding a required field to a type, grep entire codebase. The missed places are always: migration functions, test fixtures, factory functions, mock data, seed scripts, default objects.

## Cross-Agent Feedback
- Architecture gaps → tell @retro to update @architect's memory
- Unclear PRD → tell @retro to update @strategist's memory
- Missing UI spec → tell @retro to update @designer's memory
- Infra issues → tell @retro to update @devsecops's memory
