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
if (presetIds.length !== 20 || uniquePresets.size !== 20) fail(`expected 20 unique curated presets, found ${presetIds.length}/${uniquePresets.size}`)
if (definedPresetIds.length !== 40 || new Set(definedPresetIds).size !== 40) fail(`expected 40 unique source definitions, found ${definedPresetIds.length}/${new Set(definedPresetIds).size}`)
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

const requiredCustomizerContracts = [
  [appSource, "</header>\n      <ThemeCustomizer", "customizer must remain the first workspace section after the hero"],
  [customizerSource, '<div id="customize" className="customizer-inline" role="region"', "customizer shell must be a labeled region"],
  [customizerSource, '<div className="customizer-inline-header">', "customizer heading must not inherit broad header recipes"],
  [customizerSource, 'export type CustomizerPanel = "styles" | "colors" | "type" | "layout" | "tokens"', "customizer must expose all five control panels"],
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
