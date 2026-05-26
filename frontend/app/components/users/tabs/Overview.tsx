import React from "react"
import { User } from "@/app/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import {
  Cake,
  Users,
  Mail,
  Droplet,
  Stethoscope,
  Heart,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react"

interface OverviewTabProps {
  patient: User
}

const InfoRow: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | undefined | null
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-200 dark:border-slate-800 last:border-0">
    <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-medium text-foreground">
        {value || "Not provided"}
      </p>
    </div>
  </div>
)

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/30 dark:to-slate-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.image} alt={patient.name} />
              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {patient.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Patient ID: {patient._id}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since{" "}
                {new Date(patient.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <InfoRow icon={<Cake className="h-4 w-4" />} label="Age" value={patient.age} />
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Gender"
              value={patient.gender}
            />
            <InfoRow
              icon={<Droplet className="h-4 w-4" />}
              label="Blood Type"
              value={patient.bloodgroup}
            />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email} />
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <InfoRow
              icon={<Stethoscope className="h-4 w-4" />}
              label="Department"
              value={patient.department}
            />
            <InfoRow
              icon={<Heart className="h-4 w-4" />}
              label="Medical History"
              value={patient.medicalHistory}
            />
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Assigned Doctor"
              value={patient.assignedDoctorName}
            />
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Assigned Nurse"
              value={patient.assignedNurseName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Created"
              value={new Date(patient.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Last Updated"
              value={new Date(patient.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <div className="flex items-center gap-3 py-3">
              <div className="flex-shrink-0">
                {patient.emailVerified ? (
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Email Verification
                </p>
                <p className="text-sm font-medium text-foreground">
                  {patient.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
