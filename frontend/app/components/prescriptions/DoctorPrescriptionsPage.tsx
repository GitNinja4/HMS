"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { PrescriptionList } from "@/components/prescriptions/PrescriptionList";
import { CancelPrescriptionDialog } from "@/components/prescriptions/CancelPrescriptionDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DoctorPrescriptionsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState<number | undefined>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | undefined>();
  const [patientId, setPatientId] = useState<number>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      setDoctorId(session.user.id);
    }
  }, [session]);

  const handleCreateSuccess = (prescription: Prescription) => {
    setShowCreateDialog(false);
    setPatientId(undefined);
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Success",
      description: "Prescription created successfully",
    });
  };

  const handleCancelSuccess = () => {
    setShowCancelDialog(false);
    setSelectedPrescription(undefined);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSelectPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowCancelDialog(true);
  };

  if (!doctorId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescription Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage patient prescriptions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <Tabs defaultValue="issued" className="w-full">
        <TabsList>
          <TabsTrigger value="issued">My Prescriptions</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="issued" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issued Prescriptions</CardTitle>
              <CardDescription>
                All prescriptions issued by you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionList
                key={refreshKey}
                doctorId={doctorId}
                userRole="doctor"
                onPrescriptionSelect={handleSelectPrescription}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Prescription</CardTitle>
              <CardDescription>
                Fill in the details to create a new prescription for your patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patientId ? (
                <PrescriptionForm
                  patientId={patientId}
                  onSuccess={handleCreateSuccess}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter patient ID to create a new prescription
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Patient ID"
                      onChange={(e) => setPatientId(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button
                      onClick={() => {
                        if (patientId) {
                          setShowCreateDialog(true);
                        }
                      }}
                      disabled={!patientId}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Enter prescription details for patient {patientId}
            </DialogDescription>
          </DialogHeader>
          {patientId && (
            <PrescriptionForm
              patientId={patientId}
              onSuccess={handleCreateSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedPrescription && (
        <CancelPrescriptionDialog
          prescription={selectedPrescription}
          isOpen={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
