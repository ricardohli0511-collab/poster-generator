const fs = require("node:fs");
const path = require("node:path");
const { chromium, firefox, webkit, devices } = require("playwright");

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, ".visual-regression");
const currentDir = path.join(outputDir, "current");
const previewUrl = process.env.POSTER_TOOL_URL || "http://127.0.0.1:4173/index.html";

const assetFiles = {
  certificate: path.join(projectRoot, "assets", "模拟素材.jpg"),
  offer: path.join(projectRoot, "assets", "模拟素材.jpg"),
  extra: path.join(
    projectRoot,
    "assets",
    "香港灣區教育諮詢促進會 HONG KONG GREATER BAY AREA EDUCATIONAL PROMOTION ASSOCIATION.png"
  ),
};

const browserLaunchers = {
  chrome: () => chromium.launch({ headless: true, channel: "chrome" }),
  firefox: () => firefox.launch({ headless: true }),
  webkit: () => webkit.launch({ headless: true }),
  chromium: () => chromium.launch({ headless: true }),
};

const viewports = [
  { name: "desktop-1920x1080", width: 1920, height: 1080 },
  { name: "laptop-1366x768", width: 1366, height: 768 },
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
];

const scenarios = [
  {
    name: "empty-desktop",
    variant: "empty",
  },
  {
    name: "certificate-only-desktop",
    variant: "certificate-only",
  },
  {
    name: "offer-only-desktop",
    variant: "offer-only",
  },
  {
    name: "mixed-mobile",
    variant: "mixed",
  },
  {
    name: "four-images-desktop",
    variant: "four-images",
  },
  {
    name: "five-images-desktop",
    variant: "five-images",
  },
  {
    name: "header-safe-zone",
    variant: "header-safe-zone",
  },
];

function inferMimeType(filePath) {
  const normalized = String(filePath || "").toLowerCase();
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/png";
}

function createFilePayload(name, sourcePath) {
  return {
    name,
    mimeType: inferMimeType(sourcePath),
    buffer: fs.readFileSync(sourcePath),
  };
}

function ensureOutputDir() {
  fs.mkdirSync(currentDir, { recursive: true });
}

async function fillTextFields(page, scenarioName) {
  await page.locator("#student-id-input").fill(scenarioName);
  await page.locator("#title-input").fill("2026学员成功案例");
  await page.locator("#subtitle-input").fill("2026副学士升本科");
  await page.locator("#high-school-input").fill("国内高考民办本科线");
  await page.locator("#associate-input").fill("PolyU HKCC 工商管理副学士");
  await page.locator("#bachelor-input").fill("岭南大学 公共管理及智能管治学士");
}

async function applyScenario(page, scenario) {
  await fillTextFields(page, scenario.name);

  if (scenario.variant === "certificate-only") {
    await page.locator("#certificate-images-input").setInputFiles([
      assetFiles.certificate,
      assetFiles.extra,
    ]);
  }

  if (scenario.variant === "offer-only") {
    await page.locator("#offer-images-input").setInputFiles([assetFiles.offer]);
  }

  if (scenario.variant === "mixed") {
    await page.locator("#certificate-images-input").setInputFiles([assetFiles.certificate]);
    await page.locator("#offer-images-input").setInputFiles([assetFiles.offer, assetFiles.extra]);
  }

  if (scenario.variant === "four-images") {
    await page.locator("#certificate-images-input").setInputFiles([
      createFilePayload("cert-a.png", assetFiles.certificate),
      createFilePayload("cert-b.jpg", assetFiles.offer),
    ]);
    await page.locator("#offer-images-input").setInputFiles([
      createFilePayload("offer-a.png", assetFiles.extra),
      createFilePayload("offer-b.png", assetFiles.certificate),
    ]);
  }

  if (scenario.variant === "five-images") {
    await page.locator("#certificate-images-input").setInputFiles([
      createFilePayload("cert-a.png", assetFiles.certificate),
      createFilePayload("cert-b.jpg", assetFiles.offer),
      createFilePayload("cert-c.png", assetFiles.extra),
    ]);
    await page.locator("#offer-images-input").setInputFiles([
      createFilePayload("offer-a.png", assetFiles.certificate),
      createFilePayload("offer-b.jpg", assetFiles.offer),
    ]);
  }

  if (scenario.variant === "header-safe-zone") {
    await page.locator("#certificate-images-input").setInputFiles([
      createFilePayload("header-safe-cert.png", assetFiles.certificate),
    ]);
  }
}

function resolveContextOptions(viewport, scenario) {
  if (scenario.name === "mixed-mobile") {
    return {
      ...devices["iPhone 14"],
      viewport: { width: viewport.width, height: viewport.height },
    };
  }

  return { viewport: { width: viewport.width, height: viewport.height } };
}

async function captureScenario(browserName, browser, viewport, scenario) {
  const context = await browser.newContext(resolveContextOptions(viewport, scenario));
  const page = await context.newPage();

  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.locator("#poster-preview").waitFor();
  await applyScenario(page, scenario);
  await page.waitForTimeout(800);

  const previewPath = path.join(
    currentDir,
    `${browserName}-${viewport.name}-${scenario.name}-preview.png`
  );
  await page.locator("#poster-preview").screenshot({ path: previewPath });

  let resultPath = null;
  if (scenario.variant !== "empty") {
    await page.locator("#generate-button").click();
    await page.locator(".result-item").first().waitFor({ timeout: 10000 });
    resultPath = path.join(
      currentDir,
      `${browserName}-${viewport.name}-${scenario.name}-result.png`
    );
    await page.locator("#results-list").screenshot({ path: resultPath });
  }

  await context.close();
  return {
    browser: browserName,
    viewport: viewport.name,
    name: scenario.name,
    previewPath,
    resultPath,
  };
}

async function main() {
  ensureOutputDir();

  const requestedBrowsers = (process.env.POSTER_TOOL_BROWSERS || Object.keys(browserLaunchers).join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const results = [];
  const skipped = [];

  for (const browserName of requestedBrowsers) {
    const launchBrowser = browserLaunchers[browserName];
    if (!launchBrowser) {
      skipped.push({
        browser: browserName,
        reason: "unsupported-browser",
      });
      continue;
    }

    let browser;
    try {
      browser = await launchBrowser();
    } catch (error) {
      skipped.push({
        browser: browserName,
        reason: error.message,
      });
      continue;
    }

    try {
      for (const viewport of viewports) {
        for (const scenario of scenarios) {
          results.push(await captureScenario(browserName, browser, viewport, scenario));
        }
      }
    } finally {
      await browser.close();
    }
  }

  const manifestPath = path.join(currentDir, "manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        previewUrl,
        browsers: requestedBrowsers,
        viewports,
        results,
        skipped,
      },
      null,
      2
    )
  );
  console.log(`视觉回归截图已生成：${currentDir}`);
  console.log(`截图数：${results.length}`);
  if (skipped.length > 0) {
    console.log(`跳过浏览器：${skipped.map((item) => item.browser).join(", ")}`);
  }
}

main().catch((error) => {
  console.error("视觉回归执行失败：", error);
  process.exitCode = 1;
});
