/** Paths to provided SNIPPER handoff assets served from /public. */
export const PROVIDED_BACKGROUNDS = {
  story: '/assets/backgrounds/story.jpg',
  square: '/assets/backgrounds/square.jpg',
  portrait: '/assets/backgrounds/portrait.jpg',
  linkedin: '/assets/backgrounds/linkedin.jpg',
} as const;

export const DEFAULT_ARTICLE_IMAGE =
  '/assets/article-images/marcello-hernandez-espys.jpg';

/** Legacy Phase 1 stress asset paths (kept for reference/fallback). */
export const LEGACY_STRESS_ASSETS = {
  background: '/assets/stress/background.jpg',
  articleImage: '/assets/stress/article-subject.png',
} as const;

/** Default seeded content from SNIPPER_HANDOFF/05_copy/stress_test_copy.md */
export const PROVIDED_DEFAULT_COPY = {
  sourceUrl:
    'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/',
  sourceName: 'The Hollywood Reporter',
  headline:
    '‘Saturday Night Live’ Star Marcello Hernández Will Host the 2026 ESPYs as the Awards Return to New York City',
  subhead: '',
  excerpt:
    'Marcello Hernández will host the 2026 ESPYs as the awards return to New York City. The ceremony will air July 15 on ABC.',
  scratchpad: '',
  caption: '',
} as const;
