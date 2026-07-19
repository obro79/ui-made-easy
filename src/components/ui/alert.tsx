import type { HTMLAttributes, ReactNode } from "react"
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react"

type AlertVariant = "info" | "success" | "warning" | "destructive"

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

const icons: Record<AlertVariant, ReactNode> = {
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
  warning: <TriangleAlert size={20} />,
  destructive: <AlertCircle size={20} />,
}

export function Alert({ variant = "info", title, description, action, icon, className, ...props }: AlertProps) {
  return (
    <div
      className={["ui-alert", `ui-alert-${variant}`, className].filter(Boolean).join(" ")}
      role={variant === "destructive" ? "alert" : "status"}
      {...props}
    >
      <div aria-hidden="true" className="ui-alert-icon">{icon ?? icons[variant]}</div>
      <div className="ui-alert-content">
        <h3 className="ui-alert-title">{title}</h3>
        {description && <div className="ui-alert-description">{description}</div>}
      </div>
      {action && <div className="ui-alert-action">{action}</div>}
    </div>
  )
}

export type { AlertProps, AlertVariant }
