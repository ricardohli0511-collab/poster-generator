# Poster Typed Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typed asset uploads for certificate and offer materials across single and batch flows, hide category labels when that category is absent, and keep preview/export locked to the fixed brand background.

**Architecture:** Keep the existing single-file browser app structure, but introduce a typed image model inside `app.js` so both preview and SVG export consume the same derived record state. Extend the current upload handlers and batch matching logic to preserve `assetType`, then drive all label visibility from pure helper functions that are easy to test with `node:test`.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node `node:test`, SVG string generation

---

## File Map

- Modify: `app.js`
  - Add typed image normalization helpers
  - Derive `certificateImages`, `offerImages`, `images`, and visibility flags from one source of truth
  - Update manual upload handlers, batch matching, preview rendering, summary rendering, and SVG export
- Modify: `index.html`
  - Replace single image upload entry points with typed upload fields for single and batch workflows
  - Add typed image lists and hook elements for conditional chip rendering
- Modify: `styles.css`
  - Style the new typed upload sections and keep preview chip hidden states visually clean
- Modify: `app.test.js`
  - Add failing tests first for typed normalization, validation, batch matching, and chip visibility in SVG output

## Task 1: Add failing typed-asset model tests

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Write the failing test imports and typed sample records**

```js
const {
  mergeConfig,
  validatePosterRecord,
  resolvePosterImageLayout,
  mapImagesToPosterSlots,
  createPosterSvgMarkup,
  exportPoster,
  buildBatchRecordsFromCsv,
  matchRecordImages,
  exportBatchPosters,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
} = require("./app.js");

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
  offerImages: [
    { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
  ],
};
```

- [ ] **Step 2: Add failing tests for normalization, derived ordering, and visibility**

```js
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
    offerImages: [
      { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
    ],
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
```

- [ ] **Step 3: Run the targeted tests to verify they fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL with errors such as `createNormalizedRecord is not a function`, `buildDerivedRecordImages is not a function`, or mismatched expected properties.

- [ ] **Step 4: Commit the failing tests**

```bash
git add app.test.js
git commit -m "test: cover typed asset normalization model"
```

## Task 2: Implement typed normalization helpers in `app.js`

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Add typed image normalization helpers near `normalizeImages()`**

```js
function normalizeTypedImages(images, assetType) {
  return normalizeImages(images).map((image) => ({
    ...image,
    assetType: image.assetType || assetType,
  }));
}

function buildDerivedRecordImages(record) {
  return [
    ...normalizeTypedImages(record?.certificateImages, "certificate"),
    ...normalizeTypedImages(record?.offerImages, "offer"),
  ].slice(0, 3);
}

function getRecordAssetVisibility(record) {
  const certificateImages = normalizeTypedImages(record?.certificateImages, "certificate");
  const offerImages = normalizeTypedImages(record?.offerImages, "offer");
  return {
    showCertificateChip: certificateImages.length > 0,
    showOfferChip: offerImages.length > 0,
  };
}
```

- [ ] **Step 2: Update `createNormalizedRecord()` to persist typed groups and derive `images`**

```js
function createNormalizedRecord(record) {
  const certificateImages = normalizeTypedImages(record?.certificateImages, "certificate");
  const offerImages = normalizeTypedImages(record?.offerImages, "offer");
  const fallbackImages =
    certificateImages.length || offerImages.length
      ? buildDerivedRecordImages({ certificateImages, offerImages })
      : normalizeImages(record?.images);

  return {
    studentId: sanitizeText(record?.studentId),
    title: sanitizeText(record?.title),
    subtitle: sanitizeText(record?.subtitle),
    highSchoolStage: sanitizeText(record?.highSchoolStage),
    associateStage: sanitizeText(record?.associateStage),
    bachelorStage: sanitizeText(record?.bachelorStage),
    imageNames: (record?.imageNames || []).filter(Boolean).map((name) => sanitizeText(name)),
    certificateImages,
    offerImages,
    images: fallbackImages,
  };
}
```

- [ ] **Step 3: Export the new helpers from the module API**

