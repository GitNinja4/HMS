import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Inbox,
  Search,
  AlertTriangle,
  Zap,

} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center rounded-lg border border-dashed gap-4 py-12 px-4",
  {
    variants: {
      variant: {
        "no-data": "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800",
        "no-results":
          "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800",
        error: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
        "coming-soon":
          "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
      },
    },
    defaultVariants: {
      variant: "no-data",
    },
  }
)

interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ComponentType<any>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const emptyStateIcons: Record<string, React.ReactNode> = {
  "no-data": <Inbox className="size-12 text-slate-400" />,
  "no-results": <Search className="size-12 text-slate-400" />,
  error: <AlertTriangle className="size-12 text-red-400" />,
  "coming-soon": <Zap className="size-12 text-blue-400" />,
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      variant = "no-data",
      icon,
      title,
      description,
      action,
      className,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon ? <icon.render className="size-12" /> : emptyStateIcons[variant as string];

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-center justify-center">
          {displayIcon || emptyStateIcons[variant as string]}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }
export type { EmptyStateProps }
