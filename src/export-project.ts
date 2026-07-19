import { createThemeFromPreset, isThemeConfig, spacingScale, themeVariables, type ThemeConfig, type ThemeMode } from "./theme"
import { getStylePreset, preferredThemeMode } from "./presets"
import baseStyles from "./styles.css?raw"
import authenticStyles from "./authentic-styles.css?raw"
import curatedStyles from "./curated-styles.css?raw"
import customizationOverrides from "./customization-overrides.css?raw"
import structuralDemoSource from "./components/StructuralStyleDemo.tsx?raw"
import structuralDemoStyles from "./structural-style-demo.css?raw"

export type ExportedProjectFile = {
  path: string
  content: string
  mimeType: string
}

export type ExportedProject = Record<string, ExportedProjectFile>

const exportBaseStyles = baseStyles.replace(/^@import[^\n]*\n/, "")

function generateStructuralDemoSource(): string {
  return structuralDemoSource.replace(
    'import type { StylePresetId } from "../presets"',
    "type StylePresetId = string",
  )
}

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
  "destructive-foreground": "destructive-foreground",
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
  --control-padding-inline: var(--control-padding-x);
  --radius-control: var(--radius-md);
  --radius-surface: var(--radius-lg);
  --radius-full: 999px;`
}

function exportedScopeStyles(theme: ThemeConfig): string {
  return `
/* Exported pages have no workbench sidebar. */
.app.exported-theme-scope {
${cssVariables(theme, "light")}
}
.app.exported-theme-scope.dark {
${cssVariables(theme, "dark")}
}
.exported-theme-scope[data-layout] > main {
  width: min(100%, var(--content-max)) !important;
  max-width: var(--content-max) !important;
  margin-inline: auto !important;
}
.exported-theme-scope .theme-showcase { padding-inline: var(--surface-padding); }
.exported-theme-scope .theme-content-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
.exported-theme-scope .theme-content-grid > * { grid-column: auto !important; grid-row: auto !important; width: auto !important; margin: 0 !important; }
@media (max-width: 48rem) { .exported-theme-scope .theme-content-grid { grid-template-columns: 1fr !important; } }
`
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
  .label { display: block; margin-bottom: var(--space-2); font-size: var(--text-sm-role); font-weight: 700; }
  .input { min-height: var(--control-height); display: block; width: 100%; padding: var(--space-2) var(--control-padding-x); border: var(--border-width) solid var(--border); border-radius: var(--radius-control); color: var(--foreground); background: var(--background); font: inherit; }
  .input::placeholder { color: var(--muted-foreground); }
  .input:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
  .badge-secondary { color: var(--foreground); background: var(--secondary); }
  .badge-outline { color: var(--foreground); background: transparent; }
  .badge-destructive { color: var(--destructive-foreground); background: var(--destructive); border-color: var(--destructive); }
  .textarea { min-height: 7rem; width: 100%; resize: vertical; padding: var(--space-3); border: var(--border-width) solid var(--border); border-radius: var(--radius-control); color: var(--foreground); background: var(--background); font: inherit; }
  .textarea:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
  .ui-separator { flex: none; background: var(--border); }
  .ui-separator-horizontal { width: 100%; height: var(--border-width); min-height: 1px; }
  .ui-separator-vertical { width: var(--border-width); min-width: 1px; height: 100%; }
  @media (max-width: 48rem) { .theme-content-grid { grid-template-columns: 1fr; } }
}
`
}

