import { useMemo, useState } from "react"
import {
  bestContrastingColor,
  generatePalette,
  getContrastRatio,
  mixColors,
  normalizeHex,
  type ThemeConfig,
} from "../theme"
import "../palette-wizard.css"

type PaletteWizardProps = {
  config: ThemeConfig
  onChange: (config: ThemeConfig) => void
}

type Palette = {
  primary: string
  secondary: string
  background: string
  surface: string
  foreground: string
}

type Step = 1 | 2 | 3

const fields: Array<{ key: keyof Palette; label: string }> = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "foreground", label: "Foreground" },
]

function currentPalette(config: ThemeConfig): Palette {
  return {
    primary: config.light.primary,
    secondary: config.light.secondary,
    background: config.light.background,
    surface: config.light.surface,
    foreground: config.light.foreground,
  }
}

function randomByte(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(1))[0]
  }
  return Math.floor(Math.random() * 256)
}

function randomColor(): string {
  return `#${[randomByte(), randomByte(), randomByte()]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`
}

function makeCandidate(): Palette {
  const primary = randomColor()
  const secondary = randomColor()
  const generated = generatePalette(primary)
  const background = mixColors(primary, "#ffffff", 0.96)
  const surface = mixColors(secondary, "#ffffff", 0.94)
  const foreground = bestContrastingColor(background, ["#101114", mixColors(primary, "#000000", 0.72)])
  return { primary, secondary, background, surface, foreground: foreground || generated.light.foreground }
}

function buildTheme(config: ThemeConfig, colors: Palette): ThemeConfig {
  const generated = generatePalette(colors.primary)
  const darkSecondary = generatePalette(colors.secondary).dark.primary

  return {
    ...config,
      preset: config.preset,
    light: {
      ...generated.light,
      ...colors,
      primaryForeground: bestContrastingColor(colors.primary),
      mutedForeground: mixColors(colors.foreground, colors.background, 0.42),
      border: mixColors(colors.foreground, colors.background, 0.82),
      focusRing: mixColors(colors.primary, "#ffffff", 0.18),
    },
    dark: {
      ...generated.dark,
      secondary: darkSecondary,
      background: mixColors(colors.background, "#080a0d", 0.91),
      surface: mixColors(colors.surface, "#15191f", 0.86),
      foreground: mixColors(colors.foreground, "#ffffff", 0.9),
      mutedForeground: mixColors(colors.foreground, "#aeb5bf", 0.72),
      border: mixColors(colors.secondary, "#343a44", 0.76),
    },
  }
}

