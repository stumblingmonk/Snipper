import type { ImageMode } from '@/constants/formats';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './ImageModeControls.module.css';

const IMAGE_MODES: { id: ImageMode; label: string }[] = [
  { id: 'crop', label: 'Crop' },
  { id: 'fit', label: 'Fit' },
  { id: 'none', label: 'None' },
];

export function ImageModeControls() {
  const imageMode = useSnipperStore((s) => s.imageMode);
  const cropZoom = useSnipperStore((s) => s.cropZoom);
  const cropOffsetX = useSnipperStore((s) => s.cropOffsetX);
  const cropOffsetY = useSnipperStore((s) => s.cropOffsetY);

  const setImageMode = useSnipperStore((s) => s.setImageMode);
  const setCropZoom = useSnipperStore((s) => s.setCropZoom);
  const setCropOffsetX = useSnipperStore((s) => s.setCropOffsetX);
  const setCropOffsetY = useSnipperStore((s) => s.setCropOffsetY);
  const resetCrop = useSnipperStore((s) => s.resetCrop);

  return (
    <section className={styles.section}>
      <h3 className={styles.label}>Image Mode</h3>
      <div className={styles.modeRow} role="radiogroup" aria-label="Image mode">
        {IMAGE_MODES.map((mode) => (
          <label
            key={mode.id}
            className={[
              styles.modeOption,
              imageMode === mode.id ? styles.modeOptionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name="image-mode"
              value={mode.id}
              checked={imageMode === mode.id}
              onChange={() => setImageMode(mode.id)}
              className={styles.srOnly}
            />
            {mode.label}
          </label>
        ))}
      </div>

      {imageMode === 'crop' ? (
        <div className={styles.cropControls}>
          <label className={styles.sliderLabel} htmlFor="crop-zoom">
            Zoom
            <span className={styles.sliderValue}>{cropZoom.toFixed(2)}×</span>
          </label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={cropZoom}
            onChange={(e) => setCropZoom(Number(e.target.value))}
            className={styles.slider}
          />

          <label className={styles.sliderLabel} htmlFor="crop-x">
            X position
            <span className={styles.sliderValue}>{cropOffsetX.toFixed(2)}</span>
          </label>
          <input
            id="crop-x"
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={cropOffsetX}
            onChange={(e) => setCropOffsetX(Number(e.target.value))}
            className={styles.slider}
          />

          <label className={styles.sliderLabel} htmlFor="crop-y">
            Y position
            <span className={styles.sliderValue}>{cropOffsetY.toFixed(2)}</span>
          </label>
          <input
            id="crop-y"
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={cropOffsetY}
            onChange={(e) => setCropOffsetY(Number(e.target.value))}
            className={styles.slider}
          />

          <button
            type="button"
            className={styles.resetButton}
            onClick={resetCrop}
          >
            Reset crop
          </button>
        </div>
      ) : null}

      {imageMode === 'fit' ? (
        <p className={styles.helpText}>
          Fit shows the full image inside the frame with a light matte.
        </p>
      ) : null}

      {imageMode === 'none' ? (
        <p className={styles.helpText}>No article image is rendered on the card.</p>
      ) : null}
    </section>
  );
}
