import type { HTMLAttributes } from "react"

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number
  max?: number
  label: string
  showValue?: boolean
}

export function Progress({ value, max = 100, label, showValue = false, className, ...props }: ProgressProps) {
  const safeMax = Math.max(1, max)
  const safeValue = value == null ? undefined : Math.min(Math.max(value, 0), safeMax)
  const percent = safeValue == null ? undefined : Math.round((safeValue / safeMax) * 100)

  return (
    <div className={["ui-progress", className].filter(Boolean).join(" ")} {...props}>
      <div className="ui-progress-header">
        <span className="ui-progress-label">{label}</span>
        {showValue && percent != null && <span className="ui-progress-value">{percent}%</span>}
      </div>
      <div
        aria-label={label}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="ui-progress-track"
        role="progressbar"
      >
        <span
          className="ui-progress-indicator"
          data-indeterminate={safeValue == null ? "true" : undefined}
          style={safeValue == null ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export type { ProgressProps }
