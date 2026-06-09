# Poster Phase Two Manual Acceptance And Offer Module Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the phase-two manual acceptance matrix across the current browser/resolution baseline, fix the `真实Offer` module overlap and preview-layout bugs, and close the loop with evidence, issue tracking, and regression verification.

**Architecture:** Keep the current static `index.html + styles.css + app.js + template-config.example.js` architecture and layer the work in four passes: lock missing acceptance and offer-module expectations with failing tests, expand the browser screenshot runner so it can capture the requested matrix, repair only the `真实Offer` module and directly related right-side image-slot rules, then rerun targeted regression and write the results back into the QA records. Evidence capture stays in the existing `.visual-regression/current` flow, while human-readable execution results stay in the QA markdown files.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, SVG generation, Node `node:test`, Playwright browser automation, Markdown QA docs

---

## Repository Note

- 当前目录可能不是 git 仓库。
- 每个任务保留 git 检查与提交步骤；如果 `git rev-parse --is-inside-work-tree` 返回 `fatal: not a git repository`，记录结果并跳过 commit。

## File Map

- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
  - 锁定人工验收矩阵扩容、浏览器/分辨率执行、真实Offer 模块修复和回归闭环的红绿测试
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
  - 扩展多浏览器、多分辨率、修前/修后证据截图采集
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
  - 定向修复 `真实Offer` 标签与下方图片/文字框的重叠和断点错位
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
  - 在必要范围内调整 `offer-chip` 相关预览布局变量和场景驱动逻辑
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
  - 仅在需要额外标识、钩子或结构时做最小变更
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
  - 把空模板转成真实执行记录
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-issue-closure-template.md`
  - 记录 `ISSUE-A / ISSUE-B / ISSUE-C` 的闭环信息
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-final-acceptance-report.md`
  - 写入子项目 A 的执行结果、问题和复验结论

## Task 1: Lock the manual acceptance execution matrix with failing document tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a failing test that the manual matrix includes the requested browser/resolution rows**

```js
test("phase-two manual acceptance matrix covers four browsers and four target resolutions", () => {
  const source = fs.readFileSync(
    "./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md",
    "utf8"
  );

  assert.match(source, /Chrome/);
  assert.match(source, /Firefox/);
  assert.match(source, /WebKit（Safari 近似）/);
  assert.match(source, /Chromium（Edge 近似）/);
  assert.match(source, /1920[×x]1080/);
  assert.match(source, /1366[×x]768/);
  assert.match(source, /375[×x]667/);
  assert.match(source, /768[×x]1024/);
});
```

- [ ] **Step 2: Add a failing test that the matrix rows must include result and screenshot placeholders**

```js
test("phase-two manual acceptance matrix records result status, screenshots, and issue ids", () => {
  const source = fs.readFileSync(
    "./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md",
    "utf8"
  );

  assert.match(source, /实际结果/);
  assert.match(source, /截图路径/);
  assert.match(source, /Issue 编号/);
});
```

- [ ] **Step 3: Run the tests and verify the new matrix tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the current matrix still uses the earlier partial template and does not yet list the requested near-Safari / near-Edge labels or screenshot / issue columns.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock phase-two manual acceptance matrix coverage"
```

## Task 2: Implement the acceptance-matrix structure for real execution records

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Expand the matrix header to include result, screenshot, and issue tracking fields**

```md
| 浏览器 | 分辨率 | 场景 | 检查点 | 预期结果 | 实际结果 | 截图路径 | Issue 编号 | 问题级别 | 修复状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

- [ ] **Step 2: Add the requested browser/resolution baseline rows using the near-browser labels**

```md
| Chrome | 1920×1080 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 |  |  |  |  |  |
| Chrome | 1366×768 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 |  |  |  |  |  |
| Chrome | 375×667 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 |  |  |  |  |  |
| Chrome | 768×1024 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 |  |  |  |  |  |
| Firefox | 1920×1080 | 混合上传 | 预览与正式结果一致性 | 预览和结果图布局一致 |  |  |  |  |  |
| WebKit（Safari 近似） | 1366×768 | 4 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 |  |  |  |  |  |
| Chromium（Edge 近似） | 768×1024 | 5 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 |  |  |  |  |  |
```
```

- [ ] **Step 3: Run the tests and verify the matrix document tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new matrix-coverage tests.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md app.test.js
git commit -m "docs: expand phase-two manual acceptance matrix"
```

## Task 3: Lock the browser automation runner for four browsers and four resolutions

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a failing test that the screenshot runner defines the four browser baselines**

```js
test("visual regression script defines chrome firefox webkit and chromium browser baselines", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /chrome/i);
  assert.match(source, /firefox/i);
  assert.match(source, /webkit/i);
  assert.match(source, /chromium/i);
});
```

- [ ] **Step 2: Add a failing test that the runner includes the four target resolutions**

```js
test("visual regression script includes desktop laptop mobile and tablet resolutions", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /1920/);
  assert.match(source, /1366/);
  assert.match(source, /375/);
  assert.match(source, /768/);
});
```

