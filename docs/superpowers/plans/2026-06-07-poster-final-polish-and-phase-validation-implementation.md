# Poster Final Polish And Phase Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete phase-one project polish by standardizing CSS, unifying preview/export image behavior, adding browser-based visual regression coverage, and generating a phase-two manual acceptance package.

**Architecture:** Keep the current static `index.html + styles.css + app.js + template-config.example.js` architecture. Use TDD to first lock CSS tokens, image layout behavior, and picture-loading rules in `app.test.js`, then refactor preview CSS and lightweight runtime helpers so preview and formal export continue converging on one geometry model. Add a separate browser verification script for screenshot-based regression, and finish with documentation that turns the second-phase browser/device/network checks into a real manual acceptance matrix rather than fake automation.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node `node:test`, filesystem assertions, local SVG export, browser automation via Playwright-style Node script

---

## Repository Note

- 当前目录可能不是 git 仓库。
- 每个任务保留 git 检查与提交步骤；如果 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，记录结果并跳过 commit。

## File Map

- Modify: `styles.css`
  - 收敛全局 token、页面壳层、海报预览、图片槽位、标签与结果区样式
  - 统一图片裁剪、占位、圆角、阴影和间距规范
- Modify: `app.js`
  - 增加预览图片槽位配置映射、占位态和图片加载状态管理
  - 让预览图片区进一步依赖统一布局数据而非散落百分比
- Modify: `template-config.example.js`
  - 如有必要，补齐预览驱动所需的图片布局基准与标签位置
- Modify: `app.test.js`
  - 增加 CSS 规范断言、图片加载状态断言、预览布局断言、文档产出断言
- Modify: `index.html`
  - 如有必要，为图片占位态或视觉回归选择器补充稳定的 DOM 标记
- Create: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
  - 独立截图回归脚本，覆盖空状态、单类素材、双类素材、1/2/3 图和桌面/移动断点
- Create: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
  - 第二期人工终验矩阵
