# Poster Old Background Recovery And Layout Readaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the poster tool to the old Hong Kong Greater Bay Area Educational Promotion Association fixed background, repair preview background rendering, and readjust the existing poster layout back toward `模拟素材.jpg` without adding or restructuring template modules.

**Architecture:** Keep the current `index.html + styles.css + app.js` structure and preserve the typed-upload business logic. Roll back the formal background source to the old association PNG, then use the existing `layoutReference`, `textBlocks`, and `imageLayouts` containers only as coordinate stores to retune preview and SVG output together. All fixes remain parameter- and style-based inside the current template framework.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, SVG string generation, Node `node:test`, local browser verification

---

## Repository Note

- 当前目录看起来不是 git 仓库。
- 每个任务仍保留 git 检查与提交步骤；如果 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，保留检查结果并跳过 commit。

## File Map

- Modify: `template-config.example.js`
  - 恢复旧协会固定背景路径
  - 回调 `layoutReference`、`textBlocks`、`imageLayouts` 数值
- Modify: `app.js`
  - 恢复正式背景读取来源
  - 修复预览背景显示逻辑
  - 同步回调 SVG 导出坐标
- Modify: `styles.css`
  - 恢复旧背景底层展示方式
  - 收紧最近一轮导致错位的绝对定位与覆盖层样式
  - 回调标题区、路径区、图片区和 footer 的位置与层级
- Modify: `index.html`
  - 原则上只做极少量属性级修复，不扩展模板结构
- Modify: `app.test.js`
  - 增加旧背景恢复、预览背景显示和导出背景源回归测试

## Task 1: Lock failing tests for old fixed background recovery

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add a config fixture that points back to the old association background**

```js
const oldBackgroundConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage:
      "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png",
    logoImage: "",
  },
});
```

- [ ] **Step 2: Add failing tests for old background path recovery and rebuilt-background exclusion**

```js
test("mergeConfig restores the old association background as the only formal background", () => {
  const config = mergeConfig(oldBackgroundConfig);

  assert.equal(
    config.assets.backgroundImage,
    "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png"
  );
});

test("createPosterSvgMarkup uses the old association background instead of the rebuilt background", () => {
  const svg = createPosterSvgMarkup(sampleRecord, oldBackgroundConfig);

  assert.match(
    svg,
    /香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png/
  );
  assert.doesNotMatch(svg, /poster-background-brand-rebuilt\.svg/);
});
```

- [ ] **Step 3: Run the tests and verify they fail for the expected reason**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `template-config.example.js` and current defaults still point at `poster-background-brand-rebuilt.svg`, or because the export still emits the rebuilt background path.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

Expected: either `true` or `fatal: not a git repository`. If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock old fixed background recovery"
```

## Task 2: Restore the old association background in configuration

**Files:**
- Modify: `template-config.example.js`
- Test: `app.test.js`

- [ ] **Step 1: Change the formal background path back to the old association PNG**

```js
assets: {
  // 正式固定背景恢复为旧协会背景图，不属于用户上传内容。
  backgroundImage:
    "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png",
  logoImage: "",
},
```

- [ ] **Step 2: Reset the layout reference toward the existing pre-rebuild geometry**

```js
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
```

- [ ] **Step 3: Run tests to verify the configuration-level recovery passes**

Run:

```bash
node --test app.test.js
```

Expected: the old-background path assertions pass; later preview/SVG tests may still fail if runtime code continues using the wrong rendering behavior.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.test.js
git commit -m "fix: restore old association background config"
```

## Task 3: Add failing preview background rendering tests

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add a focused test for preview CSS variable application and background source usage**

```js
test("getBrandAssetStatus resolves the old association background for preview use", () => {
  const status = getBrandAssetStatus(oldBackgroundConfig);

  assert.equal(status.ok, true);
  assert.equal(
    status.backgroundImage,
    "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png"
  );
});
```

- [ ] **Step 2: Add a failing test for preview image-count badge hiding once images exist**

