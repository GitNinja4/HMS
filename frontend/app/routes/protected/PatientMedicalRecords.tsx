import { useQuery } from "@tanstack/react-query";
import { FileText, AlertCircle, Download, Eye } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function meta() {
  return [{ title: "My Medical Records" }];
}

export default function PatientMedicalRecords() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;

  // Fetch lab results
  const { data: labResultsData, isLoading: labResultsLoading } = useQuery({
    queryKey: ["lab-results", user?.id],
    queryFn: () => api.getPatientLabResults(user?.id || ""),
    enabled: !!user?.id,
  });

  if (isAuthLoading || labResultsLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading records..." />
      </div>
    );
  }

  const labResults = (labResultsData as any[]) || [];

  // Categorize results
  const labTests = labResults.filter((r) => r.test_type === "lab_test");
  const xrays = labResults.filter((r) => r.test_type === "xray");
  const scans = labResults.filter((r) => r.test_type === "scan" || r.test_type === "ct_scan" || r.test_type === "mri");

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="My Medical Records"
        description="View your laboratory results, X-rays, and medical documents"
        icon={FileText}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Lab Results
              </p>
              <p className="text-3xl font-bold text-blue-600">{labTests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                X-Rays
              </p>
              <p className="text-3xl font-bold text-purple-600">{xrays.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Scans
              </p>
              <p className="text-3xl font-bold text-pink-600">{scans.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Total
              </p>
              <p className="text-3xl font-bold">{labResults.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="labs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="labs">Lab Results ({labTests.length})</TabsTrigger>
          <TabsTrigger value="xrays">X-Rays ({xrays.length})</TabsTrigger>
          <TabsTrigger value="scans">Scans ({scans.length})</TabsTrigger>
        </TabsList>

        {/* Lab Results */}
        <TabsContent value="labs" className="space-y-4">
          {labTests.length === 0 ? (
            <EmptyState
              title="No Lab Results"
              description="Your laboratory test results will appear here"
              icon={FileText}
            />
          ) : (
            labTests.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{result.test_type === 'lab_test' ? result.body_part || 'Lab Test' : 'Test'}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {result.status || 'completed'}
                    </Badge>
                  </div>

                  {result.ai_analysis && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Analysis:</strong> {result.ai_analysis}
                      </p>
                    </div>
                  )}

                  {result.doctor_notes && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Doctor's Notes:</strong> {result.doctor_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {result.image_url && (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                          <Eye className="h-4 w-4" />
                          View Image
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* X-Rays */}
        <TabsContent value="xrays" className="space-y-4">
          {xrays.length === 0 ? (
            <EmptyState
              title="No X-Rays"
              description="Your X-ray images will appear here"
              icon={FileText}
            />
          ) : (
            xrays.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{result.body_part} X-Ray</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {result.status || 'completed'}
                    </Badge>
                  </div>

                  {result.ai_analysis && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>AI Analysis:</strong> {result.ai_analysis}
                      </p>
                    </div>
                  )}

                  {result.doctor_notes && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Doctor's Notes:</strong> {result.doctor_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {result.image_url && (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                          <Eye className="h-4 w-4" />
                          View X-Ray
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Scans */}
        <TabsContent value="scans" className="space-y-4">
          {scans.length === 0 ? (
            <EmptyState
              title="No Scans"
              description="Your CT/MRI scans will appear here"
              icon={FileText}
            />
          ) : (
            scans.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{result.test_type.toUpperCase()} - {result.body_part}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {result.status || 'completed'}
                    </Badge>
                  </div>

                  {result.ai_analysis && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>AI Analysis:</strong> {result.ai_analysis}
                      </p>
                    </div>
                  )}

                  {result.doctor_notes && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Doctor's Notes:</strong> {result.doctor_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {result.image_url && (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                          <Eye className="h-4 w-4" />
                          View Image
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
