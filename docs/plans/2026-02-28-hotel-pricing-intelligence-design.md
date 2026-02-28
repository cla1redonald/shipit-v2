# AI Hotel Pricing Intelligence — Design Document

**Date:** 2026-02-28
**Status:** Approved
**Author:** Claire Donald + ShipIt agents

## Problem

Claire's portfolio (9 projects) is strong on UI/UX apps and API wrappers but has no project demonstrating vector databases, semantic search, or dynamic pricing. These are the "harder" AI patterns that signal depth beyond calling an LLM endpoint. A 10th project filling this gap completes the portfolio.

## Solution

An AI-powered hotel search engine for London that combines semantic search (Pinecone), dynamic pricing with transparent factor breakdowns, and LLM-generated booking insights. The user describes what they want in natural language and gets results ranked by semantic relevance with full pricing transparency.

## Core Experience

User types: *"quiet boutique hotel near Covent Garden with a rooftop bar"*

Each result shows:

1. **Semantic match score** — how well the hotel matches the described vibe (from Pinecone cosine similarity)
2. **Dynamic price breakdown** — tonight's rate as a product of visible factors:
   - Base rate (from dataset)
   - Demand multiplier (mapped from simulated occupancy)
   - Seasonality multiplier (month-based, London calendar)
   - Lead-time factor (days until check-in)
   - Day-of-week weight (weekday discount, weekend premium)
3. **7-day price projection** — chart showing projected rate over the next week based on demand trend
4. **Competitive set** — 3 semantically similar hotels nearby (Pinecone nearest-neighbors) with price comparison
5. **Claude insight** — 1-2 sentence booking advice streamed async ("This hotel is 15% above its comp set but demand is rising — book now or try [Alternative] at £195")

## Architecture

### System Diagram

```
User query (natural language)
  → OpenAI text-embedding-3-small (generate query vector)
  → Pinecone (similarity search + metadata filtering)
  → Supabase Postgres (enrich with pricing factors + metadata)
  → Pricing Engine (calculate dynamic rate per hotel)
  → Claude API (async — generate booking insight per result)
  → Frontend (results + price breakdown + projection chart)
```

### Architecture Decision: Pinecone vs pgvector

Supabase pgvector could handle 1,000 vectors. Pinecone was chosen deliberately because:

- **Portfolio signal:** Demonstrates knowledge of purpose-built vector infrastructure, not just a Postgres extension
- **Metadata filtering:** Pinecone's native metadata filters (neighborhood, star rating, base rate) enable hybrid search (semantic + structured) cleanly
- **Separation of concerns:** Vector search and relational pricing data are different workloads with different query patterns

This tradeoff should be documented in the project README as an Architecture Decision Record.

### Two Data Stores

| Store | Contains | Why |
|-------|----------|-----|
| **Pinecone** | Hotel embeddings (from review text) + metadata (neighborhood, star_rating, base_rate_gbp) | Semantic similarity search + competitive set nearest-neighbor queries |
| **Supabase Postgres** | Hotel details, amenities, pricing factors (JSONB), demand simulation data | Relational queries, pricing calculation, structured data enrichment |

### Data Model

```typescript
// Supabase: hotels table
interface Hotel {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  star_rating: number;
  base_rate_gbp: number;
  review_summary: string;       // concatenated top reviews (source for embedding)
  amenities: string[];
  pricing_factors: {             // JSONB column
    demand_curve: number[];      // 7 values, one per day-of-week
    seasonality: number[];       // 12 values, one per month
    occupancy_base: number;      // simulated occupancy %
  };
  pinecone_id: string;
  created_at: string;
}

// Pinecone: hotel vectors
// id: hotel.pinecone_id
// values: embedding of review_summary (1536 dimensions)
// metadata: { neighborhood, star_rating, base_rate_gbp, name }
```

## Pricing Model

**Formula:** `price = base_rate × demand × seasonality × lead_time × day_of_week`

All factors are multiplicative (they compound, not add).

| Factor | Range | Source |
|--------|-------|--------|
| Demand | 0.7–1.5 | Mapped from occupancy (30%→0.7, 95%→1.5) |
| Seasonality | 0.8–1.4 | Monthly, London peak/off-peak calendar |
| Lead time | 0.9–1.3 | 30+ days = 0.9, 0 days (same-day) = 1.3 |
| Day of week | 0.85–1.15 | Weekday discount, weekend premium |

**Theoretical range:** ~0.43x to ~3.76x base rate (realistic for London hotels).

The breakdown is visible to the user for every result. This transparency is the product-thinking differentiator.

### 7-Day Projection

For each hotel, calculate the price for each of the next 7 days by varying day-of-week and simulating demand drift. Display as a Recharts line chart on each result card.

## Data Strategy

### Source

