import { readFileSync } from "node:fs"

const presetsSource = readFileSync(new URL("../src/presets.ts", import.meta.url), "utf8")
const recipeCssSource = readFileSync(new URL("../src/authentic-styles.css", import.meta.url), "utf8")
const curatedCssSource = readFileSync(new URL("../src/curated-styles.css", import.meta.url), "utf8")
const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
const customizerSource = readFileSync(new URL("../src/components/ThemeCustomizer.tsx", import.meta.url), "utf8")
const paletteSource = readFileSync(new URL("../src/components/PaletteWizard.tsx", import.meta.url), "utf8")
const tabsSource = readFileSync(new URL("../src/components/ui/tabs.tsx", import.meta.url), "utf8")
const customizerCssSource = readFileSync(new URL("../src/theme-customizer.css", import.meta.url), "utf8")
const paletteCssSource = readFileSync(new URL("../src/palette-wizard.css", import.meta.url), "utf8")
const buttonSource = readFileSync(new URL("../src/components/ui/button.tsx", import.meta.url), "utf8")
const extendedGallerySource = readFileSync(new URL("../src/components/ExtendedGallery.tsx", import.meta.url), "utf8")
const variantsSource = readFileSync(new URL("../src/variants.ts", import.meta.url), "utf8")
const comparisonSource = readFileSync(new URL("../src/components/ComparisonWorkspace.tsx", import.meta.url), "utf8")
const exportSource = readFileSync(new URL("../src/export-project.ts", import.meta.url), "utf8")
const themeSource = readFileSync(new URL("../src/theme.ts", import.meta.url), "utf8")
const structuralSource = readFileSync(new URL("../src/components/StructuralStyleDemo.tsx", import.meta.url), "utf8")
const baseCssSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8")
const overrideCssSource = readFileSync(new URL("../src/customization-overrides.css", import.meta.url), "utf8")

