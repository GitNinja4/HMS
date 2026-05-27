import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ComponentType<any>
  action?: {
    label: string
    onClick: () => void
  }
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, icon: Icon, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-4", className)}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          {Icon && (
            <Icon className="size-5 mt-1 text-primary flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="flex items-center gap-1 whitespace-nowrap"
          >
            {action.label}
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    )
  }
)

SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
export type { SectionHeaderProps }
