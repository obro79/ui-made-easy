import { afterEach, describe, expect, it } from "vitest"
import {
  CURATED_STYLE_IDS,
  STYLE_PRESET_COUNT,
  STYLE_PRESET_IDS,
  STYLE_PRESETS,
} from "../src/presets"
import {
  THEME_STORAGE_KEY,
  createThemeFromPreset,
  exportThemeCss,
  isThemeConfig,
  loadTheme,
  migrateThemeConfig,
  applyTheme,
  themeVariables,
} from "../src/theme"
import { MOTION_PRESETS, MOTION_RECIPES, MOTION_SPEEDS, resolveMotionRecipe } from "../src/motion"
import { VARIANTS_STORAGE_KEY, loadVariants } from "../src/variants"

const EXPECTED_CURATED_STYLE_IDS = [
  "minimalism",
  "swiss",
  "editorial",
  "saas-modern",
  "linear-inspired",
  "enterprise-dense",
  "organic-biophilic",
  "bento-grid",
  "cinematic-mission-control",
  "canvas",
  "node-based",
  "split-pane-workspace",
  "timeline",
  "liquid-glass",
  "aurora-mesh",
  "monochrome-dark",
  "claymorphism",
  "neo-brutalism",
  "collage-scrapbook",
  "retrofuturism",
  "terminal",
  "art-deco",
  "skeuomorphism",
  "material-3-inspired",
] as const

function asV2(preset = "editorial") {
  const current = createThemeFromPreset(preset)
  const {
    controlRadius: _controlRadius,
    surfaceRadius: _surfaceRadius,
    headingWeight: _headingWeight,
    bodyWeight: _bodyWeight,
    tracking: _tracking,
    motionPreset: _motionPreset,
    motionSpeed: _motionSpeed,
    loadingStyle: _loadingStyle,
    surfaceTreatment: _surfaceTreatment,
    ...legacy
  } = current
  return { ...legacy, version: 2 as const }
}

afterEach(() => {
  document.documentElement.removeAttribute("style")
  for (const name of ["data-theme-mode", "data-theme-version", "data-motion-preset", "data-motion-speed", "data-motion-overlay", "data-loading-style", "data-surface-treatment"]) {
    document.documentElement.removeAttribute(name)
  }
})

