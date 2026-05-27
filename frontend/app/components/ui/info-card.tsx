import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const infoCardVariants = cva(
  "flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-slate-900/50",
        primary:
          "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
        secondary:
          "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900",
        success:
          "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
        warning:
          "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
        danger:
          "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface InfoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoCardVariants> {
  icon?: React.ComponentType<any> | React.ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
}

const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(
  (
    { variant = "default", icon: Icon, label, value, trend, className, ...props },
    ref
  ) => {
    const variantColorMap: Record<string, string> = {
      default: "text-slate-600 dark:text-slate-400",
      primary: "text-blue-600 dark:text-blue-400",
      secondary: "text-purple-600 dark:text-purple-400",
      success: "text-green-600 dark:text-green-400",
      warning: "text-amber-600 dark:text-amber-400",
      danger: "text-red-600 dark:text-red-400",
    }

    return (
      <div
        ref={ref}
        className={cn(infoCardVariants({ variant }), className)}
        {...props}
      >
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn("flex-shrink-0", variantColorMap[variant as string])}>
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === "function" ? (
              <Icon className="size-10" />
            ) : (
              Icon
            )}
          </div>
        )}
      </div>
    )
  }
)

InfoCard.displayName = "InfoCard"

export { InfoCard, infoCardVariants }
export type { InfoCardProps }
