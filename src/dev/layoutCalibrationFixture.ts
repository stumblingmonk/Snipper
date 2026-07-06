import { DEFAULT_BACKGROUND_PACK_ID } from '@/constants/backgroundPacks';
import { DEFAULT_ARTICLE_IMAGE } from '@/constants/providedAssets';
import {
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import {
  HEADLINE_TYPO,
  preferredFontSize,
} from '@/constants/textFit';
import { getDefaultBuiltinSourceLogoId } from '@/constants/builtinSourceLogos';
import { useSnipitStore } from '@/store/snipitStore';
import { createDefaultArticlePage } from '@/types/articlePage';

export const LAYOUT_CALIBRATION_HEADLINE =
  '‘Saturday Night Live’ Star Marcello Hernández Will Host the 2026 ESPYs as the Awards Return to New York City';

export const LAYOUT_CALIBRATION_SUBHEAD =
  'This year’s ESPYs will return to New York City after more than 25 years.';

export const LAYOUT_CALIBRATION_PAGE1_EXCERPT =
  'Saturday Night Live star Marcello Hernández has been tapped to host the 2026 ESPYs for ESPN, in a high-profile hosting gig for the rising comedy talent. The ESPYs are returning to New York after more than 25 years in Las Vegas and Los Angeles, with this year’s installment set to be held at the David Koch Theater at Lincoln Center on July 15.';

export const LAYOUT_CALIBRATION_PAGE2_EXCERPT =
  'The awards show will air on ABC and stream on the ESPN app. Hernández has quickly become one of SNL’s breakout performers, and the ESPYs stage marks one of his biggest live-hosting slots yet. The show will bring together athletes, entertainers, and special guests for one of the summer’s major sports and culture events.';

const LAYOUT_CALIBRATION_SOURCE_URL =
  'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/';

export function seedLayoutCalibrationFixture(): void {
  const storyLayout = getStandardArticleLayout('story');
  const page1 = createDefaultArticlePage({
    excerpt: LAYOUT_CALIBRATION_PAGE1_EXCERPT,
    excerptSizeStep: 0,
    excerptAutoFit: false,
    excerptResolvedFontSize: preferredFontSize(0, storyLayout.excerptTypo),
    excerptFitStatus: 'fits',
    excerptLineClamp: 0,
    articleImageObjectUrl: DEFAULT_ARTICLE_IMAGE,
    uploadedArticleImageObjectUrl: null,
    flattenedCropUrl: null,
    imageMode: 'crop',
    articleImageBw: false,
  });

  const page2 = createDefaultArticlePage({
    excerpt: LAYOUT_CALIBRATION_PAGE2_EXCERPT,
    excerptSizeStep: 0,
    excerptAutoFit: false,
    excerptResolvedFontSize: preferredFontSize(0, storyLayout.excerptTypo),
    excerptFitStatus: 'fits',
    excerptLineClamp: 0,
    articleImageObjectUrl: DEFAULT_ARTICLE_IMAGE,
    uploadedArticleImageObjectUrl: null,
    flattenedCropUrl: null,
    imageMode: 'none',
    articleImageBw: false,
  });

  useSnipitStore.setState({
    format: 'story',
    pages: [page1, page2],
    activePageIndex: 0,
    headline: LAYOUT_CALIBRATION_HEADLINE,
    subhead: LAYOUT_CALIBRATION_SUBHEAD,
    sourceUrl: LAYOUT_CALIBRATION_SOURCE_URL,
    sourceName: 'The Hollywood Reporter',
    selectedBuiltinLogoId: getDefaultBuiltinSourceLogoId(),
    sourceLogoObjectUrl: null,
    sourceLogoHidden: false,
    showSource: true,
    selectedBrandLogoId: 'bolded',
    selectedBackgroundPackId: DEFAULT_BACKGROUND_PACK_ID,
    byline: 'Natalie Jarvey',
    articleDate: 'July 15, 2026',
    attribution: 'Photo: Getty Images',
    showByline: true,
    showArticleDate: false,
    showAttribution: true,
    headlineSizeStep: 0,
    headlineAutoFit: true,
    headlineResolvedFontSize: preferredFontSize(0, HEADLINE_TYPO),
    headlineFitStatus: 'fits',
    exportStatus: 'idle',
    exportError: null,
    exportProgress: null,
  });
}

export function waitForLayoutCalibrationStable(
  timeoutMs = 15000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const state = useSnipitStore.getState();
      const artboard = document.querySelector('#export-artboard img');

      if (
        document.fonts.status === 'loaded' &&
        artboard &&
        state.headlineResolvedFontSize > 0 &&
        state.pages.every((page) => page.excerptResolvedFontSize > 0)
      ) {
        resolve();
        return;
      }

      if (Date.now() - started > timeoutMs) {
        reject(new Error('Timed out waiting for layout calibration to stabilize'));
        return;
      }

      window.requestAnimationFrame(check);
    };

    void document.fonts.ready.then(() => {
      window.requestAnimationFrame(check);
    });
  });
}
