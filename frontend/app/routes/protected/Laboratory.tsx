import type { Route } from "../../+types/root";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FlaskConical,
  Search,
  Check,
  Clock,
  Plus,
  Eye,
  Download,
  CheckCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Laboratory Management" }];
}

// Mock data
const mockTestOrders = [
  {
    id: "LAB-001",
    patientName: "Sarah Johnson",
    patientId: "PAT-001",
    testType: "Complete Blood Count",
    specimen: "Whole Blood",
    orderedBy: "Dr. Smith",
    status: "pending",
    priority: "normal",
    createdAt: "2026-05-28",
  },
  {
    id: "LAB-002",
    patientName: "John Doe",
    patientId: "PAT-002",
    testType: "Liver Function Test",
    specimen: "Serum",
    orderedBy: "Dr. Wilson",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-05-28",
  },
  {
    id: "LAB-003",
    patientName: "Mary Brown",
    patientId: "PAT-003",
    testType: "Thyroid Panel",
    specimen: "Serum",
    orderedBy: "Dr. Smith",
    status: "completed",
    priority: "normal",
    createdAt: "2026-05-27",
  },
  {
    id: "LAB-004",
    patientName: "Robert King",
    patientId: "PAT-004",
    testType: "Lipid Profile",
    specimen: "Serum",
    orderedBy: "Dr. Johnson",
    status: "pending",
    priority: "normal",
    createdAt: "2026-05-28",
  },
];

const mockResults = [
  {
    id: "RESULT-001",
    orderId: "LAB-003",
    patientName: "Mary Brown",
    testType: "Thyroid Panel",
    status: "reviewed",
    completedAt: "2026-05-27",
    reviewedBy: "Dr. Smith",
    reportUrl: "#",
  },
  {
    id: "RESULT-002",
    orderId: "LAB-002",
    patientName: "John Doe",
    testType: "Liver Function Test",
    status: "pending_review",
    completedAt: "2026-05-28",
    reviewedBy: null,
    reportUrl: "#",
  },
];

export default function Laboratory() {
  const [searchOrders, setSearchOrders] = useState("");
  const [selectedTest, setSelectedTest] = useState<(typeof mockTestOrders)[0] | null>(null);
  const [resultDialog, setResultDialog] = useState(false);
  const [resultNotes, setResultNotes] = useState("");
  const [resultStatus, setResultStatus] = useState("completed");
  const [orders, setOrders] = useState(mockTestOrders);
  const [results, setResults] = useState(mockResults);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.patientName.toLowerCase().includes(searchOrders.toLowerCase()) ||
        o.id.toLowerCase().includes(searchOrders.toLowerCase())
    );
  }, [searchOrders, orders]);

  const handleEnterResult = (test: (typeof mockTestOrders)[0]) => {
    setSelectedTest(test);
    setResultDialog(true);
  };

  const confirmResult = () => {
    if (selectedTest) {
      // Update order status
      setOrders(
        orders.map((o) =>
          o.id === selectedTest.id
            ? { ...o, status: "completed" }
            : o
        )
      );

      // Add result
      setResults([
        ...results,
        {
          id: `RESULT-${results.length + 1}`,
          orderId: selectedTest.id,
          patientName: selectedTest.patientName,
          testType: selectedTest.testType,
          status: "pending_review",
          completedAt: new Date().toISOString().split("T")[0],
          reviewedBy: null,
          reportUrl: "#",
        },
      ]);

      setResultDialog(false);
      setSelectedTest(null);
      setResultNotes("");
    }
  };

  const pendingTests = orders.filter((o) => o.status === "pending").length;
  const inProgressTests = orders.filter((o) => o.status === "in_progress").length;
  const completedTests = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Order tests and manage lab results
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pendingTests}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{inProgressTests}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedTests}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {results.filter((r) => r.status === "pending_review").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Test Orders</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="review">Pending Review</TabsTrigger>
        </TabsList>

        {/* Test Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Test Orders</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient or test ID..."
                  value={searchOrders}
                  onChange={(e) => setSearchOrders(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Specimen</TableHead>
                      <TableHead>Ordered By</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.patientName}</p>
                            <p className="text-xs text-slate-500">{order.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{order.testType}</TableCell>
                        <TableCell className="text-sm">{order.specimen}</TableCell>
                        <TableCell className="text-sm">{order.orderedBy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.priority === "high"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "pending"
                                ? "outline"
                                : order.status === "in_progress"
                                ? "secondary"
                                : "secondary"
                            }
                          >
                            {order.status === "pending" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {order.status === "in_progress" && (
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {order.status === "completed" && (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            {order.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status !== "completed" && (
                              <Button
                                size="sm"
                                onClick={() => handleEnterResult(order)}
                              >
                                Enter Result
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Completed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Result ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-mono text-sm">{result.id}</TableCell>
                        <TableCell className="font-medium">{result.patientName}</TableCell>
                        <TableCell>{result.testType}</TableCell>
                        <TableCell>{result.completedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              result.status === "reviewed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {result.status === "reviewed" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {result.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Results Pending Doctor Review</CardTitle>
            </CardHeader>
            <CardContent>
              {results.filter((r) => r.status === "pending_review").length === 0 ? (
                <p className="text-slate-500">No results pending review.</p>
              ) : (
                <div className="space-y-3">
                  {results
                    .filter((r) => r.status === "pending_review")
                    .map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{result.patientName}</p>
                          <p className="text-sm text-slate-500">{result.testType}</p>
                          <p className="text-xs text-slate-400">
                            Completed: {result.completedAt}
                          </p>
                        </div>
                        <Button size="sm">
                          Send to Doctor
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Entry Dialog */}
      <Dialog open={resultDialog} onOpenChange={setResultDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter Test Result</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div>
                  <p className="text-slate-500">Patient</p>
                  <p className="font-medium">{selectedTest.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Order ID</p>
                  <p className="font-mono text-sm">{selectedTest.id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Test Type</p>
                  <p className="font-medium">{selectedTest.testType}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Test Status</label>
                <select
                  value={resultStatus}
                  onChange={(e) => setResultStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="completed">Completed</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Result Notes / Findings</label>
                <Textarea
                  placeholder="Enter test findings, values, and observations..."
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  className="mt-1 min-h-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setResultDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirmResult}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Result
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
