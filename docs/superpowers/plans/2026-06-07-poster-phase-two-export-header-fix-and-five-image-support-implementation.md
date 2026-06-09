# Poster Phase Two Export Header Fix And Five Image Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the export-only header overlap bug by unifying top-area geometry across preview and formal export, and extend the poster system from supporting 1-3 images to supporting 1-5 images with formal layouts, tests, and regression coverage.

**Architecture:** Keep the existing `index.html + styles.css + app.js + template-config.example.js` static architecture. First lock the header overlap and 1-5 image requirements with failing tests in `app.test.js`, then update `template-config.example.js` so header geometry and 4/5-image layouts become configuration truth. After that, implement the minimal `app.js` changes to use shared header geometry, expand validation and preview/export slot handling to 5 images, then extend the visual regression script and QA matrix for the new scenarios.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, SVG generation, browser canvas PNG conversion, Node `node:test`, Playwright-based screenshot script, Markdown QA docs

---

## Repository Note

- 当前目录可能不是 git 仓库。
- 每个任务保留 git 检查与提交步骤；如果 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，记录结果并跳过 commit。

## File Map

- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
  - 为顶部区共享几何、1-5 张校验、4/5 张布局、预览槽位与视觉回归新增红绿测试
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/template-config.example.js`
  - 补齐共享 header 几何
  - 新增 `4-image` 与 `5-image` 配置
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
  - 修复正式导出顶部区使用共享 header 几何
  - 扩展校验、预览、导出、槽位映射与摘要逻辑到 5 张
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
  - 如需要，新增第 4、5 张预览槽位
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
  - 新增第 4、5 张预览槽位样式，并保持标签与图片区安全距离
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
  - 增加 4 图 / 5 图及顶部区专项回归场景
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
  - 加入 4 图 / 5 图与顶部区无重叠检查项
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-final-acceptance-report.md`
  - 回填本轮自动验证结果

## Task 1: Lock the export header overlap bug with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a shifted header config fixture that exposes separate logo and slogan geometry**

```js
const headerGeometryConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage: oldAssociationBackgroundPath,
    logoImage: "",
  },
  layoutReference: {
    ...shiftedPathAreaConfig.layoutReference,
    header: {
      logo: { x: 540, y: 86, width: 148, height: 102 },
      orgNameCn: { x: 540, y: 160, fontSize: 24, fontWeight: 700, letterSpacing: 1 },
      orgNameEn: { x: 540, y: 194, fontSize: 16, fontWeight: 500, letterSpacing: 1.2 },
      slogan: { x: 540, y: 262, fontSize: 64, fontWeight: 800, letterSpacing: 4 },
      sloganEn: { x: 540, y: 326, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
    },
  },
});
```

- [ ] **Step 2: Add a failing test that the formal SVG uses the shared header geometry instead of legacy hard-coded top coordinates**

```js
test("createPosterSvgMarkup uses shared header geometry for logo and slogans", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, headerGeometryConfig);

  assert.match(svg, /id="poster-header-logo"/);
  assert.match(svg, /x="466" y="35" width="148" height="102"/);
  assert.match(svg, /<text x="540" y="262"[^>]+>让梦想起航 连接未来<\/text>/);
  assert.match(svg, /<text x="540" y="326"[^>]+>Embark Your Dream, Connect to the Future<\/text>/);
});
```

- [ ] **Step 3: Add a failing regression test that the slogan must sit below the logo block rather than overlap it**

```js
test("createPosterSvgMarkup keeps slogan text below the logo block in formal export", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, headerGeometryConfig);

  assert.doesNotMatch(svg, /<text x="540" y="1(4|5|6|7|8|9)\d"[^>]+>让梦想起航 连接未来<\/text>/);
});
```

