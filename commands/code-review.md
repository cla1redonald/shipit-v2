---
description: Structured code review for quality and security. Use before merging code or when you want a security/quality audit.
---

# Code Review

Structured code review for quality and security.

## When to Use
Use `/code-review` before merging code or when you want a security/quality audit.

## What This Skill Does

Reviews code against ShipIt standards for:
- Security vulnerabilities
- Code quality
- Performance issues
- Test coverage
- Maintainability

## Review Checklist

### Security (Must Pass)
- [ ] Input validation on all user input
- [ ] No SQL injection risks (parameterised queries)
- [ ] No XSS vulnerabilities
- [ ] Secrets not exposed in code
- [ ] Auth checks on protected routes
- [ ] RLS policies on Supabase tables

### Code Quality
- [ ] Functions are small and focused
- [ ] Names are clear and descriptive
- [ ] No obvious code smells
- [ ] TypeScript types used properly (no unjustified `any`)
- [ ] Error handling is present
- [ ] Type propagation: all construction sites updated for new required fields

### Performance
- [ ] No N+1 query patterns
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Bundle size considered

### Testing
- [ ] Tests exist for new functionality
- [ ] Happy path covered
- [ ] Key error cases covered
- [ ] Tests are meaningful (not just for coverage)
- [ ] Build command matches what CI/Vercel runs

### Maintainability
- [ ] Code is understandable without author explanation
- [ ] No magic numbers/strings
- [ ] Consistent patterns with rest of codebase
- [ ] No dead code
- [ ] No merge conflict markers

## Severity Levels

**Must Fix** - Blocks shipping
- Security vulnerabilities
- Broken functionality
- Data loss risk

**Should Fix** - Should address before shipping
- Code quality issues
- Missing error handling
- Performance concerns

**Nice to Have** - Can ship without
- Style improvements
- Minor optimizations
- Documentation gaps

## Output Format

```markdown
## Code Review: [File/Feature]

### Summary
[One-line assessment]

### Must Fix
1. [Issue] - [File:Line] - [Suggestion]

### Should Fix
1. [Issue] - [File:Line] - [Suggestion]

### Nice to Have
1. [Suggestion]

### Security Audit
- Input validation: Pass/Fail
- Auth/authz: Pass/Fail
- Data exposure: Pass/Fail
- Secrets handling: Pass/Fail

### Verdict
[Ready to ship / Fix and re-review / Major rework]
```
