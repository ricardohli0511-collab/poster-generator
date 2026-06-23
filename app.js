(function (globalScope) {
  const DEFAULT_CONFIG = {
    pageTitle: "批量海报生成器",
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
      backgroundImage: "",
      logoImage: "",
    },
    posterSize: {
      width: 1080,
      height: 1920,
    },
    textBlocks: {
      title: { x: 540, y: 462 },
      subtitle: { x: 540, y: 580 },
      highSchoolStage: { x: 300, y: 874 },
      associateStage: { x: 300, y: 1080 },
      bachelorStage: { x: 300, y: 1286 },
    },
    imageLayouts: {
      "1-image": [{ slot: "primary", x: 620, y: 580, width: 400, height: 580, rotate: -1.5 }],
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

  const DEFAULT_LAYOUT_REFERENCE = {
    canvas: { width: 1080, height: 1920 },
    header: {
      logo: { x: 540, y: 86, width: 148, height: 102 },
      orgNameCn: { x: 540, y: 160, fontSize: 24, fontWeight: 700, letterSpacing: 1 },
      orgNameEn: { x: 540, y: 194, fontSize: 16, fontWeight: 500, letterSpacing: 1.2 },
      slogan: { x: 540, y: 242, fontSize: 62, fontWeight: 800, letterSpacing: 4 },
      sloganEn: { x: 540, y: 292, fontSize: 24, fontWeight: 700, letterSpacing: 2 },
    },
    titleFrame: {
      x: 76,
      y: 374,
      width: 928,
      height: 152,
      innerX: 92,
      innerY: 390,
      innerWidth: 896,
      innerHeight: 120,
    },
    pathArea: {
      titleLineY: 672,
      pill: { x: 140, y: 722, width: 320, height: 64 },
      cards: {
        highSchool: { x: 36, y: 802, width: 530, height: 144 },
        associate: { x: 36, y: 1008, width: 530, height: 144 },
        bachelor: { x: 36, y: 1214, width: 530, height: 144 },
      },
    },
    imageArea: {
      certificateChip: { x: 755, y: 540, width: 250, height: 50 },
      offerChip: { x: 702, y: 1306, width: 164, height: 46 },
    },
    footer: { y: 1840, fontSize: 36, letterSpacing: 3 },
  };

  const LAYOUT_PRESET_STORAGE_KEY = "poster_layout_presets_v1";
  const LAYOUT_DRAFT_STORAGE_KEY = "poster_poster_drafts_v1";
  const EDITABLE_ELEMENT_IDS = [
    "preview-primary-image",
    "preview-secondary-image-a",
    "preview-secondary-image-b",
    "preview-secondary-image-c",
    "preview-secondary-image-d",
    "preview-high-school",
    "preview-associate",
    "preview-bachelor",
    "preview-certificate-chip",
    "preview-offer-chip",
    "preview-subtitle-pill",
  ];
  const EDITABLE_ELEMENT_LABELS = {
    "preview-primary-image": "主图位",
    "preview-secondary-image-a": "辅图位 A",
    "preview-secondary-image-b": "辅图位 B",
    "preview-secondary-image-c": "辅图位 C",
    "preview-secondary-image-d": "辅图位 D",
    "preview-high-school": "高中阶段/学士阶段卡片",
    "preview-associate": "副学士阶段卡片",
    "preview-bachelor": "学士阶段/硕士阶段卡片",
    "preview-certificate-chip": "成绩单标签",
    "preview-offer-chip": "Offer 标签",
    "preview-subtitle-pill": "副标题标签",
  };

  function mergeNested(base, incoming) {
    return { ...base, ...(incoming || {}) };
  }

  function mergeDeepObject(base, incoming) {
    const output = { ...base };
    Object.entries(incoming || {}).forEach(([key, value]) => {
      output[key] =
        value && typeof value === "object" && !Array.isArray(value)
          ? mergeDeepObject(base?.[key] || {}, value)
          : value;
    });
    return output;
  }

  function normalizeLayoutReference(layoutReference) {
    return mergeDeepObject(DEFAULT_LAYOUT_REFERENCE, layoutReference || {});
  }

  function mergeConfig(inputConfig) {
    const source = inputConfig || {};
    const mergedImageLayouts = { ...DEFAULT_CONFIG.imageLayouts, ...(source.imageLayouts || {}) };
    return {
      ...DEFAULT_CONFIG,
      ...source,
      fixedCopy: mergeNested(DEFAULT_CONFIG.fixedCopy, source.fixedCopy),
      fieldLimits: mergeNested(DEFAULT_CONFIG.fieldLimits, source.fieldLimits),
      assets: mergeNested(DEFAULT_CONFIG.assets, source.assets),
      posterSize: mergeNested(DEFAULT_CONFIG.posterSize, source.posterSize),
      textBlocks: mergeNested(DEFAULT_CONFIG.textBlocks, source.textBlocks),
      imageLayouts: mergedImageLayouts,
      layoutReference: normalizeLayoutReference(source.layoutReference),
    };
  }

  function cloneOffsetsMap(offsets) {
    const output = {};
    Object.entries(offsets || {}).forEach(([key, value]) => {
      output[key] = {
        dx: Number(value?.dx) || 0,
        dy: Number(value?.dy) || 0,
        scale: Number.isFinite(Number(value?.scale)) && Number(value?.scale) > 0 ? Number(value.scale) : 1,
        rotate: Number(value?.rotate) || 0,
      };
    });
    return output;
  }

  function normalizeVisibilityMap(visibility) {
    const output = {};
    Object.entries(visibility || {}).forEach(([key, value]) => {
      output[key] = {
        hiddenByUser: Boolean(value?.hiddenByUser),
      };
    });
    return output;
  }

  function createDefaultLayoutEditorState() {
    return {
      offsets: {},
      visibility: {},
      activePresetName: "",
      activeDraftId: "",
      selectedElementId: "",
    };
  }

  function cloneLayoutEditorState(layoutEditorState) {
    const source = layoutEditorState || {};
    const base = createDefaultLayoutEditorState();
    return {
      ...base,
      ...source,
      offsets: cloneOffsetsMap(source.offsets),
      visibility: normalizeVisibilityMap(source.visibility),
      activePresetName: sanitizeText(source.activePresetName || ""),
      activeDraftId: sanitizeText(source.activeDraftId || ""),
      selectedElementId: sanitizeText(source.selectedElementId || ""),
    };
  }

  function getResolvedLayoutEditorState(layoutEditorState) {
    const editorFallback = globalScope.__posterLayoutEditor
      ? cloneLayoutEditorState(globalScope.__posterLayoutEditor)
      : createDefaultLayoutEditorState();
    const globalOffsets = cloneOffsetsMap(globalScope.__posterDragOffsets);
    const globalVisibility = normalizeVisibilityMap(globalScope.__posterLayoutVisibility);
    const globalFallback = {
      ...editorFallback,
      offsets: {
        ...editorFallback.offsets,
        ...globalOffsets,
      },
      visibility: {
        ...editorFallback.visibility,
        ...globalVisibility,
      },
    };
    if (layoutEditorState) {
      const localState = cloneLayoutEditorState(layoutEditorState);
      return {
        ...globalFallback,
        ...localState,
        offsets: Object.keys(localState.offsets || {}).length ? localState.offsets : globalFallback.offsets,
        visibility: Object.keys(localState.visibility || {}).length ? localState.visibility : globalFallback.visibility,
        activePresetName: localState.activePresetName || globalFallback.activePresetName || "",
        activeDraftId: localState.activeDraftId || globalFallback.activeDraftId || "",
        selectedElementId: localState.selectedElementId || globalFallback.selectedElementId || "",
      };
    }
    return globalFallback;
  }

  function syncGlobalLayoutEditorState(layoutEditorState) {
    const resolved = cloneLayoutEditorState(layoutEditorState);
    globalScope.__posterLayoutEditor = resolved;
    globalScope.__posterDragOffsets = resolved.offsets;
    globalScope.__posterLayoutVisibility = resolved.visibility;
    return resolved;
  }

  function createLayoutPresetSnapshot(name, layoutEditorState) {
    const now = Date.now();
    const layoutEditor = cloneLayoutEditorState(layoutEditorState);
    return {
      id: `preset-${now}-${Math.random().toString(16).slice(2, 8)}`,
      name: sanitizeText(name) || "未命名布局",
      offsets: layoutEditor.offsets,
      visibility: layoutEditor.visibility,
      createdAt: now,
      updatedAt: now,
    };
  }

  function createLayoutDraftSnapshot(name, manualRecord, layoutEditorState) {
    const cleaned = createNormalizedRecord(manualRecord || {});
    const now = Date.now();
    const layoutEditor = cloneLayoutEditorState(layoutEditorState);
    return {
      id: `draft-${now}-${Math.random().toString(16).slice(2, 8)}`,
      name: sanitizeText(name) || "未命名草稿",
      manualRecord: {
        studentId: cleaned.studentId,
        title: cleaned.title,
        subtitle: cleaned.subtitle,
        highSchoolStage: cleaned.highSchoolStage,
        associateStage: cleaned.associateStage,
        bachelorStage: cleaned.bachelorStage,
        certificateImages: [],
        offerImages: [],
        images: [],
      },
      offsets: layoutEditor.offsets,
      visibility: layoutEditor.visibility,
      createdAt: now,
      updatedAt: now,
    };
  }

  function isElementHiddenByUser(layoutEditorState, elementId) {
    return Boolean(layoutEditorState?.visibility?.[elementId]?.hiddenByUser);
  }

  function applyOffsetToPoint(point, elementId, offsets) {
    const off = offsets?.[elementId] || { dx: 0, dy: 0 };
    return {
      ...point,
      x: point.x + (off.dx || 0),
      y: point.y + (off.dy || 0),
      userScale: Number.isFinite(Number(off.scale)) && Number(off.scale) > 0 ? Number(off.scale) : 1,
      userRotate: Number(off.rotate) || 0,
    };
  }

  const IMAGE_ELEMENT_IDS = [
    "preview-primary-image",
    "preview-secondary-image-a",
    "preview-secondary-image-b",
    "preview-secondary-image-c",
    "preview-secondary-image-d",
  ];

  function isImageElementId(elementId) {
    return IMAGE_ELEMENT_IDS.includes(elementId);
  }

  function getStorageCollection(storageKey) {
    try {
      const raw = globalScope.localStorage?.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function setStorageCollection(storageKey, collection) {
    try {
      globalScope.localStorage?.setItem(storageKey, JSON.stringify(collection));
      return true;
    } catch (error) {
      return false;
    }
  }

  function listLayoutPresets() {
    return getStorageCollection(LAYOUT_PRESET_STORAGE_KEY);
  }

  function listLayoutDrafts() {
    return getStorageCollection(LAYOUT_DRAFT_STORAGE_KEY);
  }

  function saveLayoutPreset(name, layoutEditorState) {
    const snapshot = createLayoutPresetSnapshot(name, layoutEditorState);
    const existing = listLayoutPresets().filter((item) => item.name !== snapshot.name);
    existing.push(snapshot);
    setStorageCollection(LAYOUT_PRESET_STORAGE_KEY, existing);
    return snapshot;
  }

  function saveLayoutDraft(name, manualRecord, layoutEditorState) {
    const snapshot = createLayoutDraftSnapshot(name, manualRecord, layoutEditorState);
    const existing = listLayoutDrafts().filter((item) => item.name !== snapshot.name);
    existing.push(snapshot);
    setStorageCollection(LAYOUT_DRAFT_STORAGE_KEY, existing);
    return snapshot;
  }

  function deleteLayoutPresetByName(name) {
    const nextItems = listLayoutPresets().filter((item) => item.name !== name);
    return setStorageCollection(LAYOUT_PRESET_STORAGE_KEY, nextItems);
  }

  function deleteLayoutDraftByName(name) {
    const nextItems = listLayoutDrafts().filter((item) => item.name !== name);
    return setStorageCollection(LAYOUT_DRAFT_STORAGE_KEY, nextItems);
  }

  function deleteLayoutPresetById(id) {
    const nextItems = listLayoutPresets().filter((item) => item.id !== id);
    return setStorageCollection(LAYOUT_PRESET_STORAGE_KEY, nextItems);
  }

  function deleteLayoutDraftById(id) {
    const nextItems = listLayoutDrafts().filter((item) => item.id !== id);
    return setStorageCollection(LAYOUT_DRAFT_STORAGE_KEY, nextItems);
  }

  function getPreviewCssVariables(layoutReference) {
    return {
      "--header-logo-x": String(layoutReference.header.logo?.x ?? DEFAULT_LAYOUT_REFERENCE.header.logo?.x ?? 540),
      "--header-logo-y": String(layoutReference.header.logo?.y ?? DEFAULT_LAYOUT_REFERENCE.header.logo?.y ?? 86),
      "--header-logo-width": String(layoutReference.header.logo?.width ?? DEFAULT_LAYOUT_REFERENCE.header.logo?.width ?? 148),
      "--header-logo-height": String(layoutReference.header.logo?.height ?? DEFAULT_LAYOUT_REFERENCE.header.logo?.height ?? 102),
      "--header-org-name-cn-x": String(layoutReference.header.orgNameCn?.x ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameCn?.x ?? 540),
      "--header-org-name-cn-y": String(layoutReference.header.orgNameCn?.y ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameCn?.y ?? 160),
      "--header-org-name-cn-size": String(layoutReference.header.orgNameCn?.fontSize ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameCn?.fontSize ?? 24),
      "--header-org-name-en-x": String(layoutReference.header.orgNameEn?.x ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameEn?.x ?? 540),
      "--header-org-name-en-y": String(layoutReference.header.orgNameEn?.y ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameEn?.y ?? 194),
      "--header-org-name-en-size": String(layoutReference.header.orgNameEn?.fontSize ?? DEFAULT_LAYOUT_REFERENCE.header.orgNameEn?.fontSize ?? 16),
      "--header-slogan-y": String(layoutReference.header.slogan.y),
      "--header-slogan-en-y": String(layoutReference.header.sloganEn.y),
      "--title-frame-x": String(layoutReference.titleFrame.x),
      "--title-frame-y": String(layoutReference.titleFrame.y),
      "--title-frame-width": String(layoutReference.titleFrame.width),
      "--title-frame-height": String(layoutReference.titleFrame.height),
      "--path-title-line-y": String(layoutReference.pathArea.titleLineY),
      "--certificate-chip-x": String(layoutReference.imageArea.certificateChip.x),
      "--certificate-chip-y": String(layoutReference.imageArea.certificateChip.y),
      "--offer-chip-x": String(layoutReference.imageArea.offerChip.x),
      "--offer-chip-y": String(layoutReference.imageArea.offerChip.y),
      "--footer-y": String(layoutReference.footer.y),
    };
  }

  function applyPreviewLayout(elements, config) {
    if (!elements?.previewCard) {
      return;
    }

    const cssVariables = getPreviewCssVariables(config.layoutReference || normalizeLayoutReference());
    Object.entries(cssVariables).forEach(([name, value]) => {
      elements.previewCard.style.setProperty(name, value);
    });
  }

  function sanitizeText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function normalizeImages(images) {
    return (images || []).filter(Boolean).map((image, index) => ({
      id: image.id || `image-${index + 1}`,
      file: image.file || null,
      name: image.name || "",
      previewUrl: image.previewUrl || image.localUrl || image.url || "",
      assetType: image.assetType || "",
    }));
  }

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
    ].slice(0, 5);
  }

  function getRecordAssetVisibility(record) {
    const certificateImages = normalizeTypedImages(record?.certificateImages, "certificate");
    const offerImages = normalizeTypedImages(record?.offerImages, "offer");
    const fallbackImages = normalizeImages(record?.images);
    const hasTypedGroups = certificateImages.length > 0 || offerImages.length > 0;
    const hasUntypedFallback = fallbackImages.some((image) => !image.assetType);

    return {
      showCertificateChip:
        certificateImages.length > 0 ||
        (!hasTypedGroups &&
          (hasUntypedFallback || fallbackImages.some((image) => image.assetType === "certificate"))),
      showOfferChip:
        offerImages.length > 0 ||
        (!hasTypedGroups &&
          (hasUntypedFallback || fallbackImages.some((image) => image.assetType === "offer"))),
    };
  }

  function createNormalizedRecord(record) {
    const certificateImages = normalizeTypedImages(record?.certificateImages, "certificate");
    const offerImages = normalizeTypedImages(record?.offerImages, "offer");
    const images =
      certificateImages.length || offerImages.length
        ? buildDerivedRecordImages({ certificateImages, offerImages })
        : normalizeImages(record?.images);

    return {
      studentId: sanitizeText(record?.studentId),
      title: sanitizeText(record?.title),
      subtitle: sanitizeText(record?.subtitle),
      pathBadge: sanitizeText(record?.pathBadge),
      highSchoolStage: sanitizeText(record?.highSchoolStage),
      associateStage: sanitizeText(record?.associateStage),
      bachelorStage: sanitizeText(record?.bachelorStage),
      imageNames: (record?.imageNames || []).filter(Boolean).map((name) => sanitizeText(name)),
      certificateImages,
      offerImages,
      images,
      totalImageCount:
        certificateImages.length || offerImages.length
          ? certificateImages.length + offerImages.length
          : images.length,
    };
  }

  function getBrandAssetStatus(inputConfig) {
    const config = mergeConfig(inputConfig);
    const backgroundImage = sanitizeText(config.assets.backgroundImage);
    const logoImage = sanitizeText(config.assets.logoImage);
    return {
      ok: Boolean(backgroundImage),
      backgroundImage,
      logoImage,
    };
  }

  function requireBrandAssets(inputConfig) {
    const status = getBrandAssetStatus(inputConfig);
    if (!status.ok) {
      throw new Error("请先配置固定背景图，再导出或预览正式海报。");
    }
    return status;
  }

  function inferMimeTypeFromPath(filePath) {
    const normalized = String(filePath || "").toLowerCase();
    if (normalized.endsWith(".png")) {
      return "image/png";
    }
    if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
      return "image/jpeg";
    }
    if (normalized.endsWith(".webp")) {
      return "image/webp";
    }
    if (normalized.endsWith(".svg")) {
      return "image/svg+xml";
    }
    return "application/octet-stream";
  }

  function readBlobAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("固定背景图读取失败，请检查背景资源。"));
      reader.readAsDataURL(blob);
    });
  }

  async function resolveExportBackgroundImage(inputConfig) {
    const assets = requireBrandAssets(inputConfig);
    if (/^data:image\//.test(assets.backgroundImage)) {
      return assets.backgroundImage;
    }

    if (typeof window === "undefined") {
      const fs = require("node:fs");
      const path = require("node:path");
      const absolutePath = path.resolve(process.cwd(), assets.backgroundImage);
      const fileBuffer = fs.readFileSync(absolutePath);
      const mimeType = inferMimeTypeFromPath(assets.backgroundImage);
      return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    const response = await fetch(assets.backgroundImage);
    if (!response.ok) {
      throw new Error("固定背景图读取失败，请检查背景资源。");
    }
    return readBlobAsDataUrl(await response.blob());
  }

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
      errors.highSchoolStage = "请填写高中阶段/学士阶段文案。";
    }
    if (!cleaned.bachelorStage) {
      errors.bachelorStage = "请填写学士阶段/硕士阶段文案。";
    }

    if (cleaned.totalImageCount < 1 || cleaned.totalImageCount > 5) {
      errors.images = "请上传 1 到 5 张图片。";
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
      cleaned,
    };
  }

  function resolvePosterImageLayout(imageCount, inputConfig) {
    const config = mergeConfig(inputConfig);
    const key = `${imageCount}-image`;
    const layout = config.imageLayouts[key];
    if (!layout) {
      throw new Error(`未找到 ${imageCount} 张图片对应的固定布局。`);
    }
    return layout;
  }

  function mapImagesToPosterSlots(images, layout) {
    const normalizedImages = normalizeImages(images);
    if (normalizedImages.length !== layout.length) {
      throw new Error("当前图片数量与目标布局槽位不匹配。");
    }
    return normalizedImages.map((image, index) => ({
      ...layout[index],
      imageUrl: image.previewUrl,
      name: image.name,
    }));
  }

  function escapeXml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function splitStageLines(text, maxLines) {
    const cleaned = sanitizeText(text);
    if (!cleaned) {
      return [""];
    }
    const limit = Math.max(1, Math.min(maxLines || 2, 3));
    if (limit === 1 || cleaned.length <= 12) {
      return [cleaned];
    }
    if (cleaned.includes(" ")) {
      const words = cleaned.split(" ");
      if (words.length === 2 && limit >= 2) {
        return [words[0], words[1]];
      }
      if (words.length >= 3 && limit >= 3) {
        const lines = [];
        let current = "";
        const maxPerLine = Math.ceil(cleaned.length / 3) + 2;
        for (const word of words) {
          if (current && (current + " " + word).length > maxPerLine) {
            lines.push(current);
            current = word;
            if (lines.length >= 2) break;
          } else {
            current = current ? current + " " + word : word;
          }
        }
        if (current) lines.push(current);
        if (lines.length <= 3) return lines;
        return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
      }
      return [words.join(" ")];
    }
    if (cleaned.length <= 24 || limit === 2) {
      const mid = Math.ceil(cleaned.length / 2);
      return [cleaned.slice(0, mid), cleaned.slice(mid)];
    }
    const size = Math.ceil(cleaned.length / 3);
    return [
      cleaned.slice(0, size),
      cleaned.slice(size, size * 2),
      cleaned.slice(size * 2),
    ];
  }

  function createMultilineTextMarkup(lines, x, centerY, options = {}) {
    const fontSize = options.fontSize || 30;
    const lineHeight = options.lineHeight || fontSize + 8;
    const fill = options.fill || "#fff2cf";
    const fontWeight = options.fontWeight || "700";
    const letterSpacing = options.letterSpacing || "1.5";
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
    return `
      <text x="${x}" text-anchor="middle" fill="${fill}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}">
        ${lines
        .map((line, index) => `<tspan x="${x}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`)
        .join("")}
      </text>`;
  }

  function createStageIconMarkup(id, type, cx, cy) {
    const frame = `
      <circle cx="${cx}" cy="${cy}" r="36" fill="#07205a" stroke="url(#luxGold)" stroke-width="3" filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.5))" />
      <circle cx="${cx}" cy="${cy}" r="31" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1" />
      <circle cx="${cx}" cy="${cy}" r="33" fill="none" stroke="url(#goldStroke)" stroke-opacity="0.3" stroke-width="0.8" />`;
    if (type === "high-school") {
      return `
        <g id="${id}">
          ${frame}
          <polygon points="${cx - 18},${cy - 9} ${cx + 2},${cy - 20} ${cx + 20},${cy - 8} ${cx},${cy + 2}" fill="#f8e6b0" />
          <rect x="${cx - 7}" y="${cy + 2}" width="14" height="11" fill="none" stroke="#f8e6b0" stroke-width="2" />
          <line x1="${cx + 18}" y1="${cy - 8}" x2="${cx + 18}" y2="${cy + 12}" stroke="#f8e6b0" stroke-width="2" />
          <circle cx="${cx + 18}" cy="${cy + 15}" r="2.5" fill="#f8e6b0" />
        </g>`;
    }
    if (type === "associate") {
      return `
        <g id="${id}">
          ${frame}
          <polygon points="${cx - 18},${cy - 10} ${cx},${cy - 22} ${cx + 18},${cy - 10}" fill="#f8e6b0" />
          <line x1="${cx - 16}" y1="${cy - 8}" x2="${cx + 16}" y2="${cy - 8}" stroke="#f8e6b0" stroke-width="2" />
          <line x1="${cx - 12}" y1="${cy - 7}" x2="${cx - 12}" y2="${cy + 14}" stroke="#f8e6b0" stroke-width="3" />
          <line x1="${cx}" y1="${cy - 7}" x2="${cx}" y2="${cy + 14}" stroke="#f8e6b0" stroke-width="3" />
          <line x1="${cx + 12}" y1="${cy - 7}" x2="${cx + 12}" y2="${cy + 14}" stroke="#f8e6b0" stroke-width="3" />
          <line x1="${cx - 17}" y1="${cy + 16}" x2="${cx + 17}" y2="${cy + 16}" stroke="#f8e6b0" stroke-width="2" />
        </g>`;
    }
    return `
      <g id="${id}">
        ${frame}
        <path d="M ${cx - 16} ${cy + 14} L ${cx - 16} ${cy - 12} Q ${cx - 3} ${cy - 5} ${cx} ${cy - 1} Q ${cx + 3} ${cy - 5} ${cx + 16} ${cy - 12} L ${cx + 16} ${cy + 14}" fill="none" stroke="#f8e6b0" stroke-width="2.5" />
        <line x1="${cx}" y1="${cy - 3}" x2="${cx}" y2="${cy + 15}" stroke="#f8e6b0" stroke-width="2" />
      </g>`;
  }

  function createImageMarkup(mappedImages) {
    return mappedImages
      .map((image, index) => {
        const centerX = image.x + image.width / 2;
        const centerY = image.y + image.height / 2;
        const clipId = `clip-${index}-${Math.random().toString(36).substr(2, 5)}`;
        const diamond = 16; // 角饰菱形边长的一半
        const totalRotate = (image.rotate || 0) + (image.userRotate || 0);
        const userScale = Number.isFinite(Number(image.userScale)) && Number(image.userScale) > 0 ? Number(image.userScale) : 1;
        const groupTransform = `translate(${centerX} ${centerY}) rotate(${totalRotate}) scale(${userScale}) translate(${-centerX} ${-centerY})`;
        return `
        <g transform="${groupTransform}" filter="drop-shadow(0px 28px 56px rgba(2,10,40,0.65))">
          <!-- 外层虚影金边 -->
          <rect x="${image.x - 6}" y="${image.y - 6}" width="${image.width + 12}" height="${image.height + 12}" rx="20" fill="none" stroke="url(#luxGold)" stroke-opacity="0.25" stroke-width="3" />
          <!-- 主金边 -->
          <rect x="${image.x - 4}" y="${image.y - 4}" width="${image.width + 8}" height="${image.height + 8}" rx="18" fill="none" stroke="url(#luxGold)" stroke-opacity="0.6" stroke-width="2.5" />
          <rect x="${image.x}" y="${image.y}" width="${image.width}" height="${image.height}" rx="16" fill="#ffffff" />
          <rect x="${image.x + 1}" y="${image.y + 1}" width="${image.width - 2}" height="${image.height - 2}" rx="15" fill="none" stroke="url(#goldStroke)" stroke-width="1.5" />
          <!-- 顶部装饰条 -->
          <rect x="${image.x + 3}" y="${image.y + 3}" width="${image.width - 6}" height="6" rx="3" fill="url(#metalGold)" opacity="0.35" />
          <!-- 四角菱形装饰 -->
          <rect x="${image.x - diamond + 2}" y="${image.y - diamond + 2}" width="${diamond * 2}" height="${diamond * 2}" fill="url(#goldFill)" transform="rotate(45 ${image.x + 2} ${image.y + 2})" stroke="#ffffff" stroke-width="1" />
          <rect x="${image.x + image.width - diamond - 2}" y="${image.y - diamond + 2}" width="${diamond * 2}" height="${diamond * 2}" fill="url(#goldFill)" transform="rotate(45 ${image.x + image.width - 2} ${image.y + 2})" stroke="#ffffff" stroke-width="1" />
          <rect x="${image.x - diamond + 2}" y="${image.y + image.height - diamond - 2}" width="${diamond * 2}" height="${diamond * 2}" fill="url(#goldFill)" transform="rotate(45 ${image.x + 2} ${image.y + image.height - 2})" stroke="#ffffff" stroke-width="1" />
          <rect x="${image.x + image.width - diamond - 2}" y="${image.y + image.height - diamond - 2}" width="${diamond * 2}" height="${diamond * 2}" fill="url(#goldFill)" transform="rotate(45 ${image.x + image.width - 2} ${image.y + image.height - 2})" stroke="#ffffff" stroke-width="1" />
          <clipPath id="${clipId}">
            <rect x="${image.x + 8}" y="${image.y + 8}" width="${image.width - 16}" height="${image.height - 16}" rx="10" />
          </clipPath>
          <image href="${escapeXml(image.imageUrl)}" x="${image.x + 8}" y="${image.y + 8}" width="${image.width - 16}" height="${image.height - 16}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
        </g>`;
      })
      .join("");
  }

  function createChipMarkup({ x, y, width, height, text, fontSize = 24, id = "" }) {
    const halfH = height / 2;
    const cx = x + width / 2;
    const cy = y + halfH;
    return `
      <g${id ? ` id="${id}"` : ""} filter="drop-shadow(0px 14px 28px rgba(0,0,0,0.6))">
        <rect x="${x - 2}" y="${y - 2}" width="${width + 4}" height="${height + 4}" rx="${halfH + 2}" fill="none" stroke="url(#luxGold)" stroke-opacity="0.4" stroke-width="2" />
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${halfH}" fill="url(#glassPanel)" stroke="url(#goldStroke)" stroke-width="1.5" />
        <rect x="${x + 2}" y="${y + 2}" width="${width - 4}" height="${height - 4}" rx="${halfH - 2}" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.8" />
        <rect x="${x + 10}" y="${cy - 7}" width="14" height="14" fill="url(#goldFill)" transform="rotate(45 ${x + 17} ${cy})" stroke="#ffffff" stroke-width="1" />
        <rect x="${x + width - 24}" y="${cy - 7}" width="14" height="14" fill="url(#goldFill)" transform="rotate(45 ${x + width - 17} ${cy})" stroke="#ffffff" stroke-width="1" />
        <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" fill="#ffffff" font-size="${fontSize}" font-weight="800" letter-spacing="3" filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.6))">${escapeXml(text)}</text>
      </g>`;
  }

  function createStageCardMarkup({
    x,
    y,
    width,
    height,
    textX,
    textY,
    text,
    fontSize = 30,
    iconType,
    iconId,
    maxLines = 2,
  }) {
    const lines = splitStageLines(text, maxLines);
    const lineCount = lines.length;
    const dynamicHeight = height + Math.max(0, lineCount - 2) * 64;
    const adjustedTextY = textY + Math.max(0, lineCount - 2) * 32;
    const textClipId = `textclip-${iconId}-${Math.random().toString(36).substr(2, 5)}`;
    // 自适应字号：根据行内最大字符数动态缩小，避免长 offer 文案被裁剪区截断。
    // 行内 <=13 字时保持基础字号；>13 字时线性缩小，下限 18px；
    // 极端长文案再按裁剪区可用宽度反推字号，并收紧字距，尽量保证 3 行内完整展示。
    const baseFontSize = lineCount >= 2 ? 24 : 28;
    const maxLineChars = lines.reduce((max, line) => Math.max(max, [...line].length), 0);
    let stageFontSize = baseFontSize;
    let stageLetterSpacing = 2.5;
    if (maxLineChars > 13) {
      const usableTextWidth = (width - 96) - 14; // 裁剪区宽度再留安全边
      const linearFontSize = baseFontSize - (maxLineChars - 13) * 0.75;
      const widthFitFontSize = usableTextWidth / maxLineChars - stageLetterSpacing;
      stageFontSize = Math.max(18, Math.min(baseFontSize, linearFontSize, widthFitFontSize));
      if (stageFontSize <= 18) {
        // 已触及字号下限仍不够时，再按可用宽度反推并收紧字距，保证 3 行内不裁切
        const fitSpacing = usableTextWidth / maxLineChars - stageFontSize;
        stageLetterSpacing = Math.max(0.5, Math.min(2.5, fitSpacing));
      } else if (stageFontSize <= 20) {
        stageLetterSpacing = 1.5;
      }
    }
    const stageLineHeight = lineCount >= 2 ? Math.round(stageFontSize + 10) : Math.round(stageFontSize + 12);
    // 长文案改用裁剪区水平中心为锚点（而非默认 textX），避免因文本中心偏左导致左侧越界裁切
    const clipCenterX = (x + 80) + (width - 96) / 2;
    const effectiveTextX = maxLineChars > 13 ? clipCenterX : textX;
    return `
      <g filter="drop-shadow(0px 16px 40px rgba(2,10,40,0.7))">
        <rect x="${x - 2}" y="${y - 2}" width="${width + 4}" height="${dynamicHeight + 4}" rx="24" fill="none" stroke="url(#luxGold)" stroke-opacity="0.5" stroke-width="3" />
        <rect x="${x}" y="${y}" width="${width}" height="${dynamicHeight}" rx="22" fill="url(#glassPanel)" stroke="url(#goldStroke)" stroke-width="1.5" />
        <rect x="${x + 2}" y="${y + 2}" width="${width - 4}" height="${dynamicHeight - 4}" rx="20" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
        <rect x="${x + height / 2 - 12}" y="${y - 12}" width="24" height="24" fill="url(#goldFill)" transform="rotate(45 ${x + height / 2} ${y})" stroke="#ffffff" stroke-width="1" />
        <rect x="${x + width - height / 2 - 12}" y="${y + dynamicHeight - 12}" width="24" height="24" fill="url(#goldFill)" transform="rotate(45 ${x + width - height / 2} ${y + dynamicHeight})" stroke="#ffffff" stroke-width="1" />
        <rect x="${x + 6}" y="${y + 18}" width="4" height="${dynamicHeight - 36}" rx="2" fill="url(#metalGold)" opacity="0.9" />
        ${createStageIconMarkup(iconId, iconType, x + 56, y + dynamicHeight / 2)}
        <clipPath id="${textClipId}">
          <rect x="${x + 80}" y="${y + 8}" width="${width - 96}" height="${dynamicHeight - 16}" rx="8" />
        </clipPath>
        <g clip-path="url(#${textClipId})">
          ${createMultilineTextMarkup(lines, effectiveTextX, adjustedTextY, { fontSize: stageFontSize, fill: "url(#luxGold)", fontWeight: "900", letterSpacing: String(stageLetterSpacing), lineHeight: stageLineHeight })}
        </g>
      </g>`;
  }

  function createFooterMarkup(config) {
    const footer = config.layoutReference.footer;
    const lineY = footer.y + 2;
    const diamondY = footer.y - 4;
    const textY = footer.y + 13;
    return `
      <g filter="drop-shadow(0px 4px 12px rgba(0,0,0,0.4))">
        <line x1="160" y1="${lineY}" x2="285" y2="${lineY}" stroke="url(#metalGold)" stroke-width="2" stroke-linecap="round" />
        <line x1="795" y1="${lineY}" x2="920" y2="${lineY}" stroke="url(#metalGold)" stroke-width="2" stroke-linecap="round" />
        <circle cx="310" cy="${lineY}" r="4" fill="url(#goldFill)" />
        <rect x="322" y="${diamondY}" width="12" height="12" fill="url(#goldFill)" transform="rotate(45 328 ${footer.y + 2})" stroke="#ffffff" stroke-width="1" />
        <rect x="746" y="${diamondY}" width="12" height="12" fill="url(#goldFill)" transform="rotate(45 752 ${footer.y + 2})" stroke="#ffffff" stroke-width="1" />
        <circle cx="770" cy="${lineY}" r="4" fill="url(#goldFill)" />
        <text x="540" y="${textY}" text-anchor="middle" fill="url(#metalGold)" font-size="28" font-weight="700" letter-spacing="5" filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.5))">${escapeXml(config.fixedCopy.footerNote)}</text>
      </g>`;
  }

  function getCertificateChipLayout(images, baseChip, layoutDef) {
    const chip = { ...baseChip };
    return chip;
  }

  function getOfferChipLayout(images, baseChip, layoutDef) {
    const chip = { ...baseChip };
    if (!layoutDef || layoutDef.length === 0) return chip;

    let targetIndex = images.findIndex(img => img.assetType === 'offer');
    if (targetIndex === -1) targetIndex = layoutDef.length - 1;
    const targetImage = layoutDef[targetIndex] || layoutDef[layoutDef.length - 1];

    // 动态将标签放置在目标图片的上方居中并产生一定遮挡（徽章效果）
    chip.x = targetImage.x + (targetImage.width - chip.width) / 2;
    chip.y = targetImage.y - 24;

    return chip;
  }

  async function createPosterSvgMarkup(record, inputConfig) {
    const config = mergeConfig(inputConfig);
    const layoutEditor = getResolvedLayoutEditorState(arguments[2]);
    const layout = config.layoutReference;
    const validation = validatePosterRecord(record, config);
    if (!validation.ok) {
      throw new Error("请先补齐标题、副标题、三阶段文案并上传 1 到 5 张图片。");
    }
    const cleaned = validation.cleaned;
    const stageLayout = getActiveStageLayout(cleaned, config);
    const exportBackgroundImage = await resolveExportBackgroundImage(config);
    const visibility = getRecordAssetVisibility(cleaned);
    const { width, height } = config.posterSize;
    const pathArea = layout.pathArea || DEFAULT_LAYOUT_REFERENCE.pathArea;
    const highSchoolCard = applyOffsetToPoint({ ...pathArea.cards.highSchool }, "preview-high-school", layoutEditor.offsets);
    const associateCard = applyOffsetToPoint({ ...pathArea.cards.associate }, "preview-associate", layoutEditor.offsets);
    const bachelorCard = applyOffsetToPoint({ ...pathArea.cards.bachelor, y: stageLayout.bachelorY }, "preview-bachelor", layoutEditor.offsets);
    const textBlocks = {
      title: { ...config.textBlocks.title },
      subtitle: { ...config.textBlocks.subtitle },
      highSchoolStage: applyOffsetToPoint({ ...config.textBlocks.highSchoolStage }, "preview-high-school", layoutEditor.offsets),
      associateStage: applyOffsetToPoint({ ...config.textBlocks.associateStage }, "preview-associate", layoutEditor.offsets),
      bachelorStage: applyOffsetToPoint({ ...config.textBlocks.bachelorStage, y: config.textBlocks.bachelorStage.y - pathArea.cards.bachelor.y + stageLayout.bachelorY }, "preview-bachelor", layoutEditor.offsets),
    };
    const pathCenterX = Math.round(highSchoolCard.x + highSchoolCard.width / 2);
    const leftLineStartX = Math.round(pathCenterX - 300);
    const leftLineEndX = Math.round(pathCenterX - 180);
    const rightLineStartX = Math.round(pathCenterX + 180);
    const rightLineEndX = Math.round(pathCenterX + 300);
    const leftDiamondX = Math.round(pathCenterX - 160);
    const rightDiamondX = Math.round(pathCenterX + 150);
    const titleTextY = pathArea.titleLineY + 8;
    const arrowStemX = Math.round(pathCenterX - 11);
    const arrowTipX = pathCenterX;
    const firstArrowStemY = highSchoolCard.y + highSchoolCard.height + 10;
    const firstArrowBaseY = associateCard.y - 22;
    const firstArrowRectH = Math.max(20, firstArrowBaseY - firstArrowStemY);
    const secondArrowStemY = associateCard.y + associateCard.height + 10;
    const secondArrowBaseY = bachelorCard.y - 22;
    const secondArrowRectH = Math.max(20, secondArrowBaseY - secondArrowStemY);
    const thirdArrowStemY = highSchoolCard.y + highSchoolCard.height + 10;
    const thirdArrowBaseY = bachelorCard.y - 22;
    const thirdArrowRectH = Math.max(20, thirdArrowBaseY - thirdArrowStemY);

    const imageLayoutDef = resolvePosterImageLayout(cleaned.images.length, config);
    const mappedImages = mapImagesToPosterSlots(cleaned.images, imageLayoutDef).map((image, index) =>
      applyOffsetToPoint(
        { ...image },
        ["preview-primary-image", "preview-secondary-image-a", "preview-secondary-image-b", "preview-secondary-image-c", "preview-secondary-image-d"][index],
        layoutEditor.offsets
      )
    );
    const certChipLayout = applyOffsetToPoint(
      getCertificateChipLayout(cleaned.images, layout.imageArea.certificateChip, imageLayoutDef),
      "preview-certificate-chip",
      layoutEditor.offsets
    );
    const offerChipLayout = applyOffsetToPoint(
      getOfferChipLayout(cleaned.images, layout.imageArea.offerChip, imageLayoutDef),
      "preview-offer-chip",
      layoutEditor.offsets
    );
    const subtitlePillLayout = applyOffsetToPoint(
      { ...pathArea.pill },
      "preview-subtitle-pill",
      layoutEditor.offsets
    );

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="'Noto Serif SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif">
  <defs>
    <linearGradient id="goldStroke" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fffbe6" />
      <stop offset="18%" stop-color="#fef0c4" />
      <stop offset="25%" stop-color="#f6e2a8" />
      <stop offset="42%" stop-color="#e4c670" />
      <stop offset="50%" stop-color="#d4a94e" />
      <stop offset="58%" stop-color="#e4c670" />
      <stop offset="75%" stop-color="#f6e2a8" />
      <stop offset="82%" stop-color="#fef0c4" />
      <stop offset="100%" stop-color="#fffbe6" />
    </linearGradient>
    <linearGradient id="panelBlue" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0e3c9e" />
      <stop offset="50%" stop-color="#07205a" />
      <stop offset="100%" stop-color="#031036" />
    </linearGradient>
    <linearGradient id="glassPanel" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0c348a" stop-opacity="0.88" />
      <stop offset="40%" stop-color="#07205a" stop-opacity="0.94" />
      <stop offset="100%" stop-color="#020e30" stop-opacity="0.98" />
    </linearGradient>
    <linearGradient id="goldFill" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fffef8" />
      <stop offset="20%" stop-color="#fff3c8" />
      <stop offset="40%" stop-color="#d4a94e" />
      <stop offset="65%" stop-color="#c49532" />
      <stop offset="85%" stop-color="#d4a94e" />
      <stop offset="100%" stop-color="#a47824" />
    </linearGradient>
    <radialGradient id="vignetteLayer" cx="50%" cy="50%" r="60%">
      <stop offset="58%" stop-color="#000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000" stop-opacity="0.42" />
    </radialGradient>
    <linearGradient id="metalGold" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#fffef8" />
      <stop offset="15%" stop-color="#fff3c8" />
      <stop offset="35%" stop-color="#f6e2a8" />
      <stop offset="55%" stop-color="#d4a94e" />
      <stop offset="75%" stop-color="#d4a94e" />
      <stop offset="100%" stop-color="#a47824" />
    </linearGradient>
    <linearGradient id="titleHighlight" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.24" />
      <stop offset="100%" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="luxGold" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fffef5" />
      <stop offset="10%" stop-color="#ffefb8" />
      <stop offset="25%" stop-color="#e4c670" />
      <stop offset="45%" stop-color="#fef0c4" />
      <stop offset="50%" stop-color="#d4a94e" />
      <stop offset="55%" stop-color="#fef0c4" />
      <stop offset="75%" stop-color="#e4c670" />
      <stop offset="90%" stop-color="#ffefb8" />
      <stop offset="100%" stop-color="#a47824" />
    </linearGradient>
    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#d6dae5" />
  <image href="${escapeXml(exportBackgroundImage)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
  <rect x="0" y="0" width="${width}" height="${height}" fill="#041d56" opacity="0.1" />
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#vignetteLayer)" opacity="1" />
  <!-- 标题区以上区域的机构名称、标语等已由固定背景图提供，不再重复渲染以免产生重影 -->
  <polygon points="${layout.titleFrame.x - 32},${layout.titleFrame.y - 12} ${layout.titleFrame.x},${layout.titleFrame.y + 10} ${layout.titleFrame.x},${layout.titleFrame.y + layout.titleFrame.height - 10} ${layout.titleFrame.x - 32},${layout.titleFrame.y + layout.titleFrame.height + 12} ${layout.titleFrame.x - 24},${layout.titleFrame.y + layout.titleFrame.height / 2}" fill="url(#panelBlue)" stroke="url(#goldStroke)" stroke-width="4" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.3))" />
  <polygon points="${layout.titleFrame.x + layout.titleFrame.width + 32},${layout.titleFrame.y - 12} ${layout.titleFrame.x + layout.titleFrame.width},${layout.titleFrame.y + 10} ${layout.titleFrame.x + layout.titleFrame.width},${layout.titleFrame.y + layout.titleFrame.height - 10} ${layout.titleFrame.x + layout.titleFrame.width + 32},${layout.titleFrame.y + layout.titleFrame.height + 12} ${layout.titleFrame.x + layout.titleFrame.width + 24},${layout.titleFrame.y + layout.titleFrame.height / 2}" fill="url(#panelBlue)" stroke="url(#goldStroke)" stroke-width="4" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.3))" />
  <rect x="${layout.titleFrame.x - 24}" y="${layout.titleFrame.y + layout.titleFrame.height / 2 - 24}" width="48" height="48" fill="url(#goldFill)" transform="rotate(45 ${layout.titleFrame.x} ${layout.titleFrame.y + layout.titleFrame.height / 2})" stroke="#ffffff" stroke-width="2" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.4))" />
  <rect x="${layout.titleFrame.x + layout.titleFrame.width - 24}" y="${layout.titleFrame.y + layout.titleFrame.height / 2 - 24}" width="48" height="48" fill="url(#goldFill)" transform="rotate(45 ${layout.titleFrame.x + layout.titleFrame.width} ${layout.titleFrame.y + layout.titleFrame.height / 2})" stroke="#ffffff" stroke-width="2" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.4))" />
  
  <rect x="${layout.titleFrame.x - 14}" y="${layout.titleFrame.y - 24}" width="${layout.titleFrame.width + 28}" height="${layout.titleFrame.height + 48}" rx="18" fill="none" stroke="url(#goldStroke)" stroke-opacity="0.55" stroke-width="3" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.3))" />
  <rect x="${layout.titleFrame.x}" y="${layout.titleFrame.y}" width="${layout.titleFrame.width}" height="${layout.titleFrame.height}" rx="18" fill="url(#panelBlue)" stroke="url(#luxGold)" stroke-width="8" filter="drop-shadow(0px 10px 24px rgba(0,0,0,0.4))" />
  <rect x="${layout.titleFrame.innerX}" y="${layout.titleFrame.innerY}" width="${layout.titleFrame.innerWidth}" height="${layout.titleFrame.innerHeight}" rx="12" fill="none" stroke="url(#goldStroke)" stroke-opacity="0.18" stroke-width="1.5" />
  <rect x="${layout.titleFrame.x + 4}" y="${layout.titleFrame.y + 4}" width="${layout.titleFrame.width - 8}" height="${Math.round(layout.titleFrame.height * 0.35)}" rx="14" fill="url(#titleHighlight)" />
  <text x="${textBlocks.title.x}" y="${textBlocks.title.y}" text-anchor="middle" fill="url(#luxGold)" font-size="96" font-weight="900" letter-spacing="14" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.6))">${escapeXml(cleaned.title)}</text>
  ${cleaned.pathBadge ? `<line x1="${leftLineStartX}" y1="${pathArea.titleLineY}" x2="${leftLineEndX}" y2="${pathArea.titleLineY}" stroke="url(#metalGold)" stroke-width="2.5" stroke-linecap="round" />
  <line x1="${rightLineStartX}" y1="${pathArea.titleLineY}" x2="${rightLineEndX}" y2="${pathArea.titleLineY}" stroke="url(#metalGold)" stroke-width="2.5" stroke-linecap="round" />
  <rect x="${leftDiamondX}" y="${pathArea.titleLineY - 7}" width="12" height="12" fill="url(#goldFill)" transform="rotate(45 ${leftDiamondX + 6} ${pathArea.titleLineY - 1})" stroke="#ffffff" stroke-width="1.2" />
  <rect x="${rightDiamondX}" y="${pathArea.titleLineY - 7}" width="12" height="12" fill="url(#goldFill)" transform="rotate(45 ${rightDiamondX + 6} ${pathArea.titleLineY - 1})" stroke="#ffffff" stroke-width="1.2" />
  <text x="${pathCenterX}" y="${titleTextY}" text-anchor="middle" fill="url(#metalGold)" font-size="32" font-weight="900" letter-spacing="3" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">${escapeXml(cleaned.pathBadge)}</text>` : ""}
  ${(!isElementHiddenByUser(layoutEditor, "preview-subtitle-pill") && cleaned.subtitle) ? createChipMarkup({ ...subtitlePillLayout, text: cleaned.subtitle, fontSize: 22, id: "subtitle-pill" }) : ""}
  ${isElementHiddenByUser(layoutEditor, "preview-high-school") ? "" : createStageCardMarkup({
      x: highSchoolCard.x,
      y: highSchoolCard.y,
      width: highSchoolCard.width,
      height: highSchoolCard.height,
      textX: textBlocks.highSchoolStage.x,
      textY: textBlocks.highSchoolStage.y,
      text: cleaned.highSchoolStage,
      iconType: "high-school",
      iconId: "stage-icon-high-school",
    })}
  ${!isElementHiddenByUser(layoutEditor, "preview-associate") && !stageLayout.hideAssociate ? createStageCardMarkup({
      x: associateCard.x,
      y: associateCard.y,
      width: associateCard.width,
      height: associateCard.height,
      textX: textBlocks.associateStage.x,
      textY: textBlocks.associateStage.y,
      text: cleaned.associateStage,
      fontSize: 28,
      iconType: "associate",
      iconId: "stage-icon-associate",
    }) : ""}
  ${isElementHiddenByUser(layoutEditor, "preview-bachelor") ? "" : createStageCardMarkup({
      x: bachelorCard.x,
      y: bachelorCard.y,
      width: bachelorCard.width,
      height: bachelorCard.height,
      maxLines: 3,
      textX: textBlocks.bachelorStage.x,
      textY: textBlocks.bachelorStage.y,
      text: cleaned.bachelorStage,
      fontSize: 28,
      iconType: "bachelor",
      iconId: "stage-icon-bachelor",
    })}
  <!-- 箭头在所有卡片之后渲染，保证不被遮挡 -->
  ${!isElementHiddenByUser(layoutEditor, "preview-high-school") && !isElementHiddenByUser(layoutEditor, "preview-associate") && stageLayout.showArrow1 ? `
    <rect x="${arrowStemX}" y="${firstArrowStemY}" width="22" height="${firstArrowRectH}" rx="7" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
    <polygon points="${arrowTipX},${firstArrowBaseY + 52} ${arrowTipX - 42},${firstArrowBaseY} ${arrowTipX + 42},${firstArrowBaseY}" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
  ` : ""}
  ${!isElementHiddenByUser(layoutEditor, "preview-associate") && !isElementHiddenByUser(layoutEditor, "preview-bachelor") && stageLayout.showArrow2 ? `
    <rect x="${arrowStemX}" y="${secondArrowStemY}" width="22" height="${secondArrowRectH}" rx="7" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
    <polygon points="${arrowTipX},${secondArrowBaseY + 52} ${arrowTipX - 42},${secondArrowBaseY} ${arrowTipX + 42},${secondArrowBaseY}" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
  ` : ""}
  ${stageLayout.showArrowHsToBa ? `
    <rect x="${arrowStemX}" y="${thirdArrowStemY}" width="22" height="${thirdArrowRectH}" rx="7" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
    <polygon points="${arrowTipX},${thirdArrowBaseY + 52} ${arrowTipX - 42},${thirdArrowBaseY} ${arrowTipX + 42},${thirdArrowBaseY}" fill="url(#goldFill)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
  ` : ""}
  ${createImageMarkup(mappedImages)}
  ${visibility.showCertificateChip && !isElementHiddenByUser(layoutEditor, "preview-certificate-chip") ? createChipMarkup({ ...certChipLayout, text: config.fixedCopy.imageLabel, fontSize: 18 }) : ""}
  ${visibility.showOfferChip && !isElementHiddenByUser(layoutEditor, "preview-offer-chip") ? createChipMarkup({ ...offerChipLayout, text: "真实Offer", fontSize: 17, id: "offer-chip" }) : ""}
  ${createFooterMarkup(config)}
