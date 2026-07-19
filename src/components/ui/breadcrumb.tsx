import { ChevronRight, MoreHorizontal } from "lucide-react"
import type { AnchorHTMLAttributes, HTMLAttributes, LiHTMLAttributes, ReactNode } from "react"

export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Breadcrumb" className={["ui-breadcrumb", className].filter(Boolean).join(" ")} {...props} />
}
export function BreadcrumbList({ className, ...props }: HTMLAttributes<HTMLOListElement>) {
  return <ol className={["ui-breadcrumb-list", className].filter(Boolean).join(" ")} {...props} />
}
export function BreadcrumbItem({ className, ...props }: LiHTMLAttributes<HTMLLIElement>) {
  return <li className={["ui-breadcrumb-item", className].filter(Boolean).join(" ")} {...props} />
}
export function BreadcrumbLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={["ui-breadcrumb-link", className].filter(Boolean).join(" ")} {...props} />
}
export function BreadcrumbPage({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-current="page" className={["ui-breadcrumb-page", className].filter(Boolean).join(" ")} {...props} />
}
export function BreadcrumbSeparator({ children, className, ...props }: LiHTMLAttributes<HTMLLIElement> & { children?: ReactNode }) {
  return <li role="presentation" aria-hidden="true" className={["ui-breadcrumb-separator", className].filter(Boolean).join(" ")} {...props}>{children ?? <ChevronRight size={14} />}</li>
}
export function BreadcrumbEllipsis({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span role="img" aria-label="More pages" className={["ui-breadcrumb-ellipsis", className].filter(Boolean).join(" ")} {...props}><MoreHorizontal size={16} aria-hidden="true" /></span>
}
