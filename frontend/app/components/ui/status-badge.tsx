import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Heart,
  Activity,
  TrendingUp,
  Shield,
} from "lucide-react"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex h-6 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        // Medical/Patient statuses
        admitted:
          "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
        discharged:
          "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
        in_treatment:
          "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
        observation:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
        follow_up:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",

        // Appointment statuses
        confirmed:
          "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
        pending:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
        cancelled:
          "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        rescheduled:
          "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
        completed:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",

        // Lab/Prescription statuses
        analyzed:
          "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400",
        reviewed:
          "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
        pending_review:
          "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        abnormal:
          "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        normal:
          "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",

        // Prescription statuses
        active:
          "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
        refilling:
          "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",

        // General
        warning:
          "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
      },
      size: {
        sm: "h-5 text-xs px-2.5",
        md: "h-6 text-xs px-3",
        lg: "h-7 text-sm px-4",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "md",
    },
  }
)

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean
  icon?: React.ReactNode
}

const statusIcons: Record<string, React.ReactNode> = {
  admitted: <Heart className="size-3.5" />,
  discharged: <CheckCircle2 className="size-3.5" />,
  in_treatment: <Activity className="size-3.5" />,
  observation: <Clock className="size-3.5" />,
  follow_up: <TrendingUp className="size-3.5" />,

  confirmed: <CheckCircle2 className="size-3.5" />,
  pending: <Clock className="size-3.5" />,
  cancelled: <XCircle className="size-3.5" />,
  rescheduled: <Clock className="size-3.5" />,
  completed: <CheckCircle2 className="size-3.5" />,

  analyzed: <CheckCircle2 className="size-3.5" />,
  reviewed: <Shield className="size-3.5" />,
  pending_review: <Loader2 className="size-3.5 animate-spin" />,
  abnormal: <AlertCircle className="size-3.5" />,
  normal: <CheckCircle2 className="size-3.5" />,

  active: <CheckCircle2 className="size-3.5" />,
  refilling: <Loader2 className="size-3.5 animate-spin" />,

  warning: <AlertCircle className="size-3.5" />,
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      variant = "pending",
      size = "md",
      className,
      showIcon = true,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon || statusIcons[variant as string]

    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {showIcon && displayIcon}
        <span>{children}</span>
      </span>
    )
  }
)

StatusBadge.displayName = "StatusBadge"

export { StatusBadge, statusBadgeVariants }
export type { StatusBadgeProps }
