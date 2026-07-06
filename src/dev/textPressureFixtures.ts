import { DEFAULT_BACKGROUND_PACK_ID } from '@/constants/backgroundPacks';
import { DEFAULT_ARTICLE_IMAGE } from '@/constants/providedAssets';
import { getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { HEADLINE_TYPO, preferredFontSize } from '@/constants/textFit';
import { getDefaultBuiltinSourceLogoId } from '@/constants/builtinSourceLogos';
import { useSnipitStore } from '@/store/snipitStore';
import { createDefaultArticlePage, type ArticlePage } from '@/types/articlePage';
import type { ImageMode } from '@/constants/formats';
import {
  LAYOUT_CALIBRATION_HEADLINE,
  LAYOUT_CALIBRATION_PAGE1_EXCERPT,
  LAYOUT_CALIBRATION_PAGE2_EXCERPT,
  LAYOUT_CALIBRATION_SUBHEAD,
} from '@/dev/layoutCalibrationFixture';

const DEFAULT_SOURCE_URL =
  'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/';

const LONG_SOURCE_URL =
  'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-special-report-lincoln-center-return-new-york-1236612262/?utm_source=feed&utm_medium=referral&utm_campaign=homepage';

const NORMAL_HEADLINE = 'Marcello Hernández to Host 2026 ESPYs in New York City';

const LONG_SUBHEAD =
  'This year’s ESPYs will return to New York City after more than 25 years, bringing athletes, entertainers, and special guests to Lincoln Center for one of the summer’s biggest sports and culture events.';

const LONG_EXCERPT_PAGE1 = `${LAYOUT_CALIBRATION_PAGE1_EXCERPT} ESPN executives praised Hernández’s rising profile and crossover appeal between sports broadcasting and late-night comedy.`;

const LONG_EXCERPT_PAGE2 = `${LAYOUT_CALIBRATION_PAGE2_EXCERPT} The event is expected to draw top names from the NFL, NBA, and Olympic communities, alongside red-carpet arrivals and taped segments honoring standout performances from the past year.`;

export interface TextPressureScenario {
  id: string;
  slug: string;
  label: string;
  headline: string;
  subhead: string;
  sourceUrl: string;
  sourceName: string;
  byline: string;
  attribution: string;
  page1Excerpt: string;
  page2Excerpt: string;
  page1ImageMode: ImageMode;
  page2ImageMode: ImageMode;
  showByline?: boolean;
  showAttribution?: boolean;
}

export const TEXT_PRESSURE_SCENARIOS: TextPressureScenario[] = [
  {
    id: '01',
    slug: 'minimal',
    label: 'Minimal copy baseline',
    headline: 'ESPYs Return to New York City',
    subhead: 'The awards show returns after 25 years.',
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt:
      'Marcello Hernández will host the 2026 ESPYs in New York.',
    page2Excerpt: 'The ceremony airs July 15 on ABC and ESPN.',
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '02',
    slug: 'long-headline',
    label: 'Very long headline',
    headline: LAYOUT_CALIBRATION_HEADLINE,
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '03',
    slug: 'long-subhead',
    label: 'Long subhead (3+ lines on Square)',
    headline: NORMAL_HEADLINE,
    subhead: LONG_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '04',
    slug: 'long-excerpt',
    label: 'Long excerpts on both pages',
    headline: NORMAL_HEADLINE,
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LONG_EXCERPT_PAGE1,
    page2Excerpt: LONG_EXCERPT_PAGE2,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '05',
    slug: 'max-pressure',
    label: 'Long headline, subhead, excerpt, and image',
    headline: LAYOUT_CALIBRATION_HEADLINE,
    subhead: LONG_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LONG_EXCERPT_PAGE1,
    page2Excerpt: LONG_EXCERPT_PAGE2,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '06',
    slug: 'accents',
    label: 'Special characters and accents',
    headline:
      '‘Saturday Night Live’ Star Marcello Hernández on the 2026 ESPYs — café culture, Zürich, and more…',
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '07',
    slug: 'no-subhead',
    label: 'Empty subhead',
    headline: NORMAL_HEADLINE,
    subhead: '',
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
  {
    id: '08',
    slug: 'no-image',
    label: 'Text-only layout (no image on either page)',
    headline: NORMAL_HEADLINE,
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: DEFAULT_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey',
    attribution: 'Photo: Getty Images',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'none',
    page2ImageMode: 'none',
  },
  {
    id: '09',
    slug: 'metadata-edges',
    label: 'Long byline, attribution, and source URL',
    headline: NORMAL_HEADLINE,
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: LONG_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    byline: 'Natalie Jarvey and Christopher Palmer',
    attribution: 'Photo: Getty Images for The Hollywood Reporter / WireImage',
    page1Excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    page2Excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    page1ImageMode: 'crop',
    page2ImageMode: 'none',
  },
];

export function getTextPressureScenario(id: string): TextPressureScenario {
  const scenario = TEXT_PRESSURE_SCENARIOS.find((item) => item.id === id);
  if (!scenario) {
    throw new Error(`Unknown text pressure scenario id: ${id}`);
  }
  return scenario;
}

function createPressurePage(
  excerpt: string,
  imageMode: ImageMode,
): ArticlePage {
  const storyLayout = getStandardArticleLayout('story');
  return createDefaultArticlePage({
    excerpt,
    excerptSizeStep: 0,
    excerptAutoFit: false,
    excerptResolvedFontSize: preferredFontSize(0, storyLayout.excerptTypo),
    excerptFitStatus: 'fits',
    excerptLineClamp: 0,
    articleImageObjectUrl: DEFAULT_ARTICLE_IMAGE,
    uploadedArticleImageObjectUrl: null,
    flattenedCropUrl: null,
    imageMode,
    articleImageBw: false,
  });
}

export function seedTextPressureScenario(id: string): void {
  const scenario = getTextPressureScenario(id);
  const page1 = createPressurePage(scenario.page1Excerpt, scenario.page1ImageMode);
  const page2 = createPressurePage(scenario.page2Excerpt, scenario.page2ImageMode);

  useSnipitStore.setState({
    format: 'story',
    pages: [page1, page2],
    activePageIndex: 0,
    headline: scenario.headline,
    subhead: scenario.subhead,
    sourceUrl: scenario.sourceUrl,
    sourceName: scenario.sourceName,
    selectedBuiltinLogoId: getDefaultBuiltinSourceLogoId(),
    sourceLogoObjectUrl: null,
    sourceLogoHidden: false,
    showSource: true,
    selectedBrandLogoId: 'bolded',
    selectedBackgroundPackId: DEFAULT_BACKGROUND_PACK_ID,
    byline: scenario.byline,
    articleDate: 'July 15, 2026',
    attribution: scenario.attribution,
    showByline: scenario.showByline ?? true,
    showArticleDate: false,
    showAttribution: scenario.showAttribution ?? true,
    headlineSizeStep: 0,
    headlineAutoFit: true,
    headlineResolvedFontSize: preferredFontSize(0, HEADLINE_TYPO),
    headlineFitStatus: 'fits',
    exportStatus: 'idle',
    exportError: null,
    exportProgress: null,
  });
}

export function waitForTextPressureStable(timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const state = useSnipitStore.getState();
      const activePage = state.pages[state.activePageIndex];
      const needsArtboardImage = activePage?.imageMode !== 'none';
      const artboardImage = document.querySelector('#export-artboard img');
      const imageReady = !needsArtboardImage || Boolean(artboardImage);

      if (
        document.fonts.status === 'loaded' &&
        imageReady &&
        state.headlineResolvedFontSize > 0 &&
        state.pages.every((page) => page.excerptResolvedFontSize > 0)
      ) {
        resolve();
        return;
      }

      if (Date.now() - started > timeoutMs) {
        reject(new Error('Timed out waiting for text pressure scenario to stabilize'));
        return;
      }

      window.requestAnimationFrame(check);
    };

    void document.fonts.ready.then(() => {
      window.requestAnimationFrame(check);
    });
  });
}
