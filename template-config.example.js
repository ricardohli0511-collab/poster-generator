window.POSTER_TOOL_CONFIG = {
  pageTitle: "香港湾区教育咨询促进会批量海报生成器",
  primaryActionLabel: "生成单张海报",
  rendererType: "built_in_poster_engine",
  fixedCopy: {
    organizationNameCn: "香港湾区教育咨询促进会",
    organizationNameEn: "HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION",
    sloganCn: "让梦想起航 连接未来",
    sloganEn: "Embark Your Dream, Connect to the Future",
    topBadge: "副学士升本科路径",
    imageLabel: "真实成绩单 / 证书",
    footerNote: "真实案例展示",
  },
  fieldLimits: {
    title: 24,
    subtitle: 24,
    highSchoolStage: 24,
    associateStage: 24,
    bachelorStage: 24,
  },
  assets: {
    // 正式固定背景恢复为旧协会背景图，不属于用户上传内容。
    backgroundImage:
      "./assets/bg.png",
    // 为兼容旧配置保留该字段，但当前固定背景中不再单独使用 logo 文件。
    logoImage: "",
  },
  posterSize: {
    width: 1080,
    height: 1920,
  },
  textBlocks: {
    title: { x: 540, y: 454 },
    subtitle: { x: 540, y: 546 },
    highSchoolStage: { x: 310, y: 874 },
    associateStage: { x: 310, y: 1080 },
    bachelorStage: { x: 310, y: 1286 },
  },
  layoutReference: {
    canvas: { width: 1080, height: 1920 },
    header: {
      logo: { x: 540, y: 86, width: 148, height: 102 },
      orgNameCn: { x: 540, y: 160, fontSize: 24, fontWeight: 700, letterSpacing: 1 },
      orgNameEn: { x: 540, y: 194, fontSize: 16, fontWeight: 500, letterSpacing: 1.2 },
      slogan: { x: 540, y: 262, fontSize: 64, fontWeight: 800, letterSpacing: 4 },
      sloganEn: { x: 540, y: 326, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
    },
    titleFrame: {
      x: 58,
      y: 364,
      width: 964,
      height: 148,
      innerX: 74,
      innerY: 378,
      innerWidth: 932,
      innerHeight: 120,
    },
    pathArea: {
      titleLineY: 672,
      pill: { x: 150, y: 722, width: 320, height: 64 },
      cards: {
        highSchool: { x: 36, y: 802, width: 530, height: 144 },
        associate: { x: 36, y: 1008, width: 530, height: 144 },
        bachelor: { x: 36, y: 1214, width: 530, height: 144 },
      },
    },
    imageArea: {
      certificateChip: { x: 742, y: 536, width: 250, height: 50 },
      offerChip: { x: 702, y: 1306, width: 164, height: 46 },
    },
    footer: { y: 1840, fontSize: 36, letterSpacing: 3 },
  },
  imageLayouts: {
    // 以下坐标用于内置固定海报引擎，会直接影响正式输出布局。
    "1-image": [
      { slot: "primary", x: 620, y: 580, width: 400, height: 580, rotate: -1.5 },
    ],
    "2-image": [
      { slot: "primary", x: 600, y: 560, width: 380, height: 540, rotate: -2 },
      { slot: "secondary-1", x: 680, y: 1120, width: 320, height: 460, rotate: 2.5 },
    ],
    "3-image": [
      { slot: "primary", x: 630, y: 540, width: 360, height: 500, rotate: -1.5 },
      { slot: "secondary-1", x: 550, y: 1060, width: 260, height: 380, rotate: -3 },
      { slot: "secondary-2", x: 760, y: 1180, width: 260, height: 380, rotate: 3 },
    ],
    "4-image": [
      { slot: "primary", x: 650, y: 520, width: 320, height: 460, rotate: -2 },
      { slot: "secondary-1", x: 540, y: 1000, width: 220, height: 320, rotate: -4 },
      { slot: "secondary-2", x: 780, y: 1060, width: 220, height: 320, rotate: 3 },
      { slot: "secondary-3", x: 640, y: 1340, width: 280, height: 400, rotate: -1 },
    ],
    "5-image": [
      { slot: "primary", x: 660, y: 500, width: 300, height: 440, rotate: 1 },
      { slot: "secondary-1", x: 540, y: 920, width: 200, height: 280, rotate: -3 },
      { slot: "secondary-2", x: 780, y: 960, width: 200, height: 280, rotate: 4 },
      { slot: "secondary-3", x: 560, y: 1260, width: 220, height: 320, rotate: -2 },
      { slot: "secondary-4", x: 790, y: 1320, width: 220, height: 320, rotate: 2 },
    ],
  },
};
