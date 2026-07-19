import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const styleIds = [
  "minimalism", "organic-biophilic", "swiss", "editorial", "saas-modern", "linear-inspired",
  "enterprise-dense", "bento-grid", "cinematic-mission-control", "canvas", "node-based",
  "split-pane-workspace", "timeline", "liquid-glass", "aurora-mesh", "monochrome-dark",
  "claymorphism", "neo-brutalism", "collage-scrapbook", "retrofuturism", "terminal",
  "art-deco", "skeuomorphism", "material-3-inspired",
]

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator(".app.theme-scope")).toBeVisible()
})

test("all 24 presets preserve the desktop shell contract", async ({ page }) => {
  test.setTimeout(90_000)
  await page.getByRole("button", { name: "Minimalism", exact: true }).first().click()
  for (const id of styleIds) {
    await page.locator(`.style-selector-card[data-style-id="${id}"]`).click()
    const app = page.locator(".app.theme-scope")
    await expect(app).toHaveAttribute("data-style-id", id)
    const geometry = await page.evaluate(() => {
      const sidebar = document.querySelector<HTMLElement>(".library-sidebar")!
      const main = document.querySelector<HTMLElement>(".app.theme-scope > main")!
      const sidebarRect = sidebar.getBoundingClientRect()
      const mainRect = main.getBoundingClientRect()
      return {
        sidebarLeft: Math.round(sidebarRect.left),
        sidebarWidth: Math.round(sidebarRect.width),
        mainLeft: Math.round(mainRect.left),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    expect(geometry).toEqual({ sidebarLeft: 0, sidebarWidth: 248, mainLeft: 248, overflow: 0 })
  }
})

test("motion, speed, loading, radii, surface, and type settings propagate", async ({ page }) => {
  await page.getByRole("tab", { name: "Motion" }).click()
  await page.getByRole("radio", { name: /Spring/ }).click()
  await page.getByRole("button", { name: "Slow", exact: true }).click()
  await page.getByRole("radio", { name: /Orbit/ }).click()
  const app = page.locator(".app.theme-scope")
  await expect(app).toHaveAttribute("data-motion-preset", "spring")
  await expect(app).toHaveAttribute("data-motion-speed", "slow")
  await expect(app).toHaveAttribute("data-loading-style", "orbit")

  await page.getByRole("tab", { name: "Layout" }).click()
  await page.getByRole("slider", { name: "Control radius" }).fill("18")
  await page.getByRole("slider", { name: "Surface radius" }).fill("30")
  await page.getByRole("button", { name: "Glass", exact: true }).click()
  await expect(app).toHaveAttribute("data-surface-treatment", "glass")
  await expect(app).toHaveCSS("--radius-control", "18px")
  await expect(app).toHaveCSS("--radius-surface", "30px")

  await page.getByRole("tab", { name: "Type" }).click()
  await page.getByRole("slider", { name: "Heading weight" }).fill("850")
  await page.getByRole("slider", { name: "Body weight" }).fill("500")
  await page.getByRole("slider", { name: "Letter spacing" }).fill("0.02")
  await expect(app).toHaveCSS("--heading-weight", "850")
  await expect(app).toHaveCSS("--body-weight", "500")
  await expect(app).toHaveCSS("--tracking", "0.02em")
})

test("builder essentials support their primary mouse and keyboard paths", async ({ page }) => {
  test.setTimeout(60_000)
  await page.locator("#builder-essentials").scrollIntoViewIfNeeded()
  await expect(page.getByRole("heading", { name: "Builder essentials" })).toBeVisible()

  await page.keyboard.press("Control+k")
  const command = page.getByRole("dialog", { name: "Global command menu" })
  await expect(command).toBeVisible()
  await page.locator("[cmdk-input]").fill("templates")
  await page.keyboard.press("Enter")
  await expect(command).toBeHidden()
  await expect(page.getByText("Last action:").first()).toContainText("Browse templates")

  const combobox = page.getByRole("combobox", { name: "Visual direction" })
  await combobox.click()
  await combobox.fill("not-a-style")
  await expect(page.getByText(/No styles match/i)).toBeVisible()
  await combobox.fill("Swiss")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(combobox).toHaveValue("Swiss")

  await page.getByRole("button", { name: "Left" }).click()
  await page.getByRole("button", { name: "Open left sheet" }).click()
  await expect(page.locator(".builder-sheet--left")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.locator(".builder-sheet--left")).toBeHidden()

  await page.getByRole("button", { name: "Success" }).click()
  await expect(page.getByText("Changes published")).toBeVisible()
  await page.getByRole("button", { name: "Dismiss", exact: true }).click()

  await page.getByRole("button", { name: /Choose a date/ }).click()
  await expect(page.getByRole("dialog", { name: "Launch date calendar" })).toBeVisible()
  await page.keyboard.press("Escape")

  const projectFilter = page.getByPlaceholder("Filter projects…")
  await projectFilter.fill("zzzz")
  await expect(page.getByText(/No projects match/)).toBeVisible()
  await projectFilter.fill("")
  await page.getByRole("checkbox", { name: "Select all rows on this page" }).check()
  await expect(page.getByText("4 selected")).toBeVisible()
  await page.getByRole("button", { name: "Next page" }).click()
  await expect(page.getByText("Page 2 of 3")).toBeVisible()

  const singleSlider = page.getByRole("slider", { name: "Volume" })
  await singleSlider.focus()
  await page.keyboard.press("ArrowRight")
  await expect(singleSlider).toHaveAttribute("aria-valuenow", "63")

  const dropInput = page.locator("input[type=file]")
  await dropInput.setInputFiles({ name: "mockup.png", mimeType: "image/png", buffer: Buffer.from("png") })
  await expect(page.getByText("mockup.png")).toBeVisible()
  await page.getByRole("button", { name: "Remove mockup.png" }).click()
  await expect(page.getByText("No files selected")).toBeVisible()
})

test("reduced motion removes travel and the critical viewport is axe-clean", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.getByRole("tab", { name: "Motion" }).click()
  await expect(page.getByText(/Reduced motion is active/)).toBeVisible()
  const results = await new AxeBuilder({ page }).include("#top").analyze()
  expect(results.violations.filter(({ impact }) => impact === "critical")).toEqual([])
})
