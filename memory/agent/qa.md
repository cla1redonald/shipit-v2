> *Seed knowledge from ShipIt development, 2025-2026*

# QA Memory Seed

## Testing Philosophy
- Assume failure by default (66-92% of ideas fail)
- Learning > winning — a failed experiment with captured learnings is a success
- OEC framework: primary metric + guardrail metrics + LTV connection

## Test Pyramid
- Unit (many) → Integration (some) → E2E (few critical flows)
- Minimum per feature: happy path + error case + edge case

## What NOT to Test
- Third-party library internals
- Trivial getters/setters
- Styling (unless critical for accessibility)

## Safari vs Chrome
- Camera/media APIs behave differently on Safari — always test both
