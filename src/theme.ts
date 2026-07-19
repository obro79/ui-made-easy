import { STYLE_PRESETS, getStylePreset, isStylePresetId, resolveStylePresetId } from "./presets"

export type ThemeMode = "light" | "dark"
export type Density = "compact" | "default" | "comfortable"
export type Shadow = "none" | "soft" | "medium" | "strong"
export type ContentWidth = "narrow" | "standard" | "wide"

export type SemanticPalette = {
  background: string
  surface: string
  foreground: string
  mutedForeground: string
  border: string
  primary: string
  primaryForeground: string
  secondary: string
  destructive: string
  success: string
  focusRing: string
}

export type ThemeConfig = {
  version: 2
  preset: string
  light: SemanticPalette
  dark: SemanticPalette
  density: Density
  baseSpacing: number
  radius: number
  shadow: Shadow
  borderWidth: number
  typeScale: number
  contentWidth: ContentWidth
  headingFont: string
  bodyFont: string
}

export type ContrastCheck = {
  foreground: string
  background: string
  ratio: number
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
}

export const THEME_STORAGE_KEY = "ui-component-gallery.theme.v2"
export const THEME_VERSION = 2 as const
const LEGACY_THEME_STORAGE_KEY = "ui-component-gallery.theme.v1"
export const DEFAULT_HEADING_FONT = "Manrope, ui-sans-serif, system-ui, sans-serif"
export const DEFAULT_BODY_FONT = "Inter, ui-sans-serif, system-ui, sans-serif"

const HEX = /^#[\da-f]{6}$/i
const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value))

export function normalizeHex(value: string): string | null {
  const candidate = value.trim().startsWith("#") ? value.trim() : `#${value.trim()}`
  const expanded = /^#[\da-f]{3}$/i.test(candidate)
    ? `#${candidate[1]}${candidate[1]}${candidate[2]}${candidate[2]}${candidate[3]}${candidate[3]}`
    : candidate
  return HEX.test(expanded) ? expanded.toLowerCase() : null
}

export function isValidHex(value: string): boolean {
  return normalizeHex(value) !== null
}

type RGB = { r: number; g: number; b: number }

function toRgb(hex: string): RGB {
  const valid = normalizeHex(hex)
  if (!valid) throw new Error(`Invalid hex color: ${hex}`)
  return {
    r: Number.parseInt(valid.slice(1, 3), 16),
    g: Number.parseInt(valid.slice(3, 5), 16),
    b: Number.parseInt(valid.slice(5, 7), 16),
  }
}

function toHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((channel) => Math.round(clamp(channel)).toString(16).padStart(2, "0")).join("")}`
}

export function mixColors(color: string, target: string, amount: number): string {
  const from = toRgb(color)
  const to = toRgb(target)
  const weight = Math.min(1, Math.max(0, amount))
  return toHex({
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight,
  })
}

function linearChannel(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color: string): number {
  const { r, g, b } = toRgb(color)
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b)
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** UI-friendly alias retained as the public contrast API. */
export const getContrastRatio = contrastRatio

export function checkContrast(foreground: string, background: string): ContrastCheck {
  const ratio = contrastRatio(foreground, background)
  return { foreground, background, ratio, aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7 }
}

export function bestContrastingColor(background: string, candidates = ["#ffffff", "#111111"]): string {
  if (candidates.length === 0) throw new Error("At least one contrast candidate is required")
  return candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background) ? candidate : best,
  )
}

export function generatePalettes(seed: string): Pick<ThemeConfig, "light" | "dark"> {
  const primary = normalizeHex(seed)
  if (!primary) throw new Error(`Invalid seed color: ${seed}`)
  const lightBackground = mixColors(primary, "#ffffff", 0.975)
  const lightSurface = mixColors(primary, "#ffffff", 0.995)
  const darkBackground = mixColors(primary, "#080a0d", 0.88)
  const darkSurface = mixColors(primary, "#15191f", 0.80)
  return {
    light: {
      background: lightBackground,
      surface: lightSurface,
      foreground: "#17191c",
      mutedForeground: mixColors(primary, "#60656c", 0.82),
      border: mixColors(primary, "#d9dde2", 0.86),
      primary,
      primaryForeground: bestContrastingColor(primary),
      secondary: mixColors(primary, "#ffffff", 0.88),
      destructive: "#c93636",
      success: "#16845b",
      focusRing: mixColors(primary, "#ffffff", 0.18),
    },
    dark: {
      background: darkBackground,
      surface: darkSurface,
      foreground: "#f4f6f8",
      mutedForeground: mixColors(primary, "#b8bec8", 0.78),
      border: mixColors(primary, "#424954", 0.74),
      primary: mixColors(primary, "#ffffff", 0.24),
      primaryForeground: bestContrastingColor(mixColors(primary, "#ffffff", 0.24)),
      secondary: mixColors(primary, darkSurface, 0.74),
      destructive: "#fa7b7b",
      success: "#54c99b",
      focusRing: mixColors(primary, "#ffffff", 0.34),
    },
  }
}

/** Generate matching light and dark semantic palettes from one seed color. */
export const generatePalette = generatePalettes

type PresetStyle = Pick<ThemeConfig, "density" | "baseSpacing" | "radius" | "shadow" | "borderWidth" | "typeScale" | "contentWidth" | "headingFont" | "bodyFont">
const DEFAULT_STYLE: PresetStyle = { density: "default", baseSpacing: 4, radius: 8, shadow: "soft", borderWidth: 1, typeScale: 1, contentWidth: "standard", headingFont: DEFAULT_HEADING_FONT, bodyFont: DEFAULT_BODY_FONT }
export const PRESET_NAMES = Object.freeze(STYLE_PRESETS.map((preset) => preset.name))

const typographyStyle = (recipe: string): Pick<PresetStyle, "headingFont" | "bodyFont" | "typeScale"> => ({
  headingFont: recipe === "editorial-serif" ? "'Playfair Display', Georgia, serif" : recipe === "mono" ? "'DM Mono', ui-monospace, monospace" : recipe === "display" ? "'Space Grotesk', Manrope, sans-serif" : recipe === "humanist-sans" ? "'Source Sans 3', Arial, sans-serif" : recipe === "geometric-sans" ? "Manrope, ui-sans-serif, sans-serif" : DEFAULT_HEADING_FONT,
  bodyFont: recipe === "mono" ? "'DM Mono', ui-monospace, monospace" : recipe === "humanist-sans" ? "'Source Sans 3', Arial, sans-serif" : DEFAULT_BODY_FONT,
  typeScale: recipe === "display" ? 1.1 : recipe === "editorial-serif" ? 1.06 : recipe === "mono" ? .95 : 1,
})

const recipeStyle = (preset: (typeof STYLE_PRESETS)[number]): PresetStyle => {
  const { recipe } = preset
  const radius = { square: 0, subtle: 6, rounded: 14, pill: 24, mixed: 10, organic: 20 }[recipe.geometry]
  const density: Density = recipe.density === "compact" ? "compact" : recipe.density === "spacious" ? "comfortable" : recipe.density
  return { ...DEFAULT_STYLE, ...typographyStyle(recipe.typography), density, baseSpacing: recipe.density === "spacious" ? 6 : recipe.density === "compact" ? 3 : 4, radius,
    shadow: recipe.surface === "flat" || recipe.surface === "outlined" ? "none" : recipe.surface === "raised" || recipe.surface === "layered" ? "medium" : "soft",
    borderWidth: recipe.geometry === "square" && recipe.contrast === "high" ? 2 : recipe.surface === "flat" ? 0 : 1,
    contentWidth: recipe.layout === "document" ? "narrow" : ["workspace", "dense", "mission-control", "canvas", "nodes", "split-pane", "asymmetric"].includes(recipe.layout) ? "wide" : "standard" }
}

export function createThemeFromPreset(preset = "minimalism"): ThemeConfig {
  const definition = getStylePreset(preset) ?? STYLE_PRESETS[0]
  return { version: THEME_VERSION, preset: definition.id, ...generatePalettes(definition.seed), ...recipeStyle(definition) }
}

export const DEFAULT_THEME: ThemeConfig = createThemeFromPreset()

const PALETTE_KEYS: (keyof SemanticPalette)[] = [
  "background", "surface", "foreground", "mutedForeground", "border", "primary",
  "primaryForeground", "secondary", "destructive", "success", "focusRing",
]

export function isThemeConfig(value: unknown): value is ThemeConfig {
  if (!value || typeof value !== "object") return false
  const theme = value as Partial<ThemeConfig>
  const validPalette = (palette: unknown) => Boolean(palette && typeof palette === "object" &&
    PALETTE_KEYS.every((key) => typeof (palette as Record<string, unknown>)[key] === "string" && isValidHex((palette as Record<string, string>)[key])))
  return theme.version === THEME_VERSION && typeof theme.preset === "string" && isStylePresetId(theme.preset) &&
    (theme.density === "compact" || theme.density === "default" || theme.density === "comfortable") &&
    typeof theme.baseSpacing === "number" && theme.baseSpacing >= 2 && theme.baseSpacing <= 8 &&
    typeof theme.radius === "number" && theme.radius >= 0 && theme.radius <= 24 &&
    (theme.shadow === "none" || theme.shadow === "soft" || theme.shadow === "medium" || theme.shadow === "strong") &&
    typeof theme.borderWidth === "number" && theme.borderWidth >= 0 && theme.borderWidth <= 3 &&
    typeof theme.typeScale === "number" && theme.typeScale >= 0.9 && theme.typeScale <= 1.15 &&
    typeof theme.headingFont === "string" && theme.headingFont.trim().length > 0 &&
    typeof theme.bodyFont === "string" && theme.bodyFont.trim().length > 0 &&
    (theme.contentWidth === "narrow" || theme.contentWidth === "standard" || theme.contentWidth === "wide") &&
    validPalette(theme.light) && validPalette(theme.dark)
}

export function migrateThemeConfig(value: unknown): ThemeConfig | null {
  if (isThemeConfig(value)) return value
  if (!value || typeof value !== "object" || ![1, 2].includes(Number((value as { version?: unknown }).version))) return null
  const legacy = value as Record<string, unknown>
  const candidate = { ...DEFAULT_STYLE, ...legacy, version: THEME_VERSION,
    preset: resolveStylePresetId(String(legacy.preset ?? "minimalism")),
    headingFont: typeof legacy.headingFont === "string" ? legacy.headingFont : DEFAULT_HEADING_FONT,
    bodyFont: typeof legacy.bodyFont === "string" ? legacy.bodyFont : DEFAULT_BODY_FONT } as ThemeConfig
  return isThemeConfig(candidate) ? candidate : null
}

export function loadTheme(storage: Pick<Storage, "getItem"> | null = typeof localStorage === "undefined" ? null : localStorage): ThemeConfig {
  if (!storage) return structuredClone(DEFAULT_THEME)
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY) ?? storage.getItem(LEGACY_THEME_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return migrateThemeConfig(parsed) ?? structuredClone(DEFAULT_THEME)
  } catch {
    return structuredClone(DEFAULT_THEME)
  }
}

export function saveTheme(theme: ThemeConfig, storage: Pick<Storage, "setItem"> | null = typeof localStorage === "undefined" ? null : localStorage): boolean {
  if (!storage || !isThemeConfig(theme)) return false
  try { storage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme)); return true } catch { return false }
}

const kebab = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

export function spacingScale(baseSpacing: number, density: Density): Record<string, string> {
  const densityFactor = density === "compact" ? 0.8 : density === "comfortable" ? 1.25 : 1
  const multiples = [0, 1, 2, 3, 4, 6, 8, 12, 16]
  return Object.fromEntries(multiples.map((multiple) => [`space-${multiple}`, `${Number((baseSpacing * multiple * densityFactor).toFixed(2))}px`]))
}

export function themeVariables(theme: ThemeConfig, mode: ThemeMode): Record<string, string> {
  const palette = theme[mode]
  const definition = getStylePreset(theme.preset) ?? STYLE_PRESETS[0]
  const semantic = Object.fromEntries(PALETTE_KEYS.map((key) => [`${kebab(key)}`, palette[key]]))
  const shadow = { none: "none", soft: "0 2px 10px rgb(0 0 0 / 0.08)", medium: "0 8px 24px rgb(0 0 0 / 0.14)", strong: "0 14px 40px rgb(0 0 0 / 0.24)" }[theme.shadow]
  const contentMax = { narrow: "720px", standard: "1120px", wide: "1440px" }[theme.contentWidth]
  return {
    ...semantic,
    ...spacingScale(theme.baseSpacing, theme.density),
    // Compatibility aliases for the existing gallery components.
    bg: palette.background, surface: palette.surface, ink: palette.foreground,
    muted: palette.mutedForeground, line: palette.border, accent: palette.primary,
    "accent-light": palette.secondary, danger: palette.destructive,
    radius: `${theme.radius}px`, "radius-sm": `${Math.max(0, theme.radius - 4)}px`,
    "radius-md": `${theme.radius}px`, "radius-lg": `${theme.radius + 4}px`, "radius-xl": `${theme.radius + 8}px`,
    shadow, "shadow-card": shadow, "border-width": `${theme.borderWidth}px`,
    "type-scale": String(theme.typeScale), "content-max": contentMax, "content-width": contentMax,
    "font-heading": theme.headingFont, "font-body": theme.bodyFont,
    "font-mono": "'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    "text-xs": `calc(11px * ${theme.typeScale})`, "text-sm": `calc(12px * ${theme.typeScale})`,
    "text-base": `calc(14px * ${theme.typeScale})`, "text-lg": `calc(17px * ${theme.typeScale})`,
    "text-title": `calc(28px * ${theme.typeScale})`, "text-display": `calc(58px * ${theme.typeScale})`,
    "line-body": definition.recipe.typography === "editorial-serif" ? "1.7" : "1.55",
    "heading-weight": definition.recipe.typography === "display" ? "800" : definition.recipe.typography === "editorial-serif" ? "600" : "700",
    "heading-tracking": definition.recipe.typography === "display" ? "-0.055em" : "-0.035em",
    "surface-padding": `var(--space-${theme.density === "compact" ? 4 : theme.density === "comfortable" ? 8 : 6})`,
    "layout-gap": `var(--space-${theme.density === "compact" ? 3 : theme.density === "comfortable" ? 6 : 4})`,
    "section-gap": `var(--space-${theme.density === "compact" ? 8 : 12})`,
    "control-height": theme.density === "compact" ? "34px" : theme.density === "comfortable" ? "46px" : "40px",
    "control-padding-x": `var(--space-${theme.density === "compact" ? 3 : 4})`,
    "radius-control": `${theme.radius}px`, "radius-surface": `${theme.radius + 4}px`, "radius-full": "999px",
    "motion-fast": "150ms", "motion-base": "240ms",
  }
}

export function applyTheme(theme: ThemeConfig, mode: ThemeMode, target: HTMLElement): void {
  for (const [name, value] of Object.entries(themeVariables(theme, mode))) target.style.setProperty(`--${name}`, value)
  target.dataset.themeMode = mode
  target.dataset.density = theme.density
  target.dataset.themeDensity = theme.density
}

function cssBlock(selector: string, variables: Record<string, string>): string {
  const declarations = Object.entries(variables).map(([name, value]) => `  --${name}: ${value};`).join("\n")
  return `${selector} {\n${declarations}\n}`
}

export function exportThemeCss(theme: ThemeConfig): string {
  return `${cssBlock(":root", themeVariables(theme, "light"))}\n\n${cssBlock(".dark", themeVariables(theme, "dark"))}\n`
}

export function auditThemeContrast(theme: ThemeConfig, mode: ThemeMode): Record<string, ContrastCheck> {
  const palette = theme[mode]
  return {
    "foreground/background": checkContrast(palette.foreground, palette.background),
    "muted/surface": checkContrast(palette.mutedForeground, palette.surface),
    "primary/primary-foreground": checkContrast(palette.primaryForeground, palette.primary),
    "destructive/background": checkContrast(palette.destructive, palette.background),
  }
}
