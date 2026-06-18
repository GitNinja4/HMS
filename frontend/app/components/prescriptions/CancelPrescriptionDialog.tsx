import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CancelPrescriptionDialogProps {
  prescription: Prescription;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (prescription: Prescription) => void;
}

export function CancelPrescriptionDialog({
  prescription,
  isOpen,
  onOpenChange,
  onSuccess,
}: CancelPrescriptionDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

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

      const result = await response.json();
      toast({
        title: "Success",
        description: "Prescription cancelled successfully",
      });

      setReason("");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Prescription</DialogTitle>
          <DialogDescription>
            Cancel {prescription.medication_name} ({prescription.dosage})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Keep Prescription
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={submitting || !reason.trim()}
            >
              {submitting ? "Cancelling..." : "Cancel Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
