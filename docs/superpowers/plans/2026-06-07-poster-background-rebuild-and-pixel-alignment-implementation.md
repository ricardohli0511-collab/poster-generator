# Poster Background Rebuild And Pixel Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the poster's fixed brand background to match the Hong Kong Greater Bay Area Educational Promotion Association visual system, then drive both preview and SVG export from one shared `1080 x 1920` reference database so the layout converges toward the `模拟素材.jpg` composition.

**Architecture:** Keep the current static `index.html + styles.css + app.js` app structure, but move hard-coded preview/export geometry into one shared `layoutReference` object that lives in configuration and is normalized inside `app.js`. Use that single source of truth to 1) point preview DOM nodes to CSS custom properties and 2) generate SVG coordinates, chip positions, and image placements from the same data while preserving the existing typed-upload workflow.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, SVG asset + SVG string generation, Node `node:test`

---

## Repository Note

- 当前目录看起来不是一个 git 仓库。
- 每个任务仍然保留提交步骤，但如果执行 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，就在执行记录里保留该检查结果并跳过 commit。

## File Map

- Create: `assets/poster-background-brand-rebuilt.svg`
  - 保存新的协会专属固定背景母版，融合官方识别与 `模拟素材.jpg` 的构图/动势
- Modify: `template-config.example.js`
  - 指向新的背景母版
  - 新增 `layoutReference`，保存标题区、路径区、图片区、footer 区等坐标基准
- Modify: `app.js`
  - 新增 `normalizeLayoutReference()`
  - 新增 `getPreviewCssVariables()`
  - 新增 `applyPreviewLayout()`
  - 用 `layoutReference` 驱动 `renderPreview()` 和 `createPosterSvgMarkup()`
- Modify: `index.html`
  - 为标题、路径、图片区和 footer 增加稳定的预览钩子，减少纯样式猜测
- Modify: `styles.css`
  - 改为用 CSS 变量消费 `layoutReference`
  - 修正标题牌匾、路径卡、图片区、标签和底部区域的精确位置与尺寸
- Modify: `app.test.js`
  - 先写失败测试，覆盖背景路径锁定、`layoutReference` 归一化、CSS 变量输出、SVG 背景引用和标签位置回归

## Task 1: Lock failing tests for rebuilt background and layout reference

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add layout-reference helper imports and rebuilt config fixture**

```js
const {
  mergeConfig,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
  validatePosterRecord,
  resolvePosterImageLayout,
  mapImagesToPosterSlots,
  createPosterSvgMarkup,
  exportPoster,
  buildBatchRecordsFromCsv,
  matchRecordImages,
  exportBatchPosters,
  normalizeLayoutReference,
  getPreviewCssVariables,
} = require("./app.js");

const rebuiltBackgroundConfig = {
  ...sampleConfig,
  assets: {
    backgroundImage: "./assets/poster-background-brand-rebuilt.svg",
    logoImage: "",
  },
  layoutReference: {
    header: {
      slogan: { x: 540, y: 245, fontSize: 62, letterSpacing: 4 },
      sloganEn: { x: 540, y: 294, fontSize: 24, letterSpacing: 2 },
    },
    titleFrame: {
      x: 76,
      y: 374,
      width: 928,
      height: 152,
      paddingX: 48,
      paddingY: 22,
    },
    imageArea: {
      certificateChip: { x: 742, y: 474, width: 250, height: 50 },
      offerChip: { x: 702, y: 1306, width: 164, height: 46 },
    },
  },
};
```

- [ ] **Step 2: Add failing tests for config merge, CSS variable export, and rebuilt SVG background usage**

