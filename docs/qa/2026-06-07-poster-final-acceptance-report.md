# 海报工具收尾与第二期验收报告

## 验收时间

- 日期：2026-06-07

## 本轮验收范围

- CSS 收敛后的关键样式回归
- 预览图片槽位变量与空态 / 加载态逻辑
- 结果区缩略图懒加载行为
- 正式 SVG 导出背景内嵌与 PNG 前置链路
- 视觉回归脚本执行与桌面 / 移动关键场景截图产出
- 第二期人工终验矩阵执行、问题闭环回填与结果归档

## 自动化结果

### 1. 单元测试

- 命令：`node --test app.test.js`
- 结果：`70 / 70` 通过
- 结论：当前测试集已覆盖导出、预览、标签显隐、样式令牌、图片空态、懒加载、视觉回归脚本存在性与 QA 文档断言，文档回填后仍保持全绿

### 2. 第一阶段视觉回归脚本

- 命令：`node scripts/visual-regression.js`
- 服务地址：`http://127.0.0.1:4173/index.html`
- 结果：成功生成 7 个场景的截图产物与 manifest

已生成场景：

- `empty-desktop`
- `certificate-only-desktop`
- `offer-only-desktop`
- `mixed-mobile`
- `four-images-desktop`
- `five-images-desktop`
- `header-safe-zone`

截图目录：

- `.visual-regression/current/`

清单文件：

- `.visual-regression/current/manifest.json`

## 产物清单

- 预览截图：
  - `empty-desktop-preview.png`
  - `certificate-only-desktop-preview.png`
  - `offer-only-desktop-preview.png`
  - `mixed-mobile-preview.png`
  - `four-images-desktop-preview.png`
  - `five-images-desktop-preview.png`
  - `header-safe-zone-preview.png`
- 结果截图：
  - `certificate-only-desktop-result.png`
  - `offer-only-desktop-result.png`
  - `mixed-mobile-result.png`
  - `four-images-desktop-result.png`
  - `five-images-desktop-result.png`
  - `header-safe-zone-result.png`

### 3. 第二期人工验收矩阵

- 命令：`node .tmp-phase-two-offer-matrix.js`
- 服务地址：`http://127.0.0.1:4173/index.html`
- 结果文件：`.visual-regression/current/phase-two-offer-matrix-manifest.json`
- 覆盖范围：Chrome、Firefox、WebKit（Safari 近似）、Chromium（Edge 近似）四浏览器近似基准，覆盖 `1920×1080`、`1366×768`、`375×667`、`768×1024`
- 汇总结论：16 组组合中 10 组通过、6 组未通过；另有顶部区专项 `header-safe-zone` 已通过

通过项：

- Chrome：`1920×1080`、`1366×768`、`768×1024` 的 `仅 Offer` 场景通过
- WebKit（Safari 近似）：`1920×1080 mixed`、`1366×768 four-images`、`375×667 offer-only`、`768×1024 five-images` 全部通过
- Chromium（Edge 近似）：`1920×1080 mixed`、`1366×768 four-images`、`768×1024 five-images` 通过
- 顶部区专项：`header-safe-zone` 预览与导出均未复现 logo / slogan 重叠

未通过项：

- Firefox：4 组全部在 `page.goto` 阶段被 `NS_ERROR_NET_ERROR_RESPONSE` 阻塞，归类为环境兼容问题，记录为 `ISSUE-D`
- Chrome `375×667`：点击 `生成单张海报` 时被页面内容区拦截，记录为 `ISSUE-E`
- Chromium `375×667`：点击 `生成单张海报` 时被页面内容区拦截，记录为 `ISSUE-E`

## 问题记录

### 已处理问题

- `npm init -y` 因目录名包含中文导致默认包名非法
  - 处理方式：改为手动创建最小 `package.json`，名称固定为 ASCII
  - 当前状态：已解决

- `ISSUE-A`：`真实Offer` 标签与下方图片 / 文字框重叠
  - 处理方式：收紧 `4-image` / `5-image` 与移动断点下的 `offer-chip` 安全区，并同步调整下方图片槽位
  - 当前状态：已修复，近似矩阵通过

- `ISSUE-B`：`真实Offer` 模块预览布局错乱
  - 处理方式：重写 `@media (max-width: 860px)` 下的 `preview-board`、`slot-*` 与 `offer-chip` 定位，并为操作区增加 sticky 安全层
  - 当前状态：主体已修复，剩余移动端点击拦截拆分为 `ISSUE-E`

- `ISSUE-C`：`4-image` / `5-image` 右侧图片区安全距离不足
  - 处理方式：为扩展布局设置专用 `offer-chip` 顶部与横向偏移
  - 当前状态：已修复，WebKit / Chromium 的 4 图和 5 图场景通过

### 本轮未闭环问题

- `ISSUE-D`：Firefox 自动化访问本地页面返回 `NS_ERROR_NET_ERROR_RESPONSE`
  - 当前判断：环境阻塞，尚未证明为产品布局缺陷
- `ISSUE-E`：`375×667` 断点下生成按钮被 `typed-image-groups` / `review-box` 拦截点击
  - 当前判断：真实产品问题，需继续收敛移动端表单与操作区层级 / 滚动关系

## 结论

- 第一阶段自动化验证链路已可重复执行，顶部区共享几何安全区和 `1-5` 张图片布局保持稳定
- 第二期子项目 A 的 `真实Offer` 模块主问题已收敛，`ISSUE-A`、`ISSUE-B`、`ISSUE-C` 在当前可执行近似矩阵中已验证通过
- 当前仍有 2 类未闭环项：Firefox 自动化环境阻塞 `ISSUE-D`，以及 Chrome / Chromium `375×667` 移动端点击拦截 `ISSUE-E`
- 弱网、暗黑模式和真实原生 Safari / Edge 仍需在后续人工终验中补录

## 第二期子项目 B 结果

- 顶部区共享几何安全区已补入配置，并同步暴露到预览 CSS 变量
- 图片总数限制已从 `1-3` 扩容到 `1-5`
- `4-image` / `5-image` 已具备正式布局配置与预览槽位
- 批量 CSV 已扩展支持 `image1~image5`
- 视觉回归脚本已补入 `four-images-desktop`、`five-images-desktop`、`header-safe-zone` 场景

## 第二期子项目 A 问题跟踪

- `ISSUE-A`：`真实Offer` 标签与下方图片 / 文字框重叠
  - 当前状态：已修复并通过近似回归
- `ISSUE-B`：`真实Offer` 模块在预览中的布局错乱
  - 当前状态：主体已修复，剩余移动端点击拦截已拆分为 `ISSUE-E`
- `ISSUE-C`：`4-image` / `5-image` 右侧图片区安全距离不足
  - 当前状态：已修复并通过近似回归
- `ISSUE-D`：Firefox 自动化访问本地页面失败
  - 当前状态：环境阻塞，待更换调试链路后复测
- `ISSUE-E`：`375×667` 断点下生成按钮被内容区拦截
  - 当前状态：待修复

## 后续动作

- 优先修复 `ISSUE-E`，重新执行 Chrome / Chromium `375×667` 专项回归
- 将 Firefox 自动化阻塞独立排查，确认是否需要替换本地服务或浏览器调试链路
- 按 `docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md` 继续补录弱网、暗黑模式与真实原生浏览器结果
