import React from "react"
import { User } from "@/app/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { StatusBadge } from "@/app/components/ui/status-badge"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { ChevronRight, Heart, Droplet, User as UserIcon, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatientCardProps {
  patient: User
  onClick?: () => void
  className?: string
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  className,
}) => {
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const statusVariantMap: Record<string, any> = {
    admitted: "admitted",
    in_treatment: "in_treatment",
    observation: "observation",
    discharged: "discharged",
    follow_up: "follow_up",
    deceased: "warning",
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-32",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={patient.image} alt={patient.name} />
              <AvatarFallback>{getAvatarInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {patient.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {patient.age} yo • {patient.gender}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Status and Info Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusBadge
            variant={statusVariantMap[patient.status] || "pending"}
            size="sm"
            showIcon
          >
            {patient.status?.replace(/_/g, " ").charAt(0).toUpperCase() +
              patient.status?.replace(/_/g, " ").slice(1)}
          </StatusBadge>

          <div className="flex items-center gap-2">
            {/* Blood Group */}
            <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              <Droplet className="h-3 w-3 text-red-500" />
              <span className="text-foreground font-medium">{patient.bloodgroup}</span>
            </div>

            {/* Doctor */}
            <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">
              <Stethoscope className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-foreground truncate">
                {patient.assignedDoctorName?.split(" ")[1] || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
