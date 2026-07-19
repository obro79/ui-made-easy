import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { X } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  titleId: string
  descriptionId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialog() {
  const value = useContext(DialogContext)
  if (!value) throw new Error("Dialog components must be used inside Dialog")
  return value
}

export function Dialog({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const titleId = useId()
  const descriptionId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const onOpenChangeRef = useRef(onOpenChange)
  useEffect(() => { onOpenChangeRef.current = onOpenChange }, [onOpenChange])
  const setOpen = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next)
    onOpenChangeRef.current?.(next)
  }, [controlledOpen])
  return <DialogContext.Provider value={{ open, setOpen, titleId, descriptionId, triggerRef }}><div className="ui-dialog-root">{children}</div></DialogContext.Provider>
}

export function DialogTrigger({ className, onClick, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDialog()
  return <button {...props} ref={triggerRef} type={type} className={cn("ui-dialog-trigger", className)} aria-haspopup="dialog" aria-expanded={open} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(true) }} />
}

export function DialogContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen, titleId, descriptionId, triggerRef } = useDialog()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const frame = requestAnimationFrame(() => {
      const focusable = contentRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ;(focusable ?? contentRef.current)?.focus()
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false) }
      if (event.key !== "Tab" || !contentRef.current) return
      const items = [...contentRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((item) => !item.hasAttribute("disabled"))
      if (!items.length) { event.preventDefault(); contentRef.current.focus(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      ;(triggerRef.current ?? previous)?.focus()
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null
  return createPortal(<div className="ui-dialog-layer">
    <div className="ui-dialog-overlay" aria-hidden="true" onMouseDown={() => setOpen(false)} />
    <div ref={contentRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} className={cn("ui-dialog-content", className)} {...props}>
      {children}
      <button type="button" className="ui-dialog-close" aria-label="Close dialog" onClick={() => setOpen(false)}><X aria-hidden="true" size={16} /></button>
    </div>
  </div>, triggerRef.current?.closest(".app.theme-scope") ?? document.body)
}

export function DialogHeader(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn("ui-dialog-header", props.className)} /> }
export function DialogFooter(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn("ui-dialog-footer", props.className)} /> }
export function DialogTitle(props: HTMLAttributes<HTMLHeadingElement>) { const { titleId } = useDialog(); return <h2 id={titleId} {...props} className={cn("ui-dialog-title", props.className)} /> }
export function DialogDescription(props: HTMLAttributes<HTMLParagraphElement>) { const { descriptionId } = useDialog(); return <p id={descriptionId} {...props} className={cn("ui-dialog-description", props.className)} /> }
export function DialogClose(props: ButtonHTMLAttributes<HTMLButtonElement>) { const { setOpen } = useDialog(); return <button type="button" {...props} className={cn("ui-dialog-close-action", props.className)} onClick={(event) => { props.onClick?.(event); if (!event.defaultPrevented) setOpen(false) }} /> }
