import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { StatusBadge } from "@/app/components/ui/status-badge"
import { User } from "@/app/types"
import { OverviewTab } from "@/app/components/users/tabs/Overview"
import { MedicalHistoryTab } from "@/app/components/users/tabs/MedicalHistory"
import { PrescriptionsTab } from "@/app/components/users/tabs/PrescriptionHistory"
import { LabReportsTab } from "@/app/components/users/tabs/LabReports"
import {
  getMedicalHistoryByPatientId,
  getPrescriptionsByPatientId,
  getLabResultsByPatientId,
} from "@/app/lib/mockData"
import { X } from "lucide-react"

interface DetailsSheetProps {
  patient: User | null
  isOpen: boolean
  onClose: () => void
}

export const DetailsSheet: React.FC<DetailsSheetProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  if (!patient) return null

  const getInitials = (name: string) => {
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
  }

  const medicalHistory = getMedicalHistoryByPatientId(patient._id)
  const prescriptions = getPrescriptionsByPatientId(patient._id)
  const labResults = getLabResultsByPatientId(patient._id)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="inset-y-4! right-4! h-auto! sm:max-w-2xl rounded-xl border shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col"
        side="right"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 p-6 bg-slate-50 dark:bg-slate-900 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-800 shadow-sm flex-shrink-0">
                <AvatarImage src={patient.image} alt={patient.name} />
                <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-foreground">
                  {patient.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {patient._id}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge
                    variant={statusVariantMap[patient.status] || "pending"}
                    size="sm"
                    showIcon
                  >
                    {patient.status?.replace(/_/g, " ").charAt(0).toUpperCase() +
                      patient.status?.replace(/_/g, " ").slice(1)}
                  </StatusBadge>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="prescriptions">
                  Rx ({prescriptions.length})
                </TabsTrigger>
                <TabsTrigger value="labs">Labs ({labResults.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <OverviewTab patient={patient} />
              </TabsContent>

              <TabsContent value="medical" className="mt-0">
                <MedicalHistoryTab events={medicalHistory} />
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-0">
                <PrescriptionsTab prescriptions={prescriptions} />
              </TabsContent>

              <TabsContent value="labs" className="mt-0">
                <LabReportsTab labResults={labResults} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
