import type { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"
export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <section className={cn("card", className)} {...props} />
export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("card-header", className)} {...props} />
export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("card-title", className)} {...props} />
export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn("card-description", className)} {...props} />
export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("card-content", className)} {...props} />
export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("card-footer", className)} {...props} />
