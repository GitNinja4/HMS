import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";

interface PrescriptionFormProps {
  prescription?: Prescription;
  patientId: number;
  appointmentId?: number;
  onSuccess?: (prescription: Prescription) => void;
  isLoading?: boolean;
}

export function PrescriptionForm({
  prescription,
  patientId,
  appointmentId,
  onSuccess,
  isLoading = false,
}: PrescriptionFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    medication_name: prescription?.medication_name || "",
    dosage: prescription?.dosage || "",
    frequency: prescription?.frequency || "",
    duration: prescription?.duration || "",
    route: prescription?.route || "oral",
    quantity: prescription?.quantity?.toString() || "",
    instructions: prescription?.instructions || "",
    warnings: prescription?.warnings || "",
    refills_allowed: prescription?.refills_allowed?.toString() || "0",
    expiry_date: prescription?.expiry_date?.split("T")[0] || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = prescription ? "PUT" : "POST";
      const endpoint = prescription
        ? `/api/prescriptions/${prescription.id}`
        : "/api/prescriptions";

      const payload = {
        patient_id: patientId,
        appointment_id: appointmentId,
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        route: formData.route,
        quantity: parseInt(formData.quantity),
        instructions: formData.instructions || null,
        warnings: formData.warnings || null,
        refills_allowed: parseInt(formData.refills_allowed),
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save prescription");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: `Prescription ${prescription ? "updated" : "created"} successfully`,
      });

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="medication_name">Medication Name *</Label>
          <Input
            id="medication_name"
            name="medication_name"
            value={formData.medication_name}
            onChange={handleChange}
            placeholder="e.g., Aspirin"
            required
          />
        </div>

        <div>
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            placeholder="e.g., 500mg"
            required
          />
        </div>

        <div>
          <Label htmlFor="frequency">Frequency *</Label>
          <Input
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            placeholder="e.g., 2 times daily"
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 7 days"
            required
          />
        </div>

        <div>
          <Label htmlFor="route">Route</Label>
          <Select
            value={formData.route}
            onValueChange={(value) => handleSelectChange("route", value)}
          >
            <SelectTrigger id="route">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="injection">Injection</SelectItem>
              <SelectItem value="topical">Topical</SelectItem>
              <SelectItem value="inhalation">Inhalation</SelectItem>
              <SelectItem value="sublingual">Sublingual</SelectItem>
              <SelectItem value="transdermal">Transdermal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g., 14"
            required
            min="1"
          />
        </div>

        <div>
          <Label htmlFor="refills_allowed">Refills Allowed</Label>
          <Input
            id="refills_allowed"
            name="refills_allowed"
            type="number"
            value={formData.refills_allowed}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="expiry_date">Expiry Date</Label>
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Special Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          placeholder="e.g., Take with food, avoid dairy products"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="warnings">Warnings & Precautions</Label>
        <Textarea
          id="warnings"
          name="warnings"
          value={formData.warnings}
          onChange={handleChange}
          placeholder="e.g., Allergies, side effects, interactions"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={submitting || isLoading}>
        {submitting ? "Saving..." : prescription ? "Update Prescription" : "Create Prescription"}
      </Button>
    </form>
  );
}
