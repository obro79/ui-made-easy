import { useId, useMemo, useState, type CSSProperties } from "react"
import { Check, Search, X } from "lucide-react"
import { createThemeFromPreset, themeVariables, type ThemeMode } from "../theme"
import { STYLE_PRESETS, getStylePreset, searchStylePresets } from "../presets"
import { STYLE_CATEGORY_LABELS, type StyleCategory } from "../style-dna"
import "../style-selector.css"

export type StyleSelectorProps = {
  value: string
  onChange: (style: string) => void
  mode?: ThemeMode
  label?: string
  className?: string
}

function variablesFor(style: string, mode: ThemeMode): CSSProperties {
  const variables = themeVariables(createThemeFromPreset(style), mode)
  return Object.fromEntries(Object.entries(variables).map(([key, value]) => [`--${key}`, value])) as CSSProperties
}

function StylePreview() {
  return (
    <div className="style-selector-preview" aria-hidden="true">
      <div className="style-selector-preview__bar"><span /><span /><span /></div>
      <div className="style-selector-preview__body">
        <div className="style-selector-preview__heading" />
        <div className="style-selector-preview__copy" />
        <div className="style-selector-preview__row">
          <span className="style-selector-preview__button" />
          <span className="style-selector-preview__ghost" />
        </div>
        <div className="style-selector-preview__cards"><span /><span /></div>
      </div>
    </div>
  )
}

export function StyleSelector({
  value,
  onChange,
  mode = "light",
  label = "Choose a visual style",
  className = "",
}: StyleSelectorProps) {
  const labelId = useId()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<StyleCategory | undefined>()
  const filteredStyles = useMemo(() => searchStylePresets(query, category), [query, category])
  const current = getStylePreset(value)

  return (
    <section className={`style-selector ${className}`.trim()} aria-labelledby={labelId}>
      <div className="style-selector__heading">
        <div>
          <h3 id={labelId}>{label}</h3>
          <p>{STYLE_PRESETS.length} authentic directions</p>
        </div>
        <span className="style-selector__current" aria-live="polite">{current?.name ?? value}</span>
      </div>

      <div className="style-selector__categories" aria-label="Filter style categories">
        <button type="button" aria-pressed={!category} onClick={() => setCategory(undefined)}>All</button>
        {(Object.entries(STYLE_CATEGORY_LABELS) as [StyleCategory,string][]).map(([id,name]) => <button type="button" key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{name}</button>)}
      </div>

      <div className="style-selector__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search styles…"
          aria-label="Search visual styles"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear style search">
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {filteredStyles.length ? (
        <div className="style-selector__grid" role="listbox" aria-label={label}>
          {filteredStyles.map((style) => {
            const selected = style.id === value
            return (
              <button
                key={style.id}
                type="button"
                role="option"
                aria-selected={selected}
                className="style-selector-card"
                data-selected={selected || undefined}
                data-style-id={style.id}
                data-layout={style.recipe.layout}
                data-surface={style.recipe.surface}
                data-treatment={style.recipe.typography}
                data-geometry={style.recipe.geometry}
                data-decoration={style.recipe.decoration}
                style={variablesFor(style.id, mode)}
                onClick={() => onChange(style.id)}
              >
                <StylePreview />
                <span className="style-selector-card__meta">
                  <span>
                    <strong>{style.name}</strong>
                    <small>{style.description}</small>
                  </span>
                  <span className="style-selector-card__check" aria-hidden="true">
                    {selected && <Check size={13} />}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="style-selector__empty" role="status">
          <strong>No matching styles</strong>
          <span>Try a broader search.</span>
        </div>
      )}
    </section>
  )
}
