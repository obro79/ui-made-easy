import { useState } from "react"
import { Pause, Play } from "lucide-react"
import "../loading-playground.css"

const loaders = [
  { id: "spinner", label: "Spinner", visual: <span className="loader-spinner" /> },
  { id: "dots", label: "Bouncing dots", visual: <span className="loader-dots"><i /><i /><i /></span> },
  { id: "pulse", label: "Pulse", visual: <span className="loader-pulse"><i /></span> },
  { id: "bars", label: "Equalizer bars", visual: <span className="loader-bars"><i /><i /><i /><i /></span> },
  { id: "orbit", label: "Orbit", visual: <span className="loader-orbit"><i /><b /></span> },
  { id: "skeleton", label: "Skeleton", visual: <span className="loader-skeleton"><i /><b><em /><em /><em /></b></span> },
] as const

export function LoadingPlayground() {
  const [playing, setPlaying] = useState(true)

  return (
    <section className="loading-playground" data-playing={playing} aria-labelledby="loading-playground-title">
      <header className="loading-playground__header">
        <div>
          <h3 id="loading-playground-title">Loading animation playground</h3>
          <p>Six token-aware patterns for indeterminate and placeholder states.</p>
        </div>
        <button
          className="loading-playground__toggle"
          type="button"
          aria-pressed={playing}
          aria-label={`Loading motion ${playing ? "on" : "off"}`}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {playing ? "Pause motion" : "Play motion"}
        </button>
      </header>

      <p className="sr-only" role="status" aria-live="polite">
        Loading animations {playing ? "playing" : "paused"}.
      </p>

      <div className="loading-playground__grid" role="list" aria-label="Loading animation examples">
        {loaders.map((loader) => (
          <article className="loading-playground__item" role="listitem" key={loader.id}>
            <div className="loading-playground__stage" role="img" aria-label={`${loader.label} loading indicator`}>
              {loader.visual}
            </div>
            <div className="loading-playground__label">
              <strong>{loader.label}</strong>
              <span>{loader.id === "skeleton" ? "Content placeholder" : "Loading indicator"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
