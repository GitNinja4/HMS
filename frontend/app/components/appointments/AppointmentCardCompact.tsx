import React from "react"
import { MockAppointment } from "@/lib/mockData"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Clock,
  MapPin,
  Stethoscope,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentCardCompactProps {
  appointment: MockAppointment
  onClick?: () => void
  className?: string
  variant?: "horizontal" | "vertical"
}

const statusVariantMap: Record<MockAppointment["status"], any> = {
  confirmed: "confirmed",
  pending: "pending",
  cancelled: "cancelled",
  completed: "completed",
  emergency: "warning",
}

const appointmentTypeColors: Record<MockAppointment["type"], string> = {
  consultation: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  "follow-up": "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
  emergency: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  surgery: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900",
  procedure: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
}

export const AppointmentCardCompact: React.FC<AppointmentCardCompactProps> = ({
  appointment,
  onClick,
  className,
  variant = "horizontal",
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const timeDisplay = `${appointment.startTime} - ${appointment.endTime}`

  if (variant === "vertical") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md overflow-hidden",
          appointmentTypeColors[appointment.type],
          className
        )}
        onClick={onClick}
      >
        <div className="p-3">
          {/* Header with Time */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5" />
              {timeDisplay}
            </div>
            <StatusBadge
              variant={statusVariantMap[appointment.status]}
              size="sm"
              showIcon
            >
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </StatusBadge>
          </div>

          {/* Patient & Doctor */}
          <div className="space-y-1.5 mb-2">
            <p className="text-xs font-medium text-foreground truncate">
              {appointment.patientName}
            </p>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {appointment.doctorName}
              </p>
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {appointment.reason}
          </p>
        </div>
      </Card>
    )
  }

  // Horizontal variant
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "border-l-4",
        appointment.status === "emergency"
          ? "border-l-red-500"
          : appointment.status === "cancelled"
            ? "border-l-gray-400"
            : appointment.status === "completed"
              ? "border-l-green-500"
              : appointment.status === "pending"
                ? "border-l-yellow-500"
                : "border-l-blue-500",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 flex items-start justify-between gap-4">
        {/* Left Section - Time & Patient */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 text-right w-14">
            <p className="text-sm font-bold text-foreground">
              {appointment.startTime}
            </p>
            <p className="text-xs text-muted-foreground">
              {appointment.endTime}
            </p>
          </div>

          <div className="flex-1 min-w-0 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-sm font-semibold text-foreground truncate">
                  {appointment.patientName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointment.doctorName}
                </p>
              </div>
              <StatusBadge
                variant={statusVariantMap[appointment.status]}
                size="sm"
                showIcon
              >
                {appointment.status === "emergency"
                  ? "!"
                  : appointment.status.charAt(0).toUpperCase()}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                {appointment.type}
              </span>
              {appointment.room && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>{appointment.room}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {appointment.notes && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="View notes"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}
