import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, CircleHelp, Columns3, Copy, CreditCard, MoreHorizontal, Palette, Plus, Save, Settings, Trash2, Undo2 } from "lucide-react"
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { CustomizeTrigger, ThemeCustomizer } from "./components/ThemeCustomizer"
import { ExtendedGallery } from "./components/ExtendedGallery"
import { ComparisonWorkspace } from "./components/ComparisonWorkspace"
import { StyleDnaPanel } from "./components/StyleDnaPanel"
import { applyTheme, createThemeFromPreset, loadTheme, saveTheme, type ThemeMode } from "./theme"
import { createVariant, duplicateVariant, loadVariants, removeVariant, saveVariants, updateVariant } from "./variants"
import { STYLE_PRESETS, getStylePreset, resolveStylePresetId } from "./presets"
import "./theme-customizer.css"
import "./style-presets.css"
import "./style-presets-extra.css"
import "./customization-overrides.css"
import "./save-preset.css"
import "./authentic-styles.css"
import "./curated-styles.css"

const sections = ["Foundations", "Buttons", "Typography", "Forms", "Cards", "Data display", "Navigation", "Overlays", "States", "Feedback"]
const DARK_FIRST_STYLES = new Set(["linear-inspired", "cinematic-mission-control", "monochrome-dark", "retrofuturism", "terminal"])
function Section({ id, label, children }: { id: string, label: string, children: React.ReactNode }) { return <section id={id} className="spec-section"><div className="section-heading"><p className="eyebrow">{label}</p><h2>{label}</h2></div>{children}</section> }
function Specimen({ title, children }: { title: string, children: React.ReactNode }) { return <div className="specimen"><div className="specimen-bar"><span>{title}</span><Copy size={14} /></div><div className="specimen-content">{children}</div></div> }

