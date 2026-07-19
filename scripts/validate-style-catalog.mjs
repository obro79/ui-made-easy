import { readFileSync } from "node:fs"

const presetsSource = readFileSync(new URL("../src/presets.ts", import.meta.url), "utf8")
const cssSource = readFileSync(new URL("../src/authentic-styles.css", import.meta.url), "utf8")

const presetIds = [...presetsSource.matchAll(/preset\("([a-z0-9-]+)"/g)].map((match) => match[1])
const signatureIds = [...cssSource.matchAll(/\[data-style-id="([a-z0-9-]+)"\]/g)].map((match) => match[1])
const uniquePresets = new Set(presetIds)
const uniqueSignatures = new Set(signatureIds)

const fail = (message) => { throw new Error(`Style catalog validation failed: ${message}`) }
if (presetIds.length !== 40 || uniquePresets.size !== 40) fail(`expected 40 unique presets, found ${presetIds.length}/${uniquePresets.size}`)
for (const id of uniquePresets) if (!uniqueSignatures.has(id)) fail(`missing CSS signature for ${id}`)
for (const id of uniqueSignatures) if (!uniquePresets.has(id)) fail(`orphan CSS signature ${id}`)
for (const field of ["basis", "signatures", "mustAvoid", "bestFor", "a11y"]) {
  if (!presetsSource.includes(field)) fail(`missing authenticity field ${field}`)
}
if (!presetsSource.includes("LEGACY_PRESET_MAP")) fail("missing legacy preset migration map")

console.log(`Validated ${uniquePresets.size} canonical presets and ${uniqueSignatures.size} matching CSS signatures.`)
