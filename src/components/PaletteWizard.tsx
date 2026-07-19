import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Copy, Lock, Shuffle, Unlock } from "lucide-react"
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

const fields: Array<{ key: keyof Palette; label: string; hint: string }> = [
  { key: "primary", label: "Primary", hint: "Actions" },
  { key: "secondary", label: "Secondary", hint: "Accents" },
  { key: "background", label: "Background", hint: "Canvas" },
  { key: "surface", label: "Surface", hint: "Cards" },
  { key: "foreground", label: "Foreground", hint: "Text" },
]

const EXAMPLE_PALETTE: Palette = {
  primary: "#4f3130",
  secondary: "#753742",
  background: "#aa5042",
  surface: "#d8bd8a",
  foreground: "#d8d78f",
}

const emptyLocks = (): Record<keyof Palette, boolean> => ({
  primary: false,
  secondary: false,
  background: false,
  surface: false,
  foreground: false,
})

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
  if (typeof crypto !== "undefined" && crypto.getRandomValues) return crypto.getRandomValues(new Uint8Array(1))[0]
  return Math.floor(Math.random() * 256)
}

function randomColor(): string {
  return `#${[randomByte(), randomByte(), randomByte()].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function buildTheme(config: ThemeConfig, colors: Palette): ThemeConfig {
  const generated = generatePalette(colors.primary)
  const darkSecondary = generatePalette(colors.secondary).dark.primary
  return {
    ...config,
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
  const initial = currentPalette(config)
  const [selected, setSelected] = useState<Palette>(initial)
  const [drafts, setDrafts] = useState<Record<keyof Palette, string>>(initial)
  const [locked, setLocked] = useState(emptyLocks)
  const [status, setStatus] = useState("")

  const checks = useMemo(() => [
    { label: "Body text", ratio: getContrastRatio(selected.foreground, selected.background) },
    { label: "Text on surface", ratio: getContrastRatio(selected.foreground, selected.surface) },
    { label: "Primary action", ratio: getContrastRatio(bestContrastingColor(selected.primary), selected.primary) },
  ], [selected])

  const setPalette = useCallback((palette: Palette) => {
    setSelected(palette)
    setDrafts(palette)
    setStatus("")
  }, [])

  const randomize = useCallback(() => {
    const next = { ...selected }
    for (const { key } of fields) if (!locked[key]) next[key] = randomColor()
    setPalette(next)
  }, [locked, selected, setPalette])

  useEffect(() => {
    const shuffleOnSpace = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button, a, [contenteditable='true']")) return
      event.preventDefault()
      randomize()
    }
    window.addEventListener("keydown", shuffleOnSpace)
    return () => window.removeEventListener("keydown", shuffleOnSpace)
  }, [randomize])

  const updateHexDraft = (key: keyof Palette, value: string) => {
    setDrafts((current) => ({ ...current, [key]: value }))
    const normalized = normalizeHex(value)
    if (normalized) {
      setSelected((current) => ({ ...current, [key]: normalized }))
      setStatus("")
    }
  }

  const commitHex = (key: keyof Palette) => {
    const normalized = normalizeHex(drafts[key])
    if (normalized) setDrafts((current) => ({ ...current, [key]: normalized }))
  }

  const copyPalette = async () => {
    try {
      await navigator.clipboard.writeText(fields.map(({ key }) => selected[key]).join(" "))
      setStatus("Palette copied")
    } catch {
      setStatus("Could not copy palette")
    }
  }

  const apply = () => {
    onChange(buildTheme(config, selected))
    setStatus("Palette applied across the gallery")
  }

  return (
    <section className="palette-wizard" aria-labelledby="palette-wizard-title">
      <div className="palette-wizard__header">
        <div>
          <p className="palette-wizard__eyebrow">Five-colour generator</p>
          <h2 id="palette-wizard-title">Find your palette</h2>
          <p>Lock the colours you love, then shuffle the rest. Press <kbd>Space</kbd> for a new mix.</p>
        </div>
      </div>

      <div className="palette-wizard__toolbar">
        <button className="palette-wizard__shuffle" type="button" onClick={randomize}>
          <Shuffle size={16} aria-hidden="true" /> Randomize unlocked
        </button>
        <button type="button" onClick={() => setPalette(EXAMPLE_PALETTE)}>Try warm example</button>
        <button type="button" onClick={copyPalette} aria-label="Copy all five hex colours">
          <Copy size={16} aria-hidden="true" /> Copy
        </button>
      </div>

      <div className="palette-wizard__strip" aria-label="Five-colour palette">
        {fields.map(({ key, label, hint }) => {
          const valid = normalizeHex(drafts[key]) !== null
          return (
            <div className="palette-wizard__colour" key={key}>
              <div className="palette-wizard__swatch" style={{ backgroundColor: selected[key], color: bestContrastingColor(selected[key]) }}>
                <button
                  type="button"
                  className={locked[key] ? "is-locked" : ""}
                  aria-pressed={locked[key]}
                  aria-label={`${locked[key] ? "Unlock" : "Lock"} ${label.toLowerCase()} colour`}
                  onClick={() => setLocked((current) => ({ ...current, [key]: !current[key] }))}
                >
                  {locked[key] ? <Lock size={17} aria-hidden="true" /> : <Unlock size={17} aria-hidden="true" />}
                </button>
                <label className="palette-wizard__native-picker">
                  <span className="sr-only">Choose {label.toLowerCase()} colour</span>
                  <input type="color" value={selected[key]} onChange={(event) => updateHexDraft(key, event.target.value)} />
                </label>
              </div>
              <div className="palette-wizard__colour-meta">
                <label htmlFor={`palette-${key}`}>{label}<small>{hint}</small></label>
                <input
                  id={`palette-${key}`}
                  value={drafts[key]}
                  onChange={(event) => updateHexDraft(key, event.target.value)}
                  onBlur={() => commitHex(key)}
                  aria-invalid={!valid}
                  aria-describedby={!valid ? `palette-${key}-error` : undefined}
                  maxLength={7}
                  spellCheck={false}
                />
                {!valid && <small className="palette-wizard__error" id={`palette-${key}-error`}>Use a 3- or 6-digit hex value.</small>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="palette-wizard__contrast" aria-label="Contrast summary">
        {checks.map((check) => (
          <div key={check.label}>
            <span>{check.label}</span>
            <strong className={check.ratio >= 4.5 ? "is-pass" : "is-warning"}>
              {check.ratio >= 4.5 && <Check size={14} aria-hidden="true" />}
              {check.ratio.toFixed(2)}:1 · {check.ratio >= 4.5 ? "AA" : check.ratio >= 3 ? "Large text" : "Low"}
            </strong>
          </div>
        ))}
      </div>

      <button className="palette-wizard__apply" type="button" onClick={apply}>Apply palette</button>
      <p className="palette-wizard__status" aria-live="polite">{status}</p>
    </section>
  )
}
