# Poster Export Embedded Background And Mock Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix gray-background failures in exported SVG and PNG by embedding the formal background into export artifacts, and realign uploaded-image placement plus text-frame styling to match `assets/模拟素材.jpg`.

**Architecture:** Keep the current static `index.html + styles.css + app.js` architecture and preserve typed-upload behavior. Add an export-only background embedding path inside `app.js`, then retune `template-config.example.js` and preview CSS so preview and formal export consume the same mock-aligned geometry. Verification combines `node:test` regression checks and browser-based visual checks across empty, single-category, and dual-category upload states.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, SVG generation, browser canvas PNG conversion, Node `node:test`, Playwright-based browser verification

---

## Repository Note

- 当前目录可能不是 git 仓库。
- 每个任务保留 git 检查与提交步骤；如果 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，记录结果并跳过 commit。

## File Map

- Modify: `app.js`
  - 添加导出背景内嵌与导出专用资源解析逻辑
  - 修复 PNG 下载链路
  - 让正式 SVG 的图片区与文字框更多依赖统一参数
- Modify: `template-config.example.js`
  - 回调 `imageLayouts`、`textBlocks`、`layoutReference`
  - 让正式导出与预览一起贴近 `模拟素材.jpg`
- Modify: `styles.css`
  - 回调标题牌匾、路径区、图片区和标签的样式细节
- Modify: `app.test.js`
  - 增加背景内嵌、导出几何、布局回调与 PNG 链路测试
- Create: `.tmp-visual-regression.js`
  - 临时浏览器验证脚本，仅在执行期使用，最后删除

## Task 1: Lock failing tests for embedded export background

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add a local background fixture and a config that uses it**

```js
const fs = require("node:fs");
const path = require("node:path");

const localBackgroundPath =
  "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png";

const localBackgroundConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage: localBackgroundPath,
    logoImage: "",
  },
});
```

- [ ] **Step 2: Add a failing test that formal SVG export must contain embedded background data**

```js
test("createPosterSvgMarkup embeds the formal background instead of keeping only a relative file path", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);

  assert.match(svg, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(
    svg,
    /<image[^>]+href="\.\/assets\/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png"/
  );
});
```

- [ ] **Step 3: Add a failing test that preview asset status still uses the file path**

```js
test("getBrandAssetStatus keeps the preview background as a file path even when formal export embeds it", () => {
  const status = getBrandAssetStatus(localBackgroundConfig);

  assert.equal(status.backgroundImage, localBackgroundPath);
  assert.equal(status.ok, true);
});
```

