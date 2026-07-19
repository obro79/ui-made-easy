import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react"

export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav role="navigation" aria-label="Pagination" className={["ui-pagination", className].filter(Boolean).join(" ")} {...props} />
}
export function PaginationContent({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={["ui-pagination-content", className].filter(Boolean).join(" ")} {...props} />
}
export function PaginationItem({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={["ui-pagination-item", className].filter(Boolean).join(" ")} {...props} />
}
export type PaginationLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }
export function PaginationLink({ isActive, className, ...props }: PaginationLinkProps) {
  return <a aria-current={isActive ? "page" : undefined} className={["ui-pagination-link", isActive && "ui-pagination-link-active", className].filter(Boolean).join(" ")} {...props} />
}
function DirectionLink({ direction, children, className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { direction: "previous" | "next"; children?: ReactNode }) {
  const previous = direction === "previous"
  return <PaginationLink aria-label={`Go to ${direction} page`} className={[`ui-pagination-${direction}`, className].filter(Boolean).join(" ")} {...props}>{previous && <ChevronLeft size={16} aria-hidden="true" />}{children ?? (previous ? "Previous" : "Next")}{!previous && <ChevronRight size={16} aria-hidden="true" />}</PaginationLink>
}
export function PaginationPrevious(props: Omit<Parameters<typeof DirectionLink>[0], "direction">) { return <DirectionLink direction="previous" {...props} /> }
export function PaginationNext(props: Omit<Parameters<typeof DirectionLink>[0], "direction">) { return <DirectionLink direction="next" {...props} /> }
export function PaginationEllipsis({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span role="img" aria-label="More pages" className={["ui-pagination-ellipsis", className].filter(Boolean).join(" ")} {...props}><MoreHorizontal size={16} aria-hidden="true" /></span>
}
