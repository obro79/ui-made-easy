import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { Activity, GitBranch, LocateFixed, Minus, Move, PanelLeft, Plus, RadioTower } from "lucide-react"
import type { StylePresetId } from "../presets"
import "../structural-style-demo.css"

type StructuralStyleDemoProps = { style: StylePresetId }

function MissionControlDemo() {
  const [activeBranch, setActiveBranch] = useState("north")
  const [merged, setMerged] = useState(false)
  const branches = [
    { id: "north", label: "North relay", state: "Nominal", progress: 92 },
    { id: "coast", label: "Coast relay", state: "Watching", progress: 68 },
    { id: "fallback", label: "Fallback", state: "Standby", progress: 41 },
  ]
  return (
    <section className="structural-demo mission-demo" aria-labelledby="mission-demo-title">
      <div className="structural-demo__bar">
        <div><span>Live topology</span><h2 id="mission-demo-title">Branch control</h2></div>
        <div className="mission-demo__telemetry"><span><Activity aria-hidden="true" /> 24.8 ms</span><span><RadioTower aria-hidden="true" /> 8/8 online</span></div>
      </div>
      <div className="mission-demo__stage">
        <div className="mission-demo__source"><strong>CORE</strong><span>00:42:18</span></div>
        <div className="mission-demo__branches" role="group" aria-label="Operational branches">
          {branches.map((branch) => (
            <button key={branch.id} type="button" aria-pressed={activeBranch === branch.id} className={activeBranch === branch.id ? "is-active" : ""} onClick={() => { setActiveBranch(branch.id); setMerged(false) }}>
              <span className="mission-demo__path" aria-hidden="true" />
              <span><b>{branch.label}</b><small>{branch.state}</small></span>
              <strong>{branch.progress}%</strong>
            </button>
          ))}
        </div>
        <div className="mission-demo__result"><span>Surviving path</span><strong>{branches.find((branch) => branch.id === activeBranch)?.label}</strong><button type="button" onClick={() => setMerged(true)}>{merged ? "Future merged" : "Merge future"}</button></div>
      </div>
      <p className="structural-demo__status" aria-live="polite"><GitBranch aria-hidden="true" /> {merged ? `${branches.find((branch) => branch.id === activeBranch)?.label} committed as the surviving future.` : "Choose a branch, then merge the surviving future."}</p>
    </section>
  )
}

function CanvasDemo() {
  const [viewport, setViewport] = useState({ x: 14, y: 8, zoom: 1 })
  const [selected, setSelected] = useState("palette")
  const drag = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null)
  const clampZoom = (zoom: number) => Math.min(1.6, Math.max(.6, zoom))
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, originX: viewport.x, originY: viewport.y }
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setViewport((current) => ({ ...current, x: drag.current!.originX + event.clientX - drag.current!.x, y: drag.current!.originY + event.clientY - drag.current!.y }))
  }
  return (
    <section className="structural-demo canvas-demo" aria-labelledby="canvas-demo-title">
      <div className="structural-demo__bar">
        <div><span>Interactive surface</span><h2 id="canvas-demo-title">Spatial component canvas</h2></div>
        <div className="canvas-demo__toolbar" aria-label="Canvas controls">
          <button type="button" onClick={() => setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom - .1) }))} aria-label="Zoom out"><Minus /></button>
          <output aria-live="polite">{Math.round(viewport.zoom * 100)}%</output>
          <button type="button" onClick={() => setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom + .1) }))} aria-label="Zoom in"><Plus /></button>
          <button type="button" onClick={() => setViewport({ x: 14, y: 8, zoom: 1 })} aria-label="Reset canvas"><LocateFixed /></button>
        </div>
      </div>
      <div
        className="canvas-demo__viewport"
        role="region"
        tabIndex={0}
        aria-label="Canvas. Drag to pan; use arrow keys to move and plus or minus to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
        onKeyDown={(event) => {
          const delta = event.shiftKey ? 24 : 10
          if (event.key === "ArrowLeft") setViewport((current) => ({ ...current, x: current.x - delta }))
          else if (event.key === "ArrowRight") setViewport((current) => ({ ...current, x: current.x + delta }))
          else if (event.key === "ArrowUp") setViewport((current) => ({ ...current, y: current.y - delta }))
          else if (event.key === "ArrowDown") setViewport((current) => ({ ...current, y: current.y + delta }))
          else if (event.key === "+" || event.key === "=") setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom + .1) }))
          else if (event.key === "-") setViewport((current) => ({ ...current, zoom: clampZoom(current.zoom - .1) }))
          else return
          event.preventDefault()
        }}
      >
        <div className="canvas-demo__plane" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}>
          <button type="button" aria-pressed={selected === "palette"} className={selected === "palette" ? "canvas-object is-selected" : "canvas-object"} onClick={() => setSelected("palette")} style={{ left: "9%", top: "12%" }}><span>Palette</span><b>#7c3aed</b><i /></button>
          <button type="button" aria-pressed={selected === "card"} className={selected === "card" ? "canvas-object is-selected" : "canvas-object"} onClick={() => setSelected("card")} style={{ left: "44%", top: "22%" }}><span>Card</span><b>Project health</b><small>On track · 84%</small></button>
          <button type="button" aria-pressed={selected === "action"} className={selected === "action" ? "canvas-object is-selected" : "canvas-object"} onClick={() => setSelected("action")} style={{ left: "28%", top: "62%" }}><span>Action</span><b>Publish changes</b></button>
        </div>
      </div>
      <p className="structural-demo__status" aria-live="polite"><Move aria-hidden="true" /> Selected object: {selected}</p>
    </section>
  )
}

