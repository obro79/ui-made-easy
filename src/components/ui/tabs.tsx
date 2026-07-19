import { createContext, useContext, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react"

type TabsContextValue = { value: string; setValue: (value: string) => void; baseId: string }
const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) throw new Error("Tabs components must be used within Tabs")
  return context
}

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function Tabs({ value, defaultValue = "", onValueChange, className, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const baseId = useId()
  const activeValue = value ?? internalValue
  const setValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }
  return <TabsContext.Provider value={{ value: activeValue, setValue, baseId }}><div className={["ui-tabs", className].filter(Boolean).join(" ")} {...props}>{children}</div></TabsContext.Provider>
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={["ui-tabs-list", className].filter(Boolean).join(" ")} {...props} />
}

export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
export function TabsTrigger({ value, className, onClick, ...props }: TabsTriggerProps) {
  const tabs = useTabs()
  const selected = tabs.value === value
  return <button type="button" role="tab" id={`${tabs.baseId}-tab-${value}`} aria-selected={selected} aria-controls={`${tabs.baseId}-panel-${value}`} tabIndex={selected ? 0 : -1} className={["ui-tabs-trigger", className].filter(Boolean).join(" ")} onClick={(event) => { tabs.setValue(value); onClick?.(event) }} {...props} />
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & { value: string; forceMount?: boolean }
export function TabsContent({ value, forceMount = false, className, ...props }: TabsContentProps) {
  const tabs = useTabs()
  const active = tabs.value === value
  if (!active && !forceMount) return null
  return <div role="tabpanel" id={`${tabs.baseId}-panel-${value}`} aria-labelledby={`${tabs.baseId}-tab-${value}`} hidden={!active} tabIndex={0} className={["ui-tabs-content", className].filter(Boolean).join(" ")} {...props} />
}
