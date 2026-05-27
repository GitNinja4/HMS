import React from "react"
import { AlertCircle, Heart, Activity, Pill, Clock } from "lucide-react"
import { MockMedicalHistoryEvent } from "@/lib/mockData"
import { cn } from "@/lib/utils"

interface MedicalHistoryTabProps {
  events: MockMedicalHistoryEvent[]
}

const getEventIcon = (type: string) => {
  switch (type) {
    case "allergy":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "condition":
      return <Heart className="h-5 w-5 text-blue-500" />
    case "surgery":
      return <Activity className="h-5 w-5 text-purple-500" />
    case "medication":
      return <Pill className="h-5 w-5 text-green-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "severe":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
    case "moderate":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
    case "mild":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  }
}

export const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({
  events,
}) => {
  // Group events by type for better organization
  const groupedEvents = events.reduce(
    (acc, event) => {
      if (!acc[event.type]) acc[event.type] = []
      acc[event.type].push(event)
      return acc
    },
    {} as Record<string, MockMedicalHistoryEvent[]>
  )

  const eventTypeLabels: Record<string, string> = {
    allergy: "Allergies",
    condition: "Chronic Conditions",
    surgery: "Surgeries",
    medication: "Medications",
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No medical history records found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([type, typeEvents]) => (
        <div key={type}>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            {getEventIcon(type)}
            {eventTypeLabels[type]}
          </h3>
          <div className="space-y-3 ml-6 border-l-2 border-slate-200 dark:border-slate-800 pl-4">
            {typeEvents.map((event, idx) => (
              <div key={idx} className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  </div>
                  {event.severity && (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                        getSeverityColor(event.severity)
                      )}
                    >
                      {event.severity.charAt(0).toUpperCase() +
                        event.severity.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
