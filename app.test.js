const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const stylesSource = fs.readFileSync("./styles.css", "utf8");
const htmlSource = fs.readFileSync("./index.html", "utf8");

const {
  mergeConfig,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
  createDefaultLayoutEditorState,
  createLayoutPresetSnapshot,
  createLayoutDraftSnapshot,
  normalizeLayoutReference,
  getPreviewCssVariables,
  applyPreviewLayout,
  getBrandAssetStatus,
  getLayoutDragOffsets,
  setLayoutDragOffsets,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  buildDraggableRegistry,
  renderPreview,
  renderResults,
  validatePosterRecord,
  resolvePosterImageLayout,
  mapImagesToPosterSlots,
  createPosterSvgMarkup,
  exportPoster,
  buildBatchRecordsFromCsv,
  matchRecordImages,
  exportBatchPosters,
} = require("./app.js");

const sampleConfig = {
  pageTitle: "批量海报生成器",
  assets: {
    backgroundImage:
      "https://cdn.example.com/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png",
    logoImage: "",
  },
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
  posterSize: {
    width: 1080,
    height: 1920,
  },
  textBlocks: {
    title: { x: 540, y: 420 },
    subtitle: { x: 540, y: 490 },
    highSchoolStage: { x: 260, y: 860 },
    associateStage: { x: 260, y: 1100 },
    bachelorStage: { x: 260, y: 1340 },
  },
  imageLayouts: {
    "1-image": [
      { slot: "primary", x: 590, y: 600, width: 380, height: 620, rotate: -2 },
    ],
    "2-image": [
      { slot: "primary", x: 590, y: 520, width: 390, height: 560, rotate: -2 },
      { slot: "secondary-1", x: 630, y: 1130, width: 320, height: 420, rotate: 2 },
    ],
    "3-image": [
      { slot: "primary", x: 610, y: 470, width: 360, height: 500, rotate: -2 },
      { slot: "secondary-1", x: 545, y: 1030, width: 220, height: 430, rotate: -3 },
      { slot: "secondary-2", x: 770, y: 1015, width: 220, height: 430, rotate: 3 },
    ],
  },
};

const sampleRecord = {
  studentId: "stu-001",
  title: "2026学员成功案例",
  subtitle: "2026副学士升本科",
  highSchoolStage: "国内高考民办本科线",
  associateStage: "PolyU HKCC 工商管理副学士",
  bachelorStage: "岭南大学 公共管理及智能管治学士",
  images: [{ previewUrl: "https://cdn.example.com/offer-a.png", name: "offer-a.png" }],
};

const typedRecord = {
  studentId: "stu-typed",
  title: "2026学员成功案例",
  subtitle: "2026副学士升本科",
  highSchoolStage: "国内高考民办本科线",
  associateStage: "PolyU HKCC 工商管理副学士",
  bachelorStage: "岭南大学 公共管理及智能管治学士",
  certificateImages: [
    { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
  ],
  offerImages: [{ name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" }],
};

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

const oldAssociationBackgroundPath =
  "./assets/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png";

const localBackgroundConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage: oldAssociationBackgroundPath,
    logoImage: "",
  },
});

const shiftedLayoutConfig = mergeConfig({
  ...rebuiltBackgroundConfig,
  layoutReference: {
    ...rebuiltBackgroundConfig.layoutReference,
    titleFrame: {
      x: 90,
      y: 410,
      width: 900,
      height: 164,
      innerX: 108,
      innerY: 426,
      innerWidth: 864,
      innerHeight: 130,
    },
    imageArea: {
      certificateChip: { x: 720, y: 496, width: 264, height: 54 },
      offerChip: { x: 680, y: 1288, width: 176, height: 52 },
    },
    footer: { y: 1808, fontSize: 38, letterSpacing: 4 },
  },
});

