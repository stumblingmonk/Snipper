/**
 * Phase 6 export verification — run while dev server is up.
 * Usage: node scripts/verify-phase6-exports.mjs
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'tmp', 'phase6');
mkdirSync(outDir, { recursive: true });

const FORMATS = [
  { key: 'story', label: 'Story / Reel Cover', width: 1080, height: 1920 },
  { key: 'square', label: 'Square', width: 1080, height: 1080 },
  { key: 'portrait', label: 'Portrait Feed', width: 1080, height: 1350 },
  { key: 'linkedin', label: 'LinkedIn Landscape', width: 1200, height: 627 },
];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForSelector('#export-artboard img', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 500));

const results = [];

for (const format of FORMATS) {
  await page.evaluate((label) => {
    const labels = [...document.querySelectorAll('label')];
    const target = labels.find((el) => el.textContent?.includes(label));
    if (!target) throw new Error(`Format label not found: ${label}`);
    target.click();
  }, format.label);

  await new Promise((r) => setTimeout(r, 800));

  const buttons = await page.$$('button');
  let exportButton = null;
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text?.includes('Export PNG')) {
      exportButton = btn;
      break;
    }
  }
  if (!exportButton) throw new Error('Export button not found');

  await exportButton.click();
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(`Exported ${expected}`),
    { timeout: 20000 },
    `${format.width} × ${format.height}`,
  );

  const artboard = await page.$('#export-artboard');
  if (!artboard) throw new Error('Export artboard missing');

  const box = await artboard.boundingBox();
  const screenshot = await artboard.screenshot({ type: 'png' });
  const outFile = path.join(outDir, `${format.key}-export.png`);
  writeFileSync(outFile, screenshot);

  const pass =
    box &&
    Math.round(box.width) === format.width &&
    Math.round(box.height) === format.height;

  results.push({
    format: format.key,
    expected: `${format.width} × ${format.height}`,
    actual: box ? `${Math.round(box.width)} × ${Math.round(box.height)}` : 'missing',
    pass: Boolean(pass),
    file: outFile,
  });
}

await browser.close();

console.log('Phase 6 export dimension results:');
for (const result of results) {
  console.log(
    `- ${result.format}: expected ${result.expected}, actual ${result.actual} — ${result.pass ? 'PASS' : 'FAIL'}`,
  );
}

const allPass = results.every((r) => r.pass);
if (!allPass) {
  console.error('FAIL: One or more formats did not export at expected dimensions.');
  process.exit(1);
}

console.log('PASS: All four formats exported at expected dimensions.');