describe("ThemeConfig v3", () => {
  it("keeps the curated catalog at exactly 24 complete, uniquely named presets", () => {
    const ids = STYLE_PRESETS.map(({ id }) => id)
    const names = STYLE_PRESETS.map(({ name }) => name)

    expect(STYLE_PRESET_COUNT).toBe(24)
    expect(STYLE_PRESETS).toHaveLength(24)
    expect(CURATED_STYLE_IDS).toEqual(EXPECTED_CURATED_STYLE_IDS)
    expect(STYLE_PRESET_IDS).toEqual(EXPECTED_CURATED_STYLE_IDS)
    expect(ids).toEqual(EXPECTED_CURATED_STYLE_IDS)
    expect(new Set(ids).size).toBe(24)
    expect(new Set(names).size).toBe(24)

    for (const preset of STYLE_PRESETS) {
      expect(preset.name.trim()).not.toBe("")
      expect(preset.description.trim()).not.toBe("")
      expect(preset.tags.length).toBeGreaterThanOrEqual(3)
      expect(preset.authenticity.basis.length).toBeGreaterThanOrEqual(2)
      expect(preset.authenticity.signatures.length).toBeGreaterThanOrEqual(3)
      expect(preset.authenticity.signatures.length).toBeLessThanOrEqual(5)
      expect(preset.authenticity.mustAvoid.length).toBeGreaterThanOrEqual(2)
      expect(preset.authenticity.bestFor.length).toBeGreaterThanOrEqual(2)
      expect(preset.authenticity.a11y.trim()).not.toBe("")
    }
  })

  it("derives a complete valid v3 theme for every current preset", () => {
    for (const preset of STYLE_PRESETS) {
      const theme = createThemeFromPreset(preset.id)
      expect(theme.version).toBe(3)
      expect(isThemeConfig(theme)).toBe(true)
      expect(theme.surfaceRadius).toBeGreaterThanOrEqual(theme.controlRadius)
      expect(MOTION_PRESETS).toContain(theme.motionPreset)
    }
  })

  it.each([1, 2] as const)("migrates v%s geometry while deriving the new preset-aware roles", (version) => {
    const legacy = { ...asV2("editorial"), version, radius: 12 }
    const migrated = migrateThemeConfig(legacy)

    expect(migrated).not.toBeNull()
    expect(migrated).toMatchObject({
      version: 3,
      preset: "editorial",
      radius: 12,
      controlRadius: 12,
      surfaceRadius: 16,
      motionPreset: "fade",
      motionSpeed: "normal",
      loadingStyle: "skeleton",
      surfaceTreatment: "preset",
    })
  })

  it("preserves valid v2 customization and replaces invalid v3-only fields from the preset recipe", () => {
    const baseline = createThemeFromPreset("liquid-glass")
    const legacy = {
      ...asV2("liquid-glass"),
      version: 2 as const,
      density: "compact",
      baseSpacing: 5,
      radius: 13,
      shadow: "strong",
      borderWidth: 2,
      typeScale: 1.08,
      contentWidth: "wide",
      headingFont: "Legacy Display, serif",
      bodyFont: "Legacy Body, sans-serif",
      controlRadius: 999,
      surfaceRadius: -1,
      headingWeight: "heavy",
      bodyWeight: 200,
      tracking: 2,
      motionPreset: "zoom",
      motionSpeed: "instant",
      loadingStyle: "wheel",
      surfaceTreatment: "chrome",
    }
    const migrated = migrateThemeConfig(legacy)

    expect(migrated).not.toBeNull()
    expect(migrated).toMatchObject({
      version: 3,
      preset: "liquid-glass",
      density: "compact",
      baseSpacing: 5,
      radius: 13,
      controlRadius: 13,
      surfaceRadius: 21,
      shadow: "strong",
      borderWidth: 2,
      typeScale: 1.08,
      contentWidth: "wide",
      headingFont: "Legacy Display, serif",
      bodyFont: "Legacy Body, sans-serif",
      headingWeight: baseline.headingWeight,
      bodyWeight: baseline.bodyWeight,
      tracking: baseline.tracking,
      motionPreset: baseline.motionPreset,
      motionSpeed: baseline.motionSpeed,
      loadingStyle: baseline.loadingStyle,
      surfaceTreatment: baseline.surfaceTreatment,
    })
    expect(isThemeConfig(migrated)).toBe(true)
  })

  it("maps a retired v2 preset to its supported v3 recipe", () => {
    const migrated = migrateThemeConfig({ ...asV2("liquid-glass"), version: 2, preset: "glassmorphism" })

    expect(migrated).not.toBeNull()
    expect(migrated?.preset).toBe("liquid-glass")
    expect(migrated?.version).toBe(3)
  })

  it("falls back to a valid legacy key when the v3 entry is corrupt", () => {
    const values = new Map<string, string>([
      [THEME_STORAGE_KEY, "{not-json"],
      ["ui-component-gallery.theme.v2", JSON.stringify(asV2("terminal"))],
    ])
    const loaded = loadTheme({ getItem: (key) => values.get(key) ?? null })

    expect(loaded.version).toBe(3)
    expect(loaded.preset).toBe("terminal")
    expect(loaded.loadingStyle).toBe("bars")
  })

  it("exposes resolved motion, surface, typography, and loading contracts", () => {
    const theme = {
      ...createThemeFromPreset("minimalism"),
      motionPreset: "spring" as const,
      motionSpeed: "fast" as const,
      loadingStyle: "orbit" as const,
      surfaceTreatment: "glass" as const,
      controlRadius: 9,
      surfaceRadius: 21,
      headingWeight: 650,
      bodyWeight: 450,
      tracking: 0.015,
    }
    const variables = themeVariables(theme, "light")
    const target = document.createElement("div")
    applyTheme(theme, "light", target)

    expect(variables).toMatchObject({
      "control-radius": "9px",
      "surface-radius": "21px",
      "radius-control": "9px",
      "radius-surface": "21px",
      "heading-weight": "650",
      "body-weight": "450",
      tracking: "0.015em",
      "motion-duration": "294ms",
      "motion-overlay-behavior": "fade-scale",
      "loading-style": "orbit",
      "surface-treatment": "glass",
    })
    expect(target.dataset).toMatchObject({
      themeVersion: "3",
      motionPreset: "spring",
      motionSpeed: "fast",
      motionOverlay: "fade-scale",
      loadingStyle: "orbit",
      surfaceTreatment: "glass",
    })
    expect(exportThemeCss(theme)).toContain("data-motion-preset=\"spring\"")
    expect(exportThemeCss(theme)).toContain("--motion-duration: 294ms;")
  })
})

