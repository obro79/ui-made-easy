import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

type ContextValue = { open: boolean; setOpen: (open: boolean) => void; titleId: string; descriptionId: string; triggerRef: React.RefObject<HTMLButtonElement | null> }
const Context = createContext<ContextValue | null>(null)
function useAlertDialog() { const value = useContext(Context); if (!value) throw new Error("AlertDialog components must be used inside AlertDialog"); return value }

export function AlertDialog({ children, open: controlled, defaultOpen = false, onOpenChange }: { children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internal, setInternal] = useState(defaultOpen)
  const titleId = useId(), descriptionId = useId(), triggerRef = useRef<HTMLButtonElement>(null)
  const open = controlled ?? internal
  const onOpenChangeRef = useRef(onOpenChange)
  useEffect(() => { onOpenChangeRef.current = onOpenChange }, [onOpenChange])
  const setOpen = useCallback((next: boolean) => { if (controlled === undefined) setInternal(next); onOpenChangeRef.current?.(next) }, [controlled])
  return <Context.Provider value={{ open, setOpen, titleId, descriptionId, triggerRef }}><div className="ui-alert-dialog-root">{children}</div></Context.Provider>
}
export function AlertDialogTrigger(props: ButtonHTMLAttributes<HTMLButtonElement>) { const { open, setOpen, triggerRef } = useAlertDialog(); return <button ref={triggerRef} type="button" {...props} className={cn("ui-alert-dialog-trigger", props.className)} aria-haspopup="dialog" aria-expanded={open} onClick={(event) => { props.onClick?.(event); if (!event.defaultPrevented) setOpen(true) }} /> }
export function AlertDialogContent({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen, titleId, descriptionId, triggerRef } = useAlertDialog(); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (!open) return; const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; const frame = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("[data-alert-cancel], button")?.focus()); const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); if (event.key !== "Tab" || !ref.current) return; const items = [...ref.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter((item) => !item.hasAttribute("disabled")); if (!items.length) { event.preventDefault(); ref.current.focus(); return } const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() } }; document.addEventListener("keydown", key); return () => { cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", key); triggerRef.current?.focus() } }, [open, setOpen, triggerRef])
  if (!open) return null
  return createPortal(<div className="ui-alert-dialog-layer"><div className="ui-alert-dialog-overlay" aria-hidden="true" /><div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} {...props} className={cn("ui-alert-dialog-content", props.className)}>{children}</div></div>, triggerRef.current?.closest(".app.theme-scope") ?? document.body)
}
export function AlertDialogHeader(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn("ui-alert-dialog-header", props.className)} /> }
export function AlertDialogFooter(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn("ui-alert-dialog-footer", props.className)} /> }
export function AlertDialogTitle(props: HTMLAttributes<HTMLHeadingElement>) { const { titleId } = useAlertDialog(); return <h2 id={titleId} {...props} className={cn("ui-alert-dialog-title", props.className)} /> }
export function AlertDialogDescription(props: HTMLAttributes<HTMLParagraphElement>) { const { descriptionId } = useAlertDialog(); return <p id={descriptionId} {...props} className={cn("ui-alert-dialog-description", props.className)} /> }
export function AlertDialogCancel(props: ButtonHTMLAttributes<HTMLButtonElement>) { const { setOpen } = useAlertDialog(); return <button data-alert-cancel type="button" {...props} className={cn("ui-alert-dialog-cancel", props.className)} onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(false) }} /> }
export function AlertDialogAction(props: ButtonHTMLAttributes<HTMLButtonElement>) { const { setOpen } = useAlertDialog(); return <button type="button" {...props} className={cn("ui-alert-dialog-action", props.className)} onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(false) }} /> }
