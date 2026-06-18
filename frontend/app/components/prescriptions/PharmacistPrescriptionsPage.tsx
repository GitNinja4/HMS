"use client";

import React, { useState } from "react";
import { PrescriptionCard } from "@/components/prescriptions/PrescriptionCard";
import { PrescriptionDispenseForm } from "@/components/prescriptions/PrescriptionDispenseForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { PrescriptionList } from "./PrescriptionList";

export function PharmacistPrescriptionsPage() {
  const { toast } = useToast();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | undefined>();
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDispenseSuccess = (prescription: Prescription) => {
    setIsDispenseOpen(false);
    setSelectedPrescription(undefined);
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Success",
      description: `Successfully dispensed ${prescription.medication_name}`,
    });
  };

  const handleDispenseClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDispenseOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prescription Dispensing</h1>
        <p className="text-gray-600 mt-2">Manage prescription dispensing and inventory</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Dispensing</TabsTrigger>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions Awaiting Dispensing</CardTitle>
              <CardDescription>
                Prescriptions with status "Active" waiting to be dispensed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <PrescriptionList
                  key={refreshKey}
                  showPending={true}
                  userRole="pharmacist"
                  onPrescriptionSelect={handleDispenseClick}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Prescriptions</CardTitle>
              <CardDescription>
                View all prescriptions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionList
                key={refreshKey}
                userRole="pharmacist"
                onPrescriptionSelect={handleDispenseClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPrescription && (
        <PrescriptionDispenseForm
          prescription={selectedPrescription}
          isOpen={isDispenseOpen}
          onOpenChange={setIsDispenseOpen}
          onSuccess={handleDispenseSuccess}
        />
      )}
    </div>
  );
}