- [ ] **Step 4: Run the tests and verify the new export-embedding test fails**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `createPosterSvgMarkup()` currently emits `<image href="./assets/...png">` instead of embedded background data.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock embedded export background behavior"
```

## Task 2: Implement embedded background resolution for formal export

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Add a Node/browser-safe helper to resolve background for export**

```js
async function resolveExportBackgroundImage(inputConfig) {
  const assets = getBrandAssetStatus(inputConfig);
  if (!assets.ok) {
    throw new Error("请先配置固定背景图，再导出或预览正式海报。");
  }

  if (/^data:image\//.test(assets.backgroundImage)) {
    return assets.backgroundImage;
  }

  if (typeof window === "undefined") {
    const fs = require("node:fs");
    const path = require("node:path");
    const extension = path.extname(assets.backgroundImage).toLowerCase();
    const mimeType =
      extension === ".png"
        ? "image/png"
        : extension === ".jpg" || extension === ".jpeg"
          ? "image/jpeg"
          : extension === ".webp"
            ? "image/webp"
            : "application/octet-stream";
    const absolutePath = path.resolve(process.cwd(), assets.backgroundImage);
    const fileBuffer = fs.readFileSync(absolutePath);
    return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
  }

  return assets.backgroundImage;
}
```

- [ ] **Step 2: Make `createPosterSvgMarkup()` asynchronous and use the embedded export background**

```js
async function createPosterSvgMarkup(record, inputConfig) {
  const config = mergeConfig(inputConfig);
  const exportBackgroundImage = await resolveExportBackgroundImage(config);
  // ...
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ...
  <image href="${escapeXml(exportBackgroundImage)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
  ...
</svg>`.trim();
}
```

- [ ] **Step 3: Propagate async export through `exportPoster()` and batch export**

```js
async function exportPoster(record, inputConfig) {
  const cleaned = createNormalizedRecord(record);
  const fileStem = cleaned.studentId || "student-case";
  return {
    fileName: `${fileStem}-poster.svg`,
    content: await createPosterSvgMarkup(cleaned, inputConfig),
    mimeType: "image/svg+xml",
  };
}

async function exportBatchPosters(records, inputConfig) {
  return Promise.all(
    (records || []).map(async (record) => {
      try {
        return {
          studentId: record.studentId,
          ok: true,
          output: await exportPoster(record, inputConfig),
          missingImages: record.missingImages || [],
        };
      } catch (error) {
        return {
          studentId: record.studentId,
          ok: false,
          error: error.message,
          missingImages: record.missingImages || [],
        };
      }
    })
  );
}
```

- [ ] **Step 4: Update browser event handlers to await async export results**

```js
const exportResult = await exportPoster(state.manualRecord, inputConfig);
// ...
const results = await exportBatchPosters(state.batchRecords, inputConfig);
```

- [ ] **Step 5: Run tests to verify embedded-background tests now pass**

Run:

```bash
node --test app.test.js
```

Expected: the export-embedding tests pass; any tests calling `createPosterSvgMarkup()` synchronously will now fail until updated in the next task.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js app.test.js
git commit -m "fix: embed formal background into exported svg"
```

## Task 3: Update tests and PNG export expectations for async export flow

**Files:**
- Modify: `app.test.js`
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Convert existing SVG/export tests to await the async export APIs**

```js
test("createPosterSvgMarkup uses layoutReference path area geometry instead of legacy hard-coded path coordinates", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, shiftedPathAreaConfig);

  assert.match(svg, /<rect x="96" y="700" width="324" height="64"/);
  assert.match(svg, /<rect x="40" y="790" width="540" height="142" rx="22"/);
});

test("exportPoster returns a single svg export for one record", async () => {
  const exported = await exportPoster(sampleRecord, sampleConfig);

  assert.equal(exported.fileName, "stu-001-poster.svg");
  assert.match(exported.content, /真实案例展示/);
});
```

- [ ] **Step 2: Add a focused test for PNG pipeline inputs**

```js
test("exportPoster returns svg content with embedded background ready for png conversion", async () => {
  const exported = await exportPoster(sampleRecord, localBackgroundConfig);

  assert.match(exported.content, /data:image\/png;base64,/);
  assert.equal(exported.mimeType, "image/svg+xml");
});
```

- [ ] **Step 3: If needed, expose a tiny helper that `downloadSvgAsPng()` can rely on without reintroducing path-based background behavior**

```js
const api = {
  // ...
  resolveExportBackgroundImage,
  createPosterSvgMarkup,
  exportPoster,
  exportBatchPosters,
};
```

- [ ] **Step 4: Run the full test suite and make it green again**

Run:

```bash
node --test app.test.js
```

Expected: all async export tests pass with embedded background output.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js app.test.js
git commit -m "test: align export tests with embedded background flow"
```

## Task 4: Recalibrate image layout and text geometry to `模拟素材.jpg`

**Files:**
- Modify: `template-config.example.js`
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add failing geometry tests for the new mock-aligned image layouts**

```js
const strictMockAlignedConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage: localBackgroundPath,
    logoImage: "",
  },
  textBlocks: {
    title: { x: 540, y: 454 },
    subtitle: { x: 540, y: 546 },
    highSchoolStage: { x: 310, y: 864 },
    associateStage: { x: 310, y: 1097 },
    bachelorStage: { x: 310, y: 1319 },
  },
  imageLayouts: {
    "1-image": [{ slot: "primary", x: 650, y: 610, width: 328, height: 540, rotate: -2 }],
    "2-image": [
      { slot: "primary", x: 648, y: 596, width: 324, height: 512, rotate: -2 },
      { slot: "secondary-1", x: 540, y: 1126, width: 286, height: 352, rotate: 2 },
    ],
    "3-image": [
      { slot: "primary", x: 646, y: 598, width: 320, height: 504, rotate: -2 },
      { slot: "secondary-1", x: 556, y: 1438, width: 196, height: 336, rotate: -5 },
      { slot: "secondary-2", x: 740, y: 1428, width: 196, height: 336, rotate: 5 },
    ],
  },
});

test("resolvePosterImageLayout can use strict mock-aligned one-image coordinates", () => {
  const layout = resolvePosterImageLayout(1, strictMockAlignedConfig);
  assert.deepEqual(layout[0], {
    slot: "primary",
    x: 650,
    y: 610,
    width: 328,
    height: 540,
    rotate: -2,
  });
});
```

