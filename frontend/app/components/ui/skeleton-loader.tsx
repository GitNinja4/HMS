import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800", {
  variants: {
    variant: {
      card: "w-full h-64 space-y-4",
      table: "w-full h-96 space-y-2",
      list: "w-full space-y-3",
      line: "w-full h-4",
      circle: "rounded-full",
      text: "h-4 w-full",
    },
  },
  defaultVariants: {
    variant: "line",
  },
})

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "table" | "list" | "line" | "circle" | "text"
  count?: number
  width?: string
  height?: string
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  (
    { variant = "line", count = 1, width, height, className, ...props },
    ref
  ) => {
    // Card skeleton
    if (variant === "card") {
      return (
        <div
          ref={ref}
          className={cn(
            "w-full space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-card",
            className
          )}
          {...props}
        >
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-5/6 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-32 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      )
    }

    // Table skeleton
    if (variant === "table") {
      return (
        <div
          ref={ref}
          className={cn(
            "w-full space-y-2 rounded-lg border border-slate-200 dark:border-slate-800 p-4",
            className
          )}
          {...props}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-1/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
            </div>
          ))}
        </div>
      )
    }

    // List skeleton
    if (variant === "list") {
      return (
        <div ref={ref} className={cn("w-full space-y-3", className)} {...props}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Circle skeleton
    if (variant === "circle") {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse",
            width || "h-10 w-10",
            className
          )}
          {...props}
        />
      )
    }

    // Default line skeleton (text/single line)
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800",
          width || "w-full",
          height || "h-4",
          className
        )}
        {...props}
      />
    )
  }
)

SkeletonLoader.displayName = "SkeletonLoader"

export { SkeletonLoader, skeletonVariants }
export type { SkeletonLoaderProps }
