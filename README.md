# SNIPPER

Desktop-only internal tool for creating branded social graphics from manually copied article content.

## Phase 1 — Adversarial Export Prototype

Phase 1 validates PNG export via `html-to-image` with:

- Standard Article template
- Story format (1080 × 1920)
- Google Fonts (Special Gothic Expanded One + IBM Plex Sans)
- THR SVG logo
- JPEG background + transparent PNG subject (canvas crop)
- Baked-in stress-test headline with long URL token

### Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

### Export notes

- Export targets a hidden full-size artboard, not the scaled preview.
- `cacheBust: false` (required for object URLs).
- Crop mode pre-flattens via canvas before render.