- [ ] **Step 2: Add a failing SVG assertion for mock-aligned title and image geometry**

```js
test("createPosterSvgMarkup uses strict mock-aligned title and image geometry", async () => {
  const svg = await createPosterSvgMarkup(typedRecord, strictMockAlignedConfig);

  assert.match(svg, /<text x="540" y="454" text-anchor="middle" fill="#fff0c6" font-size="84"/);
  assert.match(svg, /<rect x="752" y="500" width="232" height="50" rx="25"/);
  assert.match(svg, /<rect x="648" y="596" width="324" height="512" rx="20"/);
});
```

- [ ] **Step 3: Update `template-config.example.js` to the strict mock-aligned geometry**

```js
textBlocks: {
  title: { x: 540, y: 454 },
  subtitle: { x: 540, y: 546 },
  highSchoolStage: { x: 310, y: 864 },
  associateStage: { x: 310, y: 1097 },
  bachelorStage: { x: 310, y: 1319 },
},
imageLayouts: {
  "1-image": [{ slot: "primary", x: 650, y: 610, width: 328, height: 540, rotate: -2 }],
  "2-image": [
    { slot: "primary", x: 648, y: 596, width: 324, height: 512, rotate: -2 },
    { slot: "secondary-1", x: 540, y: 1126, width: 286, height: 352, rotate: 2 },
  ],
  "3-image": [
    { slot: "primary", x: 646, y: 598, width: 320, height: 504, rotate: -2 },
    { slot: "secondary-1", x: 556, y: 1438, width: 196, height: 336, rotate: -5 },
    { slot: "secondary-2", x: 740, y: 1428, width: 196, height: 336, rotate: 5 },
  ],
},
```

- [ ] **Step 4: Run the tests and verify the new geometry matches formal SVG output**

Run:

```bash
node --test app.test.js
```

