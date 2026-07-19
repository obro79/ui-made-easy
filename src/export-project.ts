import { isThemeConfig, spacingScale, themeVariables, type ThemeConfig, type ThemeMode } from "./theme"
import { getStylePreset } from "./presets"
import authenticStyles from "./authentic-styles.css?raw"
import JSZip from "jszip"

export type ExportedProjectFile = {
  path: string
  content: string
  mimeType: string
}

export type ExportedProject = Record<string, ExportedProjectFile>

const COLOR_ALIASES: Record<string, string> = {
  background: "background",
  foreground: "foreground",
  card: "surface",
  "card-foreground": "foreground",
  popover: "surface",
  "popover-foreground": "foreground",
  primary: "primary",
  "primary-foreground": "primary-foreground",
  secondary: "secondary",
  "secondary-foreground": "foreground",
  muted: "secondary",
  "muted-foreground": "muted-foreground",
  accent: "secondary",
  "accent-foreground": "foreground",
  destructive: "destructive",
  border: "border",
  input: "border",
  ring: "focus-ring",
}

function cssVariables(theme: ThemeConfig, mode: ThemeMode): string {
  return Object.entries(themeVariables(theme, mode))
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n")
}

function roleVariables(): string {
  return `  --text-xs-role: calc(0.75rem * var(--type-scale));
  --text-sm-role: calc(0.875rem * var(--type-scale));
  --text-body-role: calc(1rem * var(--type-scale));
  --text-lead-role: calc(1.125rem * var(--type-scale));
  --text-title-role: calc(1.875rem * var(--type-scale));
  --text-display-role: calc(2.5rem * var(--type-scale));
  --control-height: calc(var(--space-8) + var(--space-2));
  --control-padding-inline: var(--space-4);
  --surface-padding: var(--space-6);
  --layout-gap: var(--space-6);
  --radius-control: var(--radius-md);
  --radius-surface: var(--radius-lg);
  --radius-full: 999px;`
}

export function generateTailwindGlobals(theme: ThemeConfig): string {
  assertTheme(theme)
  const themeColors = Object.entries(COLOR_ALIASES)
    .map(([tailwindName, variableName]) => `  --color-${tailwindName}: var(--${variableName});`)
    .join("\n")
  const spaces = Object.keys(spacingScale(theme.baseSpacing, theme.density))
    .map((name) => `  --spacing-${name.replace("space-", "")}: var(--${name});`)
    .join("\n")

  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
${cssVariables(theme, "light")}
${roleVariables()}
}

.dark {
${cssVariables(theme, "dark")}
}

@theme inline {
${themeColors}
${spaces}
  --font-sans: ${theme.bodyFont};
  --font-heading: ${theme.headingFont};
  --text-role-xs: var(--text-xs-role);
  --text-role-sm: var(--text-sm-role);
  --text-role-body: var(--text-body-role);
  --text-role-lead: var(--text-lead-role);
  --text-role-title: var(--text-title-role);
  --text-role-display: var(--text-display-role);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background font-sans text-foreground antialiased; }
  h1, h2, h3, h4 { font-family: var(--font-heading); }
}

