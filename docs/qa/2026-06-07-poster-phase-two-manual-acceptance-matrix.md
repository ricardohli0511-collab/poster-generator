# 海报工具第二期人工验收矩阵

## 目标

用于在第一期自动化回归之外，补齐近似四浏览器、四类常用分辨率和 `真实Offer` 模块专项的人工终验记录。

## 执行说明

- 每完成一个场景，填写“实际结果”“截图路径”“Issue 编号”“问题级别”“修复状态”。
- 若发现问题，同步在问题闭环模板中创建 `ISSUE-A`、`ISSUE-B` 或 `ISSUE-C` 记录。
- 若某环境通过，也必须填写截图路径与“已验证”状态。
- 本文中的 `WebKit（Safari 近似）` 与 `Chromium（Edge 近似）` 为当前环境可执行的近似基准，不代表真实原生浏览器结论。

## 验收矩阵

| 浏览器 | 分辨率 | 场景 | 检查点 | 预期结果 | 实际结果 | 截图路径 | Issue 编号 | 问题级别 | 修复状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chrome | 1920×1080 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 | 通过；标签与下方图片区无重叠，预览与导出一致 | `.visual-regression/current/chrome-desktop-1920x1080-offer-only-preview.png`；`.visual-regression/current/chrome-desktop-1920x1080-offer-only-result.png` |  |  | 已验证 |
| Chrome | 1366×768 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 | 通过；笔记本断点下 `真实Offer` 模块布局稳定，无压住图片区或文字框 | `.visual-regression/current/chrome-laptop-1366x768-offer-only-preview.png`；`.visual-regression/current/chrome-laptop-1366x768-offer-only-result.png` |  |  | 已验证 |
| Chrome | 375×667 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 | 未通过；预览可打开，但点击 `生成单张海报` 时被 `typed-image-groups` 和 `review-box` 子树拦截，结果图未生成 | 无独立截图，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` 的点击日志 | ISSUE-E | 高 | 待修复 |
| Chrome | 768×1024 | 仅 Offer | `真实Offer` 标签与下方图片区 | 标签不重叠、图片无遮挡 | 通过；平板断点下 `真实Offer` 标签与图片、文字框保持安全间距 | `.visual-regression/current/chrome-tablet-768x1024-offer-only-preview.png`；`.visual-regression/current/chrome-tablet-768x1024-offer-only-result.png` |  |  | 已验证 |
| Chrome | 1920×1080 | 顶部区专项 | 顶部区无重叠 | logo、协会名、中文 slogan、英文 slogan 安全分离 | 通过；顶部区安全区已统一，导出图中未复现 logo 与 slogan 重叠 | `.visual-regression/current/header-safe-zone-preview.png`；`.visual-regression/current/header-safe-zone-result.png` |  |  | 已验证 |
| Firefox | 1920×1080 | 混合上传 | 预览与正式结果一致性 | 预览和结果图布局一致 | 未执行成功；`page.goto` 返回 `NS_ERROR_NET_ERROR_RESPONSE`，本地页面未加载 | 无截图，自动化在页面加载前中断，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` | ISSUE-D | 中 | 环境阻塞 |
| Firefox | 1366×768 | 4 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 未执行成功；`page.goto` 返回 `NS_ERROR_NET_ERROR_RESPONSE`，未进入 4 图布局验证 | 无截图，自动化在页面加载前中断，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` | ISSUE-D | 中 | 环境阻塞 |
| Firefox | 375×667 | 仅 Offer | 预览布局稳定性 | 标签、图片、文字框无错位 | 未执行成功；`page.goto` 返回 `NS_ERROR_NET_ERROR_RESPONSE`，未进入移动断点验证 | 无截图，自动化在页面加载前中断，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` | ISSUE-D | 中 | 环境阻塞 |
| Firefox | 768×1024 | 5 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 未执行成功；`page.goto` 返回 `NS_ERROR_NET_ERROR_RESPONSE`，未进入 5 图布局验证 | 无截图，自动化在页面加载前中断，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` | ISSUE-D | 中 | 环境阻塞 |
| WebKit（Safari 近似） | 1920×1080 | 混合上传 | 生成结果一致性 | 生成图与预览一致 | 通过；混合上传场景下预览与结果图一致，`真实Offer` 模块未发生重叠 | `.visual-regression/current/webkit-desktop-1920x1080-mixed-preview.png`；`.visual-regression/current/webkit-desktop-1920x1080-mixed-result.png` |  |  | 已验证 |
| WebKit（Safari 近似） | 1366×768 | 4 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 通过；4 图布局安全距离正常，`真实Offer` 标签未压住下方内容 | `.visual-regression/current/webkit-laptop-1366x768-four-images-preview.png`；`.visual-regression/current/webkit-laptop-1366x768-four-images-result.png` |  |  | 已验证 |
| WebKit（Safari 近似） | 375×667 | 仅 Offer | 预览布局稳定性 | 标签、图片、文字框无错位 | 通过；移动断点下预览与生成链路均可用，`真实Offer` 模块排版稳定 | `.visual-regression/current/webkit-mobile-375x667-offer-only-preview.png`；`.visual-regression/current/webkit-mobile-375x667-offer-only-result.png` |  |  | 已验证 |
| WebKit（Safari 近似） | 768×1024 | 5 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 通过；5 图布局下 `真实Offer` 标签与下方图片区、文字框保持安全间距 | `.visual-regression/current/webkit-tablet-768x1024-five-images-preview.png`；`.visual-regression/current/webkit-tablet-768x1024-five-images-result.png` |  |  | 已验证 |
| Chromium（Edge 近似） | 1920×1080 | 混合上传 | 生成结果一致性 | 生成图与预览一致 | 通过；混合上传场景下生成结果与预览一致，未见 `真实Offer` 模块异常 | `.visual-regression/current/chromium-desktop-1920x1080-mixed-preview.png`；`.visual-regression/current/chromium-desktop-1920x1080-mixed-result.png` |  |  | 已验证 |
| Chromium（Edge 近似） | 1366×768 | 4 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 通过；4 图场景下右侧图片区与 `真实Offer` 标签安全距离正常 | `.visual-regression/current/chromium-laptop-1366x768-four-images-preview.png`；`.visual-regression/current/chromium-laptop-1366x768-four-images-result.png` |  |  | 已验证 |
| Chromium（Edge 近似） | 375×667 | 仅 Offer | 预览布局稳定性 | 标签、图片、文字框无错位 | 未通过；点击 `生成单张海报` 时同样被 `typed-image-groups` 和 `review-box` 子树拦截，未生成结果图 | 无独立截图，见 `.visual-regression/current/phase-two-offer-matrix-manifest.json` 的点击日志 | ISSUE-E | 高 | 待修复 |
| Chromium（Edge 近似） | 768×1024 | 5 图 | `真实Offer` 模块安全距离 | 标签不压住图片或文字框 | 通过；5 图场景下 `真实Offer` 模块排版稳定，无图片或文字框遮挡 | `.visual-regression/current/chromium-tablet-768x1024-five-images-preview.png`；`.visual-regression/current/chromium-tablet-768x1024-five-images-result.png` |  |  | 已验证 |

## 问题归并

- `ISSUE-A`：`真实Offer` 标签与下方图片 / 文字框重叠
- `ISSUE-B`：`真实Offer` 模块在预览中的布局错乱
- `ISSUE-C`：`4-image` / `5-image` 右侧图片区安全距离不足
- `ISSUE-D`：Firefox 自动化访问本地页面时出现 `NS_ERROR_NET_ERROR_RESPONSE`
- `ISSUE-E`：`375×667` 断点下生成按钮被 `typed-image-groups` / `review-box` 拦截点击

## 后续扩展项

- 弱网：在当前子项目 A 之外保留为第二期完整人工终验项，需在真实网络限速条件下补录。
- 暗黑模式：在当前子项目 A 之外保留为第二期完整人工终验项，需在系统暗黑模式下补录。
