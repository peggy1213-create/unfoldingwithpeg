/**
 * Generate the site's raster brand images from the brand SVGs + design tokens.
 *
 *   node scripts/make-brand-rasters.mjs
 *
 * Outputs (committed, so a normal build/deploy needs neither this script nor a
 * browser):
 *   public/assets/brand/og-default.png   1200x630  default Open Graph / Twitter card
 *   public/assets/brand/feed-image.png    144x144  RSS <channel><image>
 *
 * Why a browser: Open Graph and RSS channel images must be raster (PNG/JPEG/
 * GIF) and `public/assets/brand/` holds only SVG, so something has to
 * rasterize. Chromium is the one renderer guaranteed to lay out the real brand
 * faces — Encode Sans Semi Expanded and Noto Sans from Google Fonts, and the
 * self-hosted Swei Spring CJK TC for the Chinese — identically to the site.
 *
 * Requirements: Playwright with Chromium available (`npx playwright@1 ...` or a
 * global install). It is deliberately NOT a dependency of this project: it is
 * needed only when the brand or the wording on the card changes.
 *
 * Colours below are copied from the `--uwp-*` tokens in src/styles/global.css
 * and the path data from public/assets/brand/mark.svg; keep them in step.
 */
// Resolved through createRequire so it also finds a Playwright installed
// globally (via NODE_PATH) rather than only one in this project.
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/assets/brand");

// --- design tokens (src/styles/global.css) ---------------------------------
const INK = "#262524"; // --uwp-neutral-900
const INK_SOFT = "#514e4b"; // --uwp-neutral-700
const MUTED = "#6b6763"; // --uwp-neutral-600
const PAPER = "#faf9f8"; // --uwp-neutral-50
const BLUE_100 = "#dce8f1";
const BLUE_600 = "#416a8c";
const ROSE_400 = "#d991ab";
const ROSE_500 = "#c66e8f";

/** The brand mark (public/assets/brand/mark.svg), recoloured per use. */
function mark({ stroke, dot, size }) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M11 8.5V24a9 9 0 0 0 18 0V8.5" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="29" cy="8" r="3.6" fill="${dot}"/>
  </svg>`;
}

/** Swei Spring CJK TC, inlined so the page needs no local web server. */
function cjkFontFace() {
  const b64 = readFileSync(
    resolve(ROOT, "public/fonts/SweiSpringCJKtc-Regular.woff2"),
  ).toString("base64");
  return `@font-face{font-family:"Swei Spring CJK TC";src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:400;font-style:normal;}`;
}

const SANS = `"Encode Sans Semi Expanded","Swei Spring CJK TC",system-ui,sans-serif`;
const DISPLAY = `"Noto Sans","Swei Spring CJK TC",system-ui,sans-serif`;

/**
 * 1200x630 share card. One bilingual card serves both locales: the site is
 * bilingual, and a reader of either language recognises their own script on it.
 */
function ogHtml(cjk) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
@import url("https://fonts.googleapis.com/css2?family=Encode+Sans+Semi+Expanded:wght@400;600&family=Noto+Sans:wght@600&display=swap");
${cjk}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${PAPER};overflow:hidden;position:relative;
     font-family:${SANS};-webkit-font-smoothing:antialiased}
/* Oversized mark bleeding off the right edge — brand presence without noise. */
.wash{position:absolute;right:-148px;top:34px;opacity:.9}
.card{position:relative;height:100%;padding:76px 88px;
      display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start}
.wordmark{font-family:${DISPLAY};font-weight:600;font-size:70px;line-height:1;
          letter-spacing:-1.5px;color:${INK}}
.wordmark .peg{color:${ROSE_500}}
.row{display:flex;align-items:center;gap:22px}
.name{font-size:33px;font-weight:600;color:${INK_SOFT};letter-spacing:-.2px}
.role{font-size:26px;color:${MUTED};margin-top:12px;line-height:1.45}
.rule{width:64px;height:5px;border-radius:3px;background:${ROSE_400};margin-bottom:26px}
.domain{font-size:23px;color:${BLUE_600};letter-spacing:.1em}
</style></head><body>
<div class="wash">${mark({ stroke: BLUE_100, dot: BLUE_100, size: 620 })}</div>
<div class="card">
  <div class="row">${mark({ stroke: INK, dot: ROSE_400, size: 92 })}
    <div class="wordmark">Unfoldingwith<span class="peg">peg</span></div>
  </div>
  <div>
    <div class="rule"></div>
    <div class="name">Peggy Pei-Chun Hsieh ・ 謝佩君</div>
    <div class="role">Learning experience design, and products for<br>the people who make learning happen ・ 學習體驗設計</div>
  </div>
  <div class="domain">studiounfolding.cc</div>
</div></body></html>`;
}

/** 144x144 feed avatar — the RSS spec caps channel images at 144px wide. */
function feedHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:144px;height:144px;display:flex;align-items:center;justify-content:center;
     background:${PAPER}}
</style></head><body>${mark({ stroke: BLUE_600, dot: ROSE_400, size: 108 })}</body></html>`;
}

const targets = [
  { name: "og-default.png", width: 1200, height: 630, html: ogHtml(cjkFontFace()) },
  { name: "feed-image.png", width: 144, height: 144, html: feedHtml() },
];

const browser = await chromium.launch();
try {
  mkdirSync(OUT, { recursive: true });
  for (const t of targets) {
    // deviceScaleFactor 1: these assets are specified in exact pixel sizes.
    const page = await browser.newPage({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(t.html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const path = resolve(OUT, t.name);
    await page.screenshot({ path, type: "png" });
    console.log(`wrote ${path} (${t.width}x${t.height})`);
    await page.close();
  }
} finally {
  await browser.close();
}