@layer components {
  .theme-showcase { display: grid; width: min(100%, var(--content-max)); gap: var(--layout-gap); margin-inline: auto; padding: var(--space-12) var(--space-6); font-size: var(--text-body-role); }
  .theme-showcase-header { display: grid; gap: var(--space-4); }
  .theme-display { max-width: 18ch; font-size: var(--text-display-role); font-weight: 700; line-height: 1.05; letter-spacing: -0.035em; }
  .theme-lead { max-width: 42rem; color: var(--muted-foreground); font-size: var(--text-lead-role); line-height: 1.6; }
  .theme-action-row { display: flex; flex-wrap: wrap; gap: var(--space-3); }
  .theme-content-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--layout-gap); }
  .theme-surface { padding: var(--surface-padding); border: var(--border-width) solid var(--border); border-radius: var(--radius-surface); background: var(--surface); box-shadow: var(--shadow-card); }
  .theme-surface-stack { display: grid; gap: var(--space-5, var(--space-4)); }
  .theme-title { font-size: var(--text-title-role); font-weight: 650; letter-spacing: -0.025em; }
  .theme-muted { color: var(--muted-foreground); }
  @media (max-width: 48rem) { .theme-content-grid { grid-template-columns: 1fr; } }
}
`
}

export function generateComponentShowcase(theme: ThemeConfig): string {
  const preset = getStylePreset(theme.preset)
  if (!preset) throw new TypeError("Cannot export an unknown preset")
  return `import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export function ComponentShowcase() {
  return (
    <main className="theme-scope theme-showcase" data-style-id="${preset.id}" data-layout="${preset.recipe.layout}" data-surface="${preset.recipe.surface}" data-treatment="${preset.recipe.typography}" data-geometry="${preset.recipe.geometry}" data-decoration="${preset.recipe.decoration}">
      <header className="theme-showcase-header">
        <Badge>Component showcase</Badge>
        <h1 className="theme-display">A practical UI foundation</h1>
        <p className="theme-lead">
          Reusable typography, actions, form controls, and surfaces using your exported theme.
        </p>
        <div className="theme-action-row">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </header>

      <Separator />

      <section className="theme-content-grid">
        <Card>
          <CardHeader>
            <CardTitle>Example card</CardTitle>
            <CardDescription>A flexible content surface with semantic theme tokens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="showcase-email">Email</Label>
              <Input id="showcase-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="showcase-message">Message</Label>
              <Textarea id="showcase-message" placeholder="Tell us what you are building…" />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>

        <div className="theme-surface theme-surface-stack">
          <div className="space-y-2">
            <p className="text-role-sm font-medium text-primary">Typography</p>
            <h2 className="theme-title">Clear hierarchy by default</h2>
            <p className="theme-muted">
              Use semantic colors so every component responds to light and dark themes consistently.
            </p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>
      </section>
    </main>
  )
}
`
}

export function generateComponentsJson(): string {
  return `${JSON.stringify({
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: { config: "", css: "src/app/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
    aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
    iconLibrary: "lucide",
  }, null, 2)}\n`
}

export function generateThemeManifest(theme: ThemeConfig): string {
  assertTheme(theme)
  const preset = getStylePreset(theme.preset)!
  return `${JSON.stringify({
    schemaVersion: 1,
    source: "UI Component Gallery",
    preset: { id: preset.id, name: preset.name, category: preset.category, description: preset.description },
    modeSupport: ["light", "dark"],
    layout: { contentWidth: theme.contentWidth, maxWidth: themeVariables(theme, "light")["content-max"], density: theme.density },
    typography: { headingFont: theme.headingFont, bodyFont: theme.bodyFont, typeScale: theme.typeScale },
    geometry: { baseSpacing: theme.baseSpacing, radius: theme.radius, borderWidth: theme.borderWidth, shadow: theme.shadow },
    recipes: ["theme-showcase", "theme-showcase-header", "theme-display", "theme-lead", "theme-action-row", "theme-content-grid", "theme-surface", "theme-surface-stack", "theme-title", "theme-muted"],
    structuralRecipe: preset.recipe,
    authenticity: { ...preset.authenticity, inspiredReference: preset.category === "system-reference" },
  }, null, 2)}\n`
}

export function generateExportReadme(theme: ThemeConfig): string {
  assertTheme(theme)
  const preset = getStylePreset(theme.preset)!
  const code = "`"
  return [
    `# ${preset.name} UI theme`,
    "",
    `Generated from the UI Component Gallery. This bundle contains Tailwind CSS v4 theme tokens, a reusable shadcn/ui showcase, and a shadcn ${code}components.json${code} configuration.`,
    "",
    "## Install",
    "",
    `1. Copy ${code}globals.css${code} and ${code}style-recipe.css${code} into ${code}src/app/${code}, then import the recipe after globals.`,
    `2. Copy ${code}ComponentShowcase.tsx${code} into your components directory.`,
    "3. Install the showcase primitives:",
    "",
    `${code}${code}${code}sh`,
    "npx shadcn@latest add badge button card input label separator textarea",
    `${code}${code}${code}`,
    "",
    `4. Render ${code}<ComponentShowcase />${code} from a page. Add the ${code}dark${code} class to an ancestor to preview the dark palette.`,
    `5. Install or import the selected fonts if they are not already available. The exported font stacks include graceful system fallbacks, but font files are not bundled.`,
    "",
    "## Theme settings",
    "",
    `- Preset: ${preset.name} (${preset.id})`,
    `- Density: ${theme.density}`,
    `- Base spacing: ${theme.baseSpacing}px`,
    `- Radius: ${theme.radius}px`,
    `- Shadow: ${theme.shadow}`,
    `- Border width: ${theme.borderWidth}px`,
    `- Type scale: ${theme.typeScale}`,
    `- Content width: ${theme.contentWidth}`,
    `- Heading font: ${theme.headingFont}`,
    `- Body font: ${theme.bodyFont}`,
    "",
    "## Style authenticity",
    "",
    preset.authenticity.basis.join(" "),
    "",
    ...preset.authenticity.signatures.map((item) => `- ${item}`),
    "",
    `Avoid: ${preset.authenticity.mustAvoid.join("; ")}.`,
    "",
    "The generated CSS uses semantic variables, so edits to light/dark tokens flow through every component. Named product and design-system references are inspired interpretations, not official implementations.",
    `The complete structural and authenticity recipes are recorded in ${code}theme-manifest.json${code}.`,
    "",
  ].join("\n")
}

export function generateExportProject(theme: ThemeConfig): ExportedProject {
  assertTheme(theme)
  const files: ExportedProjectFile[] = [
    { path: "src/app/globals.css", content: generateTailwindGlobals(theme), mimeType: "text/css" },
    { path: "src/app/style-recipe.css", content: authenticStyles, mimeType: "text/css" },
    { path: "src/components/ComponentShowcase.tsx", content: generateComponentShowcase(theme), mimeType: "text/tsx" },
    { path: "components.json", content: generateComponentsJson(), mimeType: "application/json" },
    { path: "theme-manifest.json", content: generateThemeManifest(theme), mimeType: "application/json" },
    { path: "README.md", content: generateExportReadme(theme), mimeType: "text/markdown" },
  ]
  return Object.fromEntries(files.map((file) => [file.path, file]))
}

export async function downloadStarterKitZip(theme: ThemeConfig, requestedName = theme.preset): Promise<void> {
  assertTheme(theme)
  if (typeof document === "undefined" || typeof URL === "undefined") throw new Error("File downloads are only available in a browser")
  const zip = new JSZip()
  for (const file of Object.values(generateExportProject(theme))) zip.file(file.path, file.content)
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  const safeName = requestedName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ui-starter"
  anchor.href = url
  anchor.download = `${safeName}-ui-starter.zip`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Download one generated file. */
export function downloadExportFile(file: ExportedProjectFile): void {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("File downloads are only available in a browser")
  }
  const url = URL.createObjectURL(new Blob([file.content], { type: `${file.mimeType};charset=utf-8` }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = file.path.split("/").at(-1) || "export.txt"
  anchor.click()
  URL.revokeObjectURL(url)
}

function assertTheme(theme: ThemeConfig): void {
  if (!isThemeConfig(theme)) throw new TypeError("Cannot export an invalid theme configuration")
}
