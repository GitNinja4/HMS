import React from "react"
import { MockDoctor } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { Clock, MapPin, BookOpen, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorAvailabilityProps {
  doctors: MockDoctor[]
  isLoading?: boolean
  onBookAppointment?: (doctorId: string) => void
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({
  doctors,
  isLoading = false,
  onBookAppointment,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <SkeletonLoader variant="card" />
          </div>
        ))}
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getAvailabilityBadge = (slots: number, isAvailable: boolean) => {
    if (!isAvailable) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-3 w-3 mr-1" />
          Unavailable
        </Badge>
      )
    }

    if (slots === 0) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
          Fully Booked
        </Badge>
      )
    }

    if (slots <= 2) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
          {slots} Slot{slots !== 1 ? "s" : ""}
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {slots} Slots
      </Badge>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Doctor Availability</h3>
        <p className="text-sm text-muted-foreground">
          Schedule appointments with available doctors
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex-1 flex flex-col">
              {/* Doctor Info Header */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {doctor.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {doctor.specialty}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {doctor.department}
                  </span>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mb-4">
                {getAvailabilityBadge(doctor.availableSlots, doctor.isAvailable)}
              </div>

              {/* Next Available */}
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Next Available</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(doctor.nextAvailable).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <Button
                onClick={() => onBookAppointment?.(doctor.id)}
                disabled={!doctor.isAvailable || doctor.availableSlots === 0}
                className="w-full mt-auto gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-muted-foreground">No doctors available</p>
        </div>
      )}
    </div>
  )
}
