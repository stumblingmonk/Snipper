/**
 * Seeds each text pressure scenario and writes 72 PNGs (9 scenarios × 8 exports).
 *
 * Usage:
 *   npm run dev          (in one terminal)
 *   npm run export:text-pressure
 *
 * Linux cloud VM:
 *   PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/google-chrome npm run export:text-pressure
 *
 * Output:
 *   public/Output_test/text-pressure/scenario-XX-slug/*.png
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(__dirname, '..', 'public', 'Output_test', 'text-pressure');
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

function validateCapture(capture) {
  const expected = EXPECTED_EXPORTS.find((item) =>
    capture.filename.includes(item.suffix),
  );
  const pass =
    expected &&
    capture.width === expected.width &&
    capture.height === expected.height;

  return {
    file: capture.filename,
    size: `${capture.width} × ${capture.height}`,
    pass: Boolean(pass),
  };
}

mkdirSync(outRoot, { recursive: true });

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
  () => window.__SNIPIT_TEST__?.listTextPressureScenarioIds,
  { timeout: 10000 },
);

const scenarioIds = await page.evaluate(() =>
  window.__SNIPIT_TEST__.listTextPressureScenarioIds(),
);

if (!Array.isArray(scenarioIds) || scenarioIds.length !== 9) {
  console.error(`Expected 9 scenario IDs, got ${scenarioIds?.length ?? 0}`);
  process.exit(1);
}

const rootResults = [];
let totalPass = 0;
let totalFail = 0;

for (const scenarioId of scenarioIds) {
  console.log(`\nScenario ${scenarioId} — seeding…`);
  await page.evaluate(async (id) => {
    await window.__SNIPIT_TEST__.seedTextPressureScenario(id);
  }, scenarioId);

  console.log(`Scenario ${scenarioId} — capturing exports…`);
  const captures = await page.evaluate(async (id) => {
    return window.__SNIPIT_TEST__.captureTextPressureExports(id);
  }, scenarioId);

  if (!Array.isArray(captures) || captures.length !== 8) {
    console.error(
      `Scenario ${scenarioId}: expected 8 PNGs, got ${captures?.length ?? 0}`,
    );
    process.exit(1);
  }

  const slugMatch = captures[0].filename.match(/^text-pressure-\d{2}-([^_]+)_/);
  const slug = slugMatch?.[1] ?? 'unknown';
  const scenarioDir = path.join(outRoot, `scenario-${scenarioId}-${slug}`);
  mkdirSync(scenarioDir, { recursive: true });

  const scenarioResults = [];

  for (const capture of captures) {
    const outFile = path.join(scenarioDir, capture.filename);
    const buffer = dataUrlToBuffer(capture.dataUrl);
    writeFileSync(outFile, buffer);

    const result = validateCapture(capture);
    scenarioResults.push(result);
    rootResults.push({
      scenarioId,
      scenarioDir: `scenario-${scenarioId}-${slug}`,
      ...result,
    });

    if (result.pass) {
      totalPass += 1;
    } else {
      totalFail += 1;
    }

    console.log(
      `${result.pass ? 'PASS' : 'FAIL'}  [${scenarioId}] ${capture.filename}  (${capture.width} × ${capture.height})`,
    );
  }

  writeFileSync(
    path.join(scenarioDir, 'manifest.json'),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scenarioId,
        slug,
        outputDir: scenarioDir,
        fileCount: captures.length,
        files: scenarioResults,
      },
      null,
      2,
    )}\n`,
  );
}

await browser.close();

writeFileSync(
  path.join(outRoot, 'manifest.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      outputDir: outRoot,
      scenarioCount: scenarioIds.length,
      fileCount: rootResults.length,
      passCount: totalPass,
      failCount: totalFail,
      scenarios: scenarioIds.map((id) => {
        const files = rootResults.filter((result) => result.scenarioId === id);
        return {
          id,
          folder: files[0]?.scenarioDir ?? `scenario-${id}`,
          fileCount: files.length,
          pass: files.every((file) => file.pass),
        };
      }),
      files: rootResults,
    },
    null,
    2,
  )}\n`,
);

if (totalFail > 0) {
  console.error(`\n${totalFail} export(s) had unexpected dimensions.`);
  process.exit(1);
}

console.log(
  `\nDone. ${totalPass} PNGs saved across ${scenarioIds.length} scenarios in:\n${outRoot}`,
);
