import { Check, Dna, ShieldCheck, Sparkles } from "lucide-react"
import type { StylePresetDefinition } from "../style-dna"
import "../style-dna-panel.css"

export function StyleDnaPanel({ preset }: { preset: StylePresetDefinition }) {
  return (
    <details className="style-dna-panel">
      <summary>
        <span className="style-dna-icon"><Dna size={18} aria-hidden="true" /></span>
        <span><strong>Style DNA</strong><small>{preset.name} · {preset.category.replaceAll("-", " ")}</small></span>
        <span className="style-dna-summary">Why this style looks authentic</span>
      </summary>
      <div className="style-dna-content">
        <div><p className="eyebrow">Reference basis</p><h3>{preset.description}</h3><ul>{preset.authenticity.basis.map((item) => <li key={item}><Sparkles size={14}/>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Signature traits</p><ul>{preset.authenticity.signatures.map((item) => <li key={item}><Check size={14}/>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Guardrails</p><ul>{preset.authenticity.mustAvoid.map((item) => <li key={item}><ShieldCheck size={14}/>{item}</li>)}</ul><p className="style-dna-a11y">{preset.authenticity.a11y}</p></div>
      </div>
    </details>
  )
}