- [ ] **Step 3: Run the tests and verify the new runner tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the current script only runs the earlier Chromium-only scenario list and does not yet define the full browser/resolution matrix.

- [ ] **Step 4: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock phase-two browser matrix runner"
```

## Task 4: Implement the browser/resolution screenshot runner and baseline evidence flow

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Define the browser launcher map**

```js
const browserLaunchers = {
  chrome: () => chromium.launch({ headless: true, channel: "chrome" }),
  firefox: () => firefox.launch({ headless: true }),
  webkit: () => webkit.launch({ headless: true }),
  chromium: () => chromium.launch({ headless: true }),
};
```

- [ ] **Step 2: Define the four target resolutions**

```js
const viewports = [
  { name: "desktop-1920x1080", width: 1920, height: 1080 },
  { name: "laptop-1366x768", width: 1366, height: 768 },
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
];
```

- [ ] **Step 3: Generate evidence file names that include browser, resolution, and scenario**

```js
const previewPath = path.join(
  currentDir,
  `${browserName}-${viewport.name}-${scenario.name}-preview.png`
);
const resultPath = path.join(
  currentDir,
  `${browserName}-${viewport.name}-${scenario.name}-result.png`
);
```

- [ ] **Step 4: Run the tests and verify the runner tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new browser-matrix script tests.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add scripts/visual-regression.js app.test.js
git commit -m "feat: add phase-two browser resolution evidence runner"
```

## Task 5: Lock the `真实Offer` overlap and preview-layout bug with failing tests

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add a failing test that the offer chip keeps a minimum safe distance above the lower image area in 4-image layout**

```js
test("styles.css keeps offer chip above the lower image band in four-image layout", () => {
  const source = fs.readFileSync("./styles.css", "utf8");

  assert.match(
    source,
    /\.preview-board\[data-layout="4-image"\]\s+\.offer-chip\s*\{[\s\S]*top:\s*calc\(\(var\(--offer-chip-y\)\s*-\s*\d+\)/,
  );
});
```

- [ ] **Step 2: Add a failing test that mobile/tablet rules must not stack the offer chip under overlapping content**

```js
test("styles.css defines dedicated mobile-safe positioning for offer chip and lower slots", () => {
  const source = fs.readFileSync("./styles.css", "utf8");

  assert.match(source, /@media \(max-width: 860px\)[\s\S]*\.offer-chip/);
});
```

- [ ] **Step 3: Add a failing test that the manual acceptance report must define ISSUE-A and ISSUE-B for the offer module**

```js
test("final acceptance report documents ISSUE-A and ISSUE-B for the offer module", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-final-acceptance-report.md", "utf8");

  assert.match(source, /ISSUE-A/);
  assert.match(source, /ISSUE-B/);
});
```

- [ ] **Step 4: Run the tests and verify the new offer-module tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the report does not yet track `ISSUE-A / ISSUE-B`, and the current CSS offer-chip rules do not yet encode the stricter safe-distance contract.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.test.js
git commit -m "test: lock offer module overlap regression"
```

## Task 6: Implement the `真实Offer` module fix in preview layout rules

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/index.html`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Tighten the four-image and five-image offer-chip safe area in `styles.css`**

```css
.preview-board[data-layout="4-image"] .offer-chip {
  top: calc((var(--offer-chip-y) - 18) / var(--canvas-height) * 100%);
  left: calc((var(--offer-chip-x) + 4) / var(--canvas-width) * 100%);
}

.preview-board[data-layout="5-image"] .offer-chip {
  top: calc((var(--offer-chip-y) - 24) / var(--canvas-height) * 100%);
  left: calc((var(--offer-chip-x) + 2) / var(--canvas-width) * 100%);
}
```

- [ ] **Step 2: Add mobile/tablet-specific safe positioning for the offer chip and lower slots**

```css
@media (max-width: 860px) {
  .offer-chip {
    top: auto;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
  }

  .preview-board[data-layout="4-image"] .slot-secondary-c,
  .preview-board[data-layout="5-image"] .slot-secondary-c,
  .preview-board[data-layout="5-image"] .slot-secondary-d {
    top: 520px;
  }
}
```

- [ ] **Step 3: If necessary, add a minimal hook in `app.js` or `index.html` so the offer module can be targeted without broader template changes**

```html
<div class="preview-board" data-module="offer-zone">
```

```js
if (elements.previewBoard) {
  elements.previewBoard.dataset.layout =
    cleanedRecord.images.length >= 1 ? `${cleanedRecord.images.length}-image` : "empty";
  elements.previewBoard.dataset.offerVisible = visibility.showOfferChip ? "true" : "false";
}
```

- [ ] **Step 4: Run the tests and verify the offer-module tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new offer-chip and issue-report tests, with all prior tests staying green.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add styles.css app.js index.html app.test.js
git commit -m "fix: stabilize offer module layout across breakpoints"
```

## Task 7: Execute the matrix, write issue records, and close the loop in QA docs

**Files:**
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-issue-closure-template.md`
- Modify: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-final-acceptance-report.md`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`