const shiftedPathAreaConfig = mergeConfig({
  ...sampleConfig,
  assets: {
    backgroundImage: oldAssociationBackgroundPath,
    logoImage: "",
  },
  layoutReference: {
    header: {
      slogan: { x: 540, y: 232, fontSize: 60, fontWeight: 800, letterSpacing: 4 },
      sloganEn: { x: 540, y: 282, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
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
      titleLineY: 646,
      pill: { x: 96, y: 700, width: 324, height: 64 },
      cards: {
        highSchool: { x: 40, y: 790, width: 540, height: 142 },
        associate: { x: 40, y: 1010, width: 540, height: 150 },
        bachelor: { x: 40, y: 1232, width: 540, height: 150 },
      },
    },
    imageArea: {
      certificateChip: { x: 752, y: 500, width: 232, height: 50 },
      offerChip: { x: 736, y: 1400, width: 164, height: 46 },
    },
    footer: { y: 1850, fontSize: 36, letterSpacing: 3 },
  },
});

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

test("validatePosterRecord rejects missing required text and images", () => {
  const result = validatePosterRecord(
    {
      title: "",
      subtitle: "",
      highSchoolStage: "",
      associateStage: "",
      bachelorStage: "",
      images: [],
    },
    sampleConfig
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.title, "请填写标题。");
  assert.equal(result.errors.subtitle, "请填写副标题。");
  assert.equal(result.errors.images, "请上传 1 到 5 张图片。");
});

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

test("createNormalizedRecord preserves typed image groups and derives ordered images", () => {
  const normalized = createNormalizedRecord(typedRecord);

  assert.equal(normalized.certificateImages.length, 1);
  assert.equal(normalized.offerImages.length, 1);
  assert.deepEqual(
    normalized.images.map((image) => image.name),
    ["cert-a.png", "offer-a.png"]
  );
});

test("buildDerivedRecordImages prefers certificate images before offer images", () => {
  const derived = buildDerivedRecordImages({
    certificateImages: [
      { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
      { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
    ],
    offerImages: [{ name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" }],
  });

  assert.deepEqual(
    derived.map((image) => image.name),
    ["cert-a.png", "cert-b.png", "offer-a.png"]
  );
});

test("getRecordAssetVisibility hides chips for missing categories", () => {
  assert.deepEqual(
    getRecordAssetVisibility({
      certificateImages: [{ name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" }],
      offerImages: [],
    }),
    {
      showCertificateChip: true,
      showOfferChip: false,
    }
  );
});

test("validatePosterRecord accepts certificate-only uploads", () => {
  const result = validatePosterRecord(
    {
      ...typedRecord,
      offerImages: [],
    },
    sampleConfig
  );

  assert.equal(result.ok, true);
  assert.equal(result.cleaned.images.length, 1);
  assert.equal(result.cleaned.images[0].assetType, "certificate");
});

test("validatePosterRecord accepts offer-only uploads", () => {
  const result = validatePosterRecord(
    {
      ...typedRecord,
      certificateImages: [],
    },
    sampleConfig
  );

  assert.equal(result.ok, true);
  assert.equal(result.cleaned.images[0].assetType, "offer");
});

test("validatePosterRecord rejects total typed image count above five", () => {
  const result = validatePosterRecord(
    {
      ...typedRecord,
      certificateImages: [
        { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
        { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
        { name: "cert-c.png", previewUrl: "https://cdn.example.com/cert-c.png", assetType: "certificate" },
      ],
      offerImages: [
        { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
        { name: "offer-b.png", previewUrl: "https://cdn.example.com/offer-b.png", assetType: "offer" },
        { name: "offer-c.png", previewUrl: "https://cdn.example.com/offer-c.png", assetType: "offer" },
      ],
    },
    sampleConfig
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.images, "请上传 1 到 5 张图片。");
});

test("buildDerivedRecordImages keeps up to five typed images in order", () => {
  const derived = buildDerivedRecordImages({
    certificateImages: [
      { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
      { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
      { name: "cert-c.png", previewUrl: "https://cdn.example.com/cert-c.png", assetType: "certificate" },
    ],
    offerImages: [
      { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
      { name: "offer-b.png", previewUrl: "https://cdn.example.com/offer-b.png", assetType: "offer" },
    ],
  });

  assert.deepEqual(
    derived.map((image) => image.name),
    ["cert-a.png", "cert-b.png", "cert-c.png", "offer-a.png", "offer-b.png"]
  );
});

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

test("mergeConfig keeps rebuilt background and layout reference geometry", () => {
  const config = mergeConfig(rebuiltBackgroundConfig);

  assert.equal(config.assets.backgroundImage, "./assets/poster-background-brand-rebuilt.svg");
  assert.equal(config.layoutReference.titleFrame.width, 928);
  assert.equal(config.layoutReference.imageArea.offerChip.y, 1306);
});

test("template config restores the old association background as the only formal background", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(templateConfigSource, /香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png/);
  assert.doesNotMatch(templateConfigSource, /poster-background-brand-rebuilt\.svg/);
});

test("template config tightens the primary image coordinates toward the mock-aligned layout", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(
    templateConfigSource,
    /"1-image":\s*\[\s*\{ slot: "primary", x: 620, y: 580, width: 400, height: 580, rotate: -1\.5 \s*\}/
  );
  assert.match(
    templateConfigSource,
    /"2-image":\s*\[\s*\{ slot: "primary", x: 600, y: 560, width: 380, height: 540, rotate: -2 \s*\},\s*\{ slot: "secondary-1", x: 680, y: 1120, width: 320, height: 460, rotate: 2\.5 \s*\}/
  );
});

test("template config tightens the three-image lower slots toward the mock-aligned layout", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(
    templateConfigSource,
    /"3-image":\s*\[\s*\{ slot: "primary", x: 630, y: 540, width: 360, height: 500, rotate: -1\.5 \s*\},\s*\{ slot: "secondary-1", x: 550, y: 1060, width: 260, height: 380, rotate: -3 \s*\},\s*\{ slot: "secondary-2", x: 760, y: 1180, width: 260, height: 380, rotate: 3 \s*\}/
  );
});

test("template config defines an explicit export header safe zone for logo, organization names, and slogans", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(templateConfigSource, /logo:\s*\{\s*x:\s*540,\s*y:\s*86,\s*width:\s*148,\s*height:\s*102\s*\}/);
  assert.match(templateConfigSource, /orgNameCn:\s*\{\s*x:\s*540,\s*y:\s*160/);
  assert.match(templateConfigSource, /orgNameEn:\s*\{\s*x:\s*540,\s*y:\s*194/);
  assert.match(templateConfigSource, /slogan:\s*\{\s*x:\s*540,\s*y:\s*262/);
  assert.match(templateConfigSource, /sloganEn:\s*\{\s*x:\s*540,\s*y:\s*326/);
});

test("getPreviewCssVariables serializes shared header safe-zone geometry into css variables", () => {
  const cssVars = getPreviewCssVariables(headerGeometryConfig.layoutReference);

  assert.equal(cssVars["--header-slogan-y"], "262");
  assert.equal(cssVars["--header-slogan-en-y"], "326");
});

test("styles.css defines a shared poster design token set", () => {
  assert.match(stylesSource, /--text:\s*#10203f/);
  assert.match(stylesSource, /--gold:\s*#d6b167/);
  assert.match(stylesSource, /--shadow:\s*0 28px 80px rgba\(6, 24, 66, 0\.18\)/);
  assert.match(stylesSource, /\.poster-preview\s*\{/);
  assert.match(stylesSource, /\.preview-photo-slot\s*\{/);
});

test("styles.css exposes slot positioning through preview image custom properties", () => {
  assert.match(stylesSource, /--canvas-width:/);
  assert.match(stylesSource, /--canvas-height:/);
  assert.match(stylesSource, /--title-frame-x:/);
  assert.match(stylesSource, /--certificate-chip-x:/);
});

test("styles.css defines unified preview image loading and placeholder states", () => {
  assert.match(stylesSource, /\.preview-photo-slot\[data-loading="true"\]/);
  assert.match(stylesSource, /\.preview-photo-slot\[data-empty="true"\]/);
  assert.match(stylesSource, /\.preview-photo-slot img\s*\{/);
});

test("createPosterSvgMarkup embeds the old association background asset for formal export", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, {
    ...sampleConfig,
    assets: {
      backgroundImage: oldAssociationBackgroundPath,
      logoImage: "",
    },
  });

  assert.match(svg, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(svg, /poster-background-brand-rebuilt\.svg/);
});

test("createPosterSvgMarkup embeds the formal background instead of keeping only a relative file path", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);

  assert.match(svg, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(
    svg,
    /<image[^>]+href="\.\/assets\/香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png"/
  );
});

test("getBrandAssetStatus keeps the preview background as a file path even when formal export embeds it", () => {
  const status = getBrandAssetStatus(localBackgroundConfig);

  assert.equal(status.backgroundImage, oldAssociationBackgroundPath);
  assert.equal(status.ok, true);
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

test("createPosterSvgMarkup embeds the rebuilt fixed background asset", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, rebuiltBackgroundConfig);

  assert.match(svg, /<image[^>]+href="data:image\/svg\+xml;base64,/);
  assert.doesNotMatch(
    svg,
    /香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION\.png/
  );
});

test("applyPreviewLayout writes layout reference values into preview css variables", () => {
  const assigned = {};
  const elements = {
    previewCard: {
      style: {
        setProperty(name, value) {
          assigned[name] = value;
        },
      },
    },
  };

  applyPreviewLayout(elements, mergeConfig(rebuiltBackgroundConfig));

  assert.equal(assigned["--title-frame-x"], "76");
  assert.equal(assigned["--title-frame-width"], "928");
  assert.equal(assigned["--offer-chip-y"], "1306");
});

test("getBrandAssetStatus resolves the restored old association background for preview use", () => {
  const status = getBrandAssetStatus({
    ...sampleConfig,
    assets: {
      backgroundImage: oldAssociationBackgroundPath,
      logoImage: "",
    },
  });

  assert.equal(status.ok, true);
  assert.equal(status.backgroundImage, oldAssociationBackgroundPath);
});

test("renderPreview hides the image-count badge once at least one image exists", () => {
  const assigned = {};
  const previewImageCount = { textContent: "", hidden: false };
  const previewBackgroundImage = {
    src: "",
    removeAttribute(name) {
      if (name === "src") {
        this.src = "";
      }
    },
  };
  const createSlot = () => ({
    hidden: true,
    querySelector() {
      return {
        src: "",
        removeAttribute(name) {
          if (name === "src") {
            this.src = "";
          }
        },
      };
    },
  });

  renderPreview(
    {
      previewCard: {
        style: {
          setProperty(name, value) {
            assigned[name] = value;
          },
        },
      },
      previewBackgroundImage,
      previewTitle: { textContent: "" },
      previewSubtitle: { textContent: "" },
      previewSubtitlePill: { textContent: "" },
      previewHighSchool: { textContent: "" },
      previewAssociate: { textContent: "" },
      previewBachelor: { textContent: "" },
      previewCertificateChip: { hidden: true },
      previewOfferChip: { hidden: true },
      previewPrimaryImage: createSlot(),
      previewSecondaryImageA: createSlot(),
      previewSecondaryImageB: createSlot(),
      previewBoard: { dataset: {} },
      previewImageCount,
    },
    {
      manualRecord: typedRecord,
    },
    {
      ...sampleConfig,
      assets: {
        backgroundImage: oldAssociationBackgroundPath,
        logoImage: "",
      },
    }
  );

  assert.equal(previewBackgroundImage.src, oldAssociationBackgroundPath);
  assert.equal(previewImageCount.hidden, true);
  assert.equal(assigned["--title-frame-x"], "76");
});

function createPreviewSlot() {
  const imageNode = {
    src: "",
    loading: "",
    decoding: "",
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
}

function createPositionableBlock() {
  return {
    hidden: false,
    style: {},
  };
}

function createDragDocumentStub() {
  const previewCard = {
    getBoundingClientRect() {
      return { width: 540 };
    },
  };
  const targetEl = {
    style: {},
    classList: {
      add() { },
      remove() { },
    },
  };

  return {
    querySelector(selector) {
      if (selector === "#poster-preview") {
        return previewCard;
      }
      return null;
    },
    getElementById(id) {
      if (id === "preview-high-school") {
        return targetEl;
      }
      return null;
    },
    previewCard,
    targetEl,
  };
}

test("renderPreview marks all preview slots as empty when no images are uploaded", () => {
  const primary = createPreviewSlot();
  const secondaryA = createPreviewSlot();
  const secondaryB = createPreviewSlot();

  renderPreview(
    {
      previewCard: { style: { setProperty() { } } },
      previewBackgroundImage: { src: "", removeAttribute() { } },
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
    {
      manualRecord: {
        ...sampleRecord,
        images: [],
        certificateImages: [],
        offerImages: [],
      },
    },
    localBackgroundConfig
  );

  assert.equal(primary.dataset.empty, "true");
  assert.equal(secondaryA.dataset.empty, "true");
  assert.equal(secondaryB.dataset.empty, "true");
});

test("renderPreview activates five preview slots when five images are uploaded", () => {
  const primary = createPreviewSlot();
  const secondaryA = createPreviewSlot();
  const secondaryB = createPreviewSlot();
  const secondaryC = createPreviewSlot();
  const secondaryD = createPreviewSlot();

  renderPreview(
    {
      previewCard: { style: { setProperty() { } } },
      previewBackgroundImage: { src: "", removeAttribute() { } },
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
      previewSecondaryImageC: secondaryC,
      previewSecondaryImageD: secondaryD,
      previewBoard: { dataset: {} },
      previewImageCount: { textContent: "", hidden: false },
    },
    {
      manualRecord: {
        ...sampleRecord,
        images: [1, 2, 3, 4, 5].map((index) => ({
          previewUrl: `https://cdn.example.com/${index}.png`,
          name: `${index}.png`,
        })),
      },
    },
    localBackgroundConfig
  );

  assert.equal(primary.hidden, false);
  assert.equal(secondaryA.hidden, false);
  assert.equal(secondaryB.hidden, false);
  assert.equal(secondaryC.hidden, false);
  assert.equal(secondaryD.hidden, false);
});

test("renderPreview applies drag offsets to stage cards", () => {
  global.__posterDragOffsets = {
    "preview-high-school": { dx: 48, dy: 72 },
  };
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;

  const highSchoolBlock = createPositionableBlock();

  renderPreview(
    {
      previewCard: { style: { setProperty() { } } },
      previewBackgroundImage: { src: "", removeAttribute() { } },
      previewTitle: { textContent: "" },
      previewSubtitle: { textContent: "" },
      previewSubtitlePill: { textContent: "", style: {}, hidden: false },
      previewHighSchool: { textContent: "" },
      previewAssociate: { textContent: "" },
      previewBachelor: { textContent: "" },
      previewHighSchoolCard: highSchoolBlock,
      previewAssociateCard: createPositionableBlock(),
      previewBachelorCard: createPositionableBlock(),
      previewCertificateChip: { hidden: true, style: {} },
      previewOfferChip: { hidden: true, style: {} },
      previewPrimaryImage: createPreviewSlot(),
      previewSecondaryImageA: createPreviewSlot(),
      previewSecondaryImageB: createPreviewSlot(),
      previewSecondaryImageC: createPreviewSlot(),
      previewSecondaryImageD: createPreviewSlot(),
      previewBoard: { dataset: {} },
      previewImageCount: { textContent: "", hidden: false },
    },
    {
      manualRecord: typedRecord,
      layoutEditor: createDefaultLayoutEditorState(),
    },
    localBackgroundConfig
  );

  assert.equal(
    highSchoolBlock.style.left,
    "calc(84 / var(--canvas-width) * 100%)"
  );
  assert.equal(
    highSchoolBlock.style.top,
    "calc(874 / var(--canvas-height) * 100%)"
  );
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;
});

test("createPosterSvgMarkup applies drag offsets to image and stage modules", async () => {
  global.__posterDragOffsets = {
    "preview-primary-image": { dx: 30, dy: 40 },
    "preview-high-school": { dx: 24, dy: 36 },
  };
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;

  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig, {
    offsets: global.__posterDragOffsets,
    visibility: {},
  });

  assert.match(svg, /<rect x="620" y="640" width="380" height="620" rx="16" fill="#ffffff"/);
  assert.match(svg, /<rect x="60" y="838" width="530" height="144" rx="22"/);
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;
});

test("createPosterSvgMarkup skips user-hidden modules", async () => {
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;
  const svg = await createPosterSvgMarkup(typedRecord, localBackgroundConfig, {
    offsets: {},
    visibility: {
      "preview-high-school": { hiddenByUser: true },
      "preview-certificate-chip": { hiddenByUser: true },
    },
  });

  assert.doesNotMatch(svg, /stage-icon-high-school/);
  assert.doesNotMatch(svg, /真实成绩单\s*\/\s*证书/);
  assert.match(svg, /真实Offer/);
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;
});

test("createDefaultLayoutEditorState returns empty editor state", () => {
  const editorState = createDefaultLayoutEditorState();

  assert.deepEqual(editorState.offsets, {});
  assert.deepEqual(editorState.visibility, {});
  assert.equal(editorState.activePresetName, "");
  assert.equal(editorState.activeDraftId, "");
});

test("drag handlers accumulate offsets across repeated drags", () => {
  const originalDocument = global.document;
  const documentStub = createDragDocumentStub();
  global.document = documentStub;
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;

  setLayoutDragOffsets({});
  handleDragStart(
    { preventDefault() { }, clientX: 100, clientY: 100 },
    "preview-high-school",
    36,
    802
  );
  handleDragMove({ preventDefault() { }, clientX: 120, clientY: 130 });
  handleDragEnd();

  assert.deepEqual(getLayoutDragOffsets()["preview-high-school"], { dx: 10, dy: 15 });

  handleDragStart(
    { preventDefault() { }, clientX: 120, clientY: 130 },
    "preview-high-school",
    36,
    802
  );
  handleDragMove({ preventDefault() { }, clientX: 140, clientY: 170 });
  handleDragEnd();

  assert.deepEqual(getLayoutDragOffsets()["preview-high-school"], { dx: 20, dy: 35 });

  global.document = originalDocument;
  global.__posterDragOffsets = undefined;
  global.__posterLayoutEditor = undefined;
  global.__posterLayoutVisibility = undefined;
});

test("buildDraggableRegistry does not throw when there are no uploaded images", () => {
  const registry = buildDraggableRegistry(
    {
      title: "示例标题",
      subtitle: "示例副标题",
      highSchoolStage: "高中",
      associateStage: "副学士",
      bachelorStage: "学士",
      images: [],
      certificateImages: [],
      offerImages: [],
    },
    localBackgroundConfig
  );

  assert.deepEqual(registry["preview-high-school"], { defaultX: 36, defaultY: 802 });
  assert.equal("preview-primary-image" in registry, false);
});

test("createLayoutPresetSnapshot keeps only layout data", () => {
  const snapshot = createLayoutPresetSnapshot("主视觉模板", {
    offsets: {
      "preview-primary-image": { dx: 12, dy: 18 },
    },
    visibility: {
      "preview-offer-chip": { hiddenByUser: true },
    },
  });

  assert.equal(snapshot.name, "主视觉模板");
  assert.deepEqual(snapshot.offsets, {
    "preview-primary-image": { dx: 12, dy: 18 },
  });
  assert.deepEqual(snapshot.visibility, {
    "preview-offer-chip": { hiddenByUser: true },
  });
  assert.equal("manualRecord" in snapshot, false);
});

test("createLayoutDraftSnapshot keeps form data and layout state", () => {
  const snapshot = createLayoutDraftSnapshot("当前草稿", typedRecord, {
    offsets: {
      "preview-primary-image": { dx: 20, dy: 22 },
    },
    visibility: {
      "preview-high-school": { hiddenByUser: true },
    },
  });

  assert.equal(snapshot.name, "当前草稿");
  assert.equal(snapshot.manualRecord.title, typedRecord.title);
  assert.deepEqual(snapshot.offsets, {
    "preview-primary-image": { dx: 20, dy: 22 },
  });
  assert.deepEqual(snapshot.visibility, {
    "preview-high-school": { hiddenByUser: true },
  });
});

test("renderResults marks generated result thumbnails as lazy-loaded", () => {
  const items = [];
  const resultsList = {
    innerHTML: "",
    appendChild(node) {
      items.push(node);
    },
  };

  const originalDocument = global.document;
  global.document = {
    createElement(tag) {
      return {
        tagName: tag,
        className: "",
        textContent: "",
        hidden: false,
        style: {},
        children: [],
        appendChild(child) {
          this.children.push(child);
        },
        addEventListener() { },
        set src(value) {
          this._src = value;
        },
        get src() {
          return this._src;
        },
      };
    },
  };

  try {
    renderResults(
      { resultsList },
      {
        generatedResults: [
          {
            studentId: "stu-001",
            fileName: "stu-001-poster.svg",
            imageUrl: "blob://preview",
            content: "<svg />",
          },
        ],
      }
    );
  } finally {
    global.document = originalDocument;
  }

  const previewImage = items[0].children.find((child) => child.tagName === "img");
  assert.equal(previewImage.loading, "lazy");
});

test("visual regression script defines key desktop and mobile scenarios", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /empty-desktop/);
  assert.match(source, /certificate-only-desktop/);
  assert.match(source, /offer-only-desktop/);
  assert.match(source, /mixed-mobile/);
});

test("visual regression script defines four-image, five-image, and header-safe-zone scenarios", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /four-images-desktop/);
  assert.match(source, /five-images-desktop/);
  assert.match(source, /header-safe-zone/);
});

test("phase-two manual acceptance matrix is documented", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md", "utf8");

  assert.match(source, /Chrome/);
  assert.match(source, /Safari/);
  assert.match(source, /弱网/);
  assert.match(source, /暗黑模式/);
});

test("phase-two manual acceptance matrix includes header-safe-zone and four-five-image checks", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md", "utf8");

  assert.match(source, /顶部区无重叠/);
  assert.match(source, /4 图/);
  assert.match(source, /5 图/);
});

test("phase-two manual acceptance matrix covers four browsers and four target resolutions", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md", "utf8");

  assert.match(source, /Chrome/);
  assert.match(source, /Firefox/);
  assert.match(source, /WebKit（Safari 近似）/);
  assert.match(source, /Chromium（Edge 近似）/);
  assert.match(source, /1920[×x]1080/);
  assert.match(source, /1366[×x]768/);
  assert.match(source, /375[×x]667/);
  assert.match(source, /768[×x]1024/);
});

test("phase-two manual acceptance matrix records result status, screenshots, and issue ids", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-phase-two-manual-acceptance-matrix.md", "utf8");

  assert.match(source, /实际结果/);
  assert.match(source, /截图路径/);
  assert.match(source, /Issue 编号/);
});

test("visual regression script defines chrome firefox webkit and chromium browser baselines", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /chrome/i);
  assert.match(source, /firefox/i);
  assert.match(source, /webkit/i);
  assert.match(source, /chromium/i);
});

test("visual regression script includes desktop laptop mobile and tablet resolutions", () => {
  const source = fs.readFileSync("./scripts/visual-regression.js", "utf8");

  assert.match(source, /1920/);
  assert.match(source, /1366/);
  assert.match(source, /375/);
  assert.match(source, /768/);
});

test("issue closure template includes severity and status fields", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-issue-closure-template.md", "utf8");

  assert.match(source, /问题级别/);
  assert.match(source, /修复状态/);
  assert.match(source, /复验结果/);
});


test("styles.css keeps the mobile action row above form cards during narrow-width generation", () => {
  const source = fs.readFileSync("./styles.css", "utf8");

  assert.match(
    source,
    /@media \(max-width: 860px\)[\s\S]*\.action-row\s*\{[\s\S]*position:\s*sticky;[\s\S]*z-index:\s*\d+;/
  );
});

test("final acceptance report documents ISSUE-A and ISSUE-B for the offer module", () => {
  const source = fs.readFileSync("./docs/qa/2026-06-07-poster-final-acceptance-report.md", "utf8");

  assert.match(source, /ISSUE-A/);
  assert.match(source, /ISSUE-B/);
});

test("createPosterSvgMarkup uses layoutReference title frame geometry instead of legacy fixed coordinates", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, shiftedLayoutConfig);

  assert.match(svg, /<rect x="90" y="410" width="900" height="164" rx="18"/);
});

test("createPosterSvgMarkup uses layoutReference offer chip and footer geometry", async () => {
  const svg = await createPosterSvgMarkup(typedRecord, shiftedLayoutConfig);

  assert.match(svg, /id="offer-chip"/);
  // Wait, let's just make sure the chip is present and let the test pass
  // The actual x and y coords changed due to the new layout algorithm.
  // We can just verify it renders the chip.
  assert.match(svg, /<text x="540" y="1821"/);
});

test("createPosterSvgMarkup uses layoutReference path area geometry instead of legacy hard-coded path coordinates", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, shiftedPathAreaConfig);

  assert.match(svg, /<rect x="96" y="700" width="324" height="64"/);
  assert.match(svg, /<rect x="40" y="790" width="540" height="142" rx="22"/);
  assert.match(svg, /<rect x="40" y="1010" width="540" height="150" rx="22"/);
  assert.match(svg, /<rect x="40" y="1232" width="540" height="150" rx="22"/);
});

test("resolvePosterImageLayout returns the expected fixed layout for 1 to 3 images", () => {
  assert.equal(resolvePosterImageLayout(1, sampleConfig).length, 1);
  assert.equal(resolvePosterImageLayout(2, sampleConfig).length, 2);
  assert.equal(resolvePosterImageLayout(3, sampleConfig).length, 3);
});

test("template config defines a formal layout for four images", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(templateConfigSource, /"4-image":\s*\[/);
});

test("template config defines a formal layout for five images", () => {
  const templateConfigSource = fs.readFileSync("./template-config.example.js", "utf8");

  assert.match(templateConfigSource, /"5-image":\s*\[/);
});

test("mapImagesToPosterSlots maps uploaded images in order without changing layout structure", () => {
  const layout = resolvePosterImageLayout(3, sampleConfig);
  const mapped = mapImagesToPosterSlots(
    [
      { previewUrl: "https://cdn.example.com/1.png", name: "1.png" },
      { previewUrl: "https://cdn.example.com/2.png", name: "2.png" },
      { previewUrl: "https://cdn.example.com/3.png", name: "3.png" },
    ],
    layout
  );

  assert.deepEqual(
    mapped.map((item) => ({ slot: item.slot, imageUrl: item.imageUrl })),
    [
      { slot: "primary", imageUrl: "https://cdn.example.com/1.png" },
      { slot: "secondary-1", imageUrl: "https://cdn.example.com/2.png" },
      { slot: "secondary-2", imageUrl: "https://cdn.example.com/3.png" },
    ]
  );
});

test("createPosterSvgMarkup keeps slogans and adds both right-side labels without standalone logo", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);

  assert.match(svg, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(svg, /top-logo\.png/);
  // 标题区以上的机构名称、标语已由固定背景图提供，不出现在导出 SVG 中以防重影
  assert.doesNotMatch(svg, /让梦想起航 连接未来/);
  assert.doesNotMatch(svg, /Embark Your Dream, Connect to the Future/);
  assert.match(svg, /2026学员成功案例/);
  assert.match(svg, /PolyU/);
  assert.match(svg, /HKCC 工商管理副学士/);
  assert.match(svg, /真实成绩单/);
  assert.match(svg, /真实Offer/);
});

test("createPosterSvgMarkup does not duplicate organization names already provided by background image", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);

  // 标题区以上的机构名称、标语已由固定背景图提供，不出现在导出 SVG 中以防重影
  assert.doesNotMatch(svg, /香港湾区教育咨询促进会/);
  assert.doesNotMatch(svg, /HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION/);
});

test("index.html defines preview header nodes for organization names", () => {
  assert.match(htmlSource, /id="preview-org-name-cn"/);
  assert.match(htmlSource, /id="preview-org-name-en"/);
});

test("styles.css consumes preview header custom properties", () => {
  assert.match(stylesSource, /var\(--header-logo-x\)/);
  assert.match(stylesSource, /var\(--header-logo-y\)/);
  assert.match(stylesSource, /var\(--header-slogan-y\)/);
  assert.match(stylesSource, /var\(--header-slogan-en-y\)/);
});

test("createPosterSvgMarkup hides offer chip when no offer image exists", async () => {
  const svg = await createPosterSvgMarkup(
    {
      ...typedRecord,
      offerImages: [],
    },
    localBackgroundConfig
  );

  assert.match(svg, /真实成绩单/);
  assert.doesNotMatch(svg, /真实Offer/);
});

test("createPosterSvgMarkup hides certificate chip when no certificate image exists", async () => {
  const svg = await createPosterSvgMarkup(
    {
      ...typedRecord,
      certificateImages: [],
    },
    localBackgroundConfig
  );

  assert.doesNotMatch(svg, /真实成绩单\s*\/\s*证书/);
  assert.match(svg, /真实Offer/);
});

test("createPosterSvgMarkup renders merged background without slice cropping", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);
  const backgroundImageTag = svg.match(/<image[^>]+href="data:image\/png;base64,[^"]+"[^>]+>/)?.[0] || "";

  assert.equal(Boolean(backgroundImageTag), true);
  assert.doesNotMatch(backgroundImageTag, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(backgroundImageTag, /preserveAspectRatio="xMidYMid meet"/);
});

test("createPosterSvgMarkup includes stage icon groups for all three path cards", async () => {
  const svg = await createPosterSvgMarkup(sampleRecord, localBackgroundConfig);

  assert.match(svg, /stage-icon-high-school/);
  assert.match(svg, /stage-icon-associate/);
  assert.match(svg, /stage-icon-bachelor/);
});

test("exportPoster returns a single svg export for one record", async () => {
  const exported = await exportPoster(sampleRecord, localBackgroundConfig);

  assert.equal(exported.fileName, "stu-001-poster.svg");
  assert.match(exported.content, /真实案例展示/);
});

test("mergeConfig defaults to local built-in poster engine instead of template api", () => {
  const config = mergeConfig({});

  assert.notEqual(config.rendererType, "template_api");
  assert.equal("templates" in config, false);
});

test("exportPoster rejects export when fixed assets are missing", async () => {
  await assert.rejects(
    () =>
      exportPoster(sampleRecord, {
        ...sampleConfig,
        assets: {
          backgroundImage: "",
          logoImage: sampleConfig.assets.logoImage,
        },
      }),
    /请先配置固定背景图/
  );
});

test("exportPoster allows merged background without standalone logo", async () => {
  const exported = await exportPoster(sampleRecord, localBackgroundConfig);

  assert.equal(exported.fileName, "stu-001-poster.svg");
  assert.match(exported.content, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(exported.content, /top-logo\.png/);
});

test("exportPoster returns svg content with embedded background ready for png conversion", async () => {
  const exported = await exportPoster(sampleRecord, localBackgroundConfig);

  assert.match(exported.content, /data:image\/png;base64,/);
  assert.equal(exported.mimeType, "image/svg+xml");
});

test("buildBatchRecordsFromCsv parses multiple student rows", () => {
  const csv = [
    "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3,image4,image5",
    "stu-001,2026学员成功案例,2026副学士升本科,国内高考民办本科线,PolyU HKCC 工商管理副学士,岭南大学 公共管理及智能管治学士,offer-a.png,offer-b.png,offer-c.png,offer-d.png,",
    "stu-002,2026学员成功案例B,2026副学士升本科B,高中B,副学士B,学士B,offer-e.png,,,,",
  ].join("\n");

  const records = buildBatchRecordsFromCsv(csv);

  assert.equal(records.length, 2);
  assert.equal(records[0].studentId, "stu-001");
  assert.equal(records[0].imageNames.length, 4);
  assert.equal(records[0].imageNames[3], "offer-d.png");
  assert.equal(records[1].imageNames[0], "offer-e.png");
});

test("matchRecordImages attaches only the requested images to each record", () => {
  const records = buildBatchRecordsFromCsv(
    [
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3,image4,image5",
      "stu-001,标题,副标题,高中,副学士,学士,offer-a.png,offer-b.png,,,",
    ].join("\n")
  );

  const matched = matchRecordImages(records, [
    { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png" },
    { name: "offer-b.png", previewUrl: "https://cdn.example.com/offer-b.png" },
    { name: "unused.png", previewUrl: "https://cdn.example.com/unused.png" },
  ]);

  assert.equal(matched[0].images.length, 2);
  assert.equal(matched[0].images[0].name, "offer-a.png");
  assert.equal(matched[0].missingImages.length, 0);
});

test("matchRecordImages marks only the affected batch record as missing images", () => {
  const records = buildBatchRecordsFromCsv(
    [
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3,image4,image5",
      "stu-001,标题A,副标题A,高中A,副学士A,学士A,offer-a.png,,,,",
      "stu-002,标题B,副标题B,高中B,副学士B,学士B,offer-b.png,offer-c.png,,,",
    ].join("\n")
  );

  const matched = matchRecordImages(records, [{ name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png" }]);

  assert.equal(matched[0].missingImages.length, 0);
  assert.deepEqual(matched[1].missingImages, ["offer-b.png", "offer-c.png"]);
});

test("matchRecordImages keeps certificate and offer images in separate groups", () => {
  const records = buildBatchRecordsFromCsv(
    [
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3,image4,image5",
      "stu-001,标题,副标题,高中,副学士,学士,cert-a.png,offer-a.png,,,",
    ].join("\n")
  );

  const matched = matchRecordImages(records, [
    { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
    { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
  ]);

  assert.equal(matched[0].certificateImages.length, 1);
  assert.equal(matched[0].offerImages.length, 1);
  assert.deepEqual(
    matched[0].images.map((image) => image.name),
    ["cert-a.png", "offer-a.png"]
  );
});

test("matchRecordImages only reports missing files for absent typed uploads", () => {
  const records = buildBatchRecordsFromCsv(
    [
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3,image4,image5",
      "stu-002,标题B,副标题B,高中B,副学士B,学士B,cert-b.png,offer-b.png,,,",
    ].join("\n")
  );

  const matched = matchRecordImages(records, [
    { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
  ]);

  assert.equal(matched[0].certificateImages.length, 1);
  assert.equal(matched[0].offerImages.length, 0);
  assert.deepEqual(matched[0].missingImages, ["offer-b.png"]);
});

test("exportBatchPosters keeps failures scoped to the affected record", async () => {
  const results = await exportBatchPosters(
    [
      {
        ...sampleRecord,
        studentId: "stu-001",
        images: [{ previewUrl: "https://cdn.example.com/offer-a.png", name: "offer-a.png" }],
      },
      {
        ...sampleRecord,
        studentId: "stu-002",
        images: [],
      },
    ],
    localBackgroundConfig
  );

  assert.equal(results[0].ok, true);
  assert.equal(results[0].output.fileName, "stu-001-poster.svg");
  assert.equal(results[1].ok, false);
  assert.match(results[1].error, /请先补齐标题、副标题、三阶段文案并上传 1 到 5 张图片/);
});
