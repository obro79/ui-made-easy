import { cloneElement, isValidElement, useId, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react"
import { cn } from "../../lib/utils"

export function Tooltip({ children, content, side = "top", delay = 250 }: { children: ReactElement; content: ReactNode; side?: "top" | "right" | "bottom" | "left"; delay?: number }) {
  const [open, setOpen] = useState(false), id = useId()
  let timer: ReturnType<typeof setTimeout> | undefined
  const show = () => { timer = setTimeout(() => setOpen(true), delay) }
  const hide = () => { if (timer) clearTimeout(timer); setOpen(false) }
  if (!isValidElement(children)) return null
  return <span className="ui-tooltip-root" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(event) => { if (event.key === "Escape") hide() }}>
    {cloneElement(children as ReactElement<HTMLAttributes<HTMLElement>>, { "aria-describedby": open ? id : undefined })}
    {open && <span id={id} role="tooltip" className={cn("ui-tooltip-content", `ui-tooltip-${side}`)}>{content}<span className="ui-tooltip-arrow" aria-hidden="true" /></span>}
  </span>
}
