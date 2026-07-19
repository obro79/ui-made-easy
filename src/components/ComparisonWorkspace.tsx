import { useEffect, useRef, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { Bell, Copy, Edit3, Plus, Trash2, X } from "lucide-react"
import { themeVariables } from "../theme"
import { getStylePreset } from "../presets"
import type { SavedVariant } from "../variants"
import "../comparison-workspace.css"

type ComparisonWorkspaceProps = {
  variants: SavedVariant[]
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

function previewStyle(variant: SavedVariant): CSSProperties {
  const variables = themeVariables(variant.config, variant.previewMode)
  return Object.fromEntries(Object.entries(variables).map(([key, value]) => [`--${key}`, value])) as CSSProperties
}

function PreviewCanvas() {
  return (
    <div className="comparison-canvas" aria-hidden="true" inert>
      <header className="comparison-canvas__intro">
        <span className="comparison-eyebrow">Workspace overview</span>
        <h2>Good morning, Owen.</h2>
        <p>Track the details that matter and keep your team moving.</p>
        <div className="comparison-button-row">
          <button className="comparison-button comparison-button--primary" tabIndex={-1}>Create project</button>
          <button className="comparison-button comparison-button--secondary" tabIndex={-1}>View activity</button>
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
          <input type="email" placeholder="name@company.com" aria-label="Teammate email" tabIndex={-1} readOnly />
        </label>
        <button className="comparison-button comparison-button--primary" type="submit" tabIndex={-1}>Send invite</button>
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

export function ComparisonWorkspace({ variants, onEdit, onDuplicate, onRemove, onClose }: ComparisonWorkspaceProps) {
  const visibleVariants = variants.slice(0, 3)
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>(".comparison-icon-button")?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return }
      if (event.key !== "Tab" || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])')]
        .filter((item) => !item.closest("[inert]"))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("keydown", onKeyDown)
      previous?.focus()
    }
  }, [])

  return createPortal(
    <section ref={dialogRef} className="comparison-workspace" role="dialog" aria-modal="true" aria-labelledby="comparison-title">
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
            <article className="comparison-preview theme-scope" key={variant.id} style={previewStyle(variant)} data-theme-mode={variant.previewMode} data-style-id={preset.id} data-layout={preset.recipe.layout} data-surface={preset.recipe.surface} data-treatment={preset.recipe.typography} data-geometry={preset.recipe.geometry} data-decoration={preset.recipe.decoration}>
              <header className="comparison-preview__header">
                <div className="comparison-preview__identity">
                  <span className="comparison-swatch" style={{ background: variant.config[variant.previewMode].primary }} aria-hidden="true" />
                  <div>
                    <h2>{variant.name}</h2>
                    <p>{preset.name} · {variant.config.density} · {variant.previewMode}</p>
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
    </section>,
    document.body,
  )
}
