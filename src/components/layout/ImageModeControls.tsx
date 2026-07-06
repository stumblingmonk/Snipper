import type { ImageMode } from '@/constants/formats';
import {
  CROP_OFFSET_MAX,
  CROP_OFFSET_MIN,
  CROP_OFFSET_STEP,
  CROP_ZOOM_MAX,
  CROP_ZOOM_MIN,
  CROP_ZOOM_STEP,
  cropHasPanRoom,
} from '@/constants/imageSettings';
import type { ReactNode } from 'react';
import { useSnipitStore, selectActivePage } from '@/store/snipitStore';
import styles from './ImageModeControls.module.css';

const IMAGE_MODES: { id: ImageMode; label: string }[] = [
  { id: 'crop', label: 'Crop' },
  { id: 'fit', label: 'Fit' },
  { id: 'none', label: 'None' },
];

type ImageModeControlsPart = 'all' | 'left' | 'crop';

interface ImageModeControlsProps {
  embedded?: boolean;
  part?: ImageModeControlsPart;
  children?: ReactNode;
}

function ModeOption({
  mode,
  embedded,
  imageMode,
  name,
  onSelect,
}: {
  mode: (typeof IMAGE_MODES)[number];
  embedded: boolean;
  imageMode: ImageMode;
  name: string;
  onSelect: (mode: ImageMode) => void;
}) {
  return (
    <label
      className={[
        styles.modeOption,
        embedded ? styles.modeOptionCompact : '',
        imageMode === mode.id ? styles.modeOptionSelected : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        name={name}
        value={mode.id}
        checked={imageMode === mode.id}
        onChange={() => onSelect(mode.id)}
        className={styles.srOnly}
      />
      {mode.label}
    </label>
  );
}

export function ImageModeControls({
  embedded = false,
  part = 'all',
  children,
}: ImageModeControlsProps) {
  const activePage = useSnipitStore(selectActivePage);
  const imageMode = activePage.imageMode;
  const articleImageBw = activePage.articleImageBw;
  const cropZoom = activePage.cropZoom;
  const cropOffsetX = activePage.cropOffsetX;
  const cropOffsetY = activePage.cropOffsetY;

  const setImageMode = useSnipitStore((s) => s.setImageMode);
  const setArticleImageBw = useSnipitStore((s) => s.setArticleImageBw);
  const setCropZoom = useSnipitStore((s) => s.setCropZoom);
  const setCropOffsetX = useSnipitStore((s) => s.setCropOffsetX);
  const setCropOffsetY = useSnipitStore((s) => s.setCropOffsetY);
  const resetCrop = useSnipitStore((s) => s.resetCrop);

  const showLeft = part === 'all' || part === 'left';
  const showCrop = (part === 'all' || part === 'crop') && imageMode === 'crop';
  const panEnabled = cropHasPanRoom(cropZoom);

  if (part === 'crop' && imageMode !== 'crop') {
    return null;
  }

  const modeName = embedded ? 'image-mode-content' : 'image-mode';

  const sectionClass = [
    styles.section,
    embedded ? styles.sectionEmbedded : '',
    part === 'left' ? styles.sectionLeft : '',
    part === 'crop' ? styles.sectionCropColumn : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClass}>
      {!embedded && showLeft ? <h3 className={styles.label}>Image</h3> : null}
      {!embedded && showLeft ? (
        <p className={styles.sublabel}>Image mode</p>
      ) : null}

      {showLeft ? (
        <div className={styles.leftControls}>
          <div className={styles.uploadRow}>{children}</div>
          <div className={styles.imageModeRow} role="radiogroup" aria-label="Image mode">
            <ModeOption
              mode={IMAGE_MODES[0]}
              embedded={embedded}
              imageMode={imageMode}
              name={modeName}
              onSelect={setImageMode}
            />
            <button
              type="button"
              className={styles.resetButton}
              onClick={resetCrop}
              disabled={imageMode !== 'crop'}
            >
              Reset crop
            </button>
            <ModeOption
              mode={IMAGE_MODES[1]}
              embedded={embedded}
              imageMode={imageMode}
              name={modeName}
              onSelect={setImageMode}
            />
            <ModeOption
              mode={IMAGE_MODES[2]}
              embedded={embedded}
              imageMode={imageMode}
              name={modeName}
              onSelect={setImageMode}
            />
            <button
              type="button"
              className={[
                styles.modeOption,
                embedded ? styles.modeOptionCompact : '',
                articleImageBw ? styles.modeOptionSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setArticleImageBw(!articleImageBw)}
              disabled={imageMode === 'none'}
              aria-pressed={articleImageBw}
            >
              B&W
            </button>
          </div>
        </div>
      ) : null}

      {showCrop ? (
        <div className={styles.controlsColumn}>
          <h4 className={styles.controlsLabel}>Image Controls</h4>
          <div className={styles.cropStack}>
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel} htmlFor="crop-zoom-content">
                Zoom
                <span className={styles.sliderValue}>{cropZoom.toFixed(2)}×</span>
              </label>
              <input
                id="crop-zoom-content"
                type="range"
                min={CROP_ZOOM_MIN}
                max={CROP_ZOOM_MAX}
                step={CROP_ZOOM_STEP}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            {!panEnabled ? (
              <p className={styles.cropHint}>Zoom in to pan.</p>
            ) : null}

            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel} htmlFor="crop-x-content">
                X
                <span className={styles.sliderValue}>{cropOffsetX.toFixed(2)}</span>
              </label>
              <input
                id="crop-x-content"
                type="range"
                min={CROP_OFFSET_MIN}
                max={CROP_OFFSET_MAX}
                step={CROP_OFFSET_STEP}
                value={cropOffsetX}
                onChange={(e) => setCropOffsetX(Number(e.target.value))}
                className={styles.slider}
                disabled={!panEnabled}
              />
            </div>

            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel} htmlFor="crop-y-content">
                Y
                <span className={styles.sliderValue}>{cropOffsetY.toFixed(2)}</span>
              </label>
              <input
                id="crop-y-content"
                type="range"
                min={CROP_OFFSET_MIN}
                max={CROP_OFFSET_MAX}
                step={CROP_OFFSET_STEP}
                value={cropOffsetY}
                onChange={(e) => setCropOffsetY(Number(e.target.value))}
                className={styles.slider}
                disabled={!panEnabled}
              />
            </div>
          </div>
        </div>
      ) : null}

      {!embedded && imageMode === 'fit' && part === 'all' ? (
        <p className={styles.helpText}>
          Fit shows the full image inside the frame with a light matte.
        </p>
      ) : null}

      {!embedded && imageMode === 'none' && part === 'all' ? (
        <p className={styles.helpText}>No article image is rendered on the card.</p>
      ) : null}
    </section>
  );
}
