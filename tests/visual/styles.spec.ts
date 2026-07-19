import { expect, test } from "@playwright/test"

const styleIds = [
  "minimalism", "organic-biophilic", "swiss", "editorial", "saas-modern", "linear-inspired",
  "enterprise-dense", "bento-grid", "cinematic-mission-control", "canvas", "node-based",
  "split-pane-workspace", "timeline", "liquid-glass", "aurora-mesh", "monochrome-dark",
  "claymorphism", "neo-brutalism", "collage-scrapbook", "retrofuturism", "terminal",
  "art-deco", "skeuomorphism", "material-3-inspired",
]

for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 1000 }]) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })
    for (const styleId of styleIds) {
      test(styleId, async ({ page }) => {
        await page.goto("/")
        await page.evaluate(() => localStorage.clear())
        await page.reload()
        await page.getByRole("button", { name: "Minimalism", exact: true }).first().click()
        await page.locator(`.style-selector-card[data-style-id="${styleId}"]`).click()
        await expect(page.locator(".app.theme-scope")).toHaveAttribute("data-style-id", styleId)
        const appliedToast = page.locator("[data-sonner-toast]")
        if (await appliedToast.count()) {
          await appliedToast.getByRole("button", { name: "Dismiss", exact: true }).click()
          await expect(appliedToast).toBeHidden()
        }
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.evaluate(() => document.fonts.ready)
        await expect(page).toHaveScreenshot(`${viewport.width}x${viewport.height}/${styleId}.png`, { fullPage: false })
      })
    }
  })
}
