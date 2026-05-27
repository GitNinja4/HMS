import * as React from "react"
import {
  Search,
  X,
  Filter,
  ChevronDown,

} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<any>
}

interface TableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: {
    label: string
    options: FilterOption[]
    selectedValue?: string
    onFilterChange?: (value: string) => void
  }[]
  activeFiltersCount?: number
  onClearFilters?: () => void
}

const TableToolbar = React.forwardRef<HTMLDivElement, TableToolbarProps>(
  (
    {
      searchPlaceholder = "Search...",
      searchValue = "",
      onSearchChange,
      filters = [],
      activeFiltersCount = 0,
      onClearFilters,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-slate-200 bg-card p-4 dark:border-slate-800",
          className
        )}
        {...props}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns and Clear Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter, index) => (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Filter className="size-3.5" />
                    {filter.label}
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filter.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => filter.onFilterChange?.(option.value)}
                      className="flex items-center gap-2"
                    >
                      {option.icon && <option.icon className="size-4" />}
                      <span>{option.label}</span>
                      {filter.selectedValue === option.value && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear ({activeFiltersCount})
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }
)

TableToolbar.displayName = "TableToolbar"

export { TableToolbar }
export type { TableToolbarProps, FilterOption }
