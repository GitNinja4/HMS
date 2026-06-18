"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PrescriptionList } from "@/components/prescriptions/PrescriptionList";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Prescription } from "@/types";

interface PatientPrescriptionsPageProps {
  patientId?: number;
}

export function PatientPrescriptionsPage({ patientId: initialPatientId }: PatientPrescriptionsPageProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [patientId, setPatientId] = useState<number | undefined>(initialPatientId);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!patientId && session?.user?.id) {
      setPatientId(session.user.id);
    }
  }, [session, patientId]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Refreshed",
      description: "Prescription list updated",
    });
  };

  if (!patientId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Prescriptions</h1>
        <p className="text-gray-600 mt-2">View and manage your prescriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & History</CardTitle>
          <CardDescription>
            View all your prescriptions including active, completed, and cancelled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionList
            key={refreshKey}
            patientId={patientId}
            userRole="patient"
          />
        </CardContent>
      </Card>
    </div>
  );
}
