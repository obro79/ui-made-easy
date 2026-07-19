export type StyleCategory = "product" | "layout" | "effects-dark" | "expressive-era" | "system-reference"
export type TypographyRecipe = "neutral-sans" | "editorial-serif" | "geometric-sans" | "humanist-sans" | "mono" | "display"
export type GeometryRecipe = "square" | "subtle" | "rounded" | "pill" | "mixed" | "organic"
export type SurfaceRecipe = "flat" | "outlined" | "raised" | "glass" | "soft" | "layered" | "canvas"
export type DensityRecipe = "compact" | "default" | "comfortable" | "spacious"
export type LayoutRecipe = "document" | "dashboard" | "dense" | "grid" | "workspace" | "mission-control" | "canvas" | "nodes" | "split-pane" | "timeline" | "spatial" | "asymmetric"
export type DecorationRecipe = "none" | "grid" | "mesh" | "glow" | "gradient-border" | "texture" | "hand-drawn" | "chrome"

export type StyleRecipe = {
  typography: TypographyRecipe
  geometry: GeometryRecipe
  surface: SurfaceRecipe
  density: DensityRecipe
  layout: LayoutRecipe
  decoration: DecorationRecipe
  contrast: "soft" | "balanced" | "high"
}

export type StyleAuthenticitySpec = {
  /** Historical/product/design-system basis that makes the style recognizable. */
  basis: readonly string[]
  /** High-signal visual features that should appear in a representative screen. */
  signatures: readonly string[]
  /** Common shortcuts that turn the style into a caricature or another style. */
  mustAvoid: readonly string[]
  /** Product contexts where the style is naturally effective. */
  bestFor: readonly string[]
  /** Style-specific accessibility constraint beyond baseline WCAG AA. */
  a11y: string
}

export type StylePresetDefinition = {
  id: string
  name: string
  category: StyleCategory
  description: string
  tags: readonly string[]
  seed: `#${string}`
  recipe: StyleRecipe
  authenticity: StyleAuthenticitySpec
}

export const STYLE_CATEGORY_LABELS: Record<StyleCategory, string> = {
  product: "Product",
  layout: "Layout",
  "effects-dark": "Effects & dark",
  "expressive-era": "Expressive & era",
  "system-reference": "System references",
}