```js
test("renderPreview hides the image-count badge when at least one image is present", () => {
  const previewImageCount = { textContent: "", hidden: false };
  const previewCard = { style: { setProperty() {} } };
  const slotFactory = () => ({
    hidden: true,
    querySelector() {
      return {
        src: "",
        removeAttribute(name) {
          if (name === "src") this.src = "";
        },
      };
    },
  });

  renderPreview(
    {
      previewCard,
      previewBackgroundImage: { src: "", removeAttribute() {} },
      previewTitle: { textContent: "" },
      previewSubtitle: { textContent: "" },
      previewSubtitlePill: { textContent: "" },
      previewHighSchool: { textContent: "" },
      previewAssociate: { textContent: "" },
      previewBachelor: { textContent: "" },
      previewCertificateChip: { hidden: true },
      previewOfferChip: { hidden: true },
      previewPrimaryImage: slotFactory(),
      previewSecondaryImageA: slotFactory(),
      previewSecondaryImageB: slotFactory(),
      previewBoard: { dataset: {} },
      previewImageCount,
    },
    {
      manualRecord: {
        ...typedRecord,
      },
    },
    oldBackgroundConfig
  );

  assert.equal(previewImageCount.hidden, true);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `getBrandAssetStatus` and `renderPreview` are not exported/test-shaped yet, or because the preview badge remains visible after images are present.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: cover preview background recovery behavior"
```

## Task 4: Implement preview background recovery and empty-state cleanup in `app.js`

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Export `getBrandAssetStatus` and `renderPreview` for direct tests**

```js
const api = {
  mergeConfig,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
  normalizeLayoutReference,
  getPreviewCssVariables,
  applyPreviewLayout,
  getBrandAssetStatus,
  renderPreview,
  validatePosterRecord,
  resolvePosterImageLayout,
  mapImagesToPosterSlots,
  createPosterSvgMarkup,
  exportPoster,
  buildBatchRecordsFromCsv,
  matchRecordImages,
  exportBatchPosters,
};
```

- [ ] **Step 2: Make `renderPreview()` hide the image-count badge when there are uploaded images**

```js
if (elements.previewImageCount) {
  elements.previewImageCount.textContent = `当前 ${cleanedRecord.images.length} 张图`;
  elements.previewImageCount.hidden = cleanedRecord.images.length > 0;
}
```

- [ ] **Step 3: Keep preview background source strictly driven by the restored old background**

```js
const assets = getBrandAssetStatus(config);
if (elements.previewBackgroundImage) {
  if (assets.backgroundImage) {
    elements.previewBackgroundImage.src = assets.backgroundImage;
  } else {
    elements.previewBackgroundImage.removeAttribute("src");
  }
}
```

- [ ] **Step 4: Run tests to verify preview recovery helpers now pass**

Run:

```bash
node --test app.test.js
```

Expected: the new preview recovery tests pass and no existing typed-upload tests regress.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js app.test.js
git commit -m "fix: restore preview background behavior"
```

## Task 5: Re-tune preview CSS back toward the mock-material structure

**Files:**
- Modify: `styles.css`
- Modify: `index.html` (only if absolutely needed)
- Test: manual browser verification

- [ ] **Step 1: Restore the preview background layer to a stable full-bleed image presentation**

```css
.poster-background-layer {
  position: absolute;
  inset: 0;
  display: block;
  background: #d6dae5;
}

.poster-background-layer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
```

- [ ] **Step 2: Remove the recent absolute-position drift that broke the existing frame composition**

```css
.poster-overlay {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
  height: 100%;
  padding: 186px 22px 22px;
}

.poster-main {
  display: grid;
  grid-template-columns: 0.96fr 0.9fr;
  gap: 14px;
  align-items: start;
}

.preview-board {
  position: relative;
  min-height: 980px;
  left: auto;
  top: auto;
  width: auto;
  height: auto;
}
```

- [ ] **Step 3: Reapply the stable preview photo-slot geometry that matches the old template flow**

```css
.slot-primary {
  top: 70px;
  right: 0;
  width: 248px;
  height: 340px;
  transform: rotate(-2deg);
}

.slot-secondary-a {
  top: 520px;
  left: 10px;
  width: 220px;
  height: 200px;
  transform: rotate(2deg);
}

.slot-secondary-b {
  top: 742px;
  left: 42px;
  width: 160px;
  height: 250px;
  transform: rotate(-5deg);
}
```

- [ ] **Step 4: Keep existing DOM structure unless a single missing attribute blocks background rendering**

```html
<div id="poster-preview" class="poster-preview">
  <div class="poster-background-layer" aria-hidden="true">
    <img id="preview-background-image" alt="" />
  </div>
  <div class="poster-overlay">
    <!-- keep the existing preview DOM unchanged -->
  </div>
</div>
```

- [ ] **Step 5: Run automated tests to ensure CSS-only recovery does not break logic**

Run:

```bash
node --test app.test.js
```

Expected: all tests remain green.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add styles.css index.html app.test.js
git commit -m "fix: restore old preview background composition"
```