- [ ] **Step 1: Add failing tests that the final report records ISSUE-A, ISSUE-B, and regression outcomes**

```js
test("final acceptance report records issue ids and regression conclusions for subproject A", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-final-acceptance-report.md", "utf8");

  assert.match(source, /ISSUE-A/);
  assert.match(source, /ISSUE-B/);
  assert.match(source, /专项回归/);
});
```

- [ ] **Step 2: Run the tests and verify the QA-record tests fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because the QA docs have not yet been converted from templates into completed execution records.

- [ ] **Step 3: Execute the screenshot runner and write the matrix rows with real evidence**

Run:

```bash
python3 -m http.server 4173
```

In another terminal:

```bash
node scripts/visual-regression.js
```

Then record rows like:

```md
| Chrome | 1920×1080 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 | 通过 | `.visual-regression/current/chrome-desktop-1920x1080-offer-only-preview.png` |  |  | 已验证 |
| Firefox | 768×1024 | 5 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 未通过 | `.visual-regression/current/firefox-tablet-768x1024-five-images-desktop-preview.png` | ISSUE-A | P1 | 待修复 |
```

- [ ] **Step 4: Write issue records into the issue closure template**

```md
## ISSUE-A
- 问题：`真实Offer` 标签与下方图片 / 文字框重叠
- 级别：P1
- 影响范围：Firefox 768×1024、WebKit 375×667、Chromium 1366×768
- 修复状态：已修复 / 已复验

## ISSUE-B
- 问题：`真实Offer` 模块在预览中的布局错乱
- 级别：P2
- 影响范围：Chrome 375×667、WebKit 768×1024
- 修复状态：已修复 / 已复验
```

- [ ] **Step 5: Update the final acceptance report with subproject A execution and regression results**

```md
## 第二期子项目 A 结果

- 已执行四浏览器近似基准 × 四分辨率验收
- `真实Offer` 模块已修复 `ISSUE-A / ISSUE-B`
- 修后已完成专项回归，未发现新的同模块遮挡问题
```

- [ ] **Step 6: Run the tests and verify the QA-record tests pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new report and issue-record tests.

- [ ] **Step 7: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-issue-closure-template.md docs/qa/2026-06-07-poster-final-acceptance-report.md app.test.js
git commit -m "docs: record phase-two manual acceptance and offer module closure"
```

## Task 8: Final verification and cleanup

**Files:**
- Test: `/Users/haoyuli/Desktop/未命名文件夹/app.test.js`
- Test: `/Users/haoyuli/Desktop/未命名文件夹/scripts/visual-regression.js`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/styles.css`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/app.js`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- Check: `/Users/haoyuli/Desktop/未命名文件夹/docs/qa/2026-06-07-poster-final-acceptance-report.md`

- [ ] **Step 1: Run the full unit suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with the matrix, browser runner, offer-module, and QA closure tests all green.

- [ ] **Step 2: Run the screenshot runner after fixes**

Run:

```bash
node scripts/visual-regression.js
```

Expected: manifest and screenshot assets include the requested browser/resolution evidence set.

- [ ] **Step 3: Check diagnostics for all edited files**

Run editor diagnostics on:

- `app.js`
- `styles.css`
- `index.html`
- `scripts/visual-regression.js`
- `app.test.js`
- `docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- `docs/qa/2026-06-07-poster-final-acceptance-report.md`

Expected: no blocking diagnostics.

- [ ] **Step 4: Stop any preview server started during verification**

Expected: no lingering local server remains running.

- [ ] **Step 5: Check git availability and commit if possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If `true`, run:

```bash
git add app.js styles.css index.html scripts/visual-regression.js app.test.js docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md docs/qa/2026-06-07-poster-issue-closure-template.md docs/qa/2026-06-07-poster-final-acceptance-report.md
git commit -m "feat: close phase-two manual acceptance and offer module fixes"
```

## Self-Review

- Spec coverage:
  - 人工验收矩阵结构和真实记录由 Task 1-2、Task 7 覆盖
  - 四浏览器近似基准 × 四分辨率执行由 Task 3-4 覆盖
  - `真实Offer` 模块问题锁定与修复由 Task 5-6 覆盖
  - 问题闭环和最终验收结论由 Task 7 覆盖
  - 最终回归与清理由 Task 8 覆盖
- Placeholder scan:
  - 已避免 `TODO`、`TBD`、`implement later`、`Similar to Task` 等占位表述
  - 每个任务都包含明确的文件、命令、代码示例和预期结果
- Type consistency:
  - 统一使用 `visual-regression.js`、`ISSUE-A / ISSUE-B / ISSUE-C`、`offer-chip`、`preview-board`、`phase-two manual acceptance matrix`
  - 文档路径、脚本路径和测试断言前后一致
