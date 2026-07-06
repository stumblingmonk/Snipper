/** Paths to provided handoff assets served from /public. */
export const PROVIDED_BACKGROUNDS = {
  story: '/backgrounds/paper/story_1080x1920.jpg',
  square: '/backgrounds/paper/square_1080x1080.jpg',
  portrait: '/backgrounds/paper/portrait_1080x1350.jpg',
  linkedin: '/backgrounds/paper/linkedin_1200x627.jpg',
} as const;

export const DEFAULT_ARTICLE_IMAGE =
  '/assets/article-images/marcello-hernandez-espys.jpg';

/** Legacy Phase 1 stress asset paths (kept for reference/fallback). */
export const LEGACY_STRESS_ASSETS = {
  background: '/assets/stress/background.jpg',
  articleImage: '/assets/stress/article-subject.png',
} as const;

/** Default seeded demo content for layout and export testing. */
export const PROVIDED_DEFAULT_COPY = {
  sourceUrl:
    'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/',
  sourceName: 'The Hollywood Reporter',
  headline:
    '‘Saturday Night Live’ Star Marcello Hernández Will Host the 2026 ESPYs as the Awards Return to New York City',
  subhead:
    'This year’s ESPYs will return to New York City after more than 25 years.',
  excerpt:
    'Saturday Night Live star Marcello Hernández has been tapped to host the 2026 ESPYs for ESPN, in a high-profile hosting gig for the rising comedy talent. The ESPYs are returning to New York after more than 25 years in Las Vegas and Los Angeles, with this year’s installment set to be held at the David Koch Theater at Lincoln Center on July 15. The awards show will air on ABC and stream on the ESPN app.',
  scratchpad:
    'Saturday Night Live star Marcello Hernández has been tapped to host the 2026 ESPYs for ESPN, in a high-profile hosting gig for the rising comedy talent. The ESPYs are returning to New York after more than 25 years in Las Vegas and Los Angeles, with this year’s installment set to be held at the David Koch Theater at Lincoln Center on July 15. The awards show will air on ABC and stream on the ESPN app. Hernández has quickly become one of the breakout performers on SNL, and the hosting assignment gives ESPN a recognizable face for the telecast.',
  caption:
    'Marcello Hernández will host the 2026 ESPYs as the awards return to New York City. Ceremony airs July 15 on ABC.',
  byline: 'By Natalie Jarvey',
  articleDate: 'Mar 15, 2026',
  attribution: 'Photo: Getty Images',
} as const;