const definedPresetIds = [...presetsSource.matchAll(/preset\("([a-z0-9-]+)"/g)].map((match) => match[1])
const curatedBlock = presetsSource.match(/CURATED_STYLE_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const presetIds = curatedBlock ? [...curatedBlock[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]) : []
const uniquePresets = new Set(presetIds)

const parseMap = (name) => {
  const block = presetsSource.match(new RegExp(`${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!block) return null
  return new Map([...block[1].matchAll(/(?:"([^"]+)"|([a-zA-Z][a-zA-Z0-9-]*))\s*:\s*"([a-z0-9-]+)"/g)]
    .map((match) => [match[1] ?? match[2], match[3]]))
}

const legacyMigrations = parseMap("LEGACY_PRESET_MAP")
const retiredMigrations = parseMap("RETIRED_PRESET_MAP")

const fail = (message) => { throw new Error(`Style catalog validation failed: ${message}`) }
if (presetIds.length !== 24 || uniquePresets.size !== 24) fail(`expected 24 unique curated presets, found ${presetIds.length}/${uniquePresets.size}`)
if (definedPresetIds.length !== 44 || new Set(definedPresetIds).size !== 44) fail(`expected 44 unique source definitions, found ${definedPresetIds.length}/${new Set(definedPresetIds).size}`)
for (const id of uniquePresets) if (!definedPresetIds.includes(id)) fail(`curated preset ${id} has no definition`)
for (const field of ["basis", "signatures", "mustAvoid", "bestFor", "a11y"]) {
  if (!presetsSource.includes(field)) fail(`missing authenticity field ${field}`)
}
if (!legacyMigrations) fail("missing or unreadable legacy preset migration map")
if (!retiredMigrations) fail("missing or unreadable retired preset migration map")

const assertCuratedTargets = (map, label) => {
  for (const [source, target] of map) {
    if (!uniquePresets.has(target)) fail(`${label} migration ${source} targets non-curated preset ${target}`)
  }
}
assertCuratedTargets(legacyMigrations, "legacy")
assertCuratedTargets(retiredMigrations, "retired")

const expectedRetiredIds = definedPresetIds.filter((id) => !uniquePresets.has(id))
if (retiredMigrations.size !== expectedRetiredIds.length) {
  fail(`expected ${expectedRetiredIds.length} retired migrations, found ${retiredMigrations.size}`)
}
for (const id of expectedRetiredIds) if (!retiredMigrations.has(id)) fail(`retired preset ${id} has no migration`)
for (const id of retiredMigrations.keys()) if (!expectedRetiredIds.includes(id)) fail(`retired migration ${id} is not a retired source definition`)

const substantiveCss = curatedCssSource.split("/* Selector thumbnails")[0]
for (const id of uniquePresets) {
  if (!recipeCssSource.includes(`[data-style-id="${id}"]`)) fail(`missing base recipe signature for ${id}`)
  const signatureCount = [...substantiveCss.matchAll(new RegExp(`data-style-id="${id}"`, "g"))].length
  if (signatureCount < 3) fail(`curated style ${id} has only ${signatureCount} substantive CSS signatures; expected at least 3`)
  if (!curatedCssSource.includes(`.style-selector-card[data-style-id="${id}"]`)) fail(`missing selector-thumbnail treatment for ${id}`)
}

const requiredGlobalGuards = [
  "@media (min-width: 851px)",
  "@media (max-width: 1180px)", "@media (max-width: 850px)", "@media (max-width: 520px)",
  "@media (prefers-reduced-motion: reduce)", "@media (forced-colors: active)",
  ".app.theme-scope[data-layout] > main",
  "width: calc(100% - 248px)",
  "margin-left: 248px",
  ".app.theme-scope[data-layout] main { width: 100%; max-width: none; margin: 0; }",
]
for (const guard of requiredGlobalGuards) if (!curatedCssSource.includes(guard)) fail(`missing responsive/accessibility guard: ${guard}`)
if (recipeCssSource.includes("> :is(aside,main)")) fail("decorative backdrop must not pull the fixed sidebar back into document flow")
if (appSource.includes("<span>UI</span>")) fail("sidebar brand must not restore the removed UI tile")
if (!appSource.includes('<aside className="library-sidebar">') || !baseCssSource.includes(".library-sidebar{width:248px")) {
  fail("the workbench rail must use its dedicated library-sidebar contract")
}
if (/(^|[},])aside\{/.test(baseCssSource)) fail("generic aside rules must not capture structural inspectors or exports")

if (!buttonSource.includes('`button-size-${size}`') || buttonSource.includes('`button-${size}`')) {
  fail("button size classes must remain namespaced away from visual variants")
}
if (!buttonSource.includes('type = "button"')) fail("the Button primitive must not submit forms by default")
if (/button-(?:outline|ghost|destructive) button-default/.test(extendedGallerySource)) {
  fail("manual button classes reintroduce the default variant/size collision")
}
for (const size of ["sm", "default", "lg"]) {
  if (!overrideCssSource.includes(`.button-size-${size}`)) fail(`missing token-aware ${size} button sizing`)
}
if (!recipeCssSource.includes('.spec-section > :not(.section-heading) { grid-column: 2;')) {
  fail("two-column recipes must pin every specimen to the content rail")
}
if (/(^|[},])header\{/.test(baseCssSource) || /\] header\s*\{/.test(recipeCssSource)) {
  fail("page-level header recipes must be scoped to .page-hero")
}
if (baseCssSource.includes("overflow-x:clip")) fail("horizontal overflow must not be hidden with clipping")
if (appSource.indexOf('import "./customization-overrides.css"') < appSource.indexOf('import "./curated-styles.css"')) {
  fail("the explicit customization contract must load after curated preset CSS")
}
for (const retiredImport of ['import "./style-presets.css"', 'import "./style-presets-extra.css"']) {
  if (appSource.includes(retiredImport)) fail(`dead legacy stylesheet is still shipped: ${retiredImport}`)
}
for (const contract of [
  'data-content-width-overridden={manualAxes.contentWidth}',
  'data-content-width-overridden="true"',
  'font-size: var(--hero-size, var(--text-display, 58px))',
  '--hero-size: clamp(calc(64px * var(--type-scale))',
]) {
  if (!`${appSource}\n${overrideCssSource}\n${curatedCssSource}`.includes(contract)) {
    fail(`missing authentic preset/manual override cascade contract: ${contract}`)
  }
}

for (const contract of ["previewMode: ThemeMode", "VARIANTS_VERSION = 2", "LEGACY_VARIANTS_STORAGE_KEY", "preferredThemeMode(config.preset)"]) {
  if (!variantsSource.includes(contract)) fail(`saved variants are missing mode migration contract: ${contract}`)
}
if (comparisonSource.includes("mode: ThemeMode") || !comparisonSource.includes("variant.previewMode")) {
  fail("comparison previews must render each saved variant in its own mode")
}
if (!comparisonSource.includes("createPortal") || !comparisonSource.includes('event.key !== "Tab"')) {
  fail("comparison workspace must portal and trap focus")
}
if (exportSource.includes('<div className="app theme-scope"') || !exportSource.includes("exported-theme-scope")) {
  fail("exported pages must not inherit the workbench sidebar offset")
}
for (const contract of ['import("jszip")', "generateStructuralDemoSource", 'path: "src/components/StructuralStyleDemo.tsx"', 'path: "src/structural-style-demo.css"']) {
  if (!exportSource.includes(contract)) fail(`export bundle is missing its runtime/structural contract: ${contract}`)
}
if (!exportSource.includes("structuralDemoSource.includes(presetTypeImport)")) {
  fail("structural export transform must fail loudly when its source import changes")
}
for (const duplicateRole of ["--control-height: calc", "--surface-padding: var(--space-6)", "--layout-gap: var(--space-6)"]) {
  if (exportSource.includes(duplicateRole)) fail(`export must not overwrite density-aware role token ${duplicateRole}`)
}
for (const contract of ["candidates = [\"#ffffff\", \"#000000\"]", "accessibleFocusRing", "focusRing: accessibleFocusRing"]) {
  if (!themeSource.includes(contract)) fail(`theme accessibility contract missing: ${contract}`)
}
for (const style of ["cinematic-mission-control", "canvas", "node-based", "split-pane-workspace"]) {
  if (!structuralSource.includes(`style === "${style}"`)) fail(`missing real structural demo for ${style}`)
}
for (const interaction of ["setPointerCapture", "role=\"separator\"", "<svg", "Surviving path"]) {
  if (!structuralSource.includes(interaction)) fail(`structural demos are missing interaction contract: ${interaction}`)
}
if (!appSource.includes('>Save as new</Button>')) fail("saved directions need an explicit Save as new path")

const requiredCustomizerContracts = [
  [appSource, "</header>\n      <ThemeCustomizer", "customizer must remain the first workspace section after the hero"],
  [customizerSource, '<div id="customize" className="customizer-inline" role="region"', "customizer shell must be a labeled region"],
  [customizerSource, '<div className="customizer-inline-header">', "customizer heading must not inherit broad header recipes"],
  [customizerSource, 'export type CustomizerPanel = "styles" | "colors" | "type" | "layout" | "motion" | "tokens"', "customizer must expose all six control panels"],
  [paletteSource, "const previousIncomingSignature = useRef(incomingSignature)", "palette must refresh after external theme changes"],
  [paletteSource, "lastAppliedSignature.current = paletteSignature", "palette Apply must preserve local locks and status"],
  [customizerCssSource, ".customizer-inline :is(.style-selector__grid,.font-selector__grid) { max-height: none; overflow: visible;", "inline selectors must use the document as their scroll owner"],
  [paletteCssSource, "grid-auto-columns: minmax(132px, 42%);", "zoomed palettes must keep usable swatch widths"],
  [paletteSource, 'role="group" aria-label="Palette generator actions"', "palette actions need an accessible group name"],
]
for (const [source, contract, message] of requiredCustomizerContracts) if (!source.includes(contract)) fail(message)
if (customizerSource.includes('<section id="customize"') || customizerSource.includes('<header className="customizer-inline-header"')) {
  fail("customizer shell must not enter generic section/header preset selectors")
}
for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) if (!tabsSource.includes(`event.key === "${key}"`)) fail(`tabs are missing ${key} keyboard navigation`)

const mobileSection = curatedCssSource.slice(
  curatedCssSource.indexOf("@media (max-width: 850px)"),
  curatedCssSource.indexOf("@media (max-width: 520px)"),
)
const structuralMobileIds = [
  "editorial", "linear-inspired", "bento-grid", "cinematic-mission-control", "canvas", "node-based",
  "split-pane-workspace", "timeline", "liquid-glass", "collage-scrapbook", "retrofuturism",
]
for (const id of structuralMobileIds) if (!mobileSection.includes(`data-style-id="${id}"`)) fail(`missing 850px structural guard for ${id}`)

const reducedMotionSection = curatedCssSource.slice(
  curatedCssSource.indexOf("@media (prefers-reduced-motion: reduce)"),
  curatedCssSource.indexOf("@media (forced-colors: active)"),
)
if (!reducedMotionSection.includes('data-style-id="terminal"')) fail("terminal cursor lacks a reduced-motion override")

const forcedColorsSection = curatedCssSource.slice(curatedCssSource.indexOf("@media (forced-colors: active)"))
for (const id of ["liquid-glass", "aurora-mesh"]) {
  if (!forcedColorsSection.includes(`data-style-id="${id}"`)) fail(`${id} lacks a forced-colors fallback`)
}

console.log(`Validated ${uniquePresets.size} curated presets, ${retiredMigrations.size} retired migrations, substantive CSS, thumbnails, responsive guards, and the inline customizer contract.`)
