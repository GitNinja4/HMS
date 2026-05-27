import { useMemo } from "react";
import { Pill, RefreshCw, Download } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getPrescriptionsByPatientId } from "@/lib/mockData";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";

export function meta() {
  return [{ title: "My Prescriptions" }];
}

export default function PatientPrescriptions() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Get patient-specific prescriptions (filtered by patient ID)
  const mockPrescriptions = useMemo(
    () => getPrescriptionsByPatientId(user?.id || ""),
    [user?.id]
  );

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading prescriptions..." />
      </div>
    );
  }

  const activePrescriptions = useMemo(
    () => mockPrescriptions.filter((p) => p.status === "active"),
    [mockPrescriptions]
  );
  const refillingPrescriptions = useMemo(
    () => mockPrescriptions.filter((p) => p.status === "refilling"),
    [mockPrescriptions]
  );
  const completedPrescriptions = useMemo(
    () => mockPrescriptions.filter((p) => p.status === "completed"),
    [mockPrescriptions]
  );

  const getStatusBadge = (
    status: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<
      string,
      "default" | "destructive" | "outline" | "secondary"
    > = {
      active: "default",
      refilling: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return variants[status] || "default";
  };

  const PrescriptionCard = ({ prescription }: { prescription: typeof mockPrescriptions[0] }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{prescription.medicationName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Prescribed by {prescription.prescribingDoctor}
            </p>
          </div>
          <Badge variant={getStatusBadge(prescription.status)}>
            {prescription.status}
          </Badge>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dosage
              </p>
              <p className="font-semibold">{prescription.dosage}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Frequency
              </p>
              <p className="font-semibold">{prescription.frequency}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Instructions
            </p>
            <p className="text-sm">{prescription.instructions}</p>
          </div>

          {prescription.status === "active" || prescription.status === "refilling" ? (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Refills Remaining
              </p>
              <p className="font-semibold text-sm">
                {prescription.refillsRemaining} refills
              </p>
            </div>
          ) : null}
        </div>

        {prescription.endDate && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Ends: {new Date(prescription.endDate).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-2">
          {prescription.status === "active" && prescription.refillsRemaining > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Request Refill
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="My Prescriptions"
        description="View and manage your active medications and prescriptions"
        icon={Pill}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Active
              </p>
              <p className="text-3xl font-bold">{activePrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Refilling
              </p>
              <p className="text-3xl font-bold">{refillingPrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                History
              </p>
              <p className="text-3xl font-bold">{completedPrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="refilling">Refilling</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Prescriptions */}
        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <EmptyState
              title="No Active Prescriptions"
              description="You don't have any active prescriptions"
              icon={Pill}
            />
          ) : (
            <div className="grid gap-4">
              {activePrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Refilling Prescriptions */}
        <TabsContent value="refilling" className="space-y-4">
          {refillingPrescriptions.length === 0 ? (
            <EmptyState
              title="No Refilling Prescriptions"
              description="No prescriptions are currently being refilled"
              icon={Pill}
            />
          ) : (
            <div className="grid gap-4">
              {refillingPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <EmptyState
              title="No Prescription History"
              description="Your completed prescriptions will appear here"
              icon={Pill}
            />
          ) : (
            <div className="grid gap-4">
              {completedPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
