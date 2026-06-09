# 海报工具问题闭环记录

## ISSUE-A

- 问题编号：`ISSUE-A`
- 发现日期：2026-06-07
- 场景名称：`真实Offer` 标签与下方图片 / 文字框重叠
- 设备 / 浏览器：Chrome、WebKit（Safari 近似）、Chromium（Edge 近似）桌面 / 平板断点
- 网络条件：本地常规网络
- 主题模式：浅色模式
- 问题级别：高
- 复现步骤：上传仅 Offer 或混合素材，切换到 `4-image`、`5-image` 或平板断点，观察 `真实Offer` 标签与下方图片区、文字框的垂直间距
- 预期结果：`真实Offer` 标签不压住图片或文字框，预览和导出结果保持一致
- 实际结果：修复前在部分断点和布局下出现压住下方内容的问题；修复后在当前可执行浏览器近似基准中未再复现
- 影响范围：`真实Offer` 模块视觉完整性、导出结果可信度
- 根因分析：`4-image` / `5-image` 场景及窄断点下的 `offer-chip` 偏移量不足，导致安全区不够
- 修复方案：在 `styles.css` 中针对 `4-image`、`5-image` 和移动断点收紧 `offer-chip` 顶部偏移，并同步调整下方图片槽位安全距离
- 修复状态：已修复并通过近似回归
- 对应文件：`styles.css`、`docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- 测试方式：`node --test app.test.js`；Playwright 近似矩阵截图回归；人工核对 `.visual-regression/current/` 产物
- 修复提交：当前会话内修改，尚未单独提交
- 复验结果：Chrome `1920×1080`、`1366×768`、`768×1024`，WebKit `1920×1080`、`1366×768`、`375×667`、`768×1024`，Chromium `1920×1080`、`1366×768`、`768×1024` 均通过
- 备注：`375×667` 的剩余失败为按钮点击拦截，已另列 `ISSUE-E`

## ISSUE-B

- 问题编号：`ISSUE-B`
- 发现日期：2026-06-07
- 场景名称：`真实Offer` 模块预览布局错乱
- 设备 / 浏览器：移动端与平板端近似断点，Chrome / WebKit / Chromium
- 网络条件：本地常规网络
- 主题模式：浅色模式
- 问题级别：高
- 复现步骤：上传 Offer 素材并切换到移动或平板宽度，观察 `preview-board`、`slot-*` 和 `offer-chip` 的相对位置
- 预期结果：预览中的 `真实Offer` 模块排版稳定，图片与标签不侵入标题区和文字框区域
- 实际结果：修复前 `375×667` 等窄断点存在布局错乱；修复后 WebKit 移动断点通过，Chrome / Chromium 的剩余问题已收敛为按钮点击拦截
- 影响范围：移动端预览可靠性、跨端一致性
- 根因分析：`@media (max-width: 860px)` 下的 `preview-board` 与次级槽位百分比布局不稳定，导致图片区侵入或下移异常
- 修复方案：重写移动 / 平板下的 `preview-board`、`slot-primary`、`slot-secondary-*` 与 `offer-chip` 定位规则，并为操作区增加 sticky 安全层
- 修复状态：主体已修复，剩余 `ISSUE-E`
- 对应文件：`styles.css`、`docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md`
- 测试方式：`node --test app.test.js`；`.tmp-phase-two-offer-matrix.js` 近似执行；人工查看移动端截图
- 修复提交：当前会话内修改，尚未单独提交
- 复验结果：WebKit `375×667` 已通过；Chrome / Chromium `375×667` 页面可打开但生成动作仍被内容区拦截
- 备注：预览排版错乱与按钮点击拦截已拆分处理，避免混淆为同一类缺陷

## ISSUE-C

- 问题编号：`ISSUE-C`
- 发现日期：2026-06-07
- 场景名称：`4-image` / `5-image` 右侧图片区安全距离不足
- 设备 / 浏览器：WebKit（Safari 近似）、Chromium（Edge 近似）桌面 / 平板断点
- 网络条件：本地常规网络
- 主题模式：浅色模式
- 问题级别：中
- 复现步骤：分别上传 4 张与 5 张图片，检查 `offer-chip` 与下方次级图片槽位、文字框的间距
- 预期结果：标签与次级槽位之间有稳定安全间距，不产生遮挡
- 实际结果：修复前安全距离偏紧；修复后在当前近似矩阵中未再复现
- 影响范围：4 图 / 5 图视觉密度与导出稳定性
- 根因分析：正式支持 `4-image` / `5-image` 后，`offer-chip` 默认位置未针对扩展布局单独收口
- 修复方案：在 `styles.css` 中为 `4-image` 和 `5-image` 场景设置单独的 `offer-chip` 顶部与横向偏移
- 修复状态：已修复并验证
- 对应文件：`styles.css`、`app.test.js`
- 测试方式：`node --test app.test.js`；WebKit / Chromium 的 `1366×768`、`768×1024` 回归截图
- 修复提交：当前会话内修改，尚未单独提交
- 复验结果：WebKit `1366×768`、`768×1024` 与 Chromium `1366×768`、`768×1024` 均通过
- 备注：已被纳入第二期人工验收矩阵长期保留

## ISSUE-D

- 问题编号：`ISSUE-D`
- 发现日期：2026-06-07
- 场景名称：Firefox 自动化访问本地页面阻塞
- 设备 / 浏览器：Firefox 近似基准，`1920×1080`、`1366×768`、`375×667`、`768×1024`
- 网络条件：本地常规网络
- 主题模式：浅色模式
- 问题级别：中
- 复现步骤：运行 `.tmp-phase-two-offer-matrix.js` 或同等 Playwright 矩阵，对 `http://127.0.0.1:4173/index.html` 执行 `page.goto(..., { waitUntil: "load" })`
- 预期结果：Firefox 正常打开本地预览页并执行后续验证
- 实际结果：全部 Firefox 组合在页面加载阶段返回 `NS_ERROR_NET_ERROR_RESPONSE`
- 影响范围：Firefox 自动化证据采集与近似回归覆盖
- 根因分析：当前更像 Playwright Firefox 内核与本地 `http.server` 组合下的环境兼容阻塞，而非 `真实Offer` 模块本身的布局缺陷
- 修复方案：暂按环境阻塞记录；后续可改为独立本地服务器、调整 `waitUntil` 策略或更换 Firefox 调试链路复测
- 修复状态：未修复，环境阻塞
- 对应文件：`.tmp-phase-two-offer-matrix.js`、`.visual-regression/current/phase-two-offer-matrix-manifest.json`
- 测试方式：Playwright 近似矩阵执行日志
- 修复提交：无
- 复验结果：本轮 4 个 Firefox 组合均未进入页面
- 备注：该项不应误记为 `真实Offer` 模块布局问题

