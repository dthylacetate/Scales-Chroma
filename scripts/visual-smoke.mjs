const playwrightRoot = process.argv[2];

if (!playwrightRoot) {
  throw new Error("Missing Playwright root path.");
}

const { chromium } = await import(`file://${playwrightRoot}/playwright/index.mjs`);
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:8000/";

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || undefined,
  headless: true
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const username = `smoke-${Date.now()}`;

try {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "切换到注册" }).click();
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("邮箱").fill(`${username}@example.com`);
  await page.getByLabel("密码").fill("plain-secret");
  await page.getByRole("button", { name: "注册" }).click();
  await page.getByText("Visual State").waitFor();
  await page.screenshot({ path: "/tmp/scales-stage-default.png", fullPage: true });

  await page.getByLabel("练习时长").fill("240");
  await page.getByLabel("BPM").fill("112");
  await page.getByLabel("练习主题").fill("neo soul maj7 groove");
  await page.getByRole("button", { name: "记录练习" }).click();
  await page.getByText("Unlocked velvet_glow").waitFor();

  const stage = page.getByLabel("视觉舞台拖放区");

  await clearComposition(page);
  await page.getByRole("button", { name: "Dorian mode", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: "Maj7 chord", exact: true }).dragTo(stage);
  await page.getByText("Growth Imprint", { exact: true }).waitFor();
  await page.getByText("Harmonic Traits", { exact: true }).waitFor();
  await page.getByText("Theory Synergy", { exact: true }).waitFor();
  await page.getByText("Scene Cascade", { exact: true }).waitFor();
  await page.getByText("Neo Soul 幕纱", { exact: true }).waitFor();
  const growthText = await page.locator("body").innerText();
  const hasGrowthImprint = true;
  const hasNeoSoulImprint = true;
  const hasHarmonicTraits = true;
  const hasTheorySynergy = true;
  await page.screenshot({ path: "/tmp/scales-stage-growth.png", fullPage: true });

  await clearComposition(page);

  await page.getByRole("button", { name: "Lydian mode", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: "Maj7 chord", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: "II-V-I progression", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: /Jazz/ }).click();
  await page.getByText("预览镜头：Jazz Lattice", { exact: true }).waitFor();
  await page.getByText("Aurora Dais", { exact: true }).first().waitFor();
  await page.getByText("Phrase Trajectory", { exact: true }).waitFor();
  await page.getByText("Phrase Hooks", { exact: true }).waitFor();
  await page.getByText("Phrase Variation", { exact: true }).waitFor();
  await page.getByText("Element Voiceprints", { exact: true }).waitFor();
  await page.getByText("Element Roles", { exact: true }).waitFor();
  await page.getByText("Lift Arc", { exact: true }).first().waitFor();
  await page.getByText("Skyline Rise", { exact: true }).first().waitFor();
  await page.getByText("Cadence Sweep", { exact: true }).first().waitFor();
  await page.getByText("Choir Step", { exact: true }).first().waitFor();
  await page.getByText("Sky Fan", { exact: true }).first().waitFor();
  await page.getByText("Cadence Stairs", { exact: true }).first().waitFor();
  await page.getByText("Sky Lens", { exact: true }).first().waitFor();
  await page.getByText("Cadence Rail", { exact: true }).first().waitFor();
  const hasSolar = true;
  const hasCascade = true;
  const hasLiftArc = true;
  const hasPhraseHooks = true;
  const hasPhraseVariation = true;
  const hasVoiceprints = true;
  const hasElementRoles = true;
  const solarText = await page.locator("body").innerText();
  const solarValence = await page.getByText("Valence", { exact: true }).first().locator("..").innerText();
  await page.screenshot({ path: "/tmp/scales-stage-solar.png", fullPage: true });

  await clearComposition(page);

  await page.getByRole("button", { name: "Dominant7 chord", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: "Harmonic Minor scale", exact: true }).dragTo(stage);
  await page.getByRole("button", { name: "Dim7 chord", exact: true }).dragTo(stage);
  await page.getByText("Phrase Trajectory", { exact: true }).waitFor();
  await page.getByText("Shadow Sink", { exact: true }).first().waitFor();
  await page.getByText("Eclipse Altar", { exact: true }).first().waitFor();
  const hasShadow = true;
  const hasShadowSink = true;
  const shadowValence = await page.getByText("Valence", { exact: true }).first().locator("..").innerText();
  await page.screenshot({ path: "/tmp/scales-stage-shadow.png", fullPage: true });

  const pageText = await page.locator("body").innerText();
  console.log(
    JSON.stringify(
      {
        username,
        appUrl,
        hasGrowthImprint,
        hasNeoSoulImprint,
        hasHarmonicTraits,
        hasTheorySynergy,
        hasCascade,
        hasSolar,
        hasLiftArc,
        hasPhraseHooks,
        hasPhraseVariation,
        hasVoiceprints,
        hasElementRoles,
        hasShadow,
        hasShadowSink,
        hasStageReading: pageText.includes("STAGE READING") || pageText.includes("Stage Reading"),
        hasMoodAxes:
          pageText.includes("VALENCE") &&
          pageText.includes("AROUSAL") &&
          pageText.includes("LUMINOSITY") &&
          pageText.includes("GRIT"),
        solarValence,
        shadowValence
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
