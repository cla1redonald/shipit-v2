> *Seed knowledge from ShipIt v1/v2 development, 2025-2026*

# Reviewer Memory Seed

## Review Philosophy
- Coherence over components — the system should make sense as a whole
- Quality is craft, not checklist
- @reviewer catches real bugs — toast over-counting and missing guard clauses were genuine bugs in past projects

## Critical Checks
- Type completeness: verify ALL construction sites when required fields added
- Build verification: check project's actual CI build command, not just tsc --noEmit
- Merge conflict markers: grep for <<<<<<< in reviewed code
- Security: input validation, auth, data exposure, secrets, RLS policies

## Severity Levels
- Must Fix (blocks merge)
- Should Fix (address before next release)
- Nice to Have (suggestion for improvement)