- [ ] **Step 4: Run the tests and verify the new header tests fail for the expected reason**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `createPosterSvgMarkup()` still uses older top-area coordinates and does not emit the new shared logo geometry.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock shared export header geometry"
```

## Task 2: Implement shared header geometry for formal export

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/template-config.example.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Extend `template-config.example.js` with explicit logo and organization-name header geometry**

```js
header: {
  logo: { x: 540, y: 86, width: 148, height: 102 },
  orgNameCn: { x: 540, y: 160, fontSize: 24, fontWeight: 700, letterSpacing: 1 },
  orgNameEn: { x: 540, y: 194, fontSize: 16, fontWeight: 500, letterSpacing: 1.2 },
  slogan: { x: 540, y: 262, fontSize: 64, fontWeight: 800, letterSpacing: 4 },
  sloganEn: { x: 540, y: 326, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
},
```

- [ ] **Step 2: Normalize the new header geometry in `app.js`**

```js
const header = {
  logo: layout.header?.logo || { x: 540, y: 86, width: 148, height: 102 },
  orgNameCn: layout.header?.orgNameCn || { x: 540, y: 160, fontSize: 24, fontWeight: 700, letterSpacing: 1 },
  orgNameEn: layout.header?.orgNameEn || { x: 540, y: 194, fontSize: 16, fontWeight: 500, letterSpacing: 1.2 },
  slogan: layout.header?.slogan || { x: 540, y: 262, fontSize: 64, fontWeight: 800, letterSpacing: 4 },
  sloganEn: layout.header?.sloganEn || { x: 540, y: 326, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
};
```

- [ ] **Step 3: Emit the formal SVG top area from the shared header geometry**

```js
<image
  id="poster-header-logo"
  href="${escapeXml(exportBackgroundImage)}"
  x="${header.logo.x - header.logo.width / 2}"
  y="${header.logo.y - header.logo.height / 2}"
  width="${header.logo.width}"
  height="${header.logo.height}"
  preserveAspectRatio="xMidYMid meet"
/>
<text x="${header.orgNameCn.x}" y="${header.orgNameCn.y}" ...>${escapeXml(config.fixedCopy.organizationNameCn)}</text>
<text x="${header.orgNameEn.x}" y="${header.orgNameEn.y}" ...>${escapeXml(config.fixedCopy.organizationNameEn)}</text>
<text x="${header.slogan.x}" y="${header.slogan.y}" ...>${escapeXml(config.fixedCopy.sloganCn)}</text>
<text x="${header.sloganEn.x}" y="${header.sloganEn.y}" ...>${escapeXml(config.fixedCopy.sloganEn)}</text>
```

- [ ] **Step 4: Run the tests and verify the header-overlap tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the two new shared-header tests.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.js app.test.js
git commit -m "fix: unify export header geometry"
```

## Task 3: Lock 1-5 image validation and layout expansion with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a failing test that validation now accepts up to five images**

```js
test("validatePosterRecord accepts up to five uploaded images", () => {
  const result = validatePosterRecord(
    {
      ...sampleRecord,
      images: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }],
    },
    sampleConfig
  );

  assert.equal(result.ok, true);
});
```

- [ ] **Step 2: Add a failing test that six images are rejected**

```js
test("validatePosterRecord rejects more than five images", () => {
  const result = validatePosterRecord(
    {
      ...sampleRecord,
      images: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }, { id: "6" }],
    },
    sampleConfig
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.images, "请上传 1 到 5 张图片。");
});
```

- [ ] **Step 3: Add failing tests for formal `4-image` and `5-image` layouts**

```js
test("resolvePosterImageLayout returns a formal layout for four images", () => {
  const layout = resolvePosterImageLayout(4, sampleConfig);
  assert.equal(layout.length, 4);
});

test("resolvePosterImageLayout returns a formal layout for five images", () => {
  const layout = resolvePosterImageLayout(5, sampleConfig);
  assert.equal(layout.length, 5);
});
```

- [ ] **Step 4: Run the tests and verify the new 1-5 image tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because validation still enforces `1 到 3 张` and there are no `4-image` / `5-image` configs yet.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock five image support"
```

## Task 4: Implement 1-5 image validation and config-driven layouts

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/template-config.example.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Update validation in `app.js` from `1-3` to `1-5`**

```js
if (cleaned.images.length < 1 || cleaned.images.length > 5) {
  errors.images = "请上传 1 到 5 张图片。";
}
```

- [ ] **Step 2: Add formal `4-image` and `5-image` layouts to `template-config.example.js`**

```js
"4-image": [
  { slot: "primary", x: 650, y: 566, width: 294, height: 438, rotate: -2 },
  { slot: "secondary-1", x: 560, y: 1088, width: 176, height: 270, rotate: -4 },
  { slot: "secondary-2", x: 748, y: 1080, width: 176, height: 270, rotate: 4 },
  { slot: "secondary-3", x: 654, y: 1392, width: 228, height: 320, rotate: 1 },
],
"5-image": [
  { slot: "primary", x: 648, y: 546, width: 286, height: 412, rotate: -2 },
  { slot: "secondary-1", x: 546, y: 1036, width: 170, height: 244, rotate: -5 },
  { slot: "secondary-2", x: 730, y: 1028, width: 170, height: 244, rotate: 5 },
  { slot: "secondary-3", x: 546, y: 1322, width: 170, height: 244, rotate: -3 },
  { slot: "secondary-4", x: 730, y: 1316, width: 170, height: 244, rotate: 3 },
],
```

- [ ] **Step 3: Ensure `resolvePosterImageLayout()` can return the new 4/5-image configs**

```js
function resolvePosterImageLayout(imageCount, inputConfig) {
  const config = mergeConfig(inputConfig);
  return config.imageLayouts?.[`${imageCount}-image`] || [];
}
```

- [ ] **Step 4: Run the tests and verify the 1-5 image validation tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for validation and `resolvePosterImageLayout(4|5)` tests.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add template-config.example.js app.js app.test.js
git commit -m "feat: add five image layout support"
```

## Task 5: Lock preview and export behavior for four and five images with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a helper stub for five preview slots**

```js
const createFiveSlotElements = () => ({
  previewPrimaryImage: createPreviewSlot(),
  previewSecondaryImageA: createPreviewSlot(),
  previewSecondaryImageB: createPreviewSlot(),
  previewSecondaryImageC: createPreviewSlot(),
  previewSecondaryImageD: createPreviewSlot(),
});
```

- [ ] **Step 2: Add a failing test that preview can activate all five slots**

```js
test("renderPreview activates five preview slots when five images are uploaded", () => {
  const slotElements = createFiveSlotElements();
  renderPreview(
    {
      previewCard: { style: { setProperty() {} } },
      previewBackgroundImage: { src: "", removeAttribute() {} },
      previewTitle: { textContent: "" },
      previewSubtitle: { textContent: "" },
      previewSubtitlePill: { textContent: "" },
      previewHighSchool: { textContent: "" },
      previewAssociate: { textContent: "" },
      previewBachelor: { textContent: "" },
      previewCertificateChip: { hidden: true },
      previewOfferChip: { hidden: true },
      previewBoard: { dataset: {} },
      previewImageCount: { textContent: "", hidden: false },
      ...slotElements,
    },
    {
      manualRecord: {
        ...sampleRecord,
        images: [1, 2, 3, 4, 5].map((index) => ({ previewUrl: `https://cdn.example.com/${index}.png` })),
      },
    },
    mergeConfig(sampleConfig)
  );

  assert.equal(slotElements.previewSecondaryImageD.hidden, false);
});
```

- [ ] **Step 3: Add a failing export test that five images are mapped into formal SVG slots**

```js
test("createPosterSvgMarkup renders five configured image slots", async () => {
  const svg = await createPosterSvgMarkup(
    {
      ...sampleRecord,
      images: [1, 2, 3, 4, 5].map((index) => ({
        previewUrl: `https://cdn.example.com/${index}.png`,
        name: `${index}.png`,
      })),
    },
    localBackgroundConfig
  );

  assert.match(svg, /slot="primary"/);
  assert.match(svg, /slot="secondary-4"/);
});
```

- [ ] **Step 4: Run the tests and verify the new preview/export five-image tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because preview only has 3 slots and formal mapping does not yet render 5 configured images.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock four and five image preview export behavior"
```