function NodeDemo() {
  const [selected, setSelected] = useState("transform")
  const nodes = [
    { id: "input", label: "Theme input", type: "source", x: 8, y: 34 },
    { id: "transform", label: "Token mapper", type: "transform", x: 39, y: 12 },
    { id: "validate", label: "Contrast gate", type: "guard", x: 39, y: 58 },
    { id: "output", label: "Component UI", type: "output", x: 72, y: 34 },
  ]
  return (
    <section className="structural-demo node-demo" aria-labelledby="node-demo-title">
      <div className="structural-demo__bar"><div><span>Workflow graph</span><h2 id="node-demo-title">Semantic token pipeline</h2></div><span className="node-demo__legend"><GitBranch aria-hidden="true" /> 4 nodes · 4 edges</span></div>
      <div className="node-demo__stage">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M24 47 C31 47 31 25 39 25" /><path d="M24 47 C31 47 31 71 39 71" /><path d="M56 25 C65 25 64 47 72 47" /><path d="M56 71 C65 71 64 47 72 47" />
        </svg>
        {nodes.map((node) => <button key={node.id} type="button" aria-pressed={selected === node.id} className={selected === node.id ? "node-demo__node is-selected" : "node-demo__node"} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelected(node.id)}><span>{node.type}</span><strong>{node.label}</strong><i aria-hidden="true" /><i aria-hidden="true" /></button>)}
        <div className="node-demo__minimap" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
      <ol className="sr-only"><li>Theme input connects to Token mapper.</li><li>Theme input connects to Contrast gate.</li><li>Token mapper and Contrast gate connect to Component UI.</li></ol>
    </section>
  )
}

function SplitPaneDemo() {
  const [split, setSplit] = useState(38)
  const [reviewed, setReviewed] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const resizeFromPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = frameRef.current?.getBoundingClientRect()
    if (!bounds) return
    setSplit(Math.min(68, Math.max(24, ((event.clientX - bounds.left) / bounds.width) * 100)))
  }
  const style = { "--split-position": `${split}%` } as CSSProperties
  return (
    <section className="structural-demo split-demo" aria-labelledby="split-demo-title">
      <div className="structural-demo__bar"><div><span>Resizable workspace</span><h2 id="split-demo-title">Editor and live preview</h2></div><label>Pane width <input type="range" min="24" max="68" value={split} onChange={(event) => setSplit(Number(event.target.value))} /></label></div>
      <div className="split-demo__frame" ref={frameRef} style={style}>
        <section className="split-demo__pane" aria-label="Token editor"><div className="split-demo__pane-bar"><PanelLeft aria-hidden="true" /> Tokens</div><code>--primary: #475569;<br/>--radius: 0px;<br/>--density: compact;</code><div className="split-demo__tree"><span>Foundation</span><b>Button</b><span>Card</span><span>Table</span></div></section>
        <button
          type="button"
          className="split-demo__separator"
          role="separator"
          aria-label="Resize editor pane"
          aria-orientation="vertical"
          aria-valuemin={24}
          aria-valuemax={68}
          aria-valuenow={Math.round(split)}
          onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
          onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) resizeFromPointer(event) }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setSplit((current) => Math.max(24, current - 2))
            else if (event.key === "ArrowRight") setSplit((current) => Math.min(68, current + 2))
            else return
            event.preventDefault()
          }}
        ><span /></button>
        <section className="split-demo__pane split-demo__preview" aria-label="Component preview"><div className="split-demo__pane-bar"><PanelLeft aria-hidden="true" /> Preview</div><article><span>Live component</span><h3>Project health</h3><p>Tokens update across both contexts.</p><button type="button" aria-pressed={reviewed} onClick={() => setReviewed((current) => !current)}>{reviewed ? "Changes reviewed" : "Review changes"}</button></article></section>
        <aside className="split-demo__inspector" aria-label="Properties inspector"><div className="split-demo__pane-bar"><PanelLeft aria-hidden="true" /> Inspect</div><dl><div><dt>Width</dt><dd>320</dd></div><div><dt>Gap</dt><dd>12</dd></div><div><dt>State</dt><dd aria-live="polite">{reviewed ? "Reviewed" : "Ready"}</dd></div></dl></aside>
      </div>
    </section>
  )
}

export function StructuralStyleDemo({ style }: StructuralStyleDemoProps) {
  if (style === "cinematic-mission-control") return <MissionControlDemo />
  if (style === "canvas") return <CanvasDemo />
  if (style === "node-based") return <NodeDemo />
  if (style === "split-pane-workspace") return <SplitPaneDemo />
  return null
}
