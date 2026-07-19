import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BuilderEssentialsGallery } from "../src/components/BuilderEssentialsGallery"
import { COMPONENT_REGISTRY, loadRegisteredComponentFiles, registeredComponentDependencies } from "../src/component-registry"

const EXPECTED_COMPONENT_IDS = [
  "command-palette",
  "searchable-combobox",
  "directional-sheet",
  "toast-feedback",
  "calendar-date-picker",
  "single-range-slider",
  "file-dropzone",
  "data-table-tools",
] as const

const EXPECTED_COMPONENT_DEPENDENCIES = [
  "@base-ui/react",
  "@tanstack/react-table",
  "cmdk",
  "lucide-react",
  "react-day-picker",
  "sonner",
] as const

describe("component registry", () => {
  it("contains exactly eight complete, uniquely exportable builder essentials", async () => {
    const ids = COMPONENT_REGISTRY.map(({ id }) => id)
    const titles = COMPONENT_REGISTRY.map(({ title }) => title)
    const namedExports = COMPONENT_REGISTRY.map(({ export: metadata }) => metadata.namedExport)
    const primaryPaths = COMPONENT_REGISTRY.flatMap(({ sourceFiles }) => sourceFiles.map(({ path }) => path))

    expect(COMPONENT_REGISTRY).toHaveLength(8)
    expect(ids).toEqual(EXPECTED_COMPONENT_IDS)
    expect(new Set(ids).size).toBe(8)
    expect(new Set(titles).size).toBe(8)
    expect(new Set(namedExports).size).toBe(8)
    expect(new Set(primaryPaths).size).toBe(8)

    for (const definition of COMPONENT_REGISTRY) {
      expect(definition.exampleSource).toContain("<")
      expect(definition.description.trim()).not.toBe("")
      expect(definition.section).toBe("Application patterns")
      expect(definition.sourceFiles).toHaveLength(1)
      expect(definition.export.importPath).toBe("@/components/builder")
      expect(definition.export.maturity).toBe("stable")
      expect(definition.dependencies.length).toBeGreaterThan(0)

      const primarySource = definition.sourceFiles[0]
      expect(primarySource.path).toMatch(/^src\/components\/builder\/.+\.tsx$/)
      expect(primarySource.mimeType).toBe("text/tsx")
      expect(await primarySource.load()).toContain(`export function ${definition.export.namedExport}`)
    }

    expect(registeredComponentDependencies()).toEqual(EXPECTED_COMPONENT_DEPENDENCIES)
    const files = await loadRegisteredComponentFiles()
    expect(new Set(files.map(({ path }) => path)).size).toBe(files.length)
    expect(files.map(({ path }) => path)).toEqual(expect.arrayContaining(primaryPaths))
    for (const file of files) {
      // Vitest stubs CSS module contents even with ?raw, so verify that source on disk.
      const content = file.mimeType === "text/css"
        ? readFileSync(resolve(process.cwd(), file.path), "utf8")
        : await file.load()
      expect(content.trim(), `${file.path} must not export an empty file`).not.toBe("")
    }

    const barrel = files.find(({ path }) => path === "src/components/builder/index.ts")
    expect(barrel).toBeDefined()
    const barrelSource = await barrel!.load()
    for (const definition of COMPONENT_REGISTRY) {
      const sourceName = definition.sourceFiles[0].path.split("/").at(-1)!.replace(/\.tsx$/, "")
      expect(barrelSource).toContain(`export * from "./${sourceName}"`)
    }
  })

  it("renders registry previews and copies the registered example", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<BuilderEssentialsGallery />)

    expect(screen.getAllByRole("article")).toHaveLength(8)
    const commandCard = screen.getByRole("heading", { name: "Command palette" }).closest("article")!
    await user.click(within(commandCard).getByRole("button", { name: "Copy Command palette example" }))
    expect(writeText).toHaveBeenCalledWith(COMPONENT_REGISTRY[0].exampleSource)
    expect(await within(commandCard).findByText("Copied")).toBeInTheDocument()
  })

  it("opens the command palette with Cmd/Ctrl+K and closes it with Escape", async () => {
    render(<BuilderEssentialsGallery />)
    fireEvent.keyDown(document, { key: "k", metaKey: true })
    expect(await screen.findByRole("dialog", { name: "Global command menu" })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Global command menu" })).not.toBeInTheDocument())
  })
})