```js
test("mergeConfig keeps rebuilt background and layout reference geometry", () => {
  const config = mergeConfig(rebuiltBackgroundConfig);

  assert.equal(config.assets.backgroundImage, "./assets/poster-background-brand-rebuilt.svg");
  assert.equal(config.layoutReference.titleFrame.width, 928);
  assert.equal(config.layoutReference.imageArea.offerChip.y, 1306);
});

test("normalizeLayoutReference fills missing layout sections with defaults", () => {
  const layout = normalizeLayoutReference({
    titleFrame: { x: 80, y: 380, width: 920, height: 150 },
  });

  assert.equal(layout.titleFrame.x, 80);
  assert.equal(layout.titleFrame.height, 150);
  assert.ok(layout.footer);
  assert.ok(layout.imageArea);
});

test("getPreviewCssVariables serializes layout reference into CSS custom properties", () => {
  const cssVars = getPreviewCssVariables(
    normalizeLayoutReference(rebuiltBackgroundConfig.layoutReference)
  );

  assert.equal(cssVars["--title-frame-x"], "76");
  assert.equal(cssVars["--title-frame-width"], "928");
  assert.equal(cssVars["--offer-chip-y"], "1306");
});

test("createPosterSvgMarkup uses the rebuilt fixed background asset", () => {
  const svg = createPosterSvgMarkup(sampleRecord, rebuiltBackgroundConfig);

  assert.match(svg, /poster-background-brand-rebuilt\.svg/);
  assert.doesNotMatch(svg, /香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png/);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL with errors such as `normalizeLayoutReference is not a function`, `getPreviewCssVariables is not a function`, or `Cannot read properties of undefined (reading 'titleFrame')`.

- [ ] **Step 4: Check git availability and commit the failing tests if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

Expected: either `true` or `fatal: not a git repository`. If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock rebuilt background layout reference behavior"
```

## Task 2: Create the rebuilt fixed background asset and configuration source of truth

**Files:**
- Create: `assets/poster-background-brand-rebuilt.svg`
- Modify: `template-config.example.js`
- Test: `app.test.js`

- [ ] **Step 1: Create the rebuilt background SVG asset**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
  <defs>
    <linearGradient id="bgSky" x1="540" x2="540" y1="0" y2="1920">
      <stop offset="0%" stop-color="#103b95" />
      <stop offset="52%" stop-color="#0a2f78" />
      <stop offset="100%" stop-color="#061c4f" />
    </linearGradient>
    <linearGradient id="goldTrail" x1="108" x2="972" y1="1480" y2="1180">
      <stop offset="0%" stop-color="#f7d78a" stop-opacity="0.16" />
      <stop offset="52%" stop-color="#ffd77d" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#b78124" stop-opacity="0.18" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bgSky)" />
  <g opacity="0.9">
    <circle cx="930" cy="172" r="168" fill="#2458c8" fill-opacity="0.22" />
    <circle cx="198" cy="248" r="124" fill="#4aa6ff" fill-opacity="0.1" />
  </g>
  <path d="M0 1410C176 1328 292 1280 468 1228C700 1159 864 1078 1080 914V1920H0V1410Z" fill="#07215e" fill-opacity="0.7" />
  <path d="M74 1504C304 1400 440 1330 646 1236C798 1166 908 1082 1000 970" stroke="url(#goldTrail)" stroke-width="54" stroke-linecap="round" />
  <path d="M900 890L1010 952L950 1060" stroke="#ffda84" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
  <g transform="translate(102 68)">
    <circle cx="58" cy="58" r="58" fill="#0d317e" stroke="#efd28f" stroke-width="5" />
    <path d="M58 24L69 50H98L75 67L84 95L58 79L32 95L41 67L18 50H47L58 24Z" fill="#efd28f" />
    <text x="136" y="48" fill="#f8e5b2" font-size="34" font-weight="700">香港灣區教育諮詢促進會</text>
    <text x="136" y="92" fill="#f8e5b2" font-size="18" font-weight="600" letter-spacing="1.8">
      HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION
    </text>
  </g>
  <g opacity="0.7">
    <rect x="0" y="1602" width="1080" height="318" fill="url(#bgSky)" />
    <path d="M0 1742C92 1704 177 1678 254 1668C383 1652 482 1686 576 1700C700 1718 810 1686 924 1630C986 1600 1036 1568 1080 1532V1920H0V1742Z" fill="#0b275f" />
  </g>
