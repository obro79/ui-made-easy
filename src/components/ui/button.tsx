import type { ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"; size?: "sm" | "default" | "lg" }
export function Button({ className, variant = "default", size = "default", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("button", `button-${variant}`, `button-size-${size}`, className)} {...props} />
}
