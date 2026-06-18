import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prescription, PrescriptionStatus } from "@/types";
import { format } from "date-fns";

interface PrescriptionCardProps {
  prescription: Prescription;
  onEdit?: () => void;
  onCancel?: () => void;
  onDispense?: () => void;
  showActions?: boolean;
  userRole?: string;
}

const statusColors: Record<PrescriptionStatus, string> = {
  active: "bg-blue-100 text-blue-800",
  dispensed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-yellow-100 text-yellow-800",
};

export function PrescriptionCard({
  prescription,
  onEdit,
  onCancel,
  onDispense,
  showActions = true,
  userRole,
}: PrescriptionCardProps) {
  const issuedDate = new Date(prescription.issued_date);
  const canEdit = prescription.status === "active" && (userRole === "doctor" || userRole === "admin");
  const canCancel = prescription.status === "active" && (userRole === "doctor" || userRole === "admin");
  const canDispense =
    prescription.status === "active" && (userRole === "pharmacist" || userRole === "admin");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
            <CardDescription>
              Issued on {format(issuedDate, "MMM dd, yyyy")}
            </CardDescription>
          </div>
          <Badge className={statusColors[prescription.status]}>
            {prescription.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Dosage</p>
            <p className="font-medium">{prescription.dosage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frequency</p>
            <p className="font-medium">{prescription.frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{prescription.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Route</p>
            <p className="font-medium capitalize">{prescription.route}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p className="font-medium">{prescription.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dispensed</p>
            <p className="font-medium">{prescription.quantity_dispensed}</p>
          </div>
        </div>

        {prescription.instructions && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-700">Special Instructions</p>
            <p className="text-sm text-gray-600">{prescription.instructions}</p>
          </div>
        )}

        {prescription.warnings && (
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-700">Warnings & Precautions</p>
            <p className="text-sm text-gray-600">{prescription.warnings}</p>
          </div>
        )}

        {prescription.dispensed_date && (
          <div className="text-sm text-gray-600">
            Dispensed on {format(new Date(prescription.dispensed_date), "MMM dd, yyyy")}
          </div>
        )}

        {prescription.cancelled_date && prescription.cancellation_reason && (
          <div className="bg-red-50 p-3 rounded">
            <p className="text-sm font-medium text-red-700">Cancellation Reason</p>
            <p className="text-sm text-red-600">{prescription.cancellation_reason}</p>
          </div>
        )}

        {prescription.expiry_date && (
          <div className="text-sm text-gray-600">
            Expires on {format(new Date(prescription.expiry_date), "MMM dd, yyyy")}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {canEdit && onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canCancel && onCancel && (
              <Button size="sm" variant="destructive" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {canDispense && onDispense && (
              <Button size="sm" variant="default" onClick={onDispense}>
                Dispense
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