```js
const api = {
  mergeConfig,
  createNormalizedRecord,
  buildDerivedRecordImages,
  getRecordAssetVisibility,
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

- [ ] **Step 4: Run the targeted tests to verify they now pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new typed-model tests; later SVG and batch tests may still fail.

- [ ] **Step 5: Commit the helper implementation**

```bash
git add app.js app.test.js
git commit -m "feat: add typed image normalization helpers"
```

## Task 3: Add failing validation and SVG visibility tests

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add failing validation tests for typed uploads**

```js
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

test("validatePosterRecord rejects total typed image count above three", () => {
  const result = validatePosterRecord(
    {
      ...typedRecord,
      certificateImages: [
        { name: "cert-a.png", previewUrl: "https://cdn.example.com/cert-a.png", assetType: "certificate" },
        { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
      ],
      offerImages: [
        { name: "offer-a.png", previewUrl: "https://cdn.example.com/offer-a.png", assetType: "offer" },
        { name: "offer-b.png", previewUrl: "https://cdn.example.com/offer-b.png", assetType: "offer" },
      ],
    },
    sampleConfig
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.images, "请上传 1 到 3 张图片。");
});
```

- [ ] **Step 2: Add failing SVG visibility tests**

```js
test("createPosterSvgMarkup hides offer chip when no offer image exists", () => {
  const svg = createPosterSvgMarkup(
    {
      ...typedRecord,
      offerImages: [],
    },
    sampleConfig
  );

  assert.match(svg, /真实成绩单/);
  assert.doesNotMatch(svg, /真实Offer/);
});

test("createPosterSvgMarkup hides certificate chip when no certificate image exists", () => {
  const svg = createPosterSvgMarkup(
    {
      ...typedRecord,
      certificateImages: [],
    },
    sampleConfig
  );

  assert.doesNotMatch(svg, /真实成绩单\s*\/\s*证书/);
  assert.match(svg, /真实Offer/);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because validation and SVG export still treat all images as one flat group and always output both chips.

- [ ] **Step 4: Commit the failing tests**

```bash
git add app.test.js
git commit -m "test: cover typed validation and svg chip visibility"
```

## Task 4: Implement validation and SVG conditional chips

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Update `validatePosterRecord()` to validate derived typed images**

```js
function validatePosterRecord(record, inputConfig) {
  const config = mergeConfig(inputConfig);
  const cleaned = createNormalizedRecord(record);
  const errors = {};

  if (!cleaned.title) {
    errors.title = "请填写标题。";
  } else if (cleaned.title.length > config.fieldLimits.title) {
    errors.title = `标题不能超过 ${config.fieldLimits.title} 个字符。`;
  }

  if (!cleaned.subtitle) {
    errors.subtitle = "请填写副标题。";
  } else if (cleaned.subtitle.length > config.fieldLimits.subtitle) {
    errors.subtitle = `副标题不能超过 ${config.fieldLimits.subtitle} 个字符。`;
  }

  if (!cleaned.highSchoolStage) {
    errors.highSchoolStage = "请填写高中阶段文案。";
  }
  if (!cleaned.associateStage) {
    errors.associateStage = "请填写副学士阶段文案。";
  }
  if (!cleaned.bachelorStage) {
    errors.bachelorStage = "请填写学士阶段文案。";
  }

  if (cleaned.images.length < 1 || cleaned.images.length > 3) {
    errors.images = "请上传 1 到 3 张图片。";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    cleaned,
  };
}
```

- [ ] **Step 2: Make `createPosterSvgMarkup()` render chips only when that asset type exists**

```js
function createPosterSvgMarkup(record, inputConfig) {
  const config = mergeConfig(inputConfig);
  const validation = validatePosterRecord(record, config);
  if (!validation.ok) {
    throw new Error("请先补齐标题、副标题、三阶段文案并上传 1 到 3 张图片。");
  }

  const cleaned = validation.cleaned;
  const brandAssets = requireBrandAssets(config);
  const visibility = getRecordAssetVisibility(cleaned);
  const mappedImages = mapImagesToPosterSlots(
    cleaned.images,
    resolvePosterImageLayout(cleaned.images.length, config)
  );

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${config.posterSize.width}" height="${config.posterSize.height}" viewBox="0 0 ${config.posterSize.width} ${config.posterSize.height}">
  ...
  ${visibility.showCertificateChip ? createChipMarkup({ x: 742, y: 474, width: 250, height: 50, text: config.fixedCopy.imageLabel, fontSize: 18 }) : ""}
  ${createImageMarkup(mappedImages)}
  ${visibility.showOfferChip ? createChipMarkup({ x: 702, y: 1306, width: 164, height: 46, text: "真实Offer", fontSize: 17, id: "offer-chip" }) : ""}
  ${createFooterMarkup(config)}
</svg>`.trim();
}
```

- [ ] **Step 3: Run the tests to verify validation and SVG visibility pass**

Run:

```bash
node --test app.test.js
```

Expected: PASS for certificate-only, offer-only, and over-limit typed-image cases.

- [ ] **Step 4: Commit the validation/export update**

```bash
git add app.js app.test.js
git commit -m "feat: validate typed uploads and hide empty svg chips"
```

## Task 5: Add failing batch typed-matching tests

**Files:**
- Modify: `app.test.js`
- Test: `app.test.js`

- [ ] **Step 1: Add failing tests for typed batch matching**

```js
test("matchRecordImages keeps certificate and offer images in separate groups", () => {
  const records = buildBatchRecordsFromCsv(
    [
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3",
      "stu-001,标题,副标题,高中,副学士,学士,cert-a.png,offer-a.png,",
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
      "studentId,title,subtitle,highSchoolStage,associateStage,bachelorStage,image1,image2,image3",
      "stu-002,标题B,副标题B,高中B,副学士B,学士B,cert-b.png,offer-b.png,",
    ].join("\n")
  );

  const matched = matchRecordImages(records, [
    { name: "cert-b.png", previewUrl: "https://cdn.example.com/cert-b.png", assetType: "certificate" },
  ]);

  assert.equal(matched[0].certificateImages.length, 1);
  assert.equal(matched[0].offerImages.length, 0);
  assert.deepEqual(matched[0].missingImages, ["offer-b.png"]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
node --test app.test.js
```

Expected: FAIL because `matchRecordImages()` currently returns only `images` and `missingImages`, without typed group separation.

- [ ] **Step 3: Commit the failing tests**

```bash
git add app.test.js
git commit -m "test: cover typed batch image matching"
```

## Task 6: Implement typed batch matching in `app.js`

**Files:**
- Modify: `app.js`
- Test: `app.test.js`

- [ ] **Step 1: Refactor `matchRecordImages()` to preserve `assetType` and derive groups**

```js
function matchRecordImages(records, imageFiles) {
  const imageMap = new Map(
    normalizeImages(imageFiles).map((image) => [
      sanitizeText(image.name),
      {
        ...image,
        assetType: image.assetType || "certificate",
      },
    ])
  );

  return (records || []).map((record) => {
    const matchedImages = [];
    const missingImages = [];

    (record.imageNames || []).forEach((imageName) => {
      const matched = imageMap.get(sanitizeText(imageName));
      if (matched) {
        matchedImages.push(matched);
      } else {
        missingImages.push(imageName);
      }
    });

    const certificateImages = matchedImages.filter((image) => image.assetType === "certificate");
    const offerImages = matchedImages.filter((image) => image.assetType === "offer");

    return createNormalizedRecord({
      ...record,
      certificateImages,
      offerImages,
      missingImages,
    });
  }).map((record, index) => ({
    ...record,
    missingImages: (records[index] && records[index].missingImages) || record.missingImages || [],
  }));
}
```

- [ ] **Step 2: Fix the missing-images merge so the returned object preserves the current record’s missing list**

```js
return (records || []).map((record) => {
  const matchedImages = [];
  const missingImages = [];

  (record.imageNames || []).forEach((imageName) => {
    const matched = imageMap.get(sanitizeText(imageName));
    if (matched) {
      matchedImages.push(matched);
    } else {
      missingImages.push(imageName);
    }
  });

  const certificateImages = matchedImages.filter((image) => image.assetType === "certificate");
  const offerImages = matchedImages.filter((image) => image.assetType === "offer");
  const normalized = createNormalizedRecord({
    ...record,
    certificateImages,
    offerImages,
  });

  return {
    ...record,
    ...normalized,
    missingImages,
  };
});
```

- [ ] **Step 3: Run the test suite to verify batch typed matching passes**

Run:

```bash
node --test app.test.js
```

Expected: PASS for the new batch typed-matching tests.

- [ ] **Step 4: Commit the batch matching refactor**

```bash
git add app.js app.test.js
git commit -m "feat: preserve typed groups in batch matching"
```

## Task 7: Update the single-upload UI markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the single flat image upload field with two typed upload sections**

```html
<div class="field-grid two-columns typed-upload-grid">
  <div class="field">
    <label for="certificate-images-input">上传成绩单 / 证书</label>
    <input id="certificate-images-input" type="file" accept="image/png,image/jpeg,image/webp" multiple />
    <p class="field-hint">可单独上传成绩单或证书素材；若未上传，该标签不会显示。</p>
  </div>
  <div class="field">
    <label for="offer-images-input">上传 Offer</label>
    <input id="offer-images-input" type="file" accept="image/png,image/jpeg,image/webp" multiple />
    <p class="field-hint">可单独上传 offer 素材；若未上传，该标签不会显示。</p>
  </div>
</div>
<p id="error-images" class="field-error" hidden></p>
<div class="typed-image-groups">
  <div>
    <h3 class="image-group-title">成绩单 / 证书</h3>
    <ul id="certificate-image-list" class="image-list"></ul>
  </div>
  <div>
    <h3 class="image-group-title">Offer</h3>
    <ul id="offer-image-list" class="image-list"></ul>
  </div>
</div>
```

- [ ] **Step 2: Replace the batch flat image upload field with two typed batch upload fields**

```html
<div class="field-grid two-columns typed-upload-grid">
  <div class="field">
    <label for="batch-certificate-images-input">批量导入成绩单 / 证书图片</label>
    <input id="batch-certificate-images-input" type="file" accept="image/png,image/jpeg,image/webp" multiple />
    <p class="field-hint">请上传 CSV 中会被匹配到的成绩单 / 证书图片文件。</p>
  </div>
  <div class="field">
    <label for="batch-offer-images-input">批量导入 Offer 图片</label>
    <input id="batch-offer-images-input" type="file" accept="image/png,image/jpeg,image/webp" multiple />
    <p class="field-hint">请上传 CSV 中会被匹配到的 offer 图片文件。</p>
  </div>
</div>
```

- [ ] **Step 3: Add preview chip hooks that JavaScript can hide without leaving empty placeholders**

```html
<div id="preview-certificate-chip" class="label-chip top-chip" hidden>
  <span class="chip-accent"></span>
  <span>真实成绩单 / 证书</span>
  <span class="chip-accent"></span>
</div>
...
<div id="preview-offer-chip" class="label-chip offer-chip" hidden>
  <span class="chip-accent"></span>
  <span>真实Offer</span>
  <span class="chip-accent"></span>
</div>
```

- [ ] **Step 4: Commit the HTML changes**

```bash
git add index.html
git commit -m "feat: add typed upload fields to poster ui"
```

## Task 8: Wire typed UI state and preview rendering

**Files:**
- Modify: `app.js`
- Modify: `index.html`

- [ ] **Step 1: Expand browser element bindings for the new upload and preview nodes**

```js
const elements = {
  ...
  certificateImagesInput: document.querySelector("#certificate-images-input"),
  offerImagesInput: document.querySelector("#offer-images-input"),
  certificateImageList: document.querySelector("#certificate-image-list"),
  offerImageList: document.querySelector("#offer-image-list"),
  batchCertificateImagesInput: document.querySelector("#batch-certificate-images-input"),
  batchOfferImagesInput: document.querySelector("#batch-offer-images-input"),
  previewCertificateChip: document.querySelector("#preview-certificate-chip"),
  previewOfferChip: document.querySelector("#preview-offer-chip"),
};
```

- [ ] **Step 2: Update default state to store typed groups**

```js
function createDefaultState() {
  return {
    manualRecord: {
      studentId: "",
      title: "",
      subtitle: "",
      highSchoolStage: "",
      associateStage: "",
      bachelorStage: "",
      certificateImages: [],
      offerImages: [],
      images: [],
    },
    batchRecords: [],
    batchImagePool: [],
    generatedResults: [],
    brandAssetsMessage: "",
    brandAssetsAvailable: null,
    showErrors: false,
  };
}
```

- [ ] **Step 3: Replace the flat manual image handler with a typed one**

```js
async function readTypedImages(files, assetType) {
  const images = [];
  for (const file of Array.from(files || [])) {
    images.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      name: file.name,
      previewUrl: await readFileAsDataUrl(file),
      assetType,
    });
  }
  return images;
}

async function handleManualTypedImageUpload(event, elements, state, inputConfig, assetType) {
  const images = await readTypedImages(event.target.files, assetType);
  if (assetType === "certificate") {
    state.manualRecord.certificateImages = images;
  } else {
    state.manualRecord.offerImages = images;
  }
  state.manualRecord.images = buildDerivedRecordImages(state.manualRecord);
  event.target.value = "";
  refreshUI(elements, state, inputConfig);
}
```

- [ ] **Step 4: Render typed image lists and preview chip visibility from helper functions**

```js
function renderTypedImageList(listElement, images, onRemove) {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = "";
  images.forEach((image, index) => {
    const item = document.createElement("li");
    item.className = "image-item";
    item.innerHTML = `
      <img src="${image.previewUrl}" alt="${image.name || `图片 ${index + 1}`}" />
      <div class="image-meta">
        <strong>${image.name || `图片 ${index + 1}`}</strong>
        <span>${image.assetType === "certificate" ? "成绩单 / 证书" : "Offer"}</span>
      </div>
    `;
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "ghost-button";
    removeButton.textContent = "删除";
    removeButton.addEventListener("click", onRemove);
    item.appendChild(removeButton);
    listElement.appendChild(item);
  });
}

function renderManualImageList(elements, state) {
  renderTypedImageList(elements.certificateImageList, state.manualRecord.certificateImages, () => {});
  renderTypedImageList(elements.offerImageList, state.manualRecord.offerImages, () => {});
}
```

- [ ] **Step 5: Replace the placeholder remove callbacks with index-aware delete logic**

```js
function renderManualImageList(elements, state) {
  renderTypedImageList(elements.certificateImageList, state.manualRecord.certificateImages, (index) => {
    state.manualRecord.certificateImages = state.manualRecord.certificateImages.filter((_, imageIndex) => imageIndex !== index);
    state.manualRecord.images = buildDerivedRecordImages(state.manualRecord);
    refreshUI(elements, state, globalScope.POSTER_TOOL_CONFIG || {});
  });

  renderTypedImageList(elements.offerImageList, state.manualRecord.offerImages, (index) => {
    state.manualRecord.offerImages = state.manualRecord.offerImages.filter((_, imageIndex) => imageIndex !== index);
    state.manualRecord.images = buildDerivedRecordImages(state.manualRecord);
    refreshUI(elements, state, globalScope.POSTER_TOOL_CONFIG || {});
  });
}

function renderTypedImageList(listElement, images, onRemove) {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = "";
  images.forEach((image, index) => {
    ...
    removeButton.addEventListener("click", () => onRemove(index));
    ...
  });
}
```

- [ ] **Step 6: Make `renderPreview()` hide chips when a category is missing**

```js
function renderPreview(elements, state, config) {
  ...
  const cleanedRecord = createNormalizedRecord(state.manualRecord);
  const visibility = getRecordAssetVisibility(cleanedRecord);

  if (elements.previewCertificateChip) {
    elements.previewCertificateChip.hidden = !visibility.showCertificateChip;
  }
  if (elements.previewOfferChip) {
    elements.previewOfferChip.hidden = !visibility.showOfferChip;
  }

  cleanedRecord.images.slice(0, 3).forEach((image, index) => {
    const slot = slots[index];
    if (!slot) {
      return;
    }
    const img = slot.querySelector("img");
    if (img) {
      img.src = image.previewUrl;
    }
    slot.hidden = false;
  });
  ...
}
```

- [ ] **Step 7: Update `refreshUI()` summary text to show typed counts**

```js
if (elements.summaryBox) {
  const cleanedRecord = createNormalizedRecord(state.manualRecord);
  elements.summaryBox.innerHTML = `
    <li>标题：${escapeXml(state.manualRecord.title || "未填写")}</li>
    <li>副标题：${escapeXml(state.manualRecord.subtitle || "未填写")}</li>
    <li>成绩单 / 证书：${cleanedRecord.certificateImages.length} 张</li>
    <li>Offer：${cleanedRecord.offerImages.length} 张</li>
    <li>当前图片总数：${cleanedRecord.images.length} 张</li>
    <li>批量记录：${state.batchRecords.length} 条</li>
    <li>正式输出：内置固定海报引擎</li>
  `;
}
```

- [ ] **Step 8: Register the new single-upload listeners**

```js
if (elements.certificateImagesInput) {
  elements.certificateImagesInput.addEventListener("change", (event) =>
    handleManualTypedImageUpload(event, elements, state, config, "certificate")
  );
}

if (elements.offerImagesInput) {
  elements.offerImagesInput.addEventListener("change", (event) =>
    handleManualTypedImageUpload(event, elements, state, config, "offer")
  );
}
```

- [ ] **Step 9: Commit the browser-state and preview wiring**

```bash
git add app.js index.html
git commit -m "feat: wire typed uploads into preview state"
```

## Task 9: Wire typed batch upload inputs

**Files:**
- Modify: `app.js`
- Modify: `index.html`

- [ ] **Step 1: Add a typed batch upload helper**

```js
async function handleBatchTypedImageUpload(event, elements, state, inputConfig, assetType) {
  const images = await readTypedImages(event.target.files, assetType);
  state.batchImagePool = [
    ...state.batchImagePool.filter((image) => image.assetType !== assetType),
    ...images,
  ];
  state.batchRecords = matchRecordImages(state.batchRecords, state.batchImagePool);
  event.target.value = "";
  refreshUI(elements, state, inputConfig);
}
```

- [ ] **Step 2: Register typed batch input listeners**

```js
if (elements.batchCertificateImagesInput) {
  elements.batchCertificateImagesInput.addEventListener("change", (event) =>
    handleBatchTypedImageUpload(event, elements, state, config, "certificate")
  );
}

if (elements.batchOfferImagesInput) {
  elements.batchOfferImagesInput.addEventListener("change", (event) =>
    handleBatchTypedImageUpload(event, elements, state, config, "offer")
  );
}
```

- [ ] **Step 3: Keep CSV upload rematching compatible with typed pools**

```js
async function handleCsvUpload(event, elements, state, inputConfig) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const csvText = await file.text();
  state.batchRecords = buildBatchRecordsFromCsv(csvText);
  if (state.batchImagePool.length) {
    state.batchRecords = matchRecordImages(state.batchRecords, state.batchImagePool);
  }
  event.target.value = "";
  refreshUI(elements, state, inputConfig);
}
```

- [ ] **Step 4: Commit the typed batch-upload wiring**

```bash
git add app.js index.html
git commit -m "feat: support typed batch image uploads"
```

## Task 10: Style the typed upload UI

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add layout styles for typed upload sections and group headings**

```css
.typed-upload-grid {
  align-items: start;
}

.typed-image-groups {
  display: grid;
  gap: 18px;
}

.image-group-title {
  margin: 0 0 10px;
  color: #143a83;
  font-size: 15px;
  font-weight: 800;
}
```

- [ ] **Step 2: Ensure hidden preview chips collapse cleanly**

```css
.label-chip[hidden] {
  display: none !important;
}
```

- [ ] **Step 3: Add responsive tweaks for the new grouped upload layout**

```css
@media (min-width: 861px) {
  .typed-image-groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .typed-upload-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Commit the CSS changes**

```bash
git add styles.css
git commit -m "style: add typed upload layout styles"
```

## Task 11: Run diagnostics and full automated verification

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.test.js`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
node --test app.test.js
```

Expected: PASS with all existing and new typed-upload tests green.

- [ ] **Step 2: Run diagnostics on edited files**

Run the editor diagnostics tool for:

```text
file:///Users/haoyuli/Desktop/未命名文件夹/app.js
file:///Users/haoyuli/Desktop/未命名文件夹/index.html
file:///Users/haoyuli/Desktop/未命名文件夹/styles.css
file:///Users/haoyuli/Desktop/未命名文件夹/app.test.js
```

Expected: no new errors introduced by the typed-upload refactor.

- [ ] **Step 3: Commit the verified implementation**

```bash
git add app.js index.html styles.css app.test.js
git commit -m "feat: add typed asset uploads to poster generator"
```

## Task 12: Perform manual workflow verification

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Launch the local page**

Run:

```bash
python3 -m http.server 4173
```

Expected: local preview available at `http://localhost:4173/`.

- [ ] **Step 2: Verify certificate-only flow**

Manual actions:

```text
1. Open http://localhost:4173/index.html
2. Fill the text fields with valid sample data
3. Upload one image through “上传成绩单 / 证书”
4. Do not upload any offer image
```

Expected:

```text
- Preview shows the fixed configured background
- “真实成绩单 / 证书” chip is visible
- “真实Offer” chip is hidden
- Generate button becomes enabled
```

- [ ] **Step 3: Verify offer-only flow**

Manual actions:

```text
1. Refresh the page
2. Fill the text fields again
3. Upload one image through “上传 Offer”
4. Leave certificate empty
```

Expected:

```text
- Preview still shows the fixed configured background
- “真实成绩单 / 证书” chip is hidden
- “真实Offer” chip is visible
- No empty label placeholder remains where the certificate chip would have been
```

- [ ] **Step 4: Verify mixed two-category flow**

Manual actions:

```text
1. Upload one certificate image and one offer image
2. Check the preview layout
3. Click “生成单张海报”
4. Download SVG and inspect the text content
```

Expected:

```text
- Both chips are visible
- The certificate image is placed before the offer image in derived order
- Exported SVG contains the fixed brand background path
- Exported SVG contains both chip labels
```

- [ ] **Step 5: Verify deletion hides chips immediately**

Manual actions:

```text
1. Start from a record with both categories uploaded
2. Delete the only offer image
3. Delete the only certificate image in a second pass
```

Expected:

```text
- Removing the last offer image hides the offer chip immediately
- Removing the last certificate image hides the certificate chip immediately
- The image-count summary updates after each deletion
```

- [ ] **Step 6: Verify batch typed uploads**

Manual actions:

```text
1. Import a CSV with image file names split across certificate and offer files
2. Upload certificate images through the certificate batch input
3. Upload offer images through the offer batch input
4. Click “批量生成海报”
```

Expected:

```text
- Batch records show accurate missing-image states
- Records with both types produce both chips
- Records missing one type do not render that type’s chip in export
```

- [ ] **Step 7: Shut down the local server**

Run:

```bash
pkill -f "http.server 4173"
```

Expected: the temporary local server exits cleanly.

- [ ] **Step 8: Commit any final fixes from manual testing**

```bash
git add app.js index.html styles.css app.test.js
git commit -m "fix: address typed upload qa feedback"
```

## Self-Review

- Spec coverage check:
  - Architecture and素材管理梳理 are implemented by Tasks 2, 6, 8, and 9.
  - `1-poster.png` not becoming background is enforced by Tasks 4 and 12.
  - 分类上传 in single and batch flows is implemented by Tasks 7, 8, and 9.
  - 条件渲染标签 is implemented by Tasks 3, 4, 8, and 12.
  - 全流程测试 is covered by Tasks 11 and 12.
- Placeholder scan:
  - No `TODO`, `TBD`, or “similar to above” placeholders remain.
- Type consistency:
  - The plan consistently uses `certificateImages`, `offerImages`, `images`, `assetType`, `showCertificateChip`, and `showOfferChip`.
