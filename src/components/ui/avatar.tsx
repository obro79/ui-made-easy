import { useState, type HTMLAttributes, type ImgHTMLAttributes } from "react"

export function Avatar({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={["ui-avatar", className].filter(Boolean).join(" ")} {...props} />
}
export type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement> & { onLoadingStatusChange?: (loaded: boolean) => void }
export function AvatarImage({ className, alt = "", onLoad, onError, onLoadingStatusChange, ...props }: AvatarImageProps) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <img className={["ui-avatar-image", className].filter(Boolean).join(" ")} alt={alt} onLoad={(event) => { onLoadingStatusChange?.(true); onLoad?.(event) }} onError={(event) => { setFailed(true); onLoadingStatusChange?.(false); onError?.(event) }} {...props} />
}
export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={["ui-avatar-fallback", className].filter(Boolean).join(" ")} {...props} />
}
