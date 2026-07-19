# UI Components Workbench

A visual UI-system laboratory for exploring, tuning, comparing, saving, and exporting complete interface directions. It places a practical component inventory on one page and applies each design direction to the whole system, not just its colors.

## What it does

- Presents buttons, typography, forms, cards, tables, navigation, overlays, loading states, feedback, and other common UI primitives together.
- Generates five-colour palettes with editable hex values, per-colour locks, contrast feedback, a Space-key shuffle shortcut, and one-click application across the workbench.
- Includes a token-aware playground for spinner, dots, pulse, equalizer, orbit, and skeleton loading treatments, with play/pause and reduced-motion support.
- Includes 20 curated styles across product, layout, effects, expressive, and design-system-inspired categories.
- Gives every style a documented reference basis, signature traits, misuse warnings, intended uses, and accessibility adaptations.
- Changes composition, typography, density, geometry, surfaces, decoration, and motion through shared role tokens.
- Saves named presets locally and compares up to three directions side by side.
- Exports a Tailwind CSS v4 and shadcn/ui starter ZIP with light/dark tokens, the structural recipe, a component page, `components.json`, a manifest, and setup notes.

## Style catalog

| Category | Presets |
| --- | --- |
| Product | Minimalism, Swiss, Editorial, SaaS Modern, Linear-inspired, Enterprise Dense |
| Layout | Bento Grid, Cinematic Mission Control, Canvas, Node-based, Split-pane Workspace, Timeline |
| Effects & dark | Liquid Glass, Aurora/Mesh, Monochrome Dark |
| Expressive & era | Neo-brutalism, Collage/Scrapbook, Retrofuturism, Terminal |
| System references | Material 3-inspired |

Named product and design-system styles are clearly labeled as inspired interpretations, not official implementations.

The application exposes 20 curated styles that have passed the current visual QA bar. The registry also retains 20 inactive source definitions solely so older saved themes can migrate safely and those directions can be refined for possible future activation; they are not part of the selectable catalog.

## Run locally

```bash
git clone https://github.com/obro79/ui-components.git
cd ui-components
npm install
npm run dev
```

Open the local URL printed by Vite.

## Useful commands

```bash
npm run dev          # Start the local workbench
npm run test:styles  # Verify the curated registry, migrations, visual signatures, and responsive guards
npm run build        # Type-check and create a production build
npm run preview      # Preview the production build
```

## How it is organized

```text
src/
├── components/ui/          Reusable component primitives
├── components/             Workbench, selector, comparison, and editor UI
├── presets.ts              Single canonical preset registry
├── style-dna.ts            Authenticity and visual-recipe types
├── authentic-styles.css    Shared structural and low-level recipe primitives
├── curated-styles.css      Complete page, thumbnail, responsive, and accessibility treatments for the active 20
├── theme.ts                Semantic tokens, migration, and theme variables
├── variants.ts             Saved layout persistence
└── export-project.ts       Tailwind/shadcn starter generation
```

The main gallery, style thumbnails, comparison previews, and exported page all consume the same preset registry and semantic theme contract.

## Authenticity model

Each preset records:

- Its historical, product, or design-system reference basis.
- Required typography, geometry, surface, composition, and interaction traits.
- High-signal details that make it recognizable.
- Common shortcuts that misrepresent the style.
- Accessibility adaptations that preserve its character.

The UI exposes this information in the active preset’s **Style DNA** panel.

## Export format

The generated ZIP is a reusable Tailwind v4/shadcn starting point containing:

- Semantic light and dark CSS variables.
- Typography and font stacks.
- The selected structural and visual recipe.
- Reduced-motion rules.
- A reusable `ComponentShowcase.tsx` page.
- shadcn/ui `components.json`.
- A machine-readable theme manifest.
- A README containing the selected style’s authenticity notes.

## Accessibility

The workbench retains visible keyboard focus, readable text, semantic controls, responsive behavior, contrast-aware palettes, and reduced-motion support across style changes.

## Tech stack

React 19, TypeScript, Vite, Lucide icons, JSZip, and shadcn-style component primitives.

## License

MIT