## Task 6: Implement four- and five-image preview/export slots

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add the fourth and fifth preview slot figures to `index.html`**

```html
<figure id="preview-secondary-image-c" class="preview-photo-slot slot-secondary-c" data-empty="true" data-loading="false" hidden>
  <img alt="辅图位 C 预览" />
</figure>
<figure id="preview-secondary-image-d" class="preview-photo-slot slot-secondary-d" data-empty="true" data-loading="false" hidden>
  <img alt="辅图位 D 预览" />
</figure>
```

- [ ] **Step 2: Add `slot-secondary-c` and `slot-secondary-d` styles to `styles.css`**

```css
.slot-secondary-c {
  left: 51.2%;
  top: 71.2%;
  width: 19.6%;
  height: 15.6%;
  transform: rotate(-3deg);
}

.slot-secondary-d {
  left: 68.2%;
  top: 70.9%;
  width: 19.6%;
  height: 15.6%;
  transform: rotate(3deg);
}
```

- [ ] **Step 3: Update `app.js` to register and render up to five preview slots**

```js
const slots = [
  elements.previewPrimaryImage,
  elements.previewSecondaryImageA,
  elements.previewSecondaryImageB,
  elements.previewSecondaryImageC,
  elements.previewSecondaryImageD,
].filter(Boolean);
```

- [ ] **Step 4: Ensure formal SVG mapping carries all configured slot names**

```js
const images = mapImagesToPosterSlots(
  cleaned.images,
  resolvePosterImageLayout(cleaned.images.length, config)
).map((item) => ({ ...item, slot: item.slot }));
```

