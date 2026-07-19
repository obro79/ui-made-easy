import { useId, useState, type HTMLAttributes, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

type AccordionItem = {
  id: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  items: AccordionItem[]
  defaultOpen?: string[]
  multiple?: boolean
  onChange?: (openItems: string[]) => void
}

export function Accordion({ items, defaultOpen = [], multiple = false, onChange, className, ...props }: AccordionProps) {
  const instanceId = useId()
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

  const toggle = (id: string) => {
    const next = openItems.includes(id)
      ? openItems.filter((item) => item !== id)
      : multiple
        ? [...openItems, id]
        : [id]
    setOpenItems(next)
    onChange?.(next)
  }

  return (
    <div className={["ui-accordion", className].filter(Boolean).join(" ")} {...props}>
      {items.map((item) => {
        const open = openItems.includes(item.id)
        const triggerId = `${instanceId}-${item.id}-trigger`
        const panelId = `${instanceId}-${item.id}-panel`
        return (
          <div className="ui-accordion-item" key={item.id} data-state={open ? "open" : "closed"}>
            <h3 className="ui-accordion-heading">
              <button
                aria-controls={panelId}
                aria-expanded={open}
                className="ui-accordion-trigger"
                disabled={item.disabled}
                id={triggerId}
                onClick={() => toggle(item.id)}
                type="button"
              >
                <span className="ui-accordion-title">{item.title}</span>
                <ChevronDown aria-hidden="true" className="ui-accordion-icon" size={18} />
              </button>
            </h3>
            <div
              aria-labelledby={triggerId}
              className="ui-accordion-panel"
              hidden={!open}
              id={panelId}
              role="region"
            >
              <div className="ui-accordion-content">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { AccordionItem, AccordionProps }