Expected: the strict mock-aligned geometry tests pass.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.test.js
git commit -m "fix: realign export geometry to mock reference"
```

## Task 5: Tighten preview CSS to match the mock-aligned title and text-frame styling

**Files:**
- Modify: `styles.css`
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add a lightweight CSS snapshot test by reading the stylesheet**

```js
test("styles.css keeps the preview title frame and image slots aligned to mock-driven proportions", () => {
  const css = fs.readFileSync("./styles.css", "utf8");

  assert.match(css, /\.slot-primary\s*\{[\s\S]*width:\s*79%/);
  assert.match(css, /\.slot-primary\s*\{[\s\S]*height:\s*48%/);
  assert.match(css, /\.poster-title-block h2\s*\{[\s\S]*font-size:\s*clamp\(38px,\s*4\.5vw,\s*62px\)/);
});
```

- [ ] **Step 2: Update preview CSS where text frame and image slot details still drift**

```css
.slot-primary {
  top: 2.4%;
  right: 0.2%;
  width: 79%;
  height: 48.6%;
  transform: rotate(-2deg);
}

.slot-secondary-a {
  top: 61.2%;
  left: 1.8%;
  width: 45%;
  height: 26.2%;
  transform: rotate(2deg);
}

.poster-title-block h2 {
  padding: 18px 54px;
  font-size: clamp(38px, 4.5vw, 62px);
  line-height: 1.08;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 3: Run tests to keep CSS and JS geometry changes green together**

Run:

```bash
node --test app.test.js
```

Expected: the stylesheet assertions and existing logic tests all pass.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add styles.css app.test.js
git commit -m "fix: tighten preview text frame and image slot styling"
```

## Task 6: Add browser visual regression checks for preview and export consistency

**Files:**
- Create: `.tmp-visual-regression.js`
- Test: manual browser verification with Playwright

- [ ] **Step 1: Create a temporary browser verification script**

```js
const { chromium } = require("playwright");
const path = require("path");

const certificateAsset = path.resolve("assets/1-poster.png");
const offerAsset = path.resolve("assets/1-poster.png");
const expectedBackground =
  "香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png";

async function snapshotScenario(page, label, actions) {
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await actions();
  await page.screenshot({ path: `.visual-${label}.png`, fullPage: true });
  return page.evaluate((expectedBackgroundPath) => {
    const bg = document.querySelector("#preview-background-image");
    const cert = document.querySelector("#preview-certificate-chip");
    const offer = document.querySelector("#preview-offer-chip");
    const board = document.querySelector(".preview-board");
    return {
      backgroundOk: (bg?.getAttribute("src") || "").includes(expectedBackgroundPath),
      certificateHidden: cert?.hidden ?? null,
      offerHidden: offer?.hidden ?? null,
      layout: board?.dataset?.layout || "",
    };
  }, expectedBackground);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 1700 } });

  console.log("empty", await snapshotScenario(page, "empty", async () => {}));
  console.log(
    "certificate-only",
    await snapshotScenario(page, "certificate-only", async () => {
      await page.setInputFiles("#certificate-images-input", certificateAsset);
      await page.waitForTimeout(300);
    })
  );
  console.log(
    "offer-only",
    await snapshotScenario(page, "offer-only", async () => {
      await page.setInputFiles("#offer-images-input", offerAsset);
      await page.waitForTimeout(300);
    })
  );
  console.log(
    "both-types",
    await snapshotScenario(page, "both-types", async () => {
      await page.setInputFiles("#certificate-images-input", certificateAsset);
      await page.setInputFiles("#offer-images-input", offerAsset);
      await page.waitForTimeout(300);
    })
  );

  await browser.close();
})();
```

- [ ] **Step 2: Start a local preview server**

Run:

```bash
python3 -m http.server 4173
```

Expected: server starts on `http://127.0.0.1:4173/`.

- [ ] **Step 3: Run the visual regression script**

Run:

```bash
node .tmp-visual-regression.js
```

Expected: console output shows `backgroundOk: true` for all scenarios, chips hide/show correctly, and screenshots are saved for review.

- [ ] **Step 4: Review the screenshots at 100%, 50%, and 200% zoom**

Check:

```text
Open `.visual-certificate-only.png`, `.visual-offer-only.png`, and `.visual-both-types.png`.
At 100% verify image placement and title/path geometry.
At 50% verify overall composition rhythm.
At 200% verify title frame padding, chip spacing, path-card alignment, and text-frame detail.
```

Expected: preview composition is visually aligned to `assets/模拟素材.jpg`.

- [ ] **Step 5: Delete the temporary script and screenshots**

Run:

```bash
rm -f .tmp-visual-regression.js .visual-empty.png .visual-certificate-only.png .visual-offer-only.png .visual-both-types.png
```

Expected: no temporary verification artifacts remain in the workspace.

- [ ] **Step 6: Stop the preview server**

Run:

```bash
pkill -f "python3 -m http.server 4173"
```

Expected: preview server stops cleanly.

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js template-config.example.js styles.css app.test.js
git commit -m "test: verify embedded export background and mock alignment"
```

## Task 7: Final verification and diagnostics cleanup

**Files:**
- Test: `app.test.js`
- Test: recently modified files via diagnostics

- [ ] **Step 1: Run the full automated suite one last time**

Run:

```bash
node --test app.test.js
```

Expected: PASS with all export background, typed-upload, geometry, and visual-support tests green.

- [ ] **Step 2: Check diagnostics for edited files**

Check:

```text
Get diagnostics for `app.js`, `template-config.example.js`, `styles.css`, and `app.test.js`.
```

Expected: no new errors; editor hints that do not affect runtime can be noted but should not block completion.

- [ ] **Step 3: Manually verify export outputs**

Check:

```text
Use the app to generate one SVG and one PNG after uploading a certificate image.
Confirm the SVG displays the formal background when opened standalone.
Confirm the PNG background color matches preview instead of falling back to gray.
```

Expected: export artifacts visually match preview background and mock-aligned layout.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js template-config.example.js styles.css app.test.js
git commit -m "fix: embed export background and align poster to mock"
```
