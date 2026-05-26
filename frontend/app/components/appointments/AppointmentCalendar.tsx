import React from "react"
import { MockAppointment, getAppointmentsByDate } from "@/app/lib/mockData"
import { Card } from "@/app/components/ui/card"
import { SkeletonLoader } from "@/app/components/ui/skeleton-loader"
import { AppointmentCardCompact } from "@/app/components/appointments/AppointmentCardCompact"
import { EmptyState } from "@/app/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface AppointmentCalendarProps {
  appointments: MockAppointment[]
  weekStartDate: Date
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  onAppointmentClick?: (appointment: MockAppointment) => void
  isLoading?: boolean
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const START_HOUR = 9
const END_HOUR = 17 // 5 PM
const SLOT_MINUTES = 30

const generateTimeSlots = () => {
  const slots = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minutes = 0; minutes < 60; minutes += SLOT_MINUTES) {
      const time = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      slots.push(time)
    }
  }
  return slots
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  weekStartDate,
  onPreviousWeek,
  onNextWeek,
  onAppointmentClick,
  isLoading = false,
}) => {
  const timeSlots = generateTimeSlots()

  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStartDate)
    date.setDate(date.getDate() + i)
    return date
  })

  // Helper to format date
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  // Helper to find appointments for a specific slot
  const getAppointmentsForSlot = (
    dateStr: string,
    time: string
  ): MockAppointment[] => {
    return getAppointmentsByDate(dateStr).filter(
      (apt) =>
        apt.startTime >= time &&
        apt.startTime < timeSlots[timeSlots.indexOf(time) + 1 || timeSlots.length - 1]
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader variant="table" count={5} />
      </div>
    )
  }

  const hasAppointments = appointments.length > 0

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      {hasAppointments ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="inline-block min-w-full">
            {/* Header - Days of Week */}
            <div className="grid bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
              <div className="w-24 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 text-xs font-semibold text-muted-foreground">
                Time
              </div>
              <div className="grid grid-cols-7 w-full">
                {weekDates.map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-r border-slate-200 dark:border-slate-800 p-3 text-center text-xs font-semibold",
                      date.getDay() === 0 || date.getDay() === 6
                        ? "bg-slate-100 dark:bg-slate-800"
                        : ""
                    )}
                  >
                    <p>{DAYS_OF_WEEK[i]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="grid">
              {timeSlots.map((time, slotIdx) => (
                <div key={time} className="flex border-b border-slate-200 dark:border-slate-800">
                  {/* Time Label */}
                  <div className="w-24 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 text-xs font-medium text-muted-foreground bg-slate-50 dark:bg-slate-900/50 sticky left-0 z-10">
                    {time}
                  </div>

                  {/* Day Slots */}
                  <div className="grid grid-cols-7 w-full">
                    {weekDates.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split("T")[0]
                      const dayApts = getAppointmentsForSlot(dateStr, time)

                      return (
                        <div
                          key={`${dayIdx}-${slotIdx}`}
                          className={cn(
                            "border-r border-slate-200 dark:border-slate-800 p-2 min-h-20 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors",
                            date.getDay() === 0 || date.getDay() === 6
                              ? "bg-slate-50/50 dark:bg-slate-900/20"
                              : ""
                          )}
                        >
                          {dayApts.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => onAppointmentClick?.(apt)}
                              className="cursor-pointer mb-1"
                            >
                              <div
                                className={cn(
                                  "text-xs p-1.5 rounded border truncate cursor-pointer hover:shadow-md transition-shadow",
                                  apt.status === "emergency"
                                    ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400 font-semibold"
                                    : apt.status === "cancelled"
                                      ? "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 line-through"
                                      : apt.status === "completed"
                                        ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-950/40 dark:border-green-900 dark:text-green-400"
                                        : apt.status === "pending"
                                          ? "bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-950/40 dark:border-yellow-900 dark:text-yellow-400"
                                          : "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400"
                                )}
                              >
                                <p className="font-semibold truncate">
                                  {apt.patientName.split(" ")[0]}
                                </p>
                                <p className="truncate text-xs opacity-75">
                                  {apt.doctorName.split(" ").pop()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          variant="no-data"
          title="No appointments scheduled"
          description="No appointments found for this week"
        />
      )}

      {/* Week Summary */}
      {hasAppointments && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">
              {appointments.length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Confirmed</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {appointments.filter((a) => a.status === "confirmed").length}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">Emergency</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {appointments.filter((a) => a.status === "emergency").length}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {appointments.filter((a) => a.status === "pending").length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
