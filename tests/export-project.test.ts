import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { afterAll, describe, expect, it } from "vitest"
import { COMPONENT_REGISTRY, loadRegisteredComponentFiles, registeredComponentDependencies } from "../src/component-registry"
import { generateExportProject, generateThemeManifest } from "../src/export-project"
import { STYLE_PRESETS } from "../src/presets"
import { createThemeFromPreset } from "../src/theme"

const smokeRoot = mkdtempSync(join(tmpdir(), "ui-made-easy-export-"))
afterAll(() => rmSync(smokeRoot, { recursive: true, force: true }))

const representativeStyles = [
  "minimalism",
  "liquid-glass",
  "cinematic-mission-control",
  "claymorphism",
  "organic-biophilic",
  "art-deco",
  "skeuomorphism",
]

function writeProject(target: string, files: Awaited<ReturnType<typeof generateExportProject>>) {
  for (const file of Object.values(files)) {
    const destination = join(target, file.path)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, file.content)
  }
}

describe("exported starter", () => {
  it("uses the schema-v3 registry contract", async () => {
    const files = await generateExportProject(createThemeFromPreset("claymorphism"), "light")
    const manifest = JSON.parse(files["theme-manifest.json"].content) as {
      schemaVersion: number
      components: unknown[]
      dependencies: string[]
      motion: { preset: string }
    }
    const packageJson = JSON.parse(files["package.json"].content) as { dependencies: Record<string, string> }
    const expectedComponents = COMPONENT_REGISTRY.map(({ id, export: metadata }) => ({ id, export: metadata }))
    const expectedDependencies = registeredComponentDependencies()

    expect(manifest.schemaVersion).toBe(3)
    expect(manifest.components).toEqual(expectedComponents)
    expect(manifest.dependencies).toEqual(expectedDependencies)
    expect(manifest.motion.preset).toBe("rise")
    for (const dependency of expectedDependencies) {
      expect(packageJson.dependencies[dependency]).toEqual(expect.any(String))
    }

    const registeredFiles = await loadRegisteredComponentFiles()
    for (const definition of registeredFiles) {
      expect(files[definition.path]).toEqual({
        path: definition.path,
        content: await definition.load(),
        mimeType: definition.mimeType,
      })
    }

    expect(files["src/components/ComponentShowcase.tsx"].content).toContain("import { BuilderEssentialsGallery }")
    expect(files["src/components/ComponentShowcase.tsx"].content).toContain("<BuilderEssentialsGallery />")
    expect(files["src/components/ComponentShowcase.tsx"].content).toContain("data-motion-preset=\"rise\"")
  })

  it("serializes every curated preset through the same v3 component registry", () => {
    const expectedComponents = COMPONENT_REGISTRY.map(({ id, export: metadata }) => ({ id, export: metadata }))
    const expectedDependencies = registeredComponentDependencies()

    expect(STYLE_PRESETS).toHaveLength(24)
    for (const preset of STYLE_PRESETS) {
      const theme = createThemeFromPreset(preset.id)
      const manifest = JSON.parse(generateThemeManifest(theme)) as {
        schemaVersion: number
        preset: { id: string }
        components: unknown[]
        dependencies: string[]
        motion: { preset: string; speed: string; loadingStyle: string }
      }

      expect(manifest).toMatchObject({
        schemaVersion: 3,
        preset: { id: preset.id },
        motion: {
          preset: theme.motionPreset,
          speed: theme.motionSpeed,
          loadingStyle: theme.loadingStyle,
        },
      })
      expect(manifest.components).toEqual(expectedComponents)
      expect(manifest.dependencies).toEqual(expectedDependencies)
    }
  })

  it("type-checks and builds all seven representative exported starters", async () => {
    const workspaceRoot = process.cwd()
    const tsc = join(workspaceRoot, "node_modules", ".bin", "tsc")
    const vite = join(workspaceRoot, "node_modules", ".bin", "vite")
    for (const style of representativeStyles) {
      const target = join(smokeRoot, style)
      mkdirSync(target, { recursive: true })
      writeProject(target, await generateExportProject(createThemeFromPreset(style)))
      symlinkSync(join(workspaceRoot, "node_modules"), join(target, "node_modules"), "dir")
      execFileSync(tsc, ["--project", "tsconfig.json"], { cwd: target, stdio: "pipe" })
      execFileSync(vite, ["build"], { cwd: target, stdio: "pipe" })
    }
  }, 180_000)
})
