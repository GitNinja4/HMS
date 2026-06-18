import { useQuery } from "@tanstack/react-query";
import { Pill, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";
import { Badge } from "@/components/ui/badge";

export function meta() {
  return [{ title: "My Prescriptions" }];
}

export default function PatientPrescriptions() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;

  // Fetch patient prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: () =>
      api.getPatientPrescriptions({
        patientId: user?.id || "",
        limit: 100,
      }),
    enabled: !!user?.id,
  });

  if (isAuthLoading || prescriptionsLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading prescriptions..." />
      </div>
    );
  }

  const prescriptions = prescriptionsData?.data || [];

  // Filter prescriptions by status
  const activePrescriptions = prescriptions.filter((p) => p.status === "active" || p.status === "dispensed");
  const refillingPrescriptions = prescriptions.filter((p) => p.status === "refill_requested" || p.status === "refilling");
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed" || p.status === "expired");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <SectionHeader
          title="My Prescriptions"
          description="View and manage your medication prescriptions"
          icon={Pill}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Active
              </p>
              <p className="text-3xl font-bold text-green-600">{activePrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Refilling
              </p>
              <p className="text-3xl font-bold text-yellow-600">{refillingPrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Completed
              </p>
              <p className="text-3xl font-bold text-blue-600">{completedPrescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Total
              </p>
              <p className="text-3xl font-bold">{prescriptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="refilling">Refilling ({refillingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedPrescriptions.length})</TabsTrigger>
        </TabsList>

        {/* Active Prescriptions */}
        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <EmptyState
              title="No Active Prescriptions"
              description="You don't have any active prescriptions at the moment"
              icon={Pill}
            />
          ) : (
            activePrescriptions.map((rx) => (
              <Card key={rx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{rx.medication_name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {rx.dosage} • {rx.frequency}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {rx.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Duration:</strong> {rx.duration}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Quantity:</strong> {rx.quantity} {rx.route || 'tablets'}
                    </p>
                    {rx.instructions && (
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Instructions:</strong> {rx.instructions}
                      </p>
                    )}
                    {rx.warnings && (
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        ⚠️ {rx.warnings}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Request Refill
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Refilling Prescriptions */}
        <TabsContent value="refilling" className="space-y-4">
          {refillingPrescriptions.length === 0 ? (
            <EmptyState
              title="No Refilling Prescriptions"
              description="You don't have any prescriptions pending refill"
              icon={TrendingUp}
            />
          ) : (
            refillingPrescriptions.map((rx) => (
              <Card key={rx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{rx.medication_name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {rx.dosage} • {rx.frequency}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {rx.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Quantity:</strong> {rx.quantity} {rx.route || 'tablets'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      Your refill request is being processed. Pharmacy will contact you soon.
                    </p>
                  </div>

                  <Button size="sm" variant="outline">
                    Track Status
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Prescriptions */}
        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <EmptyState
              title="No Completed Prescriptions"
              description="Your completed prescriptions will appear here"
              icon={Pill}
            />
          ) : (
            completedPrescriptions.map((rx) => (
              <Card key={rx.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{rx.medication_name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {rx.dosage}
                      </p>
                    </div>
                    <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      {rx.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Completed on {new Date(rx.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
