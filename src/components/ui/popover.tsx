import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../../lib/utils"

type ContextValue = { open: boolean; setOpen: (open: boolean) => void; contentId: string; rootRef: React.RefObject<HTMLDivElement | null>; triggerRef: React.RefObject<HTMLButtonElement | null> }
const Context = createContext<ContextValue | null>(null)
function usePopover() { const value = useContext(Context); if (!value) throw new Error("Popover components must be used inside Popover"); return value }

export function Popover({ children, open: controlled, defaultOpen = false, onOpenChange }: { children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internal, setInternal] = useState(defaultOpen), contentId = useId(), rootRef = useRef<HTMLDivElement>(null), triggerRef = useRef<HTMLButtonElement>(null)
  const open = controlled ?? internal
  const onOpenChangeRef = useRef(onOpenChange)
  useEffect(() => { onOpenChangeRef.current = onOpenChange }, [onOpenChange])
  const setOpen = useCallback((next: boolean) => { if (controlled === undefined) setInternal(next); onOpenChangeRef.current?.(next) }, [controlled])
  useEffect(() => { if (!open) return; const dismiss = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }; const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus() } }; document.addEventListener("mousedown", dismiss); document.addEventListener("keydown", key); return () => { document.removeEventListener("mousedown", dismiss); document.removeEventListener("keydown", key) } }, [open, setOpen])
  return <Context.Provider value={{ open, setOpen, contentId, rootRef, triggerRef }}><div ref={rootRef} className="ui-popover-root">{children}</div></Context.Provider>
}
export function PopoverTrigger(props: ButtonHTMLAttributes<HTMLButtonElement>) { const { open, setOpen, contentId, triggerRef } = usePopover(); return <button ref={triggerRef} type="button" {...props} className={cn("ui-popover-trigger", props.className)} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? contentId : undefined} onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(!open) }} /> }
export function PopoverContent({ side = "bottom", ...props }: HTMLAttributes<HTMLDivElement> & { side?: "top" | "right" | "bottom" | "left" }) { const { open, contentId } = usePopover(); const ref = useRef<HTMLDivElement>(null); useEffect(() => { if (!open) return; const frame = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('input, button, [href], [tabindex]:not([tabindex="-1"])')?.focus()); return () => cancelAnimationFrame(frame) }, [open]); if (!open) return null; return <div ref={ref} id={contentId} role="dialog" aria-label={props["aria-label"] ?? "Popover"} tabIndex={-1} {...props} className={cn("ui-popover-content", `ui-popover-${side}`, props.className)} /> }
