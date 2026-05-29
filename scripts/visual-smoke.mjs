const playwrightRoot = process.argv[2];

if (!playwrightRoot) {
  throw new Error("Missing Playwright root path.");
}

const { chromium } = await import(`file://${playwrightRoot}/playwright/index.mjs`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const username = `smoke-${Date.now()}`;

try {
  await page.goto("http://127.0.0.1:8000/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "切换到注册" }).click();
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("邮箱").fill(`${username}@example.com`);
  await page.getByLabel("密码").fill("plain-secret");
  await page.getByRole("button", { name: "注册" }).click();
  await page.getByText("Visual State").waitFor();
  await page.screenshot({ path: "/tmp/scales-stage-default.png", fullPage: true });

  const stage = page.getByLabel("视觉舞台拖放区");

  await page.getByRole("button", { name: /Lydian/ }).dragTo(stage);
  await page.getByRole("button", { name: /Maj7/ }).dragTo(stage);
  await page.getByText("日光穹庭", { exact: true }).waitFor();
  const solarText = await page.locator("body").innerText();
  await page.screenshot({ path: "/tmp/scales-stage-solar.png", fullPage: true });

  await clearComposition(page);

  await page.getByRole("button", { name: /Harmonic Minor/ }).dragTo(stage);
  await page.getByRole("button", { name: /Dim7/ }).dragTo(stage);
  await page.getByText("影纹祭坛", { exact: true }).waitFor();
  await page.screenshot({ path: "/tmp/scales-stage-shadow.png", fullPage: true });

  const pageText = await page.locator("body").innerText();
  console.log(
    JSON.stringify(
      {
        username,
        hasSolar: solarText.includes("日光穹庭"),
        hasShadow: pageText.includes("影纹祭坛"),
        hasStageReading: pageText.includes("STAGE READING") || pageText.includes("Stage Reading"),
        hasMoodAxes:
          pageText.includes("VALENCE") &&
          pageText.includes("AROUSAL") &&
          pageText.includes("LUMINOSITY") &&
          pageText.includes("GRIT")
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}

async function clearComposition(page) {
  const removeButtons = page.locator("[aria-label^='移除 ']");

  while ((await removeButtons.count()) > 0) {
    await removeButtons.first().click();
  }
}
