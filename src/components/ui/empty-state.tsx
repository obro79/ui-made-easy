import type { HTMLAttributes, ReactNode } from "react"
import { Inbox } from "lucide-react"

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <section className={["ui-empty", className].filter(Boolean).join(" ")} {...props}>
      <div aria-hidden="true" className="ui-empty-icon">{icon ?? <Inbox size={24} />}</div>
      <h3 className="ui-empty-title">{title}</h3>
      {description && <p className="ui-empty-description">{description}</p>}
      {action && <div className="ui-empty-action">{action}</div>}
    </section>
  )
}

export type { EmptyStateProps }