- Create: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-issue-closure-template.md`
  - 问题记录与闭环模板

## Task 1: Lock CSS standardization expectations with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a helper that reads `styles.css` once for structure assertions**

```js
const stylesSource = fs.readFileSync("./styles.css", "utf8");
```

- [ ] **Step 2: Add a failing test that CSS tokens and semantic groups exist**

```js
test("styles.css defines a shared poster design token set", () => {
  assert.match(stylesSource, /--text:\s*#10203f/);
  assert.match(stylesSource, /--gold:\s*#d6b167/);
  assert.match(stylesSource, /--shadow:\s*0 28px 80px rgba\(6, 24, 66, 0\.18\)/);
  assert.match(stylesSource, /\.poster-preview\s*\{/);
  assert.match(stylesSource, /\.preview-photo-slot\s*\{/);
});
```

- [ ] **Step 3: Add a failing test that the preview image slots use configuration-driven CSS variables instead of hard-coded percent-only positioning**

```js
test("styles.css exposes slot positioning through preview image custom properties", () => {
  assert.match(stylesSource, /--preview-image-x:/);
  assert.match(stylesSource, /--preview-image-y:/);
  assert.match(stylesSource, /--preview-image-width:/);
  assert.match(stylesSource, /--preview-image-height:/);
});
```

- [ ] **Step 4: Add a failing test that image placeholders and loading states are styled consistently**

```js
test("styles.css defines unified preview image loading and placeholder states", () => {
  assert.match(stylesSource, /\.preview-photo-slot\[data-loading="true"\]/);
  assert.match(stylesSource, /\.preview-photo-slot\[data-empty="true"\]/);
  assert.match(stylesSource, /\.preview-photo-slot img\s*\{/);
});
```

- [ ] **Step 5: Run the tests and verify the new CSS structure assertions fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the new preview image custom properties and loading-state selectors do not exist yet.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock css polish expectations"
```

## Task 2: Implement CSS token cleanup and preview image slot variables

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Expand preview CSS variables in `app.js` so slot geometry can be written from layout data**

```js
function getPreviewImageCssVariables(layout) {
  const output = {};
  (layout || []).forEach((slot, index) => {
    const key = `--preview-slot-${index + 1}`;
    output[`${key}-x`] = String(slot.x);
    output[`${key}-y`] = String(slot.y);
    output[`${key}-width`] = String(slot.width);
    output[`${key}-height`] = String(slot.height);
    output[`${key}-rotate`] = String(slot.rotate || 0);
  });
  return output;
}
```

- [ ] **Step 2: Apply the slot CSS variables during preview rendering**

```js
const previewLayout =
  cleanedRecord.images.length >= 1 ? resolvePosterImageLayout(cleanedRecord.images.length, config) : [];

Object.entries(getPreviewImageCssVariables(previewLayout)).forEach(([name, value]) => {
  elements.previewCard.style.setProperty(name, value);
});
```

- [ ] **Step 3: Refactor `styles.css` to centralize poster variables and slot geometry**

```css
.poster-preview {
  --canvas-width: 1080;
  --canvas-height: 1920;
  --preview-slot-1-x: 650;
  --preview-slot-1-y: 610;
  --preview-slot-1-width: 328;
  --preview-slot-1-height: 540;
  --preview-slot-1-rotate: -2;
  --preview-slot-2-x: 540;
  --preview-slot-2-y: 1126;
  --preview-slot-2-width: 286;
  --preview-slot-2-height: 352;
  --preview-slot-2-rotate: 2;
  --preview-slot-3-x: 740;
  --preview-slot-3-y: 1428;
  --preview-slot-3-width: 196;
  --preview-slot-3-height: 336;
  --preview-slot-3-rotate: 5;
}

.preview-photo-slot {
  position: absolute;
  overflow: hidden;
  border-radius: 20px;
  border: 4px solid rgba(241, 220, 175, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 248, 253, 0.92));
}
```

- [ ] **Step 4: Replace the hard-coded slot selectors with variable-driven positioning**

```css
.slot-primary {
  left: calc(var(--preview-slot-1-x) / var(--canvas-width) * 100%);
  top: calc(var(--preview-slot-1-y) / var(--canvas-height) * 100%);
  width: calc(var(--preview-slot-1-width) / var(--canvas-width) * 100%);
  height: calc(var(--preview-slot-1-height) / var(--canvas-height) * 100%);
  transform: rotate(calc(var(--preview-slot-1-rotate) * 1deg));
}
```

- [ ] **Step 5: Add consistent placeholder and loading-state styles**

```css
.preview-photo-slot[data-empty="true"]::before {
  content: "等待图片";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(20, 58, 131, 0.8);
  background: linear-gradient(180deg, rgba(255, 244, 214, 0.6), rgba(255, 255, 255, 0.95));
  font-weight: 700;
}

.preview-photo-slot[data-loading="true"] {
  filter: saturate(0.88);
}
```

- [ ] **Step 6: Run the tests and verify the CSS structure assertions pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new CSS token and slot-variable tests.

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js styles.css app.test.js
git commit -m "refactor: standardize poster css tokens and slot variables"
```

## Task 3: Lock image loading behavior and preview slot state with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a slot stub that records state attributes**

```js
const createPreviewSlot = () => {
  const imageNode = {
    src: "",
    loading: "",
    removeAttribute(name) {
      if (name === "src") {
        this.src = "";
      }
    },
  };
  return {
    hidden: true,
    dataset: {},
    querySelector() {
      return imageNode;
    },
    _imageNode: imageNode,
  };
};
```

- [ ] **Step 2: Add a failing test for empty-slot placeholder state**

```js
test("renderPreview marks all preview slots as empty when no images are uploaded", () => {
  const primary = createPreviewSlot();
  const secondaryA = createPreviewSlot();
  const secondaryB = createPreviewSlot();

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
      previewPrimaryImage: primary,
      previewSecondaryImageA: secondaryA,
      previewSecondaryImageB: secondaryB,
      previewBoard: { dataset: {} },
      previewImageCount: { textContent: "", hidden: false },
    },
    { manualRecord: { ...sampleRecord, images: [] } },
    localBackgroundConfig
  );

  assert.equal(primary.dataset.empty, "true");
  assert.equal(secondaryA.dataset.empty, "true");
  assert.equal(secondaryB.dataset.empty, "true");
});
```

- [ ] **Step 3: Add a failing test for non-critical result thumbnails using lazy loading**

```js
test("renderResults marks generated result thumbnails as lazy-loaded", () => {
  const items = [];
  const resultsList = {
    innerHTML: "",
    appendChild(node) {
      items.push(node);
    },
  };

  global.document = {
    createElement(tag) {
      return {
        tagName: tag,
        className: "",
        textContent: "",
        appendChild(child) {
          (this.children ||= []).push(child);
        },
        set src(value) {
          this._src = value;
        },
      };
    },
  };

  renderResults(
    { resultsList },
    {
      generatedResults: [
        { studentId: "stu-001", fileName: "stu-001-poster.svg", imageUrl: "blob://preview", content: "<svg />" },
      ],
    }
  );

  const previewImage = items[0].children.find((child) => child.tagName === "img");
  assert.equal(previewImage.loading, "lazy");
});
```

- [ ] **Step 4: Run the tests and verify the new loading-state tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `renderPreview()` and `renderResults()` do not yet assign the new dataset and lazy-loading states.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock preview image state behavior"
```

## Task 4: Implement image loading, placeholder, and result-thumbnail rules

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a helper in `app.js` to control preview slot state**

```js
function setPreviewSlotState(slot, image) {
  if (!slot) {
    return;
  }
  const img = slot.querySelector("img");
  slot.hidden = !image;
  slot.dataset.empty = image ? "false" : "true";
  slot.dataset.loading = "false";

  if (!img) {
    return;
  }

  if (!image) {
    img.removeAttribute("src");
    return;
  }

  img.loading = "eager";
  img.decoding = "async";
  img.src = image.previewUrl;
}
```

- [ ] **Step 2: Update `renderPreview()` to use `setPreviewSlotState()` for all slots**

```js
slots.forEach((slot) => setPreviewSlotState(slot, null));
cleanedRecord.images.slice(0, 3).forEach((image, index) => {
  setPreviewSlotState(slots[index], image);
});
```

- [ ] **Step 3: Mark result thumbnails as lazy-loaded in `renderResults()`**

```js
if (result.imageUrl || result.svgUrl) {
  const preview = document.createElement("img");
  preview.loading = "lazy";
  preview.decoding = "async";
  preview.src = result.imageUrl || result.svgUrl;
  preview.alt = `${title.textContent} 预览`;
  item.appendChild(preview);
}
```

- [ ] **Step 4: Add a stable placeholder hook to the preview figures if needed**

```html
<figure id="preview-primary-image" class="preview-photo-slot slot-primary" data-empty="true" data-loading="false" hidden>
  <img alt="主图位预览" />
</figure>
```

- [ ] **Step 5: Run the tests and verify the image-state assertions pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for empty-slot state and lazy-loaded result thumbnail behavior.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js index.html styles.css app.test.js
git commit -m "feat: unify preview image state and result thumbnail loading"
```

## Task 5: Add browser visual regression script for preview and export scenarios

**Files:**
- Create: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
- Test: manual script execution

- [ ] **Step 1: Create a browser script that captures named scenarios**

```js
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.resolve(process.cwd(), ".visual-regression");
fs.mkdirSync(outputDir, { recursive: true });

const scenarios = [
  { name: "empty-desktop", viewport: { width: 1440, height: 1600 } },
  { name: "certificate-only-desktop", viewport: { width: 1440, height: 1600 } },
  { name: "offer-only-desktop", viewport: { width: 1440, height: 1600 } },
  { name: "mixed-mobile", viewport: { width: 430, height: 1400 } },
];
```

- [ ] **Step 2: Add script logic that loads the local page, seeds the scenario, and captures preview screenshots**

```js
for (const scenario of scenarios) {
  const page = await browser.newPage({ viewport: scenario.viewport });
  await page.goto(serverUrl, { waitUntil: "networkidle" });
  await page.evaluate((currentScenario) => {
    window.__POSTER_TEST_SCENARIO__ = currentScenario.name;
  }, scenario);
  await page.screenshot({
    path: path.join(outputDir, `${scenario.name}.png`),
    fullPage: true,
  });
  await page.close();
}
```

- [ ] **Step 3: Add a narrow test hook in `index.html` or `app.js` so the script can populate deterministic fixture data**

```js
if (typeof window !== "undefined") {
  globalScope.__POSTER_TEST_FIXTURES__ = {
    empty: { /* ... */ },
    certificateOnly: { /* ... */ },
    offerOnly: { /* ... */ },
    mixed: { /* ... */ },
  };
}
```

- [ ] **Step 4: Run the browser script manually and verify screenshots are generated**

Run:

```bash
node scripts/visual-regression.js
```

Expected: a `.visual-regression/` directory containing named screenshots for desktop and mobile scenarios.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add scripts/visual-regression.js index.html app.js
git commit -m "test: add preview and export visual regression script"
```

## Task 6: Produce phase-two manual acceptance documents

**Files:**
- Create: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- Create: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-issue-closure-template.md`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add failing tests that require the manual acceptance documents to exist**

```js
test("phase-two manual acceptance matrix is documented", () => {
  const source = fs.readFileSync(
    "./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md",
    "utf8"
  );

  assert.match(source, /Chrome/);
  assert.match(source, /Safari/);
  assert.match(source, /弱网/);
  assert.match(source, /暗黑模式/);
});

test("issue closure template includes severity and status fields", () => {
  const source = fs.readFileSync(
    "./docs/qa/2026-06-07-poster-issue-closure-template.md",
    "utf8"
  );

  assert.match(source, /问题级别/);
  assert.match(source, /修复状态/);
  assert.match(source, /复验结果/);
});
```

- [ ] **Step 2: Run the tests and verify the document existence checks fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the `docs/qa/` documents do not exist yet.

- [ ] **Step 3: Create the manual acceptance matrix**

```md
# 海报工具第二期人工验收矩阵

| 维度 | 场景 | 检查点 | 预期结果 | 实际结果 | 问题级别 | 修复状态 |
| --- | --- | --- | --- | --- | --- | --- |
| Chrome | 1920 桌面 | 上传 3 图后预览与导出一致 | 图片与标题框无偏移 |  |  |  |
| Safari | iPhone 宽度 | 导出 PNG 背景正常 | 无灰底、无裁剪异常 |  |  |  |
| 弱网 | 桌面 | 首屏背景与主图稳定显示 | 无闪烁、无塌陷 |  |  |  |
| 暗黑模式 | 桌面 | 工具页文本与按钮可读 | 无对比度问题 |  |  |  |
```

- [ ] **Step 4: Create the issue closure template**

```md
# 海报工具问题闭环模板

- 问题编号：
- 发现日期：
- 场景名称：
- 设备 / 浏览器：
- 问题级别：
- 复现步骤：
- 预期结果：
- 实际结果：
- 影响范围：
- 修复状态：
- 修复提交：
- 复验结果：
```

- [ ] **Step 5: Run the tests and verify the document checks pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new documentation assertions.

- [ ] **Step 6: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-issue-closure-template.md app.test.js
git commit -m "docs: add phase two manual acceptance package"
```

## Task 7: Final verification and cleanup

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js` (only if final assertions need tightening)
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`

- [ ] **Step 1: Run the full unit test suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with all regression, CSS, image-state, export, and documentation checks green.

- [ ] **Step 2: Run the visual regression script**

Run:

```bash
node scripts/visual-regression.js
```

Expected: screenshot assets generated for all named scenarios with no script crash.

- [ ] **Step 3: Check edited files for diagnostics**

Run editor diagnostics on:

- `styles.css`
- `app.js`
- `index.html`
- `app.test.js`
- `scripts/visual-regression.js`

Expected: no blocking diagnostics.

- [ ] **Step 4: Remove only truly temporary files if any were created during implementation**

```bash
rm -f .tmp-*.js
```

Expected: no permanent regression script or acceptance document is deleted.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add styles.css app.js index.html template-config.example.js app.test.js scripts/visual-regression.js docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-issue-closure-template.md
git commit -m "feat: finish poster polish and phase validation"
```

## Self-Review

- Spec coverage:
  - CSS 收敛由 Task 1-2 覆盖
  - 图片布局与加载优化由 Task 2-4 覆盖
  - 视觉回归由 Task 5 覆盖
  - 第二期人工终验包由 Task 6 覆盖
  - 最终验证与清理由 Task 7 覆盖
- Placeholder scan:
  - 已避免 `TODO`、`TBD`、`implement later` 等占位语句
  - 每个任务都包含明确文件、代码、命令与预期结果
- Type consistency:
  - 计划中统一使用 `renderPreview()`、`renderResults()`、`resolvePosterImageLayout()`、`getPreviewImageCssVariables()` 这些明确命名
  - 第二阶段文档路径与测试断言路径一致，未出现前后不一致的文件名
