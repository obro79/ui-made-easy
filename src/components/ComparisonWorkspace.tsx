import { useEffect, type CSSProperties } from "react"
import { Bell, Copy, Edit3, Plus, Trash2, X } from "lucide-react"
import type { ThemeMode } from "../theme"
import { themeVariables } from "../theme"
import { getStylePreset } from "../presets"
import type { SavedVariant } from "../variants"
import "../comparison-workspace.css"

type ComparisonWorkspaceProps = {
  variants: SavedVariant[]
  mode: ThemeMode
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

function previewStyle(variant: SavedVariant, mode: ThemeMode): CSSProperties {
  const variables = themeVariables(variant.config, mode)
  return Object.fromEntries(Object.entries(variables).map(([key, value]) => [`--${key}`, value])) as CSSProperties
}

function PreviewCanvas() {
  return (
    <div className="comparison-canvas">
      <header className="comparison-canvas__intro">
        <span className="comparison-eyebrow">Workspace overview</span>
        <h2>Good morning, Owen.</h2>
        <p>Track the details that matter and keep your team moving.</p>
        <div className="comparison-button-row">
          <button className="comparison-button comparison-button--primary">Create project</button>
          <button className="comparison-button comparison-button--secondary">View activity</button>
        </div>
      </header>

      <section className="comparison-card" aria-label="Project summary">
        <div className="comparison-card__heading">
          <div>
            <span className="comparison-eyebrow">This week</span>
            <h3>Project momentum</h3>
          </div>
          <span className="comparison-pill">On track</span>
        </div>
        <strong className="comparison-metric">84%</strong>
        <div className="comparison-progress" aria-label="Project progress: 84 percent">
          <span style={{ width: "84%" }} />
        </div>
        <p>12 of 14 milestones completed</p>
      </section>

      <form className="comparison-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Invite a teammate
          <input type="email" placeholder="name@company.com" aria-label="Teammate email" />
        </label>
        <button className="comparison-button comparison-button--primary" type="submit">Send invite</button>
      </form>

      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <caption>Recent projects</caption>
          <thead><tr><th>Project</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            <tr><td>Mobile refresh</td><td><span className="comparison-status">Active</span></td><td>Today</td></tr>
            <tr><td>Brand system</td><td><span className="comparison-status">Review</span></td><td>Yesterday</td></tr>
          </tbody>
        </table>
      </div>

      <div className="comparison-alert" role="status">
        <Bell size={16} aria-hidden="true" />
        <div><strong>Everything is synced</strong><span>Your latest changes are ready.</span></div>
      </div>
    </div>
  )
}

export function ComparisonWorkspace({ variants, mode, onEdit, onDuplicate, onRemove, onClose }: ComparisonWorkspaceProps) {
  const visibleVariants = variants.slice(0, 3)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [onClose])

  return (
    <section className="comparison-workspace" role="dialog" aria-modal="true" aria-labelledby="comparison-title">
      <header className="comparison-workspace__header">
        <div>
          <span className="comparison-workspace__kicker">Theme lab</span>
          <h1 id="comparison-title">Compare variants</h1>
          <p>Review the same interface across up to three saved directions.</p>
        </div>
        <button className="comparison-icon-button" onClick={onClose} aria-label="Close comparison">
          <X aria-hidden="true" />
        </button>
      </header>

      {visibleVariants.length ? (
        <div className="comparison-grid" data-count={visibleVariants.length}>
          {visibleVariants.map((variant) => {
            const preset = getStylePreset(variant.config.preset)!
            return (
            <article className="comparison-preview theme-scope" key={variant.id} style={previewStyle(variant, mode)} data-theme-mode={mode} data-style-id={preset.id} data-layout={preset.recipe.layout} data-surface={preset.recipe.surface} data-treatment={preset.recipe.typography} data-geometry={preset.recipe.geometry} data-decoration={preset.recipe.decoration}>
              <header className="comparison-preview__header">
                <div className="comparison-preview__identity">
                  <span className="comparison-swatch" style={{ background: variant.config[mode].primary }} aria-hidden="true" />
                  <div>
                    <h2>{variant.name}</h2>
                    <p>{preset.name} · {variant.config.density}</p>
                  </div>
                </div>
                <div className="comparison-preview__actions" aria-label={`Actions for ${variant.name}`}>
                  <button onClick={() => onEdit(variant.id)} aria-label={`Edit ${variant.name}`} title="Edit"><Edit3 aria-hidden="true" /></button>
                  <button onClick={() => onDuplicate(variant.id)} aria-label={`Duplicate ${variant.name}`} title="Duplicate"><Copy aria-hidden="true" /></button>
                  <button className="comparison-remove" onClick={() => onRemove(variant.id)} aria-label={`Remove ${variant.name} from comparison`} title="Remove"><Trash2 aria-hidden="true" /></button>
                </div>
              </header>
              <PreviewCanvas />
            </article>
            )
          })}
        </div>
      ) : (
        <div className="comparison-empty">
          <Plus aria-hidden="true" />
          <h2>No variants selected</h2>
          <p>Save a theme direction, then add it here to compare.</p>
        </div>
      )}
    </section>
  )
}