## Task 6: Re-tune SVG export geometry back toward `模拟素材.jpg`

**Files:**
- Modify: `template-config.example.js`
- Modify: `app.js`
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add failing SVG assertions for old background and layout geometry**

```js
test("createPosterSvgMarkup keeps old background and restored title frame geometry", () => {
  const svg = createPosterSvgMarkup(sampleRecord, oldBackgroundConfig);

  assert.match(
    svg,
    /香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png/
  );
  assert.match(svg, /<rect x="76" y="374" width="928" height="152" rx="18"/);
});
```

- [ ] **Step 2: Revert the export geometry to the restored layout reference values**

```js
${visibility.showCertificateChip
  ? createChipMarkup({
      ...layout.imageArea.certificateChip,
      text: config.fixedCopy.imageLabel,
      fontSize: 18,
    })
  : ""}
${visibility.showOfferChip
  ? createChipMarkup({
      ...layout.imageArea.offerChip,
      text: "真实Offer",
      fontSize: 17,
      id: "offer-chip",
    })
  : ""}
${createFooterMarkup(config)}
```

- [ ] **Step 3: If the title/path coordinates drifted, retune `textBlocks` and `imageLayouts` to the old mock-aligned values**

```js
textBlocks: {
  title: { x: 540, y: 462 },
  subtitle: { x: 540, y: 580 },
  highSchoolStage: { x: 300, y: 825 },
  associateStage: { x: 300, y: 1078 },
  bachelorStage: { x: 300, y: 1334 },
},
imageLayouts: {
  "1-image": [{ slot: "primary", x: 640, y: 560, width: 360, height: 520, rotate: -2 }],
  "2-image": [
    { slot: "primary", x: 642, y: 560, width: 356, height: 500, rotate: -2 },
    { slot: "secondary-1", x: 540, y: 1085, width: 308, height: 360, rotate: 2 },
  ],
  "3-image": [
    { slot: "primary", x: 650, y: 560, width: 348, height: 492, rotate: -2 },
    { slot: "secondary-1", x: 548, y: 1360, width: 214, height: 360, rotate: -5 },
    { slot: "secondary-2", x: 730, y: 1348, width: 214, height: 360, rotate: 5 },
  ],
},
```

- [ ] **Step 4: Run the full test suite to verify export and preview remain aligned**

Run:

```bash
node --test app.test.js
```

Expected: all old-background, typed-upload, chip-visibility, and SVG geometry tests pass together.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.js app.test.js
git commit -m "fix: readapt svg export to old background layout"
```

## Task 7: Run multi-scenario verification and clean up

**Files:**
- Test: `app.test.js`
- Test: manual browser verification with a local static server

- [ ] **Step 1: Run the automated suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with all recovery, background, layout, and typed-upload tests green.

- [ ] **Step 2: Start a local preview server**

Run:

```bash
python3 -m http.server 4173
```

Expected: server starts on `http://localhost:4173/`.

- [ ] **Step 3: Verify the empty preview state**

Check:

```text
Open http://localhost:4173/ and confirm that the preview shows the old association fixed background immediately, without uploads, without a gray fallback replacing the background, and without misplaced overlay text blocks.
```

Expected: the old fixed background is visible end-to-end and the poster frame is stable.

- [ ] **Step 4: Verify the four required upload scenarios**

Check:

```text
Scenario A: upload no images -> background remains intact and no empty asset labels appear.
Scenario B: upload only certificate images -> certificate chip appears, offer chip stays hidden, background stays intact.
Scenario C: upload only offer images -> offer chip appears, certificate chip stays hidden, background stays intact.
Scenario D: upload both categories -> both chips appear, image slots render, no label overlaps the title frame.
```

Expected: all four scenarios behave exactly as described.

- [ ] **Step 5: Perform the 100% / 50% / 200% layout checks**

Check:

```text
At 100% zoom inspect title frame, path cards, chips, photo area, and footer positions against `assets/模拟素材.jpg`.
At 50% zoom inspect overall composition rhythm and white-space balance.
At 200% zoom inspect border thickness, chip spacing, title-frame details, and path-card alignment.
```

Expected: no obvious background failures, no major visual drift, and no new overlap or clipping.

- [ ] **Step 6: Stop the local preview server**

Run:

```bash
pkill -f "python3 -m http.server 4173"
```

Expected: the temporary preview server stops cleanly.

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.js styles.css index.html app.test.js
git commit -m "fix: restore old background and readapt poster layout"
```
