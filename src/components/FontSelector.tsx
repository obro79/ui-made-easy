import { Check, Type } from "lucide-react"
import type { CSSProperties } from "react"
import "../font-selector.css"

export type FontPair = {
  id: string
  name: string
  heading: string
  body: string
  headingFamily: string
  bodyFamily: string
  character: string
}

export const FONT_PAIRS: readonly FontPair[] = [
  { id: "modern-sans", name: "Modern Sans", heading: "Manrope", body: "Inter", headingFamily: "Manrope, ui-sans-serif, system-ui, sans-serif", bodyFamily: "Inter, ui-sans-serif, system-ui, sans-serif", character: "Clean product UI" },
  { id: "expressive-grotesk", name: "Expressive Grotesk", heading: "Space Grotesk", body: "Inter", headingFamily: "'Space Grotesk', Manrope, sans-serif", bodyFamily: "Inter, ui-sans-serif, system-ui, sans-serif", character: "Bold contemporary display" },
  { id: "editorial", name: "Editorial", heading: "Playfair Display", body: "Source Sans 3", headingFamily: "'Playfair Display', Georgia, serif", bodyFamily: "'Source Sans 3', Arial, sans-serif", character: "Expressive and refined" },
  { id: "neo-grotesk", name: "Neo Grotesk", heading: "Arial", body: "Helvetica", headingFamily: "Arial, Helvetica, sans-serif", bodyFamily: "Helvetica, Arial, sans-serif", character: "Direct modernism" },
  { id: "humanist", name: "Humanist", heading: "Trebuchet MS", body: "Segoe UI", headingFamily: "'Trebuchet MS', Arial, sans-serif", bodyFamily: "'Segoe UI', Arial, sans-serif", character: "Warm and approachable" },
  { id: "classic", name: "Classic", heading: "Georgia", body: "Arial", headingFamily: "Georgia, 'Times New Roman', serif", bodyFamily: "Arial, Helvetica, sans-serif", character: "Timeless authority" },
  { id: "technical", name: "Technical", heading: "DM Mono", body: "Inter", headingFamily: "'DM Mono', ui-monospace, monospace", bodyFamily: "Inter, ui-sans-serif, system-ui, sans-serif", character: "Precise and engineered" },
  { id: "system", name: "System Native", heading: "System UI", body: "System UI", headingFamily: "ui-sans-serif, system-ui, sans-serif", bodyFamily: "ui-sans-serif, system-ui, sans-serif", character: "Fast and familiar" },
  { id: "literary", name: "Literary", heading: "Baskerville", body: "Georgia", headingFamily: "Baskerville, 'Times New Roman', serif", bodyFamily: "Georgia, 'Times New Roman', serif", character: "Thoughtful long-form" },
  { id: "geometric", name: "Geometric", heading: "Avenir Next", body: "Avenir", headingFamily: "'Avenir Next', Avenir, sans-serif", bodyFamily: "Avenir, 'Avenir Next', sans-serif", character: "Balanced and polished" },
  { id: "friendly", name: "Friendly", heading: "Verdana", body: "Verdana", headingFamily: "Verdana, Geneva, sans-serif", bodyFamily: "Verdana, Geneva, sans-serif", character: "Open and accessible" },
  { id: "newsroom", name: "Newsroom", heading: "Times New Roman", body: "Arial", headingFamily: "'Times New Roman', Times, serif", bodyFamily: "Arial, Helvetica, sans-serif", character: "Urgent and credible" },
  { id: "mono", name: "Monospace", heading: "DM Mono", body: "SFMono", headingFamily: "'DM Mono', ui-monospace, monospace", bodyFamily: "ui-monospace, 'SFMono-Regular', Menlo, monospace", character: "Developer focused" },
] as const

export type FontSelectorProps = {
  value: string
  onChange: (pair: FontPair) => void
  pairs?: readonly FontPair[]
  label?: string
  className?: string
}

export function FontSelector({ value, onChange, pairs = FONT_PAIRS, label = "Typography", className = "" }: FontSelectorProps) {
  const selectedVisible = pairs.some((pair) => pair.id === value)
  const navigateOptions = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const options = [...event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="option"]')]
    const currentIndex = options.indexOf(event.currentTarget)
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 :
      event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(options.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1)
    options[nextIndex]?.focus()
    options[nextIndex]?.click()
    event.preventDefault()
  }
  return (
    <section className={`font-selector ${className}`.trim()} aria-labelledby="font-selector-title">
      <div className="font-selector__heading">
        <div className="font-selector__icon"><Type size={16} aria-hidden="true" /></div>
        <div>
          <h3 id="font-selector-title">{label}</h3>
          <p>Choose a heading and body pairing.</p>
        </div>
      </div>

      <div className="font-selector__grid" role="listbox" aria-label="Font pairs">
        {pairs.map((pair, index) => {
          const selected = value === pair.id
          const variables = { "--font-preview-heading": pair.headingFamily, "--font-preview-body": pair.bodyFamily } as CSSProperties
          return (
            <button
              key={pair.id}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={selected || (!selectedVisible && index === 0) ? 0 : -1}
              className="font-pair-card"
              data-selected={selected || undefined}
              style={variables}
              onClick={() => onChange(pair)}
              onKeyDown={navigateOptions}
            >
              <span className="font-pair-card__topline">
                <span><strong>{pair.name}</strong><small>{pair.character}</small></span>
                <span className="font-pair-card__check" aria-hidden="true">{selected && <Check size={13} />}</span>
              </span>
              <span className="font-pair-card__sample">
                <strong>Design with clarity.</strong>
                <span>Build thoughtful interfaces that feel effortless to use.</span>
              </span>
              <span className="font-pair-card__names"><span>{pair.heading}</span><span>+ {pair.body}</span></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
