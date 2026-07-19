import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react"
import { cn } from "../../lib/utils"

export function Tooltip({ children, content, side = "top", delay = 250 }: { children: ReactElement; content: ReactNode; side?: "top" | "right" | "bottom" | "left"; delay?: number }) {
  const [open, setOpen] = useState(false), id = useId()
  const timerRef = useRef<number | null>(null)
  const show = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => { timerRef.current = null; setOpen(true) }, delay)
  }
  const hide = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    setOpen(false)
  }
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])
  if (!isValidElement(children)) return null
  return <span className="ui-tooltip-root" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(event) => { if (event.key === "Escape") hide() }}>
    {cloneElement(children as ReactElement<HTMLAttributes<HTMLElement>>, { "aria-describedby": open ? id : undefined })}
    {open && <span id={id} role="tooltip" className={cn("ui-tooltip-content", `ui-tooltip-${side}`)}>{content}<span className="ui-tooltip-arrow" aria-hidden="true" /></span>}
  </span>
}