export function PaletteWizard({ config, onChange }: PaletteWizardProps) {
  const [step, setStep] = useState<Step>(1)
  const [candidates, setCandidates] = useState<Palette[]>([])
  const [selected, setSelected] = useState<Palette>(() => currentPalette(config))
  const [applied, setApplied] = useState(false)

  const checks = useMemo(
    () => [
      { label: "Body text", ratio: getContrastRatio(selected.foreground, selected.background) },
      { label: "Text on surface", ratio: getContrastRatio(selected.foreground, selected.surface) },
      { label: "Primary action", ratio: getContrastRatio(bestContrastingColor(selected.primary), selected.primary) },
      { label: "Secondary accent", ratio: getContrastRatio(selected.secondary, selected.background) },
    ],
    [selected],
  )

  const generate = () => {
    const next = Array.from({ length: 6 }, makeCandidate)
    setCandidates(next)
    setSelected(next[0])
    setApplied(false)
  }

  const chooseCandidate = (candidate: Palette) => {
    setSelected(candidate)
    setApplied(false)
    setStep(2)
  }

  const updateColor = (key: keyof Palette, value: string) => {
    const normalized = normalizeHex(value)
    if (!normalized) return
    setSelected((palette) => ({ ...palette, [key]: normalized }))
    setApplied(false)
  }

  const apply = () => {
    onChange(buildTheme(config, selected))
    setApplied(true)
  }

  return (
    <section className="palette-wizard" aria-labelledby="palette-wizard-title">
      <header className="palette-wizard__header">
        <div>
          <p className="palette-wizard__eyebrow">Guided palette</p>
          <h2 id="palette-wizard-title">Build a five-colour system</h2>
        </div>
        <span className="palette-wizard__count">Step {step} of 3</span>
      </header>

      <nav className="palette-wizard__steps" aria-label="Palette workflow">
        {(["Generate", "Refine", "Apply"] as const).map((label, index) => {
          const number = (index + 1) as Step
          return (
            <button key={label} type="button" className={step === number ? "is-current" : ""} onClick={() => setStep(number)}>
              <span>{number}</span>{label}
            </button>
          )
        })}
      </nav>

      {step === 1 && (
        <div className="palette-wizard__panel">
          <div className="palette-wizard__intro">
            <h3>Explore combinations</h3>
            <p>Generate six local, random palettes. Nothing leaves your browser.</p>
          </div>
          <button className="palette-wizard__primary-action" type="button" onClick={generate}>
            {candidates.length ? "Generate six more" : "Generate six palettes"}
          </button>
          {candidates.length > 0 && (
            <div className="palette-wizard__candidates" aria-label="Generated palette choices">
              {candidates.map((candidate, index) => (
                <button key={`${candidate.primary}-${index}`} type="button" onClick={() => chooseCandidate(candidate)} aria-label={`Choose palette ${index + 1}`}>
                  <span className="palette-wizard__swatches" aria-hidden="true">
                    {fields.map(({ key }) => <i key={key} style={{ backgroundColor: candidate[key] }} />)}
                  </span>
                  <span>Palette {index + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="palette-wizard__panel">
          <div className="palette-wizard__intro">
            <h3>Refine each role</h3>
            <p>Fine-tune the five foundation colours before semantic tokens are derived.</p>
          </div>
          <div className="palette-wizard__fields">
            {fields.map(({ key, label }) => (
              <div className="palette-wizard__field" key={key}>
                <label htmlFor={`palette-${key}`}>{label}</label>
                <div>
                  <input id={`palette-${key}`} type="color" value={selected[key]} onChange={(event) => updateColor(key, event.target.value)} aria-label={`Choose ${label.toLowerCase()} colour`} />
                  <input value={selected[key]} onChange={(event) => updateColor(key, event.target.value)} aria-label={`${label} hex value`} spellCheck={false} />
                </div>
              </div>
            ))}
          </div>
          <button className="palette-wizard__primary-action" type="button" onClick={() => setStep(3)}>Review palette</button>
        </div>
      )}

      {step === 3 && (
        <div className="palette-wizard__panel">
          <div className="palette-wizard__intro">
            <h3>Review and apply</h3>
            <p>Contrast is advisory. You can still apply any palette you choose.</p>
          </div>
          <div className="palette-wizard__review-swatches" aria-label="Selected colours">
            {fields.map(({ key, label }) => (
              <div key={key} style={{ backgroundColor: selected[key], color: bestContrastingColor(selected[key]) }}>
                <span>{label}</span><code>{selected[key]}</code>
              </div>
            ))}
          </div>
          <div className="palette-wizard__contrast" aria-label="Contrast summary">
            {checks.map((check) => (
              <div key={check.label}>
                <span>{check.label}</span>
                <strong className={check.ratio >= 4.5 ? "is-pass" : "is-warning"}>
                  {check.ratio.toFixed(2)}:1 · {check.ratio >= 4.5 ? "AA pass" : check.ratio >= 3 ? "Large text only" : "Low contrast"}
                </strong>
              </div>
            ))}
          </div>
          <button className="palette-wizard__primary-action" type="button" onClick={apply}>
            {applied ? "Palette applied" : "Apply palette"}
          </button>
          <p className="palette-wizard__status" aria-live="polite">{applied ? "The palette is now active across the gallery." : ""}</p>
        </div>
      )}
    </section>
  )
}
