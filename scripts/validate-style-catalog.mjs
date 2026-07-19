import { readFileSync } from "node:fs"

const presetsSource = readFileSync(new URL("../src/presets.ts", import.meta.url), "utf8")
const cssSource = readFileSync(new URL("../src/authentic-styles.css", import.meta.url), "utf8")

const definedPresetIds = [...presetsSource.matchAll(/preset\("([a-z0-9-]+)"/g)].map((match) => match[1])
const curatedBlock = presetsSource.match(/CURATED_STYLE_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const presetIds = curatedBlock ? [...curatedBlock[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]) : []
const signatureIds = [...cssSource.matchAll(/\[data-style-id="([a-z0-9-]+)"\]/g)].map((match) => match[1])
const uniquePresets = new Set(presetIds)
const uniqueSignatures = new Set(signatureIds)

const fail = (message) => { throw new Error(`Style catalog validation failed: ${message}`) }
if (presetIds.length !== 20 || uniquePresets.size !== 20) fail(`expected 20 unique curated presets, found ${presetIds.length}/${uniquePresets.size}`)
for (const id of uniquePresets) if (!definedPresetIds.includes(id)) fail(`curated preset ${id} has no definition`)
for (const id of uniquePresets) if (!uniqueSignatures.has(id)) fail(`missing CSS signature for ${id}`)
for (const field of ["basis", "signatures", "mustAvoid", "bestFor", "a11y"]) {
  if (!presetsSource.includes(field)) fail(`missing authenticity field ${field}`)
}
if (!presetsSource.includes("LEGACY_PRESET_MAP")) fail("missing legacy preset migration map")
if (!presetsSource.includes("RETIRED_PRESET_MAP")) fail("missing retired preset migration map")

console.log(`Validated ${uniquePresets.size} curated presets with matching definitions and CSS signatures.`)
