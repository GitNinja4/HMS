import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PrescriptionDispenseFormProps {
  prescription: Prescription;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (prescription: Prescription) => void;
}

export function PrescriptionDispenseForm({
  prescription,
  isOpen,
  onOpenChange,
  onSuccess,
}: PrescriptionDispenseFormProps) {
  const { toast } = useToast();
  const [quantityToDispense, setQuantityToDispense] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const remaining = prescription.quantity - prescription.quantity_dispensed;
  const maxDispense = remaining;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const quantity = parseInt(quantityToDispense);

      if (quantity <= 0 || quantity > maxDispense) {
        throw new Error(`Please enter a valid quantity between 1 and ${maxDispense}`);
      }

      const response = await fetch(
        `/api/prescriptions/${prescription.id}/dispense`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            quantity_dispensed: quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to dispense prescription");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: `Dispensed ${quantity} unit(s) of ${prescription.medication_name}`,
      });

      setQuantityToDispense("");
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
          <DialogTitle>Dispense Prescription</DialogTitle>
          <DialogDescription>
            Dispense {prescription.medication_name} ({prescription.dosage})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Quantity Prescribed: {prescription.quantity}
            </p>
            <p className="text-sm text-gray-600">
              Already Dispensed: {prescription.quantity_dispensed}
            </p>
            <p className="font-medium text-lg">
              Remaining: {maxDispense}
            </p>
          </div>

          <div>
            <Label htmlFor="quantityToDispense">
              Quantity to Dispense *
            </Label>
            <Input
              id="quantityToDispense"
              type="number"
              min="1"
              max={maxDispense}
              value={quantityToDispense}
              onChange={(e) => setQuantityToDispense(e.target.value)}
              placeholder="Enter quantity"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Max: {maxDispense} unit(s)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Dispensing..." : "Dispense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