## ISSUE-E

- 问题编号：`ISSUE-E`
- 发现日期：2026-06-07
- 场景名称：`375×667` 断点下生成按钮被内容区拦截点击
- 设备 / 浏览器：Chrome、Chromium（Edge 近似）移动断点
- 网络条件：本地常规网络
- 主题模式：浅色模式
- 问题级别：高
- 复现步骤：在 `375×667` 断点下上传 Offer 素材后点击 `#generate-button`
- 预期结果：按钮可正常点击并生成结果图
- 实际结果：点击时被 `typed-image-groups` 与 `review-box` 子树拦截，结果图未生成
- 影响范围：移动端生成链路不可用，导致本轮 Chrome / Chromium `375×667` 验收未通过
- 根因分析：窄断点下表单内容区与 sticky 操作区的堆叠顺序和滚动区域仍有冲突，按钮虽可见但未处于最上层可点击区域
- 修复方案：后续继续收敛移动端表单流式布局、滚动容器与 `action-row` 层级关系，必要时减少上层内容的指针事件覆盖范围
- 修复状态：待修复
- 对应文件：`styles.css`、`index.html`、`.visual-regression/current/phase-two-offer-matrix-manifest.json`
- 测试方式：Playwright 近似矩阵执行日志；移动断点人工复验
- 修复提交：无
- 复验结果：Chrome `375×667` 与 Chromium `375×667` 仍失败；WebKit `375×667` 已通过
- 备注：这是当前子项目 A 唯一确认的产品侧未闭环问题
