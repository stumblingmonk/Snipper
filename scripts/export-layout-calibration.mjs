/**
 * Seeds the layout calibration fixture and writes 8 PNGs (4 formats × 2 pages).
 *
 * Usage:
 *   npm run dev          (in one terminal)
 *   npm run export:layout-calibration
 *
 * Output:
 *   public/Output_test/layout-calibration/*.png
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'Output_test', 'layout-calibration');
const devUrl = process.env.SNIPIT_DEV_URL ?? 'http://localhost:5173/';
const chromeExecutable =
  process.env.PUPPETEER_EXECUTABLE_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);

const EXPECTED_EXPORTS = [
  { suffix: 'story_p01', width: 1080, height: 1920 },
  { suffix: 'story_p02', width: 1080, height: 1920 },
  { suffix: 'sq_p01', width: 1080, height: 1080 },
  { suffix: 'sq_p02', width: 1080, height: 1080 },
  { suffix: 'port_p01', width: 1080, height: 1350 },
  { suffix: 'port_p02', width: 1080, height: 1350 },
  { suffix: 'wide_p01', width: 1200, height: 627 },
  { suffix: 'wide_p02', width: 1200, height: 627 },
];

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL from browser export');
  }
  return Buffer.from(base64, 'base64');
}

async function waitForDevServer(url) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server not reachable at ${url}`);
}

mkdirSync(outDir, { recursive: true });

console.log(`Waiting for dev server at ${devUrl}`);
await waitForDevServer(devUrl);

const browser = await puppeteer.launch({
  headless: true,
  ...(chromeExecutable ? { executablePath: chromeExecutable } : {}),
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

console.log('Opening SNIPit…');
await page.goto(devUrl, { waitUntil: 'networkidle0' });

await page.waitForFunction(
  () => window.__SNIPIT_TEST__?.seedLayoutCalibration,
  { timeout: 10000 },
);

console.log('Seeding layout calibration fixture…');
await page.evaluate(async () => {
  await window.__SNIPIT_TEST__.seedLayoutCalibration();
});

console.log('Capturing exports…');
const captures = await page.evaluate(async () => {
  return window.__SNIPIT_TEST__.captureLayoutCalibrationExports();
});

await browser.close();

if (!Array.isArray(captures) || captures.length !== 8) {
  console.error(`Expected 8 PNGs, got ${captures?.length ?? 0}`);
  process.exit(1);
}

const results = [];

for (const capture of captures) {
  const outFile = path.join(outDir, capture.filename);
  const buffer = dataUrlToBuffer(capture.dataUrl);
  writeFileSync(outFile, buffer);

  const expected = EXPECTED_EXPORTS.find((item) =>
    capture.filename.includes(item.suffix),
  );
  const pass =
    expected &&
    capture.width === expected.width &&
    capture.height === expected.height;

  results.push({
    file: capture.filename,
    size: `${capture.width} × ${capture.height}`,
    pass: Boolean(pass),
  });

  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${capture.filename}  (${capture.width} × ${capture.height})`,
  );
}

const manifest = {
  generatedAt: new Date().toISOString(),
  outputDir: outDir,
  fileCount: captures.length,
  files: results,
};

writeFileSync(
  path.join(outDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const allPass = results.every((result) => result.pass);
if (!allPass) {
  console.error('One or more exports had unexpected dimensions.');
  process.exit(1);
}

console.log(`\nDone. ${captures.length} PNGs saved to:\n${outDir}`);
