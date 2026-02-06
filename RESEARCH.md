# MenuMind — Competitive Research

> Research by @researcher, February 6, 2026

## Direct Competitors (Closest to MenuMind)

| App | What It Does | Pricing | Status |
|-----|-------------|---------|--------|
| **Happy Munch** | Photo menu scanner for allergies + diets + fitness. 99% claimed allergen accuracy. Waiter Mode with language cards in 50+ languages. | Free (5 scans/mo), $2.99/wk, $6.99/mo, $39.99/yr | Brand new, minimal reviews |
| **SafeEat** | AI scanner for labels, barcodes, menus, and food photos. 250+ allergy options. | Unknown | New entrant |
| **Nellia** | AI menu scanner for dietary restrictions | Unknown | Early stage |
| **SafeAllergy** | Scans ingredients, menus, cosmetics. 2M+ product database. | Free | 65 downloads total |
| **Safe Eats AI** | Menu scanning with dietary filters. On-device processing. | Unknown | New App Store entrant |
| **Allergy Scanner** | Photo-based allergen risk assessment | Unknown | New |
| **MenuFit AI** | Gemini 1.5-powered menu photo analysis for nutrition/diets | Unknown | New |

## Adjacent Solutions

### Allergy Database/Community Apps
- **Spokin** — 73K+ community restaurant reviews across 80 countries, 400+ crowd-reported hidden allergens. FREE. Strong trust.
- **Fig** — 1M+ members, barcode scanner for 300K+ grocery products, 2,800+ dietary options. $5.99/mo or $39.99/yr. 4.6 stars.
- **Allergy Force** — FDA recall alerts, EpiPen reminders, barcode scanner.

### Label Scanners
- **Foodient** — AI photo scanning of ingredient lists. 4.9 stars. Sensitivity granularity (low to severe).
- **Soosee** — Live AR camera overlay on ingredient labels. 15+ languages.
- **Emma** — AI food scanner, reads labels in any language. #3 Product of the Day on Product Hunt.

### Platform-Level Competition
- **Google Lens** — AR menu translation + popular dish highlighting + ingredient info from Maps data. Free, built into Android.
- **Apple Live Text** — Camera-based text recognition and translation. Free, built into iPhone.

## What's Working (Learn From)

1. **Community trust (Spokin)** — Users trust peer reviews from people with the same allergies
2. **Breadth of dietary support (Fig)** — 2,800+ options including rare conditions (low histamine, Alpha-Gal)
3. **Speed and simplicity** — Scan → answer → breathe easy
4. **Waiter Mode / Language cards** — Travelers love showing allergy cards to staff
5. **Sensitivity granularity (Foodient)** — Not all reactions are binary, severity levels matter
6. **Offline capability** — Works in restaurants with poor connectivity

## What's Missing (Our Opportunity)

### No Single App Covers the Full Restaurant Experience
- Allergy apps focus on **grocery barcodes**, not restaurant menus
- Menu apps focus on **translation**, not allergen detection
- Nobody seamlessly combines: photograph menu + match dietary profile + show safe/risky + explain WHY

### Accuracy Failures Are Rampant
- Nosher: "misses obvious allergens," false "safe" readings
- Fig: incorrect cross-contact/shared-line data (per SnackSafely.com)
- Study: only 36% of food allergy apps detected all 14 EU-mandated allergens

### Limited "Why" Explanations
- Apps give binary safe/unsafe without explaining which ingredient triggered the flag
- Users want to understand reasoning to make their own decisions

### Cross-Contamination Blindness
- AI cannot detect shared fryers, cross-contact, or undeclared "natural flavors"
- No app addresses this well

### Religious/Cultural Diets Underserved
- Halal and kosher support is rare in the allergy app space

### Fragmented Ecosystem
- Users currently need 2-3 apps: grocery scanning + restaurant discovery + menu translation

## Pricing Landscape

| Model | Examples | Price Range |
|-------|----------|-------------|
| **Freemium (gated scans)** | Happy Munch, Fig | 3-5 free/month, $4-7/mo or $30-50/yr |
| **Lifetime purchase** | Nosher | One-time fee |
| **Free** | Spokin, SafeAllergy | No revenue model (or restaurant partnerships) |
| **Per-use credits** | Equal Eats | Per-card purchase |

**Industry standard:** Freemium with gated scans, $5-7/month or ~$40/year.

## Tech Approaches

| Approach | Used By | Accuracy | Limitations |
|----------|---------|----------|-------------|
| **Barcode + database lookup** | Fig, Soosee, Allergy Force | High (for packaged goods) | Only works with barcodes, not menus |
| **OCR on ingredient labels** | Nosher, AllerScan | 85-90% on typical text | Struggles with small text, stylized fonts |
| **Vision AI on menu photos** | Happy Munch, SafeEat, MenuFit AI | Context-dependent | Infers ingredients from dish names, not actual recipes |
| **Community/crowdsourced** | Spokin, AllergyEats | Varies | Goes stale without active maintenance |
| **Specialized OCR pipeline** | Zomato (internal) | 95%+ with fine-tuning | Requires massive training data |

## Key Takeaway

### Our Strongest Differentiator
The **unified "photo-to-verdict" experience across ALL dietary needs**. The market is fragmented — allergy apps ignore keto/halal/vegan, diet apps ignore allergens, translation apps don't filter by dietary needs. No dominant app spans allergies + medical diets + lifestyle diets + religious requirements in one profile, with clear explanations of WHY each dish is flagged.

**Happy Munch** is the closest competitor but is brand new with minimal reviews and unproven accuracy. The timing is right — multimodal AI has only recently made reliable menu photo interpretation feasible.

### Our Biggest Risk
**Accuracy liability in a safety-critical domain.** Food allergies can be fatal. The entire competitive landscape is plagued by accuracy failures. A single high-profile failure could destroy the brand. MenuMind must:
1. Communicate uncertainty clearly (confidence levels, not binary safe/unsafe)
2. Position as assistance tool, not medical device (UX-integrated disclaimers)
3. Actively encourage confirmation with restaurant staff

**Secondary risk:** Platform commoditization. Google Lens and Apple Intelligence could add dietary filtering to their free built-in tools.

---

## Sources

Full source list available in researcher output. Key sources include App Store listings, Spokin, Fig, SnackSafely.com, PMC studies, Product Hunt, and tech blogs.