- [ ] **Step 5: Run the tests and verify the new preview/export slot tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new preview five-slot test and five-image formal export test.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add index.html styles.css app.js app.test.js
git commit -m "feat: render four and five image poster layouts"
```

## Task 7: Extend visual regression and QA handoff for the new scenarios

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-final-acceptance-report.md`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add failing tests that the visual regression script now includes four- and five-image scenarios**

```js
test("visual regression script defines four-image and five-image scenarios", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /four-images-desktop/);
  assert.match(source, /five-images-desktop/);
  assert.match(source, /header-safe-zone/);
});
```

- [ ] **Step 2: Add a failing test that the manual acceptance matrix mentions the new checks**

```js
test("phase-two manual acceptance matrix includes top header overlap and five-image checks", () => {
  const source = fs.readFileSync(
    "./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md",
    "utf8"
  );

  assert.match(source, /顶部区无重叠/);
  assert.match(source, /4 图/);
  assert.match(source, /5 图/);
});
```

- [ ] **Step 3: Run the tests and verify the new regression-doc tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the script and QA matrix do not yet include the new scenarios and checks.

- [ ] **Step 4: Update the regression script and QA docs**

```js
{ name: "four-images-desktop", viewport: { width: 1440, height: 1800 }, variant: "four-images" },
{ name: "five-images-desktop", viewport: { width: 1440, height: 1800 }, variant: "five-images" },
{ name: "header-safe-zone", viewport: { width: 1440, height: 1800 }, variant: "header-safe-zone" },
```

```md
| Chrome | 1440 桌面 | 顶部区无重叠专项检查 | logo、协会名、slogan 不重叠 |  |  |  |
| Chrome | 1440 桌面 | 4 图布局导出比对 | 图片不越界、标签无遮挡 |  |  |  |
| Chrome | 1440 桌面 | 5 图布局导出比对 | 图片不越界、标签无遮挡 |  |  |  |
```

- [ ] **Step 5: Run the tests and then run the visual regression script**

Run:

```bash
node --test app.test.js
node scripts/visual-regression.js
```

Expected: PASS for the new regression and QA document tests, and new screenshot assets generated for 4/5-image scenarios.

- [ ] **Step 6: Update the acceptance report with this sub-project’s verification results**

```md
## 第二期子项目 B 结果

- 顶部区共享几何已用于正式导出
- 1 到 5 张图片支持已完成
- 4 图 / 5 图专项视觉回归已执行
```

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add scripts/visual-regression.js docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-final-acceptance-report.md app.test.js
git commit -m "test: extend regression coverage for export header and five image layouts"
```

## Task 8: Final verification and cleanup

**Files:**
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/template-config.example.js`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`

- [ ] **Step 1: Run the full unit suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with header geometry, 1-5 image validation, preview slots, and QA assertions all green.

- [ ] **Step 2: Run the visual regression script**

Run:

```bash
node scripts/visual-regression.js
```

Expected: screenshot manifest includes 4-image, 5-image, and header-safe-zone scenarios.

- [ ] **Step 3: Check diagnostics for all edited source files**

Run editor diagnostics on:

- `app.js`
- `template-config.example.js`
- `index.html`
- `styles.css`
- `app.test.js`
- `scripts/visual-regression.js`

Expected: no blocking diagnostics.

- [ ] **Step 4: Stop any local preview server started during verification**

Expected: no lingering background server process remains after completion.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js template-config.example.js index.html styles.css app.test.js scripts/visual-regression.js docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-final-acceptance-report.md
git commit -m "feat: fix export header overlap and support five poster images"
```

## Self-Review

- Spec coverage:
  - 顶部区共享几何与导出重叠修复由 Task 1-2 覆盖
  - 1-5 张校验与正式布局扩容由 Task 3-4 覆盖
  - 4/5 张预览与正式导出槽位由 Task 5-6 覆盖
  - 专项视觉回归与第二期人工验收衔接由 Task 7 覆盖
  - 最终验证与清理由 Task 8 覆盖
- Placeholder scan:
  - 已避免 `TODO`、`TBD`、`implement later`、`Similar to Task` 等占位表述
  - 每个任务都提供了明确文件、命令、预期结果和代码示例
- Type consistency:
  - 统一使用 `createPosterSvgMarkup()`、`validatePosterRecord()`、`resolvePosterImageLayout()`、`renderPreview()`、`visual-regression.js`
  - 文档路径、脚本路径、测试断言路径前后一致
