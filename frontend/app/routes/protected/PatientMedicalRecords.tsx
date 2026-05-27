import { useState, useMemo } from "react";
import { FileText, Download, Eye, Filter } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getLabResultsByPatientId } from "@/lib/mockData";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";

export function meta() {
  return [{ title: "My Medical Records" }];
}

export default function PatientMedicalRecords() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get patient-specific lab results (filtered by patient ID)
  const mockLabResults = useMemo(
    () => getLabResultsByPatientId(user?.id || ""),
    [user?.id]
  );

  // Mock X-rays for this patient
  const mockXRays = [
    {
      id: "xray-001",
      name: "Chest X-Ray",
      date: "2024-05-18",
      status: "reviewed",
      findings: "No abnormalities detected",
    },
    {
      id: "xray-002",
      name: "Spinal X-Ray",
      date: "2024-04-30",
      status: "reviewed",
      findings: "Mild degenerative changes at L4-L5 level",
    },
  ];

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading records..." />
      </div>
    );
  }

  const getStatusBadge = (
    status: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<
      string,
      "default" | "destructive" | "outline" | "secondary"
    > = {
      completed: "default",
      reviewed: "default",
      pending: "secondary",
      processing: "outline",
      error: "destructive",
    };
    return variants[status] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="My Medical Records"
        description="View your laboratory results, X-rays, and medical documents"
        icon={FileText}
      />

      <Tabs defaultValue="labs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="xrays">X-Rays & Imaging</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Lab Results */}
        <TabsContent value="labs" className="space-y-4">
          {mockLabResults.length === 0 ? (
            <EmptyState
              title="No Lab Results"
              description="Your lab results will appear here"
              icon={FileText}
            />
          ) : (
            <div className="grid gap-4">
              {mockLabResults.map((lab) => (
                <Card key={lab.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{lab.testName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(lab.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(lab.status)}>
                        {lab.status}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(lab.results).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="font-semibold text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => {
                          setSelectedRecord(lab);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* X-Rays & Imaging */}
        <TabsContent value="xrays" className="space-y-4">
          {mockXRays.length === 0 ? (
            <EmptyState
              title="No Imaging Records"
              description="Your X-rays and imaging results will appear here"
              icon={FileText}
            />
          ) : (
            <div className="grid gap-4">
              {mockXRays.map((xray) => (
                <Card key={xray.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{xray.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(xray.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(xray.status)}>
                        {xray.status}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                      <p className="text-sm">
                        <span className="font-semibold">Findings: </span>
                        {xray.findings}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Image
                      </Button>
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4">
          <EmptyState
            title="No Documents"
            description="Your medical documents will appear here"
            icon={FileText}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