export function generateComponentShowcase(theme: ThemeConfig, initialMode: ThemeMode = preferredThemeMode(theme.preset)): string {
  const preset = getStylePreset(theme.preset)
  if (!preset) throw new TypeError("Cannot export an unknown preset")
  const baseline = createThemeFromPreset(theme.preset)
  const radiusOverridden = theme.radius !== baseline.radius
  const borderOverridden = theme.borderWidth !== baseline.borderWidth
  const shadowOverridden = theme.shadow !== baseline.shadow
  const motion = preset.category === "expressive-era" ? "snappy" : preset.recipe.layout === "spatial" || preset.recipe.surface === "glass" ? "float" : "subtle"
  return `import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { StructuralStyleDemo } from "@/components/StructuralStyleDemo"

export function ComponentShowcase() {
  const [dark, setDark] = useState(${initialMode === "dark"})
  const rootClassName = dark ? "app theme-scope exported-theme-scope dark" : "app theme-scope exported-theme-scope"

  return (
    <div className={rootClassName} data-style-id="${preset.id}" data-layout="${preset.recipe.layout}" data-surface="${preset.recipe.surface}" data-treatment="${preset.recipe.typography}" data-geometry="${preset.recipe.geometry}" data-decoration="${preset.recipe.decoration}" data-motion="${motion}" data-theme-mode={dark ? "dark" : "light"} data-radius-overridden="${radiusOverridden}" data-border-overridden="${borderOverridden}" data-shadow-overridden="${shadowOverridden}">
      <main className="theme-showcase">
        <header className="page-hero theme-showcase-header">
          <div className="hero-copy">
            <p className="eyebrow">Component showcase</p>
            <h1 className="theme-display">A practical UI foundation</h1>
            <p className="theme-lead lede">
              Reusable typography, actions, form controls, and surfaces using your exported theme.
            </p>
          </div>
          <div className="header-actions hero-toolbar theme-action-row">
            <Button className="button button-default">Primary action</Button>
            <Button className="button button-secondary" variant="secondary">Secondary</Button>
            <Button className="button button-outline" variant="outline">Outline</Button>
            <Button className="button button-ghost" variant="ghost">Ghost</Button>
            <Button className="button button-destructive" variant="destructive">Destructive</Button>
            <Button className="button button-outline" variant="outline" onClick={() => setDark((current) => !current)}>{dark ? "Use light mode" : "Use dark mode"}</Button>
          </div>
        </header>

        <Separator />

        <StructuralStyleDemo style="${preset.id}" />

        <section className="spec-section">
          <div className="section-heading">
            <p className="eyebrow">Components</p>
            <h2>Core inventory</h2>
          </div>
          <div className="theme-content-grid">
          <Card className="card specimen">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Example card</CardTitle>
              <CardDescription className="card-description">A flexible content surface with semantic theme tokens.</CardDescription>
            </CardHeader>
            <CardContent className="card-content space-y-4">
              <div className="space-y-2">
                <Label htmlFor="showcase-email">Email</Label>
                <Input className="input" id="showcase-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-message">Message</Label>
                <Textarea className="input" id="showcase-message" placeholder="Tell us what you are building…" />
              </div>
            </CardContent>
            <CardFooter className="card-footer justify-end gap-2">
              <Button className="button button-ghost" variant="ghost">Cancel</Button>
              <Button className="button button-default">Save changes</Button>
            </CardFooter>
          </Card>

          <div className="card specimen theme-surface theme-surface-stack">
            <div className="space-y-2">
              <p className="eyebrow text-role-sm font-medium text-primary">Typography</p>
              <h2 className="card-title theme-title">Clear hierarchy by default</h2>
              <p className="card-description theme-muted">
                Use semantic colors so every component responds to light and dark themes consistently.
              </p>
            </div>
            <Separator />
            <div className="theme-action-row">
              <Badge className="badge">Default</Badge>
              <Badge className="badge" variant="secondary">Secondary</Badge>
              <Badge className="badge" variant="outline">Outline</Badge>
              <Badge className="badge" variant="destructive">Destructive</Badge>
            </div>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
`
}

export function generateComponentsJson(): string {
  return `${JSON.stringify({
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: false,
    tsx: true,
    tailwind: { config: "", css: "src/app/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
    aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
    iconLibrary: "lucide",
  }, null, 2)}\n`
}

export function generatePackageJson(theme: ThemeConfig): string {
  const preset = getStylePreset(theme.preset)!
  return `${JSON.stringify({
    name: `${preset.id}-ui-starter`,
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: { dev: "vite", build: "tsc --noEmit && vite build", preview: "vite preview" },
    dependencies: { "lucide-react": "^1.25.0", react: "^19.2.0", "react-dom": "^19.2.0" },
    devDependencies: {
      "@tailwindcss/vite": "^4.1.0",
      "@types/node": "^24.0.0",
      "@types/react": "^19.2.0",
      "@types/react-dom": "^19.2.0",
      "@vitejs/plugin-react": "^6.0.0",
      tailwindcss: "^4.1.0",
      typescript: "^5.9.0",
      vite: "^8.0.0",
    },
  }, null, 2)}\n`
}

