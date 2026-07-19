import type { HTMLAttributes } from "react"

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  shape?: "text" | "rectangle" | "circle"
}

export function Skeleton({ shape = "rectangle", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={["ui-skeleton", `ui-skeleton-${shape}`, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-busy="true" aria-label="Loading content" className={["ui-skeleton-card", className].filter(Boolean).join(" ")} {...props}>
      <Skeleton className="ui-skeleton-card-media" />
      <div className="ui-skeleton-card-body">
        <Skeleton className="ui-skeleton-card-title" shape="text" />
        <Skeleton className="ui-skeleton-card-line" shape="text" />
        <Skeleton className="ui-skeleton-card-line-short" shape="text" />
      </div>
    </div>
  )
}

export type { SkeletonProps }