describe("motion recipes", () => {
  it("has one complete six-recipe registry with intentional motion semantics", () => {
    expect(MOTION_PRESETS).toEqual(["none", "fade", "rise", "drop", "float", "spring"])
    expect(MOTION_SPEEDS).toEqual(["fast", "normal", "slow"])
    expect(Object.keys(MOTION_RECIPES)).toEqual([...MOTION_PRESETS])
    expect(new Set(MOTION_PRESETS).size).toBe(6)

    expect(MOTION_RECIPES).toMatchObject({
      none: { durationMs: 0, distancePx: 0, scaleFrom: 1, overlayBehavior: "none" },
      fade: { distancePx: 0, scaleFrom: 1, overlayBehavior: "fade" },
      rise: { distancePx: 8, scaleFrom: 1, overlayBehavior: "fade-rise" },
      drop: { distancePx: -8, scaleFrom: 1, overlayBehavior: "fade-drop" },
      float: { distancePx: 6, scaleFrom: 0.985, overlayBehavior: "fade-float" },
      spring: { distancePx: 10, scaleFrom: 0.92, overlayBehavior: "fade-scale" },
    })

    for (const preset of MOTION_PRESETS) {
      const recipe = MOTION_RECIPES[preset]
      expect(recipe.durationMs).toBeGreaterThanOrEqual(0)
      expect(recipe.easing.trim()).not.toBe("")
      expect(recipe.scaleFrom).toBeGreaterThan(0)
      expect(recipe.scaleFrom).toBeLessThanOrEqual(1)
    }
  })

  it.each(MOTION_PRESETS)("applies speed to %s without changing its recipe behavior", (preset) => {
    const normal = resolveMotionRecipe(preset, "normal")
    const fast = resolveMotionRecipe(preset, "fast")
    const slow = resolveMotionRecipe(preset, "slow")

    if (normal.durationMs === 0) {
      expect([fast.durationMs, slow.durationMs]).toEqual([0, 0])
    } else {
      expect(fast.durationMs).toBeLessThan(normal.durationMs)
      expect(slow.durationMs).toBeGreaterThan(normal.durationMs)
    }
    expect(fast).toMatchObject({
      preset,
      speed: "fast",
      easing: normal.easing,
      distancePx: normal.distancePx,
      scaleFrom: normal.scaleFrom,
      overlayBehavior: normal.overlayBehavior,
    })
  })
})

describe("saved variant migration", () => {
  it.each([1, 2] as const)("loads a v%s saved layout whose nested theme has the same version", (version) => {
    const store = {
      version,
      variants: [{
        id: "legacy-layout",
        name: "Legacy layout",
        config: { ...asV2("liquid-glass"), version },
        ...(version === 2 ? { previewMode: "dark" } : {}),
        updatedAt: "2026-07-19T12:00:00.000Z",
      }],
    }
    const variants = loadVariants({ getItem: (key) => key === VARIANTS_STORAGE_KEY ? JSON.stringify(store) : null })

    expect(variants).toHaveLength(1)
    expect(variants[0].config.version).toBe(3)
    expect(variants[0].config.preset).toBe("liquid-glass")
    expect(variants[0].config.motionPreset).toBe("float")
    expect(variants[0].previewMode).toBe(version === 2 ? "dark" : "light")
  })
})
