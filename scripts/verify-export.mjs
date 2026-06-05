/**
 * Phase 1 export verification — run while dev server is up.
 * Usage: node scripts/verify-export.mjs
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'tmp');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'phase1-export.png');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForSelector('#export-artboard img', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 500));

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
  () => document.body.innerText.includes('Exported 1080 × 1920'),
  { timeout: 20000 },
);

const artboard = await page.$('#export-artboard');
if (!artboard) throw new Error('Export artboard missing');

const box = await artboard.boundingBox();
const screenshot = await artboard.screenshot({ type: 'png' });
writeFileSync(outFile, screenshot);

console.log('Artboard layout box:', box);
console.log('Saved element screenshot:', outFile);

const pngSize = await page.evaluate(async () => {
  const el = document.querySelector('p.success');
  return el?.textContent ?? '';
});
console.log('UI message:', pngSize.trim());

await browser.close();
console.log('PASS: Phase 1 export flow completed at 1080 × 1920');
