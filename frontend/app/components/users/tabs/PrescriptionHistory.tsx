import React from "react"
import { MockPrescription } from "@/app/lib/mockData"
import { StatusBadge } from "@/app/components/ui/status-badge"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Pill, RefreshCw, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrescriptionsTabProps {
  prescriptions: MockPrescription[]
}

const getPrescriptionStatusVariant = (
  status: MockPrescription["status"]
): any => {
  switch (status) {
    case "active":
      return "active"
    case "completed":
      return "completed"
    case "refilling":
      return "refilling"
    case "cancelled":
      return "cancelled"
    default:
      return "pending"
  }
}

export const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({
  prescriptions,
}) => {
  // Group prescriptions by status
  const activeRx = prescriptions.filter((rx) => rx.status === "active")
  const completedRx = prescriptions.filter((rx) => rx.status === "completed")
  const refillingRx = prescriptions.filter((rx) => rx.status === "refilling")
  const cancelledRx = prescriptions.filter((rx) => rx.status === "cancelled")

  if (prescriptions.length === 0) {
    return (
      <div className="py-12 text-center">
        <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">No prescriptions found</p>
      </div>
    )
  }

  const RxCard: React.FC<{ rx: MockPrescription; status: string }> = ({
    rx,
    status,
  }) => (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{rx.medicationName}</h4>
            <p className="text-sm text-muted-foreground">
              {rx.dosage} • {rx.frequency}
            </p>
          </div>
          <StatusBadge
            variant={getPrescriptionStatusVariant(rx.status)}
            size="sm"
            showIcon
          >
            {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
          </StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-medium">{rx.duration}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-sm font-medium">
              {new Date(rx.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {rx.instructions && (
          <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900/30 rounded text-xs text-muted-foreground">
            <p className="font-medium mb-1">Instructions:</p>
            <p>{rx.instructions}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Prescribed by {rx.prescribingDoctor}</span>
          <div className="flex gap-2">
            {rx.status === "active" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Request Refill"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Download Details"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {activeRx.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active ({activeRx.length})
          </h3>
          <div className="space-y-2">
            {activeRx.map((rx) => (
              <RxCard key={rx.id} rx={rx} status="active" />
            ))}
          </div>
        </div>
      )}

      {refillingRx.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Refilling ({refillingRx.length})
          </h3>
          <div className="space-y-2">
            {refillingRx.map((rx) => (
              <RxCard key={rx.id} rx={rx} status="refilling" />
            ))}
          </div>
        </div>
      )}

      {completedRx.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Completed ({completedRx.length})
          </h3>
          <div className="space-y-2">
            {completedRx.map((rx) => (
              <RxCard key={rx.id} rx={rx} status="completed" />
            ))}
          </div>
        </div>
      )}

      {cancelledRx.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Cancelled ({cancelledRx.length})
          </h3>
          <div className="space-y-2">
            {cancelledRx.map((rx) => (
              <RxCard key={rx.id} rx={rx} status="cancelled" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