- **[515K Hotel Reviews Data in Europe](https://www.kaggle.com/datasets/jiashenliu/515k-hotel-reviews-data-in-europe)** — filter to London, extract hotel names, addresses, review text, scores
- **[Hotel Dataset: Rates, Reviews & Amenities (6K+)](https://www.kaggle.com/datasets/joyshil0599/hotel-dataset-rates-reviews-and-amenities5k)** — cross-reference for base rates and amenities

### Processing

1. Filter to London hotels only → expect 1,000+ unique properties
2. Deduplicate by name + address
3. For each hotel: concatenate top 5-10 reviews into a single `review_summary`
4. Generate one embedding per hotel using OpenAI `text-embedding-3-small` (1536 dimensions)
5. Upsert embeddings + metadata to Pinecone
6. Seed hotel records + algorithmically generated pricing factors to Supabase
7. Pricing factors generated with realistic distributions (seasonality follows London tourism calendar, demand varies by neighborhood and star rating)

### Embedding Strategy

Embed **per-hotel** (aggregated review text), not per-review. This:
- Keeps total vectors under 2,000 (well within Pinecone free tier of 100K)
- Makes search results hotel-level, not review-level
- Produces richer embeddings from more text context

## Tech Stack

| Component | Tech | Purpose |
|-----------|------|---------|
| Vector search | Pinecone (serverless, free tier) | Semantic similarity + competitive set |
| Embeddings | OpenAI text-embedding-3-small | Generate query + hotel embeddings |
| Database | Supabase Postgres | Hotel metadata, pricing factors, amenities |
| AI insights | Claude API (claude-sonnet-4-5-20241022) | Async booking advice per result |
| Frontend | Next.js 14 (App Router) + Tailwind + shadcn/ui | UI |
| Charts | Recharts | 7-day price projection |
| Deploy | Vercel | Hosting |

## UX Design

### One Search Box

The entire input is a single natural language search box. No faceted filters, no dropdowns, no checkboxes. The semantic search *replaces* traditional filtering — that's the design statement.

Optional inputs below the search box:
- Check-in date (defaults to today)
- Team/group size (defaults to 1, affects nothing in v1 but shows extensibility)

### Results List

Sorted by semantic match score (descending). Each card shows:
- Hotel name + neighborhood + star rating
- Semantic match percentage
- Tonight's dynamic price with factor breakdown (expandable)
- 7-day price projection mini-chart
- Competitive set (3 similar hotels with prices)
- Claude insight (streams in async after initial render)

### No Map View

A sorted list with neighborhood labels is sufficient. Leaflet/map adds complexity for minimal portfolio signal.

### No Auth / No Booking

This is a search + pricing intelligence demo, not an OTA. No user accounts, no saved searches, no booking flow.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data pipeline time sink | Kaggle data is messy — inconsistent names, missing coords, duplicates | Budget a full thread for ETL. Define clean schema first, validate output before other work. |
| Embedding quality for short queries | 6-word query vs long review text may produce mediocre similarity | Test 10 sample queries early. If poor, add Pinecone metadata filtering (neighborhood, star rating) as hybrid search. |
| Claude API latency | Blocks results page if synchronous | Stream insights async — show results + pricing immediately, Claude insight appears after. |
| Pinecone cold starts (free tier) | First query 5-10s after inactivity | Add warming ping on page load + loading skeleton. |
| Pricing factor realism | Fake-looking prices undermine credibility | Base rates from real data. Factors bounded to realistic ranges. Spot-check 20 hotels manually. |

## Scope Boundaries

**In scope:**
- Semantic hotel search via natural language
- Dynamic pricing with 4-factor breakdown
- 7-day price projection chart
- Competitive set comparison
- Claude booking insights
- 1,000+ real London hotels
- Responsive UI
- Vercel deployment

**Out of scope:**
- Booking/reservation flow
- User accounts / auth
- Saved searches
- Map view
- Multi-city support
- Real-time pricing updates
- Faceted filter UI
- Individual review browsing

## Thread Decomposition (Preliminary)

| Thread | Content | Dependencies | Parallel? |
|--------|---------|-------------|-----------|
| T1: Scaffold | Next.js project, Supabase schema, Pinecone index, env setup, shared types | None | — |
| T2: Data Pipeline | Kaggle cleaning, hotel normalization, embedding generation, Pinecone upsert, Supabase seed | T1 | — |
| T3: Search API | `/api/search` — embed query, Pinecone search, Supabase enrichment, return ranked results | T1, T2 | Yes (with T4) |
| T4: Pricing Engine | Pricing module — apply 4 multipliers, return breakdown + 7-day projection data | T1, T2 | Yes (with T3) |
| T5: Results UI | Search bar, results list, price breakdown cards, projection chart (Recharts) | T3, T4 | — |
| T6: Competitive Set + Claude Insight | Nearest-neighbor comp set query, Claude insight generation, async streaming UI | T3, T4 | — |
| T7: Polish + Deploy | Loading states, error handling, responsive design, Vercel deploy, README with ADR | T5, T6 | — |

**Estimated scope:** ~25-35 source files, ~10-15 test files, comparable to Weather Mood build.

**Biggest risk thread:** T2 (Data Pipeline) — start early, validate output before UI work begins.
