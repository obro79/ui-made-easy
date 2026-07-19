import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown, Copy, Download, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import {
  exportThemeCss,
  getContrastRatio,
  type SemanticPalette,
  type ThemeConfig,
  type ThemeMode,
} from "../theme"
import { PaletteWizard } from "./PaletteWizard"
import { StyleSelector } from "./StyleSelector"
import { FONT_PAIRS, FontSelector } from "./FontSelector"
import { downloadStarterKitZip } from "../export-project"

type ThemeCustomizerProps = {
  open: boolean
  config: ThemeConfig
  previewMode: ThemeMode
  onOpenChange: (open: boolean) => void
  onConfigChange: (config: ThemeConfig) => void
  onPreviewModeChange: (mode: ThemeMode) => void
  onReset: () => void
  currentStyle: string
  onStyleChange: (style: string) => void
}

const tokenLabels: Record<keyof SemanticPalette, string> = {
  background: "Background",
  surface: "Surface",
  foreground: "Foreground",
  mutedForeground: "Muted foreground",
  border: "Border",
  primary: "Primary",
  primaryForeground: "Primary foreground",
  secondary: "Secondary",
  destructive: "Destructive",
  success: "Success",
  focusRing: "Focus ring",
}

const contrastPairs: Array<[keyof SemanticPalette, keyof SemanticPalette, string]> = [
  ["foreground", "background", "Text / background"],
  ["mutedForeground", "surface", "Muted text / surface"],
  ["primaryForeground", "primary", "Primary button"],
]

const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)

