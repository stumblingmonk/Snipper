import { FORMATS } from '@/constants/formats';
import type { ExportRenderTarget } from '@/utils/cardExportLoop';
import { runCardExportLoop } from '@/utils/cardExportLoop';
import {
  buildExportFilenameList,
  formatExportDate,
} from '@/utils/exportFilename';
import { useSnipitStore } from '@/store/snipitStore';
import {
  seedLayoutCalibrationFixture,
  waitForLayoutCalibrationStable,
} from '@/dev/layoutCalibrationFixture';

export interface CapturedExportFile {
  filename: string;
  width: number;
  height: number;
  dataUrl: string;
}

export interface SnipitTestHarness {
  seedLayoutCalibration: () => Promise<void>;
  captureLayoutCalibrationExports: () => Promise<CapturedExportFile[]>;
}

declare global {
  interface Window {
    __SNIPIT_TEST__?: SnipitTestHarness;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read export blob'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

export function registerTestHarness(deps: {
  setExportRenderTarget: (target: ExportRenderTarget | null) => void;
  getExportNode: () => HTMLElement | null;
}): void {
  if (!import.meta.env.DEV) {
    return;
  }

  window.__SNIPIT_TEST__ = {
    async seedLayoutCalibration() {
      seedLayoutCalibrationFixture();
      await waitForLayoutCalibrationStable();
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    },

    async captureLayoutCalibrationExports() {
      const node = deps.getExportNode();
      if (!node) {
        throw new Error('Export artboard node is not available');
      }

      const state = useSnipitStore.getState();
      const entries = buildExportFilenameList({
        scope: 'all-formats',
        currentFormatKey: state.format,
        baseName: 'layout-calibration',
        date: formatExportDate(),
        totalPages: state.pages.length,
      });

      const captured: CapturedExportFile[] = [];

      await runCardExportLoop({
        node,
        entries,
        setRenderTarget: deps.setExportRenderTarget,
        onProgress: () => {},
        writeFile: async (blob, filename, index) => {
          const entry = entries[index];
          const formatSpec = FORMATS[entry.formatKey];
          captured.push({
            filename,
            width: formatSpec.width,
            height: formatSpec.height,
            dataUrl: await blobToDataUrl(blob),
          });
        },
      });

      return captured;
    },
  };
}