export default function App() {
  const [config, setConfig] = useState(loadTheme)
  const [previewMode, setPreviewMode] = useState<ThemeMode>(() => DARK_FIRST_STYLES.has(resolveStylePresetId(config.preset)) ? "dark" : "light")
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [open, setOpen] = useState(false)
  const [variants, setVariants] = useState(loadVariants)
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [style, setStyle] = useState(() => resolveStylePresetId(config.preset))
  const [undoConfig, setUndoConfig] = useState<typeof config | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    applyTheme(config, previewMode, rootRef.current)
    saveTheme(config)
  }, [config, previewMode])

  useEffect(() => { saveVariants(variants) }, [variants])

  useEffect(() => {
    const modalOpen = customizerOpen || comparisonOpen || saveDialogOpen
    if (!modalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (saveDialogOpen) setSaveDialogOpen(false)
      else if (comparisonOpen) setComparisonOpen(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [customizerOpen, comparisonOpen, saveDialogOpen])

  const selectStyle = (name: string) => {
    const nextId = resolveStylePresetId(name)
    if (nextId === style) return
    setUndoConfig(structuredClone(config))
    setStyle(nextId)
    setConfig(createThemeFromPreset(nextId))
    setPreviewMode(DARK_FIRST_STYLES.has(nextId) ? "dark" : "light")
    flash(`Applied ${getStylePreset(nextId)?.name}.`)
  }

  const undoStyle = () => {
    if (!undoConfig) return
    setConfig(undoConfig)
    setStyle(resolveStylePresetId(undoConfig.preset))
    setUndoConfig(null)
    flash("Restored your previous direction.")
  }

  const resetTheme = () => setConfig(createThemeFromPreset(style))

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  const requestSavePreset = () => {
    const active = variants.find((item) => item.id === activeVariantId)
    setPresetName(active?.name ?? `My ${getStylePreset(style)?.name ?? "UI"} preset`)
    setSaveDialogOpen(true)
  }

  const saveCurrentVariant = (event: React.FormEvent) => {
    event.preventDefault()
    const cleanName = presetName.trim()
    if (!cleanName) return
    try {
      if (activeVariantId) {
        setVariants((current) => updateVariant(current, activeVariantId, config, cleanName))
        setSaveDialogOpen(false)
        flash(`Updated “${cleanName}”.`)
        return
      }
      const next = createVariant(variants, config, cleanName)
      setVariants(next)
      setActiveVariantId(next[next.length - 1].id)
      setSaveDialogOpen(false)
      flash(`Saved “${cleanName}”.`)
    } catch {
      flash("Three layouts are already saved. Edit or remove one in Compare.")
    }
  }

  const editVariant = (id: string) => {
    const variant = variants.find((item) => item.id === id)
    if (!variant) return
    setConfig(variant.config)
    setStyle(resolveStylePresetId(variant.config.preset))
    setActiveVariantId(id)
    setComparisonOpen(false)
    setCustomizerOpen(true)
  }

  const copyVariant = (id: string) => {
    try { setVariants(duplicateVariant(variants, id)); flash("Layout duplicated.") }
    catch { flash("Three layouts are already saved.") }
  }

  const deleteVariant = (id: string) => {
    setVariants((current) => removeVariant(current, id))
    if (activeVariantId === id) setActiveVariantId(null)
  }

  const activePreset = getStylePreset(style) ?? STYLE_PRESETS[0]
  const motion = activePreset.category === "expressive-era" ? "snappy" : activePreset.recipe.layout === "spatial" || activePreset.recipe.surface === "glass" ? "float" : "subtle"

  return <div ref={rootRef} className={`app theme-scope ${previewMode === "dark" ? "dark" : ""}`} data-style-id={style} data-layout={activePreset.recipe.layout} data-surface={activePreset.recipe.surface} data-treatment={activePreset.recipe.typography} data-geometry={activePreset.recipe.geometry} data-decoration={activePreset.recipe.decoration} data-motion={motion}>
    <aside><a className="brand" href="#top">Library</a><p className="side-label">Foundations</p>{sections.map((s) => <a key={s} href={`#${s.toLowerCase().replace(" ", "-")}`}>{s}</a>)}<div className="sidebar-bottom"><button className="theme-toggle" onClick={() => setPreviewMode(previewMode === "dark" ? "light" : "dark")}><span className="theme-dot" />{previewMode === "dark" ? "Dark theme" : "Light theme"}</button><p>v0.2 · theme editor</p></div></aside>
    <main id="top"><header className="page-hero"><div className="hero-copy"><p className="eyebrow">Design system workbench</p><h1>Your UI, all in one place.</h1><p className="lede">Create, save, and compare up to three complete visual directions.</p></div><div className="header-actions hero-toolbar"><Button variant="outline" onClick={() => setCustomizerOpen(true)}><Palette size={16}/>{activePreset.name}</Button><CustomizeTrigger onClick={() => setCustomizerOpen(true)} />{undoConfig && <Button variant="ghost" onClick={undoStyle}><Undo2 size={16}/>Undo style</Button>}<Button variant="outline" onClick={requestSavePreset}><Save size={16}/>{activeVariantId ? "Update preset" : "Save preset"}</Button><Button onClick={() => setComparisonOpen(true)}><Columns3 size={16}/> Compare {variants.length}/3</Button></div></header>
      <StyleDnaPanel preset={activePreset} />
      <Section id="foundations" label="Foundations"><div className="foundation-grid"><Specimen title="Color"><div className="swatches"><i className="swatch primary"/><i className="swatch ink"/><i className="swatch muted"/><i className="swatch surface"/><i className="swatch danger"/></div></Specimen><Specimen title="Spacing"><div className="spacing"><b style={{width:8}}/><b style={{width:16}}/><b style={{width:24}}/><b style={{width:32}}/><b style={{width:48}}/></div></Specimen><Specimen title="Elevation"><div className="elevation"><span>Subtle</span><span>Raised</span><span>Floating</span></div></Specimen></div></Section>
      <Section id="buttons" label="Buttons"><Specimen title="Variants"><div className="row wrap"><Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Delete</Button><Button disabled>Disabled</Button></div></Specimen><Specimen title="Sizes & icons"><div className="row"><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large <Plus size={16}/></Button><Button variant="outline" aria-label="More options"><MoreHorizontal size={18}/></Button></div></Specimen></Section>
      <Section id="typography" label="Typography"><Specimen title="Type scale"><div className="type-spec"><h1>Heading one</h1><h2>Heading two</h2><h3>Heading three</h3><h4>Heading four</h4><p className="p1">P1 / Body large — Clear, decisive copy for introductions and key messages.</p><p>Body / Default — The everyday text style. Optimized for comfortable reading in product interfaces.</p><p className="muted">Muted / Supporting information, dates, descriptions and helpful context.</p></div></Specimen></Section>
      <Section id="forms" label="Forms"><div className="two-col"><Specimen title="Inputs"><div className="form-stack"><label>Email address<input placeholder="you@company.com" type="email" /></label><label>Project name<input defaultValue="UI components" /></label><label className="error-label">Workspace URL<input defaultValue="not a valid URL" /><small>Please enter a valid address.</small></label></div></Specimen><Specimen title="Select & controls"><div className="form-stack"><label>Team<select defaultValue="design"><option value="design">Design</option><option>Engineering</option></select></label><label className="check"><input type="checkbox" defaultChecked /> Send me product updates</label><label className="check"><input type="radio" name="plan" defaultChecked /> Starter plan</label><label className="switch"><span>Enable notifications</span><input type="checkbox" defaultChecked /></label></div></Specimen></div></Section>
      <Section id="cards" label="Cards"><div className="card-grid"><Card><CardHeader><Badge>New</Badge><CardTitle>Start a project</CardTitle><CardDescription>Set up a new workspace from your preferred baseline.</CardDescription></CardHeader><CardFooter><Button size="sm">Create project</Button></CardFooter></Card><Card><CardHeader><div className="avatar">OF</div><CardTitle>Owen Fisher</CardTitle><CardDescription>Product designer · Vancouver</CardDescription></CardHeader><CardFooter><Button variant="outline" size="sm">View profile</Button></CardFooter></Card><Card><CardHeader><CardTitle>Pro plan</CardTitle><CardDescription>For teams that need more control.</CardDescription><p className="price">$24 <span>/ month</span></p></CardHeader><CardFooter><Button size="sm">Upgrade</Button></CardFooter></Card></div></Section>
      <Section id="data-display" label="Data display"><Specimen title="Table"><div className="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{[["UI Library", "Active", "Today"], ["Marketing site", "In review", "Yesterday"], ["Mobile app", "Draft", "Jul 12"]].map(([n,s,d]) => <tr key={n}><td><b>{n}</b><small>Design system</small></td><td><Badge className={s === "Active" ? "success" : "neutral"}>{s}</Badge></td><td>{d}</td><td><Button variant="ghost" size="sm" aria-label={`Actions for ${n}`}><MoreHorizontal size={17}/></Button></td></tr>)}</tbody></table></div></Specimen></Section>
      <ExtendedGallery />
      <Section id="feedback" label="Feedback"><div className="two-col"><Specimen title="Alert"><div className="alert"><CircleHelp size={19}/><div><b>Heads up!</b><p>Your account has been successfully updated.</p></div></div></Specimen><Specimen title="Dropdown"><div className="dropdown-wrap"><Button variant="outline" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>Account <ChevronDown size={16}/></Button>{open && <div className="menu" role="menu"><button role="menuitem" onClick={() => { setOpen(false); flash("Settings selected.") }}><Settings size={15}/> Settings</button><button role="menuitem" onClick={() => { setOpen(false); flash("Billing selected.") }}><CreditCard size={15}/> Billing</button><hr/><button className="danger" role="menuitem" onClick={() => { setOpen(false); flash("Delete account selected.") }}><Trash2 size={15}/> Delete account</button></div>}</div></Specimen></div></Section>
      <footer>Built as a starting point. Replace the palette and type tokens in <code>src/styles.css</code> to make it yours.</footer>
    </main>{notice && <div className="toast" role="status"><Bell size={17}/><span>{notice}</span><button onClick={() => setNotice("")}>Dismiss</button></div>}
    <ThemeCustomizer open={customizerOpen} config={config} previewMode={previewMode} onOpenChange={setCustomizerOpen} onConfigChange={setConfig} onPreviewModeChange={setPreviewMode} onReset={resetTheme} currentStyle={style} onStyleChange={selectStyle} />
    {comparisonOpen && <ComparisonWorkspace variants={variants} mode={previewMode} onEdit={editVariant} onDuplicate={copyVariant} onRemove={deleteVariant} onClose={() => setComparisonOpen(false)} />}
    {saveDialogOpen && <div className="save-preset-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSaveDialogOpen(false) }}><form className="save-preset-dialog" role="dialog" aria-modal="true" aria-labelledby="save-preset-title" onSubmit={saveCurrentVariant}><p className="eyebrow">Preset library</p><h2 id="save-preset-title">{activeVariantId ? "Update preset" : "Save this preset"}</h2><p>Give this direction a memorable name. Its colors, spacing, typography, and visual style will all be saved.</p><label htmlFor="preset-name">Preset name</label><input id="preset-name" autoFocus maxLength={60} value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="e.g. Calm SaaS" /><div className="save-preset-actions"><Button type="button" variant="ghost" onClick={() => setSaveDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={!presetName.trim()}><Save size={16}/>{activeVariantId ? "Update preset" : "Save preset"}</Button></div><span className="save-preset-capacity">{variants.length}/3 presets saved</span></form></div>}
  </div>
}