export function ThemeCustomizer({
  open,
  config,
  previewMode,
  onOpenChange,
  onConfigChange,
  onPreviewModeChange,
  onReset,
  currentStyle,
  onStyleChange,
}: ThemeCustomizerProps) {
  const titleId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [advanced, setAdvanced] = useState(false)
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle")
  const [exportState, setExportState] = useState<"idle" | "working" | "done" | "error">("idle")
  const palette = config[previewMode]

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    drawerRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      previousFocus?.focus()
    }
  }, [open, onOpenChange])

  const updateConfig = (patch: Partial<ThemeConfig>) =>
    onConfigChange({ ...config, ...patch })

  const updateToken = (token: keyof SemanticPalette, value: string) => {
    if (!isHex(value)) return
    updateConfig({ [previewMode]: { ...palette, [token]: value } })
  }

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(exportThemeCss(config))
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
    window.setTimeout(() => setCopyState("idle"), 1800)
  }

  const exportKit = async () => {
    setExportState("working")
    try {
      await downloadStarterKitZip(config, `${config.preset}-theme`)
      setExportState("done")
    } catch {
      setExportState("error")
    }
    window.setTimeout(() => setExportState("idle"), 2200)
  }

  if (!open) return null

  return (
    <div className="customizer-layer" role="presentation">
      <button
        className="customizer-backdrop"
        aria-label="Close theme customizer"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={drawerRef}
        className="customizer-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="customizer-header">
          <div>
            <span className="eyebrow">Design system</span>
            <h2 id={titleId}>Customize theme</h2>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <div className="customizer-scroll">
          <section className="customizer-section">
            <StyleSelector value={currentStyle} onChange={onStyleChange} mode={previewMode} />
          </section>
          <section className="customizer-section">
            <FontSelector
              value={FONT_PAIRS.find((pair) => pair.headingFamily === config.headingFont && pair.bodyFamily === config.bodyFont)?.id ?? "modern-sans"}
              onChange={(pair) => updateConfig({ headingFont: pair.headingFamily, bodyFont: pair.bodyFamily })}
            />
          </section>
          <PaletteWizard config={config} onChange={onConfigChange} />

          <section className="customizer-section" aria-labelledby="spacing-title">
            <h3 id="spacing-title">Spacing & density</h3>
            <div className="segmented-control" aria-label="Interface density">
              {(["compact", "default", "comfortable"] as const).map((density) => (
                <button
                  key={density}
                  aria-pressed={config.density === density}
                  className={config.density === density ? "active" : ""}
                  onClick={() => updateConfig({ density })}
                >
                  {density[0].toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
            <label className="range-field">
              <span>Base spacing <output>{config.baseSpacing}px</output></span>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={config.baseSpacing}
                onChange={(e) => updateConfig({ baseSpacing: Number(e.target.value) })}
              />
            </label>
          </section>

          <section
            className="customizer-section appearance-controls"
            aria-labelledby="appearance-title"
          >
            <div className="customizer-section-heading">
              <div>
                <h3 id="appearance-title">Appearance</h3>
                <p>Shape the surfaces, borders, shadows, and typography.</p>
              </div>
            </div>

            <label className="range-field">
              <span>
                Corner radius
                <output className="customizer-value">{config.radius}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={config.radius}
                onChange={(e) => updateConfig({ radius: Number(e.target.value) })}
              />
            </label>

            <div className="control-group">
              <span className="control-label" id="shadow-label">Shadow</span>
              <div className="segmented-control" aria-labelledby="shadow-label">
                {(["none", "soft", "medium", "strong"] as const).map((shadow) => (
                  <button
                    key={shadow}
                    type="button"
                    aria-pressed={config.shadow === shadow}
                    className={config.shadow === shadow ? "active" : ""}
                    onClick={() => updateConfig({ shadow })}
                  >
                    {shadow[0].toUpperCase() + shadow.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <label className="range-field">
              <span>
                Border width
                <output className="customizer-value">{config.borderWidth}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={config.borderWidth}
                onChange={(e) => updateConfig({ borderWidth: Number(e.target.value) })}
              />
            </label>

            <label className="range-field">
              <span>
                Type scale
                <output className="customizer-value">{config.typeScale.toFixed(2)}×</output>
              </span>
              <input
                type="range"
                min="0.9"
                max="1.15"
                step="0.05"
                value={config.typeScale}
                onChange={(e) => updateConfig({ typeScale: Number(e.target.value) })}
              />
            </label>
          </section>

          <section className="customizer-section" aria-labelledby="layout-title">
            <div className="customizer-section-heading">
              <div>
                <h3 id="layout-title">Layout</h3>
                <p>Choose how tightly the gallery content is framed.</p>
              </div>
            </div>
            <div className="segmented-control" aria-label="Content width">
              {(["narrow", "standard", "wide"] as const).map((contentWidth) => (
                <button
                  key={contentWidth}
                  type="button"
                  aria-pressed={config.contentWidth === contentWidth}
                  className={config.contentWidth === contentWidth ? "active" : ""}
                  onClick={() => updateConfig({ contentWidth })}
                >
                  {contentWidth[0].toUpperCase() + contentWidth.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="customizer-section" aria-labelledby="tokens-title">
            <div className="customizer-section-heading">
              <div>
                <h3 id="tokens-title">Theme tokens</h3>
                <p>Fine-tune the generated colors for each mode.</p>
              </div>
              <button className="text-btn" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>
                Advanced <ChevronDown aria-hidden="true" size={15} />
              </button>
            </div>
            <div className="segmented-control mode-tabs" role="tablist" aria-label="Color mode">
              {(["light", "dark"] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={previewMode === mode}
                  className={previewMode === mode ? "active" : ""}
                  onClick={() => onPreviewModeChange(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {advanced && (
              <div className="token-grid">
                {(Object.keys(tokenLabels) as Array<keyof SemanticPalette>).map((token) => (
                  <label className="token-field" key={token}>
                    <span>{tokenLabels[token]}</span>
                    <span className="token-input">
                      <input type="color" value={palette[token]} onChange={(e) => updateToken(token, e.target.value)} />
                      <input value={palette[token]} onChange={(e) => updateToken(token, e.target.value)} aria-label={`${tokenLabels[token]} hex`} />
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="customizer-section" aria-labelledby="contrast-title">
            <h3 id="contrast-title">Contrast</h3>
            <div className="contrast-list">
              {contrastPairs.map(([foreground, background, label]) => {
                const ratio = getContrastRatio(palette[foreground], palette[background])
                const passes = ratio >= 4.5
                return (
                  <div className={`contrast-row ${passes ? "passes" : "warns"}`} key={label}>
                    <span className="contrast-icon">{passes ? <Check size={14} /> : "!"}</span>
                    <span>{label}</span>
                    <strong>{ratio.toFixed(2)}:1 · {passes ? "AA" : "Low"}</strong>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <footer className="customizer-footer">
          <button className="btn secondary" onClick={onReset}>
            <RotateCcw aria-hidden="true" size={16} /> Reset
          </button>
          <button className="btn primary" onClick={copyCss}>
            {copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}
            {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy CSS"}
          </button>
          <button className="btn primary export-kit-button" onClick={exportKit} disabled={exportState === "working"}>
            {exportState === "done" ? <Check size={16} /> : <Download size={16} />}
            {exportState === "working" ? "Building ZIP…" : exportState === "done" ? "Starter kit exported" : exportState === "error" ? "Export failed" : "Export Tailwind starter kit"}
          </button>
          <span className="sr-only" aria-live="polite">
            {copyState === "copied" ? "Theme CSS copied to clipboard" : copyState === "error" ? "Could not copy theme CSS" : ""}
          </span>
        </footer>
      </div>
    </div>
  )
}

export function CustomizeTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn secondary customize-trigger" onClick={onClick}>
      <SlidersHorizontal aria-hidden="true" size={16} /> Customize
    </button>
  )
}