export function generateViteConfig(): string {
  return `import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
})
`
}

export function generateTsconfig(): string {
  return `${JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] },
      types: ["vite/client", "node"],
    },
    include: ["src", "vite.config.ts"],
  }, null, 2)}\n`
}

export function generateIndexHtml(theme: ThemeConfig): string {
  const preset = getStylePreset(theme.preset)!
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${preset.name} component showcase" />
    <title>${preset.name} UI starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

export function generateMain(): string {
  return `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ComponentShowcase } from "@/components/ComponentShowcase"
import "@/app/fonts.css"
import "@/app/globals.css"
import "@/app/style-recipe.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComponentShowcase />
  </StrictMode>,
)
`
}

export function generateUtils(): string {
  return `export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ")
}
`
}

function generatedUiFiles(): ExportedProjectFile[] {
  return [
    {
      path: "src/components/ui/button.tsx",
      mimeType: "text/tsx",
      content: `import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive"
type ButtonSize = "sm" | "default" | "lg"
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }

export function Button({ className, variant = "default", size = "default", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("button", "button-" + variant, "button-size-" + size, className)} {...props} />
}
`,
    },
    {
      path: "src/components/ui/badge.tsx",
      mimeType: "text/tsx",
      content: `import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"
type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("badge", "badge-" + variant, className)} {...props} />
}
`,
    },
    {
      path: "src/components/ui/card.tsx",
      mimeType: "text/tsx",
      content: `import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("card", className)} {...props} /> }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("card-header", className)} {...props} /> }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("card-title", className)} {...props} /> }
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("card-description", className)} {...props} /> }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("card-content", className)} {...props} /> }
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("card-footer", className)} {...props} /> }
`,
    },
    {
      path: "src/components/ui/input.tsx",
      mimeType: "text/tsx",
      content: `import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input", className)} {...props} />
}
`,
    },
    {
      path: "src/components/ui/label.tsx",
      mimeType: "text/tsx",
      content: `import type { LabelHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("label", className)} {...props} />
}
`,
    },
    {
      path: "src/components/ui/separator.tsx",
      mimeType: "text/tsx",
      content: `import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type SeparatorProps = HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return <div role="separator" aria-orientation={orientation} className={cn("ui-separator", "ui-separator-" + orientation, className)} {...props} />
}
`,
    },
    {
      path: "src/components/ui/textarea.tsx",
      mimeType: "text/tsx",
      content: `import type { TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("textarea", className)} {...props} />
}
`,
    },
  ]
}

export function generateThemeManifest(theme: ThemeConfig, initialMode: ThemeMode = preferredThemeMode(theme.preset)): string {
  assertTheme(theme)
  const preset = getStylePreset(theme.preset)!
  return `${JSON.stringify({
    schemaVersion: 1,
    source: "UI Component Gallery",
    target: "Vite + React + Tailwind CSS v4",
    preset: { id: preset.id, name: preset.name, category: preset.category, description: preset.description },
    modeSupport: ["light", "dark"],
    initialMode,
    layout: { contentWidth: theme.contentWidth, maxWidth: themeVariables(theme, "light")["content-max"], density: theme.density },
    typography: { headingFont: theme.headingFont, bodyFont: theme.bodyFont, typeScale: theme.typeScale },
    geometry: { baseSpacing: theme.baseSpacing, radius: theme.radius, borderWidth: theme.borderWidth, shadow: theme.shadow },
    recipes: ["app", "theme-scope", "page-hero", "hero-copy", "hero-toolbar", "header-actions", "spec-section", "button", "card", "specimen", "badge", "input", "theme-showcase", "theme-showcase-header", "theme-display", "theme-lead", "theme-action-row", "theme-content-grid", "theme-surface", "theme-surface-stack", "theme-title", "theme-muted"],
    structuralRecipe: preset.recipe,
    authenticity: { ...preset.authenticity, inspiredReference: preset.category === "system-reference" },
  }, null, 2)}\n`
}

export function generateExportReadme(theme: ThemeConfig): string {
  assertTheme(theme)
  const preset = getStylePreset(theme.preset)!
  const code = "`"
  return [
    `# ${preset.name} UI starter`,
    "",
    `Generated from the UI Component Gallery as a runnable Vite + React starter. It contains Tailwind CSS v4 theme tokens, local shadcn-style primitives, a reusable component showcase, and a shadcn ${code}components.json${code} configuration.`,
    "",
    "## Run it",
    "",
    `${code}${code}${code}sh`,
    "npm install",
    "npm run dev",
    `${code}${code}${code}`,
    "",
    `Run ${code}npm run build${code} for a production compile. The starter follows the official Tailwind v4 Vite-plugin setup and includes the ${code}@/*${code} alias expected by shadcn/ui.`,
    "",
    "## Build on it",
    "",
    `- Edit ${code}src/components/ComponentShowcase.tsx${code} to turn the foundation into your first product page.`,
    `- Reuse or extend the local primitives in ${code}src/components/ui/${code}.`,
    `- Edit role tokens in ${code}src/app/globals.css${code}; the light and dark palettes update every component.`,
    `- Keep ${code}src/app/style-recipe.css${code} if you want the selected preset's authentic composition and effects.`,
    "- Add more shadcn/ui primitives at any time:",
    "",
    `${code}${code}${code}sh`,
    "npx shadcn@latest add dialog dropdown-menu table tabs",
    `${code}${code}${code}`,
    "",
    `The included showcase has a working light/dark toggle. Keep ${code}fonts.css${code}, or replace it with self-hosted font files for production.`,
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

export function generateExportProject(theme: ThemeConfig, initialMode: ThemeMode = preferredThemeMode(theme.preset)): ExportedProject {
  assertTheme(theme)
  const files: ExportedProjectFile[] = [
    { path: "package.json", content: generatePackageJson(theme), mimeType: "application/json" },
    { path: "index.html", content: generateIndexHtml(theme), mimeType: "text/html" },
    { path: "vite.config.ts", content: generateViteConfig(), mimeType: "text/typescript" },
    { path: "tsconfig.json", content: generateTsconfig(), mimeType: "application/json" },
    { path: "src/main.tsx", content: generateMain(), mimeType: "text/tsx" },
    { path: "src/app/globals.css", content: generateTailwindGlobals(theme), mimeType: "text/css" },
    { path: "src/app/style-recipe.css", content: `${exportBaseStyles}\n${authenticStyles}\n${curatedStyles}\n${customizationOverrides}\n${exportedScopeStyles(theme)}`, mimeType: "text/css" },
    { path: "src/app/fonts.css", content: `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');\n`, mimeType: "text/css" },
    { path: "src/lib/utils.ts", content: generateUtils(), mimeType: "text/typescript" },
    { path: "src/components/ComponentShowcase.tsx", content: generateComponentShowcase(theme, initialMode), mimeType: "text/tsx" },
    { path: "src/components/StructuralStyleDemo.tsx", content: generateStructuralDemoSource(), mimeType: "text/tsx" },
    { path: "src/structural-style-demo.css", content: structuralDemoStyles, mimeType: "text/css" },
    ...generatedUiFiles(),
    { path: "components.json", content: generateComponentsJson(), mimeType: "application/json" },
    { path: "theme-manifest.json", content: generateThemeManifest(theme, initialMode), mimeType: "application/json" },
    { path: "README.md", content: generateExportReadme(theme), mimeType: "text/markdown" },
  ]
  return Object.fromEntries(files.map((file) => [file.path, file]))
}

export async function downloadStarterKitZip(theme: ThemeConfig, requestedName = theme.preset, initialMode: ThemeMode = preferredThemeMode(theme.preset)): Promise<void> {
  assertTheme(theme)
  if (typeof document === "undefined" || typeof URL === "undefined") throw new Error("File downloads are only available in a browser")
  const { default: JSZip } = await import("jszip")
  const zip = new JSZip()
  for (const file of Object.values(generateExportProject(theme, initialMode))) zip.file(file.path, file.content)
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