</svg>
```

- [ ] **Step 2: Point the app config at the rebuilt background and add `layoutReference`**

```js
window.POSTER_TOOL_CONFIG = {
  pageTitle: "香港湾区教育咨询促进会批量海报生成器",
  primaryActionLabel: "生成单张海报",
  rendererType: "built_in_poster_engine",
  assets: {
    backgroundImage: "./assets/poster-background-brand-rebuilt.svg",
    logoImage: "",
  },
  layoutReference: {
    canvas: { width: 1080, height: 1920 },
    header: {
      slogan: { x: 540, y: 242, fontSize: 62, fontWeight: 800, letterSpacing: 4 },
      sloganEn: { x: 540, y: 292, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
    },
    titleFrame: {
      x: 76,
      y: 374,
      width: 928,
      height: 152,
      innerX: 92,
      innerY: 390,
      innerWidth: 896,
      innerHeight: 120,
    },
    pathArea: {
      titleLineY: 672,
      pill: { x: 100, y: 722, width: 320, height: 64 },
      cards: {
        highSchool: { x: 36, y: 802, width: 530, height: 138 },
        associate: { x: 36, y: 1020, width: 530, height: 150 },
        bachelor: { x: 36, y: 1248, width: 530, height: 150 },
      },
    },
    imageArea: {
      certificateChip: { x: 742, y: 474, width: 250, height: 50 },
      offerChip: { x: 702, y: 1306, width: 164, height: 46 },
    },
    footer: { y: 1840, fontSize: 36, letterSpacing: 3 },
  },
};
```

- [ ] **Step 3: Run tests to confirm configuration-driven assertions now reach the next failure**

Run:

```bash
node --test app.test.js
```

Expected: The config merge assertion should pass; tests should still fail on missing app helpers or old preview/export geometry usage.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add assets/poster-background-brand-rebuilt.svg template-config.example.js app.test.js
git commit -m "feat: add rebuilt poster background and layout reference config"
```

## Task 3: Normalize the reference database and expose preview CSS variables in `app.js`

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Add layout-reference defaults and normalization helpers near `mergeConfig()`**

```js
const DEFAULT_LAYOUT_REFERENCE = {
  canvas: { width: 1080, height: 1920 },
  header: {
    slogan: { x: 540, y: 242, fontSize: 62, fontWeight: 800, letterSpacing: 4 },
    sloganEn: { x: 540, y: 292, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
  },
  titleFrame: {
    x: 76,
    y: 374,
    width: 928,
    height: 152,
    innerX: 92,
    innerY: 390,
    innerWidth: 896,
    innerHeight: 120,
  },
  pathArea: {
    titleLineY: 672,
    pill: { x: 100, y: 722, width: 320, height: 64 },
    cards: {
      highSchool: { x: 36, y: 802, width: 530, height: 138 },
      associate: { x: 36, y: 1020, width: 530, height: 150 },
      bachelor: { x: 36, y: 1248, width: 530, height: 150 },
    },
  },
  imageArea: {
    certificateChip: { x: 742, y: 474, width: 250, height: 50 },
    offerChip: { x: 702, y: 1306, width: 164, height: 46 },
  },
  footer: { y: 1840, fontSize: 36, letterSpacing: 3 },
};

function mergeDeepObject(base, incoming) {
  const output = { ...base };
  Object.entries(incoming || {}).forEach(([key, value]) => {
    output[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? mergeDeepObject(base?.[key] || {}, value)
        : value;
  });
  return output;
}

function normalizeLayoutReference(layoutReference) {
  return mergeDeepObject(DEFAULT_LAYOUT_REFERENCE, layoutReference || {});
}
```

- [ ] **Step 2: Update `mergeConfig()` and add `getPreviewCssVariables()`**

```js
function mergeConfig(inputConfig) {
  const source = inputConfig || {};
  const mergedImageLayouts = { ...DEFAULT_CONFIG.imageLayouts, ...(source.imageLayouts || {}) };
  return {
    ...DEFAULT_CONFIG,
    ...source,
    fixedCopy: mergeNested(DEFAULT_CONFIG.fixedCopy, source.fixedCopy),
    fieldLimits: mergeNested(DEFAULT_CONFIG.fieldLimits, source.fieldLimits),
    assets: mergeNested(DEFAULT_CONFIG.assets, source.assets),
    posterSize: mergeNested(DEFAULT_CONFIG.posterSize, source.posterSize),
    textBlocks: mergeNested(DEFAULT_CONFIG.textBlocks, source.textBlocks),
    imageLayouts: mergedImageLayouts,
    layoutReference: normalizeLayoutReference(source.layoutReference),
  };
}

function getPreviewCssVariables(layoutReference) {
  return {
    "--title-frame-x": String(layoutReference.titleFrame.x),
    "--title-frame-y": String(layoutReference.titleFrame.y),
    "--title-frame-width": String(layoutReference.titleFrame.width),
    "--title-frame-height": String(layoutReference.titleFrame.height),
    "--certificate-chip-x": String(layoutReference.imageArea.certificateChip.x),
    "--certificate-chip-y": String(layoutReference.imageArea.certificateChip.y),
    "--offer-chip-x": String(layoutReference.imageArea.offerChip.x),
    "--offer-chip-y": String(layoutReference.imageArea.offerChip.y),
    "--footer-y": String(layoutReference.footer.y),
  };
}
```

- [ ] **Step 3: Add `applyPreviewLayout()` and call it from `renderPreview()`**

```js
function applyPreviewLayout(elements, config) {
  if (!elements.previewCard) {
    return;
  }

  const cssVariables = getPreviewCssVariables(config.layoutReference);
  Object.entries(cssVariables).forEach(([key, value]) => {
    elements.previewCard.style.setProperty(key, value);
  });
}

function renderPreview(elements, state, config) {
  if (!elements.previewCard) {
    return;
  }

  applyPreviewLayout(elements, config);
  const cleanedRecord = createNormalizedRecord(state.manualRecord);
  const visibility = getRecordAssetVisibility(cleanedRecord);
  // keep the existing typed-image rendering logic here
}
```

- [ ] **Step 4: Export the new helpers for tests**

```js
const api = {
  mergeConfig,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
  validatePosterRecord,
  resolvePosterImageLayout,
  mapImagesToPosterSlots,
  createPosterSvgMarkup,
  exportPoster,
  buildBatchRecordsFromCsv,
  matchRecordImages,
  exportBatchPosters,
  normalizeLayoutReference,
  getPreviewCssVariables,
};
```

- [ ] **Step 5: Run tests to verify the helper layer now passes**

Run:

```bash
node --test app.test.js
```

Expected: helper/config tests pass; remaining failures should now point to preview/export still using legacy hard-coded geometry.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js app.test.js
git commit -m "feat: normalize poster layout reference data"
```

## Task 4: Move the preview DOM and CSS onto the shared layout reference

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`
- Test: manual preview validation

- [ ] **Step 1: Add stable preview hooks in `index.html` for key alignment blocks**

```html
<div id="poster-preview" class="poster-preview">
  <div class="poster-background-layer" aria-hidden="true">
    <img id="preview-background-image" alt="" />
  </div>
  <div class="poster-overlay" data-layout-node="overlay">
    <div class="poster-header" data-layout-node="header">
      <div class="poster-slogan-block" data-layout-node="slogan-block">
        <p class="poster-slogan" data-layout-node="slogan-cn">让梦想起航 连接未来</p>
        <p class="poster-slogan-en" data-layout-node="slogan-en">Embark Your Dream, Connect to the Future</p>
      </div>
      <div class="poster-title-block" data-layout-node="title-block">
        <div class="title-frame" data-layout-node="title-frame">
          <h2 id="preview-title" data-layout-node="title-text">2026学员成功案例</h2>
        </div>
        <p id="preview-subtitle" class="poster-subtitle" data-layout-node="subtitle-text">2026副学士升本科</p>
      </div>
    </div>
    <div class="poster-main" data-layout-node="main">
      <section class="poster-left" data-layout-node="path-area">
        <!-- keep existing path content -->
      </section>
      <section class="poster-right" data-layout-node="image-area">
        <!-- keep existing typed chip + photo slots -->
      </section>
    </div>
    <div class="poster-footer" data-layout-node="footer">
      <!-- keep existing footer content -->
    </div>
  </div>
</div>
```

- [ ] **Step 2: Replace hard-coded preview geometry in `styles.css` with CSS variables**

```css
.poster-preview {
  --canvas-width: 1080;
  --canvas-height: 1920;
  --title-frame-x: 76;
  --title-frame-y: 374;
  --title-frame-width: 928;
  --title-frame-height: 152;
  --certificate-chip-x: 742;
  --certificate-chip-y: 474;
  --offer-chip-x: 702;
  --offer-chip-y: 1306;
  --footer-y: 1840;
}

.poster-overlay {
  position: absolute;
  inset: 0;
}

[data-layout-node="title-frame"] {
  position: absolute;
  left: calc(var(--title-frame-x) / var(--canvas-width) * 100%);
  top: calc(var(--title-frame-y) / var(--canvas-height) * 100%);
  width: calc(var(--title-frame-width) / var(--canvas-width) * 100%);
  min-height: calc(var(--title-frame-height) / var(--canvas-height) * 100%);
}

#preview-certificate-chip {
  position: absolute;
  left: calc(var(--certificate-chip-x) / var(--canvas-width) * 100%);
  top: calc(var(--certificate-chip-y) / var(--canvas-height) * 100%);
}

#preview-offer-chip {
  position: absolute;
  left: calc(var(--offer-chip-x) / var(--canvas-width) * 100%);
  top: calc(var(--offer-chip-y) / var(--canvas-height) * 100%);
}

[data-layout-node="footer"] {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--footer-y) / var(--canvas-height) * 100%);
}
```

- [ ] **Step 3: Update `renderPreview()` to set layout-specific dataset values after CSS variable sync**

```js
function renderPreview(elements, state, config) {
  if (!elements.previewCard) {
    return;
  }

  applyPreviewLayout(elements, config);
  const cleanedRecord = createNormalizedRecord(state.manualRecord);
  const visibility = getRecordAssetVisibility(cleanedRecord);

  if (elements.previewBoard) {
    elements.previewBoard.dataset.layout =
      cleanedRecord.images.length >= 1 ? `${cleanedRecord.images.length}-image` : "empty";
  }

  if (elements.previewCertificateChip) {
    elements.previewCertificateChip.hidden = !visibility.showCertificateChip;
  }
  if (elements.previewOfferChip) {
    elements.previewOfferChip.hidden = !visibility.showOfferChip;
  }
}
```

- [ ] **Step 4: Run regression tests**

Run:

```bash
node --test app.test.js
```

Expected: all non-visual tests stay green; no regressions in typed upload, chip hiding, or fixed background enforcement.

- [ ] **Step 5: Launch the local preview server for manual layout tuning**

Run:

```bash
python3 -m http.server 4173
```

Expected: server starts on `http://localhost:4173/`.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add index.html styles.css app.js app.test.js
git commit -m "feat: bind preview layout to shared poster reference"
```

## Task 5: Move SVG export geometry and chip placement onto the same reference database

**Files:**
- Modify: `app.js`
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add failing SVG geometry assertions before the export rewrite**

```js
test("createPosterSvgMarkup uses layoutReference title frame and footer coordinates", () => {
  const svg = createPosterSvgMarkup(sampleRecord, rebuiltBackgroundConfig);

  assert.match(svg, /x="76" y="374" width="928" height="152"/);
  assert.match(svg, /y="1840"/);
});

test("createPosterSvgMarkup uses layoutReference offer chip coordinates", () => {
  const svg = createPosterSvgMarkup(typedRecord, rebuiltBackgroundConfig);

  assert.match(svg, /id="offer-chip"/);
  assert.match(svg, /x="702" y="1306" width="164" height="46"/);
});
```

- [ ] **Step 2: Refactor `createPosterSvgMarkup()` to read geometry from `config.layoutReference`**

```js
function createPosterSvgMarkup(record, inputConfig) {
  const config = mergeConfig(inputConfig);
  const layout = config.layoutReference;
  const validation = validatePosterRecord(record, config);
  if (!validation.ok) {
    throw new Error("请先补齐标题、副标题、三阶段文案并上传 1 到 3 张图片。");
  }

  const cleaned = validation.cleaned;
  const brandAssets = requireBrandAssets(config);
  const visibility = getRecordAssetVisibility(cleaned);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${config.posterSize.width}" height="${config.posterSize.height}" viewBox="0 0 1080 1920">
  <image href="${escapeXml(brandAssets.backgroundImage)}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid meet" />
  <text x="${layout.header.slogan.x}" y="${layout.header.slogan.y}" text-anchor="middle">${escapeXml(config.fixedCopy.sloganCn)}</text>
  <text x="${layout.header.sloganEn.x}" y="${layout.header.sloganEn.y}" text-anchor="middle">${escapeXml(config.fixedCopy.sloganEn)}</text>
  <rect x="${layout.titleFrame.x}" y="${layout.titleFrame.y}" width="${layout.titleFrame.width}" height="${layout.titleFrame.height}" rx="18" fill="url(#panelBlue)" stroke="url(#goldStroke)" stroke-width="7" />
  ${visibility.showCertificateChip ? createChipMarkup({ ...layout.imageArea.certificateChip, text: config.fixedCopy.imageLabel, fontSize: 18 }) : ""}
  ${visibility.showOfferChip ? createChipMarkup({ ...layout.imageArea.offerChip, text: "真实Offer", fontSize: 17, id: "offer-chip" }) : ""}
  <text x="540" y="${layout.footer.y + 13}" text-anchor="middle">${escapeXml(config.fixedCopy.footerNote)}</text>
</svg>`.trim();
}
```

- [ ] **Step 3: Run tests to verify export now follows the same geometry contract**

Run:

```bash
node --test app.test.js
```

Expected: SVG geometry/background assertions pass together with the previous typed-upload test suite.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js app.test.js
git commit -m "feat: drive svg export from shared poster reference"
```

## Task 6: Run the full validation loop at 100%, 50%, and 200%

**Files:**
- Test: `app.test.js`
- Test: manual browser check at `http://localhost:4173/`

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with all current typed-upload, background, layout-reference, and SVG geometry tests green.

- [ ] **Step 2: Verify the fixed background is the rebuilt asset in the browser**

Check:

```text
Open http://localhost:4173/ and confirm the preview background is the rebuilt blue/gold association background, not the old merged PNG and not assets/1-poster.png.
```

Expected: the preview uses `poster-background-brand-rebuilt.svg`, keeps association branding at the top, and preserves the fixed-background rule.

- [ ] **Step 3: Perform the 100% zoom review**

Check:

```text
At 100% zoom compare the preview against assets/模拟素材.jpg and verify slogan block, title frame, three path cards, certificate chip, offer chip, photo stack, and footer centerline all visually align.
```

Expected: no obvious block-level drift; title/path/image/footer modules feel locked to the same grid.

- [ ] **Step 4: Perform the 50% zoom review**

Check:

```text
At 50% zoom verify total page rhythm, white-space distribution, bottom city/building weight, and gold motion path density match the reference composition.
```

Expected: the poster reads as one coherent association-branded composition without top-heavy or bottom-heavy bias.

- [ ] **Step 5: Perform the 200% zoom review**

Check:

```text
At 200% zoom inspect title border thickness, card edge spacing, chip offsets, letter-spacing, and any background/image overlap seams.
```

Expected: no visible chip drift, no empty label placeholders, and no new color banding or text clipping.

- [ ] **Step 6: Stop the local preview server after QA**

Run:

```bash
pkill -f "python3 -m http.server 4173"
```

Expected: the temporary QA server stops cleanly.

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add assets/poster-background-brand-rebuilt.svg template-config.example.js index.html styles.css app.js app.test.js
git commit -m "feat: rebuild poster background and align preview export"
```