</svg>`.trim();
  }

  async function exportPoster(record, inputConfig, layoutEditorState) {
    const cleaned = createNormalizedRecord(record);
    const fileStem = cleaned.studentId || "student-case";
    return {
      fileName: `${fileStem}-poster.svg`,
      content: await createPosterSvgMarkup(cleaned, inputConfig, layoutEditorState),
      mimeType: "image/svg+xml",
    };
  }

  function parseCsvLine(line) {
    const cells = [];
    let current = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const nextChar = line[index + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (char === "," && !insideQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  }

  function buildBatchRecordsFromCsv(csvText) {
    const lines = String(csvText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const headers = parseCsvLine(lines[0]);

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row = headers.reduce((accumulator, header, index) => {
        accumulator[header] = values[index] || "";
        return accumulator;
      }, {});

      return {
        studentId: sanitizeText(row.studentId),
        title: sanitizeText(row.title),
        subtitle: sanitizeText(row.subtitle),
        highSchoolStage: sanitizeText(row.highSchoolStage),
        associateStage: sanitizeText(row.associateStage),
        bachelorStage: sanitizeText(row.bachelorStage),
        imageNames: [row.image1, row.image2, row.image3, row.image4, row.image5]
          .map(sanitizeText)
          .filter(Boolean),
        images: [],
        missingImages: [],
      };
    });
  }

  function matchRecordImages(records, imageFiles) {
    const imageMap = new Map(
      normalizeImages(imageFiles).map((image) => [sanitizeText(image.name), image])
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
      const normalizedRecord = createNormalizedRecord({
        ...record,
        certificateImages,
        offerImages,
        images: matchedImages,
      });

      return {
        ...record,
        ...normalizedRecord,
        missingImages,
      };
    });
  }

  function buildBatchRecordsFromTable(rows, headers) {
    const FIELD_MAP = {
      "学员编号": "studentId",
      "studentId": "studentId",
      "标题": "title",
      "title": "title",
      "副标题": "subtitle",
      "subtitle": "subtitle",
      "高中阶段/学士阶段": "highSchoolStage",
      "高中阶段": "highSchoolStage",
      "highSchoolStage": "highSchoolStage",
      "副学士阶段": "associateStage",
      "associateStage": "associateStage",
      "学士阶段/硕士阶段": "bachelorStage",
      "学士阶段": "bachelorStage",
      "bachelorStage": "bachelorStage",
      "图片1": "image1",
      "image1": "image1",
      "图片2": "image2",
      "image2": "image2",
      "图片3": "image3",
      "image3": "image3",
      "图片4": "image4",
      "image4": "image4",
      "图片5": "image5",
      "image5": "image5",
    };
    const normalizedKey = (header) => FIELD_MAP[sanitizeText(header)] || sanitizeText(header);

    return rows.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        const key = normalizedKey(header);
        if (key) {
          record[key] = (row[index] || "").toString();
        }
      });
      const imageNames = ["image1", "image2", "image3", "image4", "image5"]
        .map((key) => sanitizeText(record[key] || ""))
        .filter(Boolean);
      return {
        studentId: sanitizeText(record.studentId),
        title: sanitizeText(record.title),
        subtitle: sanitizeText(record.subtitle),
        highSchoolStage: sanitizeText(record.highSchoolStage),
        associateStage: sanitizeText(record.associateStage),
        bachelorStage: sanitizeText(record.bachelorStage),
        imageNames,
        images: [],
        missingImages: [],
      };
    });
  }

  function getActiveStageLayout(record, config) {
    const layout = (config && config.layoutReference) || DEFAULT_LAYOUT_REFERENCE;
    const pathCards = (layout.pathArea && layout.pathArea.cards) || DEFAULT_LAYOUT_REFERENCE.pathArea.cards;
    const hasAssociate = !!(record?.associateStage || "").trim();

    if (hasAssociate) {
      return {
        hideAssociate: false,
        bachelorY: pathCards.bachelor.y,
        showArrow1: true,
        showArrow2: true,
        showArrowHsToBa: false,
      };
    }

    return {
      hideAssociate: true,
      bachelorY: pathCards.associate.y,
      showArrow1: false,
      showArrow2: false,
      showArrowHsToBa: true,
    };
  }

  function classifyImageByKeyword(filename) {
    const lower = (filename || "").toLowerCase();
    if (/offer|录取|admission|offre/.test(lower)) return "offer";
    if (/成绩单|证书|cert|transcript/.test(lower)) return "certificate";
    return "certificate";
  }

  function autoMatchImages(studentId, imageFiles) {
    const normalized = normalizeImages(imageFiles);
    return normalized.filter((image) => {
      const name = (image.name || "").toLowerCase();
      const id = (studentId || "").toLowerCase();
      if (!id) return false;
      if (name === id) return true;
      if (!name.startsWith(id)) return false;
      const nextChar = name[id.length];
      return nextChar === "-" || nextChar === "_" || nextChar === ".";
    }).map((image) => {
      const assetType = classifyImageByKeyword(image.name);
      return { ...image, assetType };
    });
  }

  function autoMatchAllRecords(records, imagePool) {
    return (records || []).map((record) => {
      const matchedImages = autoMatchImages(record.studentId, imagePool);
      const certificateImages = matchedImages.filter(img => img.assetType === "certificate");
      const offerImages = matchedImages.filter(img => img.assetType === "offer");
      const normalizedRecord = createNormalizedRecord({
        ...record,
        certificateImages,
        offerImages,
        images: matchedImages,
      });
      const missingImages = matchedImages.length === 0 ? ["未匹配到任何图片"] : [];
      return { ...record, ...normalizedRecord, missingImages };
    });
  }

  async function exportBatchPosters(records, inputConfig, layoutEditorState) {
    return Promise.all(
      (records || []).map(async (record, index) => {
        try {
          const output = await exportPoster(record, inputConfig, layoutEditorState);
          if (!record.studentId) {
            output.fileName = `student-case-${index + 1}-poster.svg`;
          }
          return {
            studentId: record.studentId,
            ok: true,
            output,
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

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function setStatus(elements, kind, message) {
    if (!elements?.statusBox) {
      return;
    }
    elements.statusBox.hidden = !message;
    elements.statusBox.dataset.kind = kind || "info";
    setText(elements.statusText, message || "");
  }

  function renderFieldErrors(elements, errors, visible) {
    Object.entries(elements?.errorMap || {}).forEach(([key, element]) => {
      if (!element) {
        return;
      }
      const message = visible ? errors[key] || "" : "";
      element.hidden = !message;
      element.textContent = message;
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("图片读取失败，请重新选择文件。"));
      reader.readAsDataURL(file);
    });
  }

  async function downloadSvgAsPng(fileName, svgContent) {
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    try {
      const image = new Image();
      const loaded = new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      image.src = url;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = image.width || 1080;
      canvas.height = image.height || 1920;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = fileName.replace(/\.svg$/i, ".png");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function downloadTextFile(fileName, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  function createDefaultState() {
    return {
      manualRecord: {
        studentId: "",
        title: "",
        subtitle: "",
        pathBadge: "",
        highSchoolStage: "",
        associateStage: "",
        bachelorStage: "",
        certificateImages: [],
        offerImages: [],
        images: [],
      },
      batchRecords: [],
      batchImagePool: [],
      activeBatchIndex: null,
      generatedResults: [],
      layoutEditor: createDefaultLayoutEditorState(),
      brandAssetsMessage: "",
      brandAssetsAvailable: null,
      showErrors: false,
    };
  }

  function setManualRecordImages(state) {
    state.manualRecord.images = buildDerivedRecordImages(state.manualRecord);
  }

  function renderTypedImageList(listElement, images, label, onRemove) {
    if (!listElement) {
      return;
    }

    listElement.innerHTML = "";
    images.forEach((image, index) => {
      const item = document.createElement("li");
      item.className = "image-item";

      const thumb = document.createElement("img");
      thumb.src = image.previewUrl;
      thumb.alt = image.name || `${label} ${index + 1}`;

      const meta = document.createElement("div");
      meta.className = "image-meta";
      meta.innerHTML = `<strong>${image.name || `${label} ${index + 1}`}</strong><span>${label}</span>`;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "ghost-button";
      removeButton.textContent = "删除";
      removeButton.addEventListener("click", () => onRemove(index));

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(removeButton);
      listElement.appendChild(item);
    });
  }

  function renderManualImageList(elements, state) {
    renderTypedImageList(elements.certificateImageList, state.manualRecord.certificateImages, "成绩单 / 证书", (index) => {
      state.manualRecord.certificateImages = state.manualRecord.certificateImages.filter(
        (_, imageIndex) => imageIndex !== index
      );
      setManualRecordImages(state);
      refreshUI(elements, state, globalScope.POSTER_TOOL_CONFIG || {});
    });

    renderTypedImageList(elements.offerImageList, state.manualRecord.offerImages, "Offer", (index) => {
      state.manualRecord.offerImages = state.manualRecord.offerImages.filter((_, imageIndex) => imageIndex !== index);
      setManualRecordImages(state);
      refreshUI(elements, state, globalScope.POSTER_TOOL_CONFIG || {});
    });
  }

  function renderBatchRecords(elements, state) {
    if (!elements.batchList) {
      return;
    }

    elements.batchList.innerHTML = "";
    state.batchRecords.forEach((record, index) => {
      const item = document.createElement("li");
      item.className = "batch-item";
      if (state.activeBatchIndex === index) {
        item.classList.add("preview-active");
      }
      item.dataset.studentId = record.studentId || "";

      const title = document.createElement("strong");
      title.textContent = record.studentId || record.title || "未命名记录";

      const meta = document.createElement("span");
      const hasImages = (record.images || []).length > 0;
      const hasMissing = record.missingImages?.length && record.missingImages[0] !== "未匹配到任何图片";
      if (hasMissing) {
        meta.textContent = `缺图：${record.missingImages.join("、")}`;
        item.dataset.state = "error";
      } else if (hasImages) {
        meta.textContent = `已匹配 ${(record.images || []).length} 张图片`;
        item.dataset.state = "ready";
      } else {
        meta.textContent = "待匹配图片";
        item.dataset.state = "pending";
      }

      item.addEventListener("click", () => {
        state.activeBatchIndex = index;
        state.manualRecord = {
          ...state.manualRecord,
          studentId: record.studentId,
          title: record.title,
          subtitle: record.subtitle,
          pathBadge: record.pathBadge || "",
          highSchoolStage: record.highSchoolStage,
          associateStage: record.associateStage,
          bachelorStage: record.bachelorStage,
          certificateImages: record.certificateImages || [],
          offerImages: record.offerImages || [],
        };
        const cleaned = createNormalizedRecord(state.manualRecord);
        state.manualRecord = { ...state.manualRecord, ...cleaned };
        setManualRecordImages(state);
        refreshUI(elements, state, globalScope.POSTER_TOOL_CONFIG || {});
        const previewCard = document.querySelector("#poster-preview");
        if (previewCard && typeof previewCard.scrollIntoView === "function") {
          previewCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      item.appendChild(title);
      item.appendChild(meta);
      elements.batchList.appendChild(item);
    });
  }

  function setPreviewSlotState(slot, image) {
    if (!slot) {
      return;
    }

    const img = typeof slot.querySelector === "function" ? slot.querySelector("img") : null;
    slot.dataset = slot.dataset || {};
    slot.dataset.empty = image ? "false" : "true";
    slot.dataset.loading = "false";
    slot.hidden = !image;

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

  function getLayoutDragOffsets() {
    return getResolvedLayoutEditorState().offsets;
  }

  function setLayoutDragOffsets(offsets) {
    const nextState = getResolvedLayoutEditorState();
    nextState.offsets = cloneOffsetsMap(offsets);
    syncGlobalLayoutEditorState(nextState);
  }

  function getCanvasScale(previewElement) {
    if (!previewElement || typeof document === "undefined") return 1;
    const rect = previewElement.getBoundingClientRect();
    return 1080 / (rect.width || 1080);
  }

  function applyDragOffsetsToElement(el, elementId, defaultX, defaultY, defaultW, defaultH) {
    if (!el || !el.style) return;
    // 拖拽进行中时不覆盖 JS 正在设置的 inline 位置
    if (dragSession.active) return;
    el.style.position = "absolute";
    const offsets = getLayoutDragOffsets();
    const off = offsets[elementId] || { dx: 0, dy: 0 };
    el.style.left = `calc(${defaultX + (off.dx || 0)} / var(--canvas-width) * 100%)`;
    el.style.top = `calc(${defaultY + (off.dy || 0)} / var(--canvas-height) * 100%)`;
    if (defaultW != null) {
      el.style.width = `calc(${defaultW} / var(--canvas-width) * 100%)`;
    }
    if (defaultH != null) {
      el.style.height = `calc(${defaultH} / var(--canvas-height) * 100%)`;
    }
  }

  const MAX_BATCH_RECORDS = 50;

  const DRAGGABLE_REGISTRY = {
    "preview-high-school": { defaultX: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.highSchool.x, defaultY: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.highSchool.y },
    "preview-associate": { defaultX: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.associate.x, defaultY: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.associate.y },
    "preview-bachelor": { defaultX: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.bachelor.x, defaultY: DEFAULT_LAYOUT_REFERENCE.pathArea.cards.bachelor.y },
    "preview-certificate-chip": { defaultX: DEFAULT_LAYOUT_REFERENCE.imageArea.certificateChip.x, defaultY: DEFAULT_LAYOUT_REFERENCE.imageArea.certificateChip.y },
    "preview-offer-chip": { defaultX: DEFAULT_LAYOUT_REFERENCE.imageArea.offerChip.x, defaultY: DEFAULT_LAYOUT_REFERENCE.imageArea.offerChip.y },
    "preview-subtitle-pill": { defaultX: DEFAULT_LAYOUT_REFERENCE.pathArea.pill.x, defaultY: DEFAULT_LAYOUT_REFERENCE.pathArea.pill.y },
  };

  const dragSession = {
    active: false,
    elementId: null,
    pointerId: null,
    startMouseX: 0,
    startMouseY: 0,
    startLeft: 0,
    startTop: 0,
    defaultX: 0,
    defaultY: 0,
    scale: 1,
    currentDeltaDx: 0,
    currentDeltaDy: 0,
    _rafId: null,
  };

  function handleDragStart(event, elementId, defaultX, defaultY) {
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const previewCard = document.querySelector("#poster-preview");
    const scale = getCanvasScale(previewCard);
    const offsets = getLayoutDragOffsets();
    const off = offsets[elementId] || { dx: 0, dy: 0 };
    dragSession.active = true;
    dragSession.elementId = elementId;
    dragSession.startMouseX = clientX;
    dragSession.startMouseY = clientY;
    dragSession.startLeft = defaultX + (off.dx || 0);
    dragSession.startTop = defaultY + (off.dy || 0);
    dragSession.defaultX = defaultX;
    dragSession.defaultY = defaultY;
    dragSession.scale = scale;
    dragSession.pointerId = event.pointerId;
    dragSession.currentDeltaDx = 0;
    dragSession.currentDeltaDy = 0;
    const el = document.getElementById(elementId);
    if (el) {
      el.classList.add("dragging");
      el.style.touchAction = "none";
      if (el.setPointerCapture) el.setPointerCapture(event.pointerId);
    }
  }

  function handleDragMove(event) {
    if (!dragSession.active) return;
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const dx = (clientX - dragSession.startMouseX) / dragSession.scale;
    const dy = (clientY - dragSession.startMouseY) / dragSession.scale;
    dragSession.currentDeltaDx = dx;
    dragSession.currentDeltaDy = dy;
    // requestAnimationFrame 节流：避免每次 pointermove 都触发 DOM 回流
    if (typeof requestAnimationFrame !== "undefined") {
      if (dragSession._rafId != null) return;
      dragSession._rafId = requestAnimationFrame(() => {
        dragSession._rafId = null;
        if (!dragSession.active) return;
        applyDragMoveToElement();
      });
    } else {
      applyDragMoveToElement();
    }
  }

  function applyDragMoveToElement() {
    if (!dragSession.active) return;
    const el = document.getElementById(dragSession.elementId);
    if (el && el.style) {
      el.style.left = `calc(${dragSession.startLeft + dragSession.currentDeltaDx} / var(--canvas-width) * 100%)`;
      el.style.top = `calc(${dragSession.startTop + dragSession.currentDeltaDy} / var(--canvas-height) * 100%)`;
    }
  }

  function handleDragEnd() {
    if (!dragSession.active) return;
    if (dragSession._rafId != null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(dragSession._rafId);
      dragSession._rafId = null;
    }
    const el = document.getElementById(dragSession.elementId);
    if (el) {
      el.classList.remove("dragging");
      el.style.touchAction = "";
      if (el.releasePointerCapture && dragSession.pointerId != null) {
        el.releasePointerCapture(dragSession.pointerId);
      }
      const nextEditorState = getResolvedLayoutEditorState();
      const currentOff = nextEditorState.offsets[dragSession.elementId] || { dx: 0, dy: 0, scale: 1, rotate: 0 };
      nextEditorState.offsets[dragSession.elementId] = {
        dx: Math.round((currentOff.dx || 0) + (dragSession.currentDeltaDx || 0)),
        dy: Math.round((currentOff.dy || 0) + (dragSession.currentDeltaDy || 0)),
        scale: Number.isFinite(Number(currentOff.scale)) && Number(currentOff.scale) > 0 ? Number(currentOff.scale) : 1,
        rotate: Number(currentOff.rotate) || 0,
      };
      syncGlobalLayoutEditorState(nextEditorState);
    }
    dragSession.active = false;
    dragSession.elementId = null;
    dragSession.pointerId = null;
  }

  function renderPreview(elements, state, config) {
    if (!elements.previewCard) {
      return;
    }

    applyPreviewLayout(elements, config);
    const layoutEditor = getResolvedLayoutEditorState(state.layoutEditor);
    state.layoutEditor = cloneLayoutEditorState(layoutEditor);
    syncGlobalLayoutEditorState(layoutEditor);
    const cleanedRecord = createNormalizedRecord(state.manualRecord);
    const visibility = getRecordAssetVisibility(cleanedRecord);
    const pathArea = config.layoutReference?.pathArea || DEFAULT_LAYOUT_REFERENCE.pathArea;
    const pathCards = pathArea.cards || DEFAULT_LAYOUT_REFERENCE.pathArea.cards;
    const stageLayout = getActiveStageLayout(state.manualRecord, config);
    const previewHighSchoolCard =
      elements.previewHighSchoolCard || (typeof document !== "undefined" ? document.getElementById("preview-high-school") : null);
    const previewAssociateCard =
      elements.previewAssociateCard || (typeof document !== "undefined" ? document.getElementById("preview-associate") : null);
    const previewBachelorCard =
      elements.previewBachelorCard || (typeof document !== "undefined" ? document.getElementById("preview-bachelor") : null);

    const assets = getBrandAssetStatus(config);
    if (elements.previewBackgroundImage) {
      if (assets.backgroundImage) {
        elements.previewBackgroundImage.src = assets.backgroundImage;
      } else {
        elements.previewBackgroundImage.removeAttribute("src");
      }
    }
    if (elements.previewLogoImage) {
      if (assets.logoImage) {
        elements.previewLogoImage.src = assets.logoImage;
        elements.previewLogoImage.hidden = false;
      } else {
        elements.previewLogoImage.hidden = true;
        elements.previewLogoImage.removeAttribute("src");
      }
    }
    setText(elements.previewOrgNameCn, config.fixedCopy.organizationNameCn || "香港湾区教育咨询促进会");
    // 机构英文名称已由固定背景图提供，预览中不重复显示
    if (elements.previewOrgNameEn) {
      elements.previewOrgNameEn.hidden = true;
    }

    setText(elements.previewTitle, state.manualRecord.title || "2026学员成功案例");
    // 方案 A：副标题统一只通过路径区药丸（subtitle-pill）渲染，隐藏标题下方的旧副标题文本，
    // 确保预览与正式导出仅展示一次副标题，渲染逻辑完全一致。
    if (elements.previewSubtitle) {
      elements.previewSubtitle.hidden = true;
    }
    setText(elements.previewPathBadge, state.manualRecord.pathBadge || "");
    if (elements.previewSubtitlePill) {
      const subtitleText = state.manualRecord.subtitle || "";
      elements.previewSubtitlePill.textContent = subtitleText;
      // 仅当用户填写了副标题且未手动隐藏时才展示药丸
      elements.previewSubtitlePill.hidden = !subtitleText || isElementHiddenByUser(layoutEditor, "preview-subtitle-pill");
    }
    setText(elements.previewHighSchool, splitStageLines(state.manualRecord.highSchoolStage || "高中阶段/学士阶段文案").join("\n"));
    setText(elements.previewAssociate, splitStageLines(state.manualRecord.associateStage || "副学士阶段文案").join("\n"));
    const bachelorPreviewLines = splitStageLines(state.manualRecord.bachelorStage || "学士阶段/硕士阶段文案", 3);
    setText(elements.previewBachelor, bachelorPreviewLines.join("\n"));

    const bachelorPreviewHeight = pathCards.bachelor.height + Math.max(0, bachelorPreviewLines.length - 2) * 64;

    applyDragOffsetsToElement(
      previewHighSchoolCard,
      "preview-high-school",
      pathCards.highSchool.x,
      pathCards.highSchool.y,
      pathCards.highSchool.width,
      pathCards.highSchool.height
    );
    if (!stageLayout.hideAssociate) {
      applyDragOffsetsToElement(
        previewAssociateCard,
        "preview-associate",
        pathCards.associate.x,
        pathCards.associate.y,
        pathCards.associate.width,
        pathCards.associate.height
      );
    }
    applyDragOffsetsToElement(
      previewBachelorCard,
      "preview-bachelor",
      pathCards.bachelor.x,
      stageLayout.bachelorY,
      pathCards.bachelor.width,
      bachelorPreviewHeight
    );
    if (previewHighSchoolCard) {
      previewHighSchoolCard.hidden = isElementHiddenByUser(layoutEditor, "preview-high-school");
    }
    if (previewAssociateCard) {
      previewAssociateCard.hidden = isElementHiddenByUser(layoutEditor, "preview-associate") || stageLayout.hideAssociate;
    }
    if (previewBachelorCard) {
      previewBachelorCard.hidden = isElementHiddenByUser(layoutEditor, "preview-bachelor");
    }

    if (elements.previewCertificateChip) {
      elements.previewCertificateChip.hidden =
        !visibility.showCertificateChip || isElementHiddenByUser(layoutEditor, "preview-certificate-chip");
    }
    if (elements.previewOfferChip) {
      elements.previewOfferChip.hidden =
        !visibility.showOfferChip || isElementHiddenByUser(layoutEditor, "preview-offer-chip");
    }

    // 定位路径标题行（副学士升本科路径）和箭头 — 与 SVG 导出坐标一致
    if (typeof document !== "undefined") {
      const badgeRow = document.querySelector(".path-title-row");
      const hsOff = (layoutEditor.offsets || {})["preview-high-school"] || { dx: 0, dy: 0 };
      const asOff = (layoutEditor.offsets || {})["preview-associate"] || { dx: 0, dy: 0 };
      const baOff = (layoutEditor.offsets || {})["preview-bachelor"] || { dx: 0, dy: 0 };
      const hsY = pathCards.highSchool.y + (hsOff.dy || 0);
      const asY = pathCards.associate.y + (asOff.dy || 0);
      const baY = stageLayout.bachelorY + (baOff.dy || 0);
      const pathCenterX = pathCards.highSchool.x + pathCards.highSchool.width / 2 + (hsOff.dx || 0);
      if (badgeRow && badgeRow.style) {
        badgeRow.style.top = `calc(${pathArea.titleLineY} / var(--canvas-height) * 100%)`;
        // 仅当用户填写路径标签时才展示该行（含金色分隔线与菱形装饰），与导出逻辑一致
        badgeRow.style.display = state.manualRecord.pathBadge ? "" : "none";
      }
      const arrow1 = document.getElementById("arrow-1");
      const arrow2 = document.getElementById("arrow-2");
      const arrowHsToBa = document.getElementById("arrow-hs-to-ba");
      if (arrow1) {
        const gap1MidY = (hsY + pathCards.highSchool.height + asY) / 2;
        arrow1.style.left = `calc(${pathCenterX} / var(--canvas-width) * 100%)`;
        arrow1.style.top = `calc(${gap1MidY} / var(--canvas-height) * 100%)`;
        arrow1.style.transform = "translateX(-50%) translateY(-50%)";
        arrow1.style.display = stageLayout.showArrow1 ? "" : "none";
      }
      if (arrow2) {
        const gap2MidY = (asY + pathCards.associate.height + baY) / 2;
        arrow2.style.left = `calc(${pathCenterX} / var(--canvas-width) * 100%)`;
        arrow2.style.top = `calc(${gap2MidY} / var(--canvas-height) * 100%)`;
        arrow2.style.transform = "translateX(-50%) translateY(-50%)";
        arrow2.style.display = stageLayout.showArrow2 ? "" : "none";
      }
      if (arrowHsToBa) {
        const hsToBaMidY = (hsY + pathCards.highSchool.height + baY) / 2;
        arrowHsToBa.style.left = `calc(${pathCenterX} / var(--canvas-width) * 100%)`;
        arrowHsToBa.style.top = `calc(${hsToBaMidY} / var(--canvas-height) * 100%)`;
        arrowHsToBa.style.transform = "translateX(-50%) translateY(-50%)";
        arrowHsToBa.style.display = stageLayout.showArrowHsToBa ? "" : "none";
      }
    }

    const slots = [
      elements.previewPrimaryImage,
      elements.previewSecondaryImageA,
      elements.previewSecondaryImageB,
      elements.previewSecondaryImageC,
      elements.previewSecondaryImageD,
    ].filter(Boolean);

    slots.forEach((slot) => {
      setPreviewSlotState(slot, null);
    });

    cleanedRecord.images.slice(0, 5).forEach((image, index) => {
      const slot = slots[index];
      if (!slot) {
        return;
      }
      setPreviewSlotState(slot, image);
    });

    if (elements.previewBoard) {
      const layout = cleanedRecord.images.length >= 1 ? `${cleanedRecord.images.length}-image` : "empty";
      elements.previewBoard.dataset.layout = layout;
      if (elements.previewBoard.parentElement) {
        elements.previewBoard.parentElement.dataset.layout = layout;
      }

      if (cleanedRecord.images.length > 0) {
        const layoutDef = resolvePosterImageLayout(cleanedRecord.images.length, config);
        const slotIds = ["preview-primary-image", "preview-secondary-image-a", "preview-secondary-image-b", "preview-secondary-image-c", "preview-secondary-image-d"];
        const offsets = layoutEditor.offsets || {};
        layoutDef.forEach((slotData, index) => {
          const slotEl = slots[index];
          if (slotEl && slotEl.style) {
            const off = offsets[slotIds[index]] || { dx: 0, dy: 0 };
            slotEl.hidden = slotEl.hidden || isElementHiddenByUser(layoutEditor, slotIds[index]);
            slotEl.style.left = `calc(${slotData.x + (off.dx || 0)} / var(--canvas-width) * 100%)`;
            slotEl.style.top = `calc(${slotData.y + (off.dy || 0)} / var(--canvas-height) * 100%)`;
            slotEl.style.width = `calc(${slotData.width} / var(--canvas-width) * 100%)`;
            slotEl.style.height = `calc(${slotData.height} / var(--canvas-height) * 100%)`;
            slotEl.style.transformOrigin = "center center";
            slotEl.style.transform = `rotate(${(slotData.rotate || 0) + (off.rotate || 0)}deg) scale(${off.scale ?? 1})`;
          }
        });

        if (elements.previewCertificateChip && elements.previewCertificateChip.parentElement) {
          const certBase = (config.layoutReference && config.layoutReference.imageArea && config.layoutReference.imageArea.certificateChip) || DEFAULT_LAYOUT_REFERENCE.imageArea.certificateChip;
          const certLayout = getCertificateChipLayout(cleanedRecord.images, certBase, layoutDef);
          const certOff = offsets["preview-certificate-chip"] || { dx: 0, dy: 0 };
          elements.previewCertificateChip.style.left = `calc(${certLayout.x + (certOff.dx || 0)} / var(--canvas-width) * 100%)`;
          elements.previewCertificateChip.style.top = `calc(${certLayout.y + (certOff.dy || 0)} / var(--canvas-height) * 100%)`;
        }

        if (elements.previewOfferChip && elements.previewOfferChip.parentElement) {
          const offerBase = (config.layoutReference && config.layoutReference.imageArea && config.layoutReference.imageArea.offerChip) || DEFAULT_LAYOUT_REFERENCE.imageArea.offerChip;
          const chipLayout = getOfferChipLayout(cleanedRecord.images, offerBase, layoutDef);
          const chipOff = offsets["preview-offer-chip"] || { dx: 0, dy: 0 };
          elements.previewOfferChip.style.left = `calc(${chipLayout.x + (chipOff.dx || 0)} / var(--canvas-width) * 100%)`;
          elements.previewOfferChip.style.top = `calc(${chipLayout.y + (chipOff.dy || 0)} / var(--canvas-height) * 100%)`;
        }

        if (elements.previewSubtitlePill && elements.previewSubtitlePill.style) {
          const pillBase = (config.layoutReference && config.layoutReference.pathArea && config.layoutReference.pathArea.pill) || DEFAULT_LAYOUT_REFERENCE.pathArea.pill;
          const pillOff = offsets["preview-subtitle-pill"] || { dx: 0, dy: 0 };
          elements.previewSubtitlePill.style.left = `calc(${pillBase.x + (pillOff.dx || 0)} / var(--canvas-width) * 100%)`;
          elements.previewSubtitlePill.style.top = `calc(${pillBase.y + (pillOff.dy || 0)} / var(--canvas-height) * 100%)`;
          elements.previewSubtitlePill.style.transform = "none";  // 覆盖 CSS 中的 translateX(-50%)
        }
      }
    }

    if (elements.previewImageCount) {
      elements.previewImageCount.textContent = `当前 ${cleanedRecord.images.length} 张图`;
      elements.previewImageCount.hidden = cleanedRecord.images.length > 0;
    }
  }

  function renderResults(elements, state) {
    if (!elements.resultsList) {
      return;
    }

    elements.resultsList.innerHTML = "";
    state.generatedResults.forEach((result) => {
      const item = document.createElement("li");
      item.className = "result-item";

      const title = document.createElement("h4");
      title.textContent = result.studentId || result.fileName || "生成结果";
      item.appendChild(title);

      if (result.imageUrl || result.svgUrl) {
        const preview = document.createElement("img");
        preview.loading = "lazy";
        preview.decoding = "async";
        preview.src = result.imageUrl || result.svgUrl;
        preview.alt = `${title.textContent} 预览`;
        item.appendChild(preview);
      }

      const actionRow = document.createElement("div");
      actionRow.className = "result-actions";

      if (result.content) {
        const svgButton = document.createElement("button");
        svgButton.type = "button";
        svgButton.className = "secondary-button";
        svgButton.textContent = "下载 SVG";
        svgButton.addEventListener("click", () => {
          downloadTextFile(result.fileName, result.content, "image/svg+xml");
        });

        const pngButton = document.createElement("button");
        pngButton.type = "button";
        pngButton.className = "primary-button";
        pngButton.textContent = "下载 PNG";
        pngButton.addEventListener("click", () => {
          downloadSvgAsPng(result.fileName, result.content);
        });

        actionRow.appendChild(svgButton);
        actionRow.appendChild(pngButton);
      }

      if (result.imageUrl) {
        const link = document.createElement("a");
        link.href = result.imageUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "打开正式结果";
        actionRow.appendChild(link);
      }

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "ghost-button";
      deleteBtn.textContent = "删除记录";
      // Using direct inline styles instead of css var mapping issues in test env
      deleteBtn.style.color = "#c43d45";
      deleteBtn.addEventListener("click", () => {
        state.generatedResults = state.generatedResults.filter((r) => r !== result);
        renderResults(elements, state);
      });
      actionRow.appendChild(deleteBtn);

      item.appendChild(actionRow);

      elements.resultsList.appendChild(item);
    });
  }

  function syncManualForm(elements, state) {
    state.manualRecord.studentId = elements.studentIdInput?.value || "";
    state.manualRecord.title = elements.titleInput?.value || "";
    state.manualRecord.subtitle = elements.subtitleInput?.value || "";
    state.manualRecord.pathBadge = elements.pathBadgeInput?.value || "";
    state.manualRecord.highSchoolStage = elements.highSchoolInput?.value || "";
    state.manualRecord.associateStage = elements.associateInput?.value || "";
    state.manualRecord.bachelorStage = elements.bachelorInput?.value || "";
  }

  function writeManualForm(elements, record) {
    if (elements.studentIdInput) elements.studentIdInput.value = record.studentId || "";
    if (elements.titleInput) elements.titleInput.value = record.title || "";
    if (elements.subtitleInput) elements.subtitleInput.value = record.subtitle || "";
    if (elements.pathBadgeInput) elements.pathBadgeInput.value = record.pathBadge || "";
    if (elements.highSchoolInput) elements.highSchoolInput.value = record.highSchoolStage || "";
    if (elements.associateInput) elements.associateInput.value = record.associateStage || "";
    if (elements.bachelorInput) elements.bachelorInput.value = record.bachelorStage || "";
  }

  function getEditableElementMap(elements) {
    return {
      "preview-primary-image": elements.previewPrimaryImage,
      "preview-secondary-image-a": elements.previewSecondaryImageA,
      "preview-secondary-image-b": elements.previewSecondaryImageB,
      "preview-secondary-image-c": elements.previewSecondaryImageC,
      "preview-secondary-image-d": elements.previewSecondaryImageD,
      "preview-high-school": elements.previewHighSchoolCard,
      "preview-associate": elements.previewAssociateCard,
      "preview-bachelor": elements.previewBachelorCard,
      "preview-certificate-chip": elements.previewCertificateChip,
      "preview-offer-chip": elements.previewOfferChip,
      "preview-subtitle-pill": elements.previewSubtitlePill,
    };
  }

  function renderLayoutSelect(selectEl, items, placeholder, selectedValue) {
    if (!selectEl) {
      return;
    }
    selectEl.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    selectEl.appendChild(placeholderOption);
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      if (selectedValue && selectedValue === item.id) {
        option.selected = true;
      }
      selectEl.appendChild(option);
    });
  }

  function buildDraggableRegistry(record, config) {
    const cleaned = createNormalizedRecord(record || {});
    const layout = config.layoutReference || DEFAULT_LAYOUT_REFERENCE;
    const pathArea = layout.pathArea || DEFAULT_LAYOUT_REFERENCE.pathArea;
    const stageLayout = getActiveStageLayout(cleaned, config);
    const imageLayouts =
      cleaned.images.length > 0 ? resolvePosterImageLayout(cleaned.images.length, config) : [];
    const visibility = getRecordAssetVisibility(cleaned);
    const registry = {
      "preview-high-school": { defaultX: pathArea.cards.highSchool.x, defaultY: pathArea.cards.highSchool.y },
      "preview-associate": { defaultX: pathArea.cards.associate.x, defaultY: pathArea.cards.associate.y },
      "preview-bachelor": { defaultX: pathArea.cards.bachelor.x, defaultY: stageLayout.bachelorY },
      "preview-subtitle-pill": { defaultX: pathArea.pill.x, defaultY: pathArea.pill.y },
    };
    imageLayouts.forEach((layoutItem, index) => {
      registry[
        ["preview-primary-image", "preview-secondary-image-a", "preview-secondary-image-b", "preview-secondary-image-c", "preview-secondary-image-d"][index]
      ] = {
        defaultX: layoutItem.x,
        defaultY: layoutItem.y,
      };
    });
    if (visibility.showCertificateChip) {
      const chipLayout = getCertificateChipLayout(cleaned.images, layout.imageArea.certificateChip, imageLayouts);
      registry["preview-certificate-chip"] = { defaultX: chipLayout.x, defaultY: chipLayout.y };
    }
    if (visibility.showOfferChip) {
      const chipLayout = getOfferChipLayout(cleaned.images, layout.imageArea.offerChip, imageLayouts);
      registry["preview-offer-chip"] = { defaultX: chipLayout.x, defaultY: chipLayout.y };
    }
    return registry;
  }

  function renderLayoutEditorControls(elements, state) {
    const layoutEditor = getResolvedLayoutEditorState(state.layoutEditor);
    const presetItems = listLayoutPresets();
    const draftItems = listLayoutDrafts();
    const editableMap = getEditableElementMap(elements);
    const selectedElementId = layoutEditor.selectedElementId;

    renderLayoutSelect(elements.loadLayoutSelect, presetItems, "加载模板", layoutEditor.activePresetName);
    renderLayoutSelect(elements.loadDraftSelect, draftItems, "加载草稿", layoutEditor.activeDraftId);

    if (elements.layoutSelectionLabel) {
      elements.layoutSelectionLabel.textContent = selectedElementId
        ? `当前选中：${EDITABLE_ELEMENT_LABELS[selectedElementId] || selectedElementId}`
        : "未选中模块";
    }
    if (elements.layoutPersistenceLabel) {
      const presetLabel = layoutEditor.activePresetName
        ? `模板：${presetItems.find((item) => item.id === layoutEditor.activePresetName)?.name || "已加载"}`
        : "模板：未加载";
      const draftLabel = layoutEditor.activeDraftId
        ? `草稿：${draftItems.find((item) => item.id === layoutEditor.activeDraftId)?.name || "已加载"}`
        : "草稿：未加载";
      elements.layoutPersistenceLabel.textContent = `${presetLabel} / ${draftLabel}`;
    }

    Object.entries(editableMap).forEach(([elementId, element]) => {
      if (!element?.classList) {
        return;
      }
      element.classList.toggle("is-selected", Boolean(selectedElementId) && selectedElementId === elementId && !element.hidden);
      element.classList.toggle("is-hidden-by-user", isElementHiddenByUser(layoutEditor, elementId) && !element.hidden);
    });

    if (elements.hideSelectedBtn) {
      elements.hideSelectedBtn.disabled = !selectedElementId;
    }
    const isImageSelected = isImageElementId(selectedElementId);
    [
      elements.imageScaleUpBtn,
      elements.imageScaleDownBtn,
      elements.imageRotateLeftBtn,
      elements.imageRotateRightBtn,
      elements.imageTransformResetBtn,
    ].forEach((btn) => {
      if (btn) btn.disabled = !isImageSelected;
    });
    if (elements.deleteLayoutBtn) {
      elements.deleteLayoutBtn.disabled = !elements.loadLayoutSelect?.value;
    }
    if (elements.deleteDraftBtn) {
      elements.deleteDraftBtn.disabled = !elements.loadDraftSelect?.value;
    }
  }

  function refreshUI(elements, state, inputConfig) {
    const config = mergeConfig(inputConfig);
    syncManualForm(elements, state);
    setManualRecordImages(state);
    const validation = validatePosterRecord(state.manualRecord, config);
    const assets = getBrandAssetStatus(config);
    const ready = validation.ok && assets.ok && state.brandAssetsAvailable !== false;

    renderFieldErrors(elements, validation.errors, state.showErrors);
    renderManualImageList(elements, state);
    renderBatchRecords(elements, state);
    renderPreview(elements, state, config);
    renderLayoutEditorControls(elements, state);
    renderResults(elements, state);

    if (elements.brandAssetsWarning) {
      const message =
        state.brandAssetsAvailable === false
          ? state.brandAssetsMessage
          : assets.ok
            ? ""
            : "当前还没有找到合并背景图，请先确认固定背景图路径和 assets 目录中的文件是否一致。";
      elements.brandAssetsWarning.hidden = !message;
      elements.brandAssetsWarning.textContent = message;
    }

    if (elements.summaryBox) {
      const cleanedRecord = validation.cleaned;
      elements.summaryBox.innerHTML = `
        <li>标题：${escapeXml(state.manualRecord.title || "未填写")}</li>
        <li>副标题：${escapeXml(state.manualRecord.subtitle || "未填写")}</li>
        <li>成绩单 / 证书：${cleanedRecord.certificateImages.length} 张</li>
        <li>Offer：${cleanedRecord.offerImages.length} 张</li>
        <li>当前图片：${cleanedRecord.totalImageCount} 张</li>
        <li>批量记录：${state.batchRecords.length} 条</li>
        <li>正式输出：内置固定海报引擎</li>
      `;
    }

    if (elements.generateButton) {
      elements.generateButton.disabled = !ready;
    }

    if (elements.batchGenerateButton) {
      elements.batchGenerateButton.disabled =
        !state.batchRecords.length || !assets.ok || state.brandAssetsAvailable === false;
    }

    return { validation, assets, ready };
  }

  async function readTypedImages(fileList, assetType) {
    const files = Array.from(fileList || []);
    const images = [];
    for (const file of files) {
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
    try {
      const images = await readTypedImages(event.target.files, assetType);
      if (assetType === "certificate") {
        state.manualRecord.certificateImages = [...(state.manualRecord.certificateImages || []), ...images];
      } else {
        state.manualRecord.offerImages = [...(state.manualRecord.offerImages || []), ...images];
      }
      setManualRecordImages(state);
    } catch (error) {
      setStatus(elements, "error", "图片读取失败：" + (error.message || "未知错误"));
    } finally {
      event.target.value = "";
      refreshUI(elements, state, inputConfig);
    }
  }

  async function handleBatchImageUpload(event, elements, state, inputConfig) {
    try {
      const rawImages = await readTypedImages(event.target.files, "");
      const classifiedImages = rawImages.map((image) => {
        const assetType = classifyImageByKeyword(image.name);
        return { ...image, assetType };
      });
      state.batchImagePool = [...state.batchImagePool, ...classifiedImages];

      const autoMatched = autoMatchAllRecords(state.batchRecords, state.batchImagePool);
      const exactMatched = matchRecordImages(state.batchRecords, state.batchImagePool);
      state.batchRecords = state.batchRecords.map((record) => {
        const exact = exactMatched.find(r => r.studentId === record.studentId);
        const auto = autoMatched.find(r => r.studentId === record.studentId);
        if (exact && exact.images.length > 0) return exact;
        if (auto && auto.images.length > 0) return auto;
        return auto || exact || record;
      });

      event.target.value = "";
      refreshUI(elements, state, inputConfig);
    } catch (error) {
      event.target.value = "";
      setStatus(elements, "error", "批量图片读取失败：" + (error.message || "未知错误"));
    }
  }

  async function handleTableUpload(event, elements, state, inputConfig) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isXlsx = file.name.toLowerCase().endsWith(".xlsx");

      if (isXlsx) {
        if (typeof XLSX === "undefined") {
          setStatus(elements, "error", "Excel 解析库加载失败，请刷新页面后重试。");
          state.batchRecords = [];
          refreshUI(elements, state, inputConfig);
          return;
        }
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        if (!workbook || !workbook.SheetNames.length) {
          setStatus(elements, "error", "无法读取 Excel 文件，请检查文件是否损坏。");
          state.batchRecords = [];
          refreshUI(elements, state, inputConfig);
          return;
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 2) {
          setStatus(elements, "error", "Excel 表格至少需要包含表头行和一行数据。");
          state.batchRecords = [];
          refreshUI(elements, state, inputConfig);
          return;
        }
        const headers = rows[0].map((h) => (h || "").toString().trim());
        const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell != null && cell !== ""));
        state.batchRecords = buildBatchRecordsFromTable(dataRows, headers);
      } else {
        const csvText = await file.text();
        const firstLine = csvText.split("\n")[0] || "";
        const isNewFormat = firstLine.split(",").length <= 7;
        if (isNewFormat) {
          const rows = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
          if (rows.length < 2) {
            setStatus(elements, "error", "CSV 文件至少需要包含表头行和一行数据。");
            state.batchRecords = [];
            refreshUI(elements, state, inputConfig);
            return;
          }
          const headers = parseCsvLine(rows[0]);
          const dataRows = rows.slice(1).map(line => parseCsvLine(line));
          state.batchRecords = buildBatchRecordsFromTable(dataRows, headers);
        } else {
          state.batchRecords = buildBatchRecordsFromCsv(csvText);
        }
      }

      if (state.batchRecords.length > MAX_BATCH_RECORDS) {
        state.batchRecords = state.batchRecords.slice(0, MAX_BATCH_RECORDS);
        setStatus(elements, "warning", `表格包含的记录数超过上限 ${MAX_BATCH_RECORDS} 条，已截取前 ${MAX_BATCH_RECORDS} 条。`);
      }

      if (state.batchImagePool.length) {
        const autoMatched = autoMatchAllRecords(state.batchRecords, state.batchImagePool);
        const exactMatched = matchRecordImages(state.batchRecords, state.batchImagePool);
        state.batchRecords = state.batchRecords.map((record) => {
          const exact = exactMatched.find(r => r.studentId === record.studentId);
          const auto = autoMatched.find(r => r.studentId === record.studentId);
          if (exact && exact.images.length > 0) return exact;
          if (auto && auto.images.length > 0) return auto;
          return auto || exact || record;
        });
      }

      event.target.value = "";
      refreshUI(elements, state, inputConfig);
    } catch (error) {
      event.target.value = "";
      setStatus(elements, "error", "文件解析失败：" + (error.message || "未知错误"));
      refreshUI(elements, state, inputConfig);
    }
  }

  function storeLocalResult(state, exportResult, studentId) {
    const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
    const svgUrl = URL.createObjectURL(blob);
    state.generatedResults.unshift({
      studentId,
      fileName: exportResult.fileName,
      content: exportResult.content,
      svgUrl,
    });
  }

  async function handleGenerate(elements, state, inputConfig) {
    const ready = refreshUI(elements, state, inputConfig);
    if (!ready.ready) {
      state.showErrors = true;
      refreshUI(elements, state, inputConfig);
      setStatus(elements, "error", "请先补齐标题、副标题、三阶段文案，并确认合并背景图已就绪。");
      return;
    }

    try {
      elements.generateButton.disabled = true;
      setStatus(elements, "info", "正在使用内置固定海报引擎生成正式海报...");
      const exportResult = await exportPoster(state.manualRecord, inputConfig, state.layoutEditor);
      storeLocalResult(state, exportResult, state.manualRecord.studentId || state.manualRecord.title);
      renderResults(elements, state);
      setStatus(elements, "success", "单张海报已生成，可直接下载 SVG 或 PNG。");
    } catch (error) {
      setStatus(elements, "error", error.message || "海报生成失败。");
    } finally {
      refreshUI(elements, state, inputConfig);
    }
  }

  async function handleBatchGenerate(elements, state, inputConfig) {
    try {
      elements.batchGenerateButton.disabled = true;
      const records = state.batchRecords.slice(0, MAX_BATCH_RECORDS);
      setStatus(elements, "info", `正在批量使用内置固定海报引擎生成正式海报（共 ${records.length} 条）...`);
      const results = await exportBatchPosters(records, inputConfig, state.layoutEditor);
      const successResults = [];

      results.forEach((result) => {
        if (result.ok) {
          successResults.push(result);
          storeLocalResult(state, result.output, result.studentId);
        }
      });

      renderResults(elements, state);
      const failed = results.filter((result) => !result.ok).length;
      setStatus(
        elements,
        failed ? "info" : "success",
        `批量生成完成：成功 ${successResults.length} 条，失败 ${failed} 条。`
      );
    } catch (error) {
      setStatus(elements, "error", error.message || "批量生成失败。");
    } finally {
      refreshUI(elements, state, inputConfig);
    }
  }

  function probeImageUrl(url) {
    return new Promise((resolve) => {
      if (typeof Image === "undefined" || !url) {
        resolve(false);
        return;
      }
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
  }

  async function checkBrandAssetsAvailability(inputConfig) {
    const assets = getBrandAssetStatus(inputConfig);
    if (!assets.ok) {
      return {
        ok: false,
        message: "请先配置固定背景图文件路径。",
      };
    }
    const backgroundOk = await probeImageUrl(assets.backgroundImage);
    return backgroundOk
      ? { ok: true, message: "" }
      : {
        ok: false,
        message: "当前没有成功读取合并背景图，请确认配置路径和 assets 目录中的背景文件是否一致。",
      };
  }

  function initBrowserApp() {
    if (typeof document === "undefined") {
      return;
    }

    const config = mergeConfig(globalScope.POSTER_TOOL_CONFIG);
    const elements = {
      pageTitle: document.querySelector("[data-page-title]"),
      studentIdInput: document.querySelector("#student-id-input"),
      titleInput: document.querySelector("#title-input"),
      subtitleInput: document.querySelector("#subtitle-input"),
      pathBadgeInput: document.querySelector("#path-badge-input"),
      highSchoolInput: document.querySelector("#high-school-input"),
      associateInput: document.querySelector("#associate-input"),
      bachelorInput: document.querySelector("#bachelor-input"),
      certificateImagesInput: document.querySelector("#certificate-images-input"),
      offerImagesInput: document.querySelector("#offer-images-input"),
      certificateImageList: document.querySelector("#certificate-image-list"),
      offerImageList: document.querySelector("#offer-image-list"),
      csvInput: document.querySelector("#batch-csv-input"),
      batchTableInput: document.querySelector("#batch-table-input"),
      batchImagesInput: document.querySelector("#batch-images-input"),
      downloadTemplateLink: document.querySelector("#download-template-link"),
      batchList: document.querySelector("#batch-records-list"),
      generateButton: document.querySelector("#generate-button"),
      batchGenerateButton: document.querySelector("#batch-generate-button"),
      resultsList: document.querySelector("#results-list"),
      summaryBox: document.querySelector("#summary-list"),
      brandAssetsWarning: document.querySelector("#brand-assets-warning"),
      statusBox: document.querySelector("#status-box"),
      statusText: document.querySelector("#status-text"),
      previewCard: document.querySelector("#poster-preview"),
      previewBackgroundImage: document.querySelector("#preview-background-image"),
      previewLogoImage: document.querySelector("#preview-logo-image"),
      previewOrgNameCn: document.querySelector("#preview-org-name-cn"),
      previewOrgNameEn: document.querySelector("#preview-org-name-en"),
      previewBoard: document.querySelector(".preview-board"),
      previewTitle: document.querySelector("#preview-title"),
      previewSubtitle: document.querySelector("#preview-subtitle"),
      previewSubtitlePill: document.querySelector("#preview-subtitle-pill"),
      previewPathBadge: document.querySelector("#preview-path-badge"),
      previewHighSchool: document.querySelector("#preview-high-school-text"),
      previewAssociate: document.querySelector("#preview-associate-text"),
      previewBachelor: document.querySelector("#preview-bachelor-text"),
      previewHighSchoolCard: document.querySelector("#preview-high-school"),
      previewAssociateCard: document.querySelector("#preview-associate"),
      previewBachelorCard: document.querySelector("#preview-bachelor"),
      previewPrimaryImage: document.querySelector("#preview-primary-image"),
      previewSecondaryImageA: document.querySelector("#preview-secondary-image-a"),
      previewSecondaryImageB: document.querySelector("#preview-secondary-image-b"),
      previewSecondaryImageC: document.querySelector("#preview-secondary-image-c"),
      previewSecondaryImageD: document.querySelector("#preview-secondary-image-d"),
      previewImageCount: document.querySelector("#preview-image-count"),
      previewCertificateChip: document.querySelector("#preview-certificate-chip"),
      previewOfferChip: document.querySelector("#preview-offer-chip"),
      saveLayoutBtn: document.querySelector("#save-layout-btn"),
      loadLayoutSelect: document.querySelector("#load-layout-select"),
      deleteLayoutBtn: document.querySelector("#delete-layout-btn"),
      saveDraftBtn: document.querySelector("#save-draft-btn"),
      loadDraftSelect: document.querySelector("#load-draft-select"),
      deleteDraftBtn: document.querySelector("#delete-draft-btn"),
      hideSelectedBtn: document.querySelector("#hide-selected-btn"),
      restoreHiddenBtn: document.querySelector("#restore-hidden-btn"),
      resetLayoutBtn: document.querySelector("#reset-layout-btn"),
      imageScaleUpBtn: document.querySelector("#image-scale-up-btn"),
      imageScaleDownBtn: document.querySelector("#image-scale-down-btn"),
      imageRotateLeftBtn: document.querySelector("#image-rotate-left-btn"),
      imageRotateRightBtn: document.querySelector("#image-rotate-right-btn"),
      imageTransformResetBtn: document.querySelector("#image-transform-reset-btn"),
      layoutSelectionLabel: document.querySelector("#layout-selection-label"),
      layoutPersistenceLabel: document.querySelector("#layout-persistence-label"),
      errorMap: {
        title: document.querySelector("#error-title"),
        subtitle: document.querySelector("#error-subtitle"),
        highSchoolStage: document.querySelector("#error-high-school"),
        associateStage: document.querySelector("#error-associate"),
        bachelorStage: document.querySelector("#error-bachelor"),
        images: document.querySelector("#error-images"),
      },
    };

    const state = createDefaultState();
    setText(elements.pageTitle, config.pageTitle);
    document.title = config.pageTitle;
    syncGlobalLayoutEditorState(state.layoutEditor);

    const selectEditableElement = (elementId) => {
      state.layoutEditor = getResolvedLayoutEditorState(state.layoutEditor);
      state.layoutEditor.selectedElementId = elementId;
      syncGlobalLayoutEditorState(state.layoutEditor);
      renderLayoutEditorControls(elements, state);
    };

    const resetLayoutEditor = () => {
      state.layoutEditor = createDefaultLayoutEditorState();
      syncGlobalLayoutEditorState(state.layoutEditor);
    };

    const applyLayoutPresetToState = (preset) => {
      state.layoutEditor = cloneLayoutEditorState({
        offsets: preset?.offsets,
        visibility: preset?.visibility,
        activePresetName: preset?.id || "",
        activeDraftId: "",
        selectedElementId: "",
      });
      syncGlobalLayoutEditorState(state.layoutEditor);
    };

    const applyLayoutDraftToState = (draft) => {
      state.manualRecord = {
        ...createNormalizedRecord(draft?.manualRecord || {}),
        certificateImages: [],
        offerImages: [],
        images: [],
      };
      writeManualForm(elements, state.manualRecord);
      state.layoutEditor = cloneLayoutEditorState({
        offsets: draft?.offsets,
        visibility: draft?.visibility,
        activePresetName: "",
        activeDraftId: draft?.id || "",
        selectedElementId: "",
      });
      syncGlobalLayoutEditorState(state.layoutEditor);
    };

    const editableMap = getEditableElementMap(elements);
    Object.entries(editableMap).forEach(([elementId, element]) => {
      if (!element || element.dataset.layoutEditorBound === "true") {
        return;
      }
      element.dataset.layoutEditorBound = "true";
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        selectEditableElement(elementId);
      });
      element.addEventListener("pointerdown", (event) => {
        const registry = buildDraggableRegistry(state.manualRecord, config);
        const defaults = registry[elementId];
        if (!defaults) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        selectEditableElement(elementId);
        handleDragStart(event, elementId, defaults.defaultX, defaults.defaultY);
      });
    });

    if (document.body && document.body.dataset.layoutEditorPointerBound !== "true") {
      document.body.dataset.layoutEditorPointerBound = "true";
      document.addEventListener("pointermove", handleDragMove, { passive: false });
    }

    const finishDrag = () => {
      if (!dragSession.active) {
        return;
      }
      handleDragEnd();
      // 从全局获取最新偏移（handleDragEnd 已将增量写入全局），避免旧本地状态覆盖
      state.layoutEditor = getResolvedLayoutEditorState();
      refreshUI(elements, state, config);
    };
    document.addEventListener("pointerup", finishDrag);
    document.addEventListener("pointercancel", finishDrag);

    document.addEventListener("click", (event) => {
      if (event.target.closest?.("#poster-preview") || event.target.closest?.(".layout-controls")) {
        return;
      }
      if (!state.layoutEditor.selectedElementId) {
        return;
      }
      state.layoutEditor.selectedElementId = "";
      syncGlobalLayoutEditorState(state.layoutEditor);
      renderLayoutEditorControls(elements, state);
    });

    const debouncedRefresh = debounce(() => refreshUI(elements, state, config), 120);
    [
      elements.studentIdInput,
      elements.titleInput,
      elements.subtitleInput,
      elements.pathBadgeInput,
      elements.highSchoolInput,
      elements.associateInput,
      elements.bachelorInput,
    ]
      .filter(Boolean)
      .forEach((input) => {
        input.addEventListener("input", debouncedRefresh);
      });

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

    if (elements.batchTableInput) {
      elements.batchTableInput.addEventListener("change", (event) =>
        handleTableUpload(event, elements, state, config)
      );
    }

    if (elements.batchImagesInput) {
      elements.batchImagesInput.addEventListener("change", (event) =>
        handleBatchImageUpload(event, elements, state, config)
      );
    }

    if (elements.downloadTemplateLink) {
      elements.downloadTemplateLink.addEventListener("click", (event) => {
        event.preventDefault();
        const headers = ["学员编号", "标题", "副标题", "高中阶段/学士阶段", "副学士阶段", "学士阶段/硕士阶段"];
        const rows = [headers, ["stu-001", "示例标题", "示例副标题", "示例高中阶段", "示例副学士阶段", "示例学士阶段"]];
        const csv = rows.map(row => row.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "海报批量导入模板.csv";
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (elements.generateButton) {
      elements.generateButton.addEventListener("click", () => handleGenerate(elements, state, config));
    }

    if (elements.batchGenerateButton) {
      elements.batchGenerateButton.addEventListener("click", () =>
        handleBatchGenerate(elements, state, config)
      );
    }

    if (elements.saveLayoutBtn) {
      elements.saveLayoutBtn.addEventListener("click", () => {
        const name = globalScope.prompt?.("请输入模板名称", "我的布局模板");
        if (!name) {
          return;
        }
        const snapshot = saveLayoutPreset(name, state.layoutEditor);
        state.layoutEditor = cloneLayoutEditorState({
          ...state.layoutEditor,
          activePresetName: snapshot.id,
          activeDraftId: "",
        });
        syncGlobalLayoutEditorState(state.layoutEditor);
        refreshUI(elements, state, config);
        setStatus(elements, "success", `已保存模板：${snapshot.name}`);
      });
    }

    if (elements.loadLayoutSelect) {
      elements.loadLayoutSelect.addEventListener("change", (event) => {
        const preset = listLayoutPresets().find((item) => item.id === event.target.value);
        if (!preset) {
          return;
        }
        applyLayoutPresetToState(preset);
        refreshUI(elements, state, config);
        setStatus(elements, "success", `已加载模板：${preset.name}`);
      });
    }

    if (elements.deleteLayoutBtn) {
      elements.deleteLayoutBtn.addEventListener("click", () => {
        const presetId = elements.loadLayoutSelect?.value;
        const preset = listLayoutPresets().find((item) => item.id === presetId);
        if (!presetId || !preset) {
          return;
        }
        deleteLayoutPresetById(presetId);
        if (state.layoutEditor.activePresetName === presetId) {
          state.layoutEditor.activePresetName = "";
        }
        refreshUI(elements, state, config);
        setStatus(elements, "info", `已删除模板：${preset.name}`);
      });
    }

    if (elements.saveDraftBtn) {
      elements.saveDraftBtn.addEventListener("click", () => {
        const name = globalScope.prompt?.("请输入草稿名称", state.manualRecord.title || "当前海报草稿");
        if (!name) {
          return;
        }
        const snapshot = saveLayoutDraft(name, state.manualRecord, state.layoutEditor);
        state.layoutEditor = cloneLayoutEditorState({
          ...state.layoutEditor,
          activePresetName: "",
          activeDraftId: snapshot.id,
        });
        syncGlobalLayoutEditorState(state.layoutEditor);
        refreshUI(elements, state, config);
        setStatus(elements, "success", `已保存草稿：${snapshot.name}`);
      });
    }

    if (elements.loadDraftSelect) {
      elements.loadDraftSelect.addEventListener("change", (event) => {
        const draft = listLayoutDrafts().find((item) => item.id === event.target.value);
        if (!draft) {
          return;
        }
        applyLayoutDraftToState(draft);
        refreshUI(elements, state, config);
        setStatus(elements, "info", `已恢复草稿：${draft.name}，图片需重新上传。`);
      });
    }

    if (elements.deleteDraftBtn) {
      elements.deleteDraftBtn.addEventListener("click", () => {
        const draftId = elements.loadDraftSelect?.value;
        const draft = listLayoutDrafts().find((item) => item.id === draftId);
        if (!draftId || !draft) {
          return;
        }
        deleteLayoutDraftById(draftId);
        if (state.layoutEditor.activeDraftId === draftId) {
          state.layoutEditor.activeDraftId = "";
        }
        refreshUI(elements, state, config);
        setStatus(elements, "info", `已删除草稿：${draft.name}`);
      });
    }

    if (elements.hideSelectedBtn) {
      elements.hideSelectedBtn.addEventListener("click", () => {
        const selectedId = state.layoutEditor.selectedElementId;
        if (!selectedId) {
          return;
        }
        state.layoutEditor = getResolvedLayoutEditorState(state.layoutEditor);
        state.layoutEditor.visibility[selectedId] = { hiddenByUser: true };
        state.layoutEditor.selectedElementId = "";
        syncGlobalLayoutEditorState(state.layoutEditor);
        refreshUI(elements, state, config);
        setStatus(elements, "info", `已隐藏模块：${EDITABLE_ELEMENT_LABELS[selectedId] || selectedId}`);
      });
    }

    if (elements.restoreHiddenBtn) {
      elements.restoreHiddenBtn.addEventListener("click", () => {
        state.layoutEditor = getResolvedLayoutEditorState(state.layoutEditor);
        state.layoutEditor.visibility = {};
        syncGlobalLayoutEditorState(state.layoutEditor);
        refreshUI(elements, state, config);
        setStatus(elements, "success", "已恢复全部隐藏模块。");
      });
    }

    if (elements.resetLayoutBtn) {
      elements.resetLayoutBtn.addEventListener("click", () => {
        resetLayoutEditor();
        refreshUI(elements, state, config);
        setStatus(elements, "success", "已恢复默认布局。");
      });
    }

    function applyImageTransform(change) {
      const current = getResolvedLayoutEditorState(state.layoutEditor);
      const selectedElementId = current.selectedElementId;
      if (!isImageElementId(selectedElementId)) return;
      const offsets = cloneOffsetsMap(current.offsets);
      const entry = offsets[selectedElementId] || { dx: 0, dy: 0, scale: 1, rotate: 0 };
      if (change.reset) {
        entry.scale = 1;
        entry.rotate = 0;
      }
      if (change.dScale) {
        entry.scale = Math.min(3, Math.max(0.3, (Number(entry.scale) || 1) + change.dScale));
      }
      if (change.dRotate) {
        entry.rotate = ((Number(entry.rotate) || 0) + change.dRotate) % 360;
      }
      offsets[selectedElementId] = entry;
      setLayoutDragOffsets(offsets);
      state.layoutEditor = getResolvedLayoutEditorState();
      refreshUI(elements, state, config);
    }

    if (elements.imageScaleUpBtn) {
      elements.imageScaleUpBtn.addEventListener("click", () => applyImageTransform({ dScale: 0.1 }));
    }
    if (elements.imageScaleDownBtn) {
      elements.imageScaleDownBtn.addEventListener("click", () => applyImageTransform({ dScale: -0.1 }));
    }
    if (elements.imageRotateLeftBtn) {
      elements.imageRotateLeftBtn.addEventListener("click", () => applyImageTransform({ dRotate: -15 }));
    }
    if (elements.imageRotateRightBtn) {
      elements.imageRotateRightBtn.addEventListener("click", () => applyImageTransform({ dRotate: 15 }));
    }
    if (elements.imageTransformResetBtn) {
      elements.imageTransformResetBtn.addEventListener("click", () => applyImageTransform({ reset: true }));
    }

    function bindQuickChip(containerId, inputElement) {
      document.querySelector(containerId)?.addEventListener("click", (event) => {
        const chip = event.target.closest(".quick-chip");
        if (!chip || !inputElement) return;
        inputElement.value = chip.dataset.value;
        syncManualForm(elements, state);
        refreshUI(elements, state, config);
      });
    }

    bindQuickChip("#subtitle-chips", elements.subtitleInput);
    bindQuickChip("#high-school-chips", elements.highSchoolInput);

    refreshUI(elements, state, config);
    checkBrandAssetsAvailability(config).then((result) => {
      state.brandAssetsAvailable = result.ok;
      state.brandAssetsMessage = result.message;
      refreshUI(elements, state, config);
    });
  }

  const api = {
    mergeConfig,
    createNormalizedRecord,
    buildDerivedRecordImages,
    getRecordAssetVisibility,
    createDefaultLayoutEditorState,
    createLayoutPresetSnapshot,
    createLayoutDraftSnapshot,
    listLayoutPresets,
    listLayoutDrafts,
    saveLayoutPreset,
    saveLayoutDraft,
    deleteLayoutPresetByName,
    deleteLayoutDraftByName,
    buildDraggableRegistry,
    normalizeLayoutReference,
    getPreviewCssVariables,
    applyPreviewLayout,
    getBrandAssetStatus,
    getLayoutDragOffsets,
    setLayoutDragOffsets,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    renderPreview,
    renderResults,
    validatePosterRecord,
    resolveExportBackgroundImage,
    resolvePosterImageLayout,
    mapImagesToPosterSlots,
    createPosterSvgMarkup,
    exportPoster,
    getActiveStageLayout,
    buildBatchRecordsFromCsv,
    buildBatchRecordsFromTable,
    matchRecordImages,
    classifyImageByKeyword,
    autoMatchImages,
    autoMatchAllRecords,
    exportBatchPosters,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.PosterTool = api;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initBrowserApp);
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
