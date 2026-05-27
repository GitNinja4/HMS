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
  Pill,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Download,
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
  return [{ title: "Prescription Management" }];
}

// Mock data
const mockPrescriptions = [
  {
    id: "RX-001",
    patientId: "PAT-001",
    patientName: "Sarah Johnson",
    medications: [
      {
        id: "MED-001",
        name: "Amoxicillin",
        dosage: "500mg",
        quantity: 20,
        frequency: "3 times daily",
        duration: "7 days",
        instructions: "Take with water after meals",
      },
      {
        id: "MED-002",
        name: "Ibuprofen",
        dosage: "400mg",
        quantity: 10,
        frequency: "As needed for pain",
        duration: "7 days",
        instructions: "Do not exceed 3200mg per day",
      },
    ],
    prescribedBy: "Dr. Smith",
    prescribedDate: "2026-05-28",
    expiryDate: "2026-08-28",
    status: "active",
    refillsRemaining: 2,
  },
  {
    id: "RX-002",
    patientId: "PAT-002",
    patientName: "John Doe",
    medications: [
      {
        id: "MED-003",
        name: "Lisinopril",
        dosage: "10mg",
        quantity: 30,
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the morning",
      },
    ],
    prescribedBy: "Dr. Wilson",
    prescribedDate: "2026-05-27",
    expiryDate: "2027-05-27",
    status: "active",
    refillsRemaining: 5,
  },
  {
    id: "RX-003",
    patientId: "PAT-003",
    patientName: "Mary Brown",
    medications: [
      {
        id: "MED-004",
        name: "Metformin",
        dosage: "750mg",
        quantity: 60,
        frequency: "Twice daily",
        duration: "30 days",
        instructions: "Take with meals",
      },
    ],
    prescribedBy: "Dr. Smith",
    prescribedDate: "2026-03-28",
    expiryDate: "2026-06-28",
    status: "expired",
    refillsRemaining: 0,
  },
];

export default function Prescriptions() {
  const [searchPrescriptions, setSearchPrescriptions] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedPrescription, setSelectedPrescription] = useState<(typeof mockPrescriptions)[0] | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    quantity: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const matchesSearch =
        p.patientName.toLowerCase().includes(searchPrescriptions.toLowerCase()) ||
        p.id.toLowerCase().includes(searchPrescriptions.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchPrescriptions, statusFilter, prescriptions]);

  const handleAddMedication = () => {
    if (selectedPrescription && newMedication.name) {
      const updatedPrescriptions = prescriptions.map((p) => {
        if (p.id === selectedPrescription.id) {
          return {
            ...p,
            medications: [
              ...p.medications,
              {
                id: `MED-${Date.now()}`,
                ...newMedication,
              },
            ],
          };
        }
        return p;
      });
      setPrescriptions(updatedPrescriptions);
      setNewMedication({
        name: "",
        dosage: "",
        quantity: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
    }
  };

  const activePrescriptions = prescriptions.filter(
    (p) => p.status === "active"
  ).length;
  const expiredPrescriptions = prescriptions.filter(
    (p) => p.status === "expired"
  ).length;
  const totalMedications = prescriptions.reduce(
    (sum, p) => sum + p.medications.length,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Create, manage, and track patient prescriptions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{prescriptions.length}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activePrescriptions}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{expiredPrescriptions}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMedications}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        {/* Active Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Prescriptions</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name or RX ID..."
                  value={searchPrescriptions}
                  onChange={(e) => setSearchPrescriptions(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RX ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medications</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Refills</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions
                      .filter((p) => p.status === "active")
                      .map((rx) => (
                        <TableRow key={rx.id}>
                          <TableCell className="font-mono text-sm">{rx.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rx.patientName}</p>
                              <p className="text-xs text-slate-500">{rx.patientId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {rx.medications.map((m) => (
                                <div key={m.id} className="text-slate-600">
                                  {m.name} {m.dosage}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{rx.prescribedBy}</TableCell>
                          <TableCell className="text-sm">{rx.prescribedDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rx.refillsRemaining}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrescription(rx);
                                  setViewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrescription(rx);
                                  setEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
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

        {/* All Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Prescriptions</CardTitle>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name or RX ID..."
                  value={searchPrescriptions}
                  onChange={(e) => setSearchPrescriptions(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RX ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-mono text-sm">{rx.id}</TableCell>
                        <TableCell className="font-medium">{rx.patientName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              rx.status === "active"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {rx.status === "active" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {rx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{rx.expiryDate}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPrescription(rx);
                              setViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expired Tab */}
        <TabsContent value="expired" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Expired Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.filter((p) => p.status === "expired").length === 0 ? (
                <p className="text-slate-500">No expired prescriptions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RX ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Expired Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions
                        .filter((p) => p.status === "expired")
                        .map((rx) => (
                          <TableRow key={rx.id}>
                            <TableCell className="font-mono text-sm">{rx.id}</TableCell>
                            <TableCell className="font-medium">{rx.patientName}</TableCell>
                            <TableCell className="text-sm text-red-600">{rx.expiryDate}</TableCell>
                            <TableCell>
                              <Button size="sm">Renew</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">RX ID</p>
                  <p className="font-mono font-medium">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Patient</p>
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Prescribed By</p>
                  <p className="font-medium">{selectedPrescription.prescribedBy}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-medium">{selectedPrescription.prescribedDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Expires</p>
                  <p className="font-medium">{selectedPrescription.expiryDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge variant={selectedPrescription.status === "active" ? "secondary" : "destructive"}>
                    {selectedPrescription.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Medications</h3>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med) => (
                    <div key={med.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{med.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-2">
                        <p>Dosage: {med.dosage}</p>
                        <p>Quantity: {med.quantity}</p>
                        <p>Frequency: {med.frequency}</p>
                        <p>Duration: {med.duration}</p>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Instructions: {med.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setViewDialog(false)}>
                  Close
                </Button>
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Add New Medication</label>
                <div className="space-y-3 mt-2">
                  <Input
                    placeholder="Medication name"
                    value={newMedication.name}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Dosage (e.g., 500mg)"
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, dosage: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={newMedication.quantity}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, quantity: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Frequency (e.g., 3 times daily)"
                    value={newMedication.frequency}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, frequency: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Duration (e.g., 7 days)"
                    value={newMedication.duration}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, duration: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Instructions"
                    value={newMedication.instructions}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, instructions: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddMedication}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
