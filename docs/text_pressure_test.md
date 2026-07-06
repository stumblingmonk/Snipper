# Text Pressure Test

Automated stress testing for short/long copy and edge cases across all SNIPit formats. Mirrors the layout calibration harness.

## Quick start

```bash
npm run dev                    # terminal 1
npm run export:text-pressure   # terminal 2
```

If the dev server is not on port 5173:

```bash
SNIPIT_DEV_URL=http://localhost:5174/ npm run export:text-pressure
```

Linux cloud VM:

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/google-chrome npm run export:text-pressure
```

## Output

72 PNGs total: **9 scenarios × 4 formats × 2 pages**.

```
public/Output_test/text-pressure/
  manifest.json
  scenario-01-minimal/
    text-pressure-01-minimal_YYYY-MM-DD_sq_p01.png
    ... (8 PNGs)
    manifest.json
  scenario-02-long-headline/
    ...
  ... through scenario-09-metadata-edges/
```

PNGs are **not committed** to git — review locally after each run.

## Expected dimensions

| Format code | Size |
|-------------|------|
| `story` | 1080 × 1920 |
| `sq` | 1080 × 1080 |
| `port` | 1080 × 1350 |
| `wide` | 1200 × 627 |

Each scenario exports 8 files: 4 formats × page 1 (with image) + page 2 (no image), except scenario 08 where both pages have no image.

## The 9 scenarios

| ID | Slug | What it tests |
|----|------|---------------|
| 01 | `minimal` | Short headline, subhead, and excerpt (~1 sentence each). Baseline tight layout. |
| 02 | `long-headline` | Very long headline (calibration ESPYs headline). Normal subhead and excerpt. |
| 03 | `long-subhead` | Normal headline. Subhead long enough to wrap 3+ lines on Square. |
| 04 | `long-excerpt` | Normal headline/subhead. Long excerpts on both pages (2+ paragraphs each). |
| 05 | `max-pressure` | Long headline + long subhead + long excerpt + image. Worst case for Square. |
| 06 | `accents` | Curly quotes, accents (Hernández, café, Zürich), em-dash, ellipsis. |
| 07 | `no-subhead` | Empty subhead. Everything else normal. |
| 08 | `no-image` | Both pages `imageMode: 'none'`. Text-only layout, no attribution. |
| 09 | `metadata-edges` | Long byline, long attribution, long source URL. Normal copy otherwise. |

## Shared defaults

Unless a scenario overrides them:

- Brand logo: **BOLDED**
- Background pack: **Paper** (`DEFAULT_BACKGROUND_PACK_ID`)
- Source logo: **The Hollywood Reporter** (default builtin)
- Byline: Natalie Jarvey
- `showByline: true`, `showArticleDate: false`, `showAttribution: true`
- Page 1: image (`crop`), excerpt, attribution visible
- Page 2: `imageMode: 'none'`, continuation excerpt, no attribution
- `headlineAutoFit: true`, `excerptAutoFit: false` on pages

## Dev harness

In dev mode, `window.__SNIPIT_TEST__` exposes:

- `seedTextPressureScenario(id)` — seed scenario `01`–`09`
- `captureTextPressureExports(scenarioId)` — export 8 PNGs for one scenario
- `listTextPressureScenarioIds()` — `['01', …, '09']`

## Source files

| File | Role |
|------|------|
| `src/dev/textPressureFixtures.ts` | Scenario definitions and seeding |
| `src/dev/registerTestHarness.ts` | Browser harness wiring |
| `scripts/export-text-pressure.mjs` | Puppeteer batch export |

## Out of scope

This phase exports only — layout fixes from failed pressure tests are handled separately.
