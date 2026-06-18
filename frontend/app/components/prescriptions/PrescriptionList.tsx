import React, { useState, useEffect } from "react";
import { PrescriptionCard } from "./PrescriptionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Prescription, PrescriptionStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface PrescriptionListProps {
  patientId?: number;
  doctorId?: number;
  showPending?: boolean;
  userRole?: string;
  onPrescriptionSelect?: (prescription: Prescription) => void;
}

export function PrescriptionList({
  patientId,
  doctorId,
  showPending = false,
  userRole,
  onPrescriptionSelect,
}: PrescriptionListProps) {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "all">("all");
  const [medicationSearch, setMedicationSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId, doctorId, statusFilter, medicationSearch, skip]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      let endpoint = "/api/prescriptions";

      if (showPending) {
        endpoint = "/api/prescriptions/pharmacist/pending";
      } else if (patientId) {
        endpoint = `/api/prescriptions/patient/${patientId}/history`;
      } else if (doctorId) {
        endpoint = `/api/prescriptions/doctor/${doctorId}/issued`;
      }

      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());

      if (statusFilter !== "all") {
        params.append("status_filter", statusFilter);
      }

      if (medicationSearch) {
        params.append("medication_name", medicationSearch);
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }

      const data = await response.json();
      setPrescriptions(data.prescriptions);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (prescription: Prescription) => {
    const reason = window.prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      const response = await fetch(
        `/api/prescriptions/${prescription.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            cancellation_reason: reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel prescription");
      }

      toast({
        title: "Success",
        description: "Prescription cancelled successfully",
      });

      fetchPrescriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel prescription",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newSkip: number) => {
    setSkip(Math.max(0, newSkip));
  };

  if (loading && prescriptions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by medication name..."
          value={medicationSearch}
          onChange={(e) => {
            setMedicationSearch(e.target.value);
            setSkip(0);
          }}
          className="flex-1"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as PrescriptionStatus | "all");
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="dispensed">Dispensed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No prescriptions found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                userRole={userRole}
                onCancel={() => handleCancel(prescription)}
                onEdit={() => onPrescriptionSelect?.(prescription)}
                showActions={true}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600">
              Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={skip === 0}
                onClick={() => handlePageChange(skip - limit)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={skip + limit >= total}
                onClick={() => handlePageChange(skip + limit)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
